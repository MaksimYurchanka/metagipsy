import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, Zap, Edit2, User, Bot, RefreshCw, Brain, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { api } from '@/lib/api';

// ✅ ENHANCED: Support for new format detection system
interface FormatDetection {
  format: 'claude_edit_retry' | 'standard_labeled' | 'mixed_format' | 'unlabeled' | 'technical';
  platform: string;
  confidence: number;
  messageCount: number;
  detectionMethod: string;
  patterns: string[];
  issues: string[];
  suggestions: string[];
}

interface VerifyData {
  conversationText: string;
  platform: string;
  sessionGoal: string;
  hasRetryEditFormat: boolean;
  messageCount: number;
  timestamp: number;
  // ✅ EXISTING: Support for pre-parsed messages (unchanged)
  parsedMessages?: Array<{
    role: 'user' | 'assistant';
    content: string;
    index: number;
    timestamp?: string;
  }>;
  editRetryDetails?: {
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
  };
  // ✅ NEW: Enhanced format detection support
  formatDetection?: FormatDetection;
  debugInfo?: {
    preParsedCount?: number;
    detectedFormat?: string;
    confidence?: number;
    [key: string]: any;
  };
}

interface ParsedMessage {
  role: 'user' | 'assistant';
  content: string;
  index: number;
  editable?: boolean;
}

