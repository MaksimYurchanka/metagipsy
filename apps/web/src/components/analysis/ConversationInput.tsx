import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Wand2, Eye, AlertCircle, CheckCircle, Edit3, RefreshCw, User, Bot, Sparkles, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ConversationInputProps, Platform } from '@/types';
import { cn } from '@/lib/utils';
import {
  useAnalysisDepth,
  usePatternDetection,
  useClaudeAnalysis,
  useAutoDetectPlatform,
  useAnimationsEnabled
} from '@/stores/settingsStore';

// ✅ SMART PARSING INTERFACES
interface ParsedMessage {
  role: 'user' | 'assistant';
  content: string;
  confidence: number;
  originalIndex: number;
}

interface ParsePreview {
  messages: ParsedMessage[];
  confidence: number;
  method: 'haiku' | 'pattern';
  platform: Platform;
  needsVerification: boolean;
  suggestions?: string[];
}

// ✅ ENHANCED CONVERSATION INPUT - Drop-in replacement
const ConversationInput: React.FC<ConversationInputProps> = ({
  onAnalyze,
  isAnalyzing = false
}) => {
  // ✅ CORE STATE MANAGEMENT
  const [conversationText, setConversationText] = useState('');
  const [platform, setPlatform] = useState<Platform>('auto');
  const [sessionGoal, setSessionGoal] = useState('');
  const [projectContext, setProjectContext] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // ✅ SMART PARSING STATE
  const [parsePreview, setParsePreview] = useState<ParsePreview | null>(null);
  const [isParsingPreview, setIsParsingPreview] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [detectedPlatform, setDetectedPlatform] = useState<Platform | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [localClaudeEnabled, setLocalClaudeEnabled] = useState(true);
  
  // ✅ SETTINGS from store - stable
  const defaultAnalysisDepth = useAnalysisDepth();
  const enablePatternDetection = usePatternDetection();
  const enableClaudeAnalysis = useClaudeAnalysis();
  const autoDetectPlatform = useAutoDetectPlatform();
  const animationsEnabled = useAnimationsEnabled();
  
  // ✅ REFS for stable callbacks
  const currentDataRef = useRef({
    conversationText: '',
    platform: 'auto' as Platform,
    detectedPlatform: null as Platform | null,
    sessionGoal: '',
    projectContext: '',
    localClaudeEnabled: true,
    enableClaudeAnalysis: true,
    defaultAnalysisDepth: 'standard' as const,
    enablePatternDetection: true
  });

  // ✅ UPDATE REFS
  currentDataRef.current = {
    conversationText,
    platform,
    detectedPlatform,
    sessionGoal,
    projectContext,
    localClaudeEnabled,
    enableClaudeAnalysis,
    defaultAnalysisDepth,
    enablePatternDetection
  };

  // ✅ PLATFORM DETECTION - Enhanced
  const analyzeText = useCallback((text: string) => {
    if (!text.trim()) {
      setDetectedPlatform(null);
      setMessageCount(0);
      return;
    }
    
    let detected: Platform = 'other';
    const content = text.toLowerCase();
    
    if (content.includes('human:') && content.includes('assistant:')) {
      detected = 'claude';
    } else if (content.includes('user:') && (content.includes('chatgpt:') || content.includes('openai'))) {
      detected = 'chatgpt';
    } else if (content.match(/^(you|me|user|assistant|ai):/mi)) {
      detected = 'other';
    }
    
    setDetectedPlatform(detected);
    
    // ✅ SMART MESSAGE COUNTING
    const messageMarkers = text.match(/(Human:|Assistant:|User:|ChatGPT:|AI:|\*\*User\*\*|\*\*Assistant\*\*)/gmi);
    const alternatingBlocks = text.split(/\n\s*\n/).filter(block => block.trim().length > 10);
    
    const estimatedMessages = messageMarkers ? messageMarkers.length : Math.min(alternatingBlocks.length, Math.ceil(text.length / 200));
    setMessageCount(estimatedMessages);
  }, []);

  const handleTextChange = (value: string) => {
    setConversationText(value);
    analyzeText(value);
    // ✅ RESET PREVIEW when text changes
    if (parsePreview) {
      setParsePreview(null);
      setShowVerification(false);
    }
  };

  // ✅ SMART PARSING with /enhanced API - FALLBACK IMPLEMENTATION
  const handleSmartParse = useCallback(async () => {
    if (!conversationText.trim()) {
      toast.error('Please paste your conversation first');
      return;
    }

    setIsParsingPreview(true);
    console.log('🧠 SMART PARSING: Starting enhanced conversation analysis...');

    try {
      // ✅ TRY /enhanced API - but fallback gracefully if not available
      try {
        const response = await fetch('/api/analyze/enhanced', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: conversationText,
            options: {
              expectedPlatform: platform === 'auto' ? detectedPlatform : platform,
              analysisDepth: 'standard'
            },
            metadata: {
              sessionGoal: sessionGoal || undefined,
              projectContext: projectContext || undefined
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.result) {
            const preview: ParsePreview = {
              messages: data.result.messages.map((msg: any, index: number) => ({
                role: msg.role,
                content: msg.content,
                confidence: 85,
                originalIndex: index
              })),
              confidence: data.result.confidence || 0.8,
              method: data.result.method || 'haiku',
              platform: data.result.platform || detectedPlatform || 'other',
              needsVerification: data.metadata?.needsVerification || false,
              suggestions: data.result.verification?.suggestions || []
            };

            setParsePreview(preview);
            setShowVerification(true);
            
            toast.success(`Smart parsing completed! ${preview.messages.length} messages found.`);
            return;
          }
        }
      } catch (apiError) {
        console.log('🔄 Enhanced API not available, using fallback parsing');
      }
      
      // ✅ FALLBACK to local parsing if API fails
      const fallbackPreview = createLocalPreview(conversationText);
      setParsePreview(fallbackPreview);
      setShowVerification(true);
      
      toast.success(`Parsed ${fallbackPreview.messages.length} messages with local method`);

    } catch (error) {
      console.error('❌ SMART PARSING ERROR:', error);
      toast.error('Parsing failed. Please try direct analysis.');
    } finally {
      setIsParsingPreview(false);
    }
  }, [conversationText, platform, detectedPlatform, sessionGoal, projectContext]);

  // ✅ LOCAL PARSING FALLBACK
  const createLocalPreview = (text: string): ParsePreview => {
    const messages: ParsedMessage[] = [];
    
    try {
      let parts: string[] = [];
      
      if (detectedPlatform === 'claude') {
        parts = text.split(/(?=(?:Human:|Assistant:))/i).filter(p => p.trim());
        
        parts.forEach((part, index) => {
          const trimmed = part.trim();
          if (!trimmed) return;
          
          let role: 'user' | 'assistant' = 'user';
          let content = trimmed;
          
          if (trimmed.match(/^Human:/i)) {
            role = 'user';
            content = trimmed.replace(/^Human:\s*/i, '').trim();
          } else if (trimmed.match(/^Assistant:/i)) {
            role = 'assistant';
            content = trimmed.replace(/^Assistant:\s*/i, '').trim();
          }
          
          if (content) {
            messages.push({
              role,
              content,
              confidence: 80,
              originalIndex: messages.length
            });
          }
        });
      } else {
        // ✅ Generic alternating parsing
        parts = text.split(/\n\s*\n/).filter(p => p.trim());
        
        parts.forEach((part, index) => {
          if (part.trim()) {
            messages.push({
              role: index % 2 === 0 ? 'user' : 'assistant',
              content: part.trim(),
              confidence: 60,
              originalIndex: messages.length
            });
          }
        });
      }
    } catch (error) {
      console.error('Local parsing error:', error);
    }

    return {
      messages,
      confidence: messages.length > 0 ? 0.7 : 0.3,
      method: 'pattern',
      platform: detectedPlatform || 'other',
      needsVerification: true,
      suggestions: messages.length === 0 ? ['Consider adding role markers like "Human:" and "Assistant:"'] : []
    };
  };

  // ✅ MESSAGE EDITING
  const handleEditMessage = useCallback((index: number, newContent: string) => {
    if (!parsePreview) return;
    
    const updatedMessages = [...parsePreview.messages];
    updatedMessages[index] = { ...updatedMessages[index], content: newContent };
    
    setParsePreview({
      ...parsePreview,
      messages: updatedMessages
    });
  }, [parsePreview]);

  // ✅ ROLE SWITCHING
  const handleSwitchRole = useCallback((index: number) => {
    if (!parsePreview) return;
    
    const updatedMessages = [...parsePreview.messages];
    updatedMessages[index] = { 
      ...updatedMessages[index], 
      role: updatedMessages[index].role === 'user' ? 'assistant' : 'user'
    };
    
    setParsePreview({
      ...parsePreview,
      messages: updatedMessages
    });
  }, [parsePreview]);

  // ✅ FINAL ANALYSIS - Perfect AnalysisPage Compatibility
  const handleConfirmAndAnalyze = useCallback(() => {
    if (!parsePreview) return;

    // ✅ EXACT FORMAT expected by AnalysisPage.handleAnalyze
    const analysisRequest = {
      conversation: {
        messages: parsePreview.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          index: msg.originalIndex,
          timestamp: new Date().toISOString()
        })),
        platform: parsePreview.platform
      },
      metadata: {
        projectContext: projectContext || undefined,
        sessionGoal: sessionGoal || undefined,
        parsingMethod: parsePreview.method,
        parsingConfidence: parsePreview.confidence
      },
      options: {
        useClaudeAnalysis: localClaudeEnabled && enableClaudeAnalysis,
        analysisDepth: defaultAnalysisDepth,
        enablePatternDetection: enablePatternDetection,
        generateSuggestions: true,
        detectPatterns: enablePatternDetection
      }
    };

    console.log('🚀 SMART INPUT: Calling onAnalyze with enhanced data');
    
    // ✅ CALL PARENT: Exact same interface as original ConversationInput
    onAnalyze(analysisRequest);
  }, [parsePreview, projectContext, sessionGoal, localClaudeEnabled, enableClaudeAnalysis, 
      defaultAnalysisDepth, enablePatternDetection, onAnalyze]);

  // ✅ DIRECT ANALYSIS (skip verification) - STABLE with ZERO dependencies
  const handleDirectAnalyze = useCallback(() => {
    const data = currentDataRef.current;
    
    if (!data.conversationText.trim()) return;

    console.log('🚀 DIRECT ANALYZE: Using ref data:', {
      textLength: data.conversationText.length,
      platform: data.platform,
      claudeEnabled: data.localClaudeEnabled && data.enableClaudeAnalysis
    });

    // ✅ SIMPLE PARSING for direct analysis
    const messages = parseConversation(
      data.conversationText, 
      data.platform === 'auto' ? data.detectedPlatform || 'other' : data.platform
    );
    
    if (messages.length < 2) {
      toast.error('Please provide at least 2 messages (one exchange) to analyze.');
      return;
    }

    // ✅ EXACT FORMAT expected by AnalysisPage
    const analysisRequest = {
      conversation: {
        messages,
        platform: data.platform === 'auto' ? data.detectedPlatform || 'other' : data.platform
      },
      options: {
        useClaudeAnalysis: data.localClaudeEnabled && data.enableClaudeAnalysis,
        analysisDepth: data.defaultAnalysisDepth,
        enablePatternDetection: data.enablePatternDetection,
        generateSuggestions: true,
        detectPatterns: data.enablePatternDetection
      },
      metadata: {
        projectContext: data.projectContext || undefined,
        sessionGoal: data.sessionGoal || undefined,
        messageCount: messages.length,
        detectedPlatform: data.detectedPlatform,
        timestamp: new Date().toISOString()
      }
    };

    console.log('🚀 DIRECT ANALYZE: Analysis request prepared, calling onAnalyze');
    
    // ✅ CALL PARENT: Same interface as original
    onAnalyze(analysisRequest);
  }, []); // ZERO DEPENDENCIES = STABLE

  // ✅ SIMPLE PARSING FUNCTION
  const parseConversation = (text: string, detectedPlatform: Platform) => {
    const messages: any[] = [];
    let parts: string[] = [];
    
    if (detectedPlatform === 'claude') {
      parts = text.split(/(?=(?:Human:|Assistant:))/i).filter(p => p.trim());
    } else if (detectedPlatform === 'chatgpt') {
      parts = text.split(/(?=(?:User:|ChatGPT:|\*\*User\*\*|\*\*Assistant\*\*))/i).filter(p => p.trim());
    } else {
      parts = text.split(/(?=(?:Human:|Assistant:|User:|AI:|You:|Me:))/i).filter(p => p.trim());
      
      if (parts.length <= 1) {
        parts = text.split(/\n\s*\n/).filter(p => p.trim().length > 10);
      }
    }
    
    parts.forEach((part, index) => {
      const trimmed = part.trim();
      if (!trimmed) return;
      
      let role: 'user' | 'assistant' = 'user';
      let content = trimmed;
      
      if (trimmed.match(/^(Human:|User:|\*\*User\*\*|You:)/i)) {
        role = 'user';
        content = trimmed.replace(/^(Human:|User:|\*\*User\*\*|You:)\s*/i, '').trim();
      } else if (trimmed.match(/^(Assistant:|ChatGPT:|AI:|\*\*Assistant\*\*|Me:)/i)) {
        role = 'assistant';
        content = trimmed.replace(/^(Assistant:|ChatGPT:|AI:|\*\*Assistant\*\*|Me:)\s*/i, '').trim();
      } else {
        role = index % 2 === 0 ? 'user' : 'assistant';
      }
      
      if (content.trim()) {
        messages.push({
          role,
          content: content.trim(),
          index: messages.length,
          timestamp: new Date(Date.now() - (parts.length - index) * 60000).toISOString()
        });
      }
    });
    
    return messages;
  };

  const canAnalyze = conversationText.trim().length > 50 && messageCount >= 2;
  const hasPreview = parsePreview && parsePreview.messages.length > 0;
  const claudeAnalysisEnabled = localClaudeEnabled && enableClaudeAnalysis;

  return (
    <div className="w-full space-y-6">
      {/* ✅ MAIN INPUT SECTION */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Smart Conversation Analysis
            {claudeAnalysisEnabled && (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ✅ AI ANALYSIS TOGGLE */}
          <motion.div 
            className="p-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-700/40"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="font-medium text-purple-200">AI-Powered Analysis</span>
              </div>
              <Switch
                checked={localClaudeEnabled}
                onCheckedChange={setLocalClaudeEnabled}
                disabled={isAnalyzing}
                className="data-[state=checked]:bg-purple-500"
              />
            </div>
            <p className="text-sm text-purple-300 mt-1">
              {claudeAnalysisEnabled 
                ? "Using Claude AI for sophisticated 5-dimension scoring"
                : "Using local analysis engine (faster but simpler)"
              }
            </p>
          </motion.div>

          {/* ✅ MAIN TEXTAREA */}
          <div className="space-y-2">
            <Textarea
              placeholder="Paste your conversation here...

Example formats:
• Claude: Human: ... / Assistant: ...
• ChatGPT: User: ... / ChatGPT: ...
• Custom: Any clear dialogue format"
              value={conversationText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="min-h-[200px] resize-y font-mono text-sm"
              disabled={isAnalyzing || isParsingPreview}
            />
            
            {/* ✅ STATUS INDICATORS */}
            <div className="flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-2">
              <div className="flex items-center gap-4 flex-wrap">
                {detectedPlatform && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="capitalize">Detected: {detectedPlatform}</span>
                  </div>
                )}
                {messageCount > 0 && (
                  <Badge variant="secondary">
                    {messageCount} messages
                  </Badge>
                )}
                {hasPreview && (
                  <Badge variant="outline" className="text-green-400 border-green-500/30">
                    ✅ Parsed & Ready
                  </Badge>
                )}
                {claudeAnalysisEnabled && (
                  <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                    AI Analysis Ready
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* ✅ PLATFORM AND SETTINGS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={(value: Platform) => setPlatform(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    🔍 Auto-detect
                    {detectedPlatform && ` (${detectedPlatform})`}
                  </SelectItem>
                  <SelectItem value="claude">🤖 Claude</SelectItem>
                  <SelectItem value="chatgpt">💬 ChatGPT</SelectItem>
                  <SelectItem value="other">📝 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goal">Session Goal (Optional)</Label>
              <Input
                id="goal"
                placeholder="e.g., Debug React component, Plan project..."
                value={sessionGoal}
                onChange={(e) => setSessionGoal(e.target.value)}
                disabled={isAnalyzing || isParsingPreview}
              />
            </div>
          </div>

          {/* ✅ ADVANCED SETTINGS */}
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Advanced Settings
            </Button>
            
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="space-y-3 border-l-2 border-muted pl-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="context">Project Context (Optional)</Label>
                  <Textarea
                    id="context"
                    placeholder="Describe your project, goals, or context..."
                    value={projectContext}
                    onChange={(e) => setProjectContext(e.target.value)}
                    className="min-h-[80px]"
                    disabled={isAnalyzing || isParsingPreview}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="pattern-detection"
                      checked={enablePatternDetection}
                      disabled={isAnalyzing}
                      className="data-[state=checked]:bg-blue-500"
                    />
                    <Label htmlFor="pattern-detection">Pattern Detection</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="analysis-depth">Analysis Depth</Label>
                    <Select value={defaultAnalysisDepth} disabled={isAnalyzing}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quick">⚡ Quick</SelectItem>
                        <SelectItem value="standard">🎯 Standard</SelectItem>
                        <SelectItem value="deep">🔍 Deep</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* ✅ ACTION BUTTONS */}
          <div className="flex flex-col gap-3">
            {/* Smart Parse Button */}
            {!hasPreview && (
              <Button
                onClick={handleSmartParse}
                disabled={!canAnalyze || isAnalyzing || isParsingPreview}
                variant="outline"
                className="w-full"
              >
                {isParsingPreview ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Wand2 className="h-4 w-4" />
                    </motion.div>
                    Smart Parsing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Parse & Preview Messages
                  </div>
                )}
              </Button>
            )}

            {/* Main Analyze Button */}
            <Button
              onClick={hasPreview ? handleConfirmAndAnalyze : handleDirectAnalyze}
              disabled={!canAnalyze || isAnalyzing}
              className={cn(
                "w-full h-12 text-base font-semibold transition-all duration-200",
                canAnalyze && !isAnalyzing && claudeAnalysisEnabled && 
                  "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl",
                canAnalyze && !isAnalyzing && !claudeAnalysisEnabled && 
                  "bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700"
              )}
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-5 w-5" />
                  </motion.div>
                  {claudeAnalysisEnabled ? "AI Analyzing..." : "Analyzing..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {claudeAnalysisEnabled ? <Sparkles className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
                  {hasPreview ? 'Confirm & Analyze' : claudeAnalysisEnabled ? 'Analyze with AI' : 'Analyze Conversation'}
                </div>
              )}
            </Button>
          </div>

          {/* ✅ VALIDATION MESSAGES */}
          {!canAnalyze && conversationText.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {messageCount < 2 
                  ? "Need at least 2 messages (one conversation exchange)" 
                  : "Conversation too short (minimum 50 characters)"
                }
              </AlertDescription>
            </Alert>
          )}

          {canAnalyze && claudeAnalysisEnabled && !hasPreview && (
            <div className="text-center text-sm text-purple-400">
              ✨ Ready for AI-powered 5D chess analysis with Claude
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ VERIFICATION SECTION */}
      <AnimatePresence>
        {showVerification && parsePreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Parsed Messages Preview
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={parsePreview.confidence > 0.8 ? 'default' : 'secondary'}>
                      {parsePreview.method} • {Math.round(parsePreview.confidence * 100)}% confidence
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* ✅ PARSING INFO */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Platform:</span> {parsePreview.platform}
                    </div>
                    <div>
                      <span className="font-medium">Messages:</span> {parsePreview.messages.length}
                    </div>
                  </div>
                </div>

                {/* ✅ SUGGESTIONS */}
                {parsePreview.suggestions && parsePreview.suggestions.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Suggestions:</p>
                        {parsePreview.suggestions.map((suggestion, i) => (
                          <p key={i} className="text-sm">• {suggestion}</p>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* ✅ MESSAGES PREVIEW */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {parsePreview.messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        'p-3 rounded-lg border',
                        message.role === 'user' 
                          ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                          : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {message.role === 'user' ? (
                            <User className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Bot className="h-4 w-4 text-green-600" />
                          )}
                          <span className="font-medium capitalize">{message.role}</span>
                          <Badge variant="outline" size="sm">
                            #{index + 1}
                          </Badge>
                          {message.confidence < 70 && (
                            <Badge variant="destructive" size="sm">
                              Low confidence
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSwitchRole(index)}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                      <Textarea
                        value={message.content}
                        onChange={(e) => handleEditMessage(index, e.target.value)}
                        className="min-h-[60px] text-sm"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConversationInput;