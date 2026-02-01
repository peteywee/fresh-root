---

title: "[ARCHIVED] Deprecated npm Scripts"
description: "Archived list of deprecated npm scripts and migration notes."
keywords:
   - archive
   - scripts
   - deprecations
category: "archive"
status: "archived"
audience:
   - developers
   - operators
createdAt: "2026-01-31T07:18:56Z"
lastUpdated: "2026-01-31T07:18:56Z"

---

# Deprecated npm Scripts

**Last Updated:** December 25, 2025

This document tracks deprecated npm scripts and the rationale for their removal.

---

## Removed Scripts (v1.5.0 - December 25, 2025)

### `test:all`

**Status:** ❌ REMOVED

**Deprecated:** December 25, 2025

**Rationale:**

- Rarely used in practice — developers run specific test suites (`test:unit`, `test:e2e`, etc.)
- Combining all tests is inefficient (different setups, timing concerns)
- Modern approach: run specific suites in CI pipelines or use `pnpm test` for default behavior

**Migration:**

```bash
# Old: pnpm test:all
# New: Use specific suite
pnpm test:unit      # Unit tests
pnpm test:e2e       # End-to-end tests
pnpm test:integration  # Integration tests
```

---

### `deps:check`

**Status:** ❌ REMOVED

**Deprecated:** December 25, 2025

**Rationale:**

- Duplicated functionality from `pnpm audit` (security checking)
- Rarely invoked manually — audit typically run in CI automatically
- Added complexity without clear value

**Migration:**

```bash
# Old: pnpm deps:check
# New: Use pnpm built-ins
pnpm audit              # Security audit (same functionality)
pnpm ls --depth=0       # List dependencies
```

---

### `deps:dedupe`

**Status:** ❌ REMOVED

**Deprecated:** December 25, 2025

**Rationale:**

- pnpm handles deduplication automatically during lockfile operations
- Manual dedup script was redundant — pnpm dedupes on install/update
- No maintenance burden, but zero practical benefit

**Migration:**

```bash
# Old: pnpm deps:dedupe
# New: Let pnpm handle it automatically
pnpm install           # Auto-dedupes during install
# Or manually trigger:
pnpm install --force-peer-deps
```

---

## Active Scripts (Kept)

These scripts remain and are actively maintained:

### Core Scripts

- `pnpm dev` — Start development server
- `pnpm build` — Build all packages
- `pnpm build:sdk` — Build SDK-specific artifacts
- `pnpm test` — Default test behavior
- `pnpm test:unit` — Run unit tests
- `pnpm test:e2e` — Run end-to-end tests
- `pnpm test:playwright` — Playwright browser tests
- `pnpm test:integration` — Integration tests
- `pnpm test:rules` — Firestore rules testing

### Quality & Guardrails

- `pnpm lint` — Run ESLint
- `pnpm lint:fix` — Auto-fix lint violations
- `pnpm format` — Format code (Prettier)
- `pnpm typecheck` — TypeScript checking
- `pnpm check` — **\[NEW]** Run lint:fix + workspace:check + typecheck (one command)
- `pnpm guardrails` — Run all guardrail checks
- `pnpm guardrails:fix` — Auto-fix guardrail violations

### Workspace & Dependencies

- `pnpm workspace:check` — Validate workspace consistency (@manypkg/cli)
- `pnpm workspace:fix` — Auto-fix workspace issues
- `pnpm deps:sync` — Sync dependency versions across packages
- `pnpm deps:sync:check` — Validate dependency sync (CI-safe)
- `pnpm deps:analyze` — Analyze dependency tree

### Validation & Pre-commit

- `pnpm validate:pre-commit` — Run pre-commit checks (handler validation, typecheck, lint)
- `pnpm validate:pre-push` — Run pre-push checks (typecheck, lint, Repomix)
- `pnpm validate:full` — Run comprehensive validation suite
- `pnpm validate:all` — Alias for validate:full

---

## Governance Rules

**Script Proposal Workflow:**

Before adding new npm scripts, check:

1. **Is it a one-liner?** Add it. (e.g., `"clean": "turbo run clean"`)
2. **Does it combine 2+ scripts?** Create an alias with clear naming. (e.g.,
   `"check": "pnpm lint:fix && pnpm workspace:check && pnpm typecheck"`)
3. **Is it rarely used?** Don't add it — document the manual command instead.
4. **Does it duplicate existing tools?** Use the existing tool. (e.g., don't create `deps:check`
   when `pnpm audit` exists)

**Criteria for Removal:**

- Never used in CI/CD pipelines
- Duplicates functionality of built-in tools or other scripts
- Maintenance burden > benefit
- Team hasn't invoked it in 3+ months

**Preventing Re-introduction:**

- Pre-commit hook blocks attempts to add `test:all`, `deps:check`, `deps:dedupe`
- See `.husky/pre-commit` for implementation
- Document removal reason in this file (done above)

---

## Future Deprecations (Under Review)

Currently evaluated for removal (not yet deprecated):

- None at this time

See [GUARDRAILS_SCRIPTS.md](./guides/GUARDRAILS_SCRIPTS.md) for full script reference.
