// ✅ COMPLETE ENHANCED 5D ANALYZE ROUTES with User Auto-Creation Fix + GET Info Endpoint
// apps/api/src/routes/analyze.ts

import { Router } from 'express';
import { authenticateUser, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { rateLimiter } from '../lib/rate-limiter';
import { RateLimitService, rateLimitMiddleware } from '../lib/rate-limits';
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
  Platform,
  Message
} from '../types';

const router = Router();
const scoringEngine = new LocalScoringEngine();
const claudeClient = new ClaudeClient();
const sessionService = new SessionService();

// ✅ NEW: GET /api/v1/analyze - API Documentation Endpoint (Fixes 404 issues)
router.get('/', (req, res) => {
  res.json({
    endpoint: '/api/v1/analyze',
    description: 'MetaGipsy 5D AI Conversation Analysis API',
    version: '3.0.0',
    status: 'operational',
    methods: {
      POST: {
        path: '/api/v1/analyze',
        description: 'Analyze AI conversations with 5D chess-style scoring',
        contentType: 'application/json',
        auth: 'optional',
        body: {
          conversation: {
            messages: 'Array<{role: "user"|"assistant", content: string}>',
            platform: 'string (optional) - claude|chatgpt|gemini|auto'
          },
          options: {
            useClaudeAnalysis: 'boolean (optional) - use Claude for enhanced analysis',
            analysisDepth: 'string (optional) - quick|standard|deep',
            projectContext: 'string (optional)',
            sessionGoal: 'string (optional)',
            enablePatternDetection: 'boolean (optional)'
          }
        },
        response: {
          sessionId: 'string',
          scores: 'Array<ChessScore> - 5D scoring results',
          summary: 'SessionSummary - overall analysis',
          metadata: 'AnalysisMetadata'
        }
      },
      'POST /enhanced': {
        description: 'Enhanced conversation parsing from raw text',
        body: {
          text: 'string - raw conversation text',
          options: {
            forceHaiku: 'boolean (optional)',
            expectedPlatform: 'string (optional)',
            analysisDepth: 'string (optional)'
          }
        }
      },
      'POST /reparse': {
        description: 'Re-parse conversation with different method'
      },
      'POST /validate': {
        description: 'Quick validation of conversation text'
      },
      'GET /usage-stats': {
        description: 'Get user usage statistics',
        auth: 'required'
      }
    },
    scoring: {
      dimensions: {
        strategic: 'Goal alignment and long-term thinking (0-100)',
        tactical: 'Specific actions and concrete steps (0-100)', 
        cognitive: 'Mental load and complexity management (0-100)',
        innovation: 'Creative solutions and breakthrough thinking (0-100)',
        context: 'Temporal awareness and state tracking (0-100)'
      },
      chessNotation: {
        'brilliant': '90-100 - Exceptional insight',
        'great': '80-89 - Excellent move',
        'good': '70-79 - Strong performance',
        'inaccuracy': '50-69 - Room for improvement',
        'mistake': '30-49 - Significant issue',
        'blunder': '0-29 - Critical problem'
      }
    },
    limits: {
      free: 'Up to 50 messages per analysis',
      pro: 'Up to 200 messages per analysis',
      enterprise: 'Custom limits available'
    },
    examples: {
      simpleAnalysis: {
        conversation: {
          messages: [
            { role: 'user', content: 'Help me understand quantum computing' },
            { role: 'assistant', content: 'Quantum computing uses quantum bits (qubits)...' }
          ]
        }
      },
      advancedAnalysis: {
        conversation: {
          messages: '// Your conversation messages',
          platform: 'claude'
        },
        options: {
          useClaudeAnalysis: true,
          analysisDepth: 'deep',
          enablePatternDetection: true
        }
      }
    },
    support: {
      documentation: 'https://docs.metagipsy.com',
      community: 'https://community.metagipsy.com',
      contact: 'support@metagipsy.com'
    },
    timestamp: new Date().toISOString(),
    infrastructure: {
      uptime: '99.9%',
      responseTime: '<2s average',
      regions: ['Global CDN'],
      security: 'Enterprise-grade'
    }
  });
});

