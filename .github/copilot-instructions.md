# How to be immediately useful in this repository

This repo is a pnpm monorepo for a Next.js PWA backed by Firebase (auth, Firestore, Storage). The guidance below focuses on concrete, discoverable patterns and commands an AI coding agent should use when making or reviewing changes.

Code owner: pateick craven

- Monorepo & entrypoints
  - Root: `pnpm` is the primary tool. Use `pnpm install` then `pnpm dev` to start the primary developer flow.
  - `pnpm dev` from root runs the web app dev server via `--filter @apps/web` (see root `package.json` script).
  - Build everything with `pnpm build`. Type checking: `pnpm typecheck`.

- Where to look first
  - App UI and routes: `apps/web/app/` (Next.js app router). Protected UI examples: `apps/web/app/(app)/protected/page.tsx` and components in `apps/web/app/components` or `apps/web/components`.
  - Client utilities: `apps/web/src/lib/` (Firebase client, http helpers, React Query hooks like `useCreateItem.ts`). Also `apps/web/lib/` (older location) — scan both when searching for helpers.
  - Server/admin Firebase usage: `apps/web/src/lib/firebase.server.ts` (or `firebaseClient.ts` variants). Use these files to find admin SDK patterns and env variable expectations.
  - API route validation: `apps/web/app/api/_shared/validation.ts` (Zod schemas used across API routes).

- Key workflows & commands (explicit)
  - Dev server: from repo root run `pnpm dev` (starts web on :3000). You can also `cd apps/web && pnpm dev`.
  - Use Firebase emulators locally: set `NEXT_PUBLIC_USE_EMULATORS=true` in `apps/web/.env.local` and run `firebase emulators:start` from the project root. Seeder: `pnpm tsx scripts/seed/seed.emulator.ts` (or `pnpm sim:auth` for auth sim).
  - Tests:

```text
- Unit/fast tests: `pnpm test` (runs Vitest).
- Rules tests (Firestore/storage): `pnpm test:rules` — runs Jest with `jest.rules.config.js` (matches `tests/rules/**/*.spec.ts`).
- E2E: `pnpm test:e2e` (Playwright).
```

- Typecheck: `pnpm typecheck` (root runs across workspaces).

- Project-specific conventions & patterns
  - Zod-first API validation: API routes validate inputs with Zod; prefer reusing `app/api/_shared/validation.ts` schemas when adding endpoints.
  - React Query for server state: look for hooks in `apps/web/src/lib` and follow existing query key patterns (e.g., `['items']`).
  - Protected UI: `ProtectedRoute` components are used to guard pages — prefer compositional use rather than ad-hoc auth checks.
  - Firebase env vars live in `apps/web/.env.local` and follow `NEXT_PUBLIC_FIREBASE_*` names. Admin keys (server) are provided via `FIREBASE_ADMIN_*` env vars when using server-side admin SDK.
  - Security rules live at project root: `firestore.rules` and `storage.rules`. Changes to rules should be reflected in tests under `tests/rules/` and deployed with `firebase deploy --only firestore:rules,storage`.

- Notable integration points & gotchas
  - The repository pins/overrides `undici` at the root `package.json` (see `overrides`/`pnpm.overrides`). Keep this in mind when troubleshooting HTTP client issues in Node environments.
  - Service worker & PWA bits: See `apps/web/app/RegisterServiceWorker.tsx` and `apps/web/docs/SERVICE_WORKER.md`.
  - Seeding and emulator helpers: `scripts/seed/seed.emulator.ts` and `tools/sim/auth_sim.mts` provide examples for seeding auth and test data into emulators.

- Examples to reference in code suggestions
  - API route with validation: `apps/web/app/api/items/route.ts` and shared validation at `apps/web/app/api/_shared/validation.ts`.
  - Firebase client connection and emulator toggles: `apps/web/src/lib/firebaseClient.ts` or `apps/web/src/lib/firebase.client.ts` created by `setup.sh` (search for `connectFirestoreEmulator`).
  - Protected route wrapper: `apps/web/components/ProtectedRoute.tsx` (also mirrored in `src/components/auth/ProtectedRoute.tsx` in some test fixtures).

- Editing and testing checklist for PRs (useful to keep in mind when authoring code)
  1. Run `pnpm install` then `pnpm dev` and ensure the app boots locally.
  1. If touching Firebase behavior, run emulators: `firebase emulators:start` with `NEXT_PUBLIC_USE_EMULATORS=true` and run relevant rules tests (`pnpm test:rules`).
  1. Run `pnpm test` (Vitest) and `pnpm typecheck` before opening a PR.
  1. When modifying security rules, add or update files in `tests/rules/` to cover access patterns.

- Hard repository rules (must follow for every change)
  - No deprecated dependencies allowed: If pnpm prints a "deprecated" warning for any package during install or list, do not merge until replaced/removed.
  - No unmet peer dependencies allowed: Resolve all peer warnings by aligning versions or adding the required peers; do not ignore.
  - Pinned toolchain: Use the exact pnpm version pinned in the root `package.json` (`packageManager`). Keep workflows in sync.
  - No deprecated editor/workspace settings: avoid adding deprecated VS Code or ESLint settings. Prefer documented, current options.
  - Lockfile integrity: Avoid incidental `pnpm-lock.yaml` churn; explain intentional changes in PR description.

  - All lint/format errors must be auto-fixed before commit or PR, in any language. If a tool can auto-fix on save or pre-commit, prefer that. Copilot and all contributors must never leave markdown, code, or config files with known lint/format errors.

- Quick local checks before pushing
  - `pnpm install` from repo root completes with zero deprecated or peer-dependency warnings.
  - `pnpm typecheck` and `pnpm test` pass locally.
  - If emulator-facing code changed, run `pnpm test:rules`.

If anything below is unclear or you want deeper detail on a particular area (CI, deploy, or a specific package), tell me which area and I'll expand or merge in more examples from the codebase.
