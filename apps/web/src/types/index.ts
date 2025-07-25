// ✅ ENHANCED 5D TYPES for MetaGipsy OWL Frontend

export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  index?: number;
  metadata?: Record<string, any>;
}

// ✅ ENHANCED: 5D ChessScore with Context Dimension
export interface ChessScore {
  overall: number;
  dimensions: {
    strategic: number;
    tactical: number;
    cognitive: number;
    innovation: number;
    context: number; // ✅ NEW: 5th dimension - Context awareness
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

// ✅ ENHANCED: 5D SessionSummary with Context Dimension
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
    context: number; // ✅ NEW: 5th dimension average
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
  summary: SessionSummary; // ✅ NOW includes 5D averages
  scores: Array<{
    messageIndex: number;
    role: string;
    score: ChessScore; // ✅ NOW includes 5D scoring
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
  scores: ChessScore[]; // ✅ NOW includes 5D scoring
  patterns: Pattern[];
  sessionSummary: SessionSummary | null; // ✅ NOW includes 5D averages
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
    score?: ChessScore; // ✅ NOW includes 5D scoring
  };
  scoreUpdated: {
    messageIndex: number;
    score: ChessScore; // ✅ NOW includes 5D scoring
  };
  analysisComplete: AnalyzeResponse;
  analysisError: {
    message: string;
    code: string;
  };
  patternDetected: Pattern;
  insightGenerated: Insight;
}

// ✅ ENHANCED: Component Props Types with 5D support
export interface ScoreBadgeProps {
  score: number;
  dimension?: 'overall' | 'strategic' | 'tactical' | 'cognitive' | 'innovation' | 'context'; // ✅ NEW: Added 'context'
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showNotation?: boolean;
  className?: string;
}

export interface MessageAnalysisProps {
  message: Message;
  score: ChessScore; // ✅ NOW includes 5D scoring
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

// ✅ NEW: Enhanced types for 5D analysis components
export interface DimensionBreakdown {
  strategic: number;
  tactical: number;
  cognitive: number;
  innovation: number;
  context: number; // ✅ NEW: Context dimension
}

export interface DimensionAnalysis {
  dimension: keyof DimensionBreakdown;
  score: number;
  label: string;
  description: string;
  color: string;
  icon: string;
}

// ✅ NEW: Context-specific types for 5th dimension
export interface ContextMetrics {
  temporalUnderstanding: number;   // Understanding of conversation timeline
  stateAwareness: number;          // Recognition of current vs past state
  redundancyPrevention: number;    // Avoiding repeated suggestions
  metaCommunication: number;       // Clear about context limitations
  progressRecognition: number;     // Acknowledging user achievements
}

export interface ContextAnalysisProps {
  metrics: ContextMetrics;
  overallScore: number;
  suggestions: string[];
  isExpanded?: boolean;
  onToggle?: () => void;
}

// ✅ NEW: Enhanced Dashboard types with 5D support
export interface DashboardMetrics {
  totalSessions: number;
  totalMessages: number;
  averageScore: number;
  dimensionAverages: DimensionBreakdown; // ✅ NOW includes context
  recentTrend: 'improving' | 'declining' | 'stable';
  bestDimension: keyof DimensionBreakdown;
  weakestDimension: keyof DimensionBreakdown;
}

export interface SessionMetrics {
  id: string;
  title: string;
  platform: Platform;
  messageCount: number;
  overallScore: number;
  dimensionScores: DimensionBreakdown; // ✅ NOW includes context
  createdAt: string;
  trend: 'improving' | 'declining' | 'stable';
}

// ✅ NEW: Enhanced chart data types for 5D visualization
export interface ChartDataPoint {
  date: string;
  overall: number;
  strategic: number;
  tactical: number;
  cognitive: number;
  innovation: number;
  context: number; // ✅ NEW: Context dimension in charts
}

export interface DimensionChartProps {
  data: ChartDataPoint[];
  dimensions: (keyof DimensionBreakdown)[];
  height?: number;
  showLegend?: boolean;
  interactive?: boolean;
}

// ✅ NEW: Enhanced export types
export interface ExportData {
  session: {
    id: string;
    title: string;
    platform: Platform;
    createdAt: string;
    overallScore: number;
    dimensionAverages: DimensionBreakdown; // ✅ NOW includes context
  };
  messages: Array<{
    index: number;
    role: 'user' | 'assistant';
    content: string;
    scores: ChessScore; // ✅ NOW includes 5D scoring
  }>;
  insights: Insight[];
  patterns: Pattern[];
}

// ✅ NEW: Enhanced settings for 5D display
export interface DisplaySettings {
  showAllDimensions: boolean;
  highlightContext: boolean; // ✅ NEW: Option to highlight context dimension
  contextDetailLevel: 'basic' | 'detailed'; // ✅ NEW: Context detail level
  dimensionOrder: (keyof DimensionBreakdown)[]; // ✅ Customizable dimension order
}

// ✅ NEW: Enhanced error types for 5D system
export interface AnalysisError extends ApiError {
  failedDimensions?: (keyof DimensionBreakdown)[];
  recoveryAction?: string;
  canRetry?: boolean;
}

// ✅ NEW: Enhanced notification types
export interface AnalysisNotification {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  dimension?: keyof DimensionBreakdown; // ✅ Dimension-specific notifications
  actionable?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}