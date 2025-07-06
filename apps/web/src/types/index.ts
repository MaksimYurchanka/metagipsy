// Shared types for MetaGipsy OWL Frontend

export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  index?: number;
  metadata?: Record<string, any>;
}

export interface ChessScore {
  overall: number;
  dimensions: {
    strategic: number;
    tactical: number;
    cognitive: number;
    innovation: number;
  };
  classification: 'brilliant' | 'excellent' | 'good' | 'average' | 'mistake' | 'blunder';
  chessNotation: '!!' | '!' | '+' | '=' | '?' | '??';
  confidence: number;
  explanation?: string;
  betterMove?: string;
}

export interface Pattern {
  id?: string;
  type: 'momentum' | 'circular' | 'fatigue' | 'breakthrough' | 'decline' | 'oscillation';
  name: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
  description: string;
  metadata?: Record<string, any>;
}

export interface SessionSummary {
  sessionId: string;
  messageCount: number;
  overallScore: number;
  trend: 'improving' | 'declining' | 'stable';
  bestScore: number;
  worstScore: number;
  dimensionAverages: {
    strategic: number;
    tactical: number;
    cognitive: number;
    innovation: number;
  };
  patterns: Pattern[];
  insights: Insight[];
}

export interface Insight {
  id?: string;
  type: 'improvement' | 'warning' | 'celebration' | 'suggestion' | 'pattern';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  metadata?: Record<string, any>;
}

export type Platform = 'claude' | 'chatgpt' | 'other' | 'auto';

// API Types
export interface AnalyzeRequest {
  conversation: {
    messages: Message[];
    platform?: Platform;
  };
  metadata?: {
    sessionGoal?: string;
    projectContext?: string;
    userId?: string;
  };
  options?: {
    useClaudeAnalysis?: boolean;
    analysisDepth?: 'quick' | 'standard' | 'deep';
    enablePatternDetection?: boolean;
  };
}

export interface AnalyzeResponse {
  sessionId: string;
  createdAt: string;
  summary: SessionSummary;
  scores: Array<{
    messageIndex: number;
    role: string;
    score: ChessScore;
  }>;
  patterns?: {
    detected: Pattern[];
    confidence: number;
  };
  insights?: Insight[];
  metadata?: {
    processingTime: number;
    claudeAnalysisUsed: boolean;
    cacheHit: boolean;
  };
}

export interface SessionData {
  id: string;
  title?: string;
  platform: Platform;
  messageCount: number;
  averageScore: number;
  createdAt: string;
  updatedAt: string;
}

// UI State Types
export interface AnalysisState {
  messages: Message[];
  scores: ChessScore[];
  patterns: Pattern[];
  sessionSummary: SessionSummary | null;
  sessionMetadata: {
    platform?: Platform;
    projectContext?: string;
    sessionGoal?: string;
  };
  isAnalyzing: boolean;
  error: string | null;
}

export interface SettingsState {
  theme: 'dark' | 'light' | 'system';
  showChessNotation: boolean;
  autoDetectPlatform: boolean;
  enableSuggestions: boolean;
  compactMode: boolean;
  animationsEnabled: boolean;
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tier: 'free' | 'pro' | 'enterprise';
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  tier: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

// WebSocket Events
export interface WebSocketEvents {
  analysisProgress: {
    current: number;
    total: number;
    score?: ChessScore;
  };
  scoreUpdated: {
    messageIndex: number;
    score: ChessScore;
  };
  analysisComplete: AnalyzeResponse;
  analysisError: {
    message: string;
    code: string;
  };
  patternDetected: Pattern;
  insightGenerated: Insight;
}

// Component Props Types
export interface ScoreBadgeProps {
  score: number;
  dimension?: 'overall' | 'strategic' | 'tactical' | 'cognitive' | 'innovation';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showNotation?: boolean;
  className?: string;
}

export interface MessageAnalysisProps {
  message: Message;
  score: ChessScore;
  index: number;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export interface ConversationInputProps {
  onAnalyze: (messages: Message[]) => void;
  isAnalyzing?: boolean;
}

// Analytics Types
export interface AnalyticsData {
  overview: {
    totalSessions: number;
    totalMessages: number;
    averageScore: number;
    improvementRate: number;
  };
  trends: Array<{
    date: string;
    sessionsCount: number;
    averageScore: number;
    messageCount: number;
  }>;
  patterns: {
    mostCommon: Pattern[];
    emerging: Pattern[];
  };
  insights: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  };
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

