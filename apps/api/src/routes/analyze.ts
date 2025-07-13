// ✅ ENHANCED 5D ANALYZE ROUTES with Enhanced Parsing Support
// apps/api/src/routes/analyze.ts

import { Router } from 'express';
import { authenticateUser, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { rateLimiter } from '../lib/rate-limiter';
import { parseConversation, parseConversationEnhanced } from '../lib/conversation-parser';
import { LocalScoringEngine } from '../lib/scoring-engine';
import { ClaudeClient } from '../lib/claude-client';
import { SessionService } from '../services/session-service';
import { logger } from '../lib/logger';
import { config } from '../lib/config';
import { 
  AnalyzeRequest, 
  AnalyzeResponse, 
  ParseResult, 
  EnhancedParseRequest,
  ChessScore,
  SessionSummary,
  Platform
} from '../types'; // ✅ UNIFIED: Import from ../types

const router = Router();
const scoringEngine = new LocalScoringEngine(); // ✅ NOW supports 5D scoring
const claudeClient = new ClaudeClient();
const sessionService = new SessionService();

// ✅ MAIN ANALYSIS ENDPOINT - Enhanced with 5D Support
router.post('/', 
  optionalAuth,
  rateLimiter.createLimiter('analyze', 10, 60), // 10 requests per minute
  async (req: AuthenticatedRequest, res) => {
    const startTime = Date.now();
    req.startTime = startTime;
    
    try {
      const { conversation, options = {} }: AnalyzeRequest = req.body;

      if (!conversation || !conversation.messages || conversation.messages.length === 0) {
        return res.status(400).json({
          error: 'Invalid conversation data'
        });
      }

      if (conversation.messages.length > config.limits.maxMessagesPerAnalysis) {
        return res.status(400).json({
          error: `Too many messages. Maximum ${config.limits.maxMessagesPerAnalysis} allowed.`
        });
      }

      // ✅ ENHANCED: Parse and validate messages with unified types
      const messages = parseConversation(
        conversation.messages,
        conversation.platform || 'auto' // ✅ UNIFIED: lowercase platform
      );

      if (messages.length === 0) {
        return res.status(400).json({
          error: 'No valid messages found in conversation'
        });
      }

      // Create session if user is authenticated
      let sessionId: string | undefined;
      if (req.user) {
        sessionId = await sessionService.createSession(
          req.user.id, 
          req.user.email,
          {
            platform: conversation.platform || 'auto',
            projectContext: options.projectContext,
            sessionGoal: options.sessionGoal
          }
        );
      }

      // ✅ ENHANCED: Score messages with 5D support
      const scores: ChessScore[] = [];
      const useClaudeAnalysis = options.useClaudeAnalysis && 
        config.anthropic?.apiKey && 
        config.anthropic.apiKey.length > 0;

      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        
        try {
          let score: ChessScore;
          
          if (useClaudeAnalysis) {
            // Use Claude for enhanced analysis
            score = await claudeClient.analyzeMessage(
              message,
              {
                userId: req.user?.id,
                previousMessages: messages.slice(0, i),
                messagePosition: i,
                analysisDepth: options.analysisDepth || 'standard',
                projectContext: options.projectContext,
                sessionGoal: options.sessionGoal
              }
            );
          } else {
            // ✅ ENHANCED: Use 5D local scoring engine
            score = await scoringEngine.scoreMessage(
              message,
              {
                previousMessages: messages.slice(0, i),
                messagePosition: i,
                analysisDepth: options.analysisDepth || 'standard',
                projectContext: options.projectContext,
                sessionGoal: options.sessionGoal
              }
            );
          }

          scores.push(score);

          // Store message and score if session exists
          if (sessionId && req.user) {
            // This would be implemented with proper database operations
            // For now, we'll skip the database storage in this demo
          }

        } catch (error) {
          logger.error('Failed to score message', { 
            error, 
            messageIndex: i, 
            sessionId 
          });
          
          // ✅ ENHANCED: Fallback to 5D basic scoring
          const fallbackScore = await scoringEngine.scoreMessage(
            message,
            { 
              previousMessages: messages.slice(0, i),
              analysisDepth: 'quick' 
            }
          );
          scores.push(fallbackScore);
        }
      }

      // ✅ ENHANCED: Generate 5D session summary
      const overallScore = scores.reduce((sum, s) => sum + s.overall, 0) / scores.length;
      const bestScore = Math.max(...scores.map(s => s.overall));
      const worstScore = Math.min(...scores.map(s => s.overall));

      // Calculate trend (simple linear regression)
      const trend = calculateTrend(scores.map(s => s.overall));

      // ✅ ENHANCED: Calculate 5D dimension averages
      const dimensionAverages = {
        strategic: Math.round(scores.reduce((sum, s) => sum + s.dimensions.strategic, 0) / scores.length),
        tactical: Math.round(scores.reduce((sum, s) => sum + s.dimensions.tactical, 0) / scores.length),
        cognitive: Math.round(scores.reduce((sum, s) => sum + s.dimensions.cognitive, 0) / scores.length),
        innovation: Math.round(scores.reduce((sum, s) => sum + s.dimensions.innovation, 0) / scores.length),
        context: Math.round(scores.reduce((sum, s) => sum + s.dimensions.context, 0) / scores.length) // ✅ NEW: 5th dimension
      };

      // Detect patterns if enabled
      let patterns = [];
      if (options.enablePatternDetection) {
        patterns = detectPatterns(scores);
      }

      // ✅ ENHANCED: Generate insights with 5D awareness
      const insights = generateInsights(scores, messages, dimensionAverages);

      const sessionSummary: SessionSummary = {
        sessionId: sessionId || `temp_${Date.now()}`,
        messageCount: messages.length,
        overallScore: Math.round(overallScore),
        trend,
        bestScore: Math.round(bestScore),
        worstScore: Math.round(worstScore),
        dimensionAverages, // ✅ NOW includes 5D averages
        patterns,
        insights
      };

      // Update session with summary if authenticated
      if (sessionId && req.user) {
        await sessionService.updateSession(req.user.id, sessionId, sessionSummary);
      }

      const response: AnalyzeResponse = {
        sessionId,
        messages,
        scores: scores.map((score, index) => ({
          messageIndex: index,
          role: messages[index].role,
          score // ✅ NOW includes 5D scoring
        })),
        summary: sessionSummary, // ✅ NOW includes 5D averages
        metadata: {
          analysisMethod: useClaudeAnalysis ? 'claude' : 'local',
          analysisDepth: options.analysisDepth || 'standard',
          processingTime: Date.now() - startTime,
          version: '2.0.0', // ✅ ENHANCED: Version bump for 5D support
          claudeAnalysisUsed: useClaudeAnalysis,
          cacheHit: false
        }
      };

      res.json(response);

    } catch (error) {
      logger.error('Analysis endpoint error', { error });
      res.status(500).json({
        error: 'Analysis failed. Please try again.'
      });
    }
  }
);

