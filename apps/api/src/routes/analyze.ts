import { Router } from 'express';
import { authenticateUser, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { rateLimiter } from '../lib/rate-limiter';
import { parseConversation } from '../lib/conversation-parser';
import { LocalScoringEngine } from '../lib/scoring-engine';
import { ClaudeClient } from '../lib/claude-client';
import { SessionService } from '../services/session-service';
import { logger } from '../lib/logger';
import { config } from '../lib/config';
import { AnalyzeRequest, AnalyzeResponse } from '../types';

const router = Router();
const scoringEngine = new LocalScoringEngine();
const claudeClient = new ClaudeClient();
const sessionService = new SessionService();

// Main analysis endpoint
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

      // Parse and validate messages
      const messages = parseConversation(
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
        sessionId = await sessionService.createSession(req.user.id, {
          platform: conversation.platform || 'auto',
          projectContext: options.projectContext,
          sessionGoal: options.sessionGoal
        });
      }

      // Score messages
      const scores = [];
      // FIXED: Changed config.claude.apiKey to config.anthropic.apiKey
      const useClaudeAnalysis = options.useClaudeAnalysis && 
        config.anthropic?.apiKey && 
        (req.user?.role === 'premium' || req.user?.role === 'admin');

      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        
        try {
          let score;
          
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
            // Use local scoring engine
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
          
          // Fallback to basic scoring
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

      // Generate session summary
      const overallScore = scores.reduce((sum, s) => sum + s.overall, 0) / scores.length;
      const bestScore = Math.max(...scores.map(s => s.overall));
      const worstScore = Math.min(...scores.map(s => s.overall));

      // Calculate trend (simple linear regression)
      const trend = calculateTrend(scores.map(s => s.overall));

      // Calculate dimension averages
      const dimensionAverages = {
        strategic: scores.reduce((sum, s) => sum + s.dimensions.strategic, 0) / scores.length,
        tactical: scores.reduce((sum, s) => sum + s.dimensions.tactical, 0) / scores.length,
        cognitive: scores.reduce((sum, s) => sum + s.dimensions.cognitive, 0) / scores.length,
        innovation: scores.reduce((sum, s) => sum + s.dimensions.innovation, 0) / scores.length
      };

      // Detect patterns if enabled
      let patterns = [];
      if (options.enablePatternDetection) {
        patterns = detectPatterns(scores);
      }

      // Generate insights
      const insights = generateInsights(scores, messages, dimensionAverages);

      const sessionSummary = {
        sessionId: sessionId || `temp_${Date.now()}`,
        messageCount: messages.length,
        overallScore: Math.round(overallScore),
        trend,
        bestScore: Math.round(bestScore),
        worstScore: Math.round(worstScore),
        dimensionAverages: {
          strategic: Math.round(dimensionAverages.strategic),
          tactical: Math.round(dimensionAverages.tactical),
          cognitive: Math.round(dimensionAverages.cognitive),
          innovation: Math.round(dimensionAverages.innovation)
        },
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
          score
        })),
        summary: sessionSummary,
        metadata: {
          analysisMethod: useClaudeAnalysis ? 'claude' : 'local',
          analysisDepth: options.analysisDepth || 'standard',
          processingTime: Date.now() - startTime,
          version: '1.0.0',
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

// Helper functions
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

function detectPatterns(scores: any[]) {
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
    const lastAvg = lastQuarter.reduce((sum: number, s: any) => sum + s.overall, 0) / lastQuarter.length;
    const firstAvg = firstQuarter.reduce((sum: number, s: any) => sum + s.overall, 0) / firstQuarter.length;
    
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

function generateInsights(scores: any[], messages: any[], dimensionAverages: any) {
  const insights = [];

  // Overall performance insight
  const avgScore = scores.reduce((sum, s) => sum + s.overall, 0) / scores.length;
  if (avgScore >= 75) {
    insights.push({
      type: 'strength',
      title: 'Excellent Communication',
      description: 'Your conversation demonstrates strong strategic thinking and clear communication.',
      actionable: false
    });
  } else if (avgScore < 50) {
    insights.push({
      type: 'improvement',
      title: 'Communication Opportunity',
      description: 'Consider being more specific and providing clearer context in your requests.',
      actionable: true,
      suggestion: 'Try breaking complex requests into smaller, focused questions.'
    });
  }

  // Dimension-specific insights
  const weakestDimension = Object.entries(dimensionAverages)
    .sort(([,a], [,b]) => (a as number) - (b as number))[0];

  if (weakestDimension[1] < 60) {
    const suggestions = {
      strategic: 'Focus on clearly stating your goals and desired outcomes.',
      tactical: 'Be more specific about what you need and provide concrete examples.',
      cognitive: 'Consider the timing and complexity of your requests.',
      innovation: 'Try exploring creative approaches and alternative solutions.'
    };

    insights.push({
      type: 'improvement',
      title: `Improve ${weakestDimension[0]} Dimension`,
      description: `Your ${weakestDimension[0]} scoring could be enhanced.`,
      actionable: true,
      suggestion: suggestions[weakestDimension[0] as keyof typeof suggestions]
    });
  }

  return insights;
}

export default router;