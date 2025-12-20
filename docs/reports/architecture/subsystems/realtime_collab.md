# L2 — Real-time Collaboration

> **Status:** Draft (repo-grounded fill).

This subsystem describes “multi-user, shared state” behaviors: concurrent schedule edits, shared
drafts, and any presence/locking/merge mechanics.

## 1. Role in the System

- Enable multiple users in the same org to work on schedules without losing updates.
- Provide near-real-time feedback (draft changes, comments, admin forms) when applicable.
- Define conflict resolution, optimistic concurrency, and audit trails.

In this repo, “collaboration primitives” are currently Firestore-backed data models and helpers:

- Firestore typed wrappers and patterns: `apps/web/src/lib/firebase/typed-wrappers.ts`.
- Schedule data helpers: `apps/web/src/lib/api/schedules.ts`.
- Onboarding drafts: `apps/web/src/lib/onboarding/adminFormDrafts.ts`.

## 2. Panel Summary (Initial Pass)

- Distributed Systems (Elena): Firestore concurrency and eventual consistency are the core; design for retries and conflicts.
- Security (Marcus): Collaboration data is org-scoped; ensure strict access controls and validate org membership.
- DDD (Ingrid): Model collaboration as explicit aggregates (Schedule Draft, Shift, Comment) with clear invariants.
- Platform (Kenji): Prefer patterns that work offline/spotty connections; avoid complex real-time infra unless needed.
- Staff Engineer (Priya): Standardize how client code reads/writes Firestore (wrappers, schema validation).
- Database (Omar): Define canonical document paths, indexes, and denormalized projections for fast reads.
- API Design (Sarah): If exposing APIs, ensure concurrency semantics are documented (ETags, version fields, etc.).
- Devil's Advocate (Rafael): “Real-time” is costly; validate product need before building presence/locking.
- Strategic/Impact (Victoria): Collaboration is a differentiator if done well; half-implemented collab is user-hostile.

## 3. Critical Findings (Current)

No confirmed “Critical” issues recorded in this doc yet.

Gaps to validate (current code suggests early-stage collaboration support):

- Client helpers use Firestore reads/writes; real-time listeners are not obvious in the scanned surfaces.
- Draft workflows exist (e.g., admin form drafts) and should define conflict rules.

## 4. Architectural Notes & Invariants

- All collaborative documents are org-scoped and access-controlled.
- Writes are validated against shared schemas (prefer `packages/types` Zod schemas).
- Conflict strategy is explicit (last-write-wins is acceptable only if documented and safe).
- Edits are auditable (who/when), especially for schedule publish/archival.

## 5. Example Patterns

- **Good Pattern Example:** Centralized Firestore access helpers (`apps/web/src/lib/api/schedules.ts`).
- **Risky Pattern Example:** Direct Firestore writes from many UI components without a shared wrapper/validation.
- **Refactored Pattern:** Introduce a shared “collab draft” schema and a single write API (client helper or backend endpoint) with validation + audit logging.

## 6. Open Questions

- What is the intended concurrency model for schedule edits (optimistic versioning, locks, or LWW)?
- Do we need real-time cursors/presence, or is “refresh on interval / on save” sufficient?
- Where should audit events live (Firestore `events` collection, Cloud Function triggers, or both)?

