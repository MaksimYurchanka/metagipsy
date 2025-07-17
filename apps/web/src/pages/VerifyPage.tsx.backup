import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, Zap, Edit2, User, Bot, RefreshCw, Settings, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface VerifyData {
  conversationText: string;
  platform: string;
  sessionGoal: string;
  hasRetryEditFormat: boolean;
  messageCount: number;
  timestamp: number;
}

interface ParsedMessage {
  role: 'user' | 'assistant';
  content: string;
  index: number;
  editable?: boolean;
}

const VerifyPage: React.FC = () => {
  const navigate = useNavigate();
  
  // ✅ STATE MANAGEMENT
  const [verifyData, setVerifyData] = useState<VerifyData | null>(null);
  const [parsedMessages, setParsedMessages] = useState<ParsedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // ✅ SETTINGS STATE
  const [projectContext, setProjectContext] = useState('');
  const [analysisDepth, setAnalysisDepth] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [enablePatternDetection, setEnablePatternDetection] = useState(true);
  const [enableClaudeAnalysis, setEnableClaudeAnalysis] = useState(true);
  const [generateSuggestions, setGenerateSuggestions] = useState(true);

  // ✅ LOAD DATA FROM SESSION STORAGE
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
          messageCount: data.messageCount
        });

        setVerifyData(data);
        
        // Parse messages immediately
        const messages = parseConversation(data.conversationText, data.hasRetryEditFormat);
        setParsedMessages(messages);
        
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error loading verify data:', error);
        toast.error('Failed to load conversation data');
        navigate('/analyze');
      }
    };

    loadVerifyData();
  }, [navigate]);

  // ✅ RETRY→EDIT PARSER (только один формат!)
  const parseConversation = useCallback((text: string, hasRetryEditFormat: boolean): ParsedMessage[] => {
    console.log('🎯 PARSING CONVERSATION:', { hasRetryEditFormat, textLength: text.length });
    
    const messages: ParsedMessage[] = [];
    
    if (hasRetryEditFormat) {
      console.log('🎯 USING RETRY→EDIT PARSING');
      return parseRetryEditFormat(text);
    }
    
    // ✅ FALLBACK: Traditional parsing
    const parts = text.split(/\n\s*\n/).filter(p => p.trim().length > 20);
    
    parts.forEach((part, index) => {
      const trimmed = part.trim();
      if (!trimmed) return;
      
      let role: 'user' | 'assistant' = index % 2 === 0 ? 'user' : 'assistant';
      let content = trimmed;
      
      // Simple role detection
      if (trimmed.match(/^(Human:|User:)/i)) {
        role = 'user';
        content = trimmed.replace(/^(Human:|User:)\s*/i, '').trim();
      } else if (trimmed.match(/^(Assistant:|ChatGPT:)/i)) {
        role = 'assistant';
        content = trimmed.replace(/^(Assistant:|ChatGPT:)\s*/i, '').trim();
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

  // ✅ RETRY→EDIT FORMAT PARSER  
  const parseRetryEditFormat = (text: string): ParsedMessage[] => {
    console.log('🎯 PARSING RETRY→EDIT FORMAT...');
    
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
    
    // Parse Retry → [User] → Edit → [Assistant] → Retry pattern
    for (let i = 0; i < retryLines.length; i++) {
      const retryLine = retryLines[i];
      const nextEdit = editLines.find(edit => edit > retryLine);
      
      if (nextEdit) {
        // User message: Retry → Edit
        const userMessageLines = lines.slice(retryLine + 1, nextEdit);
        const userMessage = userMessageLines.join('\n').trim();
        
        if (userMessage && userMessage.length > 10) {
          messages.push({
            role: 'user',
            content: userMessage,
            index: messages.length,
            editable: true
          });
          
          // Assistant response: Edit → next Retry
          const nextRetry = retryLines[i + 1];
          if (nextRetry) {
            const assistantLines = lines.slice(nextEdit + 1, nextRetry);
            let assistantMessage = assistantLines.join('\n').trim();
            
            // Remove metadata from assistant response
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
    
    console.log(`🎯 RETRY→EDIT PARSING COMPLETE: ${messages.length} messages`);
    return messages;
  };

  // ✅ MESSAGE EDITING
  const handleEditMessage = useCallback((index: number, newContent: string) => {
    setParsedMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, content: newContent } : msg
    ));
  }, []);

  // ✅ ROLE SWITCHING
  const handleSwitchRole = useCallback((index: number) => {
    setParsedMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, role: msg.role === 'user' ? 'assistant' : 'user' } : msg
    ));
  }, []);

  // ✅ CONFIRM & ANALYZE
  const handleConfirmAnalysis = useCallback(async () => {
    if (!verifyData || parsedMessages.length === 0) {
      toast.error('No messages to analyze');
      return;
    }

    setIsAnalyzing(true);
    console.log('🚀 STARTING ANALYSIS from verify page...');

    try {
      // Create analysis request
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
          parsingMethod: verifyData.hasRetryEditFormat ? 'retry-edit' : 'fallback',
          timestamp: new Date().toISOString()
        },
        options: {
          useClaudeAnalysis: enableClaudeAnalysis,
          analysisDepth,
          enablePatternDetection,
          generateSuggestions
        }
      };

      console.log('🚀 SENDING ANALYSIS REQUEST:', {
        messageCount: parsedMessages.length,
        platform: verifyData.platform,
        useClaudeAnalysis: enableClaudeAnalysis,
        analysisDepth
      });

      // Call analysis API
      const response = await api.analyzeConversation(analysisRequest);
      
      if (!response || !response.sessionId) {
        throw new Error('Invalid analysis response');
      }

      console.log('✅ ANALYSIS SUCCESS, redirecting to results:', response.sessionId);
      
      // Clear session storage
      sessionStorage.removeItem('metagipsy_verify_data');
      
      // Redirect to results page
      navigate(`/analyze/results/${response.sessionId}`);
      
      toast.success('Analysis completed! Redirecting to results...');
      
    } catch (error) {
      console.error('❌ ANALYSIS ERROR:', error);
      toast.error('Analysis failed. Please try again.');
      setIsAnalyzing(false);
    }
  }, [verifyData, parsedMessages, projectContext, analysisDepth, enablePatternDetection, enableClaudeAnalysis, generateSuggestions, navigate]);

  // ✅ BACK TO INPUT
  const handleBackToInput = useCallback(() => {
    navigate('/analyze');
  }, [navigate]);

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ✅ HEADER */}
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
          Review and edit the parsed messages below, then configure your analysis settings.
        </p>
        
        {/* ✅ PARSING INFO */}
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className="bg-blue-950/50 border-blue-700">
            {verifyData.hasRetryEditFormat ? 'Retry→Edit Format' : 'Pattern Detection'} • {parsedMessages.length} messages
          </Badge>
          <Badge variant="secondary">
            Platform: {verifyData.platform}
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ✅ MESSAGES PREVIEW (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Parsed Messages ({parsedMessages.length})
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
                    {/* ✅ MESSAGE HEADER */}
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

                    {/* ✅ MESSAGE CONTENT - DARK THEME FIXED */}
                    <Textarea
                      value={message.content}
                      onChange={(e) => handleEditMessage(index, e.target.value)}
                      className="min-h-20 bg-background/50 dark:bg-background border-muted dark:border-slate-600 text-foreground dark:text-foreground resize-none"
                      placeholder="Edit message content..."
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✅ SETTINGS PANEL (1/3 width) */}
        <div className="space-y-4">
          {/* ✅ BASIC SETTINGS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Analysis Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project Context */}
              <div>
                <Label htmlFor="context">Project Context</Label>
                <Textarea
                  id="context"
                  placeholder="Describe your project, goals, or context..."
                  value={projectContext}
                  onChange={(e) => setProjectContext(e.target.value)}
                  className="min-h-20 bg-background text-foreground"
                />
              </div>

              {/* Analysis Depth */}
              <div>
                <Label htmlFor="depth">Analysis Depth</Label>
                <Select value={analysisDepth} onValueChange={(value: any) => setAnalysisDepth(value)}>
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

              {/* Toggle Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="claude-analysis" className="text-sm">
                    Claude AI Analysis
                  </Label>
                  <Switch
                    id="claude-analysis"
                    checked={enableClaudeAnalysis}
                    onCheckedChange={setEnableClaudeAnalysis}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="pattern-detection" className="text-sm">
                    Pattern Detection
                  </Label>
                  <Switch
                    id="pattern-detection"
                    checked={enablePatternDetection}
                    onCheckedChange={setEnablePatternDetection}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="suggestions" className="text-sm">
                    Generate Suggestions
                  </Label>
                  <Switch
                    id="suggestions"
                    checked={generateSuggestions}
                    onCheckedChange={setGenerateSuggestions}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ✅ SESSION INFO */}
          <Card>
            <CardHeader>
              <CardTitle>Session Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
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
                  {verifyData.hasRetryEditFormat ? 'Retry→Edit' : 'Standard'}
                </span>
              </div>
              {verifyData.sessionGoal && (
                <div className="pt-2">
                  <span className="text-muted-foreground text-xs">Goal:</span>
                  <p className="text-sm">{verifyData.sessionGoal}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ✅ ACTION BUTTONS */}
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