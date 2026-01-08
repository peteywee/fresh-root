# TODO-001: Redis Rate Limiting + Idempotency Implementation Plan
**Priority:** ✅ COMPLETE **Estimated Effort:** 8-12 hours → **Actual: ~3 hours** **Dependencies:**
Upstash Redis account or self-hosted Redis instance **Completed:** December 20, 2025 **Commit:**
`f973a41`

---

## Executive Summary
\~~The current rate limiter uses in-memory storage, which breaks in multi-instance deployments (each
instance has its own counter).~~ **RESOLVED:** Redis-backed rate limiting and idempotency storage
implemented using Upstash Redis (serverless, Edge-compatible).

---

## Current State Analysis
### Rate Limiter Location
```text
packages/api-framework/src/rate-limit.ts
```

### Current Implementation Issues
1. **In-memory Map** — `rateLimitStore: Map<string, { count, resetTime }>`
2. **No TTL cleanup** — Memory leaks on long-running instances
3. **No distributed coordination** — Each instance counts independently
4. **Idempotency placeholder** — `getIdempotentResponse()` returns `null` (no-op)

### Affected Files
| File                                        | Issue                              |
| ------------------------------------------- | ---------------------------------- |
| `packages/api-framework/src/rate-limit.ts`  | In-memory rate limit store         |
| `packages/api-framework/src/idempotency.ts` | Stub implementation                |
| `packages/env/src/server.ts`                | Missing `UPSTASH_REDIS_*` env vars |
| `apps/web/app/api/**/route.ts`              | All rate-limited endpoints         |

---

## Architecture Design
### Option A: Upstash Redis (Recommended)
- **Pros:** Serverless, Edge-compatible, pay-per-request, global replication
- **Cons:** External dependency, costs at scale
- **Latency:** ~1-5ms per operation

### Option B: Redis Cluster (Self-Hosted)
- **Pros:** Full control, no per-request costs
- **Cons:** Ops overhead, not Edge-compatible without proxy
- **Latency:** ~1-2ms (same region)

## ### Decision: **Option A (Upstash)** for initial rollout

## Implementation Steps
### Phase 1: Environment Setup (1 hour)
#### 1.1 Add Upstash credentials to env schema
```typescript
// packages/env/src/server.ts
export const ServerEnvSchema = z.object({
  // ... existing fields

  // Redis (optional in dev, required in prod multi-instance)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  // Feature flag for gradual rollout
  USE_REDIS_RATE_LIMIT: z.enum(["true", "false"]).default("false"),
});
```

#### 1.2 Add to `.env.example`
```bash
# Redis Rate Limiting (required for multi-instance production)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
USE_REDIS_RATE_LIMIT=false
```

#### 1.3 Install Upstash SDK
```bash
pnpm add @upstash/redis --filter=@fresh-schedules/api-framework
```

---

### Phase 2: Redis Client Singleton (1 hour)
#### 2.1 Create Redis client factory
```typescript
// packages/api-framework/src/redis-client.ts
import { Redis } from "@upstash/redis";
import { loadServerEnv } from "@fresh-schedules/env/server";

let redisInstance: Redis | null = null;

export function getRedisClient(): Redis | null {
  const env = loadServerEnv();

  if (env.USE_REDIS_RATE_LIMIT !== "true") {
    return null; // Fall back to in-memory
  }

  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("[Redis] USE_REDIS_RATE_LIMIT=true but credentials missing");
    return null;
  }

  if (!redisInstance) {
    redisInstance = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redisInstance;
}

export function isRedisEnabled(): boolean {
  return getRedisClient() !== null;
}
```

---

