// [P0][SECURITY][RATE_LIMIT] Rate Limit
// Tags: P0, SECURITY, RATE_LIMIT
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * apps/web/src/lib/api/rate-limit.ts
 *
 * Distributed rate limiting helper for Next.js API routes.
 *
 * - In development / test: uses an in-memory map.
 * - In production with REDIS_URL set: uses a Redis-backed limiter that is
 *   safe across multiple instances.
 */

import type { Env } from "@/src/env";
import { env } from "@/src/env";
import Redis from "ioredis";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface RateLimitOptions {
  /**
   * Maximum number of allowed requests per window.
   */
  max: number;

  /**
   * Window size in seconds.
   */
  windowSeconds: number;

  /**
   * Optional prefix to namespace keys (per route, per feature).
   */
  keyPrefix?: string;
}

/**
 * Result returned by a limiter after consuming a token.
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  key: string;
}

/**
 * Abstract limiter interface. Both in-memory and Redis limiters implement this.
 */
export interface RateLimiter {
  consume(key: string, cost?: number): Promise<RateLimitResult>;
}

/* -------------------------------------------------------------------------- */
/* In-memory implementation (dev/test, single-instance only)                  */
/* -------------------------------------------------------------------------- */

interface MemoryBucket {
  count: number;
  resetAt: number; // epoch ms
}

class InMemoryRateLimiter implements RateLimiter {
  private readonly options: RateLimitOptions;
  private readonly buckets = new Map<string, MemoryBucket>();

  constructor(options: RateLimitOptions) {
    this.options = options;
  }

  public async consume(key: string, cost: number = 1): Promise<RateLimitResult> {
    const now = Date.now();
    const windowMs = this.options.windowSeconds * 1000;
    const bucketKey = this.buildKey(key);

    let bucket = this.buckets.get(bucketKey);

    if (!bucket || bucket.resetAt <= now) {
      // New window
      bucket = {
        count: 0,
        resetAt: now + windowMs,
      };
    }

    bucket.count += cost;
    this.buckets.set(bucketKey, bucket);

    const allowed = bucket.count <= this.options.max;
    const remaining = Math.max(this.options.max - bucket.count, 0);

    return {
      allowed,
      remaining,
      resetAt: bucket.resetAt,
      key: bucketKey,
    };
  }

  private buildKey(key: string): string {
    const prefix = this.options.keyPrefix ?? "rate";
    return `${prefix}:${key}`;
  }
}

/* -------------------------------------------------------------------------- */
/* Redis implementation (prod, multi-instance safe)                           */
/* -------------------------------------------------------------------------- */

interface RedisRateLimiterDeps {
  redis: Redis;
  env: Env;
}

class RedisRateLimiter implements RateLimiter {
  private readonly redis: Redis;
  private readonly options: RateLimitOptions;

  constructor(deps: RedisRateLimiterDeps, options: RateLimitOptions) {
    this.redis = deps.redis;
    this.options = options;
  }

  public async consume(key: string, cost: number = 1): Promise<RateLimitResult> {
    const now = Date.now();
    const windowSeconds = this.options.windowSeconds;
    const bucketKey = this.buildKey(key, windowSeconds);

    const count = await this.redis.incrby(bucketKey, cost);

    if (count === cost) {
      // First time this key is seen in this window; set TTL.
      await this.redis.expire(bucketKey, windowSeconds);
    }

    const allowed = count <= this.options.max;
    const remaining = Math.max(this.options.max - count, 0);

    const ttlSeconds = await this.redis.ttl(bucketKey);
    const resetAt = ttlSeconds > 0 ? now + ttlSeconds * 1000 : now + windowSeconds * 1000;

    return {
      allowed,
      remaining,
      resetAt,
      key: bucketKey,
    };
  }

  private buildKey(key: string, windowSeconds: number): string {
    const prefix = this.options.keyPrefix ?? "rate";
    const windowBucket = Math.floor(Date.now() / (windowSeconds * 1000));
    return `${prefix}:${key}:${windowBucket}`;
  }
}

/* -------------------------------------------------------------------------- */
/* Factory / Public API                                                       */
/* -------------------------------------------------------------------------- */

let cachedLimiter: RateLimiter | null = null;

/**
 * Create or reuse the global RateLimiter based on environment.
 *
 * - If REDIS_URL is set and NODE_ENV === "production": use RedisRateLimiter.
 * - Otherwise: use InMemoryRateLimiter.
 */
export function getRateLimiter(
  options: RateLimitOptions = {
    max: 100,
    windowSeconds: 60,
    keyPrefix: "api",
  },
): RateLimiter {
  if (cachedLimiter) {
    return cachedLimiter;
  }

  const isProd = env.NODE_ENV === "production";
  const hasRedis = Boolean(env.REDIS_URL);

  if (isProd && hasRedis) {
    const redis = new Redis(env.REDIS_URL as string, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
    });

    cachedLimiter = new RedisRateLimiter({ redis, env }, options);
  } else {
    cachedLimiter = new InMemoryRateLimiter(options);
  }

  return cachedLimiter;
}

/**
 * Convenience helper to build a consistent rate limit key.
 *
 * You can use a combination of route, IP, user, and org IDs depending on
 * how strict you want rate limiting to be.
 */
export function buildRateLimitKey(params: {
  feature: string;
  route: string;
  ip?: string | null;
  userId?: string | null;
  orgId?: string | null;
}): string {
  const segments = [
    params.feature,
    params.route,
    params.ip ?? "ip:unknown",
    params.userId ? `user:${params.userId}` : "user:anon",
    params.orgId ? `org:${params.orgId}` : "org:unknown",
  ];

  return segments.join("|");
}

/* ============================================================================ */
/* Legacy / Backwards-Compatible Exports                                      */
/* ============================================================================ */

/**
 * Legacy rate limit presets.
 * Use for compatibility with existing code.
 *
 * @deprecated Use getRateLimiter({ max, windowSeconds }) instead for explicit config
 */
export const RateLimits = {
  strict: { max: 5, windowSeconds: 60 },
  api: { max: 100, windowSeconds: 60 },
  generous: { max: 1000, windowSeconds: 60 },
};

/**
 * Legacy checkRateLimit function.
 * @deprecated Use getRateLimiter().consume() instead
 */
export async function checkRateLimit(
  req: any,
  preset: { max: number; windowSeconds: number },
): Promise<RateLimitResult> {
  const limiter = getRateLimiter(preset);
  const ip =
    (req.headers?.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    (req).ip ||
    "unknown";

  const key = buildRateLimitKey({
    feature: "api",
    route: req.method ? `${req.method} ${req.nextUrl?.pathname ?? "/"}` : "unknown",
    ip,
  });

  return limiter.consume(key, 1);
}
