import React from 'react';
import { useDisplaySettings } from '@/stores/settingsStore';
import { useAnalysisSettings } from '@/stores/settingsStore';

// 🔍 STORE ISOLATION TEST - Test if store subscriptions cause crashes
const AnalysisPage: React.FC = () => {
  console.log('🔍 STORE TEST: Starting store subscription test...');

  try {
    console.log('🔍 STORE TEST: About to subscribe to useDisplaySettings...');
    const displaySettings = useDisplaySettings();
    console.log('✅ STORE TEST: useDisplaySettings successful:', displaySettings);

    console.log('🔍 STORE TEST: About to subscribe to useAnalysisSettings...');
    const analysisSettings = useAnalysisSettings();
    console.log('✅ STORE TEST: useAnalysisSettings successful:', analysisSettings);

    console.log('🔍 STORE TEST: Both store subscriptions completed successfully');

    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              🔍 Store Subscription Test
            </h1>
            <p className="text-xl text-slate-400">
              Testing if Zustand store subscriptions cause infinite loops
            </p>
          </div>
          
          <div className="bg-green-600 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">
              ✅ STORE TEST SUCCESSFUL
            </h2>
            <p className="text-lg mb-4">
              Both store subscriptions work without crashing!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-700 p-4 rounded">
                <h3 className="font-bold mb-2">Display Settings:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(displaySettings, null, 2)}
                </pre>
              </div>
              
              <div className="bg-green-700 p-4 rounded">
                <h3 className="font-bold mb-2">Analysis Settings:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(analysisSettings, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold mb-2">🎯 Test Conclusion:</h3>
            <p><strong>✅ SUCCESS:</strong> Store subscriptions are NOT the problem</p>
            <p><strong>Next Test:</strong> ScoreBadge component isolation</p>
          </div>
        </div>
      </div>
    );
    
  } catch (error) {
    console.error('🚨 STORE TEST: Store subscription failed:', error);
    
    return (
      <div className="min-h-screen bg-red-900 text-white p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              🚨 Store Test Failed
            </h1>
            <p className="text-xl">
              Store subscriptions are causing the infinite loop!
            </p>
          </div>
          
          <div className="bg-red-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Error Details:</h2>
            <pre className="text-sm bg-red-900 p-4 rounded overflow-auto">
              {error?.toString()}
            </pre>
          </div>

          <div className="bg-yellow-600 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold mb-2">🎯 Root Cause Found:</h3>
            <p><strong>STORE SUBSCRIPTIONS</strong> are causing React Error #185</p>
            <p><strong>Next Action:</strong> Fix Zustand store configuration</p>
          </div>
        </div>
      </div>
    );
  }
};

export default AnalysisPage;