### Phase 3: Rate Limiter Migration (3 hours)
#### 3.1 Refactor rate limiter with Redis backend
```typescript
// packages/api-framework/src/rate-limit.ts

import { getRedisClient } from "./redis-client";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Fallback in-memory store (for dev/tests)
const memoryStore = new Map<string, RateLimitEntry>();

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const redis = getRedisClient();

  if (redis) {
    return checkRateLimitRedis(redis, key, maxRequests, windowMs);
  }

  return checkRateLimitMemory(key, maxRequests, windowMs);
}

async function checkRateLimitRedis(
  redis: Redis,
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const windowKey = `ratelimit:${key}:${Math.floor(now / windowMs)}`;

  // Atomic increment with TTL
  const pipeline = redis.pipeline();
  pipeline.incr(windowKey);
  pipeline.pttl(windowKey);

  const [[count], [ttl]] = await pipeline.exec();

  // Set TTL on first request in window
  if (ttl === -1) {
    await redis.pexpire(windowKey, windowMs);
  }

  const remaining = Math.max(0, maxRequests - (count as number));
  const resetAt = now + (ttl > 0 ? ttl : windowMs);

  return {
    allowed: (count as number) <= maxRequests,
    remaining,
    resetAt,
  };
}

function checkRateLimitMemory(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetTime) {
    memoryStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);

  return {
    allowed: entry.count <= maxRequests,
    remaining,
    resetAt: entry.resetTime,
  };
}
```

#### 3.2 Update rate limit middleware to be async
```typescript
// packages/api-framework/src/middleware/rate-limit.ts

export function withRateLimit(config: RateLimitConfig) {
  return async (request: NextRequest, context: RequestContext) => {
    const key =
      config.keyGenerator?.(request, context) ??
      buildRateLimitKey({ userId: context.auth?.userId, ip: request.ip });

    const result = await checkRateLimit(key, config.maxRequests, config.windowMs);

    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Rate limit exceeded", retryAfter: result.resetAt }),
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(config.maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(result.resetAt),
            "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          },
        },
      );
    }

    // Continue to handler, attach rate limit headers to response
    return null; // Proceed
  };
}
```

---

### Phase 4: Idempotency Implementation (3 hours)
#### 4.1 Implement Redis-backed idempotency
```typescript
// packages/api-framework/src/idempotency.ts

import { getRedisClient } from "./redis-client";

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface IdempotentEntry {
  status: number;
  body: string;
  headers: Record<string, string>;
  createdAt: number;
}

// In-memory fallback for dev
const memoryCache = new Map<string, IdempotentEntry>();

export async function getIdempotentResponse(key: string): Promise<NextResponse | null> {
  const redis = getRedisClient();

  if (redis) {
    const entry = await redis.get<IdempotentEntry>(`idempotency:${key}`);
    if (entry) {
      return new NextResponse(entry.body, {
        status: entry.status,
        headers: entry.headers,
      });
    }
    return null;
  }

  // Memory fallback
  const entry = memoryCache.get(key);
  if (entry && Date.now() - entry.createdAt < IDEMPOTENCY_TTL_MS) {
    return new NextResponse(entry.body, {
      status: entry.status,
      headers: entry.headers,
    });
  }

  return null;
}

export async function storeIdempotentResponse(key: string, response: NextResponse): Promise<void> {
  const entry: IdempotentEntry = {
    status: response.status,
    body: await response.clone().text(),
    headers: Object.fromEntries(response.headers.entries()),
    createdAt: Date.now(),
  };

  const redis = getRedisClient();

  if (redis) {
    await redis.set(`idempotency:${key}`, entry, {
      px: IDEMPOTENCY_TTL_MS,
    });
    return;
  }

  // Memory fallback
  memoryCache.set(key, entry);
}
```

#### 4.2 Update idempotency middleware
```typescript
// packages/api-framework/src/middleware/idempotency.ts

export function withIdempotency(config?: IdempotencyConfig) {
  return async (request: NextRequest, context: RequestContext) => {
    const idempotencyKey = request.headers.get("Idempotency-Key");

    if (!idempotencyKey) {
      // No key provided, proceed without idempotency
      return null;
    }

    // Check for cached response
    const cached = await getIdempotentResponse(idempotencyKey);
    if (cached) {
      // Add header to indicate this was a replay
      cached.headers.set("X-Idempotent-Replayed", "true");
      return cached;
    }

    // Proceed with handler, store result after
    return null;
  };
}
```

---

