# Fresh Schedules Quick Index

**Last Updated**: 2025-12-23  
**Purpose**: Fast reference for common lookups

---

## 🔴 Current Blockers

| Issue | Location | Fix Required |
|-------|----------|--------------|
| **Onboarding doesn't persist** | `apps/web/app/onboarding/create-network-org/page.tsx` | Wire form to API |
| **23 routes missing rate limiting** | [See audit](./reports/INFRASTRUCTURE_REALITY_AUDIT.md#1-rate-limiting---partial-️) | Add rateLimit config |
| **17 routes not using SDK factory** | [See audit](./reports/INFRASTRUCTURE_REALITY_AUDIT.md#4-sdk-factory---partial-️) | Migrate to SDK |

---

## 📁 Key File Locations

### Infrastructure

| Component | Path |
|-----------|------|
| Rate Limit Middleware | `apps/web/app/api/_shared/rate-limit-middleware.ts` |
| Sentry Client | `apps/web/sentry.client.config.ts` |
| Sentry Server | `apps/web/sentry.server.config.ts` |
| OTEL Init | `apps/web/app/api/_shared/otel-init.ts` |
| Auth Middleware | `apps/web/app/api/_shared/middleware.ts` |
| SDK Factory | `packages/api-framework/src/index.ts` |

### Onboarding

| Component | Path |
|-----------|------|
| Wizard Context | `apps/web/app/onboarding/_wizard/OnboardingWizardContext.tsx` |
| Intent Page | `apps/web/app/onboarding/intent/page.tsx` |
| Create Org Page | `apps/web/app/onboarding/create-network-org/page.tsx` |
| Create Org API | `apps/web/app/api/onboarding/create-network-org/route.ts` |
| Profile API | `apps/web/app/api/onboarding/profile/route.ts` |

### Core APIs

| Resource | Path |
|----------|------|
| Organizations | `apps/web/app/api/organizations/route.ts` |
| Schedules | `apps/web/app/api/schedules/route.ts` |
| Shifts | `apps/web/app/api/shifts/route.ts` |
| Positions | `apps/web/app/api/positions/route.ts` |
| Attendance | `apps/web/app/api/attendance/route.ts` |

### Ops Dashboard

| Component | Path |
|-----------|------|
| Metrics API | `apps/web/app/api/metrics/route.ts` |
| Health Check | `apps/web/app/api/healthz/route.ts` |
| Build Perf | `apps/web/app/api/ops/build-performance/route.ts` |
| Ops Hub UI | `apps/web/app/(app)/ops/` |

---

## 📊 Coverage Status

```
Rate Limiting:  ████████░░░░░░░░░░░  41% (16/39)
SDK Factory:    ███████████░░░░░░░░  56% (22/39)
Sentry:         ███████████████████ 100% (global)
OTEL:           ███████████████████ 100% (global)
```

---

## 🔧 Common Commands

```bash
# Dev server
pnpm dev

# Run tests
pnpm test
pnpm test:e2e
pnpm test:rules

# Type check
pnpm typecheck

# Lint & format
pnpm lint
pnpm format

# Build
pnpm build
```

---

## 📋 Sprint Issues

| Issue | Description | Status |
|-------|-------------|--------|
| [#195](https://github.com/peteywee/fresh-root/issues/195) | Sprint Tracker | Active |
| [#196](https://github.com/peteywee/fresh-root/issues/196) | Redis Rate Limiting | ⚠️ Partial |
| [#197](https://github.com/peteywee/fresh-root/issues/197) | OpenTelemetry | ✅ Done (global) |
| [#198](https://github.com/peteywee/fresh-root/issues/198) | Env Validation | Not Started |
| [#199](https://github.com/peteywee/fresh-root/issues/199) | Mock→Firestore | ✅ Done |
| [#200](https://github.com/peteywee/fresh-root/issues/200) | Schema Fixes | Deferred |
| [#201](https://github.com/peteywee/fresh-root/issues/201) | Protocols | Reference |

---

## 🔗 Full Audits

- [Infrastructure Reality Audit](./reports/INFRASTRUCTURE_REALITY_AUDIT.md)
- [Implementation Tracker](./IMPLEMENTATION_TRACKER.md)
- [Fast Track to Production](./FAST_TRACK_TO_PRODUCTION.md)
