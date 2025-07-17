import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Brain, CheckCircle, Crown, TrendingUp, Zap } from 'lucide-react';
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

interface ParseResult {
  platform: Platform;
  messageCount: number;
  isEditRetry: boolean;
  pattern: string;
  confidence: number;
}

const ConversationInput: React.FC<ConversationInputProps> = ({
  onAnalyze,
  isAnalyzing = false
}) => {
  const navigate = useNavigate();
  
  // ✅ SIMPLE STATE
  const [conversationText, setConversationText] = useState('');
  const [platform, setPlatform] = useState<Platform>('auto');
  const [sessionGoal, setSessionGoal] = useState('');
  const [enableHaikuParsing, setEnableHaikuParsing] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  
  // ✅ DETECTION STATE
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);

  // ✅ LOCALSTORAGE: Auto-save/restore
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

  // ✅ SIMPLE: Claude Edit-Retry detection
  const detectClaudeEditRetry = useCallback((text: string): ParseResult | null => {
    if (!text.trim()) return null;

    const editCount = (text.match(/^Edit\s*$/gm) || []).length;
    const retryCount = (text.match(/^Retry\s*$/gm) || []).length;
    
    console.log('🔍 Edit-Retry Check:', { editCount, retryCount });
    
    if (editCount === 0 && retryCount === 0) return null;
    
    // ✅ SIMPLE: Split by Edit/Retry markers and count content blocks
    const blocks = text.split(/^(Edit|Retry)\s*$/gm)
      .filter(block => block.trim() && block !== 'Edit' && block !== 'Retry')
      .filter(block => block.length > 20); // Filter out short noise
    
    const messageCount = blocks.length;
    
    console.log('🎯 Claude Edit-Retry detected:', { 
      editCount, 
      retryCount, 
      contentBlocks: blocks.length,
      messageCount 
    });
    
    return {
      platform: 'claude',
      messageCount,
      isEditRetry: true,
      pattern: `edit_retry_${editCount}e_${retryCount}r`,
      confidence: 0.95
    };
  }, []);

  // ✅ SIMPLE: Known pattern detection
  const detectKnownPatterns = useCallback((text: string): ParseResult | null => {
    const content = text.toLowerCase();
    
    // Claude standard format
    if (content.includes('human:') && content.includes('assistant:')) {
      const count = (text.match(/(Human:|Assistant:)/gmi) || []).length;
      return {
        platform: 'claude',
        messageCount: count,
        isEditRetry: false,
        pattern: 'human_assistant_markers',
        confidence: 0.9
      };
    }
    
    // ChatGPT format
    if (content.includes('user:') && content.includes('chatgpt:')) {
      const count = (text.match(/(User:|ChatGPT:)/gmi) || []).length;
      return {
        platform: 'chatgpt',
        messageCount: count,
        isEditRetry: false,
        pattern: 'user_chatgpt_markers',
        confidence: 0.9
      };
    }
    
    return null;
  }, []);

  // ✅ HAIKU: Pattern learning for unknown formats
  const learnPatternWithHaiku = useCallback(async (text: string): Promise<ParseResult | null> => {
    if (!enableHaikuParsing) return null;
    if (usageStats?.tier.type === 'free') return null; // Pro feature
    
    try {
      setIsParsing(true);
      toast.info('🧠 Learning conversation pattern with Haiku...');
      
      const response = await api.analyzeEnhanced(text, {
        expectedPlatform: 'auto',
        analysisDepth: 'quick',
        forceHaiku: true
      });
      
      if (response?.success && response?.result?.messages?.length >= 2) {
        const messageCount = response.result.messages.length;
        const detectedPlatform = response.result.platform || 'other';
        
        console.log('🎊 Haiku learned pattern:', {
          platform: detectedPlatform,
          messageCount,
          confidence: response.result.confidence || 0.8
        });
        
        toast.success(`🎯 Haiku identified: ${detectedPlatform} format with ${messageCount} messages!`);
        
        return {
          platform: detectedPlatform as Platform,
          messageCount,
          isEditRetry: false,
          pattern: `haiku_learned_${detectedPlatform}`,
          confidence: response.result.confidence || 0.8
        };
      }
      
      return null;
      
    } catch (error) {
      console.log('🔄 Haiku pattern learning failed:', error);
      toast.warning('Pattern learning unavailable - using fallback detection');
      return null;
    } finally {
      setIsParsing(false);
    }
  }, [enableHaikuParsing, usageStats]);

  // ✅ MAIN: Text analysis logic
  const analyzeText = useCallback(async (text: string) => {
    if (!text.trim()) {
      setParseResult(null);
      return;
    }
    
    console.log('🔍 ANALYZING TEXT...');
    
    // ✅ STEP 1: Check Claude Edit-Retry (highest priority)
    const claudeResult = detectClaudeEditRetry(text);
    if (claudeResult) {
      setParseResult(claudeResult);
      toast.success(`🎯 Claude Edit-Retry detected! ${claudeResult.messageCount} messages`);
      return;
    }
    
    // ✅ STEP 2: Check known patterns
    const knownResult = detectKnownPatterns(text);
    if (knownResult) {
      setParseResult(knownResult);
      toast.success(`✅ Known ${knownResult.platform} format detected! ${knownResult.messageCount} messages`);
      return;
    }
    
    // ✅ STEP 3: Learn with Haiku (if enabled and Pro)
    const haikuResult = await learnPatternWithHaiku(text);
    if (haikuResult) {
      setParseResult(haikuResult);
      return;
    }
    
    // ✅ FALLBACK: Generic detection
    const lines = text.split('\n').filter(line => line.trim().length > 20);
    const estimatedMessages = Math.max(1, Math.min(lines.length, 20));
    
    setParseResult({
      platform: 'other',
      messageCount: estimatedMessages,
      isEditRetry: false,
      pattern: 'generic_fallback',
      confidence: 0.5
    });
    
    toast.info(`📝 Generic format detected - ${estimatedMessages} content blocks found`);
  }, [detectClaudeEditRetry, detectKnownPatterns, learnPatternWithHaiku]);

  // ✅ AUTO-SAVE: Text changes
  const handleTextChange = useCallback((value: string) => {
    setConversationText(value);
    analyzeText(value);
    
    if (value.trim()) {
      localStorage.setItem('metagipsy_conversation_text', value);
    } else {
      localStorage.removeItem('metagipsy_conversation_text');
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
      } finally {
        setIsLoadingUsage(false);
      }
    };

    loadUsageStats();
  }, []);

  // ✅ MAIN ACTION: Parse & Analyze
  const handleParseAndAnalyze = useCallback(async () => {
    if (!conversationText.trim()) {
      toast.error('Please paste your conversation first');
      return;
    }

    if (!parseResult || parseResult.messageCount < 1) {
      toast.error('No valid conversation format detected');
      return;
    }

    // ✅ RATE LIMITING: Check limits
    if (usageStats) {
      const wouldExceed = (usageStats.today.characters + conversationText.length) > usageStats.today.charactersLimit;
      if (wouldExceed) {
        const remaining = usageStats.today.charactersLimit - usageStats.today.characters;
        toast.error(
          `Daily limit exceeded! ${remaining} characters remaining. ${
            usageStats.tier.type === 'free' ? 'Upgrade to Pro for 500k daily.' : 'Resets at midnight.'
          }`
        );
        return;
      }
    }

    console.log('🚀 NAVIGATING TO VERIFY...', parseResult);
    
    // ✅ PREPARE: Verify data
    const verifyData = {
      conversationText,
      platform: platform === 'auto' ? parseResult.platform : platform,
      sessionGoal,
      hasRetryEditFormat: parseResult.isEditRetry,
      messageCount: parseResult.messageCount,
      enableAIAnalysis: enableHaikuParsing,
      parsedMessages: null,
      parsingMethod: parseResult.pattern,
      parsingStrategy: parseResult.isEditRetry ? 'edit_retry' : 'standard',
      isTechnicalContent: false,
      editRetryDetails: parseResult.isEditRetry ? {
        isEditRetry: true,
        finalMessagePairs: parseResult.messageCount,
        editCount: 0,
        retryCount: 0,
        confidence: parseResult.confidence,
        detectionMethod: parseResult.pattern,
        conversationFlow: `${parseResult.messageCount} messages`
      } : null,
      timestamp: Date.now(),
      debugInfo: {
        detectedPlatform: parseResult.platform,
        originalPlatform: platform,
        textLength: conversationText.length,
        pattern: parseResult.pattern,
        confidence: parseResult.confidence,
        haikuEnabled: enableHaikuParsing
      }
    };
    
    sessionStorage.setItem('metagipsy_verify_data', JSON.stringify(verifyData));
    navigate('/analyze/verify');
  }, [conversationText, platform, sessionGoal, parseResult, enableHaikuParsing, usageStats, navigate]);

  const currentLength = conversationText.length;
  const wouldExceedDaily = usageStats ? (usageStats.today.characters + currentLength) > usageStats.today.charactersLimit : false;
  const canAnalyze = conversationText.trim().length > 20 && parseResult && parseResult.messageCount >= 1 && !wouldExceedDaily;

  return (
    <div className="space-y-6">
      {/* ✅ HEADER */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-slate-100">Analyze Conversation</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Simple pattern detection: Claude Edit-Retry → Haiku learning → Known formats
        </p>
      </div>

      {/* ✅ USAGE STATS */}
      {!isLoadingUsage && usageStats && (
        <Card className="bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border-indigo-800/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {usageStats.tier.type === 'free' ? (
                  <Badge variant="outline" className="text-blue-400 border-blue-500/50">Free Tier</Badge>
                ) : (
                  <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    {usageStats.tier.type === 'pro' ? 'Pro' : 'Enterprise'}
                  </Badge>
                )}
                <span className="text-sm text-slate-300">
                  {usageStats.today.characters.toLocaleString()} / {usageStats.today.charactersLimit.toLocaleString()} chars
                </span>
              </div>
              {usageStats.tier.type === 'free' && (
                <Button variant="outline" size="sm" className="text-purple-400 border-purple-500/50">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Upgrade to Pro
                </Button>
              )}
            </div>
            <Progress value={usageStats.percentUsed} className="h-2 bg-slate-800" />
          </CardContent>
        </Card>
      )}

      {/* ✅ HAIKU LEARNING TOGGLE */}
      <Card className="bg-gradient-to-r from-purple-950/30 to-blue-950/30 border-purple-800/40">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-purple-400" />
              <div>
                <Label className="text-sm font-medium text-purple-300">
                  Haiku Pattern Learning
                </Label>
                <p className="text-xs text-purple-400/80 mt-1">
                  Learn conversation patterns from any LLM interface (Pro feature)
                </p>
              </div>
            </div>
            <Switch
              checked={enableHaikuParsing}
              onCheckedChange={setEnableHaikuParsing}
              disabled={isAnalyzing || isParsing || usageStats?.tier.type === 'free'}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* ✅ MAIN INPUT */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="conversation" className="text-base font-medium text-slate-200">
              Conversation Text
            </Label>
            <span className="text-sm text-slate-400">
              {currentLength.toLocaleString()} chars
            </span>
          </div>
          
          <Textarea
            id="conversation"
            value={conversationText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Paste your conversation here...

🎯 Simple detection logic:
• Claude Edit-Retry: Instant recognition
• Known patterns: Human:/Assistant:, User:/ChatGPT:
• Unknown formats: Haiku AI learns the pattern (Pro)
• Generic fallback: Basic content detection

💾 Auto-saves as you type!"
            className={`min-h-80 mt-2 bg-slate-900/50 border-slate-700 text-slate-100 resize-none text-base leading-relaxed focus:border-purple-500 focus:ring-purple-500/20 ${
              wouldExceedDaily ? 'border-red-500/50' : 
              parseResult?.isEditRetry ? 'border-cyan-500/50' : 
              parseResult ? 'border-green-500/50' : ''
            }`}
            disabled={isAnalyzing || isParsing}
          />
        </div>

        {/* ✅ DETECTION STATUS */}
        {parseResult && (
          <div className="flex items-center gap-2 flex-wrap">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <Badge variant="outline" className={`${
              parseResult.isEditRetry ? 'text-cyan-400 border-cyan-500/50 bg-cyan-950/20' :
              parseResult.platform === 'claude' ? 'text-blue-400 border-blue-500/50 bg-blue-950/20' :
              parseResult.platform === 'chatgpt' ? 'text-green-400 border-green-500/50 bg-green-950/20' :
              'text-gray-400 border-gray-500/50 bg-gray-950/20'
            }`}>
              {parseResult.isEditRetry ? '🎯 Claude Edit-Retry' : 
               parseResult.pattern === 'haiku_learned_claude' ? '🧠 Haiku Learned' :
               parseResult.platform.charAt(0).toUpperCase() + parseResult.platform.slice(1)} Format
            </Badge>
            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
              {parseResult.messageCount} messages
            </Badge>
            <Badge variant="outline" className="text-purple-400 border-purple-500/50">
              {Math.round(parseResult.confidence * 100)}% confidence
            </Badge>
          </div>
        )}

        {/* ✅ FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="platform" className="text-slate-200">Platform</Label>
            <Select value={platform} onValueChange={handlePlatformChange}>
              <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="auto">
                  🔍 Auto-detect {parseResult && `(${parseResult.platform})`}
                </SelectItem>
                <SelectItem value="claude">🤖 Claude</SelectItem>
                <SelectItem value="chatgpt">💬 ChatGPT</SelectItem>
                <SelectItem value="other">📝 Other/Technical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="goal" className="text-slate-200">Session Goal (Optional)</Label>
            <Input
              id="goal"
              placeholder="e.g., Debug code, Plan project..."
              value={sessionGoal}
              onChange={(e) => handleGoalChange(e.target.value)}
              disabled={isAnalyzing || isParsing}
              className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* ✅ ACTION BUTTON */}
      <div className="flex gap-3">
        <Button
          onClick={handleParseAndAnalyze}
          disabled={!canAnalyze || isAnalyzing || isParsing}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          {isParsing ? (
            <>
              <Brain className="h-4 w-4 mr-2 animate-spin" />
              Learning Pattern...
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Parse & Analyze
            </>
          )}
        </Button>
      </div>

      {/* ✅ HINTS */}
      {conversationText.trim() && parseResult && (
        <div className="text-center p-3 bg-cyan-950/20 border border-cyan-800/30 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-cyan-400" />
            <p className="text-sm text-cyan-300 font-medium">
              {parseResult.isEditRetry ? 'Claude Edit-Retry Logic Applied!' :
               parseResult.pattern.startsWith('haiku_') ? 'Pattern Learned with Haiku!' :
               'Known Format Detected!'}
            </p>
          </div>
          <p className="text-xs text-cyan-400">
            Platform: {parseResult.platform} • Messages: {parseResult.messageCount} • 
            Pattern: {parseResult.pattern} • Confidence: {Math.round(parseResult.confidence * 100)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default ConversationInput;