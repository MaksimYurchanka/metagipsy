// ✅ FIXED RATE LIMITING SYSTEM - Auto-create Prisma users + TypeScript corrections
// apps/api/src/lib/rate-limits.ts

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
      dailyCharacterLimit: 5000,
      dailyAnalysisLimit: 5,
      features: ['Basic 5D Analysis', 'Local Parsing', 'Session History']
    },
    pro: {
      type: 'pro',
      dailyCharacterLimit: 500000,
      dailyAnalysisLimit: 100,
      features: ['Enhanced AI Parsing', 'Unlimited Sessions', 'Export Features', 'Priority Support'],
      stripePriceId: 'price_pro_daily'
    },
    enterprise: {
      type: 'enterprise',
      dailyCharacterLimit: 2000000,
      dailyAnalysisLimit: 1000,
      features: ['API Access', 'Custom Integrations', 'White Label', 'Dedicated Support'],
      stripePriceId: 'price_enterprise_monthly'
    }
  };

  /**
   * 🔧 FIXED: Auto-create Prisma user if missing (Supabase → Prisma sync)
   */
  static async ensureUserExists(userId: string, email?: string): Promise<void> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
      });

      if (existingUser) {
        return; // User already exists
      }

      // ✅ FIXED: Correct static method call
      const nextReset = RateLimitService.getNextResetTime();

      // ✅ CREATE USER: Auto-create missing Prisma user from Supabase
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          email: email || `user_${userId}@example.com`, // Fallback email
          tier: 'FREE',
          dailyLimit: this.TIERS.free.dailyCharacterLimit,
          dailyUsage: 0,
          usageResetDate: nextReset,
          cancelAtPeriodEnd: false, // ✅ FIXED: Added missing required field
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      logger.info('🎊 User auto-created in Prisma database', { 
        userId, 
        email: newUser.email,
        tier: newUser.tier,
        dailyLimit: newUser.dailyLimit
      });

    } catch (error) {
      // Handle unique constraint violations gracefully (race condition)
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        logger.info('User creation race condition - user already exists', { userId });
        return;
      }
      
      logger.error('Failed to auto-create user in Prisma', { error, userId, email });
      throw error;
    }
  }

  /**
   * 🔍 GET USER TIER - ENHANCED with auto-creation
   */
  static async getUserTier(userId: string, email?: string): Promise<UserTier> {
    try {
      // ✅ ENSURE USER EXISTS: Auto-create if missing
      await this.ensureUserExists(userId, email);

      // ✅ ENHANCED: Get user with Stripe subscription info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true,
          email: true,
          tier: true,
          // ✅ NEW: Stripe subscription fields
          currentPlan: true,
          subscriptionStatus: true,
          dailyLimit: true
        }
      });

      if (!user) {
        // This should not happen after ensureUserExists, but handle gracefully
        logger.warn('User still not found after auto-creation attempt', { userId });
        return this.TIERS.free;
      }

      // ✅ ENHANCED: Determine tier from subscription status
      if (user.subscriptionStatus === 'active' && user.currentPlan) {
        if (user.currentPlan === 'daily' || user.currentPlan === 'monthly') {
          const tier = { ...this.TIERS.pro };
          // ✅ USE DATABASE: Override with actual daily limit from database
          if (user.dailyLimit && user.dailyLimit > 0) {
            tier.dailyCharacterLimit = user.dailyLimit;
          }
          return tier;
        }
      }

      // ✅ FALLBACK: Use schema tier field
      const tierMap: Record<string, keyof typeof this.TIERS> = {
        'FREE': 'free',
        'PRO': 'pro', 
        'ENTERPRISE': 'enterprise'
      };

      const userTierKey = tierMap[user.tier] || 'free';
      const tier = { ...this.TIERS[userTierKey] };
      
      // ✅ USE DATABASE: Override with actual daily limit
      if (user.dailyLimit && user.dailyLimit > 0) {
        tier.dailyCharacterLimit = user.dailyLimit;
      }
      
      return tier;

    } catch (error) {
      logger.error('Failed to get user tier, defaulting to free', { error, userId });
      return this.TIERS.free;
    }
  }

  /**
   * 📊 CHECK DAILY USAGE - ENHANCED with auto-creation
   */
  static async checkDailyUsage(
    userId: string, 
    requestedCharacters: number,
    email?: string
  ): Promise<RateLimitResult> {
    try {
      // ✅ ENSURE USER EXISTS: Auto-create if missing
      await this.ensureUserExists(userId, email);

      // ✅ GET user data including usage from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          dailyUsage: true,
          dailyLimit: true,
          usageResetDate: true,
          currentPlan: true,
          subscriptionStatus: true,
          tier: true
        }
      });

      if (!user) {
        // This should not happen after ensureUserExists
        logger.error('User still not found after auto-creation', { userId });
        return {
          allowed: false,
          currentUsage: 0,
          dailyLimit: 5000,
          resetTime: new Date(),
          tierType: 'free',
          message: 'User creation failed'
        };
      }

      const userTier = await this.getUserTier(userId, email);
      
      // ✅ CHECK if usage needs reset (new day)
      const now = new Date();
      const resetDate = user.usageResetDate || new Date(0);
      const needsReset = now > resetDate;
      
      let currentUsage = user.dailyUsage || 0;
      
      // ✅ RESET usage if needed
      if (needsReset) {
        // ✅ FIXED: Correct static method call
        const nextReset = RateLimitService.getNextResetTime();
        
        await prisma.user.update({
          where: { id: userId },
          data: {
            dailyUsage: 0,
            usageResetDate: nextReset
          }
        });
        
        currentUsage = 0;
        logger.info('Daily usage reset for user', { userId, nextReset });
      }

      const dailyLimit = user.dailyLimit || userTier.dailyCharacterLimit;
      const wouldExceed = (currentUsage + requestedCharacters) > dailyLimit;
      
      // ✅ FIXED: Correct static method call for reset time
      const resetTime = user.usageResetDate || RateLimitService.getNextResetTime();

      if (wouldExceed) {
        return {
          allowed: false,
          currentUsage,
          dailyLimit,
          resetTime,
          tierType: userTier.type,
          message: `Daily limit exceeded. You've used ${currentUsage.toLocaleString()}/${dailyLimit.toLocaleString()} characters. ${
            userTier.type === 'free' ? 'Upgrade to Pro for 500k daily characters.' : 'Limit resets at midnight.'
          }`
        };
      }

      return {
        allowed: true,
        currentUsage,
        dailyLimit,
        resetTime,
        tierType: userTier.type
      };

    } catch (error) {
      logger.error('Rate limit check failed, allowing request', { error, userId });
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        currentUsage: 0,
        dailyLimit: 5000,
        resetTime: new Date(),
        tierType: 'free',
        message: 'Rate limit check unavailable'
      };
    }
  }

  /**
   * 📈 RECORD USAGE - DATABASE INTEGRATED
   */
  static async recordUsage(
    userId: string, 
    charactersUsed: number,
    analysisType: 'local' | 'haiku' = 'local'
  ): Promise<void> {
    try {
      // ✅ ENSURE USER EXISTS before recording usage
      await this.ensureUserExists(userId);

      // ✅ UPDATE usage in database
      await prisma.user.update({
        where: { id: userId },
        data: {
          dailyUsage: {
            increment: charactersUsed
          }
        }
      });
      
      // ✅ ALSO track in Redis for analytics
      const today = new Date().toISOString().split('T')[0];
      const analysisKey = `analyses:${userId}:${today}`;
      
      await redis.incr(analysisKey);
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
   * 📊 GET USAGE STATS - ENHANCED with auto-creation
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
      // ✅ ENSURE USER EXISTS
      await this.ensureUserExists(userId);

      // ✅ GET usage from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          dailyUsage: true,
          dailyLimit: true,
          usageResetDate: true
        }
      });

      const userTier = await this.getUserTier(userId);
      
      // ✅ GET analysis count from Redis
      const today = new Date().toISOString().split('T')[0];
      const analysisKey = `analyses:${userId}:${today}`;
      const analysesUsed = await redis.get(analysisKey).then(val => parseInt(val || '0'));
      
      const charactersUsed = user?.dailyUsage || 0;
      const charactersLimit = user?.dailyLimit || userTier.dailyCharacterLimit;
      const percentUsed = Math.round((charactersUsed / charactersLimit) * 100);
      
      // ✅ FIXED: Correct static method call
      const resetTime = user?.usageResetDate || RateLimitService.getNextResetTime();
      
      return {
        today: {
          characters: charactersUsed,
          analyses: analysesUsed,
          charactersLimit,
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
          charactersLimit: 5000,
          analysesLimit: 5
        },
        tier: this.TIERS.free,
        percentUsed: 0,
        resetTime: new Date()
      };
    }
  }

  /**
   * 💳 UPDATE USER TIER - STRIPE COMPATIBLE
   */
  static async updateUserTier(
    userId: string, 
    newTier: 'free' | 'pro' | 'enterprise'
  ): Promise<void> {
    try {
      // ✅ ENSURE USER EXISTS before updating
      await this.ensureUserExists(userId);

      const tierMap: Record<string, 'FREE' | 'PRO' | 'ENTERPRISE'> = {
        'free': 'FREE',
        'pro': 'PRO',
        'enterprise': 'ENTERPRISE'
      };

      const tierConfig = this.TIERS[newTier];

      await prisma.user.update({
        where: { id: userId },
        data: {
          tier: tierMap[newTier] || 'FREE',
          dailyLimit: tierConfig.dailyCharacterLimit,
          updatedAt: new Date()
        }
      });

      logger.info('User tier updated successfully', { userId, newTier });

    } catch (error) {
      logger.error('Failed to update user tier', { error, userId, newTier });
      throw new Error('Failed to update subscription');
    }
  }

  /**
   * 🔄 RESET ALL DAILY USAGE (cron job helper)
   */
  static async resetAllDailyUsage(): Promise<void> {
    try {
      // ✅ FIXED: Correct static method call
      const nextReset = RateLimitService.getNextResetTime();

      const result = await prisma.user.updateMany({
        where: {
          usageResetDate: {
            lt: new Date()
          }
        },
        data: {
          dailyUsage: 0,
          usageResetDate: nextReset
        }
      });

      logger.info('Daily usage reset completed', { 
        usersReset: result.count,
        nextReset
      });

    } catch (error) {
      logger.error('Failed to reset daily usage', { error });
    }
  }

  /**
   * ✅ FIXED: Public static method for next reset time
   */
  static getNextResetTime(): Date {
    const nextReset = new Date();
    nextReset.setHours(24, 0, 0, 0); // Next midnight
    return nextReset;
  }
}

// ✅ ENHANCED MIDDLEWARE: Rate limiting for analyze endpoints with auto-creation
export async function rateLimitMiddleware(
  userId: string,
  requestedCharacters: number,
  email?: string
): Promise<RateLimitResult> {
  return RateLimitService.checkDailyUsage(userId, requestedCharacters, email);
}