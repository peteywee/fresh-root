# How to be immediately useful in this repository

This repo is a pnpm monorepo for a Next.js PWA backed by Firebase (auth, Firestore, Storage). The guidance below focuses on concrete, discoverable patterns and commands an AI coding agent should use when making or reviewing changes.

Code owner: patrick craven

 # How to be immediately useful in this repository

 This repository is a pnpm monorepo for a Next.js Progressive Web App (PWA) backed by Firebase (Auth, Firestore, Storage). The guidance below focuses on concrete, discoverable patterns and commands an AI coding agent or human contributor should use when making or reviewing changes.

 Code owner: Patrick Craven

 ## Monorepo & entrypoints
 - Root workflows use pnpm. From the repository root:
   - Install dependencies: `pnpm -w install --frozen-lockfile`
   - Dev server (recommended): `pnpm dev` (root runs the web app via `--filter @apps/web`). You can also run `cd apps/web && pnpm dev` to start only the web app.
   - Build everything: `pnpm -w build`
   - Type checking across workspaces: `pnpm -w typecheck`

 ## Where to look first
 - App UI and routes: `apps/web/app/` (Next.js App Router). Look at `apps/web/app/(app)/protected/page.tsx` and components in `apps/web/app/components` or `apps/web/components` for protected UI patterns.
 - Client utilities: `apps/web/src/lib/` (Firebase client helpers, HTTP utilities, React Query hooks like `useCreateItem.ts`). Also check `apps/web/lib/` (legacy/older helpers).
 - Server/admin Firebase usage: `apps/web/src/lib/firebase.server.ts` (and `firebaseClient.ts` variants) for admin SDK usage and env var expectations.
 - API validation: `apps/web/app/api/_shared/validation.ts` contains shared Zod schemas used by API routes.

 ## Key workflows & commands
 - Dev server: from repo root run `pnpm dev` (starts web on :3000 by default).
 - Firebase emulators locally: set `NEXT_PUBLIC_USE_EMULATORS=true` in `apps/web/.env.local` and run `firebase emulators:start` from the repository root. Use the seeder when needed: `pnpm tsx scripts/seed/seed.emulator.ts` or `pnpm sim:auth` for auth simulation.
 - Tests:

 ```text
 - Unit/fast tests: `pnpm test` (Vitest)
 - Firestore/Storage rules tests: `pnpm test:rules` (Jest with `jest.rules.config.js`, tests in `tests/rules/**/*.spec.ts`)
 - E2E tests: `pnpm test:e2e` (Playwright)
 ```

 - Typecheck: `pnpm -w typecheck` (runs across workspaces)

 ## Project conventions & patterns
 - Zod-first API validation: API routes should validate inputs with Zod. Prefer reusing schemas in `apps/web/app/api/_shared/validation.ts`.
 - React Query for server state: follow existing query-key patterns found in `apps/web/src/lib` (e.g., `['items']`).
 - Protected UI: prefer compositional `ProtectedRoute` components rather than ad-hoc checks around pages.
 - Firebase env vars live in `apps/web/.env.local` and use `NEXT_PUBLIC_FIREBASE_*` names for client-side config. Admin/server envs use `FIREBASE_ADMIN_*` variables.
 - Security rules: `firestore.rules` and `storage.rules` live at repo root. When changing rules, add/update tests under `tests/rules/` and deploy rules together: `firebase deploy --only firestore:rules,storage`.

 ## Notable integration points and gotchas
 - The repo pins/overrides `undici` in the root `package.json` (`overrides`/`pnpm.overrides`). Keep that in mind when troubleshooting Node HTTP clients.
 - PWA/service worker: see `apps/web/app/RegisterServiceWorker.tsx` and `apps/web/docs/SERVICE_WORKER.md` for registration and SW troubleshooting.
 - Seeders and emulator helpers: `scripts/seed/seed.emulator.ts` and `tools/sim/auth_sim.mts` are helpful examples for seeding test/emulator data.

 ## Examples to reference when writing code suggestions
 - API route with validation: `apps/web/app/api/items/route.ts` and `apps/web/app/api/_shared/validation.ts`.
 - Firebase client & emulator toggles: `apps/web/src/lib/firebaseClient.ts` or `apps/web/src/lib/firebase.client.ts` (search for `connectFirestoreEmulator`).
 - Protected route wrapper: `ProtectedRoute` components under `apps/web` (look for similar patterns when protecting new routes).

 ## Editing and testing checklist for PRs
 1. Run `pnpm -w install --frozen-lockfile` then `pnpm dev` and ensure the app boots locally.
 2. If you touch Firebase behavior, run emulator(s): `firebase emulators:start` with `NEXT_PUBLIC_USE_EMULATORS=true` and exercise `pnpm test:rules`.
 3. Run unit tests and typecheck before opening a PR: `pnpm test` and `pnpm -w typecheck`.
 4. If modifying security rules, add or update `tests/rules/` to cover access patterns.

 ## Hard repository rules (must follow for every change)
 - No deprecated dependencies: if `pnpm` prints a "deprecated" warning for any package during install, either replace the package or document why it remains; do not merge until addressed.
 - No unmet peer dependencies: resolve peer warnings by aligning versions or adding the required peers.
 - Pinned toolchain: use the pnpm version specified in the root `package.json` (`packageManager`) to avoid CI/lockfile churn.
 - Avoid deprecated editor or workspace settings; prefer current documented options.
 - Lockfile integrity: avoid incidental `pnpm-lock.yaml` changes; explain intentional lockfile updates in PR descriptions.
 - Auto-fix lint/format errors before commit/PR. Pre-commit and CI should prevent commits with known lint/format failures.

 ## Quick local checks before pushing
 - `pnpm -w install --frozen-lockfile` finishes without deprecated or peer-dependency warnings.
 - `pnpm -w typecheck` and `pnpm test` pass locally.
 - If you changed emulator-facing code, run `pnpm test:rules`.

 If you want deeper details on CI, deployment, or a particular package, say which area and I'll expand with examples and exact commands.

 ## Repo automations and one-click tasks

 Use the VS Code tasks (available from the repo root workspace) for consistent workflows.

 - Docs: Markdown Fix (apply)
   - Runs the repository markdown fixer (idempotent). Safe auto-fixes include fencing, heading normalization, blank-line hygiene, list spacing, and ordered list renumbering. Unordered list indentation is intentionally left alone to avoid MD005 regressions.
   - Equivalent CLI (optional):

 ```bash
 FILETAG_CLI=markdown.fix FILETAG_MODE=common FILETAG_DRYRUN=false FILETAG_LANGUAGE=text FILETAG_OL_STYLE=one node mcp/filetag-server.mjs
 ```

 - Tag: Auto-tag Files
   - Adds two-line header comments with `[PRIORITY][AREA][COMPONENT]` and a `Tags:` line.
   - Preserves and repairs shebang placement; inserts the tag header immediately after the shebang.
   - Skips tagging itself and ignores generated directories.
   - Usage:

 ```bash
 node scripts/tag-files.mjs --dry-run          # preview
 node scripts/tag-files.mjs                    # apply repo-wide
 node scripts/tag-files.mjs --path apps/web    # scope to a subtree
 ```

 - Pre-commit hook
   - Runs the tagging script then lint/format. Do not commit with broken tags or formatting. If a script has a shebang, it will be preserved.

 ## Quality gates for changes (including Copilot-authored)

 Before opening a PR, verify the following locally:
 - Dependencies: No deprecated packages and no unmet peer dependencies.
 - Typecheck: `pnpm -w typecheck` — should PASS.
 - Lint/format: `pnpm -w lint --fix` and Prettier — no remaining errors.
 - Emulator rules (when applicable): `pnpm test:rules` — ensure Firestore/Storage rule changes have test coverage.
 - Optional: Run “Docs: Markdown Fix (apply)” when touching `.md` files.

 ## Final notes
 - When making edits, prefer small, focused commits with clear PR descriptions describing why a lockfile or dependency change was necessary.
 - When in doubt about a change that affects production behavior, ask for a short design decision in the PR description and request reviews from the repo owner or relevant maintainers.

 ---

 (This file is maintained to help automated agents and contributors get productive quickly. If you see an inaccuracy in these instructions, send a small PR with the correction.)
  - Runs the tagging script and then lint/format. Do not commit with broken tags or formatting. If a script has a shebang, it will be preserved.

## Quality gates for changes (including Copilot-authored)

Every change must meet these gates locally before PR/push:

- Dependencies: No deprecated packages, no unmet peer dependencies.
- Typecheck: `pnpm -w typecheck` — PASS.
- Lint/format: `pnpm -w lint` and Prettier — PASS (no errors). Warnings should be addressed when they are actionable.
- Emulator rules (when applicable): `pnpm test:rules` — ensure Firestore/Storage rule changes are covered by tests.
- Optional: Run “Docs: Markdown Fix (apply)” when touching .md files.
