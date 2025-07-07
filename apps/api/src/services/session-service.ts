import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { logger } from '../lib/logger';
import { SessionSummary, SessionMetadata, AnalysisPattern, Platform } from '../types';

export class SessionService {
  async createSession(userId: string, metadata: SessionMetadata): Promise<string> {
    try {
      const session = await prisma.session.create({
        data: {
          userId,
          // FIXED: Type cast platform and remove non-existent fields
          platform: (metadata.platform as Platform) || 'other',
          // FIXED: Store everything in metadata JSON field
          metadata: {
            ...metadata,
            createdAt: new Date().toISOString()
          } as any
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
      // FIXED: Store everything in metadata instead of non-existent fields
      const updatedMetadata = {
        messageCount: summary.messageCount,
        overallScore: summary.overallScore,
        bestScore: summary.bestScore,
        worstScore: summary.worstScore,
        trend: summary.trend,
        dimensionAverages: summary.dimensionAverages,
        patterns: summary.patterns,
        insights: summary.insights,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await prisma.session.update({
        where: { 
          id: sessionId,
          userId // Ensure user owns the session
        },
        data: {
          // FIXED: Only update existing fields
          status: 'COMPLETED' as any,
          metadata: updatedMetadata as any
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
              // FIXED: Changed 'scores' to 'score' (singular, matches schema)
              score: true
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

      // FIXED: Enhance session object with metadata properties for backward compatibility
      const metadata = (session.metadata as any) || {};
      
      return {
        ...session,
        // Add metadata properties as direct properties for easier access
        projectContext: metadata.projectContext,
        sessionGoal: metadata.sessionGoal,
        messageCount: metadata.messageCount,
        overallScore: metadata.overallScore,
        completedAt: metadata.completedAt,
        trend: metadata.trend,
        dimensionAverages: metadata.dimensionAverages,
        patterns: metadata.patterns,
        insights: metadata.insights,
        // Transform messages to include scores array for compatibility
        messages: session.messages.map(msg => ({
          ...msg,
          scores: msg.score ? [msg.score] : []
        }))
      };
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
        // FIXED: Only select existing fields
        select: {
          id: true,
          platform: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          metadata: true
        }
      });

      const total = await prisma.session.count({
        where: { userId }
      });

      // FIXED: Transform sessions to include metadata properties
      const transformedSessions = sessions.map(session => {
        const metadata = (session.metadata as any) || {};
        return {
          ...session,
          projectContext: metadata.projectContext,
          sessionGoal: metadata.sessionGoal,
          messageCount: metadata.messageCount || 0,
          overallScore: metadata.overallScore || 0,
          trend: metadata.trend || 'stable',
          completedAt: metadata.completedAt
        };
      });

      return {
        sessions: transformedSessions,
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
          // FIXED: Remove non-existent completedAt field check
          status: 'COMPLETED'
        },
        // FIXED: Only select existing fields
        select: {
          createdAt: true,
          platform: true,
          metadata: true
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

      // FIXED: Extract data from metadata
      const sessionsWithMetadata = sessions.map(session => {
        const metadata = (session.metadata as any) || {};
        return {
          ...session,
          overallScore: metadata.overallScore || 0,
          messageCount: metadata.messageCount || 0,
          trend: metadata.trend || 'stable',
          dimensionAverages: metadata.dimensionAverages || {
            strategic: 0,
            tactical: 0,
            cognitive: 0,
            innovation: 0
          }
        };
      });

      const totalSessions = sessionsWithMetadata.length;
      const totalMessages = sessionsWithMetadata.reduce((sum, s) => sum + s.messageCount, 0);
      const averageScore = sessionsWithMetadata.reduce((sum, s) => sum + s.overallScore, 0) / totalSessions;

      // Calculate improvement rate (comparing first half vs second half)
      const midpoint = Math.floor(sessionsWithMetadata.length / 2);
      const firstHalf = sessionsWithMetadata.slice(0, midpoint);
      const secondHalf = sessionsWithMetadata.slice(midpoint);
      
      const firstHalfAvg = firstHalf.length > 0 
        ? firstHalf.reduce((sum, s) => sum + s.overallScore, 0) / firstHalf.length 
        : 0;
      const secondHalfAvg = secondHalf.length > 0 
        ? secondHalf.reduce((sum, s) => sum + s.overallScore, 0) / secondHalf.length 
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

      sessionsWithMetadata.forEach(session => {
        if (session.dimensionAverages) {
          dimensionAverages.strategic += session.dimensionAverages.strategic || 0;
          dimensionAverages.tactical += session.dimensionAverages.tactical || 0;
          dimensionAverages.cognitive += session.dimensionAverages.cognitive || 0;
          dimensionAverages.innovation += session.dimensionAverages.innovation || 0;
        }
      });

      Object.keys(dimensionAverages).forEach(key => {
        dimensionAverages[key as keyof typeof dimensionAverages] /= totalSessions;
      });

      // Trend and platform distributions
      const trendDistribution = sessionsWithMetadata.reduce((acc, s) => {
        acc[s.trend] = (acc[s.trend] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const platformDistribution = sessions.reduce((acc, s) => {
        acc[s.platform] = (acc[s.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Score history (last 30 data points)
      const scoreHistory = sessionsWithMetadata
        .slice(-30)
        .map(s => ({
          date: s.createdAt.toISOString().split('T')[0],
          score: s.overallScore
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