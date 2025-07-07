import React from 'react';
import MessageAnalysis from '@/components/analysis/MessageAnalysis';

// 🧪 TEST: Only MessageAnalysis import and usage
const AnalysisPage: React.FC = () => {
  console.log('🧪 TESTING: MessageAnalysis only...');

  // Mock data for MessageAnalysis
  const mockMessage = {
    role: 'user' as const,
    content: 'This is a test message to see if MessageAnalysis causes the infinite loop.',
    index: 0,
    timestamp: new Date().toISOString()
  };

  const mockScore = {
    overall: 75,
    dimensions: {
      strategic: 80,
      tactical: 70,
      cognitive: 75,
      innovation: 70
    },
    classification: 'good' as const,
    chessNotation: '+' as const,
    confidence: 0.85,
    explanation: 'This is a test explanation to check component rendering.',
    betterMove: undefined
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            🧪 Testing MessageAnalysis Only
          </h1>
          <p className="text-xl text-slate-400">
            If this loads without errors, MessageAnalysis is safe
          </p>
        </div>
        
        <div className="bg-green-600 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">
            🔍 MessageAnalysis Test
          </h2>
          <MessageAnalysis 
            message={mockMessage}
            score={mockScore}
            index={0}
            isExpanded={false}
            onToggle={() => console.log('Toggle clicked')}
          />
        </div>

        <div className="bg-yellow-600 p-4 rounded-lg text-center">
          <p><strong>Expected Result:</strong></p>
          <p>✅ Page loads → MessageAnalysis is NOT the problem</p>
          <p>❌ Still crashes → MessageAnalysis contains the infinite loop</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;