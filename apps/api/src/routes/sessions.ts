import { Router } from 'express';
import { authenticateUser, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { SessionService } from '../services/session-service';
import { logger } from '../lib/logger';
import { rateLimiter } from '../lib/rate-limiter';

const router = Router();
const sessionService = new SessionService();

// Get user sessions with pagination
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

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

// Get specific session
router.get('/:sessionId', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;

    const session = await sessionService.getSession(sessionId, req.user!.id);

    res.json({ session });
  } catch (error) {
    logger.error('Failed to get session', { 
      error, 
      sessionId: req.params.sessionId, 
      userId: req.user!.id 
    });
    
    if (error.message === 'Session not found') {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    res.status(500).json({
      error: 'Failed to get session'
    });
  }
});

// Delete session
router.delete('/:sessionId', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;

    await sessionService.deleteSession(sessionId, req.user!.id);

    res.json({
      message: 'Session deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete session', { 
      error, 
      sessionId: req.params.sessionId, 
      userId: req.user!.id 
    });
    
    if (error.message === 'Session not found') {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    res.status(500).json({
      error: 'Failed to delete session'
    });
  }
});

// Get session analytics
router.get('/analytics/overview', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const days = Math.min(parseInt(req.query.days as string) || 30, 365);

    const analytics = await sessionService.getSessionAnalytics(req.user!.id, days);

    res.json({ analytics });
  } catch (error) {
    logger.error('Failed to get session analytics', { error, userId: req.user!.id });
    res.status(500).json({
      error: 'Failed to get analytics'
    });
  }
});

// Export session data
router.get('/:sessionId/export', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;
    const format = req.query.format as string || 'json';

    const session = await sessionService.getSession(sessionId, req.user!.id);

    // Transform data for export
    const exportData = {
      session: {
        id: session.id,
        platform: session.platform,
        projectContext: session.projectContext,
        sessionGoal: session.sessionGoal,
        createdAt: session.createdAt,
        completedAt: session.completedAt,
        overallScore: session.overallScore,
        messageCount: session.messageCount,
        trend: session.trend
      },
      messages: session.messages.map(msg => ({
        index: msg.index,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        scores: msg.scores.map(score => ({
          overall: score.overall,
          dimensions: score.dimensions,
          classification: score.classification,
          explanation: score.explanation,
          betterMove: score.betterMove
        }))
      })),
      summary: {
        dimensionAverages: session.dimensionAverages,
        patterns: session.patterns,
        insights: session.insights
      }
    };

    switch (format) {
      case 'csv':
        // Convert to CSV format
        const csvData = session.messages.map(msg => {
          const score = msg.scores[0];
          return {
            message_index: msg.index,
            role: msg.role,
            content: msg.content.replace(/"/g, '""'), // Escape quotes
            overall_score: score?.overall || 0,
            strategic_score: score?.dimensions?.strategic || 0,
            tactical_score: score?.dimensions?.tactical || 0,
            cognitive_score: score?.dimensions?.cognitive || 0,
            innovation_score: score?.dimensions?.innovation || 0,
            classification: score?.classification || '',
            explanation: score?.explanation?.replace(/"/g, '""') || ''
          };
        });

        const csvHeaders = Object.keys(csvData[0] || {}).join(',');
        const csvRows = csvData.map(row => 
          Object.values(row).map(val => `"${val}"`).join(',')
        );
        const csvContent = [csvHeaders, ...csvRows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="session-${sessionId}.csv"`);
        return res.send(csvContent);

      case 'markdown':
        // Convert to Markdown format
        let markdown = `# Session Analysis Report\n\n`;
        markdown += `**Session ID:** ${session.id}\n`;
        markdown += `**Platform:** ${session.platform}\n`;
        markdown += `**Created:** ${session.createdAt}\n`;
        markdown += `**Overall Score:** ${session.overallScore}/100\n\n`;

        if (session.projectContext) {
          markdown += `**Project Context:** ${session.projectContext}\n\n`;
        }

        markdown += `## Messages\n\n`;
        session.messages.forEach(msg => {
          const score = msg.scores[0];
          markdown += `### Message ${msg.index + 1} (${msg.role})\n\n`;
          markdown += `${msg.content}\n\n`;
          if (score) {
            markdown += `**Score:** ${score.overall}/100 (${score.classification})\n`;
            markdown += `- Strategic: ${score.dimensions?.strategic || 0}\n`;
            markdown += `- Tactical: ${score.dimensions?.tactical || 0}\n`;
            markdown += `- Cognitive: ${score.dimensions?.cognitive || 0}\n`;
            markdown += `- Innovation: ${score.dimensions?.innovation || 0}\n\n`;
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
    
    if (error.message === 'Session not found') {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    res.status(500).json({
      error: 'Failed to export session'
    });
  }
});

export default router;

