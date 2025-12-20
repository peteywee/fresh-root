# Rate Limit Middleware Implementation Guide

**Status**: ✅ **FULLY IMPLEMENTED**

This guide shows how to use the rate limit middleware in your API routes.

---

## Quick Start (Copy-Paste)

### Basic Pattern

```typescript
// apps/web/app/api/your-route/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "../_shared/rate-limit-middleware";
import { requireSession } from "../_shared/middleware";

export const POST = withRateLimit(
  requireSession(async (req) => {
    // Your handler logic
    const body = await req.json();
    return NextResponse.json({ success: true });
  }),
  {
    feature: "your-feature",
    route: "POST /api/your-route",
    max: 30,
    windowSeconds: 60,
  },
);
```

That's it. The middleware:

- Checks the client's request count in the current window
- Returns 429 (Too Many Requests) if limit exceeded
- Passes through to your handler if allowed
- Sets `Retry-After` header for client backoff

---

## Architecture

### Two-Layer System

**Layer 1: Rate Limiter** (`src/lib/api/rate-limit.ts`)

- `RateLimiter` interface with `consume(key)` method
- `InMemoryRateLimiter` for dev (single process)
- `RedisRateLimiter` for prod (multi-instance safe)
- Auto-selected based on environment

**Layer 2: Middleware** (`app/api/_shared/rate-limit-middleware.ts`)

- `withRateLimit()` wraps your handler
- Extracts client IP from request headers
- Calls limiter to check quota
- Returns 429 or passes to handler

### Data Flow

```text
Client Request
    ↓
withRateLimit middleware
    ↓
Extract IP + build key
    ↓
RateLimiter.consume(key)
    ↓
┌─────────────────────────┐
│  Within quota?          │
├─────────────────────────┤
│ YES → Call handler      │
│ NO  → Return 429        │
└─────────────────────────┘
    ↓
Response
```

---

## Configuration

### RateLimitConfig Options

```typescript
interface RateLimitConfig {
  // REQUIRED: Feature name for grouping (e.g., "auth", "onboarding")
  feature: string;

  // REQUIRED: Route identifier (e.g., "POST /api/auth/login")
  route: string;

  // REQUIRED: Max requests per window
  max: number;

  // REQUIRED: Window duration in seconds
  windowSeconds: number;

  // OPTIONAL: Key prefix (default: "api")
  // Use different prefixes to isolate rate limit buckets
  keyPrefix?: string;
}
```

### Recommended Presets

| Use Case              | max  | windowSeconds | keyPrefix    | Notes                       |
| --------------------- | ---- | ------------- | ------------ | --------------------------- |
| **Auth (login)**      | 5    | 60            | `auth:login` | Strict: prevent brute force |
| **API (standard)**    | 30   | 60            | `api`        | Moderate: typical endpoint  |
| **Public (generous)** | 100  | 60            | `public`     | Loose: public endpoints     |
| **Health checks**     | 1000 | 60            | `health`     | Very loose: monitoring      |
| **Burst protection**  | 10   | 1             | `burst`      | Per-second: prevent spikes  |
| **Hourly quota**      | 1000 | 3600          | `hourly`     | Per-hour: daily budget      |

---

## Real-World Examples

### Example 1: Login Endpoint (Strict)

```typescript
// apps/web/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "../_shared/rate-limit-middleware";

export const POST = withRateLimit(
  async (req) => {
    const { email, password } = await req.json();

    // Validate credentials
    // ... your auth logic

    return NextResponse.json({
      success: true,
      token: "jwt-token-here",
    });
  },
  {
    feature: "auth",
    route: "POST /api/auth/login",
    max: 5, // Only 5 attempts per minute
    windowSeconds: 60,
    keyPrefix: "auth:login",
  },
);
```

**Behavior**:

- Client can attempt login 5 times per minute
- 6th attempt within 60s → 429 response
- Client sees: `Retry-After: 45` (wait ~45 seconds)

---

### Example 2: Onboarding (Moderate)

```typescript
// apps/web/app/api/onboarding/create-network-org/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "../_shared/rate-limit-middleware";
import { requireSession } from "../_shared/middleware";

export const POST = withRateLimit(
  requireSession(async (req, context) => {
    const { userId, orgId } = context; // From requireSession
    const body = await req.json();

    // Create org
    const newOrg = await createOrganization({
      userId,
      ...body,
    });

    return NextResponse.json({
      success: true,
      org: newOrg,
    });
  }),
  {
    feature: "onboarding",
    route: "POST /api/onboarding/create-network-org",
    max: 30,
    windowSeconds: 60,
    keyPrefix: "onboarding",
  },
);
```

