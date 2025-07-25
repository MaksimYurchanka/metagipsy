import { Router } from 'express';
import { authenticateUser, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { SessionService } from '../services/session-service';
import { logger } from '../lib/logger';
import { rateLimiter } from '../lib/rate-limiter';

const router = Router();
const sessionService = new SessionService();

// ✅ POST /save - Save analysis session after completion with 5D support
router.post('/save', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const userEmail = req.user!.email;
    const {
      title,
      platform,
      messageCount,
      overallScore,
      strategicAvg,
      tacticalAvg,
      cognitiveAvg,
      innovationAvg,
      contextAvg, // ✅ 5D: Context dimension support
      metadata
    } = req.body;

    // Validate required fields
    if (!platform || typeof messageCount !== 'number' || typeof overallScore !== 'number') {
      return res.status(400).json({
        error: 'Missing required fields: platform, messageCount, overallScore'
      });
    }

    // Step 1: Create session with 5D metadata and performance fields
    const sessionMetadata = {
      platform: platform.toLowerCase(),
      title: title || `${platform} Analysis - ${new Date().toLocaleDateString()}`,
      projectContext: metadata?.projectContext,
      sessionGoal: metadata?.sessionGoal,
      timestamp: metadata?.timestamp || new Date().toISOString(),
      
      // ✅ 5D: Enhanced performance fields
      messageCount,
      overallScore,
      dimensionAverages: {
        strategic: strategicAvg || 0,
        tactical: tacticalAvg || 0,
        cognitive: cognitiveAvg || 0,
        innovation: innovationAvg || 0,
        context: contextAvg || 0 // ✅ 5D: Context dimension
      },
      trend: metadata?.trend || 'stable',
      
      // ✅ Enhanced: Parsing metadata support
      parsingMethod: metadata?.parsingMethod,
      parsingConfidence: metadata?.parsingConfidence,
      parsingCost: metadata?.parsingCost,
      
      // Detailed data
      messages: metadata?.messages || [],
      patterns: metadata?.patterns || [],
      insights: metadata?.insights || []
    };

    const sessionId = await sessionService.createSession(userId, userEmail, sessionMetadata);

    // Step 2: Update session with 5D analysis results
    const sessionSummary = {
      sessionId,
      messageCount,
      overallScore,
      bestScore: metadata?.bestScore || overallScore,
      worstScore: metadata?.worstScore || overallScore,
      trend: metadata?.trend || 'stable',
      dimensionAverages: {
        strategic: strategicAvg || 0,
        tactical: tacticalAvg || 0,
        cognitive: cognitiveAvg || 0,
        innovation: innovationAvg || 0,
        context: contextAvg || 0 // ✅ 5D: Context dimension
      },
      patterns: metadata?.patterns || [],
      insights: metadata?.insights || []
    };

    await sessionService.updateSession(userId, sessionId, sessionSummary);

    // Step 3: Update session title if provided and different from auto-generated
    if (title && title !== sessionMetadata.title) {
      await sessionService.updateSessionTitle(sessionId, userId, title);
    }

    logger.info('Session saved successfully with 5D support', { 
      sessionId, 
      userId, 
      userEmail,
      messageCount, 
      overallScore,
      contextAvg, // ✅ 5D: Log context dimension
      platform 
    });

    res.status(201).json({
      success: true,
      sessionId,
      message: 'Analysis session saved successfully with 5D support'
    });

  } catch (error) {
    logger.error('Failed to save session', { 
      error, 
      userId: req.user!.id,
      userEmail: req.user!.email,
      body: req.body 
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to save session'
    });
  }
});

// ✅ GET / - Get user sessions with pagination
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    // ✅ VERIFIED: Correct parameter order for getUserSessions overload
    const result = await sessionService.getUserSessions(
      req.user!.id,
      limit,
      offset
    );

    res.json(result);
  } catch (error) {
    logger.error('Failed to get user sessions', { error, userId: req.user!.id });
    res.status(500).json({
      error: 'Failed to get sessions'
    });
  }
});

