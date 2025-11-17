# Developer Tasks & Canonical Commands

This file lists the small set of canonical developer commands that should be kept on `main`. The goal is a minimal, discoverable surface for contributors — archive one-off or maintenance scripts in `archive/scripts/` with a short README.

Quick start (most common):

- Install dependencies (workspace):
  - `pnpm -w install --frozen-lockfile`

- Start web app (local development):
  - `pnpm --filter @apps/web dev`

- Typecheck (fast check):
  - `pnpm -w typecheck`

- Lint (quick):
  - `pnpm -w lint`

- Build (production build for published app):
  - `pnpm -w build`

- Run fast unit tests (CI safe):
  - `pnpm -w test:safe`

- Firestore emulator (local, developer use):
  - `pnpm emu` or `firebase emulators:start` (requires `firebase-tools` and local `.env`)

- Run Firestore rules tests (developer/emulator):
  - `pnpm test:rules:dev` (note: heavy; gated in CI)

Housekeeping guidance

- Keep `package.json` scripts minimal and map each to one of the canonical tasks above.
- Move scripts that are one-off or used only for maintenance (seeding, large exports, dumps, archive processing) to `archive/scripts/` and add an `archive/scripts/README.md` explaining usage.
- Document environment variables and emulator usage in `apps/web/.env.example` and `docs/DEV_TASKS.md`.

Developer workflow checklist

1. Pull latest `main`.
2. Run `pnpm -w install --frozen-lockfile`.
3. Run `pnpm -w typecheck` and `pnpm -w lint` — fix issues locally.
4. Run `pnpm --filter @apps/web dev` to test UI locally.

If a script is missing from `main` but needed temporarily, add it in a feature branch and remove it after the task is complete or move it to `archive/scripts/` with a README.

---

Small, practical next steps I can take now:

1. Produce a candidate list of `package.json` scripts to archive and commit them into `archive/scripts/` (with backups). I will not modify `main` scripts until you approve the list.
2. Create a PR branch `chore/archive-scripts` with the proposed changes and documentation.