// ✅ NEW: Enhanced parsing endpoint with AI support
router.post('/enhanced',
  optionalAuth,
  rateLimiter.createLimiter('enhanced_analyze', 5, 60), // 5 requests per minute (more intensive)
  async (req: AuthenticatedRequest, res) => {
    const startTime = Date.now();
    
    try {
      const { text, options = {}, metadata = {} }: EnhancedParseRequest = req.body;

      if (!text || typeof text !== 'string' || text.trim().length < 10) {
        return res.status(400).json({
          error: 'Invalid text input. Minimum 10 characters required.'
        });
      }

      if (text.length > 50000) {
        return res.status(400).json({
          error: 'Text too long. Maximum 50,000 characters allowed.'
        });
      }

      logger.info('Enhanced parsing request', {
        userId: req.user?.id,
        textLength: text.length,
        forceHaiku: options.forceHaiku,
        hasUserSignature: !!options.userSignature
      });

      // ✅ ENHANCED: Use enhanced conversation parsing
      const parseResult: ParseResult = await parseConversationEnhanced(text, {
        forceHaiku: options.forceHaiku,
        userSignature: options.userSignature,
        expectedPlatform: options.expectedPlatform,
        analysisDepth: options.analysisDepth,
        userId: req.user?.id,
        requestId: `enhanced_${Date.now()}`
      });

      // ✅ FOUNDATION: Prepare for verification workflow
      const needsVerification = parseResult.confidence < 0.8 || options.forceHaiku;
      
      if (needsVerification) {
        parseResult.verification = {
          needed: true,
          suggestions: generateParsingSuggestions(parseResult),
          ambiguousRanges: [] // Will be enhanced with Haiku integration
        };
      }

      const response = {
        success: true,
        result: parseResult,
        metadata: {
          processingTime: Date.now() - startTime,
          needsVerification,
          canProceedToAnalysis: parseResult.messages.length >= 2,
          estimatedAnalysisTime: parseResult.messages.length * 0.5 // seconds
        }
      };

      res.json(response);

    } catch (error) {
      logger.error('Enhanced parsing error', { error, userId: req.user?.id });
      res.status(500).json({
        error: 'Enhanced parsing failed. Please try again.',
        canFallback: true
      });
    }
  }
);

