import React from 'react';
// ✅ IMPORT ONLY INDIVIDUAL SELECTORS - No object selectors!
import { useCompactMode, useAnimationsEnabled, useAnalysisDepth } from '@/stores/settingsStore';

// 🔍 ULTRA MINIMAL TEST - Only individual property selectors
const AnalysisPage: React.FC = () => {
  console.log('🔍 ULTRA MINIMAL TEST: Starting individual selector test...');

  try {
    console.log('🔍 ULTRA MINIMAL TEST: About to use useCompactMode...');
    const compactMode = useCompactMode();
    console.log('✅ ULTRA MINIMAL TEST: useCompactMode successful:', compactMode);

    console.log('🔍 ULTRA MINIMAL TEST: About to use useAnimationsEnabled...');
    const animationsEnabled = useAnimationsEnabled();
    console.log('✅ ULTRA MINIMAL TEST: useAnimationsEnabled successful:', animationsEnabled);

    console.log('🔍 ULTRA MINIMAL TEST: About to use useAnalysisDepth...');
    const analysisDepth = useAnalysisDepth();
    console.log('✅ ULTRA MINIMAL TEST: useAnalysisDepth successful:', analysisDepth);

    console.log('🔍 ULTRA MINIMAL TEST: All individual selectors completed successfully');

    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              🔍 Ultra Minimal Store Test
            </h1>
            <p className="text-xl text-slate-400">
              Testing INDIVIDUAL selectors only (no object selectors)
            </p>
          </div>
          
          <div className="bg-green-600 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">
              ✅ INDIVIDUAL SELECTORS TEST
            </h2>
            <p className="text-lg mb-4">
              Individual property selectors work without infinite loops!
            </p>
            
            <div className="space-y-4">
              <div className="bg-green-700 p-4 rounded">
                <h3 className="font-bold mb-2">Individual Values:</h3>
                <div className="space-y-2 text-sm">
                  <div>Compact Mode: <strong>{compactMode ? 'true' : 'false'}</strong></div>
                  <div>Animations: <strong>{animationsEnabled ? 'true' : 'false'}</strong></div>
                  <div>Analysis Depth: <strong>{analysisDepth}</strong></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold mb-2">🎯 Test Conclusion:</h3>
            <p><strong>✅ SUCCESS:</strong> Individual selectors work perfectly!</p>
            <p><strong>❌ PROBLEM:</strong> Object selectors cause infinite loops</p>
            <p><strong>Solution:</strong> Remove ALL object selectors from store</p>
          </div>
        </div>
      </div>
    );
    
  } catch (error) {
    console.error('🚨 ULTRA MINIMAL TEST: Individual selector failed:', error);
    
    return (
      <div className="min-h-screen bg-red-900 text-white p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              🚨 Individual Selector Test Failed
            </h1>
            <p className="text-xl">
              Even individual selectors are broken!
            </p>
          </div>
          
          <div className="bg-red-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Error Details:</h2>
            <pre className="text-sm bg-red-900 p-4 rounded overflow-auto">
              {error?.toString()}
            </pre>
          </div>

          <div className="bg-yellow-600 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold mb-2">🎯 Deeper Issue Found:</h3>
            <p><strong>EVEN INDIVIDUAL SELECTORS</strong> are causing problems</p>
            <p><strong>Next Action:</strong> Complete store rewrite needed</p>
          </div>
        </div>
      </div>
    );
  }
};

export default AnalysisPage;