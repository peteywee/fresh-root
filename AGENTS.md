# Repository Guidelines

Guide for Fresh Root (pnpm + Turbo). Start with `docs/INDEX.md` to ground yourself (`docs/RUNTIME_DOCUMENTATION_INDEX.md` for production); keep changes standards-aligned.

## Project Structure & Module Organization
- `apps/web/` — Next.js PWA (pages in `app/`, client code in `src/`, assets in `public/`).
- `services/api/` — API service (`src/`, `test/`).
- `functions/src/` — Firebase Cloud Functions; prefer emulators.
- `packages/*` — shared libs: `types`, `ui`, `env`, `config`, `rules-tests`, `mcp-server`.
- `tests/rules/` holds Firestore smoke tests; other specs live next to code as `*.test.*` or `*.spec.*`.
- `docs/` for standards/runbooks; `scripts/` for automation and CI helpers.

## Build, Test, and Development Commands
```
pnpm install --frozen-lockfile           # install (Node>=20.10, pnpm>=9.12)
pnpm dev                                 # web dev server
pnpm dev:api | pnpm dev:emulators        # API or Firebase emulators
pnpm lint && pnpm typecheck              # lint + TS
pnpm test | pnpm test:coverage           # Vitest; add coverage on behavior changes
pnpm rules:test | pnpm functions:test    # rules / functions suites
pnpm lint:patterns                       # target 90+ before PRs
pnpm build                               # production build
```

## Coding Style & Naming Conventions
- Prettier: 2 spaces, 100-char lines, semicolons, double quotes (`pnpm format:check`).
- ESLint: ordered imports (builtin/external → internal → relative), `prefer-const`, warn on `any`/unused vars; keep React hooks compliant.
- Schema-first: define/extend Zod models in `packages/types` and derive API/UI types (see `docs/CODING_RULES_AND_PATTERNS.md`).
- New or edited source files include the header block (file, purpose, layer, contracts, owner, tags) per `docs/standards/FILE_HEADER_STANDARD.md`.

## Testing Guidelines
- Vitest (node env) runs from `apps/**`, `services/**`, `packages/**`; keep specs close to code and cover happy path + guardrails.
- Use `pnpm rules:test` for Firestore rules and `pnpm functions:test` when touching functions. Document emulator/env needs.
- Use `pnpm test:coverage` for feature work; keep `pnpm lint:patterns` ≥90 for guard-main.

## Commit & Pull Request Guidelines
- Conventional commits (`fix: ...`, `docs: ...`, `chore: ...`) match history; keep commits small.
- Work on `dev`; open PRs to `dev` with a short summary, linked issue/ticket, and screenshots for UI changes. Note doc updates when applicable.
- Before pushing: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm lint:patterns` (≥90). `pnpm ci` bundles the gate.

## Security & Configuration Tips
- Derive `.env.local` from `.env.example` and keep secrets out of git. Check `turbo.json` when wiring new config.
- Prefer `pnpm dev:emulators` for Firebase work; avoid touching production projects from local builds.
- Only ship public-safe assets to `apps/web/public`; internal docs and notes belong in `docs/`.