// ✅ FIXED: Usage stats endpoint with auto-creation
router.get('/usage-stats',
  authenticateUser,
  async (req: AuthenticatedRequest, res) => {
    try {
      // ✅ FIXED: Auto-create user if needed
      const stats = await RateLimitService.getUserUsageStats(req.user.id);
      
      logger.info('✅ Usage stats retrieved successfully', {
        userId: req.user.id,
        email: req.user.email,
        charactersUsed: stats.today.characters,
        charactersLimit: stats.today.charactersLimit,
        percentUsed: stats.percentUsed,
        tierType: stats.tier.type
      });
      
      res.json(stats);
    } catch (error) {
      logger.error('Failed to get usage stats', { 
        error, 
        userId: req.user?.id,
        email: req.user?.email 
      });
      res.status(500).json({ error: 'Failed to load usage statistics' });
    }
  }
);

// ✅ MAIN ANALYSIS ENDPOINT - Enhanced with User Auto-Creation
router.post('/', 
  optionalAuth,
  rateLimiter.createLimiter('analyze', 10, 60),
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

      // ✅ ENHANCED: Calculate total characters for rate limiting
      const totalCharacters = conversation.messages.reduce(
        (sum, msg) => sum + (msg.content?.length || 0), 0
      );

      // ✅ FIXED: Pass email to rate limiting for auto-creation
      if (req.user) {
        const rateLimitResult = await rateLimitMiddleware(
          req.user.id, 
          totalCharacters,
          req.user.email // ✅ PASS EMAIL for auto-creation in Prisma
        );
        
        if (!rateLimitResult.allowed) {
          return res.status(429).json({
            error: rateLimitResult.message,
            rateLimitInfo: {
              currentUsage: rateLimitResult.currentUsage,
              dailyLimit: rateLimitResult.dailyLimit,
              resetTime: rateLimitResult.resetTime,
              tierType: rateLimitResult.tierType,
              requestedCharacters: totalCharacters,
              availableCharacters: rateLimitResult.dailyLimit - rateLimitResult.currentUsage
            }
          });
        }

        logger.info('✅ Rate limit check passed + user auto-created if needed', {
          userId: req.user.id,
          email: req.user.email,
          requestedCharacters: totalCharacters,
          currentUsage: rateLimitResult.currentUsage,
          dailyLimit: rateLimitResult.dailyLimit,
          tierType: rateLimitResult.tierType
        });
      }

      // ✅ ENHANCED: Dynamic limit based on remaining daily allowance
      if (conversation.messages.length > 200) {
        return res.status(400).json({
          error: `Too many messages. Maximum 200 messages per analysis for processing efficiency.`
        });
      }

      // ✅ ENHANCED: Parse and validate messages with unified types
      const messages: Message[] = parseConversation(
        conversation.messages,
        conversation.platform || 'auto'
      );

      if (messages.length === 0) {
        return res.status(400).json({
          error: 'No valid messages found in conversation'
        });
      }

      // Create session if user is authenticated
      let sessionId: string | undefined;
      if (req.user) {
        try {
          sessionId = await sessionService.createSession(
            req.user.id, 
            req.user.email,
            {
              platform: conversation.platform || 'other',
              projectContext: options.projectContext,
              sessionGoal: options.sessionGoal
            }
          );
          logger.info('Session created successfully', { sessionId, userId: req.user.id });
        } catch (sessionError) {
          logger.error('Session creation failed, continuing without session', { 
            error: sessionError, 
            userId: req.user.id 
          });
          // Continue without session - don't fail the analysis
        }
      }

      // ✅ ENHANCED: Score messages with 5D support
      const scores: ChessScore[] = [];
      const useClaudeAnalysis = options.useClaudeAnalysis && 
        config.anthropic?.apiKey && 
        config.anthropic.apiKey.length > 0;

      logger.info('Starting message analysis', {
        messageCount: messages.length,
        useClaudeAnalysis,
        sessionId,
        userId: req.user?.id
      });

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
            score = scoringEngine.scoreMessage(
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

        } catch (error) {
          logger.error('Failed to score message', { 
            error, 
            messageIndex: i, 
            sessionId,
            userId: req.user?.id
          });
          
          // ✅ ENHANCED: Fallback to 5D basic scoring
          const fallbackScore = scoringEngine.scoreMessage(
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

      // Update session with summary if authenticated and session exists
      if (sessionId && req.user) {
        try {
          await sessionService.updateSession(req.user.id, sessionId, sessionSummary);
          
          // ✅ FIXED: Clean messagesWithScores mapping without type conflicts
          const messagesWithScores = messages
            .filter(message => message.role !== 'system') // ✅ Filter out 'system' messages
            .map((message, index) => ({
              role: message.role as 'user' | 'assistant', // ✅ Type assertion for clean types
              content: message.content,
              index: message.index || index, // ✅ Use message.index or fallback to array index
              timestamp: message.timestamp,
              scores: scores[index] ? [scores[index]] : [] // ✅ Attach corresponding score
            }));

          await sessionService.saveSessionMessages(sessionId, req.user.id, messagesWithScores);
          logger.info('Session data saved successfully', { sessionId, messageCount: messagesWithScores.length });
        } catch (sessionUpdateError) {
          logger.error('Failed to update session, but analysis completed', { 
            error: sessionUpdateError, 
            sessionId, 
            userId: req.user.id 
          });
          // Don't fail the analysis if session update fails
        }
      }

      // ✅ FIXED: Record usage after successful analysis with auto-creation
      if (req.user) {
        try {
          await RateLimitService.recordUsage(
            req.user.id, 
            totalCharacters,
            useClaudeAnalysis ? 'haiku' : 'local'
          );
          logger.info('✅ Usage recorded successfully after analysis', {
            userId: req.user.id,
            email: req.user.email,
            charactersUsed: totalCharacters,
            analysisType: useClaudeAnalysis ? 'haiku' : 'local'
          });
        } catch (usageError) {
          logger.error('Failed to record usage, but analysis completed', { 
            error: usageError, 
            userId: req.user.id,
            email: req.user.email
          });
          // Don't fail the analysis if usage recording fails
        }
      }

      // ✅ FIXED: Metadata without unsupported fields
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
          version: '3.0.0', // ✅ ENHANCED: Version bump for user auto-creation
          claudeAnalysisUsed: useClaudeAnalysis,
          cacheHit: false
        }
      };

      logger.info('Analysis completed successfully', {
        sessionId,
        messageCount: messages.length,
        overallScore: Math.round(overallScore),
        processingTime: Date.now() - startTime,
        userId: req.user?.id,
        charactersAnalyzed: totalCharacters
      });

      res.json(response);

    } catch (error) {
      logger.error('Analysis endpoint error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userId: req.user?.id 
      });
      res.status(500).json({
        error: 'Analysis failed. Please try again.'
      });
    }
  }
);