### Phase 5: Integration & Testing (2 hours)
#### 5.1 Update endpoint factory
```typescript
// packages/api-framework/src/factory.ts

export function createEndpoint(config: EndpointConfig) {
  return async (request: NextRequest, routeContext: RouteContext) => {
    // ... existing auth/org middleware

    // Rate limiting (now async)
    if (config.rateLimit) {
      const rateLimitResult = await withRateLimit(config.rateLimit)(request, context);
      if (rateLimitResult) return rateLimitResult;
    }

    // Idempotency check
    if (config.idempotent) {
      const cachedResponse = await withIdempotency()(request, context);
      if (cachedResponse) return cachedResponse;
    }

    // ... handler execution

    // Store idempotent response if key provided
    const idempotencyKey = request.headers.get("Idempotency-Key");
    if (idempotencyKey && config.idempotent) {
      await storeIdempotentResponse(idempotencyKey, response);
    }

    return response;
  };
}
```

#### 5.2 Add integration tests
```typescript
// packages/api-framework/tests/rate-limit.integration.test.ts

describe("Redis Rate Limiting", () => {
  beforeAll(() => {
    process.env.USE_REDIS_RATE_LIMIT = "true";
    // Use test Redis or mock
  });

  it("should rate limit across instances", async () => {
    const key = `test:${Date.now()}`;

    // Simulate 10 requests
    for (let i = 0; i < 10; i++) {
      const result = await checkRateLimit(key, 5, 60_000);
      if (i < 5) {
        expect(result.allowed).toBe(true);
      } else {
        expect(result.allowed).toBe(false);
      }
    }
  });

  it("should replay idempotent responses", async () => {
    const key = `idempotency:${Date.now()}`;
    const response = NextResponse.json({ created: true }, { status: 201 });

    await storeIdempotentResponse(key, response);

    const cached = await getIdempotentResponse(key);
    expect(cached?.status).toBe(201);
  });
});
```

---

### Phase 6: Deployment & Rollout (1 hour)
#### 6.1 Environment configuration
1. Create Upstash Redis database at <https://console.upstash.com>
2. Copy REST URL and Token
3. Add to Vercel/production secrets:

   ```bash
   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AXxx...
   USE_REDIS_RATE_LIMIT=true
   ```

#### 6.2 Gradual rollout
1. **Week 1:** Deploy with `USE_REDIS_RATE_LIMIT=false` (verify no regressions)
2. **Week 2:** Enable on staging with `USE_REDIS_RATE_LIMIT=true`
3. **Week 3:** Enable on production

#### 6.3 Monitoring
Add dashboard metrics:

- Redis operation latency (p50, p95, p99)
- Rate limit rejections per endpoint
- Idempotency cache hit rate
- Redis connection errors

---

## File Checklist
| File                                         | Action                  | Priority |
| -------------------------------------------- | ----------------------- | -------- |
| `packages/env/src/server.ts`                 | Add Redis env vars      | P0       |
| `packages/api-framework/package.json`        | Add `@upstash/redis`    | P0       |
| `packages/api-framework/src/redis-client.ts` | Create                  | P0       |
| `packages/api-framework/src/rate-limit.ts`   | Refactor                | P0       |
| `packages/api-framework/src/idempotency.ts`  | Implement               | P0       |
| `packages/api-framework/src/factory.ts`      | Update middleware order | P1       |
| `packages/api-framework/tests/*.test.ts`     | Add integration tests   | P1       |
| `.env.example`                               | Document new vars       | P2       |
| `docs/guides/RATE_LIMITING.md`               | Update docs             | P2       |

---

## Rollback Plan
If issues occur after enabling Redis:

1. Set `USE_REDIS_RATE_LIMIT=false` in environment
2. Redeploy
3. All endpoints fall back to in-memory rate limiting
4. Debug Redis issues without production impact

---

## Success Criteria
- \[x] Rate limits work correctly across multiple Vercel instances
- \[x] Idempotent requests return cached responses within 24h
- \[ ] p95 latency increase < 5ms per request _(needs production validation)_
- \[ ] Zero Redis-related errors in production logs _(needs production validation)_
- \[x] Existing rate limit tests still pass
- \[x] New Redis integration tests added (13 tests)

---

**Last Updated:** December 20, 2025 **Owner:** @srdev **Status:** ✅ IMPLEMENTED - Ready for
Production Deployment
