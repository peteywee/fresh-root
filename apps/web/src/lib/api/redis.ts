//[P0][API][INFRA] Shared Redis adapter singleton
// Tags: redis, upstash, ioredis, adapter
/**
 * @fileoverview
 * Provides a singleton Redis adapter for rate limiting and caching.
 * Attempts Upstash REST client first, falls back to ioredis or in-memory storage.
 */

type SimpleRedisClient = {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
};

// In-memory fallback for local development and builds. Not suitable for production.
const memoryMap = new Map<string, { count: number; resetAt: number }>();
const memoryAdapter: SimpleRedisClient = {
  async incr(key: string) {
    const now = Date.now();
    const entry = memoryMap.get(key);
    if (!entry || entry.resetAt < now) {
      const resetAt = now + 60 * 1000;
      memoryMap.set(key, { count: 1, resetAt });
      return 1;
    }
    entry.count++;
    memoryMap.set(key, entry);
    return entry.count;
  },
  async expire(key: string, seconds: number) {
    const entry = memoryMap.get(key);
    if (entry) entry.resetAt = Date.now() + seconds * 1000;
  },
  async ttl(key: string) {
    const entry = memoryMap.get(key);
    if (!entry) return -2; // key does not exist
    const ttl = Math.ceil((entry.resetAt - Date.now()) / 1000);
    return ttl > 0 ? ttl : -2;
  },
};

// Use in-memory adapter by default; will be replaced at runtime if Redis is available
let adapter: SimpleRedisClient = memoryAdapter;

// Initialize Redis adapter at runtime (not at build time)
// This avoids static module resolution issues during Next.js builds
async function initializeRedisAdapter() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      // Dynamic import to avoid build-time static resolution. Use an indirect
      // dynamic import (via Function) so Turbopack/Next doesn't statically
      // analyze the literal package name and fail the build when package is
      // absent in the project graph.

      // @ts-ignore - optional dependency
      const dynamicImport = new Function("pkg", "return import(pkg)");
      // @ts-ignore
      const upstashModule = await dynamicImport("@upstash/redis");
      const { Redis } = upstashModule;
      const client = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      adapter = {
        async incr(key: string) {
          const res = await client.incr(key);
          return typeof res === "number" ? res : Number(res);
        },
        async expire(key: string, seconds: number) {
          await client.expire(key, seconds);
        },
        async ttl(key: string) {
          const res = await client.ttl(key);
          return typeof res === "number" ? res : Number(res);
        },
      };
      return;
    } catch {
      // Fall through to next option if package not found
    }
  }

  if (process.env.REDIS_URL) {
    try {
      // Dynamic import via Function to avoid static analysis by Turbopack

      // @ts-ignore - optional dependency
      const dynamicImport = new Function("pkg", "return import(pkg)");
      // @ts-ignore
      const ioredisModule = await dynamicImport("ioredis");
      const IORedis = ioredisModule.default || ioredisModule;
      const client = new IORedis(process.env.REDIS_URL);
      adapter = {
        async incr(key: string) {
          return await client.incr(key);
        },
        async expire(key: string, seconds: number) {
          await client.expire(key, seconds);
        },
        async ttl(key: string) {
          return await client.ttl(key);
        },
      };
      return;
    } catch {
      // Fall through to in-memory fallback if package not found
    }
  }

  // Using in-memory fallback
  console.warn(
    "No Redis configuration found — using in-memory fallback. Configure UPSTASH_REDIS_REST_URL+TOKEN or REDIS_URL for production.",
  );
}

// Initialize on first import (only in Node.js runtime, not at build time)
if (typeof window === "undefined" && process.env.NODE_ENV !== "development") {
  initializeRedisAdapter().catch((err) => {
    console.error("Failed to initialize Redis adapter:", err);
  });
}

export default adapter;
//[P0][API][SECURITY] Shared Redis client and rate limiter factory
// Tags: redis, rate-limiting, upstash, production, singleton

import { NextRequest, NextResponse } from "next/server";

import { UpstashRedisAdapter, type RedisClient, createRedisRateLimit } from "./redis-rate-limit";

// Minimal Upstash REST client implementing only incr/expire/ttl
class UpstashRestClient implements RedisClient {
  constructor(
    private url: string,
    private token: string,
  ) {}

  private async exec<T = unknown>(command: string, ...args: (string | number)[]): Promise<T> {
    const res = await fetch(this.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([command, ...args]),
    });
    if (!res.ok) {
      throw new Error(`Upstash request failed: ${res.status}`);
    }
    const json = (await res.json()) as { result: T };
    return json.result;
  }

  async incr(key: string): Promise<number> {
    return await this.exec<number>("INCR", key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.exec<number>("EXPIRE", key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return await this.exec<number>("TTL", key);
  }
}

// Singleton adapter (Upstash if configured)
let singletonAdapter: RedisClient | null = null;
function getRedisAdapter(): RedisClient | null {
  if (singletonAdapter) return singletonAdapter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    const client = new UpstashRestClient(url, token);
    singletonAdapter = new UpstashRedisAdapter(client);
  } else {
    singletonAdapter = null;
  }
  return singletonAdapter;
}

export type RateLimitConfig = {
  max: number;
  windowSeconds: number;
};

// In-memory fallback limiter (scoped per process)
class InMemoryLimiter {
  private requests = new Map<string, { count: number; resetAt: number }>();

  async check(key: string, max: number, windowSeconds: number) {
    const now = Date.now();
    const entry = this.requests.get(key);
    if (!entry || entry.resetAt < now) {
      const resetAt = now + windowSeconds * 1000;
      this.requests.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: max - 1, resetAt };
    }
    if (entry.count >= max) return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    entry.count++;
    return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
  }
}

const localLimiter = new InMemoryLimiter();

function defaultKey(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userId = request.headers.get("x-user-id");
  return userId ? `${ip}:${userId}` : ip;
}

// Factory returning an inline check: await rateLimit(req, ctx) -> NextResponse | null
export function createRateLimiter(config: RateLimitConfig) {
  // Use the module-scoped adapter singleton (handles Upstash, ioredis, or in-memory fallback)
  const redisAdapter = singletonAdapter;
  if (redisAdapter) {
    const limiter = createRedisRateLimit(redisAdapter, config);
    return limiter; // (req, ctx) => Promise<NextResponse|null>
  }
  // Fallback to in-memory per-instance limiter. Accepts ctx.params as Promise|Record
  return async function (
    request: NextRequest,
    _context: { params: Record<string, string> | Promise<Record<string, string>> },
  ): Promise<NextResponse | null> {
    const resolvedParams = await Promise.resolve(_context.params);
    // resolvedParams currently unused in the in-memory fallback, but we await it
    // to ensure the handler matches Next.js 14+/16+ signatures and avoid type errors.
    void resolvedParams;

    const { max, windowSeconds } = config;
    const key = defaultKey(request);
    const result = await localLimiter.check(key, max, windowSeconds);
    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(max),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
          },
        },
      );
    }
    return null;
  };
}
