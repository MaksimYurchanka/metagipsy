// DebugStoreTest.tsx - Изолированный тест store subscriptions
import React from 'react';

// ✅ PHASE 1: Test individual store selectors
const StoreTestComponent: React.FC = () => {
  console.log('🔍 STORE TEST: Starting isolation test...');
  
  try {
    // ✅ CRITICAL TEST 1: Test analysisStore selectors
    console.log('Testing analysisStore...');
    
    // Import only what we need to test
    const { useAnalysisStore } = require('@/stores/analysisStore');
    
    // ✅ Test individual selectors
    const messages = useAnalysisStore((state) => state.messages || []);
    const scores = useAnalysisStore((state) => state.scores || []);
    const computedStats = useAnalysisStore((state) => state.computedStats);
    
    console.log('✅ analysisStore selectors successful:', {
      messagesLength: messages.length,
      scoresLength: scores.length,
      computedStats: computedStats ? 'exists' : 'missing'
    });
    
    // ✅ CRITICAL TEST 2: Test settingsStore selectors  
    console.log('Testing settingsStore...');
    
    const { 
      useCompactMode, 
      useAnimationsEnabled, 
      useShowChessNotation 
    } = require('@/stores/settingsStore');
    
    const compactMode = useCompactMode();
    const animationsEnabled = useAnimationsEnabled(); 
    const showChessNotation = useShowChessNotation();
    
    console.log('✅ settingsStore selectors successful:', {
      compactMode,
      animationsEnabled,
      showChessNotation
    });
    
    return (
      <div className="p-8 bg-green-600 text-white space-y-4">
        <h1 className="text-2xl font-bold">✅ Store Test Successful</h1>
        
        <div className="bg-green-700 p-4 rounded">
          <h2 className="font-bold">Analysis Store:</h2>
          <p>Messages: {messages.length}</p>
          <p>Scores: {scores.length}</p>
          <p>Stats: {computedStats ? 'Available' : 'Missing'}</p>
        </div>
        
        <div className="bg-green-700 p-4 rounded">
          <h2 className="font-bold">Settings Store:</h2>
          <p>Compact Mode: {compactMode ? 'Yes' : 'No'}</p>
          <p>Animations: {animationsEnabled ? 'Yes' : 'No'}</p>
          <p>Chess Notation: {showChessNotation ? 'Yes' : 'No'}</p>
        </div>
        
        <p className="text-green-200">
          🎯 If you see this, store subscriptions work fine in isolation.
          The issue is in components that use these stores together.
        </p>
      </div>
    );
    
  } catch (error) {
    console.error('❌ STORE TEST FAILED:', error);
    
    return (
      <div className="p-8 bg-red-600 text-white space-y-4">
        <h1 className="text-2xl font-bold">❌ Store Test Failed</h1>
        <div className="bg-red-700 p-4 rounded">
          <h2 className="font-bold">Error Details:</h2>
          <pre className="text-sm whitespace-pre-wrap">
            {error?.toString()}
          </pre>
        </div>
        <p className="text-red-200">
          🚨 Store subscriptions are causing the infinite loop
        </p>
      </div>
    );
  }
};

// ✅ PHASE 2: Test ScoreBadge component isolation
const ScoreBadgeTestComponent: React.FC = () => {
  console.log('🔍 SCOREBADGE TEST: Starting isolation test...');
  
  try {
    // Import ScoreBadge
    const ScoreBadge = require('@/components/common/ScoreBadge').default;
    
    console.log('✅ ScoreBadge imported successfully');
    
    return (
      <div className="p-8 bg-blue-600 text-white space-y-4">
        <h1 className="text-2xl font-bold">🎯 ScoreBadge Test</h1>
        
        <div className="bg-blue-700 p-4 rounded space-y-2">
          <h2 className="font-bold">Testing different scores:</h2>
          
          <div className="flex gap-2 flex-wrap">
            <ScoreBadge score={90} size="sm" animated={false} />
            <ScoreBadge score={75} size="md" animated={false} />
            <ScoreBadge score={60} size="lg" animated={false} />
            <ScoreBadge score={45} size="md" animated={false} />
            <ScoreBadge score={20} size="sm" animated={false} />
          </div>
        </div>
        
        <p className="text-blue-200">
          ✅ If you see score badges above, ScoreBadge component works fine.
        </p>
      </div>
    );
    
  } catch (error) {
    console.error('❌ SCOREBADGE TEST FAILED:', error);
    
    return (
      <div className="p-8 bg-orange-600 text-white space-y-4">
        <h1 className="text-2xl font-bold">❌ ScoreBadge Test Failed</h1>
        <div className="bg-orange-700 p-4 rounded">
          <pre className="text-sm">{error?.toString()}</pre>
        </div>
        <p className="text-orange-200">
          🚨 ScoreBadge component is causing the infinite loop
        </p>
      </div>
    );
  }
};

