---
title: "Infrastructure Reality Audit"
description: "Audit of infrastructure, deployment, and operational reality"
keywords:
  - audit
  - infrastructure
  - report
  - operational
  - assessment
category: "report"
status: "active"
audience:
  - operators
  - architects
  - stakeholders
related-docs:
  - ../production/FINAL_SIGN_OFF.md
  - ../guides/DEPLOYMENT.md
---

# Infrastructure Reality Audit - 2025-12-23

**Note**: This document reflects the state of the codebase as of the date above. Some information
may have changed since this audit was performed.

## Executive Summary

**Previous Assessment Was WRONG.** Infrastructure IS implemented but has coverage gaps.

| Component     | Files Exist    | Wired to Routes | Coverage   |
| ------------- | -------------- | --------------- | ---------- |
| Rate Limiting | ✅ 4 files     | 16/39           | **41%**    |
| Sentry        | ✅ 3 configs   | Via middleware  | **Global** |
| OTEL          | ✅ 2 files     | Via middleware  | **Global** |
| SDK Factory   | ✅ 1 framework | 22/39           | **56%**    |

## 1. Rate Limiting - PARTIAL ⚠️

**Configured:** `USE_REDIS_RATE_LIMIT=true` with Upstash credentials in `.env.local`

**Implementation Files:**

- `apps/web/app/api/_shared/rate-limit-middleware.ts`
- `apps/web/app/api/_shared/rate-limit-examples.ts`
- `apps/web/app/api/_shared/security.ts`
- `apps/web/app/api/onboarding/_shared/rateLimit.ts`

**Routes WITH rate limiting (16):**

- attendance, auth/mfa/\*, batch, healthz, metrics, verify-eligibility
- organizations (root), positions/\*, publish, schedules

**Routes WITHOUT rate limiting (23):**

- ALL onboarding routes (except verify-eligibility)
- organizations/\[id]/\* (members, single org)
- session/_, widgets, shifts/_, files, repomix, terminal
- ops/build-performance, internal/backup

## 2. Sentry - GLOBAL ✅

**Config Files:**

- `apps/web/sentry.client.config.ts`
- `apps/web/sentry.edge.config.ts`
- `apps/web/sentry.server.config.ts`

**Integration:**

- Middleware imports `* as Sentry from "@sentry/nextjs"`
- `Sentry.setUser()` called in `requireSession()`
- Global error boundary coverage via Next.js integration

## 3. OpenTelemetry - GLOBAL ✅

**Implementation Files:**

- `apps/web/app/api/_shared/otel-init.ts`
- `apps/web/app/api/_shared/otel.ts`

**Integration:**

- Middleware uses `trace.getTracer()` and `startActiveSpan()`
- 23 trace/span references in middleware.ts
- All authenticated routes get automatic tracing via `requireSession()`

## 4. SDK Factory - PARTIAL ⚠️

**Routes using SDK factory (22):**

- Uses `createAuthenticatedEndpoint` or `createPublicEndpoint`
- Gets automatic input validation, auth, error handling

**Routes NOT using SDK factory (17):**

- batch, items, join-tokens
- organizations/\[id]/_, positions/_, publish
- schedules/_, shifts/_, venues, zones
- ops/build-performance, repomix

## 5. CRITICAL: Onboarding Flow BROKEN 🔴

**Problem:** UI pages don't call APIs!

`apps/web/app/onboarding/create-network-org/page.tsx` around line 45:

```tsx
// Real implementation would POST to /api/onboarding/create-network-org.
nav.push("/onboarding/block-4");
```

**APIs exist but UI doesn't use them:**

- `/api/onboarding/create-network-org` - POST handler ready
- `/api/onboarding/create-network-corporate` - POST handler ready
- `/api/onboarding/join-with-token` - POST handler ready
- `/api/onboarding/activate-network` - POST handler ready
- `/api/onboarding/profile` - POST handler ready

**UI just navigates without persisting anything to Firestore!**

## 6. Metrics/Dashboard Access

**Existing endpoints:**

- `GET /api/metrics` - exists with rate limiting
- `GET /api/healthz` - exists
- `GET /api/ops/build-performance` - exists (no auth?)

**Missing for ops dashboard:**

- Connection to actual OTEL data
- Sentry project dashboard integration
- Real-time metrics aggregation

## Recommendations

### IMMEDIATE (Fix Today)

1. **Wire onboarding UI to APIs** - Forms submit but don't POST
2. **Add rate limiting to onboarding routes** - Currently unprotected

### SHORT TERM

1. Migrate remaining 17 routes to SDK factory
2. Add rate limiting to remaining 23 routes

### FOR OPS DASHBOARD

1. Create `/api/ops/metrics` that aggregates OTEL spans
2. Create `/api/ops/errors` that fetches from Sentry API
3. Create `/api/ops/health-summary` composite endpoint
