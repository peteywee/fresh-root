# CI Fix: PNPM Version Mismatch

## Issue

PR #29 (consolidate/all-features → dev) was failing CI with the error:

```text
Multiple versions of pnpm specified:
  - version 9 in the GitHub Action config with the key "version"
  - version pnpm@9.1.0 in the package.json with the key "packageManager"
Remove one of these versions to avoid version mismatch errors like ERR_PNPM_BAD_PM_VERSION
```

## Root Cause

GitHub Actions workflows (`.github/workflows/*.yml`) specified `version: 9` for the `pnpm/action-setup@v4` action, while `package.json` explicitly set `"packageManager": "pnpm@9.1.0"`.

The pnpm action now enforces exact version matching when `packageManager` is set in `package.json`.

## Solution

Updated all workflow files to use the exact version from `package.json`:

### Files Changed

1. `.github/workflows/eslint-ts-agent.yml` - Changed `version: 9` to `version: 9.1.0`
2. `.github/workflows/ci.yml` - Changed `version: 9` to `version: 9.1.0`
3. `.github/workflows/repo-agent.yml` - Changed `version: 9` to `version: 9.1.0`

### Commit

- **Branch**: consolidate/all-features (cherry-picked to dev)
- **Commit**: `6d2311a` on consolidate/all-features, `d28440f` on dev
- **Message**: `fix(ci): update pnpm version in workflows to match package.json (9.1.0)`

## Clarification on Reported Issues

User initially reported two failing workflows:

1. `app-runtime-guard` - **Not applicable**: This workflow only triggers on PRs to `main` branch, not `dev`
2. `ci/build` - **Actually**: The failing check was `lint-and-typecheck` from `ESLint + TypeScript Agent` workflow

The actual failure was the pnpm version mismatch preventing the workflow from even starting the lint/typecheck steps.

## Outcome

- ✅ PR #29 has been **MERGED** into dev
- ✅ All 3 workflow files updated with correct pnpm version
- ✅ Future CI runs will use pnpm@9.1.0 consistently
- ✅ dev branch is now in sync with all consolidated features

## Prevention

When updating pnpm version:

1. Update `package.json` `packageManager` field
2. Update all `.github/workflows/*.yml` files that use `pnpm/action-setup@v4`
3. Use the **exact version** (e.g., `9.1.0` not `9`)

## Related

- Previous fixes: `docs/TEST_FIXES_ROUND2.md`
- Branch consolidation: `docs/BRANCH_CONSOLIDATION.md`
