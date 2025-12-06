// [P0][SECURITY][RATE_LIMIT] Rate Limit
// Tags: P0, SECURITY, RATE_LIMIT
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * [P1][SECURITY][API] Rate limiting helper for Next.js routes.
 *
 * This module is intentionally simple and test-friendly:
 * - Uses an in-memory store by default (good enough for unit/integration tests).
 * - Exposes a `rateLimit` higher-order function that wraps route handlers.
 * - Exposes `RateLimits` presets that tests assert against.
 *
 * In production you can later swap the backend to Redis behind the same interface
 * without changing the public API used by routes and tests.
 */

/* -------------------------------------------------------------------------- */
/* Imports                                                                     */
/* -------------------------------------------------------------------------- */

import { NextResponse, type NextRequest } from "next/server";
import type { Redis } from "ioredis";

/* -------------------------------------------------------------------------- */
/* Public types                                                                */
/* -------------------------------------------------------------------------- */

export interface RateLimitOptions {
  /** Maximum number of requests allowed per window for a given key. */
  max: number;
  /** Window duration in seconds. */
  windowSeconds: number;
  /**
   * Optional key generator – allows callers/tests to override the default
   * IP + path (+ user) based key derivation.
   */
  keyGenerator?: (request: NextRequest | Request | undefined) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  key: string;
}

/* -------------------------------------------------------------------------- */
/* Presets (these are asserted in tests)                                      */
/* -------------------------------------------------------------------------- */

export const RateLimits = {
  STRICT: { max: 10, windowSeconds: 60 },
  STANDARD: { max: 100, windowSeconds: 60 },
  AUTH: { max: 5, windowSeconds: 60 },
  WRITE: { max: 30, windowSeconds: 60 },
} as const;

/* -------------------------------------------------------------------------- */
/* Default key generator                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Defensive key generator:
 * - Works with NextRequest or plain Request objects (like in Vitest).
 * - Uses path + IP, and includes user ID if present on headers.
 */
export function defaultKeyGenerator(request: any): string {
  if (!request) {
    // Fallback for badly stubbed tests – still deterministic
    return "global:/unknown:ip:unknown";
  }

  // Normalise headers
  const headers: Headers =
    request.headers instanceof Headers
      ? request.headers
      : new Headers(request.headers ?? undefined);

  const ip = headers.get("x-forwarded-for") ?? headers.get("x-real-ip") ?? "unknown-ip";

  const userId = headers.get("x-user-id") ?? undefined;

  // Path handling for NextRequest vs plain Request
  let pathname = "/unknown";
  if (request.nextUrl?.pathname) {
    pathname = request.nextUrl.pathname;
  } else if (typeof request.url === "string") {
    try {
      const url = new URL(request.url);
      pathname = url.pathname;
    } catch {
      // ignore – keep default
    }
  }

  const userSuffix = userId ? `:user:${userId}` : "";
  return `${pathname}:ip:${ip}${userSuffix}`;
}

/* -------------------------------------------------------------------------- */
/* In-memory backend                                                           */
/* -------------------------------------------------------------------------- */

type Bucket = {
  count: number;
  resetAt: number;
};

class InMemoryRateLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(private readonly now: () => number = () => Date.now()) {}

  async checkLimit(
    request: NextRequest | Request | undefined,
    options: RateLimitOptions,
  ): Promise<RateLimitResult> {
    const keyGen = options.keyGenerator ?? defaultKeyGenerator;
    const key = keyGen(request);
    const now = this.now();
    const windowMs = options.windowSeconds * 1000;

    const existing = this.buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      // Start a new window
      const resetAt = now + windowMs;
      this.buckets.set(key, { count: 1, resetAt });
      return {
        allowed: true,
        remaining: options.max - 1,
        resetAt,
        key,
      };
    }

    if (existing.count >= options.max) {
      // Over limit
      return {
        allowed: false,
        remaining: 0,
        resetAt: existing.resetAt,
        key,
      };
    }

    // Within limit
    existing.count += 1;
    this.buckets.set(key, existing);

    return {
      allowed: true,
      remaining: Math.max(options.max - existing.count, 0),
      resetAt: existing.resetAt,
      key,
    };
  }

  /** For tests if you ever need to reset the internal state. */
  clear() {
    this.buckets.clear();
  }
}

