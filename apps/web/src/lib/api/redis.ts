//[P0][API][INFRA] Shared Redis adapter singleton
// Tags: redis, upstash, ioredis, adapter

type SimpleRedisClient = {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
};

// Try Upstash first, then ioredis, otherwise fall back to in-memory map (development)
/**
 * @fileoverview This file provides a shared Redis adapter that can be used across the application.
 * It automatically selects the appropriate Redis client (Upstash, ioredis, or an in-memory fallback)
 * based on the environment variables. It also exports a factory function for creating rate limiters.
 */
let adapter: SimpleRedisClient;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  // Use Upstash REST client
  // Note: @upstash/redis should be installed in production environments
  // It provides incr/expire/ttl methods compatible with the simple RedisClient interface
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
} else if (process.env.REDIS_URL) {
  // Use ioredis if available
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
} else {
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

/**
 * A factory function that creates a rate limiter.
 *
 * @param {RateLimitConfig} config - The configuration for the rate limiter.
 * @returns {Function} A rate limiting middleware function.
 */
// Factory returning an inline check: await rateLimit(req, ctx) -> NextResponse | null
export function createRateLimiter(config: RateLimitConfig) {
  const adapter = getRedisAdapter();
  if (adapter) {
    const limiter = createRedisRateLimit(adapter, config);
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
