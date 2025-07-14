import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ConversationInput from '@/components/analysis/ConversationInput';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

// ✅ SIMPLIFIED: 5D Features без лишней сложности
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
  },
  {
    icon: '🧭',
    title: 'Context Awareness',
    description: 'Temporal understanding & state awareness'
  }
];

const AnalysisPage: React.FC = () => {
  console.log('🚀 SIMPLIFIED ANALYSIS PAGE: Starting render...');
  
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  // ✅ SIMPLIFIED: Только direct analyze - без сложной логики
  const handleDirectAnalyze = useCallback(async (analysisRequest: any) => {
    console.log('🚀 DIRECT ANALYZE: Starting simple analysis...', {
      messageCount: analysisRequest?.conversation?.messages?.length || 0,
      platform: analysisRequest?.conversation?.platform,
      useClaudeAnalysis: analysisRequest?.options?.useClaudeAnalysis
    });

    try {
      // ✅ SIMPLE: Прямой вызов API
      const response = await api.analyzeConversation(analysisRequest);
      
      if (!response || !response.sessionId) {
        throw new Error('Invalid analysis response');
      }

      console.log('✅ DIRECT ANALYZE SUCCESS:', {
        sessionId: response.sessionId,
        messageCount: response.messages?.length || 0
      });

      // ✅ NAVIGATE: Сразу на результаты
      navigate(`/analyze/results/${response.sessionId}`);
      
      toast.success('✅ Analysis completed! Redirecting to results...');
      
    } catch (error) {
      console.error('❌ DIRECT ANALYZE ERROR:', error);
      toast.error('Analysis failed. Please try again.');
    }
  }, [navigate]);

  console.log('🚀 SIMPLIFIED ANALYSIS PAGE: About to render');

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ✅ CLEAN HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          MetaGipsy 5D Chess Engine
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Advanced AI conversation analysis with chess-style scoring across 5 dimensions. 
          Paste your conversation and get strategic insights with Claude AI or local analysis.
        </p>
        
        {/* ✅ SIMPLE AUTH STATUS */}
        {loading ? (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse" />
            Checking authentication...
          </div>
        ) : isAuthenticated ? (
          <>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Signed in • Analysis will be saved to your dashboard
            </div>
          </>
        ) : (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-sm">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
            Not authenticated • Analysis won't be saved
          </div>
        )}
      </motion.div>

      {/* ✅ MAIN INPUT SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl mx-auto"
      >
        <ConversationInput 
          onAnalyze={handleDirectAnalyze}
          isAnalyzing={false}
        />
      </motion.div>

      {/* ✅ FEATURES SHOWCASE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-16"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Five Dimensions of Analysis</h2>
          <p className="text-muted-foreground">Every message analyzed across these key dimensions</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="text-center p-6 rounded-lg border bg-card hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ✅ HOW IT WORKS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-16 text-center"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-2xl">📝</div>
              <h3 className="font-semibold">1. Paste Conversation</h3>
              <p className="text-sm text-muted-foreground">
                Copy your conversation from Claude.ai, ChatGPT, or any platform
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl">🎯</div>
              <h3 className="font-semibold">2. Choose Your Path</h3>
              <p className="text-sm text-muted-foreground">
                Parse & Verify for editing, or Direct Analysis for speed
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl">📊</div>
              <h3 className="font-semibold">3. Get Insights</h3>
              <p className="text-sm text-muted-foreground">
                Receive chess-style scoring and strategic recommendations
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalysisPage;