import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { logger } from '../lib/logger';
import { SessionSummary, SessionMetadata, AnalysisPattern } from '../types';

export class SessionService {
  async createSession(userId: string, metadata: SessionMetadata): Promise<string> {
    try {
      const session = await prisma.session.create({
        data: {
          userId,
          platform: metadata.platform,
          projectContext: metadata.projectContext,
          sessionGoal: metadata.sessionGoal,
          metadata: metadata as any
        }
      });

      logger.info('Session created', { sessionId: session.id, userId });
      return session.id;
    } catch (error) {
      logger.error('Failed to create session', { error, userId });
      throw new Error('Failed to create session');
    }
  }

  async updateSession(
    sessionId: string, 
    userId: string, 
    summary: SessionSummary
  ): Promise<void> {
    try {
      await prisma.session.update({
        where: { 
          id: sessionId,
          userId // Ensure user owns the session
        },
        data: {
          messageCount: summary.messageCount,
          overallScore: summary.overallScore,
          bestScore: summary.bestScore,
          worstScore: summary.worstScore,
          trend: summary.trend,
          dimensionAverages: summary.dimensionAverages as any,
          patterns: summary.patterns as any,
          insights: summary.insights as any,
          completedAt: new Date()
        }
      });

      // Cache session summary for quick access
      await redis.setex(
        `session:${sessionId}:summary`,
        3600, // 1 hour
        JSON.stringify(summary)
      );

      logger.info('Session updated', { sessionId, userId });
    } catch (error) {
      logger.error('Failed to update session', { error, sessionId, userId });
      throw new Error('Failed to update session');
    }
  }

  async getSession(sessionId: string, userId: string) {
    try {
      const session = await prisma.session.findFirst({
        where: {
          id: sessionId,
          userId
        },
        include: {
          messages: {
            include: {
              scores: true
            },
            orderBy: {
              index: 'asc'
            }
          }
        }
      });

      if (!session) {
        throw new Error('Session not found');
      }

      return session;
    } catch (error) {
      logger.error('Failed to get session', { error, sessionId, userId });
      throw new Error('Failed to get session');
    }
  }

  async getUserSessions(
    userId: string, 
    limit: number = 20, 
    offset: number = 0
  ) {
    try {
      const sessions = await prisma.session.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          platform: true,
          projectContext: true,
          sessionGoal: true,
          messageCount: true,
          overallScore: true,
          trend: true,
          createdAt: true,
          completedAt: true
        }
      });

      const total = await prisma.session.count({
        where: { userId }
      });

      return {
        sessions,
        total,
        hasMore: offset + limit < total
      };
    } catch (error) {
      logger.error('Failed to get user sessions', { error, userId });
      throw new Error('Failed to get user sessions');
    }
  }

  async deleteSession(sessionId: string, userId: string): Promise<void> {
    try {
      await prisma.session.delete({
        where: {
          id: sessionId,
          userId
        }
      });

      // Clean up cache
      await redis.del(`session:${sessionId}:summary`);

      logger.info('Session deleted', { sessionId, userId });
    } catch (error) {
      logger.error('Failed to delete session', { error, sessionId, userId });
      throw new Error('Failed to delete session');
    }
  }

  async getSessionAnalytics(userId: string, days: number = 30) {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const sessions = await prisma.session.findMany({
        where: {
          userId,
          createdAt: {
            gte: since
          },
          completedAt: {
            not: null
          }
        },
        select: {
          overallScore: true,
          dimensionAverages: true,
          messageCount: true,
          trend: true,
          createdAt: true,
          platform: true
        }
      });

      if (sessions.length === 0) {
        return {
          totalSessions: 0,
          totalMessages: 0,
          averageScore: 0,
          improvementRate: 0,
          dimensionAverages: {
            strategic: 0,
            tactical: 0,
            cognitive: 0,
            innovation: 0
          },
          trendDistribution: {},
          platformDistribution: {},
          scoreHistory: []
        };
      }

      const totalSessions = sessions.length;
      const totalMessages = sessions.reduce((sum, s) => sum + (s.messageCount || 0), 0);
      const averageScore = sessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / totalSessions;

      // Calculate improvement rate (comparing first half vs second half)
      const midpoint = Math.floor(sessions.length / 2);
      const firstHalf = sessions.slice(0, midpoint);
      const secondHalf = sessions.slice(midpoint);
      
      const firstHalfAvg = firstHalf.length > 0 
        ? firstHalf.reduce((sum, s) => sum + (s.overallScore || 0), 0) / firstHalf.length 
        : 0;
      const secondHalfAvg = secondHalf.length > 0 
        ? secondHalf.reduce((sum, s) => sum + (s.overallScore || 0), 0) / secondHalf.length 
        : 0;
      
      const improvementRate = firstHalfAvg > 0 
        ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 
        : 0;

      // Calculate dimension averages
      const dimensionAverages = {
        strategic: 0,
        tactical: 0,
        cognitive: 0,
        innovation: 0
      };

      sessions.forEach(session => {
        if (session.dimensionAverages) {
          const dims = session.dimensionAverages as any;
          dimensionAverages.strategic += dims.strategic || 0;
          dimensionAverages.tactical += dims.tactical || 0;
          dimensionAverages.cognitive += dims.cognitive || 0;
          dimensionAverages.innovation += dims.innovation || 0;
        }
      });

      Object.keys(dimensionAverages).forEach(key => {
        dimensionAverages[key as keyof typeof dimensionAverages] /= totalSessions;
      });

      // Trend and platform distributions
      const trendDistribution = sessions.reduce((acc, s) => {
        acc[s.trend || 'unknown'] = (acc[s.trend || 'unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const platformDistribution = sessions.reduce((acc, s) => {
        acc[s.platform || 'unknown'] = (acc[s.platform || 'unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Score history (last 30 data points)
      const scoreHistory = sessions
        .slice(-30)
        .map(s => ({
          date: s.createdAt.toISOString().split('T')[0],
          score: s.overallScore || 0
        }));

      return {
        totalSessions,
        totalMessages,
        averageScore: Math.round(averageScore),
        improvementRate: Math.round(improvementRate),
        dimensionAverages,
        trendDistribution,
        platformDistribution,
        scoreHistory
      };
    } catch (error) {
      logger.error('Failed to get session analytics', { error, userId });
      throw new Error('Failed to get session analytics');
    }
  }
}

