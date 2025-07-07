import React from 'react';
import ConversationInput from '@/components/analysis/ConversationInput';

// 🧪 TEST: Only ConversationInput import and usage
const AnalysisPage: React.FC = () => {
  console.log('🧪 TESTING: ConversationInput only...');

  const handleAnalyze = (messages: any[]) => {
    console.log('📥 Analysis requested:', messages);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            🧪 Testing ConversationInput Only
          </h1>
          <p className="text-xl text-slate-400">
            If this loads without errors, ConversationInput is safe
          </p>
        </div>
        
        <div className="bg-blue-600 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">
            🔍 ConversationInput Test
          </h2>
          <ConversationInput 
            onAnalyze={handleAnalyze}
            isAnalyzing={false}
          />
        </div>

        <div className="bg-yellow-600 p-4 rounded-lg text-center">
          <p><strong>Expected Result:</strong></p>
          <p>✅ Page loads → ConversationInput is NOT the problem</p>
          <p>❌ Still crashes → ConversationInput contains the infinite loop</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;