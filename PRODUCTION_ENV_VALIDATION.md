# Production Environment Validation Guide

**Status**: ✅ **FULLY IMPLEMENTED**

This guide shows how to validate your environment to catch production misconfigurations early.

---

## The Problem

Production issues often hide until high load:

```
Scenario: Your app works fine in dev, crashes in production
Reason:   Redis not configured, falls back to in-memory rate limiting
Result:   Each instance has separate buckets, limits don't work
Impact:   Attackers can make 10x more requests (10 instances × limits)
```

**Solution**: Validate environment at startup, fail fast if misconfigured.

---

## Quick Start: Add to Your App

### 1. Call Validation at Startup

**File**: `apps/web/instrumentation.ts` (or `pages/_app.tsx` or Next.js layout)

```typescript
import { env, preFlightChecks } from "@packages/env";

// Run this early, before app boots
preFlightChecks(env);

// Now safe to use the app
export default function Layout({ children }) {
  return <>{children}</>;
}
```

**What it does**:
- Validates all required production config
- Checks multi-instance setup
- Throws if critical infrastructure missing
- Logs status to console

### 2. Use Environment Guards

```typescript
import { assertProduction, assertNotProduction, env } from "@packages/env";

// Mark functions that only work in production
export async function captureAnalytics() {
  assertProduction(env);
  // Now TypeScript knows env is ProdEnv
  // REDIS_URL is guaranteed to exist
  const redis = new Redis(env.REDIS_URL);
  // ...
}

// Mark functions that only work in development
export function seedTestData() {
  assertNotProduction(env);
  // Safe to use test fixtures
  // ...
}
```

### 3. Check Multi-Instance Status

```typescript
import { getMultiInstanceInfo, env } from "@packages/env";

const info = getMultiInstanceInfo(env);

if (info.riskLevel === "critical") {
  console.error(`⚠️ ${info.message}`);
  // Don't start app
  process.exit(1);
}

console.log(`✅ ${info.message}`);
```

---

## Production Requirements

### What Must Be Set in Production

```bash
# REQUIRED
NODE_ENV=production
REDIS_URL=redis://redis-host:6379

# REQUIRED (Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
FIREBASE_ADMIN_PROJECT_ID=my-project

# OPTIONAL
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
```

### Validation Happens At

1. **Startup**: `preFlightChecks(env)` runs
2. **Guard calls**: `assertProduction(env)` throws if misconfigured
3. **Rate limiting**: `getRateLimiter()` auto-selects based on REDIS_URL

### Error Messages

If Redis is missing in production:

```
❌ Production environment validation failed:
  REDIS_URL: Required for production multi-instance rate limiting

Required for production:
  - REDIS_URL (for multi-instance rate limiting, caching, sessions)
  - NEXT_PUBLIC_FIREBASE_API_KEY
  - FIREBASE_ADMIN_PROJECT_ID
  - NODE_ENV="production"
```

---

## API Reference

### `preFlightChecks(env)`

Run comprehensive startup validation. Throws if critical config missing.

```typescript
import { preFlightChecks, env } from "@packages/env";

// Call early in app initialization
preFlightChecks(env);
// Throws if production without Redis
// Warns if development without Redis
// Returns void if OK
```

**Use in**:
- `instrumentation.ts` (Next.js)
- `pages/_app.tsx` (Pages Router)
- `app/layout.tsx` (App Router)
- Server startup script

---

### `assertProduction(env)`

Guard that throws if NOT in production. Use for production-only code.

```typescript
import { assertProduction, env } from "@packages/env";

export async function captureMetrics(data: unknown) {
  assertProduction(env);
  
  // TypeScript now knows:
  // - NODE_ENV is "production"
  // - REDIS_URL exists (not undefined)
  // - All required fields are present
  
  const redis = new Redis(env.REDIS_URL);
  // Safe to use production-only APIs
}
```

**Throws if**: NODE_ENV is not "production"

---

### `assertNotProduction(env)`

Guard that throws if in production. Use for dev-only code.

```typescript
import { assertNotProduction, env } from "@packages/env";

export function seedDatabase() {
  assertNotProduction(env);
  
  // Now safe to seed test data
  // This will crash if accidentally called in production
  db.seed(testData);
}
```

**Throws if**: NODE_ENV is "production"

---

### `getMultiInstanceInfo(env)`

Check multi-instance deployment status. Returns risk assessment.

```typescript
import { getMultiInstanceInfo, env } from "@packages/env";

const info = getMultiInstanceInfo(env);

console.log(info);
// {
//   isMultiInstance: true,
//   riskLevel: "safe" | "warn" | "critical",
//   message: "..."
// }

if (info.riskLevel === "critical") {
  // CRITICAL: Production without Redis
  // Rate limiting won't work across instances
  process.exit(1);
}
```

**Risk Levels**:
- **safe**: Multi-instance prod with Redis ✅
- **safe**: Single-instance dev ✅
- **warn**: Multi-instance dev (unnecessary) ⚠️
- **critical**: Multi-instance prod without Redis ❌

---

### `isProduction(env)`

Simple boolean check.

```typescript
import { isProduction, env } from "@packages/env";

if (isProduction(env)) {
  // Running in production
} else {
  // Running in dev/test
}
```

---

### `isMultiInstanceEnabled(env)`