**Behavior**:

- Authenticated users can create 30 orgs per minute
- Reasonable limit for bulk operations
- Prevents accidental/malicious spam

---

### Example 3: Public Search (Generous)

```typescript
// apps/web/app/api/public/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "../_shared/rate-limit-middleware";

export const GET = withRateLimit(
  async (req) => {
    const query = req.nextUrl.searchParams.get("q");

    // Search logic
    const results = await searchDatabase(query);

    return NextResponse.json({ results });
  },
  {
    feature: "search",
    route: "GET /api/public/search",
    max: 100,
    windowSeconds: 60,
    keyPrefix: "search",
  },
);
```

**Behavior**:

- Anyone can search 100 times per minute
- Very generous (unlikely to hit in normal use)
- Protects against denial-of-service

---

### Example 4: Health Check (No Real Limit)

```typescript
// apps/web/app/api/health/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "../_shared/rate-limit-middleware";

export const GET = withRateLimit(
  async (req) => {
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  },
  {
    feature: "health",
    route: "GET /api/health",
    max: 10000, // Very high, basically unlimited
    windowSeconds: 60,
    keyPrefix: "health",
  },
);
```

---

## Middleware Chaining

### Stacking Middleware

You can combine `withRateLimit` with other middleware:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "../_shared/rate-limit-middleware";
import { requireSession } from "../_shared/middleware";
import { validateJson } from "../_shared/middleware";

// Apply middleware in order: auth → validation → rate limit
export const POST = withRateLimit(
  validateJson(
    requireSession(async (req) => {
      // Handler logic
      return NextResponse.json({ success: true });
    }),
  ),
  {
    feature: "schedules",
    route: "POST /api/schedules/create",
    max: 10,
    windowSeconds: 60,
  },
);
```

**Order matters**:

1. **Authentication** first (validate who they are)
2. **Validation** next (reject malformed requests early)
3. **Rate limiting** last (count allowed requests)

---

## Environment & Backend Storage

### Development (Default)

```bash
# No configuration needed
NODE_ENV=development
# Uses InMemoryRateLimiter (process-local, single instance)
```

**Behavior**:

- Buckets stored in JavaScript `Map`
- Cleaned up automatically when window expires
- Perfect for local development
- **Not suitable for multi-instance** (each process has own buckets)

### Production with Redis

```bash
# Set in your production .env
REDIS_URL="redis://redis-host:6379"
NODE_ENV=production
```

**Behavior**:

- Uses `RedisRateLimiter` (distributed, multi-instance safe)
- Keys expire automatically after `windowSeconds`
- All instances share the same bucket
- Recommended for production deployments

### Production without Redis (Not Recommended)

```bash
NODE_ENV=production
# No REDIS_URL set
# Falls back to InMemoryRateLimiter
```

**⚠️ Risk**: Each instance tracks separately. Requests split across processes = limits not enforced
globally.

---

## Client Experience: 429 Response

When a client hits the rate limit, they receive:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 45
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 0

{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later."
}
```

**Headers**:

- `Retry-After`: Seconds to wait before retrying
- `X-RateLimit-Limit`: Max requests allowed
- `X-RateLimit-Remaining`: Requests left in current window

**Client should**:

1. Check `Retry-After` header
2. Wait that many seconds
3. Retry the request

---

## Performance & Memory

### Memory Usage

**InMemoryRateLimiter**:

- Per bucket: ~200 bytes (count + resetAt)
- Per route: ~1 bucket per unique IP per window
- Example: 1000 IPs = ~200KB per route
- Auto-cleaned: old buckets removed when window expires

**RedisRateLimiter**:

- Per key: ~100 bytes in Redis
- Redis handles expiration (EXPIRE command)
- Shared across all instances
- Can scale to millions of keys

### CPU Impact

- `consume()` call: O(1) operation
- Redis: single INCRBY + EXPIRE call
- In-memory: single Map lookup
- **Negligible overhead** for rate limiting

---

## Common Patterns

### Pattern 1: Per-User Rate Limiting

Currently, rate limiting is per-IP. To limit per-user instead:

