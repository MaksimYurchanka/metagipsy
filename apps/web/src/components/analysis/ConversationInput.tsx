import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  Loader2, 
  Sparkles, 
  Zap,
  Settings,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ConversationInputProps {
  onAnalyze: (analysisRequest: any) => void;
  isAnalyzing: boolean;
}

const ConversationInput: React.FC<ConversationInputProps> = ({
  onAnalyze,
  isAnalyzing
}) => {
  const [conversationText, setConversationText] = useState('');
  const [useClaudeAnalysis, setUseClaudeAnalysis] = useState(true);
  const [projectContext, setProjectContext] = useState('');
  const [sessionGoal, setSessionGoal] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const parseConversation = (text: string) => {
    const lines = text.trim().split('\n');
    const messages = [];
    let currentMessage = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Detect role indicators
      const humanMatch = trimmedLine.match(/^(Human|User|H):\s*(.*)$/i);
      const assistantMatch = trimmedLine.match(/^(Assistant|AI|Claude|ChatGPT|A):\s*(.*)$/i);
      
      if (humanMatch) {
        if (currentMessage) {
          messages.push(currentMessage);
        }
        currentMessage = {
          role: 'user' as const,
          content: humanMatch[2],
          timestamp: new Date().toISOString()
        };
      } else if (assistantMatch) {
        if (currentMessage) {
          messages.push(currentMessage);
        }
        currentMessage = {
          role: 'assistant' as const,
          content: assistantMatch[2],
          timestamp: new Date().toISOString()
        };
      } else if (currentMessage) {
        // Continue previous message
        currentMessage.content += '\n' + trimmedLine;
      }
    }
    
    if (currentMessage) {
      messages.push(currentMessage);
    }
    
    return messages;
  };

  const detectPlatform = (text: string): string => {
    if (text.toLowerCase().includes('claude')) return 'claude';
    if (text.toLowerCase().includes('chatgpt')) return 'chatgpt';
    return 'other';
  };

  const handleAnalyze = () => {
    if (!conversationText.trim()) {
      toast.error('Please paste your conversation first');
      return;
    }

    const messages = parseConversation(conversationText);
    
    if (messages.length === 0) {
      toast.error('No valid messages found. Please format as "Human: ... Assistant: ..."');
      return;
    }

    const platform = detectPlatform(conversationText);
    
    const analysisRequest = {
      conversation: {
        messages,
        platform
      },
      metadata: {
        projectContext: projectContext.trim() || undefined,
        sessionGoal: sessionGoal.trim() || undefined,
        timestamp: new Date().toISOString()
      },
      options: {
        useClaudeAnalysis,
        analysisDepth: 'standard' as const,
        enablePatternDetection: true
      }
    };

    console.log('🚀 Sending analysis request:', {
      messageCount: messages.length,
      platform,
      useClaudeAnalysis,
      hasContext: !!projectContext,
      hasGoal: !!sessionGoal
    });

    onAnalyze(analysisRequest);
  };

  const sampleConversation = `Human: I need to optimize my React application performance. Currently, my initial load time is 4.2 seconds on 3G, and I want to reduce it to under 1.5 seconds. My app has 15 components, uses Redux for state management, and serves 50MB of JavaScript bundles. What's the most effective optimization strategy focusing on bundle size reduction?