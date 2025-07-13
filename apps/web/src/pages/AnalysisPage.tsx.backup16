import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ConversationInput from '@/components/analysis/ConversationInput';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import { useAnalysisStore } from '@/stores/analysisStore';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
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
  console.log('🚀 ANALYSIS PAGE: Starting PROTECTED render...');
  
  // ✅ ПОЛУЧАЕМ AUTH STATE с полным логгированием
  const { user, isAuthenticated, loading } = useAuth();
  
  // ✅ ULTRA STABLE: Direct store access without complex subscriptions
  const messages = useAnalysisStore((state) => state.messages || []);
  const scores = useAnalysisStore((state) => state.scores || []);
  const sessionSummary = useAnalysisStore((state) => state.sessionSummary);
  const sessionMetadata = useAnalysisStore((state) => state.sessionMetadata);
  const isAnalyzing = useAnalysisStore((state) => state.isAnalyzing);
  
  console.log('✅ ANALYSIS PAGE: Store subscriptions successful, messages:', messages.length);

  // ✅ COMPREHENSIVE AUTH STATE LOGGING
  useEffect(() => {
    console.log('🔍 AUTH STATE MONITOR:', {
      timestamp: new Date().toISOString(),
      isAuthenticated,
      loading,
      hasUser: !!user,
      userId: user?.id || 'none',
      userEmail: user?.email || 'none',
      userMetadata: user?.user_metadata || 'none'
    });
  }, [isAuthenticated, loading, user]);

  // ✅ SUPABASE SESSION VALIDATOR
  const validateSupabaseSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('🔍 SUPABASE SESSION CHECK:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id || 'none',
        userEmail: session?.user?.email || 'none',
        tokenExists: !!session?.access_token,
        error: error?.message || 'none'
      });
      return session;
    } catch (error) {
      console.error('❌ SUPABASE SESSION ERROR:', error);
      return null;
    }
  };

  // ✅ STREAMLINED FUNCTION: Автосохранение с Supabase primary auth
  const saveSessionToDatabase = async (analysisRequest: any, store: any) => {
    const saveStartTime = Date.now();
    console.log('💾 SESSION SAVE: Starting database save process...');
    
    // ✅ PRIMARY AUTH: Supabase session check (most reliable)
    const supabaseSession = await validateSupabaseSession();
    
    if (!supabaseSession?.user) {
      console.log('🔐 NO VALID SESSION - skipping session save:', {
        hasSession: !!supabaseSession,
        hasUser: !!supabaseSession?.user,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // ✅ PROCEED WITH SUPABASE SESSION DATA (always reliable)
    console.log('✅ SUPABASE AUTH VERIFIED - proceeding with session save:', {
      userId: supabaseSession.user.id,
      userEmail: supabaseSession.user.email,
      timestamp: new Date().toISOString()
    });
    
    return await performSessionSave(analysisRequest, store, {
      id: supabaseSession.user.id,
      email: supabaseSession.user.email
    }, saveStartTime);
  };

  // ✅ EXTRACTED SAVE LOGIC with timing
  const performSessionSave = async (analysisRequest: any, store: any, userData: any, startTime: number) => {
    try {
      // 🔧 CRITICAL FIX: Get fresh store state instead of using stale parameter
      const currentStore = useAnalysisStore.getState();
      
      const sessionData = {
        // Session metadata
        title: `${analysisRequest?.conversation?.platform || 'Unknown'} Analysis - ${new Date().toLocaleDateString()}`,
        platform: analysisRequest?.conversation?.platform || 'OTHER',
        
        // ✅ FIXED: Using fresh store data instead of stale parameter
        messageCount: currentStore.messages?.length || 0,
        overallScore: currentStore.sessionSummary?.overallScore || 0,
        
        // Dimension averages from summary
        strategicAvg: currentStore.sessionSummary?.dimensionAverages?.strategic || 0,
        tacticalAvg: currentStore.sessionSummary?.dimensionAverages?.tactical || 0,
        cognitiveAvg: currentStore.sessionSummary?.dimensionAverages?.cognitive || 0,
        innovationAvg: currentStore.sessionSummary?.dimensionAverages?.innovation || 0,
        
        // Complete session data in metadata
        metadata: {
          projectContext: analysisRequest?.metadata?.projectContext,
          sessionGoal: analysisRequest?.metadata?.sessionGoal,
          timestamp: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          overallScore: currentStore.sessionSummary?.overallScore || 0,
          messageCount: currentStore.messages?.length || 0,
          trend: currentStore.sessionSummary?.trend || 'stable',
          dimensionAverages: currentStore.sessionSummary?.dimensionAverages || {},
          patterns: currentStore.sessionSummary?.patterns || [],
          insights: currentStore.sessionSummary?.insights || [],
          
          // Store complete messages with scores for export
          messages: currentStore.messages?.map((msg: any, index: number) => ({
            index,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp || new Date().toISOString(),
            scores: [{
              overall: currentStore.scores?.[index]?.overall || 0,
              dimensions: currentStore.scores?.[index]?.dimensions || {
                strategic: 0, tactical: 0, cognitive: 0, innovation: 0
              },
              classification: currentStore.scores?.[index]?.classification || 'average',
              chessNotation: currentStore.scores?.[index]?.chessNotation || '=',
              explanation: currentStore.scores?.[index]?.explanation || '',
              betterMove: currentStore.scores?.[index]?.betterMove,
              confidence: currentStore.scores?.[index]?.confidence || 0.5
            }]
          })) || []
        }
      };

      console.log('💾 SESSION DATA PREPARED:', {
        userId: userData.id,
        userEmail: userData.email,
        messageCount: sessionData.messageCount,
        overallScore: sessionData.overallScore,
        platform: sessionData.platform,
        preparationTime: Date.now() - startTime
      });

      console.log('🌐 API CALL: Sending session to backend...');
      const apiStartTime = Date.now();
      
      const response = await api.saveSession(sessionData);
      
      const apiEndTime = Date.now();
      console.log('🌐 API RESPONSE:', {
        success: response.success,
        sessionId: response.sessionId,
        responseTime: apiEndTime - apiStartTime,
        totalTime: apiEndTime - startTime
      });
      
      if (response.success) {
        console.log('✅ SESSION SAVE SUCCESS:', {
          sessionId: response.sessionId,
          totalProcessingTime: Date.now() - startTime
        });
        toast.success('📊 Analysis saved to your dashboard!');
      } else {
        throw new Error('Server returned unsuccessful response');
      }

    } catch (error) {
      console.error('❌ SESSION SAVE ERROR:', {
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        userId: userData.id,
        userEmail: userData.email,
        totalTime: Date.now() - startTime,
        stack: error instanceof Error ? error.stack : 'no stack'
      });
      
      toast.error('Failed to save analysis. Please try again.');
    }
  };

  // ✅ UPDATED: Analysis handler with comprehensive timing
  const handleAnalyze = async (analysisRequest: any) => {
    const analyzeStartTime = Date.now();
    console.log('🚀 ANALYSIS PAGE: Starting analysis process...', {
      timestamp: new Date().toISOString(),
      requestSize: JSON.stringify(analysisRequest).length
    });
    
    const newMessages = analysisRequest?.conversation?.messages || [];
    const options = analysisRequest?.options || {};
    const metadata = analysisRequest?.metadata || {};
    
    console.log('🔍 ANALYZE REQUEST DETAILS:', {
      messageCount: newMessages.length,
      platform: analysisRequest?.conversation?.platform,
      useClaudeAnalysis: options.useClaudeAnalysis,
      hasProjectContext: !!metadata.projectContext,
      hasSessionGoal: !!metadata.sessionGoal
    });
    
    if (!newMessages || newMessages.length === 0) {
      console.error('❌ ANALYSIS PAGE: No messages found');
      toast.error('No messages to analyze');
      return;
    }
    
    try {
      const store = useAnalysisStore.getState();
      
      // Clear previous session
      console.log('🧹 ANALYSIS PAGE: Clearing previous session');
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

      // Perform analysis
      const analysisStartTime = Date.now();
      if (options.useClaudeAnalysis) {
        console.log('🤖 ANALYSIS PAGE: Using Claude API');
        toast.info('Starting AI-powered analysis with Claude...');
        await performClaudeAnalysis(analysisRequest, store);
      } else {
        console.log('⚡ ANALYSIS PAGE: Using local analysis');
        toast.info('Starting local analysis...');
        await performLocalAnalysis(newMessages, store);
      }
      
      const analysisEndTime = Date.now();
      console.log('📊 ANALYSIS COMPLETED:', {
        analysisTime: analysisEndTime - analysisStartTime,
        totalMessages: newMessages.length,
        avgTimePerMessage: (analysisEndTime - analysisStartTime) / newMessages.length
      });

      // ✅ AUTO-SAVE with timing tracking
      console.log('💾 ANALYSIS PAGE: Starting auto-save to database...');
      const saveStartTime = Date.now();
      
      await saveSessionToDatabase(analysisRequest, store);
      
      console.log('💾 AUTO-SAVE COMPLETED:', {
        saveTime: Date.now() - saveStartTime,
        totalProcessTime: Date.now() - analyzeStartTime
      });

    } catch (error) {
      console.error('❌ ANALYSIS PAGE: Analysis failed:', {
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        totalTime: Date.now() - analyzeStartTime,
        stack: error instanceof Error ? error.stack : 'no stack'
      });
      
      const store = useAnalysisStore.getState();
      store.setError(error instanceof Error ? error.message : 'Analysis failed');
      toast.error('Analysis failed. Please try again.');
    } finally {
      const store = useAnalysisStore.getState();
      store.setIsAnalyzing(false);
      console.log('✅ ANALYSIS PAGE: Process completed', {
        totalTime: Date.now() - analyzeStartTime
      });
    }
  };

  console.log('🚀 ANALYSIS PAGE: About to render, messages:', messages.length);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          MetaGipsy Chess Engine
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Advanced AI conversation analysis with chess-style scoring. 
          Paste your conversation and get strategic insights with Claude AI or local analysis.
        </p>
        
        {/* ✅ ENHANCED AUTH STATUS with debug info */}
        {loading ? (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse" />
            Checking authentication...
          </div>
        ) : isAuthenticated ? (
          <>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              You're signed in and ready to analyze!
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-sm ml-2">
              📊 Analysis will be saved to your dashboard
            </div>
          </>
        ) : (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-sm">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
            Not authenticated - analysis won't be saved
          </div>
        )}
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
            key={feature.title}
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

// ✅ CLAUDE ANALYSIS FUNCTION with enhanced logging
async function performClaudeAnalysis(analysisRequest: any, store: any) {
  console.log('🤖 CLAUDE API: Starting real analysis...');
  const claudeStartTime = Date.now();
  
  try {
    const response = await api.analyzeConversation(analysisRequest);
    const claudeResponseTime = Date.now() - claudeStartTime;
    
    console.log('🤖 CLAUDE API: Received response:', {
      responseTime: claudeResponseTime,
      hasResponse: !!response,
      responseType: typeof response,
      hasScores: !!(response?.scores),
      scoresLength: response?.scores?.length || 0
    });
    
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid API response format');
    }
    
    let scoresData = [];
    
    if (response.scores && Array.isArray(response.scores)) {
      scoresData = response.scores;
    } else if (Array.isArray(response)) {
      scoresData = response;
    } else {
      throw new Error('No scores found in API response');
    }
    
    console.log('🤖 CLAUDE API: Processing scores:', scoresData.length);
    
    const processedScores = scoresData.map((scoreItem, index) => {
      const actualScore = scoreItem?.score || scoreItem;
      
      if (!actualScore || typeof actualScore !== 'object') {
        console.warn(`⚠️ Invalid score at index ${index}, using fallback`);
        return createFallbackScore();
      }
      
      const normalizedScore = {
        overall: safeNumber(actualScore.overall, 50),
        dimensions: {
          strategic: safeNumber(actualScore.dimensions?.strategic, 50),
          tactical: safeNumber(actualScore.dimensions?.tactical, 50),
          cognitive: safeNumber(actualScore.dimensions?.cognitive, 50),
          innovation: safeNumber(actualScore.dimensions?.innovation, 50)
        },
        classification: actualScore.classification || 'average',
        chessNotation: actualScore.chessNotation || '=',
        confidence: safeNumber(actualScore.confidence, 0.7),
        explanation: actualScore.explanation || 'Analysis completed',
        betterMove: actualScore.betterMove || undefined
      };
      
      return normalizedScore;
    });
    
    store.setScores(processedScores);
    
    let sessionSummary = response.summary;
    
    if (!sessionSummary && processedScores.length > 0) {
      sessionSummary = createSessionSummaryFromScores(processedScores, analysisRequest.conversation.messages);
    }
    
    if (sessionSummary) {
      store.setSessionSummary(sessionSummary);
    }
    
    console.log('✅ CLAUDE ANALYSIS SUCCESS:', {
      totalTime: Date.now() - claudeStartTime,
      processedScores: processedScores.length,
      hasSummary: !!sessionSummary
    });
    
    toast.success(`✅ AI analysis completed! ${processedScores.length} messages analyzed.`);
    
  } catch (error) {
    console.error('❌ CLAUDE API: Analysis failed:', {
      error: error instanceof Error ? error.message : String(error),
      totalTime: Date.now() - claudeStartTime
    });
    
    toast.warning('AI analysis failed, falling back to local analysis...');
    
    await performLocalAnalysis(analysisRequest.conversation.messages, store);
  }
}

async function performLocalAnalysis(messages: Message[], store: any) {
  console.log('⚡ LOCAL ANALYSIS: Starting analysis for', messages.length, 'messages');
  
  const scores = [];
  
  for (let i = 0; i < messages.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const score = generateSmartScore(messages[i], i, messages);
    scores.push(score);
    
    store.setProgress({ current: i + 1, total: messages.length });
  }

  store.setScores(scores);

  const summary = createSessionSummaryFromScores(scores, messages);
  store.setSessionSummary(summary);
  
  toast.success(`✅ Local analysis completed! ${scores.length} messages analyzed.`);
}

function safeNumber(value: any, fallback: number): number {
  const num = Number(value);
  return !isNaN(num) && isFinite(num) ? Math.round(num) : fallback;
}

function createFallbackScore() {
  return {
    overall: 50,
    dimensions: { strategic: 50, tactical: 50, cognitive: 50, innovation: 50 },
    classification: 'average',
    chessNotation: '=',
    confidence: 0.5,
    explanation: 'Fallback score due to processing error'
  };
}

function generateSmartScore(message: Message, index: number, allMessages: Message[]) {
  const content = message?.content || '';
  const messageLength = content.length;
  const hasQuestions = (content.match(/\?/g) || []).length;
  const hasSpecifics = /\b\d+\b|example|specific|exactly|details|precisely/.test(content.toLowerCase());
  const hasContext = /because|since|due to|given that|considering/.test(content.toLowerCase());
  const isFirstMessage = index === 0;
  const isUserMessage = message.role === 'user';
  
  // Base score calculation
  let baseScore = 50;
  
  // Length bonuses/penalties
  if (messageLength > 100) baseScore += 10;
  if (messageLength > 300) baseScore += 5;
  if (messageLength < 20 && isUserMessage) baseScore -= 15;
  
  // Content quality
  if (hasQuestions > 0) baseScore += 5;
  if (hasSpecifics) baseScore += 15;
  if (hasContext) baseScore += 10;
  if (isFirstMessage && isUserMessage && messageLength > 50) baseScore += 5;
  
  // Add some realistic variation
  baseScore += (Math.random() - 0.5) * 15;
  baseScore = Math.max(20, Math.min(95, baseScore));
  
  return {
    overall: Math.round(baseScore),
    dimensions: {
      strategic: Math.round(Math.max(20, Math.min(100, baseScore + (Math.random() - 0.5) * 20))),
      tactical: Math.round(Math.max(20, Math.min(100, baseScore + (Math.random() - 0.5) * 20))),
      cognitive: Math.round(Math.max(20, Math.min(100, baseScore + (Math.random() - 0.5) * 15))),
      innovation: Math.round(Math.max(20, Math.min(100, baseScore + (Math.random() - 0.5) * 25)))
    },
    classification: getClassification(baseScore),
    chessNotation: getChessNotation(baseScore),
    confidence: 0.7 + Math.random() * 0.2,
    explanation: generateSmartExplanation(message, baseScore),
    betterMove: baseScore < 60 ? generateSmartSuggestion(message) : undefined
  };
}

function createSessionSummaryFromScores(scores: any[], messages: Message[]) {
  const validScores = scores.filter(s => s && typeof s.overall === 'number');
  
  if (validScores.length === 0) {
    return {
      sessionId: `session_${Date.now()}`,
      messageCount: messages.length,
      overallScore: 50,
      trend: 'stable',
      bestScore: 50,
      worstScore: 50,
      dimensionAverages: { strategic: 50, tactical: 50, cognitive: 50, innovation: 50 },
      patterns: [],
      insights: []
    };
  }
  
  const overallScores = validScores.map(s => s.overall);
  const avgScore = Math.round(overallScores.reduce((sum, score) => sum + score, 0) / overallScores.length);
  
  return {
    sessionId: `session_${Date.now()}`,
    messageCount: messages.length,
    overallScore: avgScore,
    trend: calculateTrend(validScores),
    bestScore: Math.max(...overallScores),
    worstScore: Math.min(...overallScores),
    dimensionAverages: {
      strategic: Math.round(validScores.reduce((sum, s) => sum + (s.dimensions?.strategic || 0), 0) / validScores.length),
      tactical: Math.round(validScores.reduce((sum, s) => sum + (s.dimensions?.tactical || 0), 0) / validScores.length),
      cognitive: Math.round(validScores.reduce((sum, s) => sum + (s.dimensions?.cognitive || 0), 0) / validScores.length),
      innovation: Math.round(validScores.reduce((sum, s) => sum + (s.dimensions?.innovation || 0), 0) / validScores.length)
    },
    patterns: [],
    insights: generateInsights(avgScore, validScores)
  };
}

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

function generateSmartExplanation(message: Message, score: number): string {
  const isUser = message.role === 'user';
  const content = message.content || '';
  const hasSpecifics = /\b\d+\b|example|specific/.test(content.toLowerCase());
  
  if (score >= 75) {
    return isUser 
      ? "Excellent strategic thinking with clear goals and specific context provided."
      : "Comprehensive response with actionable insights and well-structured guidance.";
  } else if (score >= 50) {
    return isUser
      ? "Good foundation but could benefit from more specific details or clearer objectives."
      : "Solid response that addresses the question but could provide more tactical specificity.";
  } else {
    return isUser
      ? "Lacks specificity and clear direction. Consider providing more context and concrete examples."
      : "Response misses key opportunities to provide strategic guidance and actionable next steps.";
  }
}

function generateSmartSuggestion(message: Message): string {
  const suggestions = [
    "Try being more specific about your goals, constraints, and desired outcomes.",
    "Provide concrete examples or use cases to clarify your needs.",
    "Break down complex requests into smaller, focused questions.",
    "Include relevant context about your project, timeline, or requirements."
  ];
  
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

function generateInsights(avgScore: number, scores: any[]) {
  const insights = [];
  
  if (avgScore >= 75) {
    insights.push({
      type: 'strength',
      title: 'Excellent Communication',
      description: 'Your conversation demonstrates strong strategic thinking and clear communication.',
      actionable: false
    });
  } else if (avgScore < 50) {
    insights.push({
      type: 'improvement',
      title: 'Communication Opportunity',
      description: 'Consider being more specific and providing clearer context in your requests.',
      actionable: true,
      suggestion: 'Try breaking complex requests into smaller, focused questions.'
    });
  }
  
  return insights;
}

export default AnalysisPage;