```typescript
// Extract user from session
export const POST = withRateLimit(
  requireSession(async (req, context) => {
    // context.userId available from requireSession
    const userId = context.userId;

    // Handler logic
    return NextResponse.json({ success: true });
  }),
  {
    feature: "schedules",
    route: "POST /api/schedules/create",
    max: 10,
    windowSeconds: 60,
  },
);
```

**Future enhancement**: Modify `withRateLimit` to extract `userId` from context and use it in the
key instead of IP.

---

### Pattern 2: Per-Organization Rate Limiting

```typescript
export const POST = withRateLimit(
  requireSession(async (req, context) => {
    const { orgId } = context;
    // Handler logic
    return NextResponse.json({ success: true });
  }),
  {
    feature: "teams",
    route: "POST /api/teams/invite",
    max: 100, // Per org, not per IP
    windowSeconds: 60,
  },
);
```

**Future enhancement**: Modify key building to use `orgId` instead of IP.

---

## Troubleshooting

### "Rate limit exceeded" immediately

**Possible causes**:

1. `max` set too low
2. `windowSeconds` too short
3. Multiple requests in same millisecond

**Solutions**:

- Increase `max`
- Increase `windowSeconds`
- Check client is retrying correctly

---

### Redis connection errors

**Error**: `REDIS_URL is set but connection fails`

**Solutions**:

1. Verify Redis is running: `redis-cli ping`
2. Check `REDIS_URL` format: `redis://host:port`
3. Check network/firewall access to Redis
4. Fallback: Remove `REDIS_URL` to use in-memory (dev only)

---

### Rate limits not enforced across instances

**Issue**: Deployed 3 instances, but can make 3x more requests

**Cause**: Using in-memory limiter (each instance has own buckets)

**Solution**: Set `REDIS_URL` to use distributed limiter

---

## Testing Rate Limits

### Unit Test Example

```typescript
import { describe, it, expect } from "vitest";
import { withRateLimit } from "@/app/api/_shared/rate-limit-middleware";
import { NextResponse } from "next/server";

describe("withRateLimit", () => {
  it("allows requests within limit", async () => {
    const handler = withRateLimit(async () => NextResponse.json({ ok: true }), {
      feature: "test",
      route: "GET /test",
      max: 5,
      windowSeconds: 60,
    });

    // Make 5 requests
    for (let i = 0; i < 5; i++) {
      const req = new Request("http://localhost/test", {
        headers: { "x-forwarded-for": "192.168.1.1" },
      });
      const res = await handler(req);
      expect(res.status).toBe(200);
    }
  });

  it("rejects requests beyond limit", async () => {
    const handler = withRateLimit(async () => NextResponse.json({ ok: true }), {
      feature: "test",
      route: "GET /test",
      max: 1,
      windowSeconds: 60,
    });

    const req1 = new Request("http://localhost/test", {
      headers: { "x-forwarded-for": "192.168.1.2" },
    });
    const res1 = await handler(req1);
    expect(res1.status).toBe(200);

    const req2 = new Request("http://localhost/test", {
      headers: { "x-forwarded-for": "192.168.1.2" },
    });
    const res2 = await handler(req2);
    expect(res2.status).toBe(429);
  });
});
```

---

## Deployment Checklist

Before deploying with rate limiting:

- [ ] Choose `max` and `windowSeconds` for each route
- [ ] Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in production
- [ ] Set `USE_REDIS_RATE_LIMIT=true` to enable Redis backend
- [ ] Test Redis connection in production
- [ ] Monitor 429 responses in production
- [ ] Document rate limits in API docs
- [ ] Add `Retry-After` handling to client code
- [ ] Set up alerts for unusual 429 spike patterns

### Environment Variables

```bash
# Upstash Redis (recommended for serverless/Edge)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxx...
USE_REDIS_RATE_LIMIT=true  # Enable Redis, false = in-memory fallback
```

---

## Summary

| Aspect                | Status                                       |
| --------------------- | -------------------------------------------- |
| **Middleware**        | ✅ Implemented (`rate-limit-middleware.ts`)  |
| **Rate Limiter**      | ✅ Implemented (`src/lib/api/rate-limit.ts`) |
| **In-Memory Backend** | ✅ Working (dev)                             |
| **Redis Backend**     | ✅ Supported (prod)                          |
| **Example Patterns**  | ✅ See `rate-limit-examples.ts`              |
| **Documentation**     | ✅ This file                                 |

**Ready to use**: Copy the basic pattern above and apply to your routes.