// ✅ CRITICAL FIX: GET /:sessionId - Get specific session with CORRECT parameter order
router.get('/:sessionId', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;

    // ✅ CRITICAL FIX: Correct parameter order (userId first, sessionId second)
    const session = await sessionService.getSession(req.user!.id, sessionId);

    // ✅ Handle SessionService response format
    if (!session.success) {
      logger.warn('Session not found or access denied', { 
        sessionId, 
        userId: req.user!.id,
        error: session.error 
      });
      
      return res.status(404).json({
        error: session.error || 'Session not found'
      });
    }

    res.json(session);
  } catch (error) {
    logger.error('Failed to get session', { 
      error, 
      sessionId: req.params.sessionId, 
      userId: req.user!.id 
    });
    
    res.status(500).json({
      error: 'Failed to get session'
    });
  }
});

// ✅ DELETE /:sessionId - Delete session with CORRECT parameter order
router.delete('/:sessionId', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;

    // ✅ VERIFIED: deleteSession uses correct parameter order (userId, sessionId)
    const success = await sessionService.deleteSession(req.user!.id, sessionId);

    if (!success) {
      return res.status(404).json({
        error: 'Session not found or could not be deleted'
      });
    }

    res.json({
      message: 'Session deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete session', { 
      error, 
      sessionId: req.params.sessionId, 
      userId: req.user!.id 
    });
    
    res.status(500).json({
      error: 'Failed to delete session'
    });
  }
});

// ✅ PUT /:sessionId - Update session title with CORRECT parameter order
router.put('/:sessionId', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({
        error: 'Title is required and must be a string'
      });
    }

    // ✅ VERIFIED: updateSessionTitle uses correct parameter order (sessionId, userId, title)
    await sessionService.updateSessionTitle(sessionId, req.user!.id, title);

    res.json({
      message: 'Session title updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update session title', { 
      error, 
      sessionId: req.params.sessionId, 
      userId: req.user!.id 
    });
    
    if (error instanceof Error && error.message === 'Session not found') {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    res.status(500).json({
      error: 'Failed to update session title'
    });
  }
});

// ✅ GET /analytics/overview - Get session analytics with 5D support
router.get('/analytics/overview', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const days = Math.min(parseInt(req.query.days as string) || 30, 365);

    // ✅ VERIFIED: getSessionAnalytics uses correct parameter order (userId, days)
    const analytics = await sessionService.getSessionAnalytics(req.user!.id, days);

    res.json({ analytics });
  } catch (error) {
    logger.error('Failed to get session analytics', { error, userId: req.user!.id });
    res.status(500).json({
      error: 'Failed to get analytics'
    });
  }
});

