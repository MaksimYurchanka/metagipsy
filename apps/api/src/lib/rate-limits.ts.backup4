// ✅ RATE LIMITING SYSTEM - Add to new file: apps/api/src/lib/rate-limits.ts

import { redis } from './redis';
import { prisma } from './prisma';
import { logger } from './logger';

export interface UserTier {
  type: 'free' | 'pro' | 'enterprise';
  dailyCharacterLimit: number;
  dailyAnalysisLimit: number;
  features: string[];
  stripePriceId?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  currentUsage: number;
  dailyLimit: number;
  resetTime: Date;
  tierType: string;
  message?: string;
}

export class RateLimitService {
  // ✅ TIER DEFINITIONS
  static readonly TIERS: Record<string, UserTier> = {
    free: {
      type: 'free',
      dailyCharacterLimit: 5000,      // 5k characters for testing
      dailyAnalysisLimit: 5,          // 5 analyses per day
      features: ['Basic 5D Analysis', 'Local Parsing', 'Session History']
    },
    pro: {
      type: 'pro',
      dailyCharacterLimit: 500000,    // 500k characters per day
      dailyAnalysisLimit: 100,        // 100 analyses per day
      features: ['Enhanced AI Parsing', 'Unlimited Sessions', 'Export Features', 'Priority Support'],
      stripePriceId: 'price_pro_daily' // Will be set up in Stripe
    },
    enterprise: {
      type: 'enterprise',
      dailyCharacterLimit: 2000000,   // 2M characters per day
      dailyAnalysisLimit: 1000,       // 1000 analyses per day
      features: ['API Access', 'Custom Integrations', 'White Label', 'Dedicated Support'],
      stripePriceId: 'price_enterprise_monthly'
    }
  };

  /**
   * 🔍 GET USER TIER from database or default to free
   */
  static async getUserTier(userId: string): Promise<UserTier> {
    try {
      // Check if user has pro subscription in database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          subscriptionExpiry: true 
        }
      });

      if (!user) {
        logger.warn('User not found, defaulting to free tier', { userId });
        return this.TIERS.free;
      }

      // Check if subscription is active
      if (user.subscriptionTier === 'pro' || user.subscriptionTier === 'enterprise') {
        const isActive = user.subscriptionStatus === 'active' && 
                        (!user.subscriptionExpiry || new Date(user.subscriptionExpiry) > new Date());
        
        if (isActive) {
          return this.TIERS[user.subscriptionTier];
        } else {
          logger.info('Subscription expired, falling back to free tier', { 
            userId, 
            subscriptionTier: user.subscriptionTier,
            subscriptionExpiry: user.subscriptionExpiry 
          });
        }
      }

      return this.TIERS.free;

    } catch (error) {
      logger.error('Failed to get user tier, defaulting to free', { error, userId });
      return this.TIERS.free;
    }
  }

  /**
   * 📊 CHECK DAILY USAGE against limits
   */
  static async checkDailyUsage(
    userId: string, 
    requestedCharacters: number
  ): Promise<RateLimitResult> {
    try {
      const userTier = await this.getUserTier(userId);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const usageKey = `usage:${userId}:${today}`;
      
      // Get current usage from Redis
      const currentUsageStr = await redis.get(usageKey);
      const currentUsage = parseInt(currentUsageStr || '0');
      
      const wouldExceed = (currentUsage + requestedCharacters) > userTier.dailyCharacterLimit;
      const resetTime = new Date();
      resetTime.setHours(24, 0, 0, 0); // Reset at midnight

      if (wouldExceed) {
        return {
          allowed: false,
          currentUsage,
          dailyLimit: userTier.dailyCharacterLimit,
          resetTime,
          tierType: userTier.type,
          message: `Daily limit exceeded. You've used ${currentUsage}/${userTier.dailyCharacterLimit} characters. ${
            userTier.type === 'free' ? 'Upgrade to Pro for 500k daily characters.' : 'Limit resets at midnight.'
          }`
        };
      }

      return {
        allowed: true,
        currentUsage,
        dailyLimit: userTier.dailyCharacterLimit,
        resetTime,
        tierType: userTier.type
      };

    } catch (error) {
      logger.error('Rate limit check failed, allowing request', { error, userId });
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        currentUsage: 0,
        dailyLimit: this.TIERS.free.dailyCharacterLimit,
        resetTime: new Date(),
        tierType: 'free',
        message: 'Rate limit check unavailable'
      };
    }
  }

  /**
   * 📈 RECORD USAGE after successful analysis
   */
  static async recordUsage(
    userId: string, 
    charactersUsed: number,
    analysisType: 'local' | 'haiku' = 'local'
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const usageKey = `usage:${userId}:${today}`;
      const analysisKey = `analyses:${userId}:${today}`;
      
      // Increment character usage
      await redis.incrby(usageKey, charactersUsed);
      
      // Increment analysis count
      await redis.incr(analysisKey);
      
      // Set expiry for 48 hours (to handle timezone differences)
      await redis.expire(usageKey, 48 * 60 * 60);
      await redis.expire(analysisKey, 48 * 60 * 60);
      
      logger.info('Usage recorded successfully', {
        userId,
        charactersUsed,
        analysisType,
        date: today
      });

    } catch (error) {
      logger.error('Failed to record usage', { error, userId, charactersUsed });
      // Don't throw - usage recording failure shouldn't break analysis
    }
  }

  /**
   * 📊 GET USAGE STATS for user dashboard
   */
  static async getUserUsageStats(userId: string): Promise<{
    today: {
      characters: number;
      analyses: number;
      charactersLimit: number;
      analysesLimit: number;
    };
    tier: UserTier;
    percentUsed: number;
    resetTime: Date;
  }> {
    try {
      const userTier = await this.getUserTier(userId);
      const today = new Date().toISOString().split('T')[0];
      
      const usageKey = `usage:${userId}:${today}`;
      const analysisKey = `analyses:${userId}:${today}`;
      
      const [charactersUsed, analysesUsed] = await Promise.all([
        redis.get(usageKey).then(val => parseInt(val || '0')),
        redis.get(analysisKey).then(val => parseInt(val || '0'))
      ]);
      
      const percentUsed = Math.round((charactersUsed / userTier.dailyCharacterLimit) * 100);
      
      const resetTime = new Date();
      resetTime.setHours(24, 0, 0, 0);
      
      return {
        today: {
          characters: charactersUsed,
          analyses: analysesUsed,
          charactersLimit: userTier.dailyCharacterLimit,
          analysesLimit: userTier.dailyAnalysisLimit
        },
        tier: userTier,
        percentUsed,
        resetTime
      };

    } catch (error) {
      logger.error('Failed to get usage stats', { error, userId });
      return {
        today: {
          characters: 0,
          analyses: 0,
          charactersLimit: this.TIERS.free.dailyCharacterLimit,
          analysesLimit: this.TIERS.free.dailyAnalysisLimit
        },
        tier: this.TIERS.free,
        percentUsed: 0,
        resetTime: new Date()
      };
    }
  }

  /**
   * 💳 STRIPE INTEGRATION: Update user tier after payment
   */
  static async updateUserTier(
    userId: string, 
    newTier: 'free' | 'pro' | 'enterprise',
    subscriptionId?: string,
    expiryDate?: Date
  ): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: newTier,
          subscriptionStatus: newTier === 'free' ? 'none' : 'active',
          subscriptionExpiry: expiryDate,
          stripeSubscriptionId: subscriptionId,
          updatedAt: new Date()
        }
      });

      logger.info('User tier updated successfully', {
        userId,
        newTier,
        subscriptionId,
        expiryDate
      });

    } catch (error) {
      logger.error('Failed to update user tier', { error, userId, newTier });
      throw new Error('Failed to update subscription');
    }
  }
}

// ✅ MIDDLEWARE: Rate limiting for analyze endpoints
export async function rateLimitMiddleware(
  userId: string,
  requestedCharacters: number
): Promise<RateLimitResult> {
  return RateLimitService.checkDailyUsage(userId, requestedCharacters);
}