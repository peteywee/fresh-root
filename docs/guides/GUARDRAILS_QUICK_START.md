# Guardrails Quick Start
**For developers:** Get up and running with guardrails in 5 minutes.

---

## Day 1: Understanding Your Workflow
Every commit and push runs **three guardrails** automatically:

### Pre-Commit (When You Type `git commit`)
✅ Handler signature validation (A09 invariant) ✅ Markdown linting ✅ Block merge conflict markers
✅ **Block deprecated scripts** (test:all, deps:check, deps:dedupe)

### Pre-Push (When You Type `git push`)
✅ TypeScript typecheck (all packages) ✅ ESLint (import rules enforced) ✅ Syncpack version
validation ✅ Repomix dependency analysis (non-blocking)

### Pull Request (GitHub Actions)
✅ Full guardrails suite blocking (breaking PR if it fails) ✅ Handler signature validation ✅
Typecheck + Lint + Workspace consistency

---

## Common Tasks
### Add a New npm Script
**Decision tree:**

```plaintext
Is it a one-liner?
  ├─ YES → Just add it
  └─ NO → Continue...

Does it combine 2+ scripts?
  ├─ YES → Create an alias
  └─ NO → Continue...

Frequently used?
  ├─ YES → Add it
  └─ NO → Document instead
```

Example: `"check": "pnpm lint:fix && pnpm workspace:check && pnpm typecheck"`

After adding:

```bash
git add package.json
git commit -m "chore: add script 'check'"
# Pre-commit hooks run automatically ✅
```

---

### My Commit Was Blocked
**Common blockers:**

| Error                      | Cause                             | Fix                                    |
| -------------------------- | --------------------------------- | -------------------------------------- |
| `Handler signature failed` | route.ts mismatch                 | See A09\_HANDLER\_SIGNATURE\_INVARIANT.md |
| `Deprecated script added`  | test:all, deps:check, deps:dedupe | See DEPRECATIONS.md                    |
| `Markdown lint failed`     | MD040, MD022 spacing              | Run `pnpm format`                      |
| `Typecheck failed`         | TypeScript errors                 | Run `pnpm typecheck`                   |
| `Lint failed`              | ESLint violations                 | Run `pnpm lint:fix`                    |

To skip locally (not recommended):

```bash
SKIP_CHECKS=1 git push origin branch-name
SKIP_LINT=1 git push origin branch-name
```

**Note:** GitHub Actions still blocks if you skip locally. Fix the root cause.

---

### Run Guardrails Manually
```bash
pnpm check                    # Quick check
pnpm guardrails               # Full suite
pnpm lint:fix                 # Auto-fix lint
pnpm workspace:fix            # Fix workspace issues
pnpm deps:sync                # Sync versions
pnpm format                   # Format code
```

---

### Low Memory Machine
Pre-push hooks are expensive on limited RAM:

```bash
SKIP_LINT=1 git push origin branch-name
SKIP_LINT=1 SKIP_REPOMIX=1 git push origin branch-name
SKIP_CHECKS=1 git push origin branch-name
```

---

## Detailed Guides
- **[GUARDRAILS\_GUIDE.md](GUARDRAILS_GUIDE.md)** — How each tool works
- **[GUARDRAILS\_EXAMPLES.md](GUARDRAILS_EXAMPLES.md)** — 10 real-world scenarios
- **[GUARDRAILS\_SCRIPTS.md](GUARDRAILS_SCRIPTS.md)** — npm scripts reference
- **[DEPRECATIONS.md](../DEPRECATIONS.md)** — Removed scripts + migrations

---

## What Guardrails Prevent
| Issue                              | Guardrail            | Tool                   |
| ---------------------------------- | -------------------- | ---------------------- |
| Cross-package imports leaking APIs | Import rules         | `eslint-plugin-import` |
| Version mismatches                 | Version sync         | `syncpack`             |
| Workspace inconsistency            | Workspace validation | `@manypkg/cli`         |
| API handler signature mismatch     | A09 invariant        | Custom validator       |
| Missing types                      | Typecheck            | `turbo run typecheck`  |
| Deprecated scripts                 | Blocker              | Pre-commit hook        |

---

## Still Stuck
1. Read the error message — it tells you what to do
2. Check the error reference (e.g., "See .github/governance/amendments/A09\_...")
3. Run the suggested quick fix command
4. If stuck, reach out with the full error output

**Example:**

```bash
❌ Markdown lint failed
   Quick fix: pnpm --filter @fresh-root/markdown-fixer fix && pnpm format

# Run the suggestion
pnpm --filter @fresh-root/markdown-fixer fix && pnpm format

# Try commit again
git add docs/EXAMPLE.md
git commit -m "docs: update example"
✅ Success!
```