// ✅ GET /:sessionId/export - Export session data with 5D support
router.get('/:sessionId/export', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;
    const format = req.query.format as string || 'json';

    // ✅ CRITICAL FIX: Correct parameter order for getSession
    const sessionResponse = await sessionService.getSession(req.user!.id, sessionId);

    if (!sessionResponse.success) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    const session = sessionResponse.session;
    const messages = sessionResponse.messages || [];
    const metadata = sessionResponse.metadata || {};

    // Transform data for export with 5D support
    const exportData = {
      session: {
        id: session.id,
        title: session.title,
        platform: session.platform,
        projectContext: metadata.projectContext,
        sessionGoal: metadata.sessionGoal,
        createdAt: session.createdAt,
        completedAt: session.updatedAt,
        overallScore: session.overallScore,
        messageCount: session.messageCount,
        trend: session.trend,
        // ✅ 5D: Include all dimension averages including context
        dimensionAverages: session.dimensionAverages
      },
      messages: messages.map((msg: any) => ({
        index: msg.index,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        scores: msg.scores?.map((score: any) => ({
          overall: score.overall,
          dimensions: score.dimensions, // ✅ 5D: All dimensions including context
          classification: score.classification,
          explanation: score.explanation,
          betterMove: score.betterMove
        })) || []
      })),
      summary: {
        dimensionAverages: session.dimensionAverages, // ✅ 5D: Context included
        patterns: metadata.patterns || [],
        insights: metadata.insights || []
      }
    };

    switch (format) {
      case 'csv':
        // ✅ 5D: Convert to CSV format with context dimension
        const csvData = messages.map((msg: any) => {
          const score = msg.scores?.[0];
          return {
            message_index: msg.index,
            role: msg.role,
            content: msg.content?.replace(/"/g, '""') || '', // Escape quotes
            overall_score: score?.overall || 0,
            strategic_score: score?.dimensions?.strategic || 0,
            tactical_score: score?.dimensions?.tactical || 0,
            cognitive_score: score?.dimensions?.cognitive || 0,
            innovation_score: score?.dimensions?.innovation || 0,
            context_score: score?.dimensions?.context || 0, // ✅ 5D: Context in CSV
            classification: score?.classification || '',
            explanation: score?.explanation?.replace(/"/g, '""') || ''
          };
        });

        const csvHeaders = Object.keys(csvData[0] || {}).join(',');
        const csvRows = csvData.map((row: any) => 
          Object.values(row).map(val => `"${val}"`).join(',')
        );
        const csvContent = [csvHeaders, ...csvRows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="session-${sessionId}.csv"`);
        return res.send(csvContent);

      case 'markdown':
        // ✅ 5D: Convert to Markdown format with context dimension
        let markdown = `# Session Analysis Report\n\n`;
        markdown += `**Session ID:** ${session.id}\n`;
        markdown += `**Title:** ${session.title || 'Untitled'}\n`;
        markdown += `**Platform:** ${session.platform}\n`;
        markdown += `**Created:** ${session.createdAt}\n`;
        markdown += `**Overall Score:** ${session.overallScore || 0}/100\n\n`;

        if (metadata.projectContext) {
          markdown += `**Project Context:** ${metadata.projectContext}\n\n`;
        }

        // ✅ 5D: Include all dimension averages in markdown
        if (session.dimensionAverages) {
          markdown += `## 5D Dimension Averages\n\n`;
          markdown += `- Strategic: ${session.dimensionAverages.strategic || 0}\n`;
          markdown += `- Tactical: ${session.dimensionAverages.tactical || 0}\n`;
          markdown += `- Cognitive: ${session.dimensionAverages.cognitive || 0}\n`;
          markdown += `- Innovation: ${session.dimensionAverages.innovation || 0}\n`;
          markdown += `- Context: ${session.dimensionAverages.context || 0}\n\n`;
        }

        markdown += `## Messages\n\n`;
        messages.forEach((msg: any) => {
          const score = msg.scores?.[0];
          markdown += `### Message ${msg.index + 1} (${msg.role})\n\n`;
          markdown += `${msg.content}\n\n`;
          if (score) {
            markdown += `**Score:** ${score.overall}/100 (${score.classification})\n`;
            markdown += `- Strategic: ${score.dimensions?.strategic || 0}\n`;
            markdown += `- Tactical: ${score.dimensions?.tactical || 0}\n`;
            markdown += `- Cognitive: ${score.dimensions?.cognitive || 0}\n`;
            markdown += `- Innovation: ${score.dimensions?.innovation || 0}\n`;
            markdown += `- Context: ${score.dimensions?.context || 0}\n\n`; // ✅ 5D: Context in markdown
            if (score.explanation) {
              markdown += `**Analysis:** ${score.explanation}\n\n`;
            }
          }
        });

        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="session-${sessionId}.md"`);
        return res.send(markdown);

      default:
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="session-${sessionId}.json"`);
        return res.json(exportData);
    }
  } catch (error) {
    logger.error('Failed to export session', { 
      error, 
      sessionId: req.params.sessionId, 
      userId: req.user!.id 
    });
    
    res.status(500).json({
      error: 'Failed to export session'
    });
  }
});

export default router;