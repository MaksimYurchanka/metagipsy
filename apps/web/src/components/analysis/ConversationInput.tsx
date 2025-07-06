import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Zap, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ConversationInputProps, Platform } from '@/types';
import { useAnalysisSettings, useDisplaySettings } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

const ConversationInput: React.FC<ConversationInputProps> = ({
  onAnalyze,
  isAnalyzing = false
}) => {
  const [conversationText, setConversationText] = useState('');
  const [platform, setPlatform] = useState<Platform>('auto');
  const [sessionGoal, setSessionGoal] = useState('');
  const [projectContext, setProjectContext] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [detectedPlatform, setDetectedPlatform] = useState<Platform | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  
  const { 
    defaultAnalysisDepth, 
    enablePatternDetection, 
    enableClaudeAnalysis 
  } = useAnalysisSettings();
  
  const { autoDetectPlatform, animationsEnabled } = useDisplaySettings();
  
  // Auto-detect platform and count messages
  const analyzeText = useCallback((text: string) => {
    if (!text.trim()) {
      setDetectedPlatform(null);
      setMessageCount(0);
      return;
    }
    
    // Simple platform detection
    let detected: Platform = 'other';
    if (text.includes('Human:') || text.includes('Assistant:')) {
      detected = 'claude';
    } else if (text.includes('User:') || text.includes('ChatGPT:') || text.includes('**User**')) {
      detected = 'chatgpt';
    }
    
    setDetectedPlatform(detected);
    
    // Count potential messages (rough estimate)
    const lines = text.split('\n').filter(line => line.trim());
    const messageMarkers = text.match(/(Human:|Assistant:|User:|ChatGPT:|\*\*User\*\*|\*\*Assistant\*\*)/gi);
    setMessageCount(messageMarkers ? messageMarkers.length : Math.ceil(lines.length / 3));
  }, []);
  
  const handleTextChange = (value: string) => {
    setConversationText(value);
    analyzeText(value);
  };
  
  const handleAnalyze = () => {
    if (!conversationText.trim()) return;
    
    // Parse conversation into messages (simplified)
    const messages = parseConversation(conversationText, platform === 'auto' ? detectedPlatform || 'other' : platform);
    
    onAnalyze(messages);
  };
  
  const parseConversation = (text: string, detectedPlatform: Platform) => {
    // This is a simplified parser - in real implementation, use the backend parser
    const messages = [];
    let parts: string[] = [];
    
    if (detectedPlatform === 'claude') {
      parts = text.split(/(?=Human:|Assistant:)/i);
    } else if (detectedPlatform === 'chatgpt') {
      parts = text.split(/(?=User:|ChatGPT:|\*\*User\*\*|\*\*Assistant\*\*)/i);
    } else {
      parts = text.split(/\n\s*\n/).filter(p => p.trim());
    }
    
    parts.forEach((part, index) => {
      const trimmed = part.trim();
      if (!trimmed) return;
      
      let role: 'user' | 'assistant' = 'user';
      let content = trimmed;
      
      if (trimmed.match(/^(Human:|User:|\*\*User\*\*)/i)) {
        role = 'user';
        content = trimmed.replace(/^(Human:|User:|\*\*User\*\*)\s*/i, '');
      } else if (trimmed.match(/^(Assistant:|ChatGPT:|\*\*Assistant\*\*)/i)) {
        role = 'assistant';
        content = trimmed.replace(/^(Assistant:|ChatGPT:|\*\*Assistant\*\*)\s*/i, '');
      } else {
        role = index % 2 === 0 ? 'user' : 'assistant';
      }
      
      if (content.trim()) {
        messages.push({
          role,
          content: content.trim(),
          index: messages.length,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    return messages;
  };
  
  const canAnalyze = conversationText.trim().length > 50 && messageCount >= 2;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Paste Your Conversation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main input area */}
        <div className="space-y-2">
          <Textarea
            placeholder="Paste your ChatGPT or Claude conversation here...

Example:
Human: I need help with my React project
Assistant: I'd be happy to help! What specific aspect of your React project are you working on?"
            value={conversationText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="min-h-[200px] resize-y"
            disabled={isAnalyzing}
          />
          
          {/* Status indicators */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {detectedPlatform && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Detected: {detectedPlatform}</span>
                </div>
              )}
              {messageCount > 0 && (
                <Badge variant="secondary">
                  {messageCount} messages
                </Badge>
              )}
            </div>
            <div>
              {conversationText.length}/10000 characters
            </div>
          </div>
        </div>
        
        {/* Platform selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select value={platform} onValueChange={(value: Platform) => setPlatform(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="chatgpt">ChatGPT</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goal">Session Goal (Optional)</Label>
            <input
              id="goal"
              type="text"
              placeholder="e.g., Debug React component"
              value={sessionGoal}
              onChange={(e) => setSessionGoal(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isAnalyzing}
            />
          </div>
        </div>
        
        {/* Advanced settings */}
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
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 border-l-2 border-muted pl-4"
            >
              <div className="space-y-2">
                <Label htmlFor="context">Project Context (Optional)</Label>
                <Textarea
                  id="context"
                  placeholder="Describe your project or the context of this conversation..."
                  value={projectContext}
                  onChange={(e) => setProjectContext(e.target.value)}
                  className="min-h-[80px]"
                  disabled={isAnalyzing}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="pattern-detection"
                    checked={enablePatternDetection}
                    disabled={isAnalyzing}
                  />
                  <Label htmlFor="pattern-detection">Pattern Detection</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="claude-analysis"
                    checked={enableClaudeAnalysis}
                    disabled={isAnalyzing}
                  />
                  <Label htmlFor="claude-analysis">Enhanced Analysis</Label>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Analyze button */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleAnalyze}
            disabled={!canAnalyze || isAnalyzing}
            className={cn(
              "w-full h-12 text-base font-semibold",
              canAnalyze && !isAnalyzing && "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            )}
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="h-5 w-5" />
                </motion.div>
                Analyzing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Analyze Conversation
              </div>
            )}
          </Button>
          
          {!canAnalyze && conversationText.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span>
                {messageCount < 2 
                  ? "Need at least 2 messages to analyze" 
                  : "Conversation too short (minimum 50 characters)"
                }
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationInput;

