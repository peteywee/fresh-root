// [P0][API][INFRA] Unified Redis adapter for rate limiting and caching
// Tags: redis, upstash, ioredis, adapter, rate-limiting, production

import { NextRequest, NextResponse } from "next/server";

/**
 * Universal Redis client interface
 * Provides consistent API across Upstash REST and ioredis clients
 */
export interface RedisClient {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
  // Added for idempotency support
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { ex?: number }): Promise<void>;
  del(key: string): Promise<void>;
}

/**
 * In-memory fallback implementation for local development
 * Not suitable for production multi-instance deployments
 */
class InMemoryRedis implements RedisClient {
  private store = new Map<string, { count: number; resetAt: number }>();
  private stringStore = new Map<string, { value: string; expiresAt: number }>();

  async incr(key: string): Promise<number> {
    const now = Date.now();
    const entry = this.store.get(key);
    if (!entry || entry.resetAt < now) {
      const resetAt = now + 60 * 1000; // 60s default window
      this.store.set(key, { count: 1, resetAt });
      return 1;
    }
    entry.count++;
    this.store.set(key, entry);
    return entry.count;
  }

  async expire(key: string, seconds: number): Promise<void> {
    const entry = this.store.get(key);
    if (entry) {
      entry.resetAt = Date.now() + seconds * 1000;
    }
  }

  async ttl(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return -2; // key does not exist (Redis convention)
    const ttl = Math.ceil((entry.resetAt - Date.now()) / 1000);
    return ttl > 0 ? ttl : -2;
  }

  async get(key: string): Promise<string | null> {
    const entry = this.stringStore.get(key);
    if (!entry) return null;
    if (entry.expiresAt > 0 && entry.expiresAt < Date.now()) {
      this.stringStore.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, options?: { ex?: number }): Promise<void> {
    const expiresAt = options?.ex ? Date.now() + options.ex * 1000 : 0;
    this.stringStore.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
    this.stringStore.delete(key);
  }
}

/**
 * Upstash REST client adapter
 * Minimal implementation for Upstash HTTP API
 */
class UpstashClient implements RedisClient {
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

  async get(key: string): Promise<string | null> {
    return await this.exec<string | null>("GET", key);
  }

  async set(key: string, value: string, options?: { ex?: number }): Promise<void> {
    if (options?.ex) {
      await this.exec<string>("SET", key, value, "EX", options.ex);
    } else {
      await this.exec<string>("SET", key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.exec<number>("DEL", key);
  }
}

/**
 * Unified Redis client factory
 * Attempts: Upstash (REST) → ioredis (TCP) → in-memory (fallback)
 */
async function createUnifiedRedisClient(): Promise<RedisClient> {
  // Try Upstash REST first
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      return new UpstashClient(upstashUrl, upstashToken);
    } catch (err) {
      console.warn("Failed to initialize Upstash client:", err);
    }
  }

  // Try ioredis
  if (process.env.REDIS_URL) {
    try {
      // Use dynamic import to avoid build-time static resolution
      // @ts-ignore - optional dependency
      const dynamicImport = new Function("pkg", "return import(pkg)");
      // @ts-ignore
      const ioredisModule = await dynamicImport("ioredis");
      const IORedis = ioredisModule.default || ioredisModule;
      const client = new IORedis(process.env.REDIS_URL);

      return {
        async incr(key: string): Promise<number> {
          return await client.incr(key);
        },
        async expire(key: string, seconds: number): Promise<void> {
          await client.expire(key, seconds);
        },
        async ttl(key: string): Promise<number> {
          return await client.ttl(key);
        },
        async get(key: string): Promise<string | null> {
          return await client.get(key);
        },
        async set(key: string, value: string, options?: { ex?: number }): Promise<void> {
          if (options?.ex) {
            await client.set(key, value, "EX", options.ex);
          } else {
            await client.set(key, value);
          }
        },
        async del(key: string): Promise<void> {
          await client.del(key);
        },
      };
    } catch (err) {
      console.warn("Failed to initialize ioredis client:", err);
    }
  }

  // Fallback to in-memory
  console.warn(
    "Using in-memory Redis fallback. For production, configure UPSTASH_REDIS_REST_URL+TOKEN or REDIS_URL.",
  );
  return new InMemoryRedis();
}

// Lazy-initialized singleton
let redisClient: RedisClient | null = null;
let initPromise: Promise<RedisClient> | null = null;

/**
 * Get the Redis client instance (lazy-initialized singleton)
 * Used by rate limiting and idempotency middleware
 */
export async function getRedisClient(): Promise<RedisClient> {
  if (redisClient) return redisClient;
  if (!initPromise) {
    initPromise = createUnifiedRedisClient();
  }
  redisClient = await initPromise;
  return redisClient;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  max: number;
  windowSeconds: number;
  keyGenerator?: (request: NextRequest) => string;
}

/**
 * Result of a rate limit check
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Default key generator: combines IP and optional user ID
 */
function defaultKeyGenerator(request: NextRequest): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userId = request.headers.get("x-user-id");
  return userId ? `rate:${ip}:${userId}` : `rate:${ip}`;
}

/**
 * Check rate limit for a given key
 * Returns allowed status, remaining count, and reset time
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const redis = await getRedisClient();
  const rateLimitKey = `rl:${key}`;
  const now = Date.now();

  try {
    const count = await redis.incr(rateLimitKey);
    if (count === 1) {
      await redis.expire(rateLimitKey, config.windowSeconds);
    }

    const ttl = await redis.ttl(rateLimitKey);
    const resetAt = now + (ttl > 0 ? ttl * 1000 : config.windowSeconds * 1000);

    return {
      allowed: count <= config.max,
      remaining: Math.max(0, config.max - count),
      resetAt,
    };
  } catch (err) {
    console.error("Rate limit check failed:", err);
    // Fail open on error: allow the request
    return {
      allowed: true,
      remaining: 1,
      resetAt: now + config.windowSeconds * 1000,
    };
  }
}

/**
 * Create a rate limit middleware handler for Next.js API routes
 * Usage: export const GET = createRateLimitMiddleware(config)(actualHandler)
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const keyGen = config.keyGenerator || defaultKeyGenerator;

  return async function (
    request: NextRequest,
    _context: { params?: Record<string, string> },
  ): Promise<NextResponse | null> {
    const key = keyGen(request);
    const result = await checkRateLimit(key, config);

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
            retryAfter,
          },
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(config.max),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
            "Retry-After": String(retryAfter),
          },
        },
      );
    }

    return null; // Allowed, continue to handler
  };
}

// Export client interfaces for advanced usage
export { UpstashClient, InMemoryRedis };
