import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ConversationInput from '@/components/analysis/ConversationInput';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useAnalysisSettings } from '@/stores/settingsStore';
import { api } from '@/lib/api';
import { Message, AnalyzeRequest } from '@/types';

// ✅ FEATURES array OUTSIDE component to prevent recreation (from backup2)
const FEATURES = [
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
];

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

  // ✅ STABLE FUNCTION - useCallback prevents recreation
  const handleAnalyze = useCallback(async (newMessages: Message[]) => {
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
  }, [
    setIsAnalyzing, 
    setError, 
    setMessages, 
    setProgress, 
    enableClaudeAnalysis, 
    defaultAnalysisDepth, 
    enablePatternDetection
  ]);

  // ✅ FIXED: Simulate analysis without infinite loop but preserve ALL functionality
  const simulateAnalysis = useCallback(async (messages: Message[]) => {
    const scores = [];
    
    // Generate all scores first - batch process to avoid state update loops
    for (let i = 0; i < messages.length; i++) {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate mock score with all the sophisticated logic from backup2
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
      
      // ✅ SAFE: Update progress only - not causing loops
      setProgress({ current: i + 1, total: messages.length });
    }

    // ✅ SAFE: Set all scores at once to prevent infinite loop
    setScores(scores);

    // Set session metadata (preserved from backup2)
    setSessionMetadata({
      platform: 'claude',
      sessionId: `session_${Date.now()}`,
      projectContext: 'Demo analysis'
    });

    // Generate session summary with ALL the sophisticated logic from backup2
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
      patterns: generateMockPatterns(scores),
      insights: generateMockInsights(scores, messages)
    };

    setSessionSummary(summary);
    toast.success('Analysis completed successfully! 🎯');
  }, [setProgress, setScores, setSessionMetadata, setSessionSummary]);

  // ✅ PRESERVED: All helper functions from backup2
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
        "Creative problem-solving with innovative perspective.",
        "Clear communication with actionable specificity.",
        "Optimal use of AI capabilities and context."
      ],
      medium: [
        "Good approach but could be more specific.",
        "Solid foundation with room for improvement.",
        "Clear intent but lacks some tactical details.",
        "Reasonable request with adequate context.",
        "Decent communication with minor optimization opportunities.",
        "Functional but not maximizing potential effectiveness."
      ],
      low: [
        "Lacks clarity and specific direction.",
        "Too vague to provide effective assistance.",
        "Missing important context for optimal response.",
        "Could benefit from more strategic thinking.",
        "Unclear goals and desired outcomes.",
        "Needs better structure and specificity."
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
      "State your experience level to get appropriately tailored advice.",
      "Define success criteria for what you want to achieve.",
      "Specify the format or structure you want in the response.",
      "Include relevant background information or previous attempts."
    ];

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  // ✅ PRESERVED: Generate mock patterns based on scores (from backup2)
  const generateMockPatterns = (scores: any[]) => {
    const patterns = [];
    
    // Check for momentum pattern
    let consecutive = 0;
    for (let i = 1; i < scores.length; i++) {
      if (scores[i].overall > scores[i-1].overall) {
        consecutive++;
      } else {
        if (consecutive >= 2) {
          patterns.push({
            type: 'momentum',
            name: 'Building Momentum',
            startIndex: i - consecutive - 1,
            endIndex: i - 1,
            confidence: 0.85,
            description: `Detected ${consecutive + 1} consecutive improvements showing positive momentum`
          });
        }
        consecutive = 0;
      }
    }
    
    // Check for high performance pattern
    const highScores = scores.filter(s => s.overall >= 75).length;
    if (highScores / scores.length > 0.6) {
      patterns.push({
        type: 'excellence',
        name: 'Consistent Excellence',
        startIndex: 0,
        endIndex: scores.length - 1,
        confidence: 0.9,
        description: `${Math.round(highScores / scores.length * 100)}% of messages scored above 75 points`
      });
    }
    
    return patterns;
  };

  // ✅ PRESERVED: Generate mock insights based on analysis (from backup2)
  const generateMockInsights = (scores: any[], messages: Message[]) => {
    const insights = [];
    const avgScore = scores.reduce((sum, s) => sum + s.overall, 0) / scores.length;
    
    // Overall performance insight
    if (avgScore >= 75) {
      insights.push({
        type: 'celebration',
        title: 'Excellent Communication Quality',
        description: 'Your conversation demonstrates strong strategic thinking and clear communication patterns.',
        priority: 'medium',
        actionable: false
      });
    } else if (avgScore < 50) {
      insights.push({
        type: 'improvement',
        title: 'Communication Enhancement Opportunity',
        description: 'Consider being more specific and providing clearer context in your requests.',
        priority: 'high',
        actionable: true
      });
    }
    
    // Pattern-based insights
    const lowScores = scores.filter(s => s.overall < 40).length;
    if (lowScores > 0) {
      insights.push({
        type: 'warning',
        title: 'Optimization Opportunities Detected',
        description: `${lowScores} messages could benefit from improved structure and clarity.`,
        priority: 'medium',
        actionable: true
      });
    }
    
    // Positive feedback
    const brilliantMoves = scores.filter(s => s.overall >= 80).length;
    if (brilliantMoves > 0) {
      insights.push({
        type: 'celebration',
        title: 'Brilliant Moves Identified',
        description: `${brilliantMoves} messages demonstrated exceptional strategic thinking!`,
        priority: 'low',
        actionable: false
      });
    }
    
    return insights;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ✅ PRESERVED: Header with animations (from backup2) */}
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

      {/* ✅ PRESERVED: Analysis Interface (from backup2) */}
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

      {/* ✅ PRESERVED: Features grid using FEATURES constant (from backup2) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
      >
        {FEATURES.map((feature, index) => (
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