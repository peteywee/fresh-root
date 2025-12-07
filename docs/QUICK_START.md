# Quick Start: Runtime Documentation

**Current Status:** Production Ready ✅  
**Main Commit:** f1bfe18 | Score: 130.0 | Tier 0/1: 0 violations  
**Updated:** 2025-12-06 (Consolidated with PNPM_ENFORCEMENT.md)

---

## Package Manager Requirements: pnpm-only Policy

**⚠️ CRITICAL:** This monorepo uses **pnpm exclusively**. Using npm or yarn will break dependency resolution and cause deployment failures.

### Why pnpm

1. **Monorepo Support**: Native workspace management across 8+ packages
2. **Strict Dependency Resolution**: Prevents transitive dependency issues
3. **Disk Efficiency**: Hard-linking prevents duplication
4. **Lock File Integrity**: pnpm-lock.yaml provides deterministic installs
5. **Series-A Standard**: Production-grade tooling for enterprise deployments

### Environment Requirements

```bash
# Minimum versions (enforced by package.json engines field)
node >= 20.10.0
pnpm >= 9.0.0
```

### Installation & Setup

```bash
# 1. Verify pnpm is installed
pnpm --version

# 2. Install monorepo dependencies
pnpm install

# 3. Verify setup (runs pnpm enforcement checks)
pnpm prepare
```

---

## For Different Teams

### 👨‍💼 Operations/Project Managers

1. Read: [PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md](./PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md)
2. Check: Current score and deployment status
3. Expected: All green ✅

### 👨‍💻 Developers Starting a Feature

1. `git checkout dev`
2. Read standard for your change:
   - Security? → [PHASE_1_TIER_0_FIXES.md](./PHASE_1_TIER_0_FIXES.md)
   - Types? → [PHASE_2_TIER_1_FIXES.md](./PHASE_2_TIER_1_FIXES.md)
   - Architecture? → [standards/SYMMETRY_FRAMEWORK.md](./standards/SYMMETRY_FRAMEWORK.md)
3. Implement following standard
4. Test: `pnpm lint:patterns` (should show 90+)
5. Create PR to dev
6. CI validates automatically

### 🚀 Deployment Team

1. Check: [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)
2. Follow: Step-by-step deployment
3. Expected: All guard-main checks pass ✅

### 🔍 Auditors/Security Review

1. Main branch = Runtime code
2. Check: [RUNTIME_DOCUMENTATION_INDEX.md](./RUNTIME_DOCUMENTATION_INDEX.md)
3. Follow: Links to dev standards
4. Verify: All checks documented and automated

---

## Quick Facts

| Metric                     | Value             |
| -------------------------- | ----------------- |
| **Pattern Score**          | 130.0 / 100 ✅    |
| **Tier 0 Violations**      | 0 ✅              |
| **Tier 1 Violations**      | 0 ✅              |
| **TypeScript Errors**      | 0 ✅              |
| **ESLint Blocking Errors** | 0 ✅              |
| **Production Status**      | READY ✅          |
| **Deployment Gate**        | guard-main.yml ✅ |

---

## Key Documents

**On Main (Production):**

- [RUNTIME_DOCUMENTATION_INDEX.md](./RUNTIME_DOCUMENTATION_INDEX.md) ← Start here
- [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)
- [BRANCH_LINKING_GUIDE.md](./BRANCH_LINKING_GUIDE.md)

**On Dev (Development):**

- [standards/00_STANDARDS_INDEX.md](./standards/00_STANDARDS_INDEX.md)
- [PHASE_1_TIER_0_FIXES.md](./PHASE_1_TIER_0_FIXES.md)
- [PHASE_2_TIER_1_FIXES.md](./PHASE_2_TIER_1_FIXES.md)

---

## One-Minute Overview

**What's deployed to production (main)?**

- All runtime code verified to 90+ standard ✅
- 34 API endpoints, 4 schemas
- Security hardened, type safe, quality verified

**How does it stay production-ready?**

- guard-main.yml enforces 90+ score on every merge
- CI validates all changes automatically
- Zero manual exceptions on Tier 0/1

**How do developers know what to do?**

- Standards documented on dev branch
- CI links failures to relevant standards
- Every runtime component traces back to requirement

**How do we make changes?**

1. Develop on dev branch following standards
2. Merge to dev (ci-patterns validates)
3. Auto PR to main (guard-main final check)
4. If all green → deployed to production

---

## Commands to Know

```bash
# Check production score
FRESH_PATTERNS_MIN_SCORE=90 pnpm lint:patterns

# Expected output:
# 💎 SCORE: 130.0 points — PERFECT
# 🔴 Tier 0: 0
# 🟠 Tier 1: 0

# Verify types
pnpm typecheck

# Verify code quality
pnpm lint

# Start working on feature
git checkout dev
git pull origin dev
git checkout -b feature/my-feature
```

---

## What Each Document Does

| Document                                  | For             | Purpose                    |
| ----------------------------------------- | --------------- | -------------------------- |
| RUNTIME_DOCUMENTATION_INDEX.md            | Everyone        | Master index & entry point |
| PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md | Operations      | Current status overview    |
| PRODUCTION_DEPLOYMENT_GUIDE.md            | Deployment Team | How to deploy              |
| BRANCH_LINKING_GUIDE.md                   | Architects      | How linking works          |
| PHASE_1_TIER_0_FIXES.md                   | Developers      | Security requirements      |
| PHASE_2_TIER_1_FIXES.md                   | Developers      | Type requirements          |
| SYMMETRY_FRAMEWORK.md                     | Developers      | Architecture requirements  |

---

## If Something Goes Wrong

**CI fails on dev PR:**

1. Read error message (links to standard)
2. Check: `pnpm lint:patterns:verbose`
3. Fix locally following standard
4. Commit and push
5. CI re-runs automatically

**guard-main fails on main PR:**

1. Check guard-main.yml logs
2. Error message links to standard
3. Create fix PR to dev
4. Merge to dev first
5. Auto PR to main will retry
6. guard-main verifies again

**Need to understand a requirement:**

1. Find component on main (runtime)
2. Check BRANCH_LINKING_GUIDE.md
3. Follow link to dev branch standard
4. Read relevant Phase doc
5. See examples and implementation

---

## Your Role

### If you're an Operations Manager

→ Go to [PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md](./PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md)

### If you're a Developer

→ Go to dev branch, read [docs/standards/00_STANDARDS_INDEX.md](../../dev/docs/standards/00_STANDARDS_INDEX.md)

### If you're Deploying

→ Go to [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)

### If you're Auditing

→ Go to [BRANCH_LINKING_GUIDE.md](./BRANCH_LINKING_GUIDE.md)

---

## Status Dashboard

```
✅ PRODUCTION READY
├─ Code Quality:     130.0 / 100
├─ Security:         0 violations (6 endpoints protected)
├─ Integrity:        0 violations (4 schemas verified)
├─ Type Safety:      0 errors
├─ Build Status:     SUCCESS
├─ Deployment Gate:  guard-main.yml ACTIVE
└─ Documentation:    COMPLETE & LINKED
```

---

**Last Updated:** 2025-11-28  
**Start Here:** [RUNTIME_DOCUMENTATION_INDEX.md](./RUNTIME_DOCUMENTATION_INDEX.md)  
**All Good:** Yes ✅
