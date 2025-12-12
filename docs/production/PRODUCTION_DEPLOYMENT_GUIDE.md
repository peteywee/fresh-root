# Production Deployment Guide

**Status:** Ready for Production\
**Date:** November 28, 2025\
**Target Branch:** main\
**Standard:** 90+ Pattern Score (Current: 130.0)

---

## Pre-Deployment Checklist

✅ **Code Quality Verification**

- Pattern Score: 130.0 (exceeds 90+ threshold by 40 points)
- Tier 0 Violations: 0 (all security wrappers present)
- Tier 1 Violations: 0 (all integrity checks present)
- TypeScript: 0 compilation errors
- ESLint: 0 blocking errors
- Build: SUCCESS

✅ **Security Hardening**

- 6 public endpoints: `withSecurity` wrapper ✅
- 7 write endpoints: Zod validation ✅
- All schemas: Zod + z.infer type exports ✅
- No unauthenticated access possible ✅

✅ **Integrity Verification**

- All schemas have Zod imports ✅
- All types derived from schemas ✅
- Single source of truth enforced ✅
- No duplicate type definitions ✅

✅ **Architecture Alignment**

- 3 Complete Triads: Schedule, Organization, Shift ✅
- Schema ↔ API ↔ Rules alignment verified ✅
- All entities covered ✅

✅ **CI/CD Pipeline**

- guard-main.yml configured and active ✅
- ci-patterns.yml enforcing 90+ ✅
- pr.yml fast-track operational ✅
- All pre-push hooks active ✅

---

## Deployment Steps

### Step 1: Verify Current State on Dev

```bash
# Ensure on dev branch
git checkout dev
git pull origin dev

# Run final checks
pnpm lint:patterns        # Should show 130.0 score
pnpm typecheck           # Should show 0 errors
pnpm lint                # Should show 0 errors
```

Expected output:

```
💎 SCORE: 130.0 points — PERFECT
🔴 Tier 0: 0
🟠 Tier 1: 0
✅ All checks passing
```

### Step 2: Create Release Branch

```bash
# Create release branch from dev
git checkout -b release/production-ready

# This branch will be merged to main after final verification
git push origin release/production-ready
```

### Step 3: Create PR to Main

On GitHub:

1. Open PR: `release/production-ready` → `main`
2. Add title: `chore: deploy production-ready code (Score: 130.0, Tier 0/1: 0)`
3. Add description:

```markdown
## Production Deployment

- Pattern Score: 130.0/100 (44+ above 90 requirement)
- Tier 0 (Security): 0 violations ✅
- Tier 1 (Integrity): 0 violations ✅
- TypeScript: 0 errors ✅
- ESLint: 0 blocking errors ✅
- Build: SUCCESS ✅

This PR contains all production-ready code. guard-main.yml will run final verification before merge.
```

### Step 4: guard-main.yml Executes

Automatic workflow runs:

```
✅ Pattern Validator (90+ threshold)
✅ TypeScript Compilation
✅ ESLint Code Quality
✅ Build Verification
✅ Source Branch Validation (release/production-ready → main)
✅ Success Comment: "Production Gate: PASSED"
```

### Step 5: Merge to Main

Once guard-main shows ✅ green:

```bash
# Via GitHub UI:
1. Click "Squash and merge"
2. Commit message: "chore: deploy production (Score 130.0, Tier 0/1: 0)"
3. Confirm merge
```

Or via CLI:

```bash
git checkout main
git pull origin main
git merge release/production-ready --squash
git commit -m "chore: deploy production (Score 130.0, Tier 0/1: 0)"
git push origin main
```

### Step 6: Verify on Production

```bash
# Verify main branch has code
git checkout main
git pull origin main

# Final verification
FRESH_PATTERNS_MIN_SCORE=90 pnpm lint:patterns

# Expected: 💎 SCORE: 130.0 points — PERFECT
```

---

## Post-Deployment

### Verify Production Deployment

```bash
# Check main branch latest commit
git log main -1 --oneline

# Verify production gate passed
# (Check GitHub Actions tab for guard-main workflow)
# Confirm score still at 90+
FRESH_PATTERNS_MIN_SCORE=90 pnpm lint:patterns
```

### Update Documentation

On main branch after successful deployment:

1. Verify [PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md](./PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md)
   is current
