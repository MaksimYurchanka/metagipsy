import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Message, ChessScore, Pattern, SessionSummary, Platform, Insight } from '@/types';

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
  
  // ✅ Computed state stored in store
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

// ✅ Pure function to calculate stats (no side effects)
const calculateStats = (messages: Message[], scores: ChessScore[]) => {
  if (scores.length === 0) {
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
  
  // Calculate trend
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (scores.length >= 2) {
    const recent = scores.slice(-3);
    const first = recent[0].overall;
    const last = recent[recent.length - 1].overall;
    const diff = last - first;
    
    if (diff > 5) trend = 'improving';
    else if (diff < -5) trend = 'declining';
  }
  
  return {
    averageScore: overallScores.reduce((sum, score) => sum + score, 0) / overallScores.length,
    bestScore: Math.max(...overallScores),
    worstScore: Math.min(...overallScores),
    totalMessages: messages.length,
    completedAnalysis: scores.length,
    dimensionAverages,
    trend
  };
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

        // Internal recompute method
        _recomputeStats: () => {
          const state = get();
          const newStats = calculateStats(state.messages, state.scores);
          set({ computedStats: newStats });
        },

        // All mutations trigger stats recomputation
        setMessages: (messages) => {
          set({ messages, scores: [], patterns: [], insights: [] });
          get()._recomputeStats();
        },
        
        addMessage: (message) => {
          set((state) => ({
            messages: [...state.messages, { ...message, index: state.messages.length }]
          }));
          get()._recomputeStats();
        },
        
        updateMessage: (index, messageUpdate) => {
          set((state) => ({
            messages: state.messages.map((msg, i) => 
              i === index ? { ...msg, ...messageUpdate } : msg
            )
          }));
          get()._recomputeStats();
        },
        
        removeMessage: (index) => {
          set((state) => ({
            messages: state.messages.filter((_, i) => i !== index)
              .map((msg, i) => ({ ...msg, index: i })),
            scores: state.scores.filter((_, i) => i !== index),
          }));
          get()._recomputeStats();
        },

        // Score actions
        setScores: (scores) => {
          set({ scores });
          get()._recomputeStats();
        },
        
        updateScore: (index, score) => {
          set((state) => ({
            scores: state.scores.map((s, i) => i === index ? score : s)
          }));
          get()._recomputeStats();
        },

        // Pattern actions (no stats impact)
        setPatterns: (patterns) => set({ patterns }),
        addPattern: (pattern) => set((state) => ({
          patterns: [...state.patterns, pattern]
        })),

        // Insight actions (no stats impact)
        setInsights: (insights) => set({ insights }),
        addInsight: (insight) => set((state) => ({
          insights: [...state.insights, insight]
        })),

        // Session actions (no stats impact)
        setSessionSummary: (sessionSummary) => set({ sessionSummary }),
        setSessionMetadata: (metadata) => set((state) => ({
          sessionMetadata: { ...state.sessionMetadata, ...metadata }
        })),

        // UI state actions (no stats impact)
        setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
        setError: (error) => set({ error }),
        setProgress: (progress) => set({ progress }),

        // Reset actions
        clearSession: () => {
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

// ✅ CLEAN SELECTORS - No side effects!
export const useMessages = () => useAnalysisStore((state) => state.messages);
export const useScores = () => useAnalysisStore((state) => state.scores);
export const usePatterns = () => useAnalysisStore((state) => state.patterns);
export const useInsights = () => useAnalysisStore((state) => state.insights);
export const useSessionSummary = () => useAnalysisStore((state) => state.sessionSummary);
export const useSessionMetadata = () => useAnalysisStore((state) => state.sessionMetadata);
export const useIsAnalyzing = () => useAnalysisStore((state) => state.isAnalyzing);
export const useAnalysisError = () => useAnalysisStore((state) => state.error);
export const useAnalysisProgress = () => useAnalysisStore((state) => state.progress);

// ✅ CLEAN computed selectors - Pure functions only!
export const useAnalysisStats = () => useAnalysisStore((state) => state.computedStats);
export const useCurrentTrend = () => useAnalysisStore((state) => state.computedStats.trend);
export const useDimensionAverages = () => useAnalysisStore((state) => state.computedStats.dimensionAverages);

export default useAnalysisStore;