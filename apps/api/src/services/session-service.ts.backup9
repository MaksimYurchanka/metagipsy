import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { logger } from '../lib/logger';
import { SessionSummary, SessionMetadata, AnalysisPattern, Platform } from '../types';

export class SessionService {
  /**
   * ✅ ENHANCED: Create new analysis session with metadata support
   */
  async createSession(
    userId: string, 
    userEmail: string,
    metadata: {
      platform?: Platform;
      projectContext?: string;
      sessionGoal?: string;
    } = {}
  ): Promise<string> {
    try {
      console.log('🚀 CREATING SESSION:', { userId, userEmail, metadata });
      
      const session = await prisma.session.create({
        data: {
          userId,
          userEmail,
          platform: metadata.platform || 'other',
          title: `Analysis ${new Date().toLocaleDateString()}`,
          status: 'active',
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

      console.log('✅ SESSION CREATED:', session.id);
      logger.info('Session created successfully', { 
        sessionId: session.id, 
        userId, 
        platform: metadata.platform 
      });
      
      return session.id;
      
    } catch (error) {
      console.error('❌ SESSION CREATION FAILED:', error);
      logger.error('Failed to create session', { error, userId });
      throw new Error('Failed to create session');
    }
  }

  /**
   * ✅ ENHANCED: Update session with analysis summary and 5D averages
   */
  async updateSession(
    userId: string, 
    sessionId: string, 
    summary: SessionSummary
  ): Promise<void> {
    try {
      console.log('🔄 UPDATING SESSION:', { sessionId, userId });
      
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
          status: 'completed',
          completedAt: new Date(),
          metadata: {
            ...summary,
            updatedAt: new Date().toISOString(),
            // ✅ ENHANCED: Store patterns and insights in metadata
            patterns: summary.patterns || [],
            insights: summary.insights || [],
            trend: summary.trend
          }
        }
      });

      console.log('✅ SESSION UPDATED:', sessionId);
      logger.info('Session updated successfully', { sessionId, userId, summary });
      
    } catch (error) {
      console.error('❌ SESSION UPDATE FAILED:', error);
      logger.error('Failed to update session', { error, sessionId, userId });
      throw new Error('Failed to update session');
    }
  }

  /**
   * ✅ CRITICAL: Save individual messages with 5D scores to database
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
      console.log('💾 SAVING SESSION MESSAGES:', {
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
                chessNotation: this.getChessNotationFromScore(score), // ✅ FIXED: Safe chessNotation generation
                explanation: score.explanation || '',
                betterMove: score.betterMove || '',
                confidence: score.confidence || 0.9
              }
            });
          }
        }
      });
      
      console.log('✅ SESSION MESSAGES SAVED:', {
        sessionId,
        savedCount: messagesWithScores.length
      });
      logger.info('Session messages saved successfully', {
        sessionId,
        userId,
        messageCount: messagesWithScores.length
      });
      
    } catch (error) {
      console.error('❌ FAILED TO SAVE SESSION MESSAGES:', {
        error: error instanceof Error ? error.message : String(error),
        sessionId,
        userId,
        messageCount: messagesWithScores.length
      });
      
      logger.error('Failed to save session messages', { 
        error, 
        sessionId, 
        userId 
      });
      throw new Error('Failed to save session messages');
    }
  }

  /**
   * ✅ FIXED: Safe chessNotation generation from score
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
   * ✅ ENHANCED: Get session with individual messages and 5D scores
   */
  async getSession(userId: string, sessionId: string): Promise<any> {
    try {
      console.log('📖 GETTING SESSION:', { sessionId, userId });
      
      // Get session with related messages and scores
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
        console.log('❌ SESSION NOT FOUND:', sessionId);
        return { success: false, error: 'Session not found' };
      }

      // ✅ ENHANCED: Transform database records to frontend format with 5D support
      const messages = session.messages.map(msg => ({
        id: msg.id,
        role: msg.role.toLowerCase() as 'user' | 'assistant',
        content: msg.content,
        index: msg.index,
        timestamp: msg.timestamp.toISOString(),
        scores: msg.scores.map(score => ({
          overall: score.overall,
          dimensions: {
            strategic: score.strategic,
            tactical: score.tactical,
            cognitive: score.cognitive,
            innovation: score.innovation,
            context: score.context // ✅ NEW: 5th dimension from database
          },
          classification: score.classification,
          chessNotation: score.chessNotation,
          confidence: score.confidence,
          explanation: score.explanation || undefined,
          betterMove: score.betterMove || undefined
        }))
      }));

      console.log('✅ SESSION RETRIEVED:', {
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
      console.error('❌ GET SESSION FAILED:', error);
      logger.error('Failed to get session', { error, sessionId, userId });
      return { success: false, error: 'Failed to retrieve session' };
    }
  }

  /**
   * ✅ Get user sessions with pagination and filtering
   */
  async getUserSessions(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      platform?: Platform;
      sortBy?: 'createdAt' | 'updatedAt' | 'overallScore';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<any> {
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
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: offset,
        take: limit
      });

      const totalCount = await prisma.session.count({ where });

      // Transform to frontend format
      const transformedSessions = sessions.map(session => ({
        ...session,
        platform: session.platform.toLowerCase(),
        // ✅ ENHANCED: Include 5D dimension averages
        dimensionAverages: {
          strategic: session.strategicAvg,
          tactical: session.tacticalAvg,
          cognitive: session.cognitiveAvg,
          innovation: session.innovationAvg,
          context: session.contextAvg // ✅ NEW: 5th dimension
        }
      }));

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
   * ✅ Delete session and all related data
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