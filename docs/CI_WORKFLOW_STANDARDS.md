# CI Workflow Standards

This document defines the canonical pattern for GitHub Actions workflows in this repository. All CI and automation workflows **MUST** follow these conventions to ensure consistent quality gates, predictable behavior, and maintainable automation.

## Core Principles

1. **Standardized tooling setup**: Use pinned versions of PNPM (9.1.0) and Node.js (20).
2. **Auto-fix before enforce**: Run format+lint fixes before strict checks to reduce noise.
3. **Non-blocking typecheck**: Typecheck failures log warnings but don't fail CI (allows incremental migration).
4. **Fail fast on critical gates**: Lint (after auto-fix), tests, and builds MUST pass.
5. **Consistent step naming**: Use clear, action-oriented step names (e.g., "Format & Lint (auto-fix)").

---

## Standard CI Job Template

All workflows that run quality gates (lint/format/typecheck/test/build) MUST follow this step order:

```yaml
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      # 1. Checkout with full history for accurate diffs
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      # 2. Tooling setup (PNPM + Node.js)
      - name: Use PNPM
        uses: pnpm/action-setup@v4
        with:
          version: 9.1.0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      # 3. Optional: Cache external tools (Firebase emulators, etc.)
      - name: Cache Firebase Emulators
        uses: actions/cache@v4
        with:
          path: ~/.cache/firebase/emulators
          key: ${{ runner.os }}-firebase-emulators-${{ hashFiles('firebase.json') }}
          restore-keys: |
            ${{ runner.os }}-firebase-emulators-

      # 4. Install dependencies (frozen lockfile for determinism)
      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      # 5. Auto-fix formatting and linting issues (ephemeral in CI)
      - name: Format & Lint (auto-fix)
        run: pnpm -w fix

      # 6. Enforce lint after auto-fix (strict, must pass)
      - name: Lint (strict)
        run: pnpm -w lint

      # 7. Typecheck (non-blocking: logs errors but doesn't fail CI)
      - name: Typecheck (non-blocking)
        run: pnpm -w typecheck
        continue-on-error: true

      # 8. Run unit/integration tests (must pass)
      - name: Test
        run: pnpm -w test --if-present

      # 9. Build the monorepo (must pass)
      - name: Build (monorepo)
        run: pnpm -w -r build

      # 10. Optional: additional checks (rules tests, E2E, etc.)
      - name: Rules Tests
        run: pnpm -w test:rules:ci

      # 11. Cleanup (informational)
      - name: Post job cleanup
        if: always()
        run: echo "CI job finished"
```

---

## Step-by-Step Rationale

### 1. Checkout (`fetch-depth: 0`)
- **Why**: Full history allows accurate `git diff` in guard workflows and proper base comparison for PRs.
- **When to override**: For artifact-only workflows (e.g., release builds), `fetch-depth: 1` is acceptable.

### 2. Tooling Setup (PNPM 9.1.0 + Node 20)
- **Why**: Pinned versions eliminate "works on my machine" issues and ensure reproducibility.
- **Rule**: Always use `pnpm/action-setup@v4` with version `9.1.0` (matches `packageManager` in `package.json`).

### 3. Caching (Optional but Recommended)
- **Why**: Speeds up CI by reusing emulator binaries, build artifacts, or dependencies.
- **Best practice**: Use `${{ hashFiles(...) }}` for cache keys to invalidate on config changes.

### 4. Install Dependencies (`--frozen-lockfile`)
- **Why**: Ensures exact dependency versions from `pnpm-lock.yaml`; fails if lockfile is out of sync.
- **Never**: Use `pnpm install` without `--frozen-lockfile` in CI.

### 5. Format & Lint (auto-fix)
- **Command**: `pnpm -w fix` (runs `eslint --fix` + `prettier --write`)
- **Why**: Auto-corrects trivial issues (trailing whitespace, import order, etc.) before strict enforcement.
- **Note**: Changes are ephemeral in CI; developers must run `pnpm fix` locally before committing.

### 6. Lint (strict)
- **Command**: `pnpm -w lint`
- **Why**: Enforces code quality; must pass after auto-fix step.
- **Failure behavior**: Hard fail (blocks merge).

### 7. Typecheck (non-blocking)
- **Command**: `pnpm -w typecheck` with `continue-on-error: true`
- **Why**: Logs type errors for visibility but doesn't block CI during incremental TypeScript migration.
- **Future**: Remove `continue-on-error` once all type errors are resolved.

### 8. Test
- **Command**: `pnpm -w test --if-present`
- **Why**: Runs unit and integration tests across the monorepo.
- **Failure behavior**: Hard fail (critical quality gate).

### 9. Build
- **Command**: `pnpm -w -r build`
- **Why**: Validates that all packages/apps compile successfully.
- **Failure behavior**: Hard fail (broken builds never reach production).

### 10. Additional Checks (Optional)
- Examples: `test:rules:ci` (Firestore security rules tests), E2E tests, deployment previews.
- **Rule**: Only include if the workflow's purpose requires them (e.g., PR checks, not label syncs).

