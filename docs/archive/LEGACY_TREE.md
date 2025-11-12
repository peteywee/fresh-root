# Legacy Tree (Archived)

## Why archived

This directory contains the former nested monorepo (`fresh-root/**`) that duplicated active code in:

- `apps/web`
- `packages/types`
- `functions`
- `firestore.rules` and other configs

## Canonical roots for v15

- **App (Next.js):** `apps/web/**`
- **Domain types/schemas:** `packages/types/**`
- **Infra/Admin service:** `services/api/**`
- **Cloud Functions (optional):** `functions/**` (only if actively deployed)

## Rules

- Nothing under `docs/archive/**` is part of the build or workspace.
- Do **not** import from this directory.
- If you need something from legacy, port it into the canonical trees through a PR, then delete the legacy copy.

## CI Enforcement

A CI job fails if new nested legacy trees are added again (e.g., `fresh-root/**` at repo root).