2. Check [RUNTIME_DOCUMENTATION_INDEX.md](./RUNTIME_DOCUMENTATION_INDEX.md) links are valid
3. Confirm CI workflows visible in `.github/workflows/`

### Monitor Production

Set up alerts for:

- guard-main workflow failures
- Pattern validation score drops
- Tier 0/1 violations appearing
- Type errors or ESLint errors

---

## Rollback Plan (If Needed)

If production issues detected after deployment:

### Option 1: Quick Revert

```bash
git revert HEAD --no-edit
git push origin main
```

This creates a revert commit, automatically triggers guard-main for verification.

### Option 2: Hotfix Branch

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/issue-description

# Fix issue locally
# ... make changes ...
# Create PR: hotfix/issue-description → main
# guard-main verifies
# Merge when green
```

### Option 3: Return to Previous Commit

```bash
git checkout main
git reset --hard <previous-commit-hash>
git push origin main --force-with-lease
```

**Warning:** Force push only if absolutely necessary. guard-main is re-triggered.

---

## Documentation Links (Runtime Only)

### For Operations Team

- **Deployment Status:**
  [PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md](./PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md)
- **Full Analysis:** [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md)
- **CI/CD Logs:** `.github/workflows/guard-main.yml` (GitHub Actions)

### For Development Team

- **Standards Reference:** See dev branch
  [docs/standards/00_STANDARDS_INDEX.md](../../dev/docs/standards/00_STANDARDS_INDEX.md)
- **Implementation Guides:** See dev branch
  [docs/PHASE\_\*.md](../../dev/docs/PHASE_1_TIER_0_FIXES.md)
- **Architecture:** See dev branch
  [docs/standards/SYMMETRY_FRAMEWORK.md](../../dev/docs/standards/SYMMETRY_FRAMEWORK.md)

### For Operators

- **Guard Workflows:** `.github/workflows/guard-main.yml` (production gate)
- **Pattern Validation:** `scripts/validate-patterns.mjs` (90+ enforcement)
- **Build Artifacts:** Verified by guard-main on every PR to main

---

## Continuous Monitoring

### Automated Checks on Main

Every commit to main triggers:

1. **guard-main.yml** (if PR from dev)
   - Pattern Score >= 90
   - Tier 0 = 0 violations
   - Tier 1 = 0 violations
   - TypeScript compilation
   - ESLint verification
   - Build success

1. **Automatic Deployment** (when all pass)
   - GitHub Actions deploys to production
   - No manual intervention needed
   - Status posted to PR

### Manual Verification

Daily:

```bash
git checkout main
pnpm lint:patterns     # Verify 90+ score
```

---

## Support Contacts

**If guard-main fails on PR to main:**

- Check CI logs in GitHub Actions
- Follow diagnostic guidance in failure comment
- See dev branch standards docs for requirements

**If production detects issues:**

- Check main branch commit history
- Review guard-main workflow logs
- Prepare hotfix PR to dev, then main

**If unsure about deployment status:**

- Check [RUNTIME_DOCUMENTATION_INDEX.md](./RUNTIME_DOCUMENTATION_INDEX.md)
- See metrics in
  [PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md](./PRODUCTION_READINESS_EXECUTIVE_SUMMARY.md)
- Verify guard-main logs on GitHub

---

## Success Criteria

✅ **Deployment Successful When:**

- PR to main shows "✅ Production Gate: PASSED"
- guard-main.yml shows all green checks
- Merge to main completes without errors
- Pattern score remains 90+
- Zero Tier 0/1 violations on main
- No new errors in build or types

---

## Quick Reference

| Step    | Command                                                               | Expected Result  |
| ------- | --------------------------------------------------------------------- | ---------------- |
| Verify  | `pnpm lint:patterns`                                                  | Score 130.0 ✅   |
| Branch  | `git checkout -b release/production-ready`                            | Branch created   |
| PR      | Create on GitHub                                                      | guard-main runs  |
| Gate    | Wait for guard-main ✅                                                | All checks pass  |
| Merge   | Squash & merge on GitHub                                              | Deployed to main |
| Confirm | `git checkout main && FRESH_PATTERNS_MIN_SCORE=90 pnpm lint:patterns` | Score 130.0 ✅   |

---

**Last Updated:** 2025-11-28\
**Deployed By:** FRESH Engine\
**Status:** READY FOR DEPLOYMENT ✅
