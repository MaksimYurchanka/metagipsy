import React from 'react';
import ConversationInput from '@/components/analysis/ConversationInput';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import { useAnalysisStore } from '@/stores/analysisStore';

// 🚨 ULTRA MINIMAL: Remove ALL complex logic that could cause loops
const AnalysisPage: React.FC = () => {
  console.log('🔥 MINIMAL v8: AnalysisPage rendering...');
  
  // ✅ SIMPLE: Only get what we need, no complex subscriptions
  const messages = useAnalysisStore((state) => state.messages);
  const scores = useAnalysisStore((state) => state.scores);
  
  console.log('🔥 MINIMAL v8: Messages count:', messages.length);
  
  // ✅ SIMPLE: No complex callbacks, just direct function
  const handleAnalyze = async (analysisRequest: any) => {
    setIsAnalyzing(true);
    try {
      // Call your API with the full request
      const response = await api.post('/analyze', analysisRequest);
      // Handle response...
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

    // Simple mock scoring - no async, no complex logic
    const mockScores = newMessages.map((_, index) => ({
      overall: Math.floor(Math.random() * 40) + 60, // 60-100 range
      dimensions: {
        strategic: Math.floor(Math.random() * 40) + 60,
        tactical: Math.floor(Math.random() * 40) + 60,
        cognitive: Math.floor(Math.random() * 40) + 60,
        innovation: Math.floor(Math.random() * 40) + 60
      },
      classification: 'good',
      confidence: 0.85,
      explanation: `Message ${index + 1} shows good structure and clarity.`,
      betterMove: index % 3 === 0 ? 'Consider adding more specific examples.' : undefined
    }));
    
    // ✅ SIMPLE: Direct store updates
    useAnalysisStore.getState().setMessages(newMessages);
    useAnalysisStore.getState().setScores(mockScores);
    
    console.log('🔥 MINIMAL v8: Analysis complete, stored', mockScores.length, 'scores');
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎯 MetaGipsy Chess Engine v8
          </h1>
          <p className="text-lg text-slate-300">
            Paste your AI conversation and get detailed chess-style scoring
          </p>
        </div>
        
        {/* Input Section */}
        <div className="bg-slate-800 rounded-lg p-6">
          <ConversationInput 
            onAnalyze={handleAnalyze}
            isAnalyzing={false}
          />
        </div>
        
        {/* Results Section */}
        {messages.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              🏆 Chess Analysis Results
            </h2>
            <AnalysisResults />
          </div>
        )}
        
        {/* Debug Info */}
        <div className="bg-slate-900 rounded-lg p-4 text-xs">
          <h3 className="text-slate-400 font-bold mb-2">Debug Info:</h3>
          <div className="text-slate-500">
            Messages: {messages.length} | Scores: {scores.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;