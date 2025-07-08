import React, { useState } from 'react';
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
  console.log('🚀 ANALYSIS PAGE v10: Starting render (ULTRA STABLE version)...');
  
  // ✅ ULTRA STABLE: Direct store access without complex subscriptions
  const messages = useAnalysisStore((state) => state.messages || []);
  const isAnalyzing = useAnalysisStore((state) => state.isAnalyzing);
  
  // ✅ STABLE: Settings without object destructuring
  const claudeEnabled = useClaudeAnalysis();
  
  console.log('✅ ANALYSIS PAGE v10: Store subscriptions successful, messages:', messages.length);

  // ✅ NO useCallback! Simple function to prevent React Error #310
  const handleAnalyze = async (analysisRequest: any) => {
    console.log('🚀 ANALYSIS PAGE v10: Received analysisRequest:', analysisRequest);
    
    // Extract data from request
    const newMessages = analysisRequest?.conversation?.messages || [];
    const options = analysisRequest?.options || {};
    const metadata = analysisRequest?.metadata || {};
    
    console.log('🚀 ANALYSIS PAGE v10: Extracted data:', {
      messageCount: newMessages.length,
      useClaudeAnalysis: options.useClaudeAnalysis,
      platform: analysisRequest?.conversation?.platform
    });
    
    if (!newMessages || newMessages.length === 0) {
      console.error('❌ ANALYSIS PAGE v10: No messages found');
      toast.error('No messages to analyze');
      return;
    }
    
    try {
      // ✅ DIRECT: Use store actions directly without complex state management
      const store = useAnalysisStore.getState();
      
      // ✅ CLEAR previous session data before starting new analysis
      console.log('🧹 ANALYSIS PAGE v10: Clearing previous session');
      store.clearSession();
      
      store.setIsAnalyzing(true);
      store.setError(null);
      store.setMessages(newMessages);
      
      // Set metadata
      store.setSessionMetadata({
        platform: analysisRequest?.conversation?.platform || 'unknown',
        sessionId: `session_${Date.now()}`,
        projectContext: metadata.projectContext,
        sessionGoal: metadata.sessionGoal,
        timestamp: metadata.timestamp || new Date().toISOString()
      });

      toast.info(`Starting ${options.useClaudeAnalysis ? 'AI-powered' : 'local'} conversation analysis...`);

      if (options.useClaudeAnalysis) {
        console.log('🤖 ANALYSIS PAGE v10: Using Claude API');
        await performClaudeAnalysis(analysisRequest, store);
      } else {
        console.log('⚡ ANALYSIS PAGE v10: Using local analysis');
        await performLocalAnalysis(newMessages, store);
      }

    } catch (error) {
      console.error('❌ ANALYSIS PAGE v10: Analysis failed:', error);
      const store = useAnalysisStore.getState();
      store.setError(error instanceof Error ? error.message : 'Analysis failed');
      toast.error('Analysis failed. Please try again.');
    } finally {
      const store = useAnalysisStore.getState();
      store.setIsAnalyzing(false);
      console.log('✅ ANALYSIS PAGE v10: Analysis completed');
    }
  };

  console.log('🚀 ANALYSIS PAGE v10: About to render, messages:', messages.length);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          MetaGipsy Chess Engine v10
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

// ✅ EXTERNAL FUNCTIONS: Move outside component to prevent recreation
async function performClaudeAnalysis(analysisRequest: any, store: any) {
  console.log('🤖 CLAUDE API: Starting real analysis...');
  
  try {
    const response = await api.analyzeConversation(analysisRequest);
    console.log('🤖 CLAUDE API: Received response:', response);
    
    // ✅ ENHANCED: Handle different response formats safely
    let scores = null;
    let summary = null;
    
    // Handle different response structures
    if (response?.scores) {
      scores = response.scores;
      summary = response.summary;
    } else if (Array.isArray(response)) {
      // If response is array, treat as scores
      scores = response;
    } else if (response?.data?.scores) {
      // Nested data structure
      scores = response.data.scores;
      summary = response.data.summary;
    }
    
    if (scores && Array.isArray(scores)) {
      console.log('🤖 CLAUDE API: Processing scores:', scores.length);
      
      // ✅ ENSURE proper score format with full normalization
      const processedScores = scores.map((score, index) => {
        // Ensure all required fields exist with proper fallbacks
        const normalizedScore = {
          overall: typeof score?.overall === 'number' ? score.overall : 50,
          dimensions: {
            strategic: score?.dimensions?.strategic || 50,
            tactical: score?.dimensions?.tactical || 50,
            cognitive: score?.dimensions?.cognitive || 50,
            innovation: score?.dimensions?.innovation || 50
          },
          classification: score?.classification || 'average',
          chessNotation: score?.chessNotation || '=',
          confidence: typeof score?.confidence === 'number' ? score.confidence : 0.7,
          explanation: score?.explanation || 'Analysis completed',
          betterMove: score?.betterMove || undefined
        };
        
        console.log(`🎯 CLAUDE API: Normalized score ${index}:`, normalizedScore);
        return normalizedScore;
      });
      
      store.setScores(processedScores);
      
      if (summary) {
        store.setSessionSummary(summary);
      }
      
      toast.success('AI analysis completed successfully! 🧠✨');
    } else {
      throw new Error('Invalid response format: missing scores array');
    }
    
  } catch (error) {
    console.error('❌ CLAUDE API: Failed, falling back to local analysis:', error);
    toast.warning('AI analysis unavailable, using local analysis...');
    
    // Fallback to local analysis
    await performLocalAnalysis(analysisRequest.conversation.messages, store);
  }
}

