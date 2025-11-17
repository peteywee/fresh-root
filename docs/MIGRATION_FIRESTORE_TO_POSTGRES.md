# Migration Practice: Firestore → Postgres (Supabase)

This document is a lightweight playbook to avoid being locked into Firestore-specific patterns and to prepare the codebase for a future migration to Postgres (Supabase). The goal is practice and incremental changes now so migration is feasible later.

Principles

- Data model portability: avoid embedding Firestore-only idioms (document path logic, collection group assumptions) in business logic. Encapsulate data access behind repository/adapters.
- Explicit contracts: use Zod schemas (already used in APIs) for every API boundary and persist both Firestore and Postgres mapping in the adapter layer.
- Isolate provider-specific code: create a single `src/lib/db/*` adapter surface with implementations for Firestore and Postgres.
- Test both paths: keep lightweight tests that use adapter mocks; keep heavy emulator tests gated (manual) in CI.

High-level migration steps (future work)

1. Add adapter interface
   - Create `src/lib/db/adapter.ts` defining CRUD + query interfaces used by services. Keep signatures DB-agnostic.
   - Implement `firestoreAdapter` that calls existing Firestore helpers.
   - Implement `postgresAdapter` (PoC) that uses `pg` or `supabase-js` to exercise flows.

2. Lift domain logic from raw DB calls
   - Refactor code to depend on `dbAdapter` injected via DI or a small factory. No business logic should call Firestore SDK directly.

3. Export data & transform
   - Export Firestore collections (BigQuery export / node scripts using admin SDK) to JSON/CSV.
   - Write transformation scripts that map Firestore documents -> relational tables (normalize embedded arrays, expand join tokens, map timestamps).

4. Seed Postgres (Supabase)
   - Create `migrations/` SQL to create tables and indexes.
   - Use `pg`/`supabase` client to bulk-import transformed rows.

5. Cutover strategy
   - Start with read-only mirror: write to Firestore still, but read from Postgres for a subset of endpoints.
   - Gradual writes: add dual-write adapters (write to both DBs) behind feature flags.
   - Final cutover: switch primary writes to Postgres and decommission Firestore after validating integrity.

Testing & CI

- Keep unit tests focused on domain logic (db-agnostic). Use adapter mocks for unit tests.
- Keep emulator-based rules tests gated behind manual workflows (they are expensive but valuable). We've already gated them in CI.
- Add small integration job that runs Postgres-based adapter PoC on a lightweight hosted Supabase instance (optional manual workflow).

Security & Auth

- Map Firebase auth claims to Postgres roles/columns. Keep an auth translation layer when switching.
- Consider Row Level Security (RLS) policies in Postgres to mirror Firestore rule intent.

Operational notes

- Backups: always keep exports from Firestore until you're confident in Postgres data integrity.
- Indexing: translate Firestore indexes to appropriate SQL indexes and test query plans.

Start small: the most valuable immediate step is to create the adapter interface and refactor a handful of endpoints to use it. That will document the unknowns and prove the path.

References & next steps

- Draft an adapter interface PR that moves one read endpoint to use `dbAdapter`.
- Build a small `scripts/export-firestore.js` utility to export collections used by the chosen endpoint.

---

_This is a living document. Add concrete commands, example scripts, and migration artifacts as you proceed._
