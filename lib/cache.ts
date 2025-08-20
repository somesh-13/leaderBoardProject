/**
 * Simple in-memory cache without Redis dependency
 * Provides basic caching and rate limiting functionality
 */

// Simple in-memory cache with TTL
class SimpleCache {
  private cache = new Map<string, { data: unknown; expiry: number }>();
  private readonly maxSize = 10000;

  get<T = unknown>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  set(key: string, value: unknown, ttlSeconds: number = 300): void {
    // Clean up expired entries if cache is getting large
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }
    
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data: value, expiry });
  }

  del(key: string): void {
    this.cache.delete(key);
  }

  exists(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  keys(pattern: string): string[] {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  flushPattern(pattern: string): void {
    const keysToDelete = this.keys(pattern);
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        toDelete.push(key);
      }
    }
    
    toDelete.forEach(key => this.cache.delete(key));
    
    // If still too large, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries());
      const toRemove = entries.slice(0, this.maxSize / 4); // Remove 25%
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }
}

// Export singleton instance
export const cache = new SimpleCache();

// Cache key builders
export const CacheKeys = {
  // Polygon API responses
  snapshot: (ticker: string) => `polygon:snapshot:${ticker}`,
  historical: (ticker: string, range: string, from: string, to: string) => 
    `polygon:historical:${ticker}:${range}:${from}:${to}`,
  
  // Leaderboard data
  leaderboard: (type: string = 'global') => `leaderboard:${type}`,
  userRank: (userId: string) => `user:rank:${userId}`,
  
  // Rate limiting
  rateLimit: (identifier: string, endpoint: string) => `ratelimit:${endpoint}:${identifier}`,
  
  // User data
  userProfile: (userId: string) => `user:profile:${userId}`,
  userPortfolio: (userId: string) => `user:portfolio:${userId}`,
  
  // Market data
  marketStatus: () => 'market:status',
  trendingStocks: () => 'market:trending',
};

// Simple in-memory rate limiting
export class RateLimiter {
  private limits = new Map<string, { count: number; resetTime: number }>();

  async checkLimit(
    identifier: string,
    endpoint: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; reset: number }> {
    const key = CacheKeys.rateLimit(identifier, endpoint);
    const now = Date.now();
    
    let limitData = this.limits.get(key);
    
    // Reset if window expired
    if (!limitData || now > limitData.resetTime) {
      limitData = {
        count: 0,
        resetTime: now + (windowSeconds * 1000)
      };
    }
    
    limitData.count++;
    this.limits.set(key, limitData);
    
    return {
      allowed: limitData.count <= limit,
      remaining: Math.max(0, limit - limitData.count),
      reset: limitData.resetTime,
    };
  }

  async resetLimit(identifier: string, endpoint: string): Promise<void> {
    const key = CacheKeys.rateLimit(identifier, endpoint);
    this.limits.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Cache helper functions
export const CacheHelpers = {
  // Memoize function results with TTL
  async memoize<T>(
    key: string,
    fn: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    // Try to get from cache first
    const cached = cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn();
    cache.set(key, result, ttlSeconds);
    return result;
  },

  // Cache with stale-while-revalidate pattern
  async staleWhileRevalidate<T>(
    key: string,
    fn: () => Promise<T>,
    freshTtl: number = 300,
    staleTtl: number = 3600
  ): Promise<T> {
    const cached = cache.get<T>(key);
    const keyFresh = `${key}:fresh`;
    const isFresh = cache.exists(keyFresh);

    if (cached && isFresh) {
      // Return fresh cached data
      return cached;
    }

    if (cached && !isFresh) {
      // Return stale data but revalidate in background
      setImmediate(async () => {
        try {
          const fresh = await fn();
          cache.set(key, fresh, staleTtl);
          cache.set(keyFresh, true, freshTtl);
        } catch (error) {
          console.error('Background revalidation error:', error);
        }
      });
      return cached;
    }

    // No cached data, fetch and cache
    const result = await fn();
    cache.set(key, result, staleTtl);
    cache.set(keyFresh, true, freshTtl);
    return result;
  },

  // Invalidate related cache keys
  async invalidatePattern(pattern: string): Promise<void> {
    cache.flushPattern(pattern);
  },

  // Tag-based cache invalidation
  async taggedCache<T>(
    key: string,
    tags: string[],
    fn: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    const result = await CacheHelpers.memoize(key, fn, ttlSeconds);
    
    // Store tag associations
    for (const tag of tags) {
      const tagKey = `tag:${tag}`;
      const tagged = cache.get<string[]>(tagKey) || [];
      if (!tagged.includes(key)) {
        tagged.push(key);
        cache.set(tagKey, tagged, ttlSeconds);
      }
    }
    
    return result;
  },

  // Invalidate by tags
  async invalidateByTag(tag: string): Promise<void> {
    const tagKey = `tag:${tag}`;
    const keys = cache.get<string[]>(tagKey);
    if (keys) {
      for (const key of keys) {
        cache.del(key);
      }
      cache.del(tagKey);
    }
  },
};

// Export for convenience
export { cache as default };