const VerifyPage: React.FC = () => {
  const navigate = useNavigate();
  
  // ✅ STATE MANAGEMENT (unchanged)
  const [verifyData, setVerifyData] = useState<VerifyData | null>(null);
  const [parsedMessages, setParsedMessages] = useState<ParsedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [usingPreParsed, setUsingPreParsed] = useState(false);
  
  // ✅ SIMPLIFIED SETTINGS STATE (unchanged)
  const [projectContext, setProjectContext] = useState('');

  // ✅ LOAD DATA FROM SESSION STORAGE (enhanced for new format detection)
  useEffect(() => {
    const loadVerifyData = () => {
      try {
        const savedData = sessionStorage.getItem('metagipsy_verify_data');
        if (!savedData) {
          console.log('❌ No verify data found, redirecting to analyze');
          toast.error('No conversation data found');
          navigate('/analyze');
          return;
        }

        const data: VerifyData = JSON.parse(savedData);
        console.log('✅ Loaded verify data:', {
          textLength: data.conversationText.length,
          platform: data.platform,
          hasRetryEditFormat: data.hasRetryEditFormat,
          messageCount: data.messageCount,
          preParsedCount: data.editRetryDetails?.parsedMessages?.length || 0,
          formatDetection: data.formatDetection,
          debugInfo: data.debugInfo
        });

        setVerifyData(data);
        
        // ✅ CRITICAL FIX: Use pre-parsed messages from ConversationInput if available (unchanged)
        if (data.editRetryDetails?.parsedMessages?.length > 0) {
          console.log('🎯 USING PRE-PARSED MESSAGES FROM ConversationInput');
          console.log('Pre-parsed messages:', data.editRetryDetails.parsedMessages);
          
          const preParsedMessages: ParsedMessage[] = data.editRetryDetails.parsedMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
            index: msg.index,
            editable: true
          }));
          
          setParsedMessages(preParsedMessages);
          setUsingPreParsed(true);
          setIsLoading(false);
          
          // ✅ ENHANCED: Better success message with format detection info
          const formatInfo = data.formatDetection ? 
            ` (${data.formatDetection.format}, ${Math.round(data.formatDetection.confidence * 100)}% confidence)` : 
            '';
          
          toast.success(`✅ Using ConversationInput parsing: ${preParsedMessages.length} messages${formatInfo}`, {
            duration: 3000
          });
          
          return; // ✅ SKIP VerifyPage parsing completely
        }
        
        // ✅ FALLBACK: Only use VerifyPage parsing if no pre-parsed messages (unchanged)
        console.log('🔄 FALLBACK: No pre-parsed messages, using VerifyPage parsing...');
        
        const messages = parseConversation(data.conversationText, data.hasRetryEditFormat);
        setParsedMessages(messages);
        setUsingPreParsed(false);
        
        // ✅ ENHANCED: Better validation with format detection
        const expectedCount = data.formatDetection?.messageCount || data.messageCount;
        if (messages.length !== expectedCount && expectedCount > 0) {
          console.warn('⚠️ MESSAGE COUNT MISMATCH:', {
            expected: expectedCount,
            parsed: messages.length,
            formatDetection: data.formatDetection,
            usingVerifyPageParser: true
          });
          
          const confidence = data.formatDetection?.confidence ? 
            ` (${Math.round(data.formatDetection.confidence * 100)}% confidence)` : 
            '';
          
          toast.warning(`Parsed ${messages.length} messages, expected ${expectedCount}${confidence}. You can edit manually.`, {
            duration: 5000
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error loading verify data:', error);
        toast.error('Failed to load conversation data');
        navigate('/analyze');
      }
    };

    loadVerifyData();
  }, [navigate]);

  // ✅ EXISTING PARSERS (unchanged for backward compatibility)
  const parseConversation = useCallback((text: string, hasRetryEditFormat: boolean): ParsedMessage[] => {
    console.log('🎯 VERIFY PAGE PARSING (FALLBACK):', { hasRetryEditFormat, textLength: text.length });
    
    const messages: ParsedMessage[] = [];
    
    if (hasRetryEditFormat) {
      console.log('🎯 USING RETRY→EDIT PARSING (FALLBACK)');
      return parseRetryEditFormat(text);
    }
    
    // ✅ FALLBACK: Traditional parsing (unchanged)
    const parts = text.split(/\n\s*\n/).filter(p => p.trim().length > 20);
    
    parts.forEach((part, index) => {
      const trimmed = part.trim();
      if (!trimmed) return;
      
      let role: 'user' | 'assistant' = index % 2 === 0 ? 'user' : 'assistant';
      let content = trimmed;
      
      // ✅ ENHANCED: Better role detection for universal formats
      if (trimmed.match(/^(Human:|User:|You:|Person:)/i)) {
        role = 'user';
        content = trimmed.replace(/^(Human:|User:|You:|Person:)\s*/i, '').trim();
      } else if (trimmed.match(/^(Assistant:|ChatGPT:|Claude:|AI:|Bot:|Model:|Gemini:)/i)) {
        role = 'assistant';
        content = trimmed.replace(/^(Assistant:|ChatGPT:|Claude:|AI:|Bot:|Model:|Gemini:)\s*/i, '').trim();
      }
      
      if (content.trim()) {
        messages.push({
          role,
          content: content.trim(),
          index: messages.length,
          editable: true
        });
      }
    });
    
    console.log(`🔄 FALLBACK PARSING COMPLETE: ${messages.length} messages`);
    return messages;
  }, []);

  // ✅ EXISTING RETRY→EDIT FORMAT PARSER (unchanged)
  const parseRetryEditFormat = (text: string): ParsedMessage[] => {
    console.log('🎯 PARSING RETRY→EDIT FORMAT (FALLBACK)...');
    
    const messages: ParsedMessage[] = [];
    const lines = text.split('\n');
    
    const retryLines: number[] = [];
    const editLines: number[] = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed === 'Retry') {
        retryLines.push(index);
      }
      if (trimmed === 'Edit') {
        editLines.push(index);
      }
    });
    
    console.log(`📍 Found: ${retryLines.length} Retry, ${editLines.length} Edit markers`);
    
    // Parse Retry → [User] → Edit → [Assistant] → Retry pattern (unchanged)
    for (let i = 0; i < retryLines.length; i++) {
      const retryLine = retryLines[i];
      const nextEdit = editLines.find(edit => edit > retryLine);
      
      if (nextEdit) {
        const userMessageLines = lines.slice(retryLine + 1, nextEdit);
        const userMessage = userMessageLines.join('\n').trim();
        
        if (userMessage && userMessage.length > 10) {
          messages.push({
            role: 'user',
            content: userMessage,
            index: messages.length,
            editable: true
          });
          
          const nextRetry = retryLines[i + 1];
          if (nextRetry) {
            const assistantLines = lines.slice(nextEdit + 1, nextRetry);
            let assistantMessage = assistantLines.join('\n').trim();
            
            assistantMessage = assistantMessage
              .replace(/^[A-Z][a-z].*?\.\s*\n\d+s\s*\n*/g, '')
              .replace(/^Thought process \d+s\s*\n*/g, '')
              .trim();
            
            if (assistantMessage && assistantMessage.length > 10) {
              messages.push({
                role: 'assistant',
                content: assistantMessage,
                index: messages.length,
                editable: true
              });
            }
          }
        }
      }
    }
    
    console.log(`🎯 RETRY→EDIT PARSING (FALLBACK) COMPLETE: ${messages.length} messages`);
    return messages;
  };

  // ✅ MESSAGE EDITING (unchanged)
  const handleEditMessage = useCallback((index: number, newContent: string) => {
    setParsedMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, content: newContent } : msg
    ));
  }, []);

  // ✅ ROLE SWITCHING (unchanged)
  const handleSwitchRole = useCallback((index: number) => {
    setParsedMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, role: msg.role === 'user' ? 'assistant' : 'user' } : msg
    ));
  }, []);

  // ✅ CONFIRM & ANALYZE (unchanged core logic, enhanced metadata)
  const handleConfirmAnalysis = useCallback(async () => {
    if (!verifyData || parsedMessages.length === 0) {
      toast.error('No messages to analyze');
      return;
    }

    setIsAnalyzing(true);
    console.log('🚀 STARTING ANALYSIS from verify page...', {
      messageCount: parsedMessages.length,
      usingPreParsed,
      platform: verifyData.platform,
      formatDetection: verifyData.formatDetection
    });

    try {
      // ✅ ENHANCED: Create analysis request with format detection metadata
      const analysisRequest = {
        conversation: {
          messages: parsedMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
            index: msg.index,
            timestamp: new Date().toISOString()
          })),
          platform: verifyData.platform
        },
        metadata: {
          sessionGoal: verifyData.sessionGoal || undefined,
          projectContext: projectContext || undefined,
          hasRetryEditFormat: verifyData.hasRetryEditFormat,
          messageCount: parsedMessages.length,
          parsingMethod: usingPreParsed ? 'conversation_input_preparsed' : 
                        (verifyData.hasRetryEditFormat ? 'verify_page_retry_edit' : 'verify_page_fallback'),
          timestamp: new Date().toISOString(),
          // ✅ ENHANCED: Include format detection metadata
          parsingSource: usingPreParsed ? 'ConversationInput' : 'VerifyPage',
          originalMessageCount: verifyData.messageCount
          // TODO: Add formatDetection fields after backend update
        },
        // ✅ SIMPLIFIED: Use defaults instead of removed settings (unchanged)
        options: {
          useClaudeAnalysis: true,
          analysisDepth: 'standard',
          enablePatternDetection: true,
          generateSuggestions: true
        }
      };

      console.log('🚀 SENDING ANALYSIS REQUEST:', {
        messageCount: parsedMessages.length,
        platform: verifyData.platform,
        formatDetection: verifyData.formatDetection,
        parsingSource: usingPreParsed ? 'ConversationInput' : 'VerifyPage'
      });

      // Call analysis API (unchanged)
      const response = await api.analyzeConversation(analysisRequest);
      
      if (!response || !response.sessionId) {
        throw new Error('Invalid analysis response');
      }

      console.log('✅ ANALYSIS SUCCESS, redirecting to results:', response.sessionId);
      
      // Clear session storage and redirect (unchanged)
      sessionStorage.removeItem('metagipsy_verify_data');
      navigate(`/analyze/results/${response.sessionId}`);
      toast.success('Analysis completed! Redirecting to results...');
      
    } catch (error) {
      console.error('❌ ANALYSIS ERROR:', error);
      toast.error('Analysis failed. Please try again.');
      setIsAnalyzing(false);
    }
  }, [verifyData, parsedMessages, projectContext, navigate, usingPreParsed]);

  // ✅ BACK TO INPUT (unchanged)
  const handleBackToInput = useCallback(() => {
    navigate('/analyze');
  }, [navigate]);

  // ✅ HELPER: Get confidence color and icon
  const getConfidenceDisplay = (confidence: number) => {
    if (confidence >= 0.8) {
      return { color: 'text-green-400', bgColor: 'bg-green-950/50 border-green-700', icon: CheckCircle };
    } else if (confidence >= 0.5) {
      return { color: 'text-yellow-400', bgColor: 'bg-yellow-950/50 border-yellow-700', icon: Info };
    } else {
      return { color: 'text-orange-400', bgColor: 'bg-orange-950/50 border-orange-700', icon: AlertCircle };
    }
  };

  if (isLoading || !verifyData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading conversation data...</p>
        </div>
      </div>
    );
  }

  const formatDetection = verifyData.formatDetection;
  const confidenceDisplay = formatDetection ? getConfidenceDisplay(formatDetection.confidence) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ✅ ENHANCED HEADER with format detection info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-2">
          <Eye className="h-6 w-6 text-blue-400" />
          <h1 className="text-3xl font-bold">Verify Parsed Messages</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Review and edit the parsed messages below, then confirm for analysis.
        </p>
        
        {/* ✅ ENHANCED PARSING INFO with format detection */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Badge variant="outline" className={`${
            usingPreParsed ? 'bg-green-950/50 border-green-700' : 'bg-blue-950/50 border-blue-700'
          }`}>
            {usingPreParsed ? '✅ ConversationInput Parsing' : 
             (verifyData.hasRetryEditFormat ? 'Retry→Edit Format' : 'Pattern Detection')} • {parsedMessages.length} messages
          </Badge>
          
          <Badge variant="secondary">
            Platform: {verifyData.platform}
          </Badge>
          
          {/* ✅ NEW: Format detection confidence badge */}
          {formatDetection && confidenceDisplay && (
            <Badge variant="outline" className={`${confidenceDisplay.bgColor} ${confidenceDisplay.color}`}>
              <confidenceDisplay.icon className="h-3 w-3 mr-1" />
              {formatDetection.format.replace('_', ' ').toUpperCase()} • {Math.round(formatDetection.confidence * 100)}%
            </Badge>
          )}
          
          {usingPreParsed && verifyData.editRetryDetails && (
            <Badge variant="outline" className="bg-cyan-950/50 border-cyan-700 text-cyan-300">
              {verifyData.editRetryDetails.editCount}E/{verifyData.editRetryDetails.retryCount}R • {verifyData.editRetryDetails.conversationFlow}
            </Badge>
          )}
        </div>
        
        {/* ✅ NEW: Format detection issues and suggestions */}
        {formatDetection && (formatDetection.issues.length > 0 || formatDetection.suggestions.length > 0) && (
          <div className="max-w-2xl mx-auto space-y-2">
            {formatDetection.issues.length > 0 && (
              <div className="text-sm">
                {formatDetection.issues.map((issue, idx) => (
                  <div key={idx} className="flex items-center justify-center gap-1 text-orange-400">
                    <AlertCircle className="h-3 w-3" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            )}
            
            {formatDetection.suggestions.length > 0 && (
              <div className="text-sm">
                {formatDetection.suggestions.slice(0, 2).map((suggestion, idx) => (
                  <div key={idx} className="flex items-center justify-center gap-1 text-blue-400">
                    <Info className="h-3 w-3" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* ✅ ENHANCED: Parsing source indicator */}
        {usingPreParsed && (
          <div className="text-center">
            <Badge className="bg-green-600/20 text-green-300 border-green-500/50">
              🎯 Using optimized ConversationInput parsing results
            </Badge>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ✅ MESSAGES PREVIEW (2/3 width) - unchanged structure, enhanced info */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Parsed Messages ({parsedMessages.length})
                {usingPreParsed && (
                  <Badge variant="outline" className="text-xs bg-green-900/30 text-green-400 border-green-600">
                    Pre-parsed
                  </Badge>
                )}
                {/* ✅ NEW: Confidence indicator */}
                {formatDetection && confidenceDisplay && (
                  <Badge variant="outline" className={`text-xs ${confidenceDisplay.bgColor} ${confidenceDisplay.color}`}>
                    {Math.round(formatDetection.confidence * 100)}% confident
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {parsedMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transition-all ${
                      message.role === 'user'
                        ? 'bg-blue-950/20 border-blue-800/50 dark:bg-blue-950/30 dark:border-blue-700'
                        : 'bg-green-950/20 border-green-800/50 dark:bg-green-950/30 dark:border-green-700'
                    }`}
                  >
                    {/* ✅ MESSAGE HEADER (unchanged) */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {message.role === 'user' ? (
                          <User className="h-4 w-4 text-blue-400" />
                        ) : (
                          <Bot className="h-4 w-4 text-green-400" />
                        )}
                        <Badge
                          variant="outline"
                          className={`cursor-pointer transition-colors ${
                            message.role === 'user'
                              ? 'bg-blue-900/50 text-blue-300 border-blue-600 hover:bg-blue-800/50'
                              : 'bg-green-900/50 text-green-300 border-green-600 hover:bg-green-800/50'
                          }`}
                          onClick={() => handleSwitchRole(index)}
                        >
                          {message.role === 'user' ? '👤 User' : '🤖 Assistant'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Message {index + 1}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSwitchRole(index)}
                        className="h-6 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Switch
                      </Button>
                    </div>

                    {/* ✅ MESSAGE CONTENT (unchanged) */}
                    <Textarea
                      value={message.content}
                      onChange={(e) => handleEditMessage(index, e.target.value)}
                      className="min-h-20 bg-background/50 dark:bg-background border-muted dark:border-slate-600 text-foreground dark:text-foreground resize-none"
                      placeholder="Edit message content..."
                    />
                  </div>
                ))}
              </div>
              
              {/* ✅ ENHANCED: Parsing source info with format detection */}
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Edit2 className="h-4 w-4" />
                    <span>
                      Parsing source: {usingPreParsed ? 'ConversationInput (optimized)' : 'VerifyPage (fallback)'}
                    </span>
                  </div>
                  
                  {formatDetection && (
                    <>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          Format: {formatDetection.format.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Method: {formatDetection.detectionMethod.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {formatDetection.patterns.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Patterns: {formatDetection.patterns.join(', ')}
                        </div>
                      )}
                    </>
                  )}
                  
                  {verifyData.debugInfo?.preParsedCount && (
                    <div className="text-xs text-muted-foreground">
                      Expected: {verifyData.messageCount}, Detected: {verifyData.debugInfo.preParsedCount}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✅ SIDEBAR (1/3 width) - enhanced with format detection info */}
        <div className="space-y-4">
          {/* ✅ PROJECT CONTEXT (unchanged) */}
          <Card>
            <CardHeader>
              <CardTitle>Project Context</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe your project, goals, or context..."
                value={projectContext}
                onChange={(e) => setProjectContext(e.target.value)}
                className="min-h-20 bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Optional context to improve analysis quality
              </p>
            </CardContent>
          </Card>

          {/* ✅ ENHANCED SESSION INFO with format detection */}
          <Card>
            <CardHeader>
              <CardTitle>Session Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform:</span>
                <span className="font-medium">{verifyData.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Messages:</span>
                <span className="font-medium">{parsedMessages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format:</span>
                <span className="font-medium">
                  {verifyData.hasRetryEditFormat ? 'Edit-Retry' : 'Standard'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Parser:</span>
                <span className={`font-medium ${usingPreParsed ? 'text-green-400' : 'text-blue-400'}`}>
                  {usingPreParsed ? 'ConversationInput' : 'VerifyPage'}
                </span>
              </div>
              
              {/* ✅ NEW: Format detection details */}
              {formatDetection && (
                <>
                  <div className="pt-2 border-t border-muted">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Confidence:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={formatDetection.confidence * 100} className="w-16 h-2" />
                        <span className={`text-xs font-medium ${confidenceDisplay?.color}`}>
                          {Math.round(formatDetection.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-muted-foreground text-xs">Detection:</span>
                      <span className="text-xs">
                        {formatDetection.detectionMethod.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </>
              )}
              
              {verifyData.sessionGoal && (
                <div className="pt-2 border-t border-muted">
                  <span className="text-muted-foreground text-xs">Goal:</span>
                  <p className="text-sm">{verifyData.sessionGoal}</p>
                </div>
              )}
              
              {/* ✅ EXISTING: Edit-Retry details (unchanged) */}
              {usingPreParsed && verifyData.editRetryDetails && (
                <div className="pt-2 border-t border-muted">
                  <span className="text-muted-foreground text-xs">Edit-Retry:</span>
                  <p className="text-sm">
                    {verifyData.editRetryDetails.editCount} edits, {verifyData.editRetryDetails.retryCount} retries
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Confidence: {Math.round(verifyData.editRetryDetails.confidence * 100)}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ✅ ACTION BUTTONS (unchanged) */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={handleBackToInput}
          variant="outline"
          disabled={isAnalyzing}
          className="min-w-32"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Edit
        </Button>
        
        <Button
          onClick={handleConfirmAnalysis}
          disabled={parsedMessages.length === 0 || isAnalyzing}
          className="min-w-40 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isAnalyzing ? (
            <>
              <Brain className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Confirm & Analyze
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default VerifyPage;