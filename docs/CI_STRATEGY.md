# CI & Scripts Strategy

Goal: make `main` CI fast, deterministic, and focused on production-grade checks while keeping expensive integration or emulator tests as manual/optional workflows.

Keep these checks in the fast CI (push/PR):

- Install dependencies (`pnpm -w install --frozen-lockfile`) — fail early on dependency issues.
- Typecheck (`pnpm -w typecheck`) — enforce API contracts.
- Lint (`pnpm -w lint`) — coding standards.
- Unit tests (fast): `pnpm -w test:safe` — run with memory limits and single worker where necessary.
- Build: `pnpm -w build` for the app(s) we ship to production.

Gate these heavy or environment-dependent checks behind manual workflow dispatch or on protected branches:

- Firestore rules tests (emulator) — heavy, require secrets, and can be flaky in CI.
- Full end-to-end Playwright/browser suites against full stack.
- Any long-running performance or stress tests.

Scripts housekeeping guidance

- Every `scripts` entry in `package.json` must correspond to at least one active workflow, developer shortcut, or documented maintenance task.
- Remove or archive one-off scripts into `archive/scripts/` with a short README referencing how to re-add them.
- Provide a minimal developer tasks file `docs/DEV_TASKS.md` describing `dev`, `build`, `test`, `emu` usage so newcomers don't rely on ad-hoc scripts.

Suggested canonical `package.json` script subset for main:

- `dev` — local dev for web app
- `build` — production build
- `typecheck` — tsc build
- `lint` — eslint checks
- `test` — fast unit tests
- `test:rules` — emulator rules tests (documented, but not run on every PR)

Next steps I can take now

1. Generate `docs/DEV_TASKS.md` with canonical developer commands.
2. Propose a PR that archives unused or rarely-used scripts into `archive/scripts/` and leaves a trimmed `package.json` on `main`.
