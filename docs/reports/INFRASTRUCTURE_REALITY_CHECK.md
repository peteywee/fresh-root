# Infrastructure Reality Check
**Generated**: 2025-12-23\
**Purpose**: Ground truth status of critical infrastructure\
**Tags**: infrastructure, security, observability, rate-limiting

---

## 🚨 Executive Summary
**You were right to question this.** The infrastructure EXISTS but is **NOT WIRED UP**.

| Component                 | Packages Installed         | Config Files      | Routes Using | Status          |
| ------------------------- | -------------------------- | ----------------- | ------------ | --------------- |
| **Rate Limiting**         | ✅ ioredis, @upstash/redis | ✅ 4 files        | ❌ 1/39 (3%) | 🔴 NOT DEPLOYED |
| **Sentry Error Tracking** | ✅ @sentry/nextjs          | ✅ 3 config files | ❌ 0/39 (0%) | 🔴 NOT WIRED    |
| **OpenTelemetry Tracing** | ✅ @opentelemetry/\*       | ✅ 2 files        | ❌ 0/39 (0%) | 🔴 NOT WIRED    |
| **Redis (Upstash)**       | ✅                         | ✅ ENV configured | ❌ Not used  | 🔴 ENV ONLY     |

---

## 📊 Detailed Breakdown
### Rate Limiting
**What exists:**

```
packages/api-framework/src/rate-limit.ts          # Core implementation (225 lines)
apps/web/src/lib/api/rate-limit.ts                # Web app implementation (260 lines)
apps/web/app/api/_shared/rate-limit-middleware.ts # HOC wrapper (100 lines)
apps/web/app/api/_shared/rate-limit-examples.ts   # Copy-paste examples
```

**What's configured:**

```bash
# .env.local
UPSTASH_REDIS_REST_URL="https://great-bedbug-38143.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AZT_***"
USE_REDIS_RATE_LIMIT=true
```

**What's actually used:**

```
Routes WITH rate limiting:  1/39 (apps/web/app/api/positions/[id]/route.ts)
Routes WITHOUT rate limiting: 38/39
```

**Root Cause:** The `withRateLimit` middleware was built but never applied to routes.

---

### Sentry Error Tracking
**What exists:**

```
apps/web/sentry.client.config.ts  # Client-side init
apps/web/sentry.edge.config.ts    # Edge runtime init
apps/web/sentry.server.config.ts  # Server-side init
apps/web/src/lib/error/reporting.ts  # reportError() helper
```

**What's configured:**

```bash
# .env.local - NO SENTRY DSN SET
# NEXT_PUBLIC_SENTRY_DSN is undefined
```

**What's actually used:**

```
Routes using reportError: 0/39
Routes using Sentry.captureException: 0/39
```

**Root Cause:** DSN not configured + `reportError()` never imported in routes.

---

### OpenTelemetry Tracing
**What exists:**

```
apps/web/app/api/_shared/otel-init.ts  # SDK bootstrap
apps/web/app/api/_shared/otel.ts       # Tracer helpers
tests/unit/observability/otel-init.test.ts  # Tests
```

**What's configured:**

```bash
# .env.local
# OTEL_EXPORTER_OTLP_ENDPOINT is commented out
# OBSERVABILITY_TRACES_ENABLED is not set
```

**What's actually used:**

```
Routes calling ensureOtelStarted: 0/39
Routes using getTracer: 0/39
```

**Root Cause:** ENV vars not set + `ensureOtelStarted()` never called in route handlers.

---

## 🔥 Risk Assessment
### Current State
| Vulnerability               | Severity    | Exploit Scenario               |
| --------------------------- | ----------- | ------------------------------ |
| **No rate limiting**        | 🔴 CRITICAL | Attacker can DDoS any endpoint |
| **No error tracking**       | 🟠 HIGH     | Production errors invisible    |
| **No tracing**              | 🟡 MEDIUM   | Can't debug performance issues |
| **Auth routes unprotected** | 🔴 CRITICAL | Brute force attacks possible   |