async function performLocalAnalysis(messages: Message[], store: any) {
  console.log('⚡ LOCAL ANALYSIS: Starting simulation for', messages.length, 'messages');
  
  const scores = [];
  
  // Generate sophisticated mock scores
  for (let i = 0; i < messages.length; i++) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate realistic scores based on message content
    const messageLength = messages[i]?.content?.length || 0;
    const hasQuestions = (messages[i]?.content?.match(/\?/g) || []).length;
    const hasSpecifics = /\b\d+\b|example|specific|exactly/.test(messages[i]?.content?.toLowerCase() || '');
    
    // Base score calculation
    let baseScore = 50;
    if (messageLength > 100) baseScore += 10;
    if (messageLength > 300) baseScore += 10;
    if (hasQuestions > 0) baseScore += 5;
    if (hasSpecifics) baseScore += 15;
    if (messages[i]?.role === 'user' && messageLength < 20) baseScore -= 20;
    
    // Add controlled randomness
    baseScore += (Math.random() - 0.5) * 20;
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
      confidence: 0.7 + Math.random() * 0.2,
      explanation: generateExplanation(messages[i], baseScore),
      betterMove: baseScore < 60 ? generateSuggestion(messages[i]) : undefined
    };
    
    scores.push(score);
    
    // Update progress
    store.setProgress({ current: i + 1, total: messages.length });
  }

  // Set all scores at once
  store.setScores(scores);

  // Generate session summary
  const summary = {
    sessionId: `session_${Date.now()}`,
    messageCount: messages.length,
    overallScore: Math.round(scores.reduce((sum, s) => sum + (s.overall || 0), 0) / scores.length),
    trend: calculateTrend(scores),
    bestScore: Math.max(...scores.map(s => s.overall || 0)),
    worstScore: Math.min(...scores.map(s => s.overall || 100)),
    dimensionAverages: {
      strategic: Math.round(scores.reduce((sum, s) => sum + (s.dimensions?.strategic || 0), 0) / scores.length),
      tactical: Math.round(scores.reduce((sum, s) => sum + (s.dimensions?.tactical || 0), 0) / scores.length),
      cognitive: Math.round(scores.reduce((sum, s) => sum + (s.dimensions?.cognitive || 0), 0) / scores.length),
      innovation: Math.round(scores.reduce((sum, s) => sum + (s.dimensions?.innovation || 0), 0) / scores.length)
    },
    patterns: [],
    insights: []
  };

  store.setSessionSummary(summary);
  toast.success('Local analysis completed successfully! 🎯');
}

// ✅ HELPER FUNCTIONS - moved outside to prevent recreation
function getClassification(score: number): string {
  if (score >= 80) return 'brilliant';
  if (score >= 70) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'average';
  if (score >= 20) return 'mistake';
  return 'blunder';
}

function getChessNotation(score: number): string {
  if (score >= 80) return '!!';
  if (score >= 70) return '!';
  if (score >= 60) return '+';
  if (score >= 40) return '=';
  if (score >= 20) return '?';
  return '??';
}

function calculateTrend(scores: any[]): 'improving' | 'declining' | 'stable' {
  if (scores.length < 3) return 'stable';
  
  const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, s) => sum + (s.overall || 0), 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, s) => sum + (s.overall || 0), 0) / secondHalf.length;
  
  const diff = secondAvg - firstAvg;
  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}

function generateExplanation(message: Message, score: number): string {
  const explanations = {
    high: [
      "Excellent strategic thinking with clear goal alignment.",
      "Strong tactical approach with specific examples.",
      "Well-structured request with appropriate context."
    ],
    medium: [
      "Good approach but could be more specific.",
      "Solid foundation with room for improvement.",
      "Clear intent but lacks some tactical details."
    ],
    low: [
      "Lacks clarity and specific direction.",
      "Too vague to provide effective assistance.",
      "Missing important context for optimal response."
    ]
  };

  let category: keyof typeof explanations;
  if (score >= 70) category = 'high';
  else if (score >= 50) category = 'medium';
  else category = 'low';

  return explanations[category][Math.floor(Math.random() * explanations[category].length)];
}

function generateSuggestion(message: Message): string {
  const suggestions = [
    "Try being more specific about your goals and constraints.",
    "Provide more context about your project or situation.",
    "Break down complex requests into smaller, focused questions.",
    "Include examples or specific use cases to clarify your needs."
  ];

  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

export default AnalysisPage;