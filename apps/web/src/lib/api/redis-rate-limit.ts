//[P0][API][SECURITY] Redis-based rate limiting for production
// Tags: rate-limiting, security, redis, production, horizontal-scaling

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export interface RateLimitConfig {
  max: number;
  windowSeconds: number;
  keyGenerator?: (request: NextRequest) => string;
  // When Redis is unavailable, should we fail open (allow requests) or fail closed (block)?
  // Default: failOpen=true to prioritize availability.
  failOpen?: boolean;
}

export interface RedisClient {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
}

export class RedisRateLimiter {
  constructor(private redis: RedisClient, private failOpen = true) {}

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
      // If Redis is down, either fail-open (allow) or fail-closed (block) depending on configuration.
      if (this.failOpen) {
        // allow through but record a large remaining value and short reset
        return { allowed: true, remaining: Number.MAX_SAFE_INTEGER, resetAt: now + windowSeconds * 1000 };
      }
      return { allowed: false, remaining: 0, resetAt: now + windowSeconds * 1000 };
    }
  }
}

function defaultKeyGenerator(request: NextRequest): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown";
  const rawUser = request.headers.get("x-user-id") ?? request.headers.get("authorization");
  const userId = rawUser ? hashKeyPart(rawUser) : undefined;
  return userId ? `${ip}:user:${userId}` : ip;
}

function hashKeyPart(s: string) {
  try {
    return crypto.createHash("sha256").update(s).digest("hex").slice(0, 8);
  } catch {
    return s.slice(-8);
  }
}

export function createRedisRateLimit(redis: RedisClient, config: RateLimitConfig) {
  const { max, windowSeconds, keyGenerator = defaultKeyGenerator } = config;
  const limiter = new RedisRateLimiter(redis, config.failOpen !== undefined ? Boolean(config.failOpen) : true);
  return async function (
    request: NextRequest,
    _context: { params: Record<string, string> },
  ): Promise<NextResponse | null> {
    const key = keyGenerator(request);
    const result = await limiter.checkLimit(key, max, windowSeconds);
    if (!result.allowed) {
      const resetSeconds = Math.floor(result.resetAt / 1000);
      const retryAfter = Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1000));
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
            details: {
              retryAfter,
              resetAt: resetSeconds,
            },
          },
        },
        {
          status: 429,
          headers: {
            "x-ratelimit-limit": max.toString(),
            "x-ratelimit-remaining": "0",
            "x-ratelimit-reset": String(resetSeconds),
            "retry-after": String(retryAfter),
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
