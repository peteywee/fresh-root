# L2 — Metrics, Logging, Observability

> **Status:** Draft (repo-grounded fill).

This subsystem covers runtime instrumentation, error reporting, and operational dashboards.

## 1. Role in the System

- Detect and diagnose production issues (errors, latency, startup failures).
- Provide operational visibility (health checks, CI/build performance history, codebase analysis).
- Ensure observability does not block builds/deploys.

Key locations in this repo:

- Next.js instrumentation entrypoint: `apps/web/instrumentation.ts`.
- Sentry configuration: `apps/web/sentry.server.config.ts` (and client/edge variants).
- Ops dashboard client: `apps/web/app/(app)/ops/OpsClient.tsx`.
- Ops API endpoint: `apps/web/app/api/ops/build-performance/route.ts`.
- Metrics logs: `docs/metrics/` (e.g. `docs/metrics/build-performance.log`).

## 2. Panel Summary (Initial Pass)

- Distributed Systems (Elena): Metrics data can come from GitHub API and local files; plan for partial outages and caching.
- Security (Marcus): Admin-only ops endpoints must remain admin-gated; tokens must not be exposed to clients.
- DDD (Ingrid): Treat “observability” as a platform concern; keep it separate from product domain logic.
- Platform (Kenji): Instrumentation must not run during build; startup must be fast and predictable.
- Staff Engineer (Priya): Standardize logging shape and error envelopes across ops endpoints.
- Database (Omar): Metrics storage is file-based today; decide if/when to persist in Firestore or another store.
- API Design (Sarah): Ops endpoints should return stable JSON and clear error semantics.
- Devil's Advocate (Rafael): “Ops UI” can drift and become misleading; ensure the source-of-truth is well-defined.
- Strategic/Impact (Victoria): Observability is a multiplier for velocity and reliability; prioritize correctness over breadth.

## 3. Critical Findings (Current)

No confirmed “Critical” incidents recorded in this doc yet.

Notable correctness/safety guard already present:

- `apps/web/instrumentation.ts` explicitly skips instrumentation initialization during build to prevent hangs and network I/O.

High-priority review targets:

- Ensure admin gating is consistently applied on ops endpoints (e.g. `createAdminEndpoint` usage).
- Ensure metrics fetch paths are stable and resilient (`docs/metrics/build-performance.log` read via GitHub API or local file fallback).

## 4. Architectural Notes & Invariants

- Instrumentation must never block `next build`.
- Ops endpoints must be admin-gated and org-scoped.
- Logs/metrics must not contain secrets or sensitive PII.
- Observability should degrade gracefully (no-data states are normal; errors are explicit).

## 5. Example Patterns

- **Good Pattern Example:** Build-phase guard in `apps/web/instrumentation.ts`.
- **Good Pattern Example:** JSONL parsing with validation and bounded limits in `apps/web/app/api/ops/build-performance/route.ts`.
- **Risky Pattern Example:** Any client-exposed endpoint that can proxy privileged GitHub reads without admin gating.
- **Refactored Pattern:** Define a shared “metrics schema” package or module so Ops UI and APIs stay in sync.

## 6. Open Questions

- Should metrics/logs be stored in GitHub-backed `docs/metrics/`, Firestore, or a dedicated metrics store?
- What is the retention policy for build performance logs and codebase analysis snapshots?
- Do we want OTEL fully enabled in production, or keep the current “opt-in / deferred init” approach?

