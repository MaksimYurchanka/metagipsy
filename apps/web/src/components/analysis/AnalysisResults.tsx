import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// 🚨 MINIMAL VERSION - Find the exact crash point
const AnalysisResults: React.FC = () => {
  console.log('🔧 MINIMAL: Starting render attempt...');
  
  try {
    // Test 1: Basic state
    console.log('🔧 MINIMAL: Testing basic state...');
    const [testState, setTestState] = useState(0);
    console.log('🔧 MINIMAL: Basic state OK');
    
    // Test 2: Try accessing store - THIS MIGHT BE THE CRASH POINT
    console.log('🔧 MINIMAL: Testing store access...');
    
    // ❌ SUSPECT: Store access might be causing immediate crash
    // Let's try accessing the store step by step
    
    let storeData;
    try {
      // Import the store
      const { useAnalysisStore } = require('@/stores/analysisStore');
      console.log('🔧 MINIMAL: Store imported OK');
      
      // Try to access store data
      storeData = useAnalysisStore((state) => {
        console.log('🔧 MINIMAL: Inside store selector...');
        return {
          messages: state.messages || [],
          scores: state.scores || [],
          computedStats: state.computedStats || { averageScore: 0, totalMessages: 0 }
        };
      });
      console.log('🔧 MINIMAL: Store data accessed:', {
        messagesLength: storeData.messages.length,
        scoresLength: storeData.scores.length
      });
    } catch (storeError) {
      console.error('🚨 MINIMAL: Store access CRASHED!', storeError);
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-500">Store Access Error</h2>
          <p className="text-red-400">Store crashed during access</p>
          <pre className="text-xs text-gray-400 mt-4">{storeError.toString()}</pre>
        </div>
      );
    }
    
    console.log('🔧 MINIMAL: Store access completed successfully');
    
    // Test 3: Basic rendering without complex logic
    console.log('🔧 MINIMAL: Testing basic rendering...');
    
    return (
      <div className="p-8 space-y-4">
        {/* Debug info */}
        <div className="bg-green-50 border border-green-200 p-4 rounded">
          <h2 className="text-lg font-bold text-green-800">✅ MINIMAL VERSION WORKING!</h2>
          <p className="text-green-600">Component rendered successfully</p>
          <div className="text-sm text-green-500 mt-2">
            <p>Messages: {storeData.messages.length}</p>
            <p>Scores: {storeData.scores.length}</p>
            <p>Average Score: {storeData.computedStats.averageScore}</p>
          </div>
        </div>
        
        {/* Test if UI components work */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Test Card</p>
                <p className="text-2xl font-bold">Working!</p>
              </div>
              <Badge variant="secondary">
                Test Badge
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Show if we have any data */}
        {storeData.messages.length > 0 ? (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded">
            <h3 className="font-bold text-blue-800">Data Found:</h3>
            <p className="text-blue-600">{storeData.messages.length} messages to analyze</p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            <h3 className="font-bold text-yellow-800">No Data:</h3>
            <p className="text-yellow-600">Paste a conversation to see analysis</p>
          </div>
        )}
      </div>
    );
    
  } catch (renderError) {
    console.error('🚨 MINIMAL: Render CRASHED!', renderError);
    
    // Fallback error display
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-500">Render Crash Detected</h2>
        <p className="text-red-400">Component crashed during render</p>
        <pre className="text-xs text-gray-400 mt-4 text-left bg-gray-100 p-4 rounded">
          {renderError.toString()}
        </pre>
      </div>
    );
  }
};

export default AnalysisResults;