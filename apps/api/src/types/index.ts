import { Request } from 'express';

// Core types for MetaGipsy OWL Chess Engine API

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
  betterMove?: string; // Optional
}

export interface ConversationContext {
  userId?: string;
  sessionGoal?: string;
  projectContext?: string;
  previousMessages?: Message[];
  messagePosition?: number;
  scoreTrend?: 'improving' | 'declining' | 'stable';
  platform?: Platform;
  analysisDepth?: 'quick' | 'standard' | 'deep';
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
  sessionId?: string;
  messageCount: number;
  overallScore: number;
  trend: 'improving' | 'declining' | 'stable' | 'volatile'; // Include volatile
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

export type Platform = 'CLAUDE' | 'CHATGPT' | 'OTHER' | 'AUTO';

export type UserTier = 'free' | 'pro' | 'enterprise';

// Missing interfaces that caused build errors
export interface SessionMetadata {
  platform?: string;
  projectContext?: string;
  sessionGoal?: string;
  completedAt?: string;
  overallScore?: number;
  messageCount?: number;
  trend?: 'improving' | 'declining' | 'stable' | 'volatile';
  dimensionAverages?: {
    strategic: number;
    tactical: number;
    cognitive: number;
    innovation: number;
  };
  messages?: Message[];
  patterns?: Pattern[];
  insights?: Insight[];
}

export interface AnalysisPattern {
  type: string;
  name: string;
  description: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
  metadata?: Record<string, any>;
}

// API Request/Response types
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
    projectContext?: string;
    sessionGoal?: string;
  };
}

export interface AnalyzeResponse {
  sessionId?: string;
  messages: Message[];
  scores: Array<{
    messageIndex: number;
    role: string;
    score: ChessScore;
  }>;
  summary: SessionSummary;
  metadata: {
    analysisMethod: string;
    analysisDepth: string;
    processingTime: number;
    version: string;
    claudeAnalysisUsed?: boolean;
    cacheHit?: boolean;
  };
}

export interface QuickAnalyzeRequest {
  message: Message;
  context?: Partial<ConversationContext>;
}

export interface QuickAnalyzeResponse {
  score: ChessScore;
  processingTime: number;
  cached: boolean;
}

export interface SessionsQuery {
  userId?: string;
  platform?: Platform;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'score';
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export interface SessionsResponse {
  sessions: Array<{
    id: string;
    title?: string;
    platform: Platform;
    messageCount: number;
    averageScore: number;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface SessionDetailResponse {
  session: {
    id: string;
    title?: string;
    platform: Platform;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  messages: Message[];
  scores: ChessScore[];
  patterns: Pattern[];
  insights: Insight[];
  summary: SessionSummary;
}

export interface AnalyticsQuery {
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  granularity?: 'day' | 'week' | 'month';
}

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

export interface AnalyticsResponse {
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

// Session Data type for API responses
export interface SessionData {
  id: string;
  title?: string;
  platform: Platform;
  status: string;
  messageCount: number;
  overallScore?: number;
  projectContext?: string;
  sessionGoal?: string;
  completedAt?: string;
  trend?: 'improving' | 'declining' | 'stable' | 'volatile';
  dimensionAverages?: {
    strategic: number;
    tactical: number;
    cognitive: number;
    innovation: number;
  };
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  scores?: ChessScore[];
  patterns?: Pattern[];
  insights?: Insight[];
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

export class RateLimitError extends Error {
  constructor(message: string, public retryAfter: number) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

// WebSocket event types
export interface WebSocketEvents {
  // Client to server
  analyze: AnalyzeRequest;
  joinSession: { sessionId: string };
  leaveSession: { sessionId: string };
  
  // Server to client
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

// Configuration types
export interface AppConfig {
  port: number;
  host: string;
  nodeEnv: 'development' | 'production' | 'test';
  database: {
    url: string;
  };
  redis: {
    url: string;
  };
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
    serviceKey?: string; // Alias
  };
  anthropic?: {
    apiKey?: string;
  };
  jwt: {
    secret: string;
  };
  cors: {
    allowedOrigins: string[];
  };
  limits: {
    maxMessagesPerAnalysis: number;
    maxSessionsPerMonth: number;
    maxMessagesPerMonth: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  logging: {
    level: string;
  };
}

// Auth types for middleware
export interface User {
  id: string;
  email: string;
  role?: 'free' | 'pro' | 'enterprise' | 'admin';
  tier?: UserTier;
}

// REMOVED: AuthenticatedRequest interface (using the one from middleware/auth.ts instead)

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Scoring related types
export interface ScoringWeights {
  strategic: number;
  tactical: number;
  cognitive: number;
  innovation: number;
}

export interface ScoringOptions {
  useClaudeAnalysis?: boolean;
  analysisDepth?: 'quick' | 'standard' | 'deep';
  projectContext?: string;
  sessionGoal?: string;
}