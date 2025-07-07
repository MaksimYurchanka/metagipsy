import { redis } from './redis';
import { RateLimitError } from '../types';
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
    
    if (!limit) {
      throw new Error(`Invalid tier: ${tier}`);
    }
    
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
   * Create Express middleware for rate limiting
   */
  createLimiter(name: string, maxRequests: number, windowSeconds: number) {
    return async (req: any, res: any, next: any) => {
      try {
        const userId = req.user?.id || req.ip || 'anonymous';
        await this.checkLimit(userId, 'free');
        next();
      } catch (error) {
        if (error instanceof RateLimitError) {
          return res.status(429).json({
            error: 'Rate limit exceeded',
            message: error.message,
            retryAfter: error.retryAfter
          });
        }
        next(error);
      }
    };
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
    
    if (!limit) {
      return { remaining: 0, resetTime: 0 };
    }
    
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
    
    if (!limit) {
      return {
        limit: 0,
        used: 0,
        remaining: 0,
        resetTime: 0,
        windowSeconds: 0
      };
    }
    
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
}

// Create and export default instance
export const rateLimiter = new RateLimiter();
export default rateLimiter;