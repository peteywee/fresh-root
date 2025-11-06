//[P1][API][SECURITY] Rate limiting middleware
// Tags: rate-limiting, security, redis, dos-protection

import { NextRequest, NextResponse } from "next/server";

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  max: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Optional custom key generator */
  keyGenerator?: (request: NextRequest) => string;
}

/**
 * In-memory rate limiter (for development/single-instance)
 * For production, use Redis-based rate limiting
 */
class InMemoryRateLimiter {
  private requests: Map<string, { count: number; resetAt: number }> = new Map();

  /**
   * Check if request should be rate limited
   */
  async checkLimit(
    key: string,
    max: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now();
    const entry = this.requests.get(key);

    // Clean up expired entries periodically
    if (this.requests.size > 10000) {
      this.cleanup(now);
    }

    if (!entry || entry.resetAt < now) {
      // New window
      const resetAt = now + windowSeconds * 1000;
      this.requests.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: max - 1, resetAt };
    }

    if (entry.count >= max) {
      // Rate limited
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    // Increment count
    entry.count++;
    this.requests.set(key, entry);
    return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(now: number) {
    for (const [key, entry] of this.requests.entries()) {
      if (entry.resetAt < now) {
        this.requests.delete(key);
      }
    }
  }
}

// Global rate limiter instance
const rateLimiter = new InMemoryRateLimiter();

/**
 * Default key generator: IP address + user ID (if authenticated)
 */
function defaultKeyGenerator(request: NextRequest): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userId = request.headers.get("x-user-id");
  return userId ? `${ip}:${userId}` : ip;
}

/**
 * Rate limiting middleware factory
 * @param config Rate limit configuration
 * @returns Middleware function
 */
export function rateLimit(config: RateLimitConfig) {
  const { max, windowSeconds, keyGenerator = defaultKeyGenerator } = config;

  return function (
    handler: (
      request: NextRequest,
      context: { params: Record<string, string> },
    ) => Promise<NextResponse>,
  ) {
    return async (
      request: NextRequest,
      context: { params: Record<string, string> },
    ): Promise<NextResponse> => {
      const key = keyGenerator(request);

      const { allowed, remaining, resetAt } = await rateLimiter.checkLimit(key, max, windowSeconds);

      if (!allowed) {
        const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
        return NextResponse.json(
          {
            error: "Too Many Requests - Rate limit exceeded",
            retryAfter,
            limit: max,
            window: `${windowSeconds}s`,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(retryAfter),
              "X-RateLimit-Limit": String(max),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(Math.floor(resetAt / 1000)),
            },
          },
        );
      }

      // Add rate limit headers to successful responses
      const response = await handler(request, context);

      response.headers.set("X-RateLimit-Limit", String(max));
      response.headers.set("X-RateLimit-Remaining", String(remaining));
      response.headers.set("X-RateLimit-Reset", String(Math.floor(resetAt / 1000)));

      return response;
    };
  };
}

/**
 * Preset rate limits for common use cases
 */
export const RateLimits = {
  /** Strict: 10 requests per minute - for sensitive operations */
  STRICT: { max: 10, windowSeconds: 60 },

  /** Standard: 100 requests per minute - for normal API usage */
  STANDARD: { max: 100, windowSeconds: 60 },

  /** Generous: 1000 requests per minute - for high-volume reads */
  GENEROUS: { max: 1000, windowSeconds: 60 },

  /** Auth: 5 requests per minute - for auth endpoints */
  AUTH: { max: 5, windowSeconds: 60 },

  /** Write: 30 requests per minute - for create/update/delete */
  WRITE: { max: 30, windowSeconds: 60 },
};

/**
 * Redis-based rate limiter (for production multi-instance deployments)
 * To use: Set REDIS_URL environment variable
 */
export class RedisRateLimiter {
  private redisClient: unknown = null;

  constructor() {
    // Initialize Redis client if URL is provided
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      // TODO: Initialize Redis client
      // Example: this.redisClient = createClient({ url: redisUrl });
      console.warn("Redis rate limiting not yet implemented");
    }
  }

  async checkLimit(
    key: string,
    max: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    if (!this.redisClient) {
      // Fall back to in-memory
      return rateLimiter.checkLimit(key, max, windowSeconds);
    }

    // TODO: Implement Redis-based rate limiting using sliding window
    // Example implementation:
    // 1. Use ZADD to add timestamp to sorted set
    // 2. Use ZREMRANGEBYSCORE to remove old entries
    // 3. Use ZCARD to count entries in window
    // 4. Set expiry on the key

    throw new Error("Redis rate limiting not yet implemented");
  }
}
