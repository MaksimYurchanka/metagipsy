import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ConversationInput from '@/components/analysis/ConversationInput';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import { useAnalysisStore } from '@/stores/analysisStore';
import { 
  useAnalysisDepth, 
  usePatternDetection, 
  useClaudeAnalysis 
} from '@/stores/settingsStore';
import { Message, AnalyzeRequest } from '@/types';

// ✅ FEATURES array OUTSIDE component to prevent recreation
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
  console.log('🔍 ANALYSIS PAGE v7: Starting render...');
  
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
  
  // ✅ FIXED: Individual selectors instead of object selectors
  const defaultAnalysisDepth = useAnalysisDepth();
  const enablePatternDetection = usePatternDetection();
  const enableClaudeAnalysis = useClaudeAnalysis();

  console.log('✅ ANALYSIS PAGE v7: Store subscriptions successful');

  // ✅ STABLE FUNCTION - useCallback prevents recreation
  const handleAnalyze = useCallback(async (newMessages: Message[]) => {
    console.log('🔍 ANALYSIS PAGE v7: Starting analysis with', newMessages.length, 'messages');
    
    try {
      setIsAnalyzing(true);
      setError(null);
      setMessages(newMessages);
      setProgress({ current: 0, total: newMessages.length });

      console.log('🔍 ANALYSIS PAGE v7: Analysis settings:', {
        depth: defaultAnalysisDepth,
        patterns: enablePatternDetection,
        claude: enableClaudeAnalysis
      });

      toast.info('Starting conversation analysis...');

      // For demo purposes, simulate the analysis with mock data
      await simulateAnalysis(newMessages);

    } catch (error) {
      console.error('❌ ANALYSIS PAGE v7: Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
      console.log('✅ ANALYSIS PAGE v7: Analysis completed');
    }
  }, [
    setIsAnalyzing, 
    setError, 
    setMessages, 
    setProgress, 
    defaultAnalysisDepth, 
    enablePatternDetection, 
    enableClaudeAnalysis
  ]);

  // ✅ SIMULATE ANALYSIS - All functionality preserved but stable
  const simulateAnalysis = useCallback(async (messages: Message[]) => {
    console.log('🔍 ANALYSIS PAGE v7: Simulating analysis for', messages.length, 'messages');
    
    const scores = [];
    
    // Generate all scores first - batch process to avoid state update loops
    for (let i = 0; i < messages.length; i++) {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate sophisticated mock score
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
      
      // ✅ SAFE: Update progress only
      setProgress({ current: i + 1, total: messages.length });
    }

    // ✅ SAFE: Set all scores at once to prevent infinite loop
    setScores(scores);

    // Set session metadata
    setSessionMetadata({
      platform: 'claude',
      sessionId: `session_${Date.now()}`,
      projectContext: 'Demo analysis'
    });

    // Generate session summary with sophisticated logic
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

  // ✅ Helper functions
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
      "Include examples or specific use cases to clarify your needs."
    ];

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

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
            description: `Detected ${consecutive + 1} consecutive improvements`
          });
        }
        consecutive = 0;
      }
    }
    
    return patterns;
  };

  const generateMockInsights = (scores: any[], messages: Message[]) => {
    const insights = [];
    const avgScore = scores.reduce((sum, s) => sum + s.overall, 0) / scores.length;
    
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
    
    return insights;
  };

  console.log('🔍 ANALYSIS PAGE v7: About to render, messages:', messages.length);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Conversation Analysis v7
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

      {/* Features grid */}
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