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

// ✅ SAFE: Pure function to calculate stats with null checks
const calculateStats = (messages: Message[], scores: ChessScore[]) => {
  if (!scores || scores.length === 0) {
    return {
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      totalMessages: messages?.length || 0,
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
  
  // ✅ SAFE: Filter out invalid scores and ensure overall exists
  const validScores = scores.filter(s => s && typeof s.overall === 'number');
  
  if (validScores.length === 0) {
    return {
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      totalMessages: messages?.length || 0,
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
  
  const overallScores = validScores.map(s => s.overall || 0);
  
  // ✅ SAFE: Calculate dimension averages with comprehensive null checks
  const dimensionTotals = validScores.reduce(
    (acc, score) => {
      // ✅ CRITICAL: Ensure dimensions object exists and has all properties
      const dimensions = score?.dimensions || {};
      const strategic = typeof dimensions.strategic === 'number' ? dimensions.strategic : 0;
      const tactical = typeof dimensions.tactical === 'number' ? dimensions.tactical : 0;
      const cognitive = typeof dimensions.cognitive === 'number' ? dimensions.cognitive : 0;
      const innovation = typeof dimensions.innovation === 'number' ? dimensions.innovation : 0;
      
      return {
        strategic: acc.strategic + strategic,
        tactical: acc.tactical + tactical,
        cognitive: acc.cognitive + cognitive,
        innovation: acc.innovation + innovation
      };
    },
    { strategic: 0, tactical: 0, cognitive: 0, innovation: 0 }
  );
  
  const count = validScores.length;
  const dimensionAverages = {
    strategic: count > 0 ? Math.round(dimensionTotals.strategic / count) : 0,
    tactical: count > 0 ? Math.round(dimensionTotals.tactical / count) : 0,
    cognitive: count > 0 ? Math.round(dimensionTotals.cognitive / count) : 0,
    innovation: count > 0 ? Math.round(dimensionTotals.innovation / count) : 0
  };
  
  // ✅ SAFE: Calculate trend with bounds checking
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (validScores.length >= 2) {
    const recent = validScores.slice(-3);
    if (recent.length >= 2) {
      const first = recent[0]?.overall || 0;
      const last = recent[recent.length - 1]?.overall || 0;
      const diff = last - first;
      
      if (diff > 5) trend = 'improving';
      else if (diff < -5) trend = 'declining';
    }
  }
  
  // ✅ SAFE: All calculations with fallbacks
  const validOverallScores = overallScores.filter(score => typeof score === 'number');
  
  return {
    averageScore: validOverallScores.length > 0 
      ? Math.round(validOverallScores.reduce((sum, score) => sum + score, 0) / validOverallScores.length)
      : 0,
    bestScore: validOverallScores.length > 0 ? Math.max(...validOverallScores) : 0,
    worstScore: validOverallScores.length > 0 ? Math.min(...validOverallScores) : 0,
    totalMessages: messages?.length || 0,
    completedAnalysis: validScores.length,
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

        // Internal recompute method with error handling
        _recomputeStats: () => {
          try {
            const state = get();
            const newStats = calculateStats(state.messages, state.scores);
            set({ computedStats: newStats });
          } catch (error) {
            console.error('❌ ANALYSIS STORE: Stats calculation failed:', error);
            // Set safe fallback stats
            set({
              computedStats: {
                averageScore: 0,
                bestScore: 0,
                worstScore: 0,
                totalMessages: get().messages?.length || 0,
                completedAnalysis: 0,
                dimensionAverages: { strategic: 0, tactical: 0, cognitive: 0, innovation: 0 },
                trend: 'stable' as const
              }
            });
          }
        },

        // ✅ SAFE: All mutations trigger stats recomputation with error handling
        setMessages: (messages) => {
          console.log('📝 ANALYSIS STORE: Setting messages:', messages?.length || 0);
          set({ 
            messages: messages || [], 
            scores: [], 
            patterns: [], 
            insights: [] 
          });
          get()._recomputeStats();
        },
        
        addMessage: (message) => {
          if (!message) return;
          set((state) => ({
            messages: [...(state.messages || []), { ...message, index: (state.messages || []).length }]
          }));
          get()._recomputeStats();
        },
        
        updateMessage: (index, messageUpdate) => {
          if (typeof index !== 'number' || !messageUpdate) return;
          set((state) => ({
            messages: (state.messages || []).map((msg, i) => 
              i === index ? { ...msg, ...messageUpdate } : msg
            )
          }));
          get()._recomputeStats();
        },
        
        removeMessage: (index) => {
          if (typeof index !== 'number') return;
          set((state) => ({
            messages: (state.messages || []).filter((_, i) => i !== index)
              .map((msg, i) => ({ ...msg, index: i })),
            scores: (state.scores || []).filter((_, i) => i !== index),
          }));
          get()._recomputeStats();
        },

        // ✅ SAFE: Score actions with validation
        setScores: (scores) => {
          console.log('🎯 ANALYSIS STORE: Setting scores:', scores?.length || 0);
          if (!Array.isArray(scores)) {
            console.error('❌ ANALYSIS STORE: Invalid scores format, expected array:', scores);
            return;
          }
          
          // ✅ NORMALIZE: Ensure all scores have proper structure
          const normalizedScores = scores.map((score, index) => {
            if (!score || typeof score !== 'object') {
              console.warn(`⚠️ ANALYSIS STORE: Invalid score at index ${index}:`, score);
              return {
                overall: 50,
                dimensions: { strategic: 50, tactical: 50, cognitive: 50, innovation: 50 },
                classification: 'average',
                chessNotation: '=',
                confidence: 0.5,
                explanation: 'Default score due to invalid data'
              };
            }
            
            return {
              overall: typeof score.overall === 'number' ? score.overall : 50,
              dimensions: {
                strategic: score.dimensions?.strategic || 50,
                tactical: score.dimensions?.tactical || 50,
                cognitive: score.dimensions?.cognitive || 50,
                innovation: score.dimensions?.innovation || 50
              },
              classification: score.classification || 'average',
              chessNotation: score.chessNotation || '=',
              confidence: typeof score.confidence === 'number' ? score.confidence : 0.7,
              explanation: score.explanation || 'Analysis completed',
              betterMove: score.betterMove || undefined
            };
          });
          
          set({ scores: normalizedScores });
          get()._recomputeStats();
        },
        
        updateScore: (index, score) => {
          if (typeof index !== 'number' || !score) return;
          set((state) => ({
            scores: (state.scores || []).map((s, i) => i === index ? score : s)
          }));
          get()._recomputeStats();
        },

        // Pattern actions (no stats impact)
        setPatterns: (patterns) => set({ patterns: patterns || [] }),
        addPattern: (pattern) => {
          if (!pattern) return;
          set((state) => ({
            patterns: [...(state.patterns || []), pattern]
          }));
        },

        // Insight actions (no stats impact)
        setInsights: (insights) => set({ insights: insights || [] }),
        addInsight: (insight) => {
          if (!insight) return;
          set((state) => ({
            insights: [...(state.insights || []), insight]
          }));
        },

        // Session actions (no stats impact)
        setSessionSummary: (sessionSummary) => set({ sessionSummary }),
        setSessionMetadata: (metadata) => {
          if (!metadata) return;
          set((state) => ({
            sessionMetadata: { ...(state.sessionMetadata || {}), ...metadata }
          }));
        },

        // UI state actions (no stats impact)
        setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing: Boolean(isAnalyzing) }),
        setError: (error) => set({ error }),
        setProgress: (progress) => set({ 
          progress: progress || { current: 0, total: 0 }
        }),

        // ✅ ENHANCED: Reset actions with proper cleanup
        clearSession: () => {
          console.log('🧹 ANALYSIS STORE: Clearing session data');
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
          console.log('🔄 ANALYSIS STORE: Resetting to initial state');
          set(initialState);
        }
      }),
      {
        name: 'analysis-storage',
        partialize: (state) => ({
          sessionMetadata: state.sessionMetadata || {}
        })
      }
    ),
    {
      name: 'analysis-store'
    }
  )
);

