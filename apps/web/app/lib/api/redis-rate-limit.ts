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

export class RedisRateLimiter {
  constructor(private redis: RedisClient) {}

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

function defaultKeyGenerator(request: NextRequest): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userId = request.headers.get("x-user-id");
  return userId ? `${ip}:${userId}` : ip;
}

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
