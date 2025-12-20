# L2 — Cloud Functions & Backend Services

> **Status:** Draft (repo-grounded fill).

This subsystem covers Firebase Cloud Functions (server-side backend logic), Firestore triggers, and
backend services that complement the Next.js web app.

## 1. Role in the System

- Provide trusted server-side operations that cannot safely run in the browser.
- Enforce atomic workflows (e.g., org join) and maintain denormalized data for read efficiency.
- Own the “backend of record” behaviors around Firestore data correctness.

Primary code locations:

- `functions/src/index.ts` (Cloud Functions v2 entrypoint).
- `functions/src/joinOrganization.ts` (atomic join flow).
- `functions/src/triggers/denormalization.ts` (Firestore triggers + scheduled reconciliation).
- `functions/src/domain/` (domain helpers used by backend code).

## 2. Panel Summary (Initial Pass)

- Distributed Systems (Elena): Trigger fan-out and retries are the main risks; design for idempotency.
- Security (Marcus): Backend runs with elevated privileges; guard all entrypoints and validate inputs.
- DDD (Ingrid): Keep domain logic in `functions/src/domain/` or shared packages; avoid logic in trigger wiring.
- Platform (Kenji): Treat functions as deployable units; keep cold-start, retries, and timeouts in mind.
- Staff Engineer (Priya): Centralize Firestore access patterns and validation helpers; keep code testable.
- Database (Omar): Denormalization triggers must preserve data consistency and be bounded in cost.
- API Design (Sarah): Prefer explicit, versionable server operations; document input/output schemas.
- Devil's Advocate (Rafael): Triggers can become invisible coupling; ensure observability and clear ownership.
- Strategic/Impact (Victoria): Correctness here is “business safety”; failures directly impact customer trust.

## 3. Critical Findings (Current)

No confirmed “Critical” items recorded in this doc yet.

Immediate correctness hotspots worth reviewing:

- Atomic join flow: `functions/src/index.ts` exports `joinOrganization` and documents transaction boundaries.
- Denormalization: `functions/src/index.ts` exports trigger functions from `functions/src/triggers/denormalization.ts`.

## 4. Architectural Notes & Invariants

- All function entrypoints are input-validated and safe to retry.
- Firestore-triggered handlers are idempotent (duplicate deliveries do not corrupt data).
- Denormalized fields must be derivable from source-of-truth documents; scheduled reconciliation exists as a safety net.
- Shared Firestore schema understanding lives in `packages/types/` (paths and Zod schemas).

Notable schema references:

- `packages/types/src/memberships.ts` documents membership paths and RBAC context.
- `packages/types/src/shifts.ts` and `packages/types/src/schedules.ts` document scheduling/shifts paths.

## 5. Example Patterns

- **Good Pattern Example:** Explicit entrypoint documentation and wiring in `functions/src/index.ts`.
- **Good Pattern Example:** Domain helpers (e.g., `functions/src/domain/billing.ts`) kept separate from trigger wiring.
- **Risky Pattern Example:** Trigger handlers that scan large collections or do unbounded fan-out.
- **Refactored Pattern:** Introduce small, shared libraries in `packages/` for validation and Firestore access to reduce duplication.

## 6. Open Questions

- Are Cloud Functions intended to be the only backend, or will there also be a separate service (Cloud Run / Workers)?
- Where should backend-only schemas live vs shared client/server schemas (`packages/types` vs `functions/src/domain`)?
- What is the expected trigger retry/idempotency policy for each exported function?