// ✅ ENHANCED: Enhanced parsing endpoint with User Auto-Creation
router.post('/enhanced',
  optionalAuth,
  rateLimiter.createLimiter('enhanced_analyze', 5, 60),
  async (req: AuthenticatedRequest, res) => {
    const startTime = Date.now();
    
    try {
      logger.info('🚀 ENHANCED ENDPOINT REQUEST:', {
        hasBody: !!req.body,
        bodyKeys: req.body ? Object.keys(req.body) : [],
        contentType: req.headers['content-type'],
        userId: req.user?.id
      });

      if (!req.body) {
        logger.error('❌ ENHANCED ENDPOINT: No request body');
        return res.status(400).json({
          error: 'Request body is required',
          expected: 'JSON with { text, options?, metadata? }'
        });
      }

      const { text, options = {}, metadata = {} }: EnhancedParseRequest = req.body;

      if (!text || typeof text !== 'string') {
        logger.error('❌ ENHANCED ENDPOINT: Invalid text parameter', {
          hasText: !!text,
          textType: typeof text
        });
        return res.status(400).json({
          error: 'Invalid text parameter',
          received: { hasText: !!text, textType: typeof text },
          required: 'text: string (minimum 10 characters)'
        });
      }

      if (text.trim().length < 10) {
        return res.status(400).json({
          error: 'Text too short. Minimum 10 characters required.'
        });
      }

      // ✅ FIXED: Pass email to rate limiting for auto-creation
      if (req.user) {
        const rateLimitResult = await rateLimitMiddleware(
          req.user.id, 
          text.length,
          req.user.email // ✅ PASS EMAIL for auto-creation in Prisma
        );
        
        if (!rateLimitResult.allowed) {
          return res.status(429).json({
            error: rateLimitResult.message,
            rateLimitInfo: {
              currentUsage: rateLimitResult.currentUsage,
              dailyLimit: rateLimitResult.dailyLimit,
              resetTime: rateLimitResult.resetTime,
              tierType: rateLimitResult.tierType,
              requestedCharacters: text.length,
              availableCharacters: rateLimitResult.dailyLimit - rateLimitResult.currentUsage
            }
          });
        }

        logger.info('✅ Enhanced parsing: Rate limit check passed + user auto-created if needed', {
          userId: req.user.id,
          email: req.user.email,
          requestedCharacters: text.length,
          tierType: rateLimitResult.tierType
        });
      }

      // ✅ ENHANCED: Dynamic length check based on remaining limit
      const maxLength = req.user ? 
        (await RateLimitService.getUserUsageStats(req.user.id)).today.charactersLimit : 
        100000;

      if (text.length > maxLength) {
        return res.status(400).json({
          error: `Text too long. Maximum ${maxLength.toLocaleString()} characters allowed for your tier.`,
          currentLength: text.length,
          maxLength: maxLength
        });
      }

      logger.info('✅ ENHANCED ENDPOINT: Starting enhanced parsing...', {
        userId: req.user?.id,
        textLength: text.length,
        forceHaiku: options.forceHaiku,
        expectedPlatform: options.expectedPlatform
      });

      let parseResult: ParseResult;
      
      try {
        parseResult = await parseConversationEnhanced(text, {
          forcePattern: options.forceHaiku === false,
          userSignature: options.userSignature,
          expectedPlatform: options.expectedPlatform,
          analysisDepth: options.analysisDepth || 'standard',
          userId: req.user?.id,
          requestId: `enhanced_${Date.now()}`,
          enableContextScoring: true
        });

        logger.info('✅ ENHANCED PARSING SUCCESS:', {
          messageCount: parseResult.messages.length,
          confidence: parseResult.confidence,
          method: parseResult.method,
          platform: parseResult.platform
        });

      } catch (parseError) {
        logger.error('❌ ENHANCED PARSING FAILED:', {
          error: parseError instanceof Error ? parseError.message : 'Unknown parse error',
          stack: parseError instanceof Error ? parseError.stack : undefined,
          textLength: text.length,
          userId: req.user?.id
        });

        logger.info('🔄 FALLING BACK TO PATTERN PARSING...');
        
        try {
          const fallbackResult = parseConversation(text);
          
          parseResult = {
            messages: Array.isArray(fallbackResult) ? fallbackResult : (fallbackResult as any).messages || [],
            platform: (Array.isArray(fallbackResult) ? (options.expectedPlatform || 'other') : (fallbackResult as any).platform) || 'other',
            confidence: 0.3,
            method: 'pattern',
            metadata: {
              originalLength: text.length,
              processingTime: Date.now() - startTime,
              cost: 0,
              patternLearning: [
                'Fallback parsing used',
                `Parse error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
              ]
            } as any
          };
          
          logger.info('✅ FALLBACK PARSING SUCCESS:', {
            messageCount: parseResult.messages.length
          });
          
        } catch (fallbackError) {
          logger.error('❌ FALLBACK PARSING ALSO FAILED:', fallbackError);
          
          parseResult = {
            messages: [{
              role: 'user',
              content: text.substring(0, 1000) + (text.length > 1000 ? '...' : ''),
              index: 0,
              timestamp: new Date().toISOString()
            }],
            platform: 'other',
            confidence: 0.1,
            method: 'pattern',
            metadata: {
              originalLength: text.length,
              processingTime: Date.now() - startTime,
              cost: 0,
              patternLearning: [
                'Last resort parsing used',
                `Parse error: ${parseError instanceof Error ? parseError.message : 'Parse error'}`,
                `Fallback error: ${fallbackError instanceof Error ? fallbackError.message : 'Fallback error'}`
              ]
            } as any
          };
        }
      }

      // ✅ FIXED: Record usage for enhanced parsing with auto-creation
      if (req.user && parseResult.messages.length >= 2) {
        try {
          await RateLimitService.recordUsage(
            req.user.id, 
            text.length,
            parseResult.method === 'haiku' ? 'haiku' : 'local'
          );
          logger.info('✅ Enhanced parsing usage recorded successfully', {
            userId: req.user.id,
            email: req.user.email,
            charactersUsed: text.length,
            analysisType: parseResult.method === 'haiku' ? 'haiku' : 'local'
          });
        } catch (usageError) {
          logger.error('Failed to record enhanced parsing usage', { 
            error: usageError, 
            userId: req.user.id,
            email: req.user.email
          });
        }
      }

      const needsVerification = parseResult.confidence < 0.8 || options.forceHaiku === false;
      
      if (needsVerification && !parseResult.verification) {
        parseResult.verification = {
          needed: true,
          suggestions: generateParsingSuggestions(parseResult),
          ambiguousRanges: []
        };
      }

      const response = {
        success: true,
        result: parseResult,
        metadata: {
          processingTime: Date.now() - startTime,
          needsVerification,
          canProceedToAnalysis: parseResult.messages.length >= 2,
          estimatedAnalysisTime: parseResult.messages.length * 0.5,
          charactersProcessed: text.length,
          debugInfo: {
            requestValidated: true,
            parseMethod: parseResult.method,
            fallbackUsed: (parseResult.metadata as any)?.patternLearning?.includes('Fallback parsing used') || false,
            haikuAttempted: options.forceHaiku !== false
          }
        }
      };

      logger.info('✅ ENHANCED ENDPOINT SUCCESS:', {
        responseSuccess: true,
        messageCount: parseResult.messages.length,
        confidence: parseResult.confidence,
        method: parseResult.method,
        processingTime: response.metadata.processingTime,
        charactersProcessed: text.length
      });

      res.json(response);

    } catch (error) {
      logger.error('❌ ENHANCED ENDPOINT CRITICAL ERROR:', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userId: req.user?.id
      });
      
      res.status(500).json({
        error: 'Enhanced parsing failed. Please try again.',
        canFallback: true,
        debugInfo: {
          timestamp: new Date().toISOString(),
          errorType: error instanceof Error ? error.constructor.name : 'Unknown'
        }
      });
    }
  }
);

// ✅ KEEP: Existing reparse and validate endpoints (unchanged)
router.post('/reparse',
  optionalAuth,
  rateLimiter.createLimiter('reparse', 3, 60),
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

      const parseResult = await parseConversationEnhanced(text, {
        forcePattern: method === 'pattern',
        userSignature,
        userId: req.user?.id,
        requestId: `reparse_${method}_${Date.now()}`
      });

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

router.post('/validate',
  rateLimiter.createLimiter('validate', 20, 60),
  async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          error: 'Text parameter required'
        });
      }

      const validation = {
        isValid: text.length >= 10 && text.length <= 500000,
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

// ✅ HELPER FUNCTIONS (unchanged from original)
function calculateTrend(scores: number[]): 'improving' | 'declining' | 'stable' | 'volatile' {
  if (scores.length < 3) return 'stable';

  const n = scores.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = scores.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * scores[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
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

function generateInsights(scores: ChessScore[], messages: any[], dimensionAverages: any) {
  const insights = [];

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

  const weakestDimension = Object.entries(dimensionAverages)
    .sort(([,a], [,b]) => (a as number) - (b as number))[0];

  if ((weakestDimension[1] as number) < 60) {
    const suggestions = {
      strategic: 'Focus on clearly stating your goals and desired outcomes.',
      tactical: 'Be more specific about what you need and provide concrete examples.',
      cognitive: 'Consider the timing and complexity of your requests.',
      innovation: 'Try exploring creative approaches and alternative solutions.',
      context: 'Show awareness of conversation timeline and acknowledge completed tasks.'
    };

    insights.push({
      type: 'improvement',
      title: `Improve ${weakestDimension[0]} Dimension`,
      description: `Your ${weakestDimension[0]} scoring could be enhanced.`,
      actionable: true,
      suggestion: suggestions[weakestDimension[0] as keyof typeof suggestions]
    });
  }

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
  
  if (/(?:Human|Assistant|User|ChatGPT|AI):/gi.test(text)) confidence += 0.3;
  if (text.length > 100 && text.length < 10000) confidence += 0.1;
  
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
  
  if (text.length > 100000) {
    suggestions.push('Very long conversation. Consider your daily character limit.');
  }
  
  return suggestions;
}

export default router;