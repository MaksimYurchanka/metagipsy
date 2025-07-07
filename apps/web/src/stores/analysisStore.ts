import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Message, ChessScore, Pattern, SessionSummary, Platform, Insight } from '@/types';

// ✅ DEBUG HELPERS
const DEBUG_STORE = true;
let recomputeCount = 0;
let selectorCallCount = 0;

const debugStoreLog = (message: string, data?: any) => {
  if (DEBUG_STORE) {
    console.log(`🏪 [Store] ${message}`, data || '');
  }
};

const debugStoreWarn = (message: string, data?: any) => {
  if (DEBUG_STORE) {
    console.warn(`⚠️ [Store] ${message}`, data || '');
  }
};

interface AnalysisState {
  // Current session data
  messages: Message[];
  scores: ChessScore[];
  patterns: Pattern[];
  insights: Insight[];
  sessionSummary: SessionSummary | null;
  sessionMetadata: {
    platform?: Platform;
    projectContext?: string;
    sessionGoal?: string;
    sessionId?: string;
  };
  
  // UI state
  isAnalyzing: boolean;
  error: string | null;
  progress: {
    current: number;
    total: number;
  };
  
  // ✅ Computed state to store
  computedStats: {
    averageScore: number;
    bestScore: number;
    worstScore: number;
    totalMessages: number;
    completedAnalysis: number;
    dimensionAverages: {
      strategic: number;
      tactical: number;
      cognitive: number;
      innovation: number;
    };
    trend: 'improving' | 'declining' | 'stable';
  };
  
  // Actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (index: number, message: Partial<Message>) => void;
  removeMessage: (index: number) => void;
  
  setScores: (scores: ChessScore[]) => void;
  updateScore: (index: number, score: ChessScore) => void;
  
  setPatterns: (patterns: Pattern[]) => void;
  addPattern: (pattern: Pattern) => void;
  
  setInsights: (insights: Insight[]) => void;
  addInsight: (insight: Insight) => void;
  
  setSessionSummary: (summary: SessionSummary) => void;
  setSessionMetadata: (metadata: Partial<AnalysisState['sessionMetadata']>) => void;
  
  setIsAnalyzing: (analyzing: boolean) => void;
  setError: (error: string | null) => void;
  setProgress: (progress: { current: number; total: number }) => void;
  
  clearSession: () => void;
  resetState: () => void;
  
  // Internal method to recompute stats
  _recomputeStats: () => void;
}

// ✅ DEBUG: Pure function with logging
const calculateStats = (messages: Message[], scores: ChessScore[]) => {
  const recomputeNumber = ++recomputeCount;
  debugStoreLog(`RECOMPUTE #${recomputeNumber} - calculateStats called`, {
    messagesLength: messages.length,
    scoresLength: scores.length
  });
  
  if (scores.length === 0) {
    debugStoreLog(`RECOMPUTE #${recomputeNumber} - returning empty stats`);
    return {
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      totalMessages: messages.length,
      completedAnalysis: 0,
      dimensionAverages: {
        strategic: 0,
        tactical: 0,
        cognitive: 0,
        innovation: 0
      },
      trend: 'stable' as const
    };
  }
  
  const overallScores = scores.map(s => s.overall);
  debugStoreLog(`RECOMPUTE #${recomputeNumber} - processing ${overallScores.length} scores`);
  
  // Calculate dimension averages
  const dimensionTotals = scores.reduce(
    (acc, score) => ({
      strategic: acc.strategic + score.dimensions.strategic,
      tactical: acc.tactical + score.dimensions.tactical,
      cognitive: acc.cognitive + score.dimensions.cognitive,
      innovation: acc.innovation + score.dimensions.innovation
    }),
    { strategic: 0, tactical: 0, cognitive: 0, innovation: 0 }
  );
  
  const count = scores.length;
  const dimensionAverages = {
    strategic: dimensionTotals.strategic / count,
    tactical: dimensionTotals.tactical / count,
    cognitive: dimensionTotals.cognitive / count,
    innovation: dimensionTotals.innovation / count
  };
  
  debugStoreLog(`RECOMPUTE #${recomputeNumber} - dimension averages`, dimensionAverages);
  
  // Calculate trend
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (scores.length >= 2) {
    const recent = scores.slice(-3);
    const first = recent[0].overall;
    const last = recent[recent.length - 1].overall;
    const diff = last - first;
    
    if (diff > 5) trend = 'improving';
    else if (diff < -5) trend = 'declining';
    
    debugStoreLog(`RECOMPUTE #${recomputeNumber} - trend calculation`, {
      recentScores: recent.map(s => s.overall),
      first,
      last,
      diff,
      trend
    });
  }
  
  const result = {
    averageScore: overallScores.reduce((sum, score) => sum + score, 0) / overallScores.length,
    bestScore: Math.max(...overallScores),
    worstScore: Math.min(...overallScores),
    totalMessages: messages.length,
    completedAnalysis: scores.length,
    dimensionAverages,
    trend
  };
  
  debugStoreLog(`RECOMPUTE #${recomputeNumber} - final result`, result);
  return result;
};

