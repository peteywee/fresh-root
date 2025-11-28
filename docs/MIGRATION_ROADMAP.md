# FRESH Engine Complete Migration Roadmap

**Status:** 🟢 Standards deployed, baseline captured, Phase 1-3 planned
**Target:** Score 70+ with 0 Tier 0 and 0 Tier 1 violations
**Timeline:** 3-4 hours total (can be split across sessions)

---

## Quick Start

```bash
# 1. See Phase 1 tasks
cat docs/PHASE_1_TIER_0_FIXES.md

# 2. Run baseline and see what needs fixing
FRESH_PATTERNS_MIN_SCORE=0 pnpm lint:patterns --verbose

# 3. Start Phase 1
# Fix the 6 public endpoints + 7 write endpoints

# 4. Verify progress
pnpm lint:patterns

# 5. Commit when done
git add -A
git commit -m "fix: resolve Tier 0 violations"
```

---

## Three-Phase Plan

### Phase 1: Tier 0 Security ⏳ READY TO START
**Duration:** 1-2 hours
**Issues:** 13 Tier 0 violations
- 6 public endpoints missing `withSecurity` wrapper
- 7 write endpoints missing Zod validation

**Files to edit:** 13
**Expected score improvement:** +25 points (0 → 25)
**Completion criteria:** Tier 0 = 0

**Details:** `docs/PHASE_1_TIER_0_FIXES.md`

---

### Phase 2: Tier 1 Integrity ⏳ READY AFTER PHASE 1
**Duration:** 30-45 minutes
**Issues:** 7 Tier 1 violations
- Missing Zod imports/schemas in 3 type files

**Files to edit:** 3
**Expected score improvement:** +7 points (25 → 32)
**Completion criteria:** Tier 1 = 0

**Details:** `docs/PHASE_2_TIER_1_FIXES.md`

---

### Phase 3: Tier 3 Style (Optional) ⏳ READY AFTER PHASE 2
**Duration:** 30-45 minutes
**Issues:** 45 Tier 3 violations
- Missing headers on 32 API routes
- Missing headers on 13 schema files

**Files to edit:** ~45
**Expected score improvement:** +22 points (32 → 54+, reaches 70+ with Triad bonuses)
**Completion criteria:** Tier 3 = 0, Score ≥ 70

**Details:** `docs/PHASE_3_TIER3_CLEANUP.md`

---

## Parallel Paths

**Conservative (sequential):**
1. Phase 1 (2 hrs) → Commit
2. Phase 2 (45 min) → Commit
3. Phase 3 (45 min) → Commit
4. Final verification (15 min)

**Aggressive (parallel):**
- Phase 1 + Phase 2 together (both are independent fixes)
- Phase 3 can start after Phase 1 if needed

---

## Metrics Dashboard

Current State:
```
Tier 0 (Security):    13 ⚠️  →  Target: 0 ✅
Tier 1 (Integrity):   7  ⚠️  →  Target: 0 ✅
Tier 3 (Style):       45 🟡  →  Target: 0 (optional)
Score:                0.0    →  Target: 70+
Complete Triads:      3/3 ✅ →  Target: 3/3 ✅
Branches:             5 ✅   →  Target: 5 ✅
```

---

## Execution Checklist

### Pre-Phase 1
- [ ] Read `docs/PHASE_1_TIER_0_FIXES.md`
- [ ] Understand security wrapper pattern
- [ ] Understand Zod validation pattern
- [ ] Have validator command ready: `pnpm lint:patterns`

### During Phase 1
- [ ] Fix 6 public endpoints with `withSecurity`
- [ ] Fix 7 write endpoints with Zod validation
- [ ] Run validator after each batch
- [ ] Verify Tier 0 → 0
- [ ] Commit with message: "fix: resolve Tier 0 violations"

### Pre-Phase 2
- [ ] Read `docs/PHASE_2_TIER_1_FIXES.md`
- [ ] Review 3 schema files
- [ ] Understand z.infer pattern

### During Phase 2
- [ ] Add Zod schemas to 3 files
- [ ] Verify Tier 1 → 0
- [ ] Commit with message: "fix: resolve Tier 1 violations"

### Pre-Phase 3 (Optional)
- [ ] Read `docs/PHASE_3_TIER3_CLEANUP.md`
- [ ] Decide: automated script or manual

### During Phase 3
- [ ] Add headers to ~45 files
- [ ] Verify Tier 3 → 0 and Score ≥ 70
- [ ] Commit with message: "style: add standard headers"