// ✅ NEW: Reparse endpoint for different methods
router.post('/reparse',
  optionalAuth,
  rateLimiter.createLimiter('reparse', 3, 60), // 3 requests per minute
  async (req: AuthenticatedRequest, res) => {
    const startTime = Date.now();
    
    try {
      const { text, method, userSignature, originalResult } = req.body;

      if (!text || !method) {
        return res.status(400).json({
          error: 'Text and method are required'
        });
      }

      if (!['pattern', 'haiku', 'hybrid'].includes(method)) {
        return res.status(400).json({
          error: 'Invalid method. Must be: pattern, haiku, or hybrid'
        });
      }

      logger.info('Reparse request', {
        userId: req.user?.id,
        method,
        textLength: text.length,
        hasOriginalResult: !!originalResult
      });

      // ✅ FOUNDATION: Enhanced parsing with specific method
      const parseResult = await parseConversationEnhanced(text, {
        forceHaiku: method === 'haiku',
        userSignature,
        userId: req.user?.id,
        requestId: `reparse_${method}_${Date.now()}`
      });

      // ✅ ENHANCED: Compare with original result if provided
      let comparison = null;
      if (originalResult) {
        comparison = {
          confidenceImprovement: parseResult.confidence - (originalResult.confidence || 0),
          messageCountDiff: parseResult.messages.length - (originalResult.messageCount || 0),
          methodChanged: parseResult.method !== (originalResult.method || 'unknown')
        };
      }

      const response = {
        success: true,
        result: parseResult,
        comparison,
        metadata: {
          processingTime: Date.now() - startTime,
          reparseMethod: method,
          improvement: comparison?.confidenceImprovement || 0
        }
      };

      res.json(response);

    } catch (error) {
      logger.error('Reparse error', { error, userId: req.user?.id });
      res.status(500).json({
        error: 'Reparse failed. Please try again.'
      });
    }
  }
);

// ✅ NEW: Quick validation endpoint
router.post('/validate',
  rateLimiter.createLimiter('validate', 20, 60), // 20 requests per minute (lightweight)
  async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          error: 'Text parameter required'
        });
      }

      // ✅ QUICK: Client-side validation logic
      const validation = {
        isValid: text.length >= 10 && text.length <= 50000,
        textLength: text.length,
        estimatedMessages: Math.max(1, Math.ceil(text.split('\n\n').length / 2)),
        detectedPlatform: detectPlatformQuick(text),
        hasRoleMarkers: /(?:Human|Assistant|User|ChatGPT|AI):/i.test(text),
        confidence: calculateQuickConfidence(text),
        suggestions: generateQuickSuggestions(text)
      };

      res.json({
        success: true,
        validation,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Validation error', { error });
      res.status(500).json({
        error: 'Validation failed'
      });
    }
  }
);

// ✅ ENHANCED: Helper functions with 5D support

