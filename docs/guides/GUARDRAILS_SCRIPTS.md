# Guardrails Scripts Quick Reference

**These scripts help prevent and fix monorepo configuration breaks.**

## Installation (Already Done ✅)

The following tools are already installed in your workspace:

- **eslint-plugin-import** - Catches relative imports across packages
- **@manypkg/cli** - Validates workspace consistency
- **syncpack** - Ensures version consistency across packages

---

## Essential Scripts

### Daily Use

```bash
# Fix imports and format before committing
pnpm lint:fix              # Auto-fix linting + import issues
pnpm typecheck             # Verify TypeScript compiles
pnpm workspace:check       # Validate workspace structure

# One-command pre-commit validation
pnpm validate:pre-commit
```

### Before Pushing

```bash
# Comprehensive checks before pushing to remote
pnpm validate:pre-push
# Runs: lint + workspace:check + deps:sync:check + typecheck
```

### Emergency Fixes

```bash
# Fix all guardrail issues at once
pnpm guardrails:fix
# Runs: workspace:fix + deps:sync + install

# Fix everything and validate
pnpm validate:full
# Runs: fix:all + guardrails:fix + validate:all + test:unit
```

---

## Specialized Scripts

### Import Issues

```bash
# Show all relative import violations
pnpm import:report

# Find relative imports with grep (fast search)
pnpm import:find

# Auto-fix relative imports
pnpm lint:fix
```

### Workspace Structure

```bash
# Check workspace consistency
pnpm workspace:check
pnpm pkg:validate

# Detailed workspace validation
pnpm pkg:validate:verbose

# Auto-fix workspace issues
pnpm workspace:fix
pnpm pkg:fix
```

### Dependency Versions

```bash
# Show all version mismatches
pnpm versions:report
pnpm deps:sync:check

# Auto-fix version mismatches (then install)
pnpm versions:fix
pnpm versions:sync

# Analyze duplicate dependencies
pnpm deps:analyze
```

### Comprehensive Validation

```bash
# All guardrail checks (no fixes)
pnpm guardrails
# Runs: workspace:check + deps:sync:check

# Full validation (includes linting)
pnpm validate:all
# Runs: lint + workspace:check + deps:sync:check + typecheck
```

---

## Real-World Workflows

### Scenario 1: Before Committing Code

```bash
pnpm lint:fix              # Fix imports + style issues
pnpm workspace:check       # Validate structure
pnpm typecheck             # Verify TypeScript
git add .
git commit -m "feat: description"
```

### Scenario 2: Before Pushing to Remote

```bash
pnpm validate:pre-push     # All checks
git push origin branch-name
```

### Scenario 3: Emergency Fix for Broken Build

```bash
pnpm guardrails:fix        # Fix workspace + versions
pnpm validate:all          # Full validation
git add .
git commit -m "fix: resolve guardrail issues"
git push origin main
```

### Scenario 4: After Upgrading Dependencies

```bash
pnpm upgrade -D typescript@latest
pnpm deps:sync             # Sync to all packages
pnpm install               # Update lock file
pnpm typecheck             # Verify
```

### Scenario 5: Onboarding New Dev

```bash
git clone https://github.com/peteywee/fresh-root.git
cd fresh-root
pnpm install

# Validate setup
pnpm guardrails           # Should pass
pnpm validate:all         # Full check
```

---

## What Each Tool Does

### 1. ESLint + eslint-plugin-import

**Prevents:** Cross-package relative imports that break after builds

```bash
pnpm lint              # Check for violations
pnpm lint:fix          # Auto-fix
pnpm lint:preview      # Preview without applying
pnpm import:report     # Show import violations only
```

**Why it matters:** Relative imports like `import x from "../../types"` work in dev but fail after
tsup bundling. Must use package aliases like `import x from "@fresh-schedules/types"`.

### 2. @manypkg/cli

**Prevents:** Workspace structure inconsistencies

```bash
pnpm workspace:check   # Validate
pnpm workspace:fix     # Auto-fix
```

**Why it matters:** Ensures all internal package references use `workspace:*` protocol, preventing
version mismatches between local and published versions.

### 3. syncpack

**Prevents:** Duplicate dependency bloat and version inconsistencies

```bash
pnpm deps:sync:check   # Check mismatches
pnpm deps:sync         # Fix all mismatches
pnpm install           # Update lock file
```

**Why it matters:** Same dependency installed in 3 versions wastes 2x space and causes type
inconsistencies. Syncs all packages to single consistent version.

---

## Common Errors & Fixes

| Error                              | Check                  | Fix                                    |
| ---------------------------------- | ---------------------- | -------------------------------------- |
| Relative import breaks after build | `pnpm lint`            | `pnpm lint:fix`                        |
| Package version mismatches         | `pnpm workspace:check` | `pnpm workspace:fix`                   |
| Dependency bloat in node_modules   | `pnpm deps:sync:check` | `pnpm deps:sync && pnpm install`       |
| TypeScript won't compile           | `pnpm typecheck`       | Fix errors manually + `pnpm typecheck` |
| Multiple issues at once            | `pnpm validate:all`    | `pnpm guardrails:fix` then validate    |

---

## Advanced Usage

### Generate Detailed Reports

```bash
# ESLint JSON report (detailed linting)
pnpm lint:check

# Verbose workspace info
pnpm pkg:validate:verbose
```

### Chain Commands

```bash
# Common workflow in one command
pnpm lint:fix && \
  pnpm workspace:fix && \
  pnpm deps:sync && \
  pnpm install && \
  pnpm typecheck && \
  pnpm test:unit
```

### CI/CD Integration

All scripts are CI-ready and return non-zero exit codes on failure:

```bash
# In GitHub Actions
- name: Validate guardrails
  run: pnpm validate:pre-push
```

---

## Documentation

For detailed information, see:

- [GUARDRAILS_GUIDE.md](docs/guides/GUARDRAILS_GUIDE.md) - Full explanation of each tool
- [GUARDRAILS_EXAMPLES.md](docs/guides/GUARDRAILS_EXAMPLES.md) - Real-world scenarios

---

## Key Takeaway

**Run before committing:**

```bash
pnpm lint:fix && pnpm workspace:check && pnpm typecheck
```

This catches 99% of monorepo configuration issues before they reach CI.
