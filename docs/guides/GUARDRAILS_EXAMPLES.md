# Guardrails: Practical Examples

Real-world scenarios and how to handle them with the guardrail tools.

---

## Scenario 1: You Make a Cross-Package Import

**Situation:** You're working on `api-framework` and need to use a type from `types` package.

### ❌ What You Might Do (Wrong)

```typescript
// packages/api-framework/src/index.ts
import type { OrgRole } from "../../types/src/rbac"; // Relative path
```

### What Happens

**In development:** Works fine, TypeScript finds the type.

**After `pnpm build`:**

- tsup bundles api-framework
- The bundle looks for `../../types/src/rbac` relative to dist/
- File doesn't exist at that path
- Build succeeds but runtime fails ❌

### How Guardrails Catch It

**Immediately on save** (if using ESLint extension):

```
❌ eslint error: Relative imports from parent packages
   are not allowed. Did you mean to import from
   "@fresh-schedules/types"?
```

**Or when you run lint:**

```bash
$ pnpm lint
packages/api-framework/src/index.ts:2:1  error
  import/no-relative-packages
```

### ✅ Fix It

**Option 1: Auto-fix**

```bash
pnpm lint:fix
```

ESLint auto-suggests and applies the fix:

```typescript
// packages/api-framework/src/index.ts
import type { OrgRole } from "@fresh-schedules/types";
```

**Option 2: Manual fix** Look up the package alias in `tsconfig.base.json`:

```json
"paths": {
  "@fresh-schedules/types": ["packages/types"]
}
```

Then import using alias:

```typescript
import type { OrgRole } from "@fresh-schedules/types";
```

### Validation

```bash
pnpm lint              # Should pass now
pnpm typecheck         # Verify TypeScript works
pnpm build:sdk         # Build the package
```

---

## Scenario 2: You Add a New Internal Dependency

**Situation:** You created a new package `packages/validators` and need to use it in
`api-framework`.

### Step 1: Create Package Structure

```bash
mkdir packages/validators
cd packages/validators
npm init -y
```

### Step 2: ❌ Wrong: Add with version

```bash
pnpm add @fresh-schedules/validators@0.1.0
```

This creates:

```json
// packages/api-framework/package.json
{ "@fresh-schedules/validators": "0.1.0" }
```

**Problem:** Will break when validators version changes.

### Step 3: ✅ Right: Add with workspace protocol

```bash
pnpm add -D @fresh-schedules/validators@workspace:*
```

This creates:

```json
// packages/api-framework/package.json
{ "@fresh-schedules/validators": "workspace:*" }
```

**Better:** Always points to local version.

### Step 4: Guardrails Validation

**Check workspace:**

```bash
$ pnpm workspace:check
✅ All checks passed!
```

If you missed the `workspace:*` protocol:

```bash
$ pnpm workspace:check
❌ Package @fresh-schedules/validators:
   workspace protocol not used in api-framework
```

Auto-fix:

```bash
pnpm workspace:fix
```

**Check imports:**

```bash
pnpm lint  # No relative import errors
```

**Check types:**

```bash
pnpm typecheck
```

### Step 5: Update tsconfig (if TypeScript)

Add reference to `/tsconfig.base.json`:

```json
"references": [
  { "path": "packages/types" },
  { "path": "packages/validators" }
]
```

Add path alias to `/tsconfig.base.json`:

```json
"@fresh-schedules/validators": ["packages/validators"]
```

Validate:

```bash
pnpm typecheck  # Should resolve types from new package
```

---

## Scenario 3: You Upgrade a Shared Dependency

**Situation:** TypeScript 5.9 → 5.10 is released, you want to upgrade.

### Step 1: Upgrade in Root

```bash
pnpm upgrade -D typescript@5.10.0 --save-exact
```

Updates `package.json`:

```json
{ "typescript": "5.10.0" }
```

### Step 2: Check Version Consistency

```bash
pnpm deps:sync:check
```

**Output:**

```
SemverRangeMismatch found:
- packages/types/package.json: typescript: ^5.9.0
- packages/api-framework/package.json: typescript: 5.9.4
- apps/web/package.json: typescript: ^5.9.0
```

### Step 3: Sync Versions

```bash
pnpm deps:sync
```

Updates all packages to use new version:

```json
// All packages now have:
{ "typescript": "^5.10.0" }
```

### Step 4: Update Lock File

```bash
pnpm install
```

### Step 5: Validate Everything

```bash
pnpm typecheck      # Verify TypeScript works
pnpm lint           # Check linting still passes
pnpm test:unit      # Run tests
```

### Full Example

```bash
# One-command upgrade workflow
pnpm upgrade -D typescript@latest --save-exact && \
  pnpm deps:sync && \
  pnpm install && \
  pnpm typecheck && \
  pnpm lint:fix && \
  pnpm test:unit
```

---

## Scenario 4: Detecting Dependency Bloat

**Situation:** Your build is getting larger, want to find duplicate dependencies.

### Analyze Duplication

```bash
pnpm deps:analyze
```

**Output (example):**

```
✓ zod
  - root: workspace:*
  - packages/types: workspace:*
  - packages/api-framework: workspace:*
  - apps/web: workspace:*
  └─ All use same version ✓

✗ vitest
  - packages/api-framework: ^4.0.0
  - packages/types: ^3.9.0
  - apps/web: ^4.1.0
  └─ 3 different versions installed ❌
```

### Fix Duplication

```bash
$ pnpm deps:sync:check
# Shows what's mismatched
$ pnpm deps:sync
# Auto-fixes to consistent versions
$ pnpm install
```

### Verify Impact

```bash
# Check lock file before
$ git diff pnpm-lock.yaml | head -20

# Size comparison
$ du -sh node_modules
# (Should be smaller after sync)
```

---

## Scenario 5: PR Review Found an Import Issue

**Situation:** PR #42 got merged with a relative import that breaks production.

### Step 1: Find the Issue

In CI logs or locally:

```bash
pnpm lint:check
cat eslint-report.json | jq '.[] | select(.messages | length > 0)'
```

**Output:**

```json
{
  "filePath": "packages/api-framework/src/endpoints/org.ts",
  "messages": [
    {
      "ruleId": "import/no-relative-packages",
      "severity": 2,
      "message": "Relative imports from parent packages are not allowed"
    }
  ]
}
```

### Step 2: Fix Automatically

```bash
pnpm lint:fix
```

ESLint updates the import to use package alias.

### Step 3: Verify

```bash
pnpm typecheck
pnpm build:sdk
```

### Step 4: Commit

```bash
git add .
git commit -m "fix: use package alias instead of relative import"
git push origin branch-name
```

---

## Scenario 6: Setting Up Pre-Commit Hook

**Situation:** You want to prevent broken imports from ever being committed.

### Install husky

```bash
pnpm add -D husky
npx husky install
```

### Create Pre-Commit Hook

```bash
npx husky add .husky/pre-commit "pnpm lint:fix && pnpm workspace:check"
```

This creates `.husky/pre-commit`:

```bash
# !/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint:fix && pnpm workspace:check
```

### Test It

```bash
# Create a file with relative import
$ echo 'import x from "../../types"' > test.ts

# Try to commit (should fail)
$ git add test.ts
$ git commit -m "test"
# ❌ Will fail because lint:fix didn't succeed
```

---

## Scenario 7: Monorepo has Version Inconsistencies

**Situation:** Workspace check passes, but you have version mismatches.

### Find Mismatches

```bash
pnpm deps:sync:check
```

**Output:**

```
LocalPackageMismatch found:
- @fresh-schedules/types: workspace:* expected, 0.1.0 found

SemverRangeMismatch found:
- react: ^18.2.0 vs ~18.3.0 vs 18.2.1
```

### Fix Automatically

```bash
pnpm deps:sync
```

For workspace: mismatches:

- Updates `package.json` to use `workspace:*`

For semver mismatches:

- Aligns to single consistent range (usually most permissive)

### Install

```bash
pnpm install
```

### Validate

```bash
pnpm deps:sync:check  # Should show no mismatches
pnpm typecheck        # Ensure everything still works
```

---

## Scenario 8: New Team Member Onboarding

**Situation:** New dev clones repo, needs to validate setup.

### Step 1: Clone & Install

```bash
git clone https://github.com/peteywee/fresh-root.git
cd fresh-root
pnpm install
```

### Step 2: Run Guardrails

```bash
pnpm guardrails
```

This runs:

- `pnpm workspace:check` - Validates package structure
- `pnpm deps:sync:check` - Checks version consistency

**Output:**

```
✅ All checks passed!
✅ No version mismatches!
```

### Step 3: Validate Full Setup

```bash
pnpm validate:all
```

This runs:

- `pnpm lint` - Check code quality
- `pnpm workspace:check` - Workspace structure
- `pnpm deps:sync:check` - Version consistency
- `pnpm typecheck` - TypeScript compilation

**Success:** All 7 packages ready to go!

### Step 4: Set Up Pre-Commit

```bash
pnpm install -D husky
npx husky install
```

Now they're protected against accidentally committing broken code.

---

## Scenario 9: Continuous Integration Pipeline

**Situation:** Want to prevent broken PRs from merging.

### GitHub Actions Workflow

Create `.github/workflows/guardrails.yml`:

```yaml
name: Guardrails

on:
  pull_request:
  push:
    branches: [main, dev]

jobs:
  guardrails:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check imports (catches relative imports)
        run: pnpm lint

      - name: Validate workspace structure
        run: pnpm workspace:check

      - name: Check dependency versions
        run: pnpm deps:sync:check

      - name: Type check all packages
        run: pnpm typecheck

  report:
    needs: guardrails
    if: failure()
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate detailed report
        run: pnpm lint:check || true

      - name: Show import issues
        run: |
          cat eslint-report.json | jq '.[] |
          select(.messages | map(.ruleId == "import/no-relative-packages") | any)'
          || echo "No import issues"
```

---

## Scenario 10: Emergency Fix for Production

**Situation:** Production broke, need to quickly identify and fix issues.

### Quick Diagnosis

```bash
# 1. Check all guardrails
$ pnpm validate:pre-push

# 2. If lint fails, get detailed report
$ pnpm lint:check
$ cat eslint-report.json | jq '.[] | select(.messages | length > 0)'

# 3. If workspace fails, check what's broken
$ pnpm workspace:check

# 4. If versions fail
$ pnpm deps:sync:check
```

### Emergency Fix

```bash
# 1. Auto-fix all issues
$ pnpm guardrails:fix

# 2. Validate everything
$ pnpm validate:all

# 3. Commit fix
$ git add .
$ git commit -m "fix: resolve workspace and import issues"
$ git push origin main
```

---

## Quick Commands Reference

```bash
# Daily workflow (run before committing)
pnpm lint:fix              # Fix linting + import issues
pnpm typecheck             # Verify TypeScript
pnpm workspace:check       # Validate structure

# Pre-push checks
pnpm validate:pre-push     # Comprehensive validation

# Fix all issues at once
pnpm guardrails:fix        # Fix workspace + versions + install
pnpm validate:full         # Fix + validate + test

# Diagnosis
pnpm import:report         # Show all import violations
pnpm versions:report       # Show version mismatches
pnpm pkg:validate:verbose  # Detailed workspace info

# Sync tools
pnpm deps:sync             # Update all versions
pnpm workspace:fix         # Update workspace refs
pnpm install               # Update lock file
```