### 11. Post Job Cleanup
- **Why**: Informational log to mark job completion; useful for debugging long-running workflows.
- **Best practice**: Use `if: always()` to ensure it runs even on failure.

---

## Workflow Categories and Required Steps

### Category: PR Validation (e.g., `ci.yml`)
- **Triggers**: `pull_request` to `main` or `develop`
- **Required steps**: 1–9 (checkout → build)
- **Optional**: 10 (rules tests, E2E)
- **Example**: `.github/workflows/ci.yml`

### Category: Automation Agents (e.g., `repo-agent.yml`, `eslint-ts-agent.yml`)
- **Triggers**: `workflow_dispatch`, `issue_comment`
- **Required steps**: 1–7 (checkout → typecheck)
- **Optional**: Custom agent logic, auto-commit results
- **Rule**: Must run `pnpm -w fix` before any git operations to avoid conflicts.
- **Example**: `.github/workflows/repo-agent.yml`

### Category: Guard Workflows (e.g., `path-guard.yml`, `app-runtime-guard.yml`)
- **Triggers**: `pull_request` (any activity)
- **Required steps**: 1–2 only (checkout + diff calculation)
- **Optional**: Lint/typecheck if the guard applies changes
- **Rule**: Never fail hard on allowlist misses if the workflow is informational.

### Category: Scheduled Maintenance (e.g., `update-deps.yml`)
- **Triggers**: `schedule`, `workflow_dispatch`
- **Required steps**: 1–6 (checkout → lint)
- **Optional**: 7–9 if the workflow produces artifacts (e.g., dependency updates)
- **Rule**: Use `continue-on-error: true` for non-critical steps to avoid noise in scheduled runs.

---

## Common Patterns and Anti-Patterns

### ✅ DO
- Use `pnpm -w <script>` to run root workspace scripts (e.g., `pnpm -w lint`).
- Pin tool versions (`pnpm@9.1.0`, `node@20`, `actions/checkout@v4`).
- Add `continue-on-error: true` for informational-only steps (e.g., non-blocking typecheck).
- Use `if: always()` for cleanup/notification steps.
- Cache dependencies and external tools (emulators, playwright browsers).

### ❌ DON'T
- Run `pnpm install` without `--frozen-lockfile` in CI.
- Skip `pnpm -w fix` in workflows that modify code (leads to lint failures).
- Use `|| true` instead of `continue-on-error: true` (obscures exit codes in logs).
- Omit `fetch-depth: 0` in workflows that compute diffs or use git history.
- Hard-code Node/PNPM versions in workflows (always reference `package.json#packageManager` or a central config).

---

## Migration Checklist for Existing Workflows

When updating a workflow to match this standard:

- [ ] Add `pnpm/action-setup@v4` with `version: 9.1.0`.
- [ ] Replace `actions/setup-node@v3` with `v4` and add `cache: "pnpm"`.
- [ ] Add `Format & Lint (auto-fix)` step before strict lint.
- [ ] Add `Typecheck (non-blocking)` step with `continue-on-error: true`.
- [ ] Ensure `pnpm install --frozen-lockfile` is used (not `pnpm install`).
- [ ] Verify step names match the standard template (e.g., "Lint (strict)", not "Run lint").
- [ ] Remove redundant steps (e.g., duplicate `pnpm -w prettier --check` if `pnpm -w fix` already ran).
- [ ] Test the workflow on a draft PR before merging.

---

## Examples

### Minimal PR Validation Workflow
```yaml
name: CI (minimal)
on:
  pull_request:
    branches: ["main"]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: pnpm/action-setup@v4
        with: { version: 9.1.0 }
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - run: pnpm -w fix
      - run: pnpm -w lint
      - run: pnpm -w typecheck
        continue-on-error: true
      - run: pnpm -w test --if-present
      - run: pnpm -w build
```

### Agent Workflow with Auto-Commit
```yaml
name: Auto-fix Agent
on:
  issue_comment:
    types: [created]

jobs:
  fix:
    if: contains(github.event.comment.body, '/autofix')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0, ref: ${{ github.head_ref }} }
      - uses: pnpm/action-setup@v4
        with: { version: 9.1.0 }
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - run: pnpm -w fix
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: auto-fix lint/format issues"
          branch: ${{ github.head_ref }}
```

---

## Enforcement

- **Pre-commit hooks**: Run `pnpm fix` and `pnpm typecheck` locally via Husky.
- **PR review**: Maintainers MUST verify workflows follow this standard before approving infrastructure changes.
- **Automated checks**: The `path-guard.yml` workflow blocks non-compliant `.github/workflows/*` changes unless labeled `allow:workstation` or `check:off`.

---

## Revision History

| Date       | Author         | Change Summary                                                      |
|------------|----------------|---------------------------------------------------------------------|
| 2025-11-07 | GitHub Copilot | Initial version: standardized step order, non-blocking typecheck    |

---

## Questions or Exceptions?

If a workflow requires deviation from this standard (e.g., specialized deployment workflows, external integrations), document the reasoning in a comment at the top of the workflow file and link to this guide.

For questions, open an issue labeled `docs` or `ci`.