### Priority Routes Missing Rate Limiting
```
apps/web/app/api/session/route.ts           # Auth - CRITICAL
apps/web/app/api/session/bootstrap/route.ts # Auth - CRITICAL
apps/web/app/api/onboarding/join-with-token/route.ts  # Token validation - CRITICAL
apps/web/app/api/onboarding/create-network-org/route.ts  # Org creation - HIGH
apps/web/app/api/organizations/[id]/route.ts  # Org access - HIGH
```

---

## ✅ What Actually Works
1. **In-memory rate limiter** - Works for single-instance dev
2. **Redis limiter code** - Tested, just not wired
3. **Sentry SDK init** - Will work if DSN provided
4. **OTEL SDK** - Will work if endpoint configured

---

## 🛠️ Fix Path (Priority Order)
### 1. Rate Limiting (30 min)
```bash
# Already have middleware, just need to apply it
# Add to all critical routes:
import { withRateLimit } from "../_shared/rate-limit-middleware";
export const POST = withRateLimit(handler, { ... });
```

### 2. Sentry (10 min)
```bash
# Add to .env.local:
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# Import in routes:
import { reportError } from "@/src/lib/error/reporting";
```

### 3. OTEL (15 min)
```bash
# Add to .env.local:
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
OBSERVABILITY_TRACES_ENABLED=true
```

---

## 📋 Quick Reference Index
### Files to Wire Rate Limiting
| File                           | Priority | Pattern to Add                  |
| ------------------------------ | -------- | ------------------------------- |
| `api/session/route.ts`         | P0       | `RateLimits.AUTH` (5/60s)       |
| `api/onboarding/*/route.ts`    | P0       | `RateLimits.WRITE` (30/60s)     |
| `api/organizations/*/route.ts` | P1       | `RateLimits.STANDARD` (100/60s) |
| `api/schedules/*/route.ts`     | P1       | `RateLimits.STANDARD`           |
| `api/shifts/*/route.ts`        | P1       | `RateLimits.STANDARD`           |

### Error Reporting Pattern
```typescript
import { reportError } from "@/src/lib/error/reporting";

try {
  // handler logic
} catch (error) {
  reportError(error, { route: "POST /api/xxx", userId });
  return NextResponse.json({ error: "Internal error" }, { status: 500 });
}
```

### OTEL Tracing Pattern
```typescript
import { getTracer, withTracing } from "../_shared/otel";

export const GET = withTracing("schedules.get", async (req, span) => {
  span.setAttribute("orgId", orgId);
  // handler logic
});
```

---

## 🎯 Metrics After Fix
| Metric                     | Current   | Target                 |
| -------------------------- | --------- | ---------------------- |
| Routes with rate limiting  | 1/39 (3%) | 39/39 (100%)           |
| Routes with error tracking | 0/39 (0%) | 39/39 (100%)           |
| Routes with tracing        | 0/39 (0%) | 15/39 (critical paths) |

---

## 📌 Mini-Index for Future Sessions
```
RATE LIMITING:
- Implementation: packages/api-framework/src/rate-limit.ts
- Web version: apps/web/src/lib/api/rate-limit.ts
- Middleware: apps/web/app/api/_shared/rate-limit-middleware.ts
- Presets: RateLimits.AUTH (5/60), WRITE (30/60), STANDARD (100/60)

ERROR TRACKING:
- Sentry configs: apps/web/sentry.*.config.ts
- Helper: apps/web/src/lib/error/reporting.ts
- Key function: reportError(error, context)

OTEL:
- Init: apps/web/app/api/_shared/otel-init.ts
- Helpers: apps/web/app/api/_shared/otel.ts
- Key functions: ensureOtelStarted(), getTracer(), withTracing()

ENV VARS NEEDED:
- NEXT_PUBLIC_SENTRY_DSN (Sentry)
- OTEL_EXPORTER_OTLP_ENDPOINT (OTEL)
- OBSERVABILITY_TRACES_ENABLED=true (OTEL)
- USE_REDIS_RATE_LIMIT=true (already set)
- UPSTASH_REDIS_REST_URL (already set)
- UPSTASH_REDIS_REST_TOKEN (already set)
```

---

_Reality check complete. Infrastructure exists, wiring does not._
