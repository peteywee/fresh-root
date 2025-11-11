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

// Try Upstash first, then ioredis, otherwise fall back to in-memory map (development)
let adapter: SimpleRedisClient | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  // Use Upstash REST client
  // Note: @upstash/redis should be installed in production environments
  // It provides incr/expire/ttl methods compatible with the simple RedisClient interface
  try {
    const { Redis } = require("@upstash/redis");
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
  } catch {
    // Fall through to next condition if package not found
  }
} 

if (!adapter && process.env.REDIS_URL) {
  // Use ioredis if available
  try {
    const IORedis = require("ioredis");
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
  } catch {
    // Fall through to in-memory fallback if package not found
  }
}

if (!adapter) {
  // In-memory fallback for local development. Not suitable for production.
  const map = new Map<string, { count: number; resetAt: number }>();
  adapter = {
    async incr(key: string) {
      const now = Date.now();
      const entry = map.get(key);
      if (!entry || entry.resetAt < now) {
        const resetAt = now + 60 * 1000;
        map.set(key, { count: 1, resetAt });
        return 1;
      }
      entry.count++;
      map.set(key, entry);
      return entry.count;
    },
    async expire(key: string, seconds: number) {
      const entry = map.get(key);
      if (entry) entry.resetAt = Date.now() + seconds * 1000;
    },
    async ttl(key: string) {
      const entry = map.get(key);
      if (!entry) return -2; // key does not exist
      const ttl = Math.ceil((entry.resetAt - Date.now()) / 1000);
      return ttl > 0 ? ttl : -2;
    },
  };
  console.warn(
    "No Redis configuration found — using in-memory fallback. Configure UPSTASH_REDIS_REST_URL+TOKEN or REDIS_URL for production.",
  );
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
  // Fallback to in-memory per-instance limiter
  return async function (
    request: NextRequest,
    _context: { params: Record<string, string> },
  ): Promise<NextResponse | null> {
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
