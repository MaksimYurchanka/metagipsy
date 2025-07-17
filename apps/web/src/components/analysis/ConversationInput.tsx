import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Brain, CheckCircle, Crown, TrendingUp, Zap , Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { ConversationInputProps, Platform } from '@/types';
import { api } from '@/lib/api';

interface UsageStats {
  today: {
    characters: number;
    analyses: number;
    charactersLimit: number;
    analysesLimit: number;
  };
  tier: {
    type: 'free' | 'pro' | 'enterprise';
    dailyCharacterLimit: number;
    features: string[];
  };
  percentUsed: number;
  resetTime: Date;
}

interface EditRetryDetection {
  isEditRetry: boolean;
  finalMessagePairs: number;
  editCount: number;
  retryCount: number;
  confidence: number;
  detectionMethod: string;
  conversationFlow: string;
  // ✅ NEW: Store actual parsed messages for VerifyPage
  parsedMessages?: Array<{
    role: 'user' | 'assistant';
    content: string;
    index: number;
  }>;
}

const ConversationInput: React.FC<ConversationInputProps> = ({
  onAnalyze,
  isAnalyzing = false
}) => {
  const navigate = useNavigate();
  
  // ✅ STATE with localStorage integration
  const [conversationText, setConversationText] = useState('');
  const [platform, setPlatform] = useState<Platform>('auto');
  const [sessionGoal, setSessionGoal] = useState('');
  const [enableAIAnalysis, setEnableAIAnalysis] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  
  // ✅ ENHANCED: Correct Edit-Retry detection state
  const [detectedPlatform, setDetectedPlatform] = useState<Platform | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [hasRetryEditFormat, setHasRetryEditFormat] = useState(false);
  const [editRetryDetails, setEditRetryDetails] = useState<EditRetryDetection | null>(null);
  const [isTechnicalContent, setIsTechnicalContent] = useState(false);
  
  // ✅ Usage tracking and limits
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [parsingStrategy, setParsingStrategy] = useState<'auto' | 'local' | 'ai'>('auto');

  // ✅ LOCALSTORAGE: Load saved data on mount
  useEffect(() => {
    const savedText = localStorage.getItem('metagipsy_conversation_text');
    const savedGoal = localStorage.getItem('metagipsy_session_goal');
    const savedPlatform = localStorage.getItem('metagipsy_platform');
    
    if (savedText) {
      setConversationText(savedText);
      analyzeText(savedText);
      toast.success('📄 Restored from auto-save!', { duration: 2000 });
    }
    if (savedGoal) setSessionGoal(savedGoal);
    if (savedPlatform && ['auto', 'claude', 'chatgpt', 'other'].includes(savedPlatform)) {
      setPlatform(savedPlatform as Platform);
    }
  }, []);

  // ✅ CORRECT: Edit-Retry detection with ACTUAL MESSAGE PARSING
  const detectEditRetryFormat = useCallback((text: string): EditRetryDetection => {
    if (!text.trim()) {
      return { 
        isEditRetry: false, 
        finalMessagePairs: 0, 
        editCount: 0, 
        retryCount: 0, 
        confidence: 0, 
        detectionMethod: 'empty',
        conversationFlow: '',
        parsedMessages: []
      };
    }

    try {
      // ✅ DETECTION: Find Edit and Retry markers
      const editMatches = text.match(/^Edit\s*$/gm) || [];
      const retryMatches = text.match(/^Retry\s*$/gm) || [];
      
      const editCount = editMatches.length;
      const retryCount = retryMatches.length;
      
      console.log('🔍 EDIT-RETRY RAW DETECTION:', {
        editCount,
        retryCount,
        totalMarkers: editCount + retryCount
      });

      // ✅ VALIDATION: Check if this is really Edit-Retry format
      let isEditRetry = false;
      let detectionMethod = '';
      let confidence = 0;
      
      if (editCount > 0 || retryCount > 0) {
        if (editCount > 0 && retryCount > 0) {
          isEditRetry = true;
          detectionMethod = 'both_markers';
          confidence = 0.95;
        } else if (editCount >= 2 || retryCount >= 2) {
          isEditRetry = true;
          detectionMethod = editCount >= 2 ? 'multiple_edits' : 'multiple_retries';
          confidence = 0.85;
        } else if (editCount === 1 || retryCount === 1) {
          isEditRetry = true;
          detectionMethod = editCount === 1 ? 'single_edit' : 'single_retry';
          confidence = 0.7;
        }
      }

      // ✅ CORRECT: Parse actual messages using proper Edit-Retry logic
      let finalMessagePairs = 0;
      let conversationFlow = '';
      let parsedMessages: Array<{role: 'user' | 'assistant'; content: string; index: number}> = [];
      
      if (isEditRetry) {
        console.log('🎯 PARSING EDIT-RETRY MESSAGES...');
        
        // ✅ SPLIT by Edit/Retry markers to get content blocks
        const parts = text.split(/^(Edit|Retry)\s*$/gm).filter(part => part.trim().length > 0);
        
        let currentRole: 'user' | 'assistant' = 'user'; // Usually starts with user
        let messageIndex = 0;
        
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i].trim();
          
          // Skip the marker words themselves
          if (part === 'Edit' || part === 'Retry') {
            continue;
          }
          
          // Skip very short content (likely formatting noise)
          if (part.length < 10) {
            continue;
          }
          
          // This is actual message content
          parsedMessages.push({
            role: currentRole,
            content: part,
            index: messageIndex
          });
          
          console.log(`✅ PARSED MESSAGE ${messageIndex}: ${currentRole} - ${part.substring(0, 50)}...`);
          
          // Alternate role for next message
          currentRole = currentRole === 'user' ? 'assistant' : 'user';
          messageIndex++;
        }
        
        finalMessagePairs = parsedMessages.length;
        
        const userCount = parsedMessages.filter(m => m.role === 'user').length;
        const assistantCount = parsedMessages.filter(m => m.role === 'assistant').length;
        conversationFlow = `${userCount}U/${assistantCount}A`;
        
        console.log('✅ EDIT-RETRY PARSING COMPLETE:', {
          totalMessages: finalMessagePairs,
          userMessages: userCount,
          assistantMessages: assistantCount,
          conversationFlow
        });
      }

      const result: EditRetryDetection = {
        isEditRetry,
        finalMessagePairs,
        editCount,
        retryCount,
        confidence,
        detectionMethod,
        conversationFlow,
        parsedMessages // ✅ CRITICAL: Include parsed messages for VerifyPage
      };

      console.log('🎯 EDIT-RETRY FINAL RESULT:', result);
      return result;

    } catch (error) {
      console.error('Edit-Retry detection error:', error);
      return { 
        isEditRetry: false, 
        finalMessagePairs: 0, 
        editCount: 0, 
        retryCount: 0, 
        confidence: 0, 
        detectionMethod: 'error',
        conversationFlow: '',
        parsedMessages: []
      };
    }
  }, []);

  // ✅ ENHANCED: Smart text analysis with correct Edit-Retry logic
  const analyzeText = useCallback((text: string) => {
    if (!text.trim()) {
      setDetectedPlatform(null);
      setMessageCount(0);
      setHasRetryEditFormat(false);
      setEditRetryDetails(null);
      setParsingStrategy('auto');
      setIsTechnicalContent(false);
      return;
    }
    
    // ✅ FIRST: Correct Edit-Retry detection
    const editRetryResult = detectEditRetryFormat(text);
    setEditRetryDetails(editRetryResult);
    
    if (editRetryResult.isEditRetry) {
      console.log('🎊 CLAUDE EDIT-RETRY FORMAT DETECTED!', editRetryResult);
      setHasRetryEditFormat(true);
      setDetectedPlatform('claude');
      setMessageCount(editRetryResult.finalMessagePairs);
      setParsingStrategy('local'); // ✅ Always use local for Edit-Retry (fastest)
      setIsTechnicalContent(false);
      
      // ✅ CORRECT: Show proper message count
      toast.success(
        `🎯 Claude Edit-Retry detected! ${editRetryResult.editCount} edits, ${editRetryResult.retryCount} retries → ${editRetryResult.finalMessagePairs} final messages (${editRetryResult.conversationFlow})`,
        { duration: 5000 }
      );
      return;
    }
    
    // ✅ FALLBACK: Technical content detection (unchanged)
    const technicalIndicators = [
      /npm run|yarn|npx|@\w+\/\w+@\d+\.\d+\.\d+/i,
      /error ts\d+|compilation|build failed|prisma/i,
      /environment variables loaded|schema loaded/i,
      /✔|✅|❌|⚠️|🔴|🟡|🟢/g,
      /\d{4}-\d{2}-\d{2}t\d{2}:\d{2}:\d{2}/i,
      /\[info\]|\[error\]|\[warn\]/i
    ];
    
    const hasTechnicalContent = technicalIndicators.some(pattern => pattern.test(text));
    setIsTechnicalContent(hasTechnicalContent);
    
    if (hasTechnicalContent) {
      setDetectedPlatform('other');
      setParsingStrategy('local');
      setMessageCount(1);
      setHasRetryEditFormat(false);
      return;
    }
    
    // ✅ STANDARD: Platform detection (unchanged)
    const content = text.toLowerCase();
    let detected: Platform = 'other';
    let strategy: 'auto' | 'local' | 'ai' = 'auto';
    
    if (content.includes('human:') && content.includes('assistant:')) {
      detected = 'claude';
      strategy = 'local';
    } else if (content.includes('user:') && content.includes('chatgpt:')) {
      detected = 'chatgpt';
      strategy = 'local';
    } else {
      strategy = 'ai';
    }
    
    const messageMarkers = text.match(/(Human:|Assistant:|User:|ChatGPT:)/gmi);
    const alternatingBlocks = text.split(/\n\s*\n/).filter(block => block.trim().length > 20);
    
    const estimatedMessages = messageMarkers ? 
      messageMarkers.length : 
      Math.min(alternatingBlocks.length, 10);
    
    setDetectedPlatform(detected);
    setMessageCount(estimatedMessages);
    setParsingStrategy(strategy);
    setHasRetryEditFormat(false);
  }, [detectEditRetryFormat]);

  // ✅ AUTO-SAVE: Text changes with localStorage
  const handleTextChange = useCallback((value: string) => {
    setConversationText(value);
    analyzeText(value);
    
    // ✅ IMMEDIATE: Auto-save on every change
    if (value.trim()) {
      localStorage.setItem('metagipsy_conversation_text', value);
      localStorage.setItem('metagipsy_last_saved', new Date().toISOString());
    } else {
      localStorage.removeItem('metagipsy_conversation_text');
      localStorage.removeItem('metagipsy_last_saved');
    }
  }, [analyzeText]);

  // ✅ AUTO-SAVE: Session goal
  const handleGoalChange = useCallback((value: string) => {
    setSessionGoal(value);
    if (value.trim()) {
      localStorage.setItem('metagipsy_session_goal', value);
    } else {
      localStorage.removeItem('metagipsy_session_goal');
    }
  }, []);

  // ✅ AUTO-SAVE: Platform selection  
  const handlePlatformChange = useCallback((value: Platform) => {
    setPlatform(value);
    localStorage.setItem('metagipsy_platform', value);
  }, []);

  // ✅ Load usage stats
  useEffect(() => {
    const loadUsageStats = async () => {
      try {
        setIsLoadingUsage(true);
        const stats = await api.getUserUsageStats();
        setUsageStats(stats);
      } catch (error) {
        console.error('Failed to load usage stats:', error);
        toast.error('Failed to load usage limits');
      } finally {
        setIsLoadingUsage(false);
      }
    };

    loadUsageStats();
  }, []);

  // ✅ SINGLE WORKFLOW: Parse & Verify (FIXED BUTTON TEXT)
  const handleParseAndVerify = useCallback(async () => {
    if (!conversationText.trim()) {
      toast.error('Please paste your conversation first');
      return;
    }

    // ✅ VALIDATION: Different requirements for Edit-Retry vs standard
    if (!hasRetryEditFormat && !isTechnicalContent && messageCount < 2) {
      toast.error('Need at least 2 messages to analyze. For technical logs, consider manual markup with Human:/Assistant: markers.');
      return;
    }

    // ✅ RATE LIMITING: Check limits
    if (usageStats) {
      const wouldExceed = (usageStats.today.characters + conversationText.length) > usageStats.today.charactersLimit;
      if (wouldExceed) {
        const remaining = usageStats.today.charactersLimit - usageStats.today.characters;
        toast.error(
          `Daily limit exceeded! You have ${remaining} characters remaining. ${
            usageStats.tier.type === 'free' ? 'Upgrade to Pro for 500k daily characters.' : 'Limit resets at midnight.'
          }`
        );
        return;
      }
    }

    console.log('🔍 NAVIGATING TO VERIFY PAGE...');
    
    // ✅ SMART PARSING: Edit-Retry gets special treatment
    let parsedMessages = null;
    let parsingMethod = 'local';
    
    if (hasRetryEditFormat) {
      setIsParsing(true);
      toast.success('🎯 Using optimized Edit-Retry parsing for Claude format...');
      parsingMethod = 'edit_retry_optimized';
      
      // ✅ CRITICAL: Use pre-parsed messages from detection
      if (editRetryDetails?.parsedMessages) {
        parsedMessages = editRetryDetails.parsedMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
          index: msg.index,
          timestamp: new Date().toISOString()
        }));
        console.log('✅ USING PRE-PARSED MESSAGES:', parsedMessages.length);
      }
      
      setTimeout(() => setIsParsing(false), 500);
      
    } else if (enableAIAnalysis && parsingStrategy === 'ai' && usageStats?.tier.type !== 'free' && !isTechnicalContent) {
      setIsParsing(true);
      toast.info('🧠 Using AI for smart parsing...');
      
      try {
        const response = await api.analyzeEnhanced(conversationText, {
          expectedPlatform: platform === 'auto' ? detectedPlatform || 'auto' : platform,
          analysisDepth: 'standard',
          forceHaiku: true
        });
        
        if (response?.success && response?.result?.messages?.length >= 2) {
          parsedMessages = response.result.messages;
          parsingMethod = 'ai_enhanced';
          toast.success(`🎊 AI parsing completed! Found ${parsedMessages.length} messages.`);
        } else {
          throw new Error(`AI parsing returned insufficient messages`);
        }
        
      } catch (error) {
        console.log('🔄 AI PARSING FAILED, using reliable local parsing');
        toast.warning('AI parsing unavailable - using reliable local parsing...');
      } finally {
        setIsParsing(false);
      }
    } else {
      if (parsingStrategy === 'local') {
        toast.success('⚡ Using fast local parsing for detected format');
      } else if (isTechnicalContent) {
        toast.info('🔧 Technical content detected - consider manual markup for best results');
      } else if (usageStats?.tier.type === 'free') {
        toast.info('📝 Using local parsing (AI parsing available in Pro)');
      }
    }
    
    // ✅ COMPREHENSIVE: Prepare data for verify page
    const verifyData = {
      conversationText,
      platform: platform === 'auto' ? detectedPlatform || 'other' : platform,
      sessionGoal,
      hasRetryEditFormat,
      messageCount,
      enableAIAnalysis,
      parsedMessages, // ✅ CRITICAL: Include pre-parsed messages
      parsingMethod,
      parsingStrategy,
      isTechnicalContent,
      editRetryDetails, // ✅ CRITICAL: Include full detection details
      timestamp: Date.now(),
      debugInfo: {
        detectedPlatform,
        originalPlatform: platform,
        textLength: conversationText.length,
        retryEditDetected: hasRetryEditFormat,
        smartStrategy: parsingStrategy,
        technicalContent: isTechnicalContent,
        editRetryConfidence: editRetryDetails?.confidence || 0,
        editRetryMethod: editRetryDetails?.detectionMethod || 'none',
        conversationFlow: editRetryDetails?.conversationFlow || '',
        preParsedCount: parsedMessages?.length || 0 // ✅ DEBUG: Track pre-parsed count
      }
    };
    
    // Save to sessionStorage and navigate
    sessionStorage.setItem('metagipsy_verify_data', JSON.stringify(verifyData));
    navigate('/analyze/verify');
  }, [conversationText, platform, detectedPlatform, sessionGoal, hasRetryEditFormat, messageCount, enableAIAnalysis, parsingStrategy, usageStats, isTechnicalContent, editRetryDetails, navigate]);

  const canParseAndAnalyze = conversationText.trim().length > 20;
  
  // ✅ CHARACTER CALCULATIONS
  const currentLength = conversationText.length;
  const isOverFreeLimit = currentLength > 5000 && usageStats?.tier.type === 'free';
  const isOverProLimit = currentLength > 500000;
  const remainingChars = usageStats ? Math.max(0, usageStats.today.charactersLimit - usageStats.today.characters) : 0;
  const wouldExceedDaily = usageStats ? (usageStats.today.characters + currentLength) > usageStats.today.charactersLimit : false;

  return (
    <div className="space-y-6">
      {/* ✅ HEADER */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-slate-100">Analyze Conversation</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Paste your conversation below for intelligent 5D analysis with correct Edit-Retry logic.
        </p>
      </div>

      {/* ✅ USAGE STATS */}
      {!isLoadingUsage && usageStats && (
        <Card className="bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border-indigo-800/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {usageStats.tier.type === 'free' ? (
                  <Badge variant="outline" className="text-blue-400 border-blue-500/50">
                    Free Tier
                  </Badge>
                ) : (
                  <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    {usageStats.tier.type === 'pro' ? 'Pro' : 'Enterprise'}
                  </Badge>
                )}
                <span className="text-sm text-slate-300">
                  {usageStats.today.characters.toLocaleString()} / {usageStats.today.charactersLimit.toLocaleString()} characters today
                </span>
              </div>
              {usageStats.tier.type === 'free' && (
                <Button variant="outline" size="sm" className="text-purple-400 border-purple-500/50 hover:bg-purple-950/30">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Upgrade to Pro
                </Button>
              )}
            </div>
            <Progress 
              value={usageStats.percentUsed} 
              className="h-2 bg-slate-800"
            />
            <div className="mt-2 text-xs text-slate-400">
              {usageStats.percentUsed}% used • Resets at midnight
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ SMART PARSING TOGGLE */}
      <Card className="bg-gradient-to-r from-purple-950/30 to-blue-950/30 border-purple-800/40">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-purple-400" />
              <div>
                <Label className="text-sm font-medium text-purple-300">
                  Smart Parsing Strategy
                </Label>
                <p className="text-xs text-purple-400/80 mt-1">
                  Correct Edit-Retry replacement logic + AI enhancement for Pro accounts
                </p>
              </div>
            </div>
            <Switch
              checked={enableAIAnalysis}
              onCheckedChange={setEnableAIAnalysis}
              disabled={isAnalyzing || isParsing}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>
          
          {/* ✅ CORRECT: Edit-Retry status display */}
          {conversationText && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {hasRetryEditFormat && editRetryDetails ? (
                <Badge variant="outline" className="text-cyan-400 border-cyan-500/50 bg-cyan-950/20">
                  🎯 Claude Edit-Retry ({editRetryDetails.editCount}E/{editRetryDetails.retryCount}R → {editRetryDetails.finalMessagePairs}M, {editRetryDetails.conversationFlow})
                </Badge>
              ) : isTechnicalContent ? (
                <Badge variant="outline" className="text-orange-400 border-orange-500/50 bg-orange-950/20">
                  🔧 Technical Content
                </Badge>
              ) : parsingStrategy === 'local' ? (
                <Badge variant="outline" className="text-green-400 border-green-500/50 bg-green-950/20">
                  ⚡ Local Parsing (Fast & Free)
                </Badge>
              ) : parsingStrategy === 'ai' ? (
                <Badge variant="outline" className="text-blue-400 border-blue-500/50 bg-blue-950/20">
                  🧠 AI Enhanced Parsing
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-400 border-gray-500/50">
                  🎯 Auto Strategy
                </Badge>
              )}
              
              {enableAIAnalysis && (
                <Badge variant="outline" className="text-purple-400 border-purple-500/50 bg-purple-950/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Smart Mode
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ MAIN INPUT */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="conversation-input" className="text-base font-medium text-slate-200">
              Conversation Text
            </Label>
            <div className="flex items-center gap-3 text-sm">
              <span className={`${
                isOverProLimit ? 'text-red-400' : 
                isOverFreeLimit ? 'text-orange-400' : 
                'text-slate-400'
              }`}>
                {currentLength.toLocaleString()} / {
                  usageStats?.tier.type === 'free' ? '5k' : 
                  usageStats?.tier.type === 'pro' ? '500k' : 
                  '100k'
                } chars
              </span>
              
              {wouldExceedDaily && (
                <span className="text-red-400 font-medium">
                  Exceeds daily limit!
                </span>
              )}
            </div>
          </div>
          
          <Textarea
            id="conversation-input"
            name="conversationText"
            value={conversationText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Paste your conversation here...

✨ Perfect Edit-Retry logic: Edit replaces user message, Retry replaces AI response!

Supported formats:
• Claude.ai: Edit-Retry format with correct message counting
• ChatGPT: User:/ChatGPT: labels automatically recognized  
• Technical Logs: Manual Human:/Assistant: markup recommended
• Other: Any clear dialogue format

💾 Text auto-saves as you type for crash recovery!"
            className={`min-h-80 mt-2 bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none text-base leading-relaxed focus:border-purple-500 focus:ring-purple-500/20 ${
              wouldExceedDaily ? 'border-red-500/50' : 
              isOverProLimit ? 'border-red-500/50' :
              isOverFreeLimit ? 'border-orange-500/50' : 
              hasRetryEditFormat ? 'border-cyan-500/50' : ''
            }`}
            disabled={isAnalyzing || isParsing}
          />
        </div>

        {/* ✅ STATUS INDICATORS */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 flex-wrap">
            {detectedPlatform && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-slate-300 capitalize">
                  Detected: {detectedPlatform}
                  {hasRetryEditFormat && editRetryDetails && (
                    <span className="text-cyan-400 font-medium"> (Edit-Retry: {editRetryDetails.detectionMethod})</span>
                  )}
                  {isTechnicalContent && (
                    <span className="text-orange-400 font-medium"> (Technical)</span>
                  )}
                </span>
              </div>
            )}
            {messageCount > 0 && (
              <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-600">
                {messageCount} {isTechnicalContent ? 'blocks' : hasRetryEditFormat ? 'final messages' : 'messages'}
              </Badge>
            )}
          </div>
          
          {remainingChars < 10000 && usageStats && (
            <span className="text-orange-400 text-xs font-medium">
              {remainingChars.toLocaleString()} chars remaining today
            </span>
          )}
        </div>

        {/* ✅ ESSENTIAL FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="platform-select" className="text-slate-200">Platform</Label>
            <Select value={platform} onValueChange={handlePlatformChange}>
              <SelectTrigger id="platform-select" className="bg-slate-900/50 border-slate-700 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="auto">
                  🔍 Auto-detect {detectedPlatform && `(${detectedPlatform})`}
                </SelectItem>
                <SelectItem value="claude">🤖 Claude</SelectItem>
                <SelectItem value="chatgpt">💬 ChatGPT</SelectItem>
                <SelectItem value="other">📝 Other/Technical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="session-goal" className="text-slate-200">Session Goal (Optional)</Label>
            <Input
              id="session-goal"
              name="sessionGoal"
              placeholder="e.g., Debug code, Plan project..."
              value={sessionGoal}
              onChange={(e) => handleGoalChange(e.target.value)}
              disabled={isAnalyzing || isParsing}
              className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* ✅ SINGLE ACTION BUTTON - FIXED TEXT */}
      <div className="flex gap-3">
        <Button
          onClick={handleParseAndVerify}
          disabled={!canParseAndAnalyze || isAnalyzing || isParsing || wouldExceedDaily}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          {isParsing ? (
            <>
              <Brain className="h-4 w-4 mr-2 animate-spin" />
              {hasRetryEditFormat ? 'Processing Edit-Retry...' : 'Processing...'}
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Parse & Verify
            </>
          )}
        </Button>
      </div>

      {/* ✅ HELPFUL HINTS */}
      <div className="space-y-2">
        {conversationText.trim() && hasRetryEditFormat && editRetryDetails && (
          <div className="text-center p-3 bg-cyan-950/20 border border-cyan-800/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <p className="text-sm text-cyan-300 font-medium">
                Correct Claude Edit-Retry Logic Applied!
              </p>
            </div>
            <p className="text-xs text-cyan-400">
              Found {editRetryDetails.editCount} edits and {editRetryDetails.retryCount} retries. 
              After replacements: <strong>{editRetryDetails.finalMessagePairs} final messages</strong> ({editRetryDetails.conversationFlow}). 
              Detection: {editRetryDetails.detectionMethod}, Confidence: {Math.round(editRetryDetails.confidence * 100)}%
            </p>
          </div>
        )}
        
        {!conversationText.trim() && (
          <div className="text-center p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-400">
              ✨ Perfect Edit-Retry logic: Edit replaces previous user message, Retry replaces previous AI response. Correct message counting guaranteed!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationInput;