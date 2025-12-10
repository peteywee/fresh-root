# Branch-to-Documentation Linking Guide

**Purpose:** Ensure every runtime component on `main` is linked to its respective development documentation on `dev`\
**Status:** Production Ready\
**Date:** 2025-11-28

---

## Branch Architecture

### Main Branch (Production)

- **Purpose:** Runtime-ready code deployed to production
- **Access:** Read-only (via guard-main.yml gate)
- **Contains:**
  - Production-verified source code
  - Production readiness documents
  - CI/CD workflows (guard-main.yml, ci-patterns.yml)
  - This linking guide
  - Deployment guides

### Dev Branch (Development)

- **Purpose:** Development, standards, implementation guidance
- **Access:** Writable (feature branches created here)
- **Contains:**
  - Implementation standards & phases
  - Architecture documentation
  - Standards index & frameworks
  - Development guides
  - References to all Tier 0/1/2/3 requirements

---

## Runtime Component Linking Map

Every production component on `main` links to its standards on `dev`:

### Security (Tier 0) - Enforcement on Main, Standards on Dev

| Runtime Component | Location                      | Links To                               | Standard                             |
| ----------------- | ----------------------------- | -------------------------------------- | ------------------------------------ |
| Security Wrappers | `apps/web/app/api/*/route.ts` | dev: `PHASE_1_TIER_0_FIXES.md`         | 6 endpoints must have `withSecurity` |
| Input Validation  | `apps/web/app/api/*/route.ts` | dev: `PHASE_1_TIER_0_FIXES.md`         | 7 write endpoints must use Zod       |
| Error Responses   | Handled by wrappers           | dev: `standards/00_STANDARDS_INDEX.md` | 400/422 on validation failure        |

**How Linking Works:**

1. guard-main.yml (on main) enforces: "Zero Tier 0 violations"
2. If violation detected: Error message references PHASE_1_TIER_0_FIXES.md (on dev)
3. Developer checks out dev, reads documentation
4. Implements fix per standard, creates PR to dev
5. PR merges to main after guard-main verification

### Integrity (Tier 1) - Enforcement on Main, Standards on Dev

| Runtime Component | Location                        | Links To                               | Standard                  |
| ----------------- | ------------------------------- | -------------------------------------- | ------------------------- |
| Zod Schemas       | `packages/types/src/*/index.ts` | dev: `PHASE_2_TIER_1_FIXES.md`         | Export Zod + z.infer      |
| Type Exports      | `packages/types/src/*/index.ts` | dev: `PHASE_2_TIER_1_FIXES.md`         | All types from z.infer    |
| Schema Imports    | Zod library                     | dev: `standards/00_STANDARDS_INDEX.md` | `import { z } from "zod"` |

**How Linking Works:**

1. guard-main.yml (on main) enforces: "Zero Tier 1 violations"
2. If violation detected: Error message references PHASE_2_TIER_1_FIXES.md (on dev)
3. Developer implements fix following standard
4. Creates PR to dev, passes ci-patterns validation
5. PR merges to main via guard-main gate

### Architecture (Tier 2) - Enforcement on Main, Standards on Dev

| Runtime Component   | Location             | Links To                               | Standard          |
| ------------------- | -------------------- | -------------------------------------- | ----------------- |
| Triad: Schedule     | Schema + API + Rules | dev: `standards/SYMMETRY_FRAMEWORK.md` | Complete coverage |
| Triad: Organization | Schema + API + Rules | dev: `standards/SYMMETRY_FRAMEWORK.md` | Complete coverage |
| Triad: Shift        | Schema + API + Rules | dev: `standards/SYMMETRY_FRAMEWORK.md` | Complete coverage |

**How Linking Works:**

1. Pattern validator (on main) enforces: "3/3 Complete Triads"
2. If gap detected: Error message references SYMMETRY_FRAMEWORK.md (on dev)
3. Developer adds missing layer, ensures symmetry
4. Pattern validator confirms completion
5. Code merged to main when all checks pass

### Code Quality (TypeScript & ESLint) - Enforcement on Main, Standards on Dev

| Runtime Component | Location        | Links To                               | Standard                 |
| ----------------- | --------------- | -------------------------------------- | ------------------------ |
| Type Safety       | All `.ts` files | dev: `standards/00_STANDARDS_INDEX.md` | Zero compilation errors  |
| Import Ordering   | All imports     | dev: `PHASE_3_TIER3_CLEANUP.md`        | ESLint import/order rule |
| Code Style        | All code        | dev: `standards/SYMMETRY_FRAMEWORK.md` | File layer fingerprints  |

**How Linking Works:**

1. guard-main.yml (on main) enforces: "TypeScript: 0 errors, ESLint: 0 errors"
2. If error detected: Workflow comment links to standard
3. Developer fixes locally using standard as reference
4. Commit and re-trigger CI
5. Merge when all checks pass

---

## Documentation Cross-Reference Table

### On Main Branch (Production)

```
docs/
├── RUNTIME_DOCUMENTATION_INDEX.md (this links to everything)
├── production/PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md (current status)
├── production/PRODUCTION_READINESS.md (detailed analysis)
└── production/PRODUCTION_DEPLOYMENT_GUIDE.md (how to deploy)

.github/workflows/
└── guard-main.yml (production gate that enforces standards)
```

### On Dev Branch (Development)

```
docs/
├── standards/
│   ├── 00_STANDARDS_INDEX.md (all standards defined)
│   ├── SYMMETRY_FRAMEWORK.md (architecture standards)
│   └── ...
├── PHASE_1_TIER_0_FIXES.md (security requirements)
├── PHASE_2_TIER_1_FIXES.md (integrity requirements)
├── PHASE_3_TIER3_CLEANUP.md (style requirements)
├── MIGRATION_ROADMAP.md (implementation roadmap)
└── ...

.github/workflows/
├── ci-patterns.yml (dev branch validation)
└── pr.yml (PR fast-track)

scripts/
└── validate-patterns.mjs (enforces standards with diagnostics)
```

---

## How to Use This Linking

### For Developers

**Starting a new feature:**

1. Create feature branch from `dev`
2. Read relevant standard from dev:
   - Security → `PHASE_1_TIER_0_FIXES.md`
   - Types → `PHASE_2_TIER_1_FIXES.md`
   - Architecture → `standards/SYMMETRY_FRAMEWORK.md`
3. Implement following standard
4. Open PR to dev
5. CI validates (ci-patterns.yml + pr.yml)
6. If issue, error message links back to standard
7. Fix and retry
8. After merge to dev, PR auto-creates to main
9. guard-main.yml verifies production readiness
10. If green, deployed to production (main)

### For Operations

**Checking production status:**

1. Go to main branch
2. Read `RUNTIME_DOCUMENTATION_INDEX.md`
3. Check `PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md`
4. Review guard-main.yml workflow logs for verification

**If issue on production:**

1. Check main branch commit history
2. See what code was deployed
3. Review guard-main.yml logs (should show all passed)
4. If regression, create hotfix PR to dev
5. Follow same flow as new feature
6. Deploy via main branch when ready

### For Auditors

**Verifying production compliance:**

1. main branch: See production-ready code
2. dev branch: See all standards that code must follow
3. guard-main.yml: Automated enforcement on production gate
4. Workflow logs: Proof of all checks passing

**Tracing any component:**

1. Find runtime code on main
2. Check RUNTIME_DOCUMENTATION_INDEX.md for links
3. Follow link to standard on dev
4. See exact requirement and implementation example
5. Verify guard-main enforces it

---

## Cross-Branch Links Reference

### Link Syntax

When main references dev standards:

```markdown
[Phase 1 Security Standards](../dev/docs/PHASE_1_TIER_0_FIXES.md)
[Phase 2 Type Standards](../dev/docs/PHASE_2_TIER_1_FIXES.md)
[Architecture Standards](../dev/docs/standards/SYMMETRY_FRAMEWORK.md)
[All Standards Index](../dev/docs/standards/00_STANDARDS_INDEX.md)
```

### Link Resolution

**On GitHub:**

- main: `docs/RUNTIME_DOCUMENTATION_INDEX.md`
- dev: `docs/standards/00_STANDARDS_INDEX.md`

When you see link in CI failure:

- Click to see dev branch documentation
- Read standard
- Implement fix
- Commit to dev
- Re-trigger CI

---

## CI Workflow Link Integration

### guard-main.yml (Production Gate)

```yaml
# When Tier 0 violation detected:
- name: Pattern Validator
  run: pnpm lint:patterns
  # Output includes link:
  # "See: docs/PHASE_1_TIER_0_FIXES.md on dev branch"

# When TypeScript fails:
- name: TypeScript Compilation
  run: pnpm typecheck
  # Developers know to check types standard on dev

# When ESLint fails:
- name: ESLint Code Quality
  run: pnpm lint
  # Standard link posted in PR comment
```

### ci-patterns.yml (Dev Validation)

```yaml
# Runs on dev branch PRs
# If pattern violation:
- name: Comment PR on Failure
  # Posts comment linking to standard doc
  # "Check: PHASE_1_TIER_0_FIXES.md or PHASE_2_TIER_1_FIXES.md"
```

### pr.yml (PR Fast-Track)

```yaml
# Runs on dev branch PRs
# If check fails:
- name: Add Pass/Fail Comment
  # Comments link to relevant standard
  # Development team already on dev branch, has access
```

---

## Documentation Update Workflow

When standards change on dev:

1. Update doc on dev branch
2. Create PR to dev with standard changes
3. ci-patterns validates (shows new standard)
4. Merge to dev
5. **Next PR to main automatically uses new standard**
6. guard-main enforces new requirements
7. If any production code violates new standard, guard-main fails
8. Production team notified, can update code or revert standard

---

## Repository Structure for Linking

```
fresh-root/
├── main (production branch)
│   ├── docs/
│   │   ├── RUNTIME_DOCUMENTATION_INDEX.md ← START HERE
│   │   ├── production/PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md
│   │   ├── production/PRODUCTION_READINESS.md
│   │   └── production/PRODUCTION_DEPLOYMENT_GUIDE.md
│   └── .github/workflows/
│       ├── guard-main.yml (references dev standards in error messages)
│       ├── ci-patterns.yml
│       └── pr.yml
│
└── dev (development branch)
    ├── docs/
    │   ├── standards/
    │   │   ├── 00_STANDARDS_INDEX.md ← ALL STANDARDS HERE
    │   │   ├── SYMMETRY_FRAMEWORK.md
    │   │   └── ...
    │   ├── PHASE_1_TIER_0_FIXES.md ← Security standards
    │   ├── PHASE_2_TIER_1_FIXES.md ← Type standards
    │   ├── PHASE_3_TIER3_CLEANUP.md ← Style standards
    │   └── ...
    ├── .github/workflows/
    │   ├── ci-patterns.yml (enforces dev standards)
    │   └── pr.yml
    └── scripts/
        └── validate-patterns.mjs (reads standards, enforces, links back)
```

---

## Verification

### Verify Links Work

On main branch:

```bash
git checkout main
cat docs/RUNTIME_DOCUMENTATION_INDEX.md | grep "dev branch"
# Should show links to dev branch docs
```

On dev branch:

```bash
git checkout dev
cat docs/standards/00_STANDARDS_INDEX.md | head -20
# Should show all enforced standards
```

### Verify Linking in CI

```bash
# Create a violation on dev
# Open PR to dev
# Check ci-patterns.yml output
# Should see link to standard doc
# Then:
# Create PR from dev to main
# Check guard-main.yml output
# Should see same violation blocked with link to fix
```

---

## Quick Links (for this document)

<<<<<<< HEAD:docs/BRANCH_LINKING_GUIDE.md
- **Production Documentation:** See [RUNTIME_DOCUMENTATION_INDEX.md](./RUNTIME_DOCUMENTATION_INDEX.md)
- **Deployment Guide:** See [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)
- **All Standards (on dev):** Reference docs/standards/00_STANDARDS_INDEX.md
- **Security (on dev):** Reference docs/PHASE_1_TIER_0_FIXES.md
- **Types (on dev):** Reference docs/PHASE_2_TIER_1_FIXES.md
=======
- **Production Documentation:** See [RUNTIME\_DOCUMENTATION\_INDEX.md](./RUNTIME_DOCUMENTATION_INDEX.md)
- **Deployment Guide:** See [PRODUCTION\_DEPLOYMENT\_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)
- **All Standards (on dev):** Reference docs/standards/00\_STANDARDS\_INDEX.md
- **Security (on dev):** Reference docs/PHASE\_1\_TIER\_0\_FIXES.md
- **Types (on dev):** Reference docs/PHASE\_2\_TIER\_1\_FIXES.md
>>>>>>> origin/dev:docs/standards/BRANCH_LINKING_GUIDE.md

---

**Last Updated:** 2025-11-28\
**Purpose:** Link all runtime components on main to standards on dev\
**Status:** ACTIVE ✅
