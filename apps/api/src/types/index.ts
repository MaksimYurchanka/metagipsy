import { Request } from 'express';

// ✅ CORE TYPES for MetaGipsy OWL Chess Engine API - UNIFIED & 5D READY

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
    context: number; // ✅ NEW: 5th dimension for context awareness
  };
  classification: 'brilliant' | 'excellent' | 'good' | 'average' | 'mistake' | 'blunder';
  chessNotation: '!!' | '!' | '+' | '=' | '?' | '??';
  confidence: number;
  explanation?: string;
  betterMove?: string;
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

// ✅ ENHANCED: 5D SessionSummary with Context Dimension
export interface SessionSummary {
  sessionId?: string;
  messageCount: number;
  overallScore: number;
  trend: 'improving' | 'declining' | 'stable' | 'volatile';
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

// ✅ UNIFIED: Platform types - lowercase for frontend compatibility
export type Platform = 'claude' | 'chatgpt' | 'other' | 'auto';

export type UserTier = 'free' | 'pro' | 'enterprise';

// ✅ ENHANCED: SessionMetadata with 5D support
export interface SessionMetadata {
  title?: string;
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
    context: number; // ✅ NEW: 5th dimension in metadata
  };
  messages?: Message[];
  patterns?: Pattern[];
  insights?: Insight[];
  // ✅ NEW: Enhanced parsing metadata
  parsingMethod?: 'pattern' | 'haiku' | 'hybrid';
  parsingConfidence?: number;
  parsingCost?: number;
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

// ✅ ENHANCED: API Request/Response types with parsing support
export interface AnalyzeRequest {
  conversation: {
    messages: Message[];
    platform?: Platform;
  };
  metadata?: {
    sessionGoal?: string;
    projectContext?: string;
    userId?: string;
    // ✅ NEW: Enhanced parsing metadata
    userSignature?: string;
    parsingMethod?: 'pattern' | 'haiku' | 'hybrid';
    originalText?: string;
  };
  options?: {
    useClaudeAnalysis?: boolean;
    analysisDepth?: 'quick' | 'standard' | 'deep';
    enablePatternDetection?: boolean;
    projectContext?: string;
    sessionGoal?: string;
    // ✅ NEW: Enhanced parsing options
    forceHaiku?: boolean;
    enableEnhancedParsing?: boolean;
  };
}

export interface AnalyzeResponse {
  sessionId?: string;
  messages: Message[];
  scores: Array<{
    messageIndex: number;
    role: string;
    score: ChessScore; // ✅ Now includes 5D scoring
  }>;
  summary: SessionSummary; // ✅ Now includes 5D averages
  metadata: {
    analysisMethod: string;
    analysisDepth: string;
    processingTime: number;
    version: string;
    claudeAnalysisUsed?: boolean;
    cacheHit?: boolean;
    // ✅ NEW: Enhanced parsing metadata
    parsingMethod?: string;
    parsingConfidence?: number;
    parsingCost?: number;
  };
}

export interface QuickAnalyzeRequest {
  message: Message;
  context?: Partial<ConversationContext>;
}

export interface QuickAnalyzeResponse {
  score: ChessScore; // ✅ Now includes 5D scoring
  processingTime: number;
  cached: boolean;
}

// ✅ NEW: Enhanced Parsing Types (Foundation for future integration)
export interface ParseResult {
  messages: Message[];
  platform: Platform; // ✅ Uses unified lowercase platform
  confidence: number;
  method?: 'pattern' | 'haiku' | 'hybrid';
  verification?: {
    needed: boolean;
    suggestions: string[];
    ambiguousRanges?: Array<{ start: number; end: number; issue: string }>;
  };
  metadata?: {
    originalLength: number;
    processingTime: number;
    cost?: number;
    patternLearning?: string[];
  };
}

export interface EnhancedParseRequest {
  text: string;
  options?: {
    forceHaiku?: boolean;
    userSignature?: string;
    expectedPlatform?: Platform;
    analysisDepth?: 'quick' | 'standard' | 'deep';
  };
  metadata?: {
    userId?: string;
    sessionId?: string;
    projectContext?: string;
    sessionGoal?: string;
    timestamp?: string;
  };
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
  scores: ChessScore[]; // ✅ Now includes 5D scoring
  patterns: Pattern[];
  insights: Insight[];
  summary: SessionSummary; // ✅ Now includes 5D averages
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

// ✅ ENHANCED: SessionData type with 5D support
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
    context: number; // ✅ NEW: 5th dimension in session data
  };
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  scores?: ChessScore[]; // ✅ Now includes 5D scoring
  patterns?: Pattern[];
  insights?: Insight[];
  // ✅ NEW: Enhanced parsing data
  parsingMethod?: string;
  parsingConfidence?: number;
  parsingCost?: number;
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
    score?: ChessScore; // ✅ Now includes 5D scoring
  };
  scoreUpdated: {
    messageIndex: number;
    score: ChessScore; // ✅ Now includes 5D scoring
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
    serviceKey?: string;
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

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ✅ ENHANCED: Scoring related types with 5D support
export interface ScoringWeights {
  strategic: number;
  tactical: number;
  cognitive: number;
  innovation: number;
  context: number; // ✅ NEW: 5th dimension weight
}

export interface ScoringOptions {
  useClaudeAnalysis?: boolean;
  analysisDepth?: 'quick' | 'standard' | 'deep';
  projectContext?: string;
  sessionGoal?: string;
  // ✅ NEW: Enhanced parsing options in scoring
  enableEnhancedParsing?: boolean;
  userSignature?: string;
  parsingMethod?: 'pattern' | 'haiku' | 'hybrid';
}

// ✅ NEW: Context Analysis Types (5th Dimension Support)
export interface ContextAnalysis {
  temporalUnderstanding: number; // 0-100: Understanding of conversation timeline
  stateAwareness: number;        // 0-100: Recognition of current vs past state
  redundancyPrevention: number;  // 0-100: Avoiding repeated suggestions
  metaCommunication: number;     // 0-100: Clear about context limitations
  progressRecognition: number;   // 0-100: Acknowledging user achievements
}

export interface ContextualScore {
  overall: number;
  components: ContextAnalysis;
  explanation: string;
  improvements: string[];
}

// ✅ NEW: Enhanced Parsing Integration Types
export interface ParsingIntegration {
  method: 'pattern' | 'haiku' | 'hybrid';
  confidence: number;
  cost: number;
  processingTime: number;
  userPatterns?: string[];
  verification?: {
    needed: boolean;
    suggestions: string[];
  };
}

// ✅ NEW: Database Integration Types (for schema updates)
export interface DatabaseSession {
  id: string;
  userId: string;
  title?: string;
  platform: Platform;
  messageCount: number;
  overallScore: number;
  strategicAvg: number;
  tacticalAvg: number;
  cognitiveAvg: number;
  innovationAvg: number;
  contextAvg: number; // ✅ NEW: 5th dimension for database
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseScore {
  id: string;
  messageId: string;
  sessionId: string;
  overall: number;
  strategic: number;
  tactical: number;
  cognitive: number;
  innovation: number;
  context: number; // ✅ NEW: 5th dimension for database
  classification: string;
  chessNotation: string;
  confidence: number;
  explanation?: string;
  betterMove?: string;
  createdAt: Date;
}