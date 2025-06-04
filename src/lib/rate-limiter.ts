interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  requests: number; // Max requests per window
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = { interval: 60000, requests: 10 }) {
    this.config = config;

    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  check(identifier: string): {
    success: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      const resetTime = now + this.config.interval;
      this.store.set(identifier, { count: 1, resetTime });
      return {
        success: true,
        limit: this.config.requests,
        remaining: this.config.requests - 1,
        resetTime,
      };
    }

    if (entry.count >= this.config.requests) {
      return {
        success: false,
        limit: this.config.requests,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    entry.count++;
    return {
      success: true,
      limit: this.config.requests,
      remaining: this.config.requests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  reset(identifier: string): void {
    this.store.delete(identifier);
  }
}

// Export different rate limiters for different use cases
export const authRateLimit = new RateLimiter({ interval: 900000, requests: 5 }); // 5 attempts per 15 minutes
export const apiRateLimit = new RateLimiter({ interval: 60000, requests: 100 }); // 100 requests per minute
export const passwordResetRateLimit = new RateLimiter({ interval: 3600000, requests: 3 }); // 3 attempts per hour

export const rateLimit = (config?: RateLimitConfig) => new RateLimiter(config);