Check if Redis is configured.

```typescript
import { isMultiInstanceEnabled, env } from "@packages/env";

if (isMultiInstanceEnabled(env)) {
  // REDIS_URL is set
  // Using distributed rate limiting
} else {
  // REDIS_URL not set
  // Using in-memory rate limiting
}
```

---

### `validateProductionEnv(env)`

Strict validation for production. Throws if any required field missing.

```typescript
import { validateProductionEnv, env } from "@packages/env";

try {
  const prodEnv = validateProductionEnv(env);
  // prodEnv is guaranteed to have REDIS_URL
} catch (err) {
  // Production validation failed
  console.error(err);
  process.exit(1);
}
```

---

## Real-World Examples

### Example 1: Next.js Instrumentation

```typescript
// apps/web/instrumentation.ts

import { env, preFlightChecks } from "@packages/env";

export async function register() {
  // Run all startup validation
  preFlightChecks(env);

  // Now safe to initialize infrastructure
  if (process.env.NODE_ENV === "production") {
    console.log("Starting production server...");
    // Set up production-only monitoring, etc.
  }
}
```

### Example 2: API Route with Guards

```typescript
// apps/web/app/api/analytics/capture/route.ts

import { NextRequest, NextResponse } from "next/server";
import { assertProduction, env } from "@packages/env";

export const POST = async (req: NextRequest) => {
  // Fail fast if not in production
  assertProduction(env);

  // Now safe to write to production database
  const data = await req.json();
  await captureToProduction(data);

  return NextResponse.json({ success: true });
};
```

### Example 3: Rate Limit Middleware with Validation

```typescript
// apps/web/app/api/_shared/rate-limit-middleware.ts (enhanced)

import { isMultiInstanceEnabled, getMultiInstanceInfo, env } from "@packages/env";

export function withRateLimit(handler, config) {
  // Warn in dev if not using Redis for rate limiting
  if (!isMultiInstanceEnabled(env)) {
    console.warn(
      `⚠️ Rate limiting on "${config.route}" is per-instance (in-memory). ` +
      `Set REDIS_URL for distributed limiting.`
    );
  }

  const limiter = getRateLimiter({
    max: config.max,
    windowSeconds: config.windowSeconds,
    keyPrefix: config.keyPrefix ?? "api"
  });

  return async (req: NextRequest): Promise<NextResponse> => {
    // ... existing rate limiting logic
  };
}
```

### Example 4: Startup Script

```typescript
// scripts/validate-env.ts

import { env, preFlightChecks, getMultiInstanceInfo } from "@packages/env";

console.log("\n📋 Environment Validation\n");

try {
  preFlightChecks(env);
  
  const info = getMultiInstanceInfo(env);
  console.log(`\n${info.message}\n`);

  if (info.riskLevel === "critical") {
    console.error("❌ CRITICAL: Fix configuration before deploying");
    process.exit(1);
  }

  console.log("✅ Ready to start");
} catch (err) {
  console.error("❌ Validation failed:", err.message);
  process.exit(1);
}
```

Run before deployment:
```bash
pnpm tsx scripts/validate-env.ts
```

---

## Deployment Checklist

Before deploying to production:

- [ ] `REDIS_URL` is set in production environment
- [ ] `NODE_ENV=production` is set
- [ ] Firebase credentials are set
- [ ] Run startup validation: `preFlightChecks(env)`
- [ ] No `assertNotProduction()` guards in production code
- [ ] All `assertProduction()` guards in production-only code
- [ ] Rate limiting tests pass with Redis
- [ ] Multi-instance info shows "safe" risk level
- [ ] Pre-flight checks pass

---

## Common Mistakes

### ❌ Mistake 1: Forgetting REDIS_URL in Production

```typescript
// Production env missing REDIS_URL
NODE_ENV=production
NEXT_PUBLIC_FIREBASE_API_KEY=...

// App boots, but rate limiting is broken!
// Each instance has separate buckets
```

**Fix**: Run `preFlightChecks(env)` at startup to catch this.

---

### ❌ Mistake 2: Using Production-Only Code in Dev

```typescript
async function syncToDataWarehouse() {
  assertProduction(env);  // ← Throws in dev!
  // ...
}

// Calling in dev
syncToDataWarehouse();  // ❌ Crash
```

**Fix**: Don't call production-only functions in dev, or skip them conditionally.

---

### ❌ Mistake 3: Assuming Redis is Set

```typescript
const redis = new Redis(env.REDIS_URL);  // ← Could be undefined!

// In production without Redis:
// TypeError: Cannot read property 'connect' of undefined
```

**Fix**: Use `assertProduction(env)` first, or check `isMultiInstanceEnabled(env)`.

---

## Summary

| Use Case | Function | When |
|----------|----------|------|
| Check startup | `preFlightChecks(env)` | App initialization |
| Production-only code | `assertProduction(env)` | Function guard |
| Dev-only code | `assertNotProduction(env)` | Function guard |
| Multi-instance status | `getMultiInstanceInfo(env)` | Health checks, logging |
| Simple bool check | `isProduction(env)` | Conditionals |
| Redis enabled | `isMultiInstanceEnabled(env)` | Feature detection |

**Key principle**: Fail fast and loudly. Better to crash at startup than silently break in production.
