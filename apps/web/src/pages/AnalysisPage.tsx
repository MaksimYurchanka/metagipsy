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
import { api } from '@/lib/api';
import { Message } from '@/types';

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
  console.log('🚀 ANALYSIS PAGE v8: Starting render with Claude integration...');
  
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

  console.log('✅ ANALYSIS PAGE v8: Store subscriptions successful');

  // ✅ NEW: Handle the analysisRequest structure from ConversationInput
  const handleAnalyze = useCallback(async (analysisRequest: any) => {
    console.log('🚀 ANALYSIS PAGE v8: Received analysisRequest:', analysisRequest);
    
    // ✅ EXTRACT: Get messages from the request structure
    const newMessages = analysisRequest?.conversation?.messages || [];
    const options = analysisRequest?.options || {};
    const metadata = analysisRequest?.metadata || {};
    
    console.log('🚀 ANALYSIS PAGE v8: Extracted data:', {
      messageCount: newMessages.length,
      useClaudeAnalysis: options.useClaudeAnalysis,
      analysisDepth: options.analysisDepth,
      platform: analysisRequest?.conversation?.platform
    });
    
    if (!newMessages || newMessages.length === 0) {
      console.error('❌ ANALYSIS PAGE v8: No messages found in request');
      toast.error('No messages to analyze');
      return;
    }
    
    try {
      setIsAnalyzing(true);
      setError(null);
      setMessages(newMessages);
      setProgress({ current: 0, total: newMessages.length });

      // Set session metadata from the request
      setSessionMetadata({
        platform: analysisRequest?.conversation?.platform || 'unknown',
        sessionId: `session_${Date.now()}`,
        projectContext: metadata.projectContext,
        sessionGoal: metadata.sessionGoal,
        timestamp: metadata.timestamp || new Date().toISOString()
      });

      toast.info(`Starting ${options.useClaudeAnalysis ? 'AI-powered' : 'local'} conversation analysis...`);

      // ✅ CLAUDE API INTEGRATION: Use real API if Claude is enabled
      if (options.useClaudeAnalysis) {
        console.log('🤖 ANALYSIS PAGE v8: Using Claude API for analysis');
        await performClaudeAnalysis(analysisRequest);
      } else {
        console.log('⚡ ANALYSIS PAGE v8: Using local analysis engine');
        await performLocalAnalysis(newMessages, options);
      }

    } catch (error) {
      console.error('❌ ANALYSIS PAGE v8: Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
      console.log('✅ ANALYSIS PAGE v8: Analysis completed');
    }
  }, []);

  // ✅ NEW: Real Claude API analysis
  const performClaudeAnalysis = useCallback(async (analysisRequest: any) => {
    console.log('🤖 CLAUDE API: Starting real analysis...');
    
    try {
      // ✅ FIX: Use the correct API method
      const response = await api.analyzeConversation(analysisRequest);
      console.log('🤖 CLAUDE API: Received response:', response);
      
      if (response?.scores) {
        // ✅ Handle real API response
        setScores(response.scores);
        
        if (response.summary) {
          setSessionSummary(response.summary);
        }
        
        toast.success('AI analysis completed successfully! 🧠✨');
      } else {
        throw new Error('Invalid response from analysis API');
      }
      
    } catch (error) {
      console.error('❌ CLAUDE API: Failed, falling back to local analysis:', error);
      toast.warning('AI analysis unavailable, using local analysis...');
      
      // Fallback to local analysis
      await performLocalAnalysis(analysisRequest.conversation.messages, analysisRequest.options);
    }
  }, []);

  // ✅ ENHANCED: Local analysis with better simulation
  const performLocalAnalysis = useCallback(async (messages: Message[], options: any) => {
    console.log('⚡ LOCAL ANALYSIS: Starting simulation for', messages.length, 'messages');
    
    const scores = [];
    
    // Generate sophisticated mock scores
    for (let i = 0; i < messages.length; i++) {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Generate more realistic scores based on message content
      const messageLength = messages[i].content.length;
      const hasQuestions = (messages[i].content.match(/\?/g) || []).length;
      const hasSpecifics = /\b\d+\b|example|specific|exactly/.test(messages[i].content.toLowerCase());
      
      // Base score calculation with content analysis
      let baseScore = 50;
      if (messageLength > 100) baseScore += 10;
      if (messageLength > 300) baseScore += 10;
      if (hasQuestions > 0) baseScore += 5;
      if (hasSpecifics) baseScore += 15;
      if (messages[i].role === 'user' && messageLength < 20) baseScore -= 20;
      
      // Add randomness
      baseScore += (Math.random() - 0.5) * 30;
      baseScore = Math.max(20, Math.min(95, baseScore));
      
      const score = {
        overall: Math.round(baseScore),
        dimensions: {
          strategic: Math.round(Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 20))),
          tactical: Math.round(Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 20))),
          cognitive: Math.round(Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 20))),
          innovation: Math.round(Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 20)))
        },
        classification: getClassification(baseScore),
        chessNotation: getChessNotation(baseScore),
        confidence: 0.7 + Math.random() * 0.2, // Local analysis lower confidence
        explanation: generateExplanation(messages[i], baseScore),
        betterMove: baseScore < 60 ? generateSuggestion(messages[i]) : undefined
      };
      
      scores.push(score);
      
      // Update progress
      setProgress({ current: i + 1, total: messages.length });
    }

    // Set all scores at once
    setScores(scores);

    // Generate comprehensive session summary
    const summary = {
      sessionId: `session_${Date.now()}`,
      messageCount: messages.length,
      overallScore: Math.round(scores.reduce((sum, s) => sum + s.overall, 0) / scores.length),
      trend: calculateTrend(scores),
      bestScore: Math.max(...scores.map(s => s.overall)),
      worstScore: Math.min(...scores.map(s => s.overall)),
      dimensionAverages: {
        strategic: Math.round(scores.reduce((sum, s) => sum + s.dimensions.strategic, 0) / scores.length),
        tactical: Math.round(scores.reduce((sum, s) => sum + s.dimensions.tactical, 0) / scores.length),
        cognitive: Math.round(scores.reduce((sum, s) => sum + s.dimensions.cognitive, 0) / scores.length),
        innovation: Math.round(scores.reduce((sum, s) => sum + s.dimensions.innovation, 0) / scores.length)
      },
      patterns: generateAdvancedPatterns(scores),
      insights: generateAdvancedInsights(scores, messages)
    };

    setSessionSummary(summary);
    toast.success('Local analysis completed successfully! 🎯');
  }, []);

  // ✅ Helper functions
  const getClassification = (score: number): string => {
    if (score >= 80) return 'brilliant';
    if (score >= 70) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    if (score >= 20) return 'mistake';
    return 'blunder';
  };

  const getChessNotation = (score: number): string => {
    if (score >= 80) return '!!';
    if (score >= 70) return '!';
    if (score >= 60) return '+';
    if (score >= 40) return '=';
    if (score >= 20) return '?';
    return '??';
  };

  const calculateTrend = (scores: any[]): 'improving' | 'declining' | 'stable' => {
    if (scores.length < 3) return 'stable';
    
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, s) => sum + s.overall, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s.overall, 0) / secondHalf.length;
    
    const diff = secondAvg - firstAvg;
    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  };

  const generateExplanation = (message: Message, score: number): string => {
    const explanations = {
      high: [
        "Excellent strategic thinking with clear goal alignment and specific context.",
        "Strong tactical approach with concrete examples and actionable requests.",
        "Well-structured communication that maximizes AI collaboration potential.",
        "Creative problem-solving with innovative perspective and clear direction.",
        "Optimal use of AI capabilities with precise, contextual questioning."
      ],
      medium: [
        "Good approach but could benefit from more specificity and context.",
        "Solid foundation with clear intent, room for tactical improvements.",
        "Reasonable request with adequate context, could be more strategic.",
        "Decent communication with minor optimization opportunities available.",
        "Functional interaction that could be enhanced for better results."
      ],
      low: [
        "Lacks clarity and specific direction, needs more strategic thinking.",
        "Too vague to provide effective assistance, requires better structure.",
        "Missing important context for optimal AI response and collaboration.",
        "Could benefit from more tactical precision and clear objectives.",
        "Needs improved communication structure and specific goal definition."
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
      "Try being more specific about your goals, constraints, and desired outcomes.",
      "Provide additional context about your project, experience level, and situation.",
      "Break down complex requests into smaller, focused questions with clear scope.",
      "Include concrete examples or specific use cases to clarify your requirements.",
      "State your experience level and preferred response format for better assistance.",
      "Define success criteria and any constraints that should guide the response.",
      "Specify the format, depth, or structure you want in the AI's response.",
      "Include relevant background information or details about previous attempts."
    ];

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const generateAdvancedPatterns = (scores: any[]) => {
    const patterns = [];
    
    // Momentum pattern detection
    let consecutiveImprovement = 0;
    for (let i = 1; i < scores.length; i++) {
      if (scores[i].overall > scores[i-1].overall) {
        consecutiveImprovement++;
      } else {
        if (consecutiveImprovement >= 2) {
          patterns.push({
            type: 'momentum',
            name: 'Building Momentum',
            startIndex: i - consecutiveImprovement - 1,
            endIndex: i - 1,
            confidence: 0.85,
            description: `${consecutiveImprovement + 1} consecutive improvements showing positive learning trajectory`
          });
        }
        consecutiveImprovement = 0;
      }
    }
    
    // Excellence pattern
    const excellentMoves = scores.filter(s => s.overall >= 75).length;
    if (excellentMoves / scores.length > 0.6) {
      patterns.push({
        type: 'excellence',
        name: 'Consistent Excellence',
        startIndex: 0,
        endIndex: scores.length - 1,
        confidence: 0.9,
        description: `${Math.round(excellentMoves / scores.length * 100)}% of messages demonstrate high-quality communication`
      });
    }
    
    // Strategic depth pattern
    const strategicScores = scores.map(s => s.dimensions.strategic);
    const avgStrategic = strategicScores.reduce((sum, s) => sum + s, 0) / strategicScores.length;
    if (avgStrategic > 75) {
      patterns.push({
        type: 'strategic',
        name: 'Strategic Mastery',
        startIndex: 0,
        endIndex: scores.length - 1,
        confidence: 0.8,
        description: 'Consistently demonstrates strong strategic thinking and goal alignment'
      });
    }
    
    return patterns;
  };

  const generateAdvancedInsights = (scores: any[], messages: Message[]) => {
    const insights = [];
    const avgScore = scores.reduce((sum, s) => sum + s.overall, 0) / scores.length;
    
    // Performance insights
    if (avgScore >= 80) {
      insights.push({
        type: 'celebration',
        title: 'Exceptional Communication Mastery',
        description: 'Your conversation demonstrates sophisticated AI collaboration skills with strategic depth.',
        priority: 'medium',
        actionable: false
      });
    } else if (avgScore >= 65) {
      insights.push({
        type: 'positive',
        title: 'Strong Communication Foundation',
        description: 'Good overall quality with opportunities for tactical refinement and optimization.',
        priority: 'low',
        actionable: true
      });
    } else if (avgScore < 50) {
      insights.push({
        type: 'improvement',
        title: 'Communication Enhancement Opportunity',
        description: 'Focus on specificity, context, and clear goal articulation for better AI collaboration.',
        priority: 'high',
        actionable: true
      });
    }
    
    // Pattern-based insights
    const brilliantMoves = scores.filter(s => s.overall >= 80).length;
    if (brilliantMoves > 0) {
      insights.push({
        type: 'celebration',
        title: `${brilliantMoves} Brilliant Move${brilliantMoves > 1 ? 's' : ''} Detected`,
        description: 'These exchanges demonstrate exceptional strategic thinking and communication excellence!',
        priority: 'low',
        actionable: false
      });
    }
    
    // Dimension-specific insights
    const dimensionAvgs = {
      strategic: scores.reduce((sum, s) => sum + s.dimensions.strategic, 0) / scores.length,
      tactical: scores.reduce((sum, s) => sum + s.dimensions.tactical, 0) / scores.length,
      cognitive: scores.reduce((sum, s) => sum + s.dimensions.cognitive, 0) / scores.length,
      innovation: scores.reduce((sum, s) => sum + s.dimensions.innovation, 0) / scores.length
    };
    
    const weakestDimension = Object.entries(dimensionAvgs).reduce((min, [key, value]) => 
      value < min[1] ? [key, value] : min
    );
    
    if (weakestDimension[1] < 60) {
      insights.push({
        type: 'improvement',
        title: `${weakestDimension[0].charAt(0).toUpperCase() + weakestDimension[0].slice(1)} Enhancement Opportunity`,
        description: `Focus on improving your ${weakestDimension[0]} dimension for more effective AI collaboration.`,
        priority: 'medium',
        actionable: true
      });
    }
    
    return insights;
  };

  console.log('🚀 ANALYSIS PAGE v8: About to render, messages:', messages.length);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          MetaGipsy Chess Engine v8
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Advanced AI conversation analysis with chess-style scoring. 
          Paste your conversation and get strategic insights with Claude AI or local analysis.
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
                  Paste your conversation to see detailed chess-style scoring and strategic insights
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