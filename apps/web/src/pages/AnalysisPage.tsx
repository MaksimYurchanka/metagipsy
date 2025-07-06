import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ConversationInput from '@/components/analysis/ConversationInput';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useAnalysisSettings } from '@/stores/settingsStore';
import { api } from '@/lib/api';
import { Message, AnalyzeRequest } from '@/types';

const AnalysisPage: React.FC = () => {
  const {
    messages,
    isAnalyzing,
    setMessages,
    setScores,
    setIsAnalyzing,
    setError,
    setProgress,
    setSessionSummary,
    setSessionMetadata
  } = useAnalysisStore();
  
  const { 
    defaultAnalysisDepth, 
    enablePatternDetection, 
    enableClaudeAnalysis 
  } = useAnalysisSettings();

  const handleAnalyze = async (newMessages: Message[]) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setMessages(newMessages);
      setProgress({ current: 0, total: newMessages.length });

      // Prepare analysis request
      const request: AnalyzeRequest = {
        conversation: {
          messages: newMessages,
          platform: 'auto' // Will be detected by backend
        },
        options: {
          useClaudeAnalysis: enableClaudeAnalysis,
          analysisDepth: defaultAnalysisDepth,
          enablePatternDetection: enablePatternDetection
        }
      };

      toast.info('Starting conversation analysis...');

      // For demo purposes, simulate the analysis with mock data
      // In production, this would call the actual API
      await simulateAnalysis(newMessages);

    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Simulate analysis for demo purposes
  const simulateAnalysis = async (messages: Message[]) => {
    const scores = [];
    
    for (let i = 0; i < messages.length; i++) {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock score
      const baseScore = 50 + Math.random() * 40; // 50-90 range
      const score = {
        overall: Math.round(baseScore),
        dimensions: {
          strategic: Math.round(baseScore + (Math.random() - 0.5) * 20),
          tactical: Math.round(baseScore + (Math.random() - 0.5) * 20),
          cognitive: Math.round(baseScore + (Math.random() - 0.5) * 20),
          innovation: Math.round(baseScore + (Math.random() - 0.5) * 20)
        },
        classification: getClassification(baseScore),
        chessNotation: getChessNotation(baseScore),
        confidence: 0.8 + Math.random() * 0.2,
        explanation: generateExplanation(messages[i], baseScore),
        betterMove: baseScore < 60 ? generateSuggestion(messages[i]) : undefined
      };
      
      scores.push(score);
      setProgress({ current: i + 1, total: messages.length });
      
      // Update scores incrementally for real-time feel
      setScores([...scores]);
    }

    // Set session metadata
    setSessionMetadata({
      platform: 'claude',
      sessionId: `session_${Date.now()}`,
      projectContext: 'Demo analysis'
    });

    // Generate session summary
    const summary = {
      sessionId: `session_${Date.now()}`,
      messageCount: messages.length,
      overallScore: Math.round(scores.reduce((sum, s) => sum + s.overall, 0) / scores.length),
      trend: 'improving' as const,
      bestScore: Math.max(...scores.map(s => s.overall)),
      worstScore: Math.min(...scores.map(s => s.overall)),
      dimensionAverages: {
        strategic: Math.round(scores.reduce((sum, s) => sum + s.dimensions.strategic, 0) / scores.length),
        tactical: Math.round(scores.reduce((sum, s) => sum + s.dimensions.tactical, 0) / scores.length),
        cognitive: Math.round(scores.reduce((sum, s) => sum + s.dimensions.cognitive, 0) / scores.length),
        innovation: Math.round(scores.reduce((sum, s) => sum + s.dimensions.innovation, 0) / scores.length)
      },
      patterns: [],
      insights: []
    };

    setSessionSummary(summary);
    toast.success('Analysis completed successfully!');
  };

  const getClassification = (score: number): any => {
    if (score >= 80) return 'brilliant';
    if (score >= 70) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    if (score >= 20) return 'mistake';
    return 'blunder';
  };

  const getChessNotation = (score: number): any => {
    if (score >= 80) return '!!';
    if (score >= 70) return '!';
    if (score >= 60) return '+';
    if (score >= 40) return '=';
    if (score >= 20) return '?';
    return '??';
  };

  const generateExplanation = (message: Message, score: number): string => {
    const explanations = {
      high: [
        "Excellent strategic thinking with clear goal alignment.",
        "Strong tactical approach with specific examples.",
        "Well-structured request with appropriate context.",
        "Creative problem-solving with innovative perspective."
      ],
      medium: [
        "Good approach but could be more specific.",
        "Solid foundation with room for improvement.",
        "Clear intent but lacks some tactical details.",
        "Reasonable request with adequate context."
      ],
      low: [
        "Lacks clarity and specific direction.",
        "Too vague to provide effective assistance.",
        "Missing important context for optimal response.",
        "Could benefit from more strategic thinking."
      ]
    };

    let category: keyof typeof explanations;
    if (score >= 70) category = 'high';
    else if (score >= 50) category = 'medium';
    else category = 'low';

    return explanations[category][Math.floor(Math.random() * explanations[category].length)];
  };

  const generateSuggestion = (message: Message): string => {
    const suggestions = [
      "Try being more specific about your goals and constraints.",
      "Provide more context about your project or situation.",
      "Break down complex requests into smaller, focused questions.",
      "Include examples or specific use cases to clarify your needs.",
      "State your experience level to get appropriately tailored advice."
    ];

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Conversation Analysis
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Paste your AI conversation below and get detailed chess-style scoring across 4 dimensions: 
          Strategic, Tactical, Cognitive, and Innovation.
        </p>
      </motion.div>

      {/* Analysis Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ConversationInput 
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {messages.length > 0 ? (
            <AnalysisResults />
          ) : (
            <div className="h-96 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-4xl">🎯</div>
                <h3 className="text-lg font-medium">Ready to Analyze</h3>
                <p className="text-muted-foreground">
                  Paste your conversation to see detailed scoring and insights
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
      >
        {[
          {
            icon: '🎯',
            title: 'Strategic Analysis',
            description: 'Goal alignment and progress tracking'
          },
          {
            icon: '⚔️',
            title: 'Tactical Scoring',
            description: 'Clarity, specificity, and actionability'
          },
          {
            icon: '🧠',
            title: 'Cognitive Assessment',
            description: 'Mental load and timing optimization'
          },
          {
            icon: '💡',
            title: 'Innovation Metrics',
            description: 'Creativity and breakthrough potential'
          }
        ].map((feature, index) => (
          <div
            key={index}
            className="text-center p-6 rounded-lg border bg-card hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default AnalysisPage;