### Final Verification
- [ ] Run: `pnpm lint:patterns`
  - Expected: Score 70+, Tier 0/1 = 0
- [ ] Run: `pnpm typecheck` (should pass)
- [ ] Run: `pnpm build` (should pass)
- [ ] All 3 phases committed

---

## Command Reference

### Validator Commands

```bash
# Check current status (enforces MIN_SCORE=70)
pnpm lint:patterns

# Verbose output with threshold 0 (see all issues)
pnpm lint:patterns:verbose

# Custom threshold
FRESH_PATTERNS_MIN_SCORE=50 pnpm lint:patterns
```

### Git Commands

```bash
# See changed files
git status

# Stage all changes
git add -A

# Commit with message
git commit -m "fix: phase 1 Tier 0 violations"

# Push to dev
git push origin dev

# View recent commits
git log --oneline -10
```

### Build Verification

```bash
# Type check
pnpm typecheck

# Lint
pnpm lint

# Build
pnpm build

# All three
pnpm ci
```

---

## Key Files Reference

**Standards Documentation:**
- `.github/agents/OPERATING_AGREEMENT.md` — Role and obligations
- `.github/agents/COGNITIVE_ARCHITECTURE.md` — Thinking model
- `docs/standards/SYMMETRY_FRAMEWORK.md` — Layer fingerprints
- `docs/standards/00_STANDARDS_INDEX.md` — Tier definitions

**Phase Plans:**
- `docs/PHASE_1_TIER_0_FIXES.md` — Security fixes (13 issues)
- `docs/PHASE_2_TIER_1_FIXES.md` — Integrity fixes (7 issues)
- `docs/PHASE_3_TIER3_CLEANUP.md` — Style fixes (45 issues, optional)

**Implementation:**
- `scripts/validate-patterns.mjs` — Validator script
- `.github/workflows/ci-patterns.yml` — CI workflow
- `package.json` — Scripts: `lint:patterns`, `lint:patterns:verbose`

**Baseline:**
- `reports/patterns-baseline-*.log` — Starting metrics

---

## Progress Tracking

Use the todo list to track progress:

```bash
# Check current status
git log --oneline | head -5
```

Expected progression:
1. ✅ Migration standards deployed (commit: 95f790c, 2591f01)
2. ⏳ Phase 1 Tier 0 fixes (13 issues)
3. ⏳ Phase 2 Tier 1 fixes (7 issues)
4. ⏳ Phase 3 Tier 3 cleanup (45 issues)
5. ⏳ Final verification (0 errors, Score ≥ 70)

---

## Support & Troubleshooting

**Q: Validator returns errors after my changes?**
- Run: `FRESH_PATTERNS_MIN_SCORE=0 pnpm lint:patterns --verbose`
- Check which file/violation is reported
- Fix that specific issue

**Q: Can I skip a phase?**
- Phases 1 & 2 are required (security + integrity)
- Phase 3 is optional (style only)
- Each phase is independent after Phase 1

**Q: How do I verify a specific fix works?**
- Edit the file
- Run: `pnpm lint:patterns --verbose`
- Look for that file in the output — if gone, it's fixed

**Q: What if something breaks during Phase 1?**
- Run: `pnpm typecheck` to see type errors
- Run: `pnpm lint` to see lint errors
- Undo changes and try again: `git checkout -- <file>`

---

## Timeline Summary

| Phase | Duration | Issues | Score Gain | Status |
|-------|----------|--------|-----------|--------|
| Setup | Complete | — | — | ✅ Done |
| Phase 1 | 1-2 hrs | 13 T0 | +25 | ⏳ Ready |
| Phase 2 | 30-45 min | 7 T1 | +7 | ⏳ Next |
| Phase 3 | 30-45 min | 45 T3 | +22 | ⏳ Optional |
| **Total** | **3-4 hrs** | **65** | **54+** | **🚀** |

---

## Next Steps

1. **Immediately:** Read `docs/PHASE_1_TIER_0_FIXES.md`
2. **Soon:** Start Phase 1 fixes (pick one file, apply pattern)
3. **Then:** Verify with `pnpm lint:patterns`
4. **After Phase 1:** Move to Phase 2
5. **Final:** Commit all changes with clear messages

---

**Ready to start?** Begin with `docs/PHASE_1_TIER_0_FIXES.md` → Task 1.1

For questions, refer to the phase-specific docs or check `docs/FRESH_ENGINE_MIGRATION_STATUS.md` for context.
