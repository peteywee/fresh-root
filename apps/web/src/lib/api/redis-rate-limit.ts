//[P0][API][SECURITY] Redis-based rate limiting for production
// Tags: rate-limiting, security, redis, production, horizontal-scaling

import { NextRequest, NextResponse } from "next/server";

export interface RateLimitConfig {
  max: number;
  windowSeconds: number;
  keyGenerator?: (request: NextRequest) => string;
}

export interface RedisClient {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
}

/**
 * A rate limiter that uses a Redis client to store request counts.
 * @param {RedisClient} redis - An object that implements the RedisClient interface.
 */
export class RedisRateLimiter {
  constructor(private redis: RedisClient) {}

  /**
   * Checks if a request is allowed under the rate limit.
   *
   * @param {string} key - The unique key for the request.
   * @param {number} max - The maximum number of requests.
   * @param {number} windowSeconds - The time window in seconds.
   * @returns {Promise<{ allowed: boolean; remaining: number; resetAt: number }>} An object indicating if the request is allowed, the remaining requests, and when the limit resets.
   */
  async checkLimit(
    key: string,
    max: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now();
    const rateLimitKey = `rate_limit:${key}`;
    try {
      const count = await this.redis.incr(rateLimitKey);
      if (count === 1) {
        await this.redis.expire(rateLimitKey, windowSeconds);
      }
      const ttl = await this.redis.ttl(rateLimitKey);
      const resetAt = now + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000);
      if (count > max) {
        return { allowed: false, remaining: 0, resetAt };
      }
      return { allowed: true, remaining: max - count, resetAt };
    } catch {
      // Fail closed: block request if Redis is down
      return { allowed: false, remaining: 0, resetAt: now + windowSeconds * 1000 };
    }
  }
}

/**
 * The default key generator for rate limiting, based on the request's IP address and user ID.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @returns {string} The generated key.
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
 * Creates a Redis-based rate limiting middleware for Next.js API routes.
 *
 * @param {RedisClient} redis - The Redis client to use for rate limiting.
 * @param {RateLimitConfig} config - The rate limit configuration.
 * @returns {Function} A middleware function that can be used in Next.js API routes.
 */
export function createRedisRateLimit(redis: RedisClient, config: RateLimitConfig) {
  const { max, windowSeconds, keyGenerator = defaultKeyGenerator } = config;
  const limiter = new RedisRateLimiter(redis);
  return async function (
    request: NextRequest,
    _context: { params: Record<string, string> },
  ): Promise<NextResponse | null> {
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
    return null;
  };
}

/**
 * An adapter for the Upstash Redis client to conform to the RedisClient interface.
 * @param {object} client - The Upstash Redis client.
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
