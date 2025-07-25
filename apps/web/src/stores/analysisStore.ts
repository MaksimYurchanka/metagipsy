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
  
  // ✅ ENHANCED: Store 5D raw stats to prevent object recreation
  _rawStats: {
    averageScore: number;
    bestScore: number;
    worstScore: number;
    totalMessages: number;
    completedAnalysis: number;
    strategicAvg: number;
    tacticalAvg: number;
    cognitiveAvg: number;
    innovationAvg: number;
    contextAvg: number; // ✅ NEW: 5th dimension support
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

// ✅ ENHANCED: Calculate 5D raw stats with stable values
const calculateRawStats = (messages: Message[], scores: ChessScore[]) => {
  console.log('📊 CALCULATE STATS 5D: Computing for', messages.length, 'messages,', scores.length, 'scores');
  
  if (!scores || scores.length === 0) {
    return {
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      totalMessages: messages?.length || 0,
      completedAnalysis: 0,
      strategicAvg: 0,
      tacticalAvg: 0,
      cognitiveAvg: 0,
      innovationAvg: 0,
      contextAvg: 0, // ✅ NEW: Context dimension default
      trend: 'stable' as const
    };
  }
  
  // ✅ Filter valid scores
  const validScores = scores.filter(s => s && typeof s.overall === 'number');
  
  if (validScores.length === 0) {
    return {
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      totalMessages: messages?.length || 0,
      completedAnalysis: 0,
      strategicAvg: 0,
      tacticalAvg: 0,
      cognitiveAvg: 0,
      innovationAvg: 0,
      contextAvg: 0, // ✅ NEW: Context dimension default
      trend: 'stable' as const
    };
  }
  
  const overallScores = validScores.map(s => s.overall || 0);
  
  // ✅ ENHANCED: Calculate all 5 dimension totals safely
  let strategicTotal = 0, tacticalTotal = 0, cognitiveTotal = 0, innovationTotal = 0, contextTotal = 0;
  
  validScores.forEach(score => {
    const dimensions = score?.dimensions || {};
    strategicTotal += typeof dimensions.strategic === 'number' ? dimensions.strategic : 0;
    tacticalTotal += typeof dimensions.tactical === 'number' ? dimensions.tactical : 0;
    cognitiveTotal += typeof dimensions.cognitive === 'number' ? dimensions.cognitive : 0;
    innovationTotal += typeof dimensions.innovation === 'number' ? dimensions.innovation : 0;
    contextTotal += typeof dimensions.context === 'number' ? dimensions.context : 0; // ✅ NEW: Context calculation
  });
  
  const count = validScores.length;
  
  // ✅ Calculate trend safely
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
  
  // ✅ ENHANCED: Return flat object with 5D stable values
  const stats = {
    averageScore: Math.round(overallScores.reduce((sum, score) => sum + score, 0) / overallScores.length),
    bestScore: Math.max(...overallScores),
    worstScore: Math.min(...overallScores),
    totalMessages: messages?.length || 0,
    completedAnalysis: validScores.length,
    strategicAvg: Math.round(strategicTotal / count),
    tacticalAvg: Math.round(tacticalTotal / count),
    cognitiveAvg: Math.round(cognitiveTotal / count),
    innovationAvg: Math.round(innovationTotal / count),
    contextAvg: Math.round(contextTotal / count), // ✅ NEW: Context average calculation
    trend
  };
  
  console.log('✅ CALCULATE STATS 5D: Result:', stats);
  return stats;
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
  _rawStats: calculateRawStats([], [])
};

export const useAnalysisStore = create<AnalysisState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ✅ ENHANCED: Stable recompute with 5D comparison
        _recomputeStats: () => {
          try {
            const state = get();
            const newStats = calculateRawStats(state.messages, state.scores);
            const currentStats = state._rawStats;
            
            // ✅ ENHANCED: Compare all 5D stats for changes
            const hasChanged = (
              newStats.averageScore !== currentStats.averageScore ||
              newStats.bestScore !== currentStats.bestScore ||
              newStats.totalMessages !== currentStats.totalMessages ||
              newStats.completedAnalysis !== currentStats.completedAnalysis ||
              newStats.strategicAvg !== currentStats.strategicAvg ||
              newStats.tacticalAvg !== currentStats.tacticalAvg ||
              newStats.cognitiveAvg !== currentStats.cognitiveAvg ||
              newStats.innovationAvg !== currentStats.innovationAvg ||
              newStats.contextAvg !== currentStats.contextAvg || // ✅ NEW: Context comparison
              newStats.trend !== currentStats.trend
            );
            
            if (hasChanged) {
              console.log('📊 STATS 5D CHANGED: Updating store');
              set({ _rawStats: newStats });
            } else {
              console.log('📊 STATS 5D UNCHANGED: Skipping update');
            }
          } catch (error) {
            console.error('❌ ANALYSIS STORE 5D: Stats calculation failed:', error);
            // Set safe fallback stats
            set({
              _rawStats: {
                averageScore: 0,
                bestScore: 0,
                worstScore: 0,
                totalMessages: get().messages?.length || 0,
                completedAnalysis: 0,
                strategicAvg: 0,
                tacticalAvg: 0,
                cognitiveAvg: 0,
                innovationAvg: 0,
                contextAvg: 0, // ✅ NEW: Context fallback
                trend: 'stable' as const
              }
            });
          }
        },

        // ✅ All mutations trigger stats recomputation
        setMessages: (messages) => {
          console.log('📝 ANALYSIS STORE 5D: Setting messages:', messages?.length || 0);
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

        // ✅ ENHANCED: Score actions with 5D validation
        setScores: (scores) => {
          console.log('🎯 ANALYSIS STORE 5D: Setting scores:', scores?.length || 0);
          if (!Array.isArray(scores)) {
            console.error('❌ ANALYSIS STORE 5D: Invalid scores format, expected array:', scores);
            return;
          }
          
          // ✅ ENHANCED: Normalize scores with 5D support
          const normalizedScores = scores.map((score, index) => {
            if (!score || typeof score !== 'object') {
              console.warn(`⚠️ ANALYSIS STORE 5D: Invalid score at index ${index}:`, score);
              return {
                overall: 50,
                dimensions: { 
                  strategic: 50, 
                  tactical: 50, 
                  cognitive: 50, 
                  innovation: 50,
                  context: 50 // ✅ NEW: Context default
                },
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
                innovation: score.dimensions?.innovation || 50,
                context: score.dimensions?.context || 0 // ✅ NEW: Context dimension support
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

        // Reset actions
        clearSession: () => {
          console.log('🧹 ANALYSIS STORE 5D: Clearing session data');
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
          console.log('🔄 ANALYSIS STORE 5D: Resetting to initial state');
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
      name: 'analysis-store-5d'
    }
  )
);

// ✅ STABLE SELECTORS - Return primitive values to prevent object recreation
export const useMessages = () => useAnalysisStore((state) => state.messages || []);
export const useScores = () => useAnalysisStore((state) => state.scores || []);
export const usePatterns = () => useAnalysisStore((state) => state.patterns || []);
export const useInsights = () => useAnalysisStore((state) => state.insights || []);
export const useSessionSummary = () => useAnalysisStore((state) => state.sessionSummary);
export const useSessionMetadata = () => useAnalysisStore((state) => state.sessionMetadata || {});
export const useIsAnalyzing = () => useAnalysisStore((state) => state.isAnalyzing);
export const useAnalysisError = () => useAnalysisStore((state) => state.error);
export const useAnalysisProgress = () => useAnalysisStore((state) => state.progress || { current: 0, total: 0 });

// ✅ CRITICAL FIX: Individual primitive selectors instead of object selectors
export const useAverageScore = () => useAnalysisStore((state) => state._rawStats.averageScore);
export const useBestScore = () => useAnalysisStore((state) => state._rawStats.bestScore);
export const useWorstScore = () => useAnalysisStore((state) => state._rawStats.worstScore);
export const useTotalMessages = () => useAnalysisStore((state) => state._rawStats.totalMessages);
export const useCompletedAnalysis = () => useAnalysisStore((state) => state._rawStats.completedAnalysis);
export const useCurrentTrend = () => useAnalysisStore((state) => state._rawStats.trend);

// ✅ ENHANCED: All 5D dimension selectors
export const useStrategicAvg = () => useAnalysisStore((state) => state._rawStats.strategicAvg);
export const useTacticalAvg = () => useAnalysisStore((state) => state._rawStats.tacticalAvg);
export const useCognitiveAvg = () => useAnalysisStore((state) => state._rawStats.cognitiveAvg);
export const useInnovationAvg = () => useAnalysisStore((state) => state._rawStats.innovationAvg);
export const useContextAvg = () => useAnalysisStore((state) => state._rawStats.contextAvg); // ✅ NEW: Context selector

export default useAnalysisStore;