/* -------------------------------------------------------------------------- */
/* Redis backend                                                               */
/* -------------------------------------------------------------------------- */

class RedisRateLimiter {
  constructor(private readonly redis: Redis) {}

  async checkLimit(
    request: NextRequest | Request | undefined,
    options: RateLimitOptions,
  ): Promise<RateLimitResult> {
    const keyGen = options.keyGenerator ?? defaultKeyGenerator;
    const key = `rate_limit:${keyGen(request)}`;
    const now = Date.now();
    const windowMs = options.windowSeconds * 1000;
    const resetAt = Math.ceil((now + windowMs) / 1000) * 1000; // Round to next second

    try {
      // Use Redis pipeline for atomicity
      const pipeline = this.redis.pipeline();
      pipeline.incr(key);
      pipeline.expire(key, options.windowSeconds);
      const results = await pipeline.exec();

      if (!results || results.some(([err]) => err)) {
        throw new Error("Redis pipeline failed");
      }

      const count = results[0][1] as number;

      if (count > options.max) {
        return {
          allowed: false,
          remaining: 0,
          resetAt,
          key,
        };
      }

      return {
        allowed: true,
        remaining: Math.max(options.max - count, 0),
        resetAt,
        key,
      };
    } catch (error) {
      // Log error but don't fail the request
      console.error("Redis rate limiting failed:", error);
      // Fallback to allowing the request (fail open for availability)
      return {
        allowed: true,
        remaining: options.max - 1,
        resetAt,
        key,
      };
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Singleton backend                                                           */
/* -------------------------------------------------------------------------- */

let globalLimiter: InMemoryRateLimiter | RedisRateLimiter | null = null;

/**
 * Initialize the rate limiter backend.
 * Uses Redis if REDIS_URL is provided, falls back to in-memory otherwise.
 */
function initializeRateLimiter(): InMemoryRateLimiter | RedisRateLimiter {
  if (globalLimiter) {
    return globalLimiter;
  }

  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
  
  if (redisUrl && process.env.NODE_ENV === "production") {
    try {
      // Dynamic import to avoid bundling Redis in environments that don't need it
      const Redis = require("ioredis").default;
      const redis = new Redis(redisUrl, {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 1,
      });
      
      globalLimiter = new RedisRateLimiter(redis);
      console.log("[rate-limit] Initialized Redis rate limiter");
      return globalLimiter;
    } catch (error) {
      console.warn("[rate-limit] Failed to initialize Redis, falling back to in-memory:", error);
    }
  }

  globalLimiter = new InMemoryRateLimiter();
  console.log("[rate-limit] Initialized in-memory rate limiter");
  return globalLimiter;
}

/**
 * Exposed only for advanced tests / diagnostics. Most tests should go through
 * `rateLimit` HOF instead of calling `checkLimit` directly.
 */
export async function checkRateLimit(
  request: NextRequest | Request | undefined,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const limiter = initializeRateLimiter();
  return limiter.checkLimit(request, options);
}

/**
 * For testing: reset the global limiter to force reinitialization.
 * Only use this in test environments.
 */
export function resetRateLimiter(): void {
  if (process.env.NODE_ENV !== "test") {
    console.warn("resetRateLimiter() should only be used in tests");
    return;
  }
  globalLimiter = null;
}

/* -------------------------------------------------------------------------- */
/* Public HOF                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Wrap a Next.js route handler with rate limiting.
 *
 * Usage pattern that your tests already assume:
 *
 * ```ts
 * const handler = rateLimit({ max: 3, windowSeconds: 60 })(async (req) => {
 *   return NextResponse.json({ success: true });
 * });
 * ```
 */
export function rateLimit<
  THandler extends (request: NextRequest, context?: any) => Promise<NextResponse> | NextResponse,
>(options: RateLimitOptions) {
  return function withRateLimit(handler: THandler): THandler {
    return (async (request: NextRequest, context?: any) => {
      const result = await checkRateLimit(request, options);

      const rateHeaders: Record<string, string> = {
        "X-RateLimit-Key": result.key,
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.resetAt),
      };

      if (!result.allowed) {
        return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
          status: 429,
          headers: rateHeaders,
        });
      }

      const response = (await handler(request, context)) as NextResponse;

      for (const [key, value] of Object.entries(rateHeaders)) {
        response.headers.set(key, value);
      }

      return response;
    }) as unknown as THandler;
  };
}
