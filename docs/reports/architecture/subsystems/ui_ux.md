# L2 — UI / UX — Fresh Schedules Front-End

> **Status:** Draft (repo-grounded fill).

This subsystem covers the Next.js web application, shared UI components, and client-side state.

## 1. Role in the System

- Provide the primary user experience for scheduling, onboarding, and operations.
- Consume Firebase/Auth/Firestore and backend services via typed helpers.
- Enforce UX consistency via shared component packages and config.

Key locations in this repo:

- Next.js app: `apps/web/` (App Router under `apps/web/app/`).
- Shared UI components: `packages/ui/src/`.
- Shared config constants: `packages/config/src/index.ts`.
- Client planning state: `apps/web/src/lib/store.ts`.

## 2. Panel Summary (Initial Pass)

- Distributed Systems (Elena): UI sits atop Firebase + functions; be explicit about loading states and eventual consistency.
- Security (Marcus): Client must never depend on secrets; rely on server/admin endpoints for privileged operations.
- DDD (Ingrid): Keep UI state separate from domain state; align domain schemas with `packages/types`.
- Platform (Kenji): Ensure build/runtime separation (instrumentation, env validation) and consistent configuration.
- Staff Engineer (Priya): Standardize patterns for API calls, error handling, and component composition.
- Database (Omar): UI should respect Firestore schema invariants and avoid ad-hoc collections.
- API Design (Sarah): Centralize API wrappers to keep contracts stable and mockable.
- Devil's Advocate (Rafael): Too much client-side state can cause drift and bugs; prefer server-validated sources-of-truth.
- Strategic/Impact (Victoria): UX is product; prioritize clarity, speed, and correctness.

## 3. Critical Findings (Current)

No confirmed “Critical” issues recorded in this doc yet.

Observed UI architecture surfaces:

- Ops dashboard UI exists (`apps/web/app/(app)/ops/`), including a client component with polling.
- Shared components are present in `packages/ui/src/` (Button, Card, Input, Modal).

## 4. Architectural Notes & Invariants

- Reusable components live in `packages/ui` and should not pull app-specific dependencies.
- Environment-driven config is centralized (`packages/config`, `packages/env`), not hard-coded in components.
- API/Firestore access should go through shared helpers to avoid duplication and inconsistent schemas.
- UI should provide explicit “no data” and “error” states for network-backed views.

## 5. Example Patterns

- **Good Pattern Example:** Shared UI primitives in `packages/ui/src/`.
- **Good Pattern Example:** Centralized config constants in `packages/config/src/index.ts`.
- **Risky Pattern Example:** Duplicated Firestore shapes between UI and shared types.
- **Refactored Pattern:** Use shared schemas from `packages/types` in UI forms and API wrappers.

## 6. Open Questions

- What is the canonical UI design system (tokens, components, accessibility requirements)?
- Which flows require offline support and conflict-aware sync?
- Where should cross-cutting UI concerns live (toasts, error boundaries, analytics hooks)?

