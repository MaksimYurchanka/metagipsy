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
}

const initialState = {
  messages: [],
  scores: [],
  patterns: [],
  insights: [],
  sessionSummary: null,
  sessionMetadata: {},
  isAnalyzing: false,
  error: null,
  progress: { current: 0, total: 0 }
};

export const useAnalysisStore = create<AnalysisState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Message actions
        setMessages: (messages) => set({ messages, scores: [], patterns: [], insights: [] }),
        
        addMessage: (message) => set((state) => ({
          messages: [...state.messages, { ...message, index: state.messages.length }]
        })),
        
        updateMessage: (index, messageUpdate) => set((state) => ({
          messages: state.messages.map((msg, i) => 
            i === index ? { ...msg, ...messageUpdate } : msg
          )
        })),
        
        removeMessage: (index) => set((state) => ({
          messages: state.messages.filter((_, i) => i !== index)
            .map((msg, i) => ({ ...msg, index: i })),
          scores: state.scores.filter((_, i) => i !== index),
        })),

        // Score actions
        setScores: (scores) => set({ scores }),
        
        updateScore: (index, score) => set((state) => ({
          scores: state.scores.map((s, i) => i === index ? score : s)
        })),

        // Pattern actions
        setPatterns: (patterns) => set({ patterns }),
        
        addPattern: (pattern) => set((state) => ({
          patterns: [...state.patterns, pattern]
        })),

        // Insight actions
        setInsights: (insights) => set({ insights }),
        
        addInsight: (insight) => set((state) => ({
          insights: [...state.insights, insight]
        })),

        // Session actions
        setSessionSummary: (sessionSummary) => set({ sessionSummary }),
        
        setSessionMetadata: (metadata) => set((state) => ({
          sessionMetadata: { ...state.sessionMetadata, ...metadata }
        })),

        // UI state actions
        setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
        setError: (error) => set({ error }),
        setProgress: (progress) => set({ progress }),

        // Reset actions
        clearSession: () => set({
          messages: [],
          scores: [],
          patterns: [],
          insights: [],
          sessionSummary: null,
          error: null,
          progress: { current: 0, total: 0 }
        }),
        
        resetState: () => set(initialState)
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

// Selectors
export const useMessages = () => useAnalysisStore((state) => state.messages);
export const useScores = () => useAnalysisStore((state) => state.scores);
export const usePatterns = () => useAnalysisStore((state) => state.patterns);
export const useInsights = () => useAnalysisStore((state) => state.insights);
export const useSessionSummary = () => useAnalysisStore((state) => state.sessionSummary);
export const useSessionMetadata = () => useAnalysisStore((state) => state.sessionMetadata);
export const useIsAnalyzing = () => useAnalysisStore((state) => state.isAnalyzing);
export const useAnalysisError = () => useAnalysisStore((state) => state.error);
export const useAnalysisProgress = () => useAnalysisStore((state) => state.progress);

// Computed selectors
export const useAnalysisStats = () => useAnalysisStore((state) => {
  const { scores, messages } = state;
  
  if (scores.length === 0) {
    return {
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      totalMessages: messages.length,
      completedAnalysis: 0
    };
  }
  
  const overallScores = scores.map(s => s.overall);
  
  return {
    averageScore: overallScores.reduce((sum, score) => sum + score, 0) / overallScores.length,
    bestScore: Math.max(...overallScores),
    worstScore: Math.min(...overallScores),
    totalMessages: messages.length,
    completedAnalysis: scores.length
  };
});

export const useCurrentTrend = () => useAnalysisStore((state) => {
  const { scores } = state;
  
  if (scores.length < 2) return 'stable';
  
  const recent = scores.slice(-3);
  const first = recent[0].overall;
  const last = recent[recent.length - 1].overall;
  
  const diff = last - first;
  
  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
});

export const useDimensionAverages = () => useAnalysisStore((state) => {
  const { scores } = state;
  
  if (scores.length === 0) {
    return {
      strategic: 0,
      tactical: 0,
      cognitive: 0,
      innovation: 0
    };
  }
  
  const totals = scores.reduce(
    (acc, score) => ({
      strategic: acc.strategic + score.dimensions.strategic,
      tactical: acc.tactical + score.dimensions.tactical,
      cognitive: acc.cognitive + score.dimensions.cognitive,
      innovation: acc.innovation + score.dimensions.innovation
    }),
    { strategic: 0, tactical: 0, cognitive: 0, innovation: 0 }
  );
  
  const count = scores.length;
  
  return {
    strategic: totals.strategic / count,
    tactical: totals.tactical / count,
    cognitive: totals.cognitive / count,
    innovation: totals.innovation / count
  };
});

export default useAnalysisStore;

