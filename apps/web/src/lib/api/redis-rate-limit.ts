//[P0][API][SECURITY] Redis-based rate limiting for production
// Tags: rate-limiting, security, redis, production, horizontal-scaling

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
 * Redis client interface (abstract to support different Redis libraries)
 */
export interface RedisClient {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
}

/**
 * Redis-based rate limiter for production use
 * Supports horizontal scaling and distributed rate limiting
 */
export class RedisRateLimiter {
  constructor(private redis: RedisClient) {}

  /**
   * Check if request should be rate limited
   */
  async checkLimit(
    key: string,
    max: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now();
    const rateLimitKey = `rate_limit:${key}`;

    try {
      // Increment the counter
      const count = await this.redis.incr(rateLimitKey);

      // Set expiry on first request in window
      if (count === 1) {
        await this.redis.expire(rateLimitKey, windowSeconds);
      }

      // Get TTL to calculate resetAt
      const ttl = await this.redis.ttl(rateLimitKey);
      const resetAt = now + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000);

      if (count > max) {
        return { allowed: false, remaining: 0, resetAt };
      }

      return { allowed: true, remaining: max - count, resetAt };
    } catch (error) {
      // If Redis fails, allow the request but log the error
      console.error("Redis rate limiter error:", error);
      return { allowed: true, remaining: max, resetAt: now + windowSeconds * 1000 };
    }
  }
}

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
 * Factory function to create Redis-based rate limiting middleware
 * @param redis Redis client instance
 * @param config Rate limit configuration
 * @returns Middleware function
 */
export function createRedisRateLimit(redis: RedisClient, config: RateLimitConfig) {
  const { max, windowSeconds, keyGenerator = defaultKeyGenerator } = config;
  const limiter = new RedisRateLimiter(redis);

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
      const result = await limiter.checkLimit(key, max, windowSeconds);

      if (!result.allowed) {
        const resetDate = new Date(result.resetAt).toISOString();
        return NextResponse.json(
          {
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message: "Too many requests. Please try again later.",
              details: {
                retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
                resetAt: resetDate,
              },
            },
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": max.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": resetDate,
              "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
            },
          },
        );
      }

      const response = await handler(request, context);

      // Add rate limit headers to successful responses
      response.headers.set("X-RateLimit-Limit", max.toString());
      response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
      response.headers.set("X-RateLimit-Reset", new Date(result.resetAt).toISOString());

      return response;
    };
  };
}

/**
 * Upstash Redis adapter (recommended for serverless)
 * Usage:
 *   import { Redis } from '@upstash/redis';
 *   const redis = new UpstashRedisAdapter(
 *     new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
 *   );
 */
export class UpstashRedisAdapter implements RedisClient {
  constructor(
    private client: {
      incr: (key: string) => Promise<number>;
      expire: (key: string, seconds: number) => Promise<unknown>;
      ttl: (key: string) => Promise<number>;
    },
  ) {}

  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }
}

/**
 * ioredis adapter (for self-hosted Redis)
 * Usage:
 *   import Redis from 'ioredis';
 *   const redis = new IORedisAdapter(new Redis(process.env.REDIS_URL));
 */
export class IORedisAdapter implements RedisClient {
  constructor(
    private client: {
      incr: (key: string) => Promise<number>;
      expire: (key: string, seconds: number) => Promise<unknown>;
      ttl: (key: string) => Promise<number>;
    },
  ) {}

  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }
}