function calculateTrend(scores: number[]): 'improving' | 'declining' | 'stable' | 'volatile' {
  if (scores.length < 3) return 'stable';

  // Simple linear regression
  const n = scores.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = scores.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * scores[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  // Calculate volatility (standard deviation)
  const mean = sumY / n;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  if (stdDev > 15) return 'volatile';
  if (slope > 2) return 'improving';
  if (slope < -2) return 'declining';
  return 'stable';
}

function detectPatterns(scores: ChessScore[]) {
  const patterns = [];

  // Momentum pattern (3+ consecutive improving scores)
  let momentum = 0;
  for (let i = 1; i < scores.length; i++) {
    if (scores[i].overall > scores[i - 1].overall) {
      momentum++;
    } else {
      if (momentum >= 2) {
        patterns.push({
          type: 'momentum',
          description: `Positive momentum detected: ${momentum + 1} consecutive improvements`,
          startIndex: i - momentum - 1,
          endIndex: i - 1,
          strength: Math.min(momentum / 3, 1)
        });
      }
      momentum = 0;
    }
  }

  // Fatigue pattern (declining scores towards end)
  const lastQuarter = scores.slice(-Math.ceil(scores.length / 4));
  const firstQuarter = scores.slice(0, Math.ceil(scores.length / 4));
  
  if (lastQuarter.length > 0 && firstQuarter.length > 0) {
    const lastAvg = lastQuarter.reduce((sum, s) => sum + s.overall, 0) / lastQuarter.length;
    const firstAvg = firstQuarter.reduce((sum, s) => sum + s.overall, 0) / firstQuarter.length;
    
    if (firstAvg - lastAvg > 10) {
      patterns.push({
        type: 'fatigue',
        description: 'Conversation quality declined towards the end',
        startIndex: scores.length - lastQuarter.length,
        endIndex: scores.length - 1,
        strength: Math.min((firstAvg - lastAvg) / 20, 1)
      });
    }
  }

  return patterns;
}

// ✅ ENHANCED: Generate insights with 5D awareness
function generateInsights(scores: ChessScore[], messages: any[], dimensionAverages: any) {
  const insights = [];

  // Overall performance insight
  const avgScore = scores.reduce((sum, s) => sum + s.overall, 0) / scores.length;
  if (avgScore >= 75) {
    insights.push({
      type: 'strength',
      title: 'Excellent Communication',
      description: 'Your conversation demonstrates strong performance across all 5 dimensions.',
      actionable: false
    });
  } else if (avgScore < 50) {
    insights.push({
      type: 'improvement',
      title: 'Communication Opportunity',
      description: 'Consider focusing on the specific dimensions that need improvement.',
      actionable: true,
      suggestion: 'Review the weakest dimension and apply targeted improvements.'
    });
  }

  // ✅ ENHANCED: 5D dimension-specific insights
  const weakestDimension = Object.entries(dimensionAverages)
    .sort(([,a], [,b]) => (a as number) - (b as number))[0];

  if ((weakestDimension[1] as number) < 60) {
    const suggestions = {
      strategic: 'Focus on clearly stating your goals and desired outcomes.',
      tactical: 'Be more specific about what you need and provide concrete examples.',
      cognitive: 'Consider the timing and complexity of your requests.',
      innovation: 'Try exploring creative approaches and alternative solutions.',
      context: 'Show awareness of conversation timeline and acknowledge completed tasks.' // ✅ NEW
    };

    insights.push({
      type: 'improvement',
      title: `Improve ${weakestDimension[0]} Dimension`,
      description: `Your ${weakestDimension[0]} scoring could be enhanced.`,
      actionable: true,
      suggestion: suggestions[weakestDimension[0] as keyof typeof suggestions]
    });
  }

  // ✅ NEW: Context-specific insights
  if (dimensionAverages.context < 50) {
    insights.push({
      type: 'improvement',
      title: 'Context Awareness Opportunity',
      description: 'Improve temporal understanding and state awareness in conversations.',
      actionable: true,
      suggestion: 'Reference previous discussion points and acknowledge completed tasks.'
    });
  }

  return insights;
}

// ✅ ENHANCED: Parsing helper functions
function generateParsingSuggestions(parseResult: ParseResult): string[] {
  const suggestions: string[] = [];
  
  if (parseResult.confidence < 0.5) {
    suggestions.push('Use clear role markers like "Human:" and "Assistant:" for better parsing accuracy.');
  }
  
  if (parseResult.messages.length < 2) {
    suggestions.push('Include at least 2 exchanges (question and answer) for meaningful analysis.');
  }
  
  if (!parseResult.messages.some(m => m.role === 'user') || !parseResult.messages.some(m => m.role === 'assistant')) {
    suggestions.push('Ensure both user questions and assistant responses are present.');
  }
  
  return suggestions;
}

function detectPlatformQuick(text: string): Platform {
  const lower = text.toLowerCase();
  if (lower.includes('human:') && lower.includes('assistant:')) return 'claude';
  if (lower.includes('user:') && lower.includes('chatgpt:')) return 'chatgpt';
  if (lower.includes('my:') || lower.includes('jd:')) return 'other';
  return 'auto';
}

function calculateQuickConfidence(text: string): number {
  let confidence = 0.5;
  
  // Role markers present
  if (/(?:Human|Assistant|User|ChatGPT|AI):/gi.test(text)) confidence += 0.3;
  
  // Good length
  if (text.length > 100 && text.length < 10000) confidence += 0.1;
  
  // Multiple exchanges
  const markers = text.match(/(?:Human|Assistant|User|ChatGPT|AI):/gi) || [];
  if (markers.length >= 4) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}

function generateQuickSuggestions(text: string): string[] {
  const suggestions: string[] = [];
  
  if (text.length < 50) {
    suggestions.push('Conversation seems too short. Include more exchanges for better analysis.');
  }
  
  if (!/(?:Human|Assistant|User|ChatGPT|AI):/i.test(text)) {
    suggestions.push('Add role markers like "Human:" and "Assistant:" for clearer parsing.');
  }
  
  if (text.length > 20000) {
    suggestions.push('Very long conversation. Consider breaking into smaller sessions.');
  }
  
  return suggestions;
}

export default router;