const initialState = {
  messages: [],
  scores: [],
  patterns: [],
  insights: [],
  sessionSummary: null,
  sessionMetadata: {},
  isAnalyzing: false,
  error: null,
  progress: { current: 0, total: 0 },
  computedStats: calculateStats([], [])
};

export const useAnalysisStore = create<AnalysisState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ✅ DEBUG: Internal recompute with extensive logging
        _recomputeStats: () => {
          const state = get();
          debugStoreLog(`_recomputeStats called`);
          
          const previousStats = state.computedStats;
          const newStats = calculateStats(state.messages, state.scores);
          
          // ✅ CRITICAL DEBUG: Check if stats actually changed
          const statsChanged = 
            previousStats.averageScore !== newStats.averageScore ||
            previousStats.bestScore !== newStats.bestScore ||
            previousStats.totalMessages !== newStats.totalMessages ||
            previousStats.completedAnalysis !== newStats.completedAnalysis ||
            previousStats.trend !== newStats.trend ||
            JSON.stringify(previousStats.dimensionAverages) !== JSON.stringify(newStats.dimensionAverages);
          
          if (statsChanged) {
            debugStoreLog(`Stats changed - updating store`, {
              previous: previousStats,
              new: newStats
            });
            set({ computedStats: newStats });
          } else {
            debugStoreWarn(`Stats unchanged but _recomputeStats called - potential inefficiency!`, {
              previousAvg: previousStats.averageScore,
              newAvg: newStats.averageScore,
              sameValues: true
            });
          }
        },

        // ✅ DEBUG: All mutations with logging
        setMessages: (messages) => {
          debugStoreLog(`setMessages called`, { length: messages.length });
          set({ messages, scores: [], patterns: [], insights: [] });
          get()._recomputeStats();
        },
        
        addMessage: (message) => {
          debugStoreLog(`addMessage called`, { role: message.role });
          set((state) => ({
            messages: [...state.messages, { ...message, index: state.messages.length }]
          }));
          get()._recomputeStats();
        },
        
        updateMessage: (index, messageUpdate) => {
          debugStoreLog(`updateMessage called`, { index, update: messageUpdate });
          set((state) => ({
            messages: state.messages.map((msg, i) => 
              i === index ? { ...msg, ...messageUpdate } : msg
            )
          }));
          get()._recomputeStats();
        },
        
        removeMessage: (index) => {
          debugStoreLog(`removeMessage called`, { index });
          set((state) => ({
            messages: state.messages.filter((_, i) => i !== index)
              .map((msg, i) => ({ ...msg, index: i })),
            scores: state.scores.filter((_, i) => i !== index),
          }));
          get()._recomputeStats();
        },

        // Score actions
        setScores: (scores) => {
          debugStoreLog(`setScores called`, { length: scores.length });
          set({ scores });
          get()._recomputeStats();
        },
        
        updateScore: (index, score) => {
          debugStoreLog(`updateScore called`, { index, overall: score.overall });
          set((state) => ({
            scores: state.scores.map((s, i) => i === index ? score : s)
          }));
          get()._recomputeStats();
        },

        // Pattern actions (no stats impact)
        setPatterns: (patterns) => {
          debugStoreLog(`setPatterns called`, { length: patterns.length });
          set({ patterns });
        },
        
        addPattern: (pattern) => {
          debugStoreLog(`addPattern called`, { type: pattern.type });
          set((state) => ({
            patterns: [...state.patterns, pattern]
          }));
        },

        // Insight actions (no stats impact)
        setInsights: (insights) => {
          debugStoreLog(`setInsights called`, { length: insights.length });
          set({ insights });
        },
        
        addInsight: (insight) => {
          debugStoreLog(`addInsight called`);
          set((state) => ({
            insights: [...state.insights, insight]
          }));
        },

        // Session actions (no stats impact)
        setSessionSummary: (sessionSummary) => {
          debugStoreLog(`setSessionSummary called`);
          set({ sessionSummary });
        },
        
        setSessionMetadata: (metadata) => {
          debugStoreLog(`setSessionMetadata called`, metadata);
          set((state) => ({
            sessionMetadata: { ...state.sessionMetadata, ...metadata }
          }));
        },

        // UI state actions (no stats impact)
        setIsAnalyzing: (isAnalyzing) => {
          debugStoreLog(`setIsAnalyzing called`, { isAnalyzing });
          set({ isAnalyzing });
        },
        
        setError: (error) => {
          debugStoreLog(`setError called`, { error });
          set({ error });
        },
        
        setProgress: (progress) => {
          debugStoreLog(`setProgress called`, progress);
          set({ progress });
        },

        // Reset actions
        clearSession: () => {
          debugStoreLog(`clearSession called`);
          set({
            messages: [],
            scores: [],
            patterns: [],
            insights: [],
            sessionSummary: null,
            error: null,
            progress: { current: 0, total: 0 }
          });
          get()._recomputeStats();
        },
        
        resetState: () => {
          debugStoreLog(`resetState called`);
          set(initialState);
        }
      }),
      {
        name: 'analysis-storage',
        partialize: (state) => ({
          sessionMetadata: state.sessionMetadata
        })
      }
    ),
    {
      name: 'analysis-store'
    }
  )
);

