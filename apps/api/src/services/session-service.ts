import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { logger } from '../lib/logger';
import { SessionSummary, SessionMetadata, AnalysisPattern, Platform } from '../types';

export class SessionService {
  /**
   * ✅ CLEAN: Create session WITHOUT duplicate ensureUserExists
   * User is guaranteed to exist from RateLimitService.ensureUserExists call
   */
  async createSession(
    userId: string, 
    userEmail: string, // ✅ Keep parameter for API compatibility but don't use for creation
    metadata: {
      platform?: Platform;
      projectContext?: string;
      sessionGoal?: string;
    } = {}
  ): Promise<string> {
    try {
      // ✅ NO ensureUserExists call - user already created by RateLimitService
      logger.info('🚀 Creating session for existing user', { userId, userEmail, metadata });
      
      const session = await prisma.session.create({
        data: {
          userId, // ✅ User guaranteed to exist from rate limiting step
          platform: metadata.platform || 'other',
          title: `Analysis ${new Date().toLocaleDateString()}`,
          status: 'ACTIVE', // ✅ FIXED: Uppercase enum value
          messageCount: 0,
          overallScore: 0,
          // ✅ ENHANCED: Initialize 5D averages with Context dimension
          strategicAvg: 0,
          tacticalAvg: 0,
          cognitiveAvg: 0,
          innovationAvg: 0,
          contextAvg: 0, // ✅ NEW: 5th dimension for database
          metadata: {
            projectContext: metadata.projectContext,
            sessionGoal: metadata.sessionGoal,
            createdAt: new Date().toISOString()
          }
        }
      });

      logger.info('✅ Session created successfully for existing user', { 
        sessionId: session.id, 
        userId,
        userEmail,
        platform: metadata.platform 
      });
      
      return session.id;
      
    } catch (error) {
      logger.error('❌ Session creation failed', { error, userId, userEmail });
      
      // ✅ IMPROVED: More specific error handling with proper TypeScript
      if (error instanceof Error && 'code' in error && error.code === 'P2003') {
        // Foreign key constraint failed - user doesn't exist
        throw new Error(`User ${userId} not found in database. Ensure rate limiting ran first.`);
      }
      
      throw new Error(`Failed to create session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * ✅ UNCHANGED: Update session compatible with real Prisma schema
   */
  async updateSession(
    userId: string, 
    sessionId: string, 
    summary: SessionSummary
  ): Promise<void> {
    try {
      logger.info('🔄 Updating session', { sessionId, userId });
      
      await prisma.session.update({
        where: {
          id: sessionId,
          userId // Ensure user owns this session
        },
        data: {
          messageCount: summary.messageCount,
          overallScore: summary.overallScore,
          // ✅ ENHANCED: Store 5D dimension averages including Context
          strategicAvg: summary.dimensionAverages.strategic,
          tacticalAvg: summary.dimensionAverages.tactical,
          cognitiveAvg: summary.dimensionAverages.cognitive,
          innovationAvg: summary.dimensionAverages.innovation,
          contextAvg: summary.dimensionAverages.context, // ✅ NEW: 5th dimension
          status: 'COMPLETED', // ✅ FIXED: Uppercase enum value
          metadata: {
            ...summary,
            updatedAt: new Date().toISOString(),
            // ✅ FIXED: JSON serialize complex objects for Prisma
            patterns: JSON.stringify(summary.patterns || []),
            insights: JSON.stringify(summary.insights || []),
            trend: summary.trend
          }
        }
      });

      logger.info('✅ Session updated successfully', { sessionId, userId, summary });
      
    } catch (error) {
      logger.error('❌ Session update failed', { error, sessionId, userId });
      throw new Error('Failed to update session');
    }
  }

  /**
   * ✅ UNCHANGED: Update session title only (lightweight operation)
   */
  async updateSessionTitle(sessionId: string, userId: string, title: string): Promise<void> {
    try {
      logger.info('📝 Updating session title', { sessionId, userId, title });
      
      await prisma.session.update({
        where: {
          id: sessionId,
          userId // Ensure user owns this session
        },
        data: {
          title: title.trim()
        }
      });

      logger.info('✅ Session title updated successfully', { sessionId, userId, title });
      
    } catch (error) {
      logger.error('❌ Session title update failed', { error, sessionId, userId });
      
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        throw new Error('Session not found');
      }
      
      throw new Error('Failed to update session title');
    }
  }

  /**
   * ✅ UNCHANGED: Get session analytics for Dashboard
   */
  async getSessionAnalytics(userId: string, days: number = 30): Promise<{
    totalSessions: number;
    totalMessages: number;
    averageScore: number;
    improvementRate: number;
    bestScore: number;
    worstScore: number;
    dimensionAverages: {
      strategic: number;
      tactical: number;
      cognitive: number;
      innovation: number;
      context: number; // ✅ NEW: 5th dimension analytics
    };
    trendDistribution: Record<string, number>;
    platformDistribution: Record<string, number>;
    scoreHistory: Array<{
      date: string;
      score: number;
    }>;
    recentSessions: Array<{
      id: string;
      title: string;
      overallScore: number;
      createdAt: string;
      platform: string;
    }>;
  }> {
    try {
      logger.info('📊 Getting session analytics', { userId, days });
      
      // Calculate date range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Get sessions within date range
      const sessions = await prisma.session.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate
          },
          status: 'COMPLETED'
        },
        select: {
          id: true,
          title: true,
          platform: true,
          messageCount: true,
          overallScore: true,
          strategicAvg: true,
          tacticalAvg: true,
          cognitiveAvg: true,
          innovationAvg: true,
          contextAvg: true, // ✅ NEW: 5th dimension
          trend: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Calculate basic metrics
      const totalSessions = sessions.length;
      const totalMessages = sessions.reduce((sum, s) => sum + s.messageCount, 0);
      const averageScore = totalSessions > 0 
        ? Math.round(sessions.reduce((sum, s) => sum + s.overallScore, 0) / totalSessions)
        : 0;

      // Calculate best/worst scores
      const scores = sessions.map(s => s.overallScore);
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
      const worstScore = scores.length > 0 ? Math.min(...scores) : 0;

      // Calculate 5D dimension averages
      const dimensionAverages = {
        strategic: totalSessions > 0 
          ? Math.round(sessions.reduce((sum, s) => sum + s.strategicAvg, 0) / totalSessions)
          : 0,
        tactical: totalSessions > 0 
          ? Math.round(sessions.reduce((sum, s) => sum + s.tacticalAvg, 0) / totalSessions)
          : 0,
        cognitive: totalSessions > 0 
          ? Math.round(sessions.reduce((sum, s) => sum + s.cognitiveAvg, 0) / totalSessions)
          : 0,
        innovation: totalSessions > 0 
          ? Math.round(sessions.reduce((sum, s) => sum + s.innovationAvg, 0) / totalSessions)
          : 0,
        context: totalSessions > 0 
          ? Math.round(sessions.reduce((sum, s) => sum + s.contextAvg, 0) / totalSessions)
          : 0 // ✅ NEW: 5th dimension average
      };

      // Calculate improvement rate (compare first half vs second half)
      let improvementRate = 0;
      if (totalSessions >= 4) {
        const midPoint = Math.floor(totalSessions / 2);
        const firstHalf = sessions.slice(midPoint);
        const secondHalf = sessions.slice(0, midPoint);
        
        const firstHalfAvg = firstHalf.reduce((sum, s) => sum + s.overallScore, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, s) => sum + s.overallScore, 0) / secondHalf.length;
        
        improvementRate = Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100);
      }

      // Calculate trend distribution
      const trendDistribution = sessions.reduce((acc, session) => {
        const trend = session.trend || 'stable';
        acc[trend] = (acc[trend] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate platform distribution
      const platformDistribution = sessions.reduce((acc, session) => {
        const platform = session.platform.toLowerCase();
        acc[platform] = (acc[platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Generate score history (daily averages)
      const scoreHistory: Array<{ date: string; score: number }> = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        const daySessions = sessions.filter(s => {
          const sessionDate = new Date(s.createdAt);
          return sessionDate >= dayStart && sessionDate <= dayEnd;
        });
        
        const dayAverage = daySessions.length > 0
          ? Math.round(daySessions.reduce((sum, s) => sum + s.overallScore, 0) / daySessions.length)
          : 0;
          
        scoreHistory.push({
          date: dateStr,
          score: dayAverage
        });
      }

      // Get recent sessions for quick access
      const recentSessions = sessions.slice(0, 5).map(session => ({
        id: session.id,
        title: session.title || `${session.platform} Analysis`,
        overallScore: Math.round(session.overallScore),
        createdAt: session.createdAt.toISOString(),
        platform: session.platform.toLowerCase()
      }));

      const analytics = {
        totalSessions,
        totalMessages,
        averageScore,
        improvementRate,
        bestScore: Math.round(bestScore),
        worstScore: Math.round(worstScore),
        dimensionAverages,
        trendDistribution,
        platformDistribution,
        scoreHistory,
        recentSessions
      };

      logger.info('✅ Session analytics calculated successfully', {
        userId,
        totalSessions,
        averageScore,
        improvementRate
      });
      
      return analytics;
      
    } catch (error) {
      logger.error('❌ Session analytics failed', { error, userId });
      throw new Error('Failed to get session analytics');
    }
  }

  /**
   * ✅ UNCHANGED: Save individual messages with 5D scores to database
   */
  async saveSessionMessages(
    sessionId: string,
    userId: string,
    messagesWithScores: Array<{
      role: 'user' | 'assistant';
      content: string;
      index: number;
      timestamp?: string;
      scores?: Array<{
        overall: number;
        dimensions: {
          strategic: number;
          tactical: number;
          cognitive: number;
          innovation: number;
          context: number; // ✅ NEW: 5th dimension
        };
        classification: string;
        explanation?: string;
        betterMove?: string;
        confidence?: number;
      }>;
    }>
  ): Promise<void> {
    try {
      logger.info('💾 Saving session messages', {
        sessionId,
        userId,
        messageCount: messagesWithScores.length
      });

      // ✅ TRANSACTION: Ensure all messages saved or none
      await prisma.$transaction(async (tx) => {
        // Delete existing messages for this session (in case of re-analysis)
        await tx.message.deleteMany({
          where: { sessionId }
        });
        
        // Save all messages with their scores
        for (const message of messagesWithScores) {
          const savedMessage = await tx.message.create({
            data: {
              sessionId,
              role: message.role.toUpperCase() as 'USER' | 'ASSISTANT',
              content: message.content,
              index: message.index,
              timestamp: message.timestamp ? new Date(message.timestamp) : new Date()
            }
          });
          
          // Save score for this message (if exists)
          if (message.scores && message.scores.length > 0) {
            const score = message.scores[0]; // Take first score
            
            await tx.score.create({
              data: {
                messageId: savedMessage.id,
                sessionId: sessionId,
                overall: score.overall,
                strategic: score.dimensions.strategic,
                tactical: score.dimensions.tactical,
                cognitive: score.dimensions.cognitive,
                innovation: score.dimensions.innovation,
                context: score.dimensions.context, // ✅ NEW: 5th dimension
                classification: score.classification,
                chessNotation: this.getChessNotationFromScore(score),
                explanation: score.explanation || '',
                betterMove: score.betterMove || '',
                confidence: score.confidence || 0.9
              }
            });
          }
        }
      });
      
      logger.info('✅ Session messages saved successfully', {
        sessionId,
        savedCount: messagesWithScores.length
      });
      
    } catch (error) {
      logger.error('❌ Failed to save session messages', {
        error: error instanceof Error ? error.message : String(error),
        sessionId,
        userId,
        messageCount: messagesWithScores.length
      });
      
      throw new Error('Failed to save session messages');
    }
  }

  /**
   * ✅ UNCHANGED: Safe chessNotation generation from score
   */
  private getChessNotationFromScore(score: any): string {
    // First try to get chessNotation from score (if exists)
    if (score.chessNotation) {
      return score.chessNotation;
    }
    
    // Generate from overall score if chessNotation missing (Claude analysis case)
    if (score.overall >= 80) return '!!';
    if (score.overall >= 70) return '!';
    if (score.overall >= 60) return '+';
    if (score.overall >= 40) return '=';
    if (score.overall >= 20) return '?';
    return '??';
  }

  /**
   * ✅ UNCHANGED: Get session with individual messages and 5D scores
   */
  async getSession(userId: string, sessionId: string): Promise<any> {
    try {
      logger.info('📖 Getting session', { sessionId, userId });
      
      // Get session with related messages and scores
      const session = await prisma.session.findFirst({
        where: {
          id: sessionId,
          userId
        },
        include: {
          messages: {
            include: {
              score: true
            },
            orderBy: {
              index: 'asc'
            }
          }
        }
      });

      if (!session) {
        logger.info('❌ Session not found', { sessionId });
        return { success: false, error: 'Session not found' };
      }

      // ✅ ENHANCED: Transform database records to frontend format with 5D support
      const messages = session.messages.map(msg => ({
        id: msg.id,
        role: msg.role.toLowerCase() as 'user' | 'assistant',
        content: msg.content,
        index: msg.index,
        timestamp: msg.timestamp.toISOString(),
        scores: msg.score ? [{
          overall: msg.score.overall,
          dimensions: {
            strategic: msg.score.strategic,
            tactical: msg.score.tactical,
            cognitive: msg.score.cognitive,
            innovation: msg.score.innovation,
            context: msg.score.context // ✅ NEW: 5th dimension from database
          },
          classification: msg.score.classification,
          chessNotation: msg.score.chessNotation,
          confidence: msg.score.confidence,
          explanation: msg.score.explanation || undefined,
          betterMove: msg.score.betterMove || undefined
        }] : []
      }));

      logger.info('✅ Session retrieved successfully', {
        sessionId,
        messageCount: messages.length,
        averageScore: session.overallScore
      });

      return {
        success: true,
        session: {
          id: session.id,
          title: session.title,
          platform: session.platform.toLowerCase(),
          status: session.status,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
          messageCount: session.messageCount,
          overallScore: session.overallScore,
          // ✅ ENHANCED: Include 5D dimension averages
          dimensionAverages: {
            strategic: session.strategicAvg,
            tactical: session.tacticalAvg,
            cognitive: session.cognitiveAvg,
            innovation: session.innovationAvg,
            context: session.contextAvg // ✅ NEW: 5th dimension from database
          }
        },
        messages,
        metadata: session.metadata || {}
      };
      
    } catch (error) {
      logger.error('❌ Get session failed', { error, sessionId, userId });
      return { success: false, error: 'Failed to retrieve session' };
    }
  }

  /**
   * ✅ UNCHANGED: Backward compatibility overload for sessions.ts
   */
  async getUserSessions(
    userId: string,
    limitOrOptions?: number | {
      limit?: number;
      offset?: number;
      platform?: Platform;
      sortBy?: 'createdAt' | 'updatedAt' | 'overallScore';
      sortOrder?: 'asc' | 'desc';
    },
    offset?: number
  ): Promise<any> {
    // ✅ COMPATIBILITY: Handle both old (userId, limit, offset) and new (userId, options) formats
    let options: {
      limit?: number;
      offset?: number;
      platform?: Platform;
      sortBy?: 'createdAt' | 'updatedAt' | 'overallScore';
      sortOrder?: 'asc' | 'desc';
    };

    if (typeof limitOrOptions === 'number') {
      // Old format: getUserSessions(userId, limit, offset)
      options = {
        limit: limitOrOptions,
        offset: offset || 0,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      };
    } else {
      // New format: getUserSessions(userId, options)
      options = limitOrOptions || {};
    }

    try {
      const {
        limit = 20,
        offset = 0,
        platform,
        sortBy = 'updatedAt',
        sortOrder = 'desc'
      } = options;

      const where: any = { userId };
      if (platform && platform !== 'auto') {
        where.platform = platform.toUpperCase();
      }

      const sessions = await prisma.session.findMany({
        where,
        select: {
          id: true,
          title: true,
          platform: true,
          messageCount: true,
          overallScore: true,
          // ✅ ENHANCED: Include 5D averages in session list
          strategicAvg: true,
          tacticalAvg: true,
          cognitiveAvg: true,
          innovationAvg: true,
          contextAvg: true, // ✅ NEW: 5th dimension
          status: true,
          trend: true,
          createdAt: true,
          updatedAt: true,
          metadata: true
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: offset,
        take: limit
      });

      const totalCount = await prisma.session.count({ where });

      // Transform to frontend format
      const transformedSessions = sessions.map(session => {
        // ✅ SAFE: Parse metadata JSON if it exists
        let parsedMetadata = session.metadata || {};
        try {
          if (typeof session.metadata === 'string') {
            parsedMetadata = JSON.parse(session.metadata as string);
          }
        } catch (e) {
          // Keep original metadata if parsing fails
          parsedMetadata = session.metadata || {};
        }

        return {
          ...session,
          platform: session.platform.toLowerCase(),
          // ✅ ENHANCED: Include 5D dimension averages
          dimensionAverages: {
            strategic: session.strategicAvg,
            tactical: session.tacticalAvg,
            cognitive: session.cognitiveAvg,
            innovation: session.innovationAvg,
            context: session.contextAvg // ✅ NEW: 5th dimension
          },
          // ✅ EXTRACT: Common metadata fields
          projectContext: (parsedMetadata as any)?.projectContext,
          sessionGoal: (parsedMetadata as any)?.sessionGoal
        };
      });

      return {
        success: true,
        sessions: transformedSessions,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      };

    } catch (error) {
      logger.error('Failed to get user sessions', { error, userId });
      return { success: false, error: 'Failed to retrieve sessions' };
    }
  }

  /**
   * ✅ UNCHANGED: Delete session and all related data
   */
  async deleteSession(userId: string, sessionId: string): Promise<boolean> {
    try {
      // Use transaction to ensure all related data is deleted
      await prisma.$transaction(async (tx) => {
        // Delete scores first (foreign key constraint)
        await tx.score.deleteMany({
          where: {
            sessionId
          }
        });

        // Delete messages
        await tx.message.deleteMany({
          where: {
            sessionId
          }
        });

        // Finally delete session
        await tx.session.delete({
          where: {
            id: sessionId,
            userId // Ensure user owns this session
          }
        });
      });

      logger.info('Session deleted successfully', { sessionId, userId });
      return true;

    } catch (error) {
      logger.error('Failed to delete session', { error, sessionId, userId });
      return false;
    }
  }
}