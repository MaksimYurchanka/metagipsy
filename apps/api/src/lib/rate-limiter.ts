import { redis } from './redis';
import { RateLimitError } from '@/types';
import { logger } from './logger';

export interface RateLimitConfig {
  requests: number;
  window: number; // seconds
}

export class RateLimiter {
  private limits: Record<string, RateLimitConfig> = {
    free: { requests: 100, window: 3600 },      // 100 per hour
    pro: { requests: 1000, window: 3600 },      // 1000 per hour
    enterprise: { requests: 10000, window: 3600 } // 10000 per hour
  };
  
  /**
   * Check if request is within rate limit
   */
  async checkLimit(
    userId: string, 
    tier: 'free' | 'pro' | 'enterprise' = 'free'
  ): Promise<void> {
    const key = `rate_limit:${userId}`;
    const limit = this.limits[tier];
    
    try {
      const current = await redis.incr(key);
      
      if (current === 1) {
        // First request in window, set expiration
        await redis.expire(key, limit.window);
      }
      
      if (current > limit.requests) {
        const ttl = await redis.ttl(key);
        throw new RateLimitError(
          `Rate limit exceeded. Try again in ${ttl} seconds.`,
          ttl
        );
      }
      
      logger.debug(`Rate limit check passed: ${current}/${limit.requests} for user ${userId}`);
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      
      logger.error('Rate limiter error:', error);
      // Allow request if Redis is down (fail open)
    }
  }
  
  /**
   * Get remaining requests for user
   */
  async getRemainingRequests(
    userId: string, 
    tier: 'free' | 'pro' | 'enterprise' = 'free'
  ): Promise<{ remaining: number; resetTime: number }> {
    const key = `rate_limit:${userId}`;
    const limit = this.limits[tier];
    
    try {
      const [current, ttl] = await Promise.all([
        redis.get(key),
        redis.ttl(key)
      ]);
      
      const used = parseInt(current || '0');
      const remaining = Math.max(0, limit.requests - used);
      const resetTime = ttl > 0 ? Date.now() + (ttl * 1000) : 0;
      
      return { remaining, resetTime };
    } catch (error) {
      logger.error('Error getting remaining requests:', error);
      return { remaining: limit.requests, resetTime: 0 };
    }
  }
  
  /**
   * Reset rate limit for user (admin function)
   */
  async resetLimit(userId: string): Promise<void> {
    const key = `rate_limit:${userId}`;
    
    try {
      await redis.del(key);
      logger.info(`Rate limit reset for user ${userId}`);
    } catch (error) {
      logger.error('Error resetting rate limit:', error);
    }
  }
  
  /**
   * Get rate limit status for user
   */
  async getStatus(
    userId: string, 
    tier: 'free' | 'pro' | 'enterprise' = 'free'
  ): Promise<{
    limit: number;
    used: number;
    remaining: number;
    resetTime: number;
    windowSeconds: number;
  }> {
    const key = `rate_limit:${userId}`;
    const limit = this.limits[tier];
    
    try {
      const [current, ttl] = await Promise.all([
        redis.get(key),
        redis.ttl(key)
      ]);
      
      const used = parseInt(current || '0');
      const remaining = Math.max(0, limit.requests - used);
      const resetTime = ttl > 0 ? Date.now() + (ttl * 1000) : 0;
      
      return {
        limit: limit.requests,
        used,
        remaining,
        resetTime,
        windowSeconds: limit.window
      };
    } catch (error) {
      logger.error('Error getting rate limit status:', error);
      return {
        limit: limit.requests,
        used: 0,
        remaining: limit.requests,
        resetTime: 0,
        windowSeconds: limit.window
      };
    }
  }
  
  /**
   * Check if user is currently rate limited
   */
  async isLimited(
    userId: string, 
    tier: 'free' | 'pro' | 'enterprise' = 'free'
  ): Promise<boolean> {
    const status = await this.getStatus(userId, tier);
    return status.remaining === 0;
  }
  
  /**
   * Increment usage without checking limit (for tracking)
   */
  async incrementUsage(userId: string): Promise<number> {
    const key = `rate_limit:${userId}`;
    
    try {
      return await redis.incr(key);
    } catch (error) {
      logger.error('Error incrementing usage:', error);
      return 0;
    }
  }
  
  /**
   * Get usage statistics for multiple users
   */
  async getUsageStats(userIds: string[]): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};
    
    try {
      const keys = userIds.map(id => `rate_limit:${id}`);
      const values = await redis.mget(...keys);
      
      userIds.forEach((userId, index) => {
        stats[userId] = parseInt(values[index] || '0');
      });
    } catch (error) {
      logger.error('Error getting usage stats:', error);
    }
    
    return stats;
  }
  
  /**
   * Clean up expired rate limit keys (maintenance function)
   */
  async cleanup(): Promise<number> {
    try {
      const pattern = 'rate_limit:*';
      const keys = await redis.keys(pattern);
      
      let cleaned = 0;
      for (const key of keys) {
        const ttl = await redis.ttl(key);
        if (ttl === -1) {
          // Key exists but has no expiration, clean it up
          await redis.del(key);
          cleaned++;
        }
      }
      
      logger.info(`Cleaned up ${cleaned} expired rate limit keys`);
      return cleaned;
    } catch (error) {
      logger.error('Error during rate limit cleanup:', error);
      return 0;
    }
  }
}

export default RateLimiter;