// ✅ CLEAN SELECTORS - No side effects, stable references!
export const useMessages = () => useAnalysisStore((state) => state.messages || []);
export const useScores = () => useAnalysisStore((state) => state.scores || []);
export const usePatterns = () => useAnalysisStore((state) => state.patterns || []);
export const useInsights = () => useAnalysisStore((state) => state.insights || []);
export const useSessionSummary = () => useAnalysisStore((state) => state.sessionSummary);
export const useSessionMetadata = () => useAnalysisStore((state) => state.sessionMetadata || {});
export const useIsAnalyzing = () => useAnalysisStore((state) => state.isAnalyzing);
export const useAnalysisError = () => useAnalysisStore((state) => state.error);
export const useAnalysisProgress = () => useAnalysisStore((state) => state.progress || { current: 0, total: 0 });

// ✅ CLEAN computed selectors - Pure functions only!
export const useAnalysisStats = () => useAnalysisStore((state) => state.computedStats);
export const useCurrentTrend = () => useAnalysisStore((state) => state.computedStats?.trend || 'stable');
export const useDimensionAverages = () => useAnalysisStore((state) => 
  state.computedStats?.dimensionAverages || { strategic: 0, tactical: 0, cognitive: 0, innovation: 0 }
);

export default useAnalysisStore;