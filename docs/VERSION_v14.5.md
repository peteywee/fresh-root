# Fresh Schedules — Version 14.5 (Stabilization Patch)
**Date:** 2025-11-12 (America/Chicago)

## Objective
Deliver immediate, no-Node fixes: add missing schemas, ensure exports exist, fix public logo, codify route standards, provide bash-only guard refactor helper, and stage a minimal PR guard.

## Why
We had parity errors (missing schemas/exports), a noisy `/logo.svg` 404, inconsistent route imports (guards/telemetry), and no single written standard. v14.5 resolves all items that don’t require Node execution and sets a stable base ahead of v15.

## Scope
- New schemas: `messages`, `receipts`, `compliance`.
- Exports: append `corporates`, `widgets`, and new schemas to `packages/types/src/index.ts`.
- Asset: add `apps/web/public/logo.svg`.
- Standard: `docs/standards/ROUTE_STANDARD.md`.
- Helper: `scripts/sh/refactor-guards.sh` to inject missing imports across routes.
- CI: `.github/workflows/pr.yml` (path guard active; Node steps commented for now).

## Current State (pre-v14.5)
- Parity errors: 5 (3 missing schemas; 2 missing exports).
- Multiple routes lacked guard/telemetry/error helper imports.
- `/logo.svg` occasionally 404 in logs.
- No explicit written route standard.

## Changes in v14.5
1. **Schemas added**: `packages/types/src/{messages.ts,receipts.ts,compliance.ts}`.
2. **Index exports appended** safely via shell (no overwrite).
3. **Public asset**: `apps/web/public/logo.svg`.
4. **Standards doc**: `docs/standards/ROUTE_STANDARD.md`.
5. **Refactor helper (bash)**: `scripts/sh/refactor-guards.sh` (DRY by default).
6. **CI skeleton**: `.github/workflows/pr.yml` with a path guard for `main`.

## Commands
See repository README snippet (v14.5 section) and the rollout:

- Apply heredocs (copy/paste).
- Append exports via `grep || echo` lines.
- Optional: run `scripts/sh/refactor-guards.sh` (DRY) then `DRY=0` to apply.

## Acceptance Criteria
- Files exist as specified.
- Index exports appended.
- `/logo.svg` served.
- Route standard doc committed.
- Bash helper present and executable.

## Success KPIs
- Parity “missing schema/export” errors drop to zero on next parity run.
- No further `/logo.svg` 404s in local logs.
- Guard/telemetry import gaps reduced after running helper.

## Definition of Done
- v14.5 committed to `develop`.
- Green baseline maintained; v15 planning proceeds using this as foundation.

## Next (v15 Planning Only)
- Node-backed refactor (withGuards wrappers, rate-limit wiring).
- Telemetry resource attributes with git SHA.
- API integration tests per route; E2E golden path.
- CI: enable Node steps and block on test matrix.