// ✅ DEBUG: Selectors with call tracking
export const useMessages = () => {
  const selectorNumber = ++selectorCallCount;
  return useAnalysisStore((state) => {
    debugStoreLog(`useMessages selector called #${selectorNumber}`);
    return state.messages;
  });
};

export const useScores = () => {
  const selectorNumber = ++selectorCallCount;
  return useAnalysisStore((state) => {
    debugStoreLog(`useScores selector called #${selectorNumber}`);
    return state.scores;
  });
};

export const usePatterns = () => useAnalysisStore((state) => state.patterns);
export const useInsights = () => useAnalysisStore((state) => state.insights);
export const useSessionSummary = () => useAnalysisStore((state) => state.sessionSummary);
export const useSessionMetadata = () => useAnalysisStore((state) => state.sessionMetadata);
export const useIsAnalyzing = () => useAnalysisStore((state) => state.isAnalyzing);
export const useAnalysisError = () => useAnalysisStore((state) => state.error);
export const useAnalysisProgress = () => useAnalysisStore((state) => state.progress);

// ✅ DEBUG: Critical selectors with extensive logging
export const useAnalysisStats = () => {
  const selectorNumber = ++selectorCallCount;
  return useAnalysisStore((state) => {
    debugStoreLog(`useAnalysisStats selector called #${selectorNumber}`, {
      averageScore: state.computedStats.averageScore,
      objectReference: typeof state.computedStats
    });
    
    // ✅ CRITICAL DEBUG: Log reference changes
    if ((window as any).lastStatsRef && (window as any).lastStatsRef !== state.computedStats) {
      debugStoreWarn(`computedStats reference changed!`, {
        previousRef: (window as any).lastStatsRef === state.computedStats ? 'SAME' : 'DIFFERENT',
        sameValues: (window as any).lastStatsAvg === state.computedStats.averageScore
      });
    }
    
    (window as any).lastStatsRef = state.computedStats;
    (window as any).lastStatsAvg = state.computedStats.averageScore;
    
    return state.computedStats;
  });
};

export const useCurrentTrend = () => {
  const selectorNumber = ++selectorCallCount;
  return useAnalysisStore((state) => {
    debugStoreLog(`useCurrentTrend selector called #${selectorNumber}`, {
      trend: state.computedStats.trend
    });
    return state.computedStats.trend;
  });
};

export const useDimensionAverages = () => {
  const selectorNumber = ++selectorCallCount;
  return useAnalysisStore((state) => {
    debugStoreLog(`useDimensionAverages selector called #${selectorNumber}`);
    return state.computedStats.dimensionAverages;
  });
};

export default useAnalysisStore;