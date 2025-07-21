import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Brain, CheckCircle, Crown, TrendingUp, Zap, Sparkles, HelpCircle, BookOpen, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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

interface FormatDetection {
  format: 'claude_edit_retry' | 'standard_labeled' | 'mixed_format' | 'unlabeled' | 'technical';
  platform: Platform;
  confidence: number;
  messageCount: number;
  detectionMethod: string;
  patterns: string[];
  issues: string[];
  suggestions: string[];
}

interface EditRetryDetection {
  isEditRetry: boolean;
  finalMessagePairs: number;
  editCount: number;
  retryCount: number;
  confidence: number;
  detectionMethod: string;
  conversationFlow: string;
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
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  // ✅ ENHANCED: Universal format detection state
  const [formatDetection, setFormatDetection] = useState<FormatDetection | null>(null);
  const [editRetryDetails, setEditRetryDetails] = useState<EditRetryDetection | null>(null);
  
  // ✅ Usage tracking and limits
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);

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

  // ✅ ENHANCED: Universal format detection with confidence scoring
  const detectUniversalFormat = useCallback((text: string): FormatDetection => {
    if (!text.trim()) {
      return {
        format: 'unlabeled',
        platform: 'other',
        confidence: 0,
        messageCount: 0,
        detectionMethod: 'empty_text',
        patterns: [],
        issues: ['No text provided'],
        suggestions: ['Paste your conversation to begin analysis']
      };
    }

    const patterns: string[] = [];
    const issues: string[] = [];
    const suggestions: string[] = [];
    let confidence = 0;
    let messageCount = 0;
    let format: FormatDetection['format'] = 'unlabeled';
    let platform: Platform = 'other';
    let detectionMethod = '';

    // ✅ STEP 1: Check for Claude Edit-Retry format (highest priority)
    const editMatches = text.match(/^Edit\s*$/gm) || [];
    const retryMatches = text.match(/^Retry\s*$/gm) || [];
    
    if (editMatches.length > 0 || retryMatches.length > 0) {
      format = 'claude_edit_retry';
      platform = 'claude';
      confidence = 0.95;
      detectionMethod = 'edit_retry_markers';
      patterns.push(`${editMatches.length} Edit markers`, `${retryMatches.length} Retry markers`);
      
      // Estimate final message count after Edit-Retry processing
      const totalMarkers = editMatches.length + retryMatches.length;
      messageCount = Math.max(totalMarkers, 2);
      
      if (editMatches.length > 0 && retryMatches.length > 0) {
        patterns.push('Mixed Edit/Retry pattern detected');
      }
      
      return {
        format, platform, confidence, messageCount, detectionMethod, patterns, issues, suggestions
      };
    }

    // ✅ STEP 2: Check for standard labeled formats
    const labelPatterns = [
      // User patterns (comprehensive)
      { pattern: /^(Human|User|You|Person|Me):\s*/gmi, type: 'user', platform: 'claude' as Platform },
      { pattern: /^(Assistant|Claude):\s*/gmi, type: 'assistant', platform: 'claude' as Platform },
      { pattern: /^(ChatGPT|GPT|OpenAI):\s*/gmi, type: 'assistant', platform: 'chatgpt' as Platform },
      { pattern: /^(Gemini|Bard|Model):\s*/gmi, type: 'assistant', platform: 'chatgpt' as Platform },
      { pattern: /^(AI|Bot|Assistant):\s*/gmi, type: 'assistant', platform: 'other' as Platform },
    ];

    let userLabels = 0;
    let assistantLabels = 0;
    let detectedPlatforms: Platform[] = [];

    labelPatterns.forEach(({ pattern, type, platform: labelPlatform }) => {
      const matches = text.match(pattern) || [];
      if (matches.length > 0) {
        patterns.push(`${matches.length} ${type} labels (${labelPlatform})`);
        detectedPlatforms.push(labelPlatform);
        
        if (type === 'user') userLabels += matches.length;
        if (type === 'assistant') assistantLabels += matches.length;
      }
    });

    if (userLabels > 0 && assistantLabels > 0) {
      format = 'standard_labeled';
      messageCount = userLabels + assistantLabels;
      confidence = Math.min(0.9, 0.6 + (Math.min(userLabels, assistantLabels) * 0.1));
      detectionMethod = 'explicit_labels';
      
      // Determine most likely platform
      const platformCounts = detectedPlatforms.reduce((acc, p) => {
        acc[p] = (acc[p] || 0) + 1;
        return acc;
      }, {} as Record<Platform, number>);
      
      platform = Object.entries(platformCounts).sort(([,a], [,b]) => b - a)[0][0] as Platform;
      
      // Check for good alternation
      const ratio = Math.min(userLabels, assistantLabels) / Math.max(userLabels, assistantLabels);
      if (ratio < 0.7) {
        issues.push('Unbalanced user/assistant messages');
        suggestions.push('Check for missing labels or incomplete conversation');
        confidence *= 0.8;
      }
      
    } else if (userLabels > 0 || assistantLabels > 0) {
      format = 'mixed_format';
      confidence = 0.4;
      detectionMethod = 'partial_labels';
      issues.push('Inconsistent labeling detected');
      suggestions.push('Add missing "Human:" or "Assistant:" labels for better parsing');
      messageCount = Math.max(userLabels, assistantLabels) * 2; // Estimate
    }

    // ✅ STEP 3: Check for technical content
    const technicalIndicators = [
      /npm run|yarn|npx|@\w+\/\w+@\d+\.\d+\.\d+/i,
      /error ts\d+|compilation|build failed|prisma/i,
      /environment variables loaded|schema loaded/i,
      /✔|✅|❌|⚠️|🔴|🟡|🟢/g,
      /\d{4}-\d{2}-\d{2}t\d{2}:\d{2}:\d{2}/i,
      /\[info\]|\[error\]|\[warn\]/i
    ];
    
    const technicalMatches = technicalIndicators.filter(pattern => pattern.test(text));
    if (technicalMatches.length >= 2 && format === 'unlabeled') {
      format = 'technical';
      platform = 'other';
      confidence = 0.6;
      detectionMethod = 'technical_content';
      patterns.push('Technical log format detected');
      suggestions.push('Consider adding "Human:" and "Assistant:" labels manually');
      messageCount = 1; // Technical content often one block
    }

    // ✅ STEP 4: Fallback - try to estimate from paragraph structure
    if (format === 'unlabeled') {
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 20);
      
      if (paragraphs.length >= 2) {
        format = 'unlabeled';
        messageCount = paragraphs.length;
        confidence = 0.3;
        detectionMethod = 'paragraph_estimation';
        patterns.push(`${paragraphs.length} content blocks detected`);
        issues.push('No clear conversation labels found');
        suggestions.push(
          'Add "Human:" before your messages and "Assistant:" before AI responses',
          'Use platform\'s native export format for best results'
        );
      } else {
        issues.push('Insufficient content for conversation analysis');
        suggestions.push('Paste a complete conversation with at least 2 messages');
      }
    }

    return {
      format,
      platform,
      confidence,
      messageCount,
      detectionMethod,
      patterns,
      issues,
      suggestions
    };
  }, []);

  // ✅ ENHANCED: Edit-Retry detection with actual message parsing
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
      const editMatches = text.match(/^Edit\s*$/gm) || [];
      const retryMatches = text.match(/^Retry\s*$/gm) || [];
      
      const editCount = editMatches.length;
      const retryCount = retryMatches.length;
      
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

      let finalMessagePairs = 0;
      let conversationFlow = '';
      let parsedMessages: Array<{role: 'user' | 'assistant'; content: string; index: number}> = [];
      
      if (isEditRetry) {
        const parts = text.split(/^(Edit|Retry)\s*$/gm).filter(part => part.trim().length > 0);
        
        let currentRole: 'user' | 'assistant' = 'user';
        let messageIndex = 0;
        
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i].trim();
          
          if (part === 'Edit' || part === 'Retry') continue;
          if (part.length < 10) continue;
          
          parsedMessages.push({
            role: currentRole,
            content: part,
            index: messageIndex
          });
          
          currentRole = currentRole === 'user' ? 'assistant' : 'user';
          messageIndex++;
        }
        
        finalMessagePairs = parsedMessages.length;
        const userCount = parsedMessages.filter(m => m.role === 'user').length;
        const assistantCount = parsedMessages.filter(m => m.role === 'assistant').length;
        conversationFlow = `${userCount}U/${assistantCount}A`;
      }

      return {
        isEditRetry,
        finalMessagePairs,
        editCount,
        retryCount,
        confidence,
        detectionMethod,
        conversationFlow,
        parsedMessages
      };

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

  // ✅ ENHANCED: Smart text analysis with universal format detection
  const analyzeText = useCallback((text: string) => {
    if (!text.trim()) {
      setFormatDetection(null);
      setEditRetryDetails(null);
      return;
    }
    
    // First check for Edit-Retry format
    const editRetryResult = detectEditRetryFormat(text);
    setEditRetryDetails(editRetryResult);
    
    // Then run universal format detection
    const formatResult = detectUniversalFormat(text);
    setFormatDetection(formatResult);
    
    // Override with Edit-Retry results if detected
    if (editRetryResult.isEditRetry) {
      setFormatDetection(prev => prev ? {
        ...prev,
        format: 'claude_edit_retry',
        platform: 'claude',
        confidence: editRetryResult.confidence,
        messageCount: editRetryResult.finalMessagePairs,
        detectionMethod: editRetryResult.detectionMethod,
        patterns: [`Edit-Retry format: ${editRetryResult.editCount}E/${editRetryResult.retryCount}R`]
      } : null);
    }
  }, [detectEditRetryFormat, detectUniversalFormat]);

  // ✅ AUTO-SAVE: Text changes with localStorage
  const handleTextChange = useCallback((value: string) => {
    setConversationText(value);
    analyzeText(value);
    
    if (value.trim()) {
      localStorage.setItem('metagipsy_conversation_text', value);
      localStorage.setItem('metagipsy_last_saved', new Date().toISOString());
    } else {
      localStorage.removeItem('metagipsy_conversation_text');
      localStorage.removeItem('metagipsy_last_saved');
    }
  }, [analyzeText]);

  const handleGoalChange = useCallback((value: string) => {
    setSessionGoal(value);
    if (value.trim()) {
      localStorage.setItem('metagipsy_session_goal', value);
    } else {
      localStorage.removeItem('metagipsy_session_goal');
    }
  }, []);

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

  // ✅ ENHANCED: Parse & Verify with better validation
  const handleParseAndVerify = useCallback(async () => {
    if (!conversationText.trim()) {
      toast.error('Please paste your conversation first');
      return;
    }

    if (!formatDetection) {
      toast.error('Text analysis not complete. Please wait a moment.');
      return;
    }

    // Enhanced validation based on format detection
    if (formatDetection.confidence < 0.3) {
      toast.error('Low parsing confidence. Please check the formatting guide below.');
      return;
    }

    if (formatDetection.messageCount < 2 && formatDetection.format !== 'technical') {
      toast.error('Need at least 2 messages to analyze. Check formatting or add more content.');
      return;
    }

    // Rate limiting check
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

    setIsParsing(true);
    
    // Show appropriate feedback based on format
    if (formatDetection.format === 'claude_edit_retry') {
      toast.success('🎯 Using optimized Claude Edit-Retry parsing...');
    } else if (formatDetection.confidence > 0.8) {
      toast.success(`✅ High confidence ${formatDetection.format} parsing...`);
    } else if (formatDetection.confidence > 0.5) {
      toast.info(`📝 Standard parsing (${Math.round(formatDetection.confidence * 100)}% confidence)...`);
    } else {
      toast.warning('⚠️ Low confidence parsing - results may need manual verification...');
    }

    // Prepare enhanced verify data
    const verifyData = {
      conversationText,
      platform: platform === 'auto' ? formatDetection.platform : platform,
      sessionGoal,
      hasRetryEditFormat: formatDetection.format === 'claude_edit_retry',
      messageCount: formatDetection.messageCount,
      enableAIAnalysis,
      parsedMessages: editRetryDetails?.parsedMessages || null,
      parsingMethod: formatDetection.format === 'claude_edit_retry' ? 'edit_retry_optimized' : 'universal_enhanced',
      formatDetection,
      editRetryDetails,
      timestamp: Date.now(),
      debugInfo: {
        detectedFormat: formatDetection.format,
        detectedPlatform: formatDetection.platform,
        originalPlatform: platform,
        textLength: conversationText.length,
        confidence: formatDetection.confidence,
        detectionMethod: formatDetection.detectionMethod,
        patterns: formatDetection.patterns,
        preParsedCount: editRetryDetails?.parsedMessages?.length || 0
      }
    };
    
    setTimeout(() => setIsParsing(false), 500);
    
    sessionStorage.setItem('metagipsy_verify_data', JSON.stringify(verifyData));
    navigate('/analyze/verify');
  }, [conversationText, platform, sessionGoal, enableAIAnalysis, formatDetection, editRetryDetails, usageStats, navigate]);

  const canParseAndAnalyze = conversationText.trim().length > 20 && formatDetection?.confidence > 0.2;
  
  // Character calculations
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
          Paste your conversation below for intelligent 5D analysis with universal format detection.
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

      {/* ✅ NEW: How It Works Guide */}
      <Card className="bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border-blue-800/40">
        <Collapsible open={showHowItWorks} onOpenChange={setShowHowItWorks}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-blue-950/20 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                  <span className="text-blue-300">How to Format Your Conversation</span>
                </div>
                <HelpCircle className="h-4 w-4 text-blue-400" />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-300">✅ Best Formats (Auto-Detected)</h4>
                    <div className="space-y-2 text-slate-300">
                      <div className="p-2 bg-blue-950/30 rounded border border-blue-800/30">
                        <strong>Claude.ai:</strong> Native Edit-Retry format (perfect detection)
                      </div>
                      <div className="p-2 bg-blue-950/30 rounded border border-blue-800/30">
                        <strong>ChatGPT:</strong> User: / ChatGPT: labels
                      </div>
                      <div className="p-2 bg-blue-950/30 rounded border border-blue-800/30">
                        <strong>Manual:</strong> Human: / Assistant: labels
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-orange-300">⚠️ Need Manual Labels</h4>
                    <div className="space-y-2 text-slate-300">
                      <div className="p-2 bg-orange-950/30 rounded border border-orange-800/30">
                        <strong>Unlabeled:</strong> Add "Human:" and "Assistant:" manually
                      </div>
                      <div className="p-2 bg-orange-950/30 rounded border border-orange-800/30">
                        <strong>Technical Logs:</strong> Mark user vs system messages
                      </div>
                      <div className="p-2 bg-orange-950/30 rounded border border-orange-800/30">
                        <strong>Mixed Format:</strong> Use consistent labeling
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-green-950/30 border border-green-800/30 rounded-lg">
                  <h5 className="font-semibold text-green-300 mb-2">💡 Pro Tips:</h5>
                  <ul className="space-y-1 text-green-200 text-xs">
                    <li>• Use your platform's native export format for best results</li>
                    <li>• One speaker per paragraph, clear role transitions</li>
                    <li>• Include complete back-and-forth conversations (minimum 2 messages)</li>
                    <li>• For technical logs: manually add Human:/Assistant: labels</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

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
                  Universal format detection + AI enhancement for Pro accounts
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
          
          {/* ✅ ENHANCED: Format detection display */}
          {conversationText && formatDetection && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge 
                  variant="outline" 
                  className={`${
                    formatDetection.confidence > 0.8 ? 'text-green-400 border-green-500/50 bg-green-950/20' :
                    formatDetection.confidence > 0.5 ? 'text-yellow-400 border-yellow-500/50 bg-yellow-950/20' :
                    'text-orange-400 border-orange-500/50 bg-orange-950/20'
                  }`}
                >
                  {formatDetection.format === 'claude_edit_retry' && editRetryDetails ? 
                    `🎯 Claude Edit-Retry (${editRetryDetails.editCount}E/${editRetryDetails.retryCount}R → ${editRetryDetails.finalMessagePairs}M)` :
                    `${formatDetection.confidence > 0.8 ? '✅' : formatDetection.confidence > 0.5 ? '📝' : '⚠️'} ${formatDetection.format.replace('_', ' ').toUpperCase()}`
                  }
                </Badge>
                
                <Badge variant="outline" className="text-slate-400 border-slate-500/50">
                  {Math.round(formatDetection.confidence * 100)}% confidence
                </Badge>
                
                <Badge variant="outline" className="text-slate-400 border-slate-500/50">
                  {formatDetection.messageCount} messages
                </Badge>
                
                {enableAIAnalysis && (
                  <Badge variant="outline" className="text-purple-400 border-purple-500/50 bg-purple-950/20">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Smart Mode
                  </Badge>
                )}
              </div>
              
              {/* Show issues and suggestions */}
              {formatDetection.issues.length > 0 && (
                <div className="text-xs space-y-1">
                  {formatDetection.issues.map((issue, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-orange-400">
                      <AlertCircle className="h-3 w-3" />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {formatDetection.suggestions.length > 0 && (
                <div className="text-xs space-y-1">
                  {formatDetection.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-blue-400">
                      <Sparkles className="h-3 w-3" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
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

✨ Universal format detection supports:
• Claude.ai: Native Edit-Retry format (perfect detection)
• ChatGPT: User:/ChatGPT: or User:/Assistant: labels  
• Gemini: User:/Model: or User:/Gemini: labels
• Manual: Human:/Assistant: labels (best for any platform)
• Technical: Add Human:/Assistant: labels to logs

💾 Text auto-saves as you type for crash recovery!"
            className={`min-h-80 mt-2 bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none text-base leading-relaxed focus:border-purple-500 focus:ring-purple-500/20 ${
              wouldExceedDaily ? 'border-red-500/50' : 
              isOverProLimit ? 'border-red-500/50' :
              isOverFreeLimit ? 'border-orange-500/50' : 
              formatDetection?.format === 'claude_edit_retry' ? 'border-cyan-500/50' :
              formatDetection?.confidence > 0.8 ? 'border-green-500/50' :
              formatDetection?.confidence > 0.5 ? 'border-yellow-500/50' : ''
            }`}
            disabled={isAnalyzing || isParsing}
          />
        </div>

        {/* ✅ ENHANCED STATUS INDICATORS */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 flex-wrap">
            {formatDetection && (
              <div className="flex items-center gap-1">
                <CheckCircle className={`h-4 w-4 ${
                  formatDetection.confidence > 0.8 ? 'text-green-400' :
                  formatDetection.confidence > 0.5 ? 'text-yellow-400' : 'text-orange-400'
                }`} />
                <span className="text-slate-300 capitalize">
                  {formatDetection.platform} 
                  <span className="text-slate-400 ml-1">
                    ({formatDetection.detectionMethod.replace('_', ' ')})
                  </span>
                </span>
              </div>
            )}
            {formatDetection?.messageCount > 0 && (
              <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-600">
                {formatDetection.messageCount} messages detected
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
                  🔍 Auto-detect {formatDetection?.platform && `(${formatDetection.platform})`}
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

      {/* ✅ SINGLE ACTION BUTTON */}
      <div className="flex gap-3">
        <Button
          onClick={handleParseAndVerify}
          disabled={!canParseAndAnalyze || isAnalyzing || isParsing || wouldExceedDaily}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          {isParsing ? (
            <>
              <Brain className="h-4 w-4 mr-2 animate-spin" />
              {formatDetection?.format === 'claude_edit_retry' ? 'Processing Edit-Retry...' : 'Processing...'}
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Parse & Verify
            </>
          )}
        </Button>
      </div>

      {/* ✅ ENHANCED HELPFUL HINTS */}
      <div className="space-y-2">
        {conversationText.trim() && formatDetection?.format === 'claude_edit_retry' && editRetryDetails && (
          <div className="text-center p-3 bg-cyan-950/20 border border-cyan-800/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <p className="text-sm text-cyan-300 font-medium">
                Perfect Claude Edit-Retry Detection!
              </p>
            </div>
            <p className="text-xs text-cyan-400">
              Found {editRetryDetails.editCount} edits and {editRetryDetails.retryCount} retries. 
              After replacements: <strong>{editRetryDetails.finalMessagePairs} final messages</strong> ({editRetryDetails.conversationFlow}). 
              Confidence: {Math.round(editRetryDetails.confidence * 100)}%
            </p>
          </div>
        )}
        
        {conversationText.trim() && formatDetection && formatDetection.confidence < 0.5 && (
          <div className="text-center p-3 bg-orange-950/20 border border-orange-800/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-orange-400" />
              <p className="text-sm text-orange-300 font-medium">
                Low Parsing Confidence ({Math.round(formatDetection.confidence * 100)}%)
              </p>
            </div>
            <p className="text-xs text-orange-400">
              Consider adding "Human:" and "Assistant:" labels manually for better results. 
              See the formatting guide above for examples.
            </p>
          </div>
        )}
        
        {!conversationText.trim() && (
          <div className="text-center p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-400">
              ✨ Universal format detection supports Claude Edit-Retry, ChatGPT/Gemini labels, and manual Human:/Assistant: markup. Check the guide above for best practices!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationInput;