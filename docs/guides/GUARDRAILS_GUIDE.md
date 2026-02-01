---

title: "Guardrails Guide: Using eslint-plugin-import, @manypkg/cli, and syncpack"
description: "How to use guardrail tools to prevent monorepo configuration breaks."
keywords:
  - guardrails
  - eslint
  - manypkg
  - syncpack
category: "guide"
status: "active"
audience:
  - developers
related-docs:
  - README.md
  - ./GUARDRAILS_QUICK_START.md
  - ./GUARDRAILS_SCRIPTS.md
createdAt: "2026-01-31T07:18:59Z"
lastUpdated: "2026-01-31T07:18:59Z"

---

# Guardrails Guide: Using eslint-plugin-import, @manypkg/cli, and syncpack

This document explains how to use the three guardrail tools to prevent monorepo configuration
breaks.

---

## Quick Reference

### Daily Workflow

```bash
# Run before committing
pnpm lint:fix          # Catch import issues early
pnpm typecheck         # Verify TypeScript is happy
pnpm workspace:check   # Validate workspace structure

# Fix issues automatically
pnpm workspace:fix     # Auto-fix workspace problems
pnpm deps:sync         # Auto-align dependency versions
```

### Pre-commit Validation

```bash
# Comprehensive validation
pnpm fix:all           # Lint fix + format + markdown
pnpm workspace:check   # Ensure no workspace regressions
pnpm deps:sync:check   # List any version mismatches
```

---

## Tool 1: eslint-plugin-import

**Purpose:** Catch import pattern errors at lint time (dev) instead of build time (CI).

**Key Rule:** `import/no-relative-packages` - Prevents cross-package relative imports that break
after bundling.

### Why This Matters

❌ **Breaks after tsup build:**

```typescript
// packages/api-framework/src/index.ts
import type { OrgRole } from "../../types/src/rbac"; // ❌ Relative path fails after build
```

✅ **Works everywhere:**

```typescript
import type { OrgRole } from "@fresh-schedules/types"; // ✅ Package alias works before & after build
```

### How It Works

When you try to import from a relative path across packages:

```bash
pnpm lint
```

**Output:**

```
packages/api-framework/src/index.ts
  2:1  error  Relative imports from parent packages are not allowed.
            Did you mean to import from "@fresh-schedules/types"?  import/no-relative-packages
```

### Configuration

Located in `eslint.config.mjs`:

```javascript
// GUARDRAIL: Prevent relative imports across packages (breaks after build)
"import/no-relative-packages": ["error", {
  allow: []  // No exceptions
}],
```

Also requires TypeScript resolver for path alias support:

```javascript
settings: {
  "import/resolver": {
    typescript: {
      alwaysTryTypes: true,
      project: "tsconfig.base.json",
    }
  }
}
```

### Usage Patterns

**Pattern 1: Detect relative imports**

```bash
pnpm lint --fix
```

Most relative import errors auto-fix by suggesting package aliases.

**Pattern 2: Check specific file**

```bash
pnpm eslint packages/api-framework/src --ext .ts --fix
```

**Pattern 3: Preview fixes without applying**

```bash
pnpm lint:preview
```

**Pattern 4: Generate JSON report**

```bash
pnpm lint:check
```

Outputs detailed violations to `eslint-report.json`.

### Prevention Strategy

1. **During development:** Editor ESLint extension shows import errors instantly
2. **On commit:** Run `pnpm lint:fix` to catch before pushing
3. **In CI:** `pnpm lint` fails if relative imports exist
4. **In PR:** Review CI lint results for any violations

---

## Tool 2: @manypkg/cli

**Purpose:** Validate workspace structure and dependencies are correctly configured.

**Checks:**

- All internal dependencies use `workspace:*` protocol
- Monorepo has consistent structure
- Package references are valid
- No invalid dependency versions

### Why This Matters

Without workspace validation:

- Internal packages reference wrong versions (e.g., `"@fresh-schedules/types": "^0.1.0"` instead of
  `workspace:*`)
- Breaks after deploy when versions diverge
- CI passes but production fails

### How It Works

```bash
pnpm workspace:check
```

**Success:**

```
✅ All checks passed!
```

**Failure Example:**

```
❌ Package mismatch: @fresh-schedules/api-framework
  In root: workspace:*
  In apps/web: 0.1.0

  Run: pnpm workspace:fix
```

### Configuration

No configuration file needed. @manypkg uses conventions:

- All packages in `/packages` are internal
- All apps in `/apps` are internal
- These should reference each other with `workspace:*`

### Usage Patterns

**Pattern 1: Validate workspace before commits**

```bash
pnpm workspace:check
```

**Pattern 2: Auto-fix workspace issues**

```bash
pnpm workspace:fix
```

Typical fixes:

- Updates `package.json` internal dependencies to `workspace:*`
- Aligns versions of same package across monorepo

**Pattern 3: Check in CI pipeline** Add to GitHub Actions:

```yaml
- name: Validate workspace structure
  run: pnpm workspace:check
```

**Pattern 4: Before package releases**

```bash
pnpm workspace:fix  # Ensure clean workspace
pnpm build          # Verify everything builds
```

### Common Issues & Fixes

**Issue:** New package added but not referenced correctly

```bash
pnpm workspace:fix  # Auto-updates all references
```

**Issue:** Workspace references different versions

```bash
pnpm workspace:check  # Shows which packages mismatch
pnpm workspace:fix    # Aligns them
```

**Issue:** Adding new internal dependency

```bash
# Instead of:
pnpm add @fresh-schedules/types@0.1.0

# Always add with workspace protocol:
pnpm add -D @fresh-schedules/types@workspace:*
# Then run:
pnpm workspace:fix
```

---

## Tool 3: syncpack

**Purpose:** Keep dependency versions consistent across packages.

**Ensures:**

- Same dependency has same version everywhere
- Avoids duplicate installs (major bloat)
- Reduces resolution complexity

### Why This Matters

Without version sync:

```json
// packages/api-framework/package.json
{ "zod": "^1.15.0" }

// packages/types/package.json
{ "zod": "^1.14.0" }

// apps/web/package.json
{ "zod": "1.16.0" }
```

Results in:

- 3 different versions installed (bloats node_modules)
- Type inconsistencies between packages
- Harder to debug version-related bugs

### How It Works

```bash
pnpm deps:sync:check
```

**Output:**

```
SemverRangeMismatch: zod
  packages/api-framework: ^1.15.0
  packages/types: ^1.14.0
  apps/web: 1.16.0

Run: pnpm deps:sync
```

```bash
pnpm deps:sync
```

Updates all to consistent range (usually the most permissive).

### Configuration

Located in `.syncpackrc.json`:

```json
{
  "versionGroups": [
    {
      "label": "Consistent TypeScript version",
      "packages": ["**"],
      "dependencies": ["typescript"],
      "policy": "sameRange"
    },
    {
      "label": "Use exact versions in production",
      "packages": ["@apps/*"],
      "dependencyTypes": ["prod"],
      "range": "" // exact version, no ^, ~
    }
  ]
}
```

**Policies:**

- `sameRange` - `^1.5.0` matches `~1.5.0` (flexible)
- `exact` - Only exact matches allowed
- `pin` - Force specific version across monorepo

### Usage Patterns

**Pattern 1: Check version consistency**

```bash
pnpm deps:sync:check
```

Shows all mismatches without changes.

**Pattern 2: Auto-fix all mismatches**

```bash
pnpm deps:sync
```

Updates `package.json` files, then run:

```bash
pnpm install  # Update pnpm-lock.yaml
```

**Pattern 3: After upgrading shared dependency**

```bash
# Upgrade in one place
pnpm upgrade -D typescript@5.9.4

# Sync everywhere
pnpm deps:sync
pnpm install
```

**Pattern 4: Analyze bloat**

```bash
pnpm deps:analyze
```

Shows duplicate packages in node_modules.

**Pattern 5: Production-only exact versions**

> ⚠️ **Caution:** If using this pattern, ensure workspace packages are ignored first (see "Critical
> Configuration: Syncpack vs Manypkg Conflict" below). Otherwise, this will conflict with manypkg's
> `workspace:*` requirement.

```json
{
  "semverGroups": [
    {
      "label": "Use exact versions in production (external deps only)",
      "packages": ["@apps/*"],
      "dependencyTypes": ["prod"],
      "range": "" // 1.5.0, not ^1.5.0
    }
  ]
}
```

Ensures production apps use exact tested versions for **external dependencies**.

### Common Issues & Fixes

**Issue:** Too many version mismatches

```bash
pnpm deps:sync      # Auto-fix all
pnpm install        # Update lock file
pnpm typecheck      # Verify TypeScript happy
```

**Issue:** Need different versions for compatibility

```json
{
  "versionGroups": [
    {
      "label": "Node 18 compatible version",
      "packages": ["@apps/legacy"],
      "dependencies": ["some-package"],
      "policy": "exact",
      "pinVersion": "1.0.0"
    },
    {
      "label": "Node 20+ compatible version",
      "packages": ["@apps/web"],
      "dependencies": ["some-package"],
      "policy": "sameRange"
    }
  ]
}
```

**Issue:** Monorepo tool itself needs different version

```json
{
  "versionGroups": [
    {
      "label": "Tsup uses different zod internally",
      "packages": ["tsup"], // Allow exception
      "dependencies": ["zod"],
      "policy": "ignore"
    }
  ]
}
```

---

## Critical Configuration: Known Conflicts & Resolutions

### Syncpack vs Manypkg Conflict (IMPORTANT)

**Problem:** These two tools have fundamentally incompatible expectations for local workspace
packages:

- **manypkg** requires `workspace:*` protocol for internal packages
- **syncpack** (with semverGroups) wants exact versions like `0.1.1`

Running `pnpm deps:sync` could change `workspace:*` to version numbers, breaking manypkg. This
creates a circular breakage pattern.

**Solution:** Configure syncpack to **ignore** all `@fresh-schedules/*` internal packages:

```json
// .syncpackrc.json
{
  "versionGroups": [
    {
      "label": "Ignore local workspace packages",
      "packages": ["**"],
      "dependencies": ["@fresh-schedules/*"],
      "isIgnored": true
    }
    // ...other groups for external dependencies
  ]
}
```

**What this means:**

- Syncpack will NOT check or modify `@fresh-schedules/*` dependencies
- Manypkg handles workspace package references (enforcing `workspace:*`)
- External dependencies are still version-synced by syncpack

**⚠️ NEVER DO THIS:**

```json
// ❌ WRONG: Don't force exact versions on workspace packages
{
  "semverGroups": [
    {
      "packages": ["@apps/**", "@functions/**"],
      "range": "" // Forces exact versions
    }
  ]
}
```

This conflicts with manypkg's `workspace:*` requirement.

### TypeScript Composite Project Paths (IMPORTANT)

**Problem:** TypeScript can't resolve types from packages that have a build step.

When a package like `@fresh-schedules/types` has a `tsconfig.json` with `"composite": true`,
TypeScript expects to find `.d.ts` files in the output directory, not source files.

**Solution:** Configure `tsconfig.base.json` paths based on package type:

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "paths": {
      // Built packages → point to dist (has .d.ts files)
      "@fresh-schedules/types": ["packages/types/dist/index.d.ts"],
      "@fresh-schedules/api-framework": ["packages/api-framework/dist/index.d.ts"],

      // Source-only packages → point to src (no build step)
      "@ui/*": ["packages/ui/src/*"],
      "@config/*": ["packages/config/src/*"],
      "@env/*": ["packages/env/src/*"]
    }
  }
}
```

**How to determine which path to use:**

1. Check if the package has a build script (`"build": "tsup"` or similar)
2. Check if it has `"composite": true` in its tsconfig
3. If YES to either → use `dist/index.d.ts`
4. If NO to both → use `src/index.ts`

**⚠️ Symptoms of wrong paths:**

- `Cannot find module '@fresh-schedules/types'` during Next.js build
- TypeScript errors resolve locally but fail in CI
- Import auto-complete works but build breaks

**After adding a new built package:**

```bash
# 1. Build the package first
pnpm build --filter=@fresh-schedules/new-package

# 2. Update tsconfig.base.json paths to point to dist
# 3. Verify
pnpm typecheck
```

---

## Integration: Full Workflow

### Before Committing

```bash
# 1. Fix linting issues (catches import problems)
pnpm lint:fix

# 2. Format code
pnpm format

# 3. Validate workspace structure
pnpm workspace:check

# 4. Check dependency versions
pnpm deps:sync:check

# 5. Run tests
pnpm test

# 6. Type check
pnpm typecheck

# 7. Commit when everything passes
git add .
git commit -m "feat: description"
```

Or use convenience script:

```bash
# All-in-one (lint + format + markdown)
pnpm fix:all

# Then validate
pnpm workspace:check && pnpm deps:sync:check
```

### In GitHub Actions (CI)

```yaml
name: Validate

on: [pull_request, push]

jobs:
  validate:
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

      - name: Lint (catches import issues)
        run: pnpm lint

      - name: Validate workspace structure
        run: pnpm workspace:check

      - name: Check dependency versions
        run: pnpm deps:sync:check

      - name: Type check
        run: pnpm typecheck
```

### Adding New Package

```bash
# 1. Create package
mkdir packages/my-package
cd packages/my-package
npm init -y

# 2. Add internal dependencies correctly
pnpm add -D @fresh-schedules/types@workspace:*

# 3. Update tsconfig references (if TypeScript)
# Add to /tsconfig.base.json:
# "references": [{ "path": "packages/my-package" }]
# 4. Validate
pnpm workspace:check   # Should pass
pnpm deps:sync:check   # Should show if versions need sync
pnpm lint              # Check imports

# 5. Commit
git add .
git commit -m "feat: add my-package"
```

### Fixing Broken Imports After PR

If a PR adds broken imports:

```bash
# 1. Run lint with fix
pnpm lint:fix

# 2. Check what changed
git diff

# 3. Validate
pnpm workspace:check
pnpm typecheck

# 4. If still broken, manually fix:
# Review eslint-report.json for detailed errors
pnpm lint:check
```

---

## Troubleshooting

### "import/no-relative-packages: Relative imports from parent packages"

**Cause:** Importing from a different package using relative path.

**Fix:**

```typescript
// ❌ Before
import { Thing } from "../../packages/other/src/index";

// ✅ After
import { Thing } from "@fresh-schedules/other";
```

**Find all violations:**

```bash
pnpm lint --fix  # Auto-fixes most cases
```

### "@manypkg/cli: Package mismatch"

**Cause:** Internal package referenced with version instead of `workspace:*`.

**Fix:**

```bash
pnpm workspace:fix
```

Or manually in package.json:

```json
// ❌ Before
{ "@fresh-schedules/types": "0.1.0" }

// ✅ After
{ "@fresh-schedules/types": "workspace:*" }
```

### "syncpack: SemverRangeMismatch"

**Cause:** Same dependency has different versions in different packages.

**Fix:**

```bash
pnpm deps:sync
pnpm install
```

Or investigate why versions differ:

```bash
pnpm deps:sync:check  # List all mismatches
```

### Build Fails But Lint Passes

**Cause:** Import worked in dev but breaks after bundling.

**Solution:** This is exactly what `import/no-relative-packages` prevents. If it slipped through:

```bash
# Find the problematic import
pnpm lint --format json --output-file eslint-report.json

# Review eslint-report.json for import violations
cat eslint-report.json | jq '.[] | select(.messages | length > 0)'

# Fix manually or run auto-fix
pnpm lint:fix
```

---

## Best Practices

1. **Run guardrails before each commit**
   - Hook into pre-commit if using husky
   - Or just run `pnpm fix:all && pnpm workspace:check`

1. **Keep TypeScript strict**
   - Enables import resolver to work correctly
   - Catches more issues early

1. **Use package aliases exclusively**
   - Configure in `tsconfig.base.json` paths
   - ESLint catches any relative imports

1. **Sync dependencies after major upgrades**

   ```bash
   pnpm upgrade
   pnpm deps:sync
   pnpm install
   ```

1. **Review guardrail reports**
   - `eslint-report.json` - Import and code quality issues
   - `pnpm workspace:check` - Workspace structure
   - `pnpm deps:sync:check` - Version consistency

1. **Add guardrails to CI/CD**
   - Fail PRs that violate rules
   - Block merges until guardrails pass

1. **Document exceptions**
   - If a rule needs exception, add comment explaining why
   - Avoid blanket ignore-all patterns

---

## Summary

| Tool                     | Detects                      | Fixes                        | When                |
| ------------------------ | ---------------------------- | ---------------------------- | ------------------- |
| **eslint-plugin-import** | Broken cross-package imports | Auto-suggest package aliases | Lint time (dev)     |
| **@manypkg/cli**         | Workspace structure issues   | Auto-fix workspace refs      | Pre-commit          |
| **syncpack**             | Version inconsistencies      | Auto-align versions          | When upgrading deps |

**Goal:** Move all problems from "build breaks" to "lint catches it" so you can fix them before CI.