// ✅ PHASE 3: Test AnalysisResults without MessageAnalysis
const AnalysisResultsTestComponent: React.FC = () => {
  console.log('🔍 ANALYSIS RESULTS TEST: Starting isolation test...');
  
  try {
    // Mock data for testing
    const mockMessages = [
      { role: 'user', content: 'Test message 1', index: 0 },
      { role: 'assistant', content: 'Test response 1', index: 1 }
    ];
    
    const mockScores = [
      { overall: 75, dimensions: { strategic: 80, tactical: 70, cognitive: 75, innovation: 70 } },
      { overall: 65, dimensions: { strategic: 70, tactical: 60, cognitive: 65, innovation: 60 } }
    ];
    
    // Set mock data in store
    const { useAnalysisStore } = require('@/stores/analysisStore');
    const store = useAnalysisStore.getState();
    store.setMessages(mockMessages);
    store.setScores(mockScores);
    
    console.log('✅ Mock data set in store');
    
    return (
      <div className="p-8 bg-purple-600 text-white space-y-4">
        <h1 className="text-2xl font-bold">🧪 Mock Data Test</h1>
        
        <div className="bg-purple-700 p-4 rounded">
          <h2 className="font-bold">Test Data Set:</h2>
          <p>Messages: {mockMessages.length}</p>
          <p>Scores: {mockScores.length}</p>
        </div>
        
        <p className="text-purple-200">
          ✅ Mock data successfully set in store. 
          Now test if AnalysisResults can render with this data.
        </p>
        
        <div className="bg-yellow-600 p-4 rounded">
          <p className="font-bold">⚠️ NEXT STEP:</p>
          <p>Replace this component with AnalysisResults to test if it crashes with mock data.</p>
        </div>
      </div>
    );
    
  } catch (error) {
    console.error('❌ MOCK DATA TEST FAILED:', error);
    
    return (
      <div className="p-8 bg-red-600 text-white">
        <h1>❌ Mock Data Test Failed</h1>
        <pre className="text-sm">{error?.toString()}</pre>
      </div>
    );
  }
};

// ✅ MAIN COMPONENT: Run all tests in sequence
const DebugTestSuite: React.FC = () => {
  console.log('🚀 DEBUG TEST SUITE: Starting systematic isolation testing...');
  
  const [currentTest, setCurrentTest] = React.useState<'store' | 'scorebadge' | 'mockdata' | 'complete'>('store');
  
  const nextTest = () => {
    if (currentTest === 'store') setCurrentTest('scorebadge');
    else if (currentTest === 'scorebadge') setCurrentTest('mockdata'); 
    else if (currentTest === 'mockdata') setCurrentTest('complete');
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Progress indicator */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">🔍 MetaGipsy Debug Test Suite</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => setCurrentTest('store')}
              className={`px-4 py-2 rounded ${currentTest === 'store' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              1. Store Test
            </button>
            <button 
              onClick={() => setCurrentTest('scorebadge')}
              className={`px-4 py-2 rounded ${currentTest === 'scorebadge' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              2. ScoreBadge Test
            </button>
            <button 
              onClick={() => setCurrentTest('mockdata')}
              className={`px-4 py-2 rounded ${currentTest === 'mockdata' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              3. Mock Data Test
            </button>
          </div>
        </div>
        
        {/* Current test */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {currentTest === 'store' && <StoreTestComponent />}
          {currentTest === 'scorebadge' && <ScoreBadgeTestComponent />}
          {currentTest === 'mockdata' && <AnalysisResultsTestComponent />}
          {currentTest === 'complete' && (
            <div className="p-8 bg-green-600 text-white text-center">
              <h1 className="text-2xl font-bold mb-4">🎉 All Tests Completed</h1>
              <p>If you reached this point, the issue is identified!</p>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        {currentTest !== 'complete' && (
          <div className="text-center">
            <button 
              onClick={nextTest}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Next Test →
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default DebugTestSuite;