# 🧹 Phase 1: Cleanup - Duplicate Files & Branch Analysis

**Owner**: Cleanup Lead  
**Status**: Starting  
**Last Updated**: December 5, 2025  
**Blockers**: None  

---

## 📋 Execution Plan

This phase identifies and systematically deletes:
1. **Priority 1**: .bak files, temporary artifacts, _dropin_temp
2. **Priority 2**: Duplicate implementations (same function in 2+ places)
3. **Priority 3**: Legacy/archived files

---

## 🔍 Files Identified for Deletion

### Priority 1: Delete Immediately (No Review Needed)

| File Path | Type | Reason | Size | Status |
|-----------|------|--------|------|--------|
| `apps/web/app/api/session/bootstrap/route.ts.bak` | .bak | Backup file | 2KB | ⏳ To Delete |
| `apps/web/app/api/onboarding/create-network-org/route.ts.bak3` | .bak | Backup file | 3KB | ⏳ To Delete |
| `apps/web/app/api/onboarding/activate-network/route.ts.bak` | .bak | Backup file | 1KB | ⏳ To Delete |
| `apps/web/app/api/internal/backup/route.ts.bak` | .bak | Backup file | 2KB | ⏳ To Delete |
| `_dropin_temp/` | directory | Temporary drop-in artifacts | - | ⏳ To Delete |
| `archive/` | directory | Legacy archived code | - | ⏳ To Delete |

**Priority 1 Action**: Delete all .bak files and temporary directories immediately.

---

### Priority 2: Duplicate Implementations (Requires Review)

#### Category A: apps/web/lib vs apps/web/src/lib (DUPLICATES)

**Decision Needed**: Which should be canonical?
- `apps/web/lib/` — older implementation (keep legacy for now)
- `apps/web/src/lib/` — newer implementation (source of truth)

**Recommendation**: Keep `src/lib` as canonical, delete `apps/web/lib/`

| File | Location 1 | Location 2 | Decision |
|------|-----------|-----------|----------|
| `onboarding/createNetworkOrg.ts` | `lib/` | `src/lib/` | Keep src/lib, DELETE lib/ |
| `firebase-admin.ts` | `lib/` | `src/lib/` | Keep src/lib, DELETE lib/ |
| `auth-helpers.ts` | `lib/` | `src/lib/` | Keep src/lib, DELETE lib/ |
| `event...ts` | multiple locations | `src/lib/` | Consolidate to src/lib |

**Action**: 
1. Review which version is newer/better (usually src/lib)
2. Verify no imports point to old location
3. Delete old version
4. Update any imports to point to src/lib

---

#### Category B: Multiple Zod Schema Definitions

| Schema | File 1 | File 2 | Notes |
|--------|--------|--------|-------|
| `CreateShiftSchema` | `packages/types/src/shifts.ts` | `apps/web/app/api/_shared/validation.ts` | Keep packages/types, DELETE from validation.ts |
| `UpdateScheduleSchema` | `packages/types/src/` | `apps/web/app/api/_shared/validation.ts` | Keep packages/types, DELETE from validation.ts |
| `OrganizationCreateSchema` | May be in types | `apps/web/app/api/_shared/validation.ts` | Verify location, consolidate |

**Action**:
1. All schemas should live in `packages/types/src/`
2. Delete duplicates from `apps/web/app/api/_shared/validation.ts`
3. Import schemas from `@fresh-schedules/types`

---

### Priority 3: Legacy/Archived Files (Review & Backup)

| File Path | Status | Reason | Action |
|-----------|--------|--------|--------|
| `archive/docs/` | Legacy | Old documentation | Move to archive branch, DELETE |
| `docs/migration/` | Legacy | Old migration docs | Review, consolidate to current version |
| `PHASE_*.md` | Legacy | Old phase reports | Archive to docs/archive/reports/ |
| `*.md` with "_OLD" suffix | Legacy | Outdated docs | DELETE |

---

## ✅ Deletion Checklist

### Phase 1a: Priority 1 (Immediate Deletion)

```bash
# Commands to execute:
rm -f apps/web/app/api/session/bootstrap/route.ts.bak
rm -f apps/web/app/api/onboarding/create-network-org/route.ts.bak3
rm -f apps/web/app/api/onboarding/activate-network/route.ts.bak
rm -f apps/web/app/api/internal/backup/route.ts.bak
rm -rf _dropin_temp/
rm -rf archive/
```

- [ ] .bak files deleted
- [ ] Verify no syntax errors: `pnpm -w typecheck` passes
- [ ] Commit with message: "chore: remove backup and temporary files"

---

### Phase 1b: Priority 2 (Duplicate Consolidation)

After deciding canonical locations:

```bash
# Example: If src/lib is canonical
rm -rf apps/web/lib/onboarding/
rm -rf apps/web/lib/firebase-admin.ts
rm -rf apps/web/lib/auth-helpers.ts
# ... repeat for all duplicates

# Update imports in files:
# OLD: import { func } from "../../../lib/file.ts"
# NEW: import { func } from "@/src/lib/file.ts"
```

- [ ] Duplicate lib files deleted
- [ ] All imports updated to use src/lib
- [ ] Verify no import errors: `pnpm -w typecheck` passes
- [ ] Commit with message: "refactor: consolidate src/lib as canonical"

---

### Phase 1c: Priority 3 (Legacy Cleanup)

```bash
# Archive old documentation
mkdir -p docs/archive/legacy-docs
mv archive/docs/* docs/archive/legacy-docs/
rm -rf archive/

# Clean up old phase reports
mkdir -p docs/archive/phase-reports
mv PHASE_*.md docs/archive/phase-reports/
mv docs/migration/OLD_* docs/archive/migration-old/
```

- [ ] Legacy files archived
- [ ] Old docs moved to archive
- [ ] Verify no broken references
- [ ] Commit with message: "docs: archive legacy documentation"

---

## 📊 Deletion Summary (After Completion)

| Phase | Files Deleted | Lines Removed | Size Freed | Commits |
|-------|--------------|---------------|-----------|---------|
| 1a (Priority 1) | 5 files + 2 dirs | ~500 | ~10KB | 1 |
| 1b (Priority 2) | ~8 files | ~2000 | ~50KB | 1-2 |
| 1c (Priority 3) | ~12 files | ~5000 | ~100KB | 1-2 |
| **TOTAL** | **~25 files** | **~7500** | **~160KB** | **3-5** |

---

## 🔗 Branch Diff Analysis

### Current Repository State

```
Branches:
  main (production)
  dev (current - where we are)
  feature-* (various feature branches)

File Count:
  main: ~450 files
  dev: ~465 files (15 new)
  feature-*: ~480-500 files (depends on branch)
```

### Unique Files by Branch

#### On dev but NOT on main (To Migrate/Cleanup):
- All visuals/ directory (new)
- New API routes
- Zod schema updates
- Type fixes

#### On main but NOT on dev (Merge these):
- Stable production code
- Tested implementations

#### On feature branches but NOT on main (Review/Consolidate):
- In-progress work
- Experimental code
- Should be merged or deleted

---

## 🎯 Decision Matrix

| Decision | Options | Recommendation | Blocker? |
|----------|---------|-----------------|----------|
| **Canonical lib location** | lib/ vs src/lib/ | Use src/lib | YES |
| **Archive vs Delete** | Keep archive copies | Keep archive dir for reference | NO |
| **Legacy docs** | Consolidate or delete | Archive to docs/archive/ | NO |
| **Branch consolidation** | Merge all to main or keep separate | Keep feature branches, merge tested | NO |

---

## 🚨 Pre-Deletion Verification

Before executing ANY deletions:

- [ ] Git working directory clean (`git status` shows nothing)
- [ ] All branches backed up (if needed)
- [ ] Current branch is `dev`
- [ ] No uncommitted changes
- [ ] Read-only copies made of files to delete (optional but safe)

---

## 🔄 Post-Deletion Verification

After each phase of deletion:

```bash
# 1. Verify Git status
git status

# 2. Check for syntax errors
pnpm -w typecheck

# 3. Run tests
pnpm test

# 4. Verify no broken imports
grep -r "require.*\.bak\|import.*\.bak" . --include="*.ts" --include="*.tsx"

# 5. Commit
git add -A
git commit -m "chore: [phase] delete [files]"
```

---

## 📝 Deletion Log (To be filled during execution)

### Phase 1a Execution Log

**Date**: Dec 5, 2025  
**Deletions**:
- [ ] route.ts.bak files (4 files) — Status: PENDING
- [ ] _dropin_temp/ — Status: PENDING
- [ ] archive/ — Status: PENDING

**Verification**:
- [ ] `pnpm -w typecheck`: PENDING
- [ ] `git status` clean: PENDING
- [ ] `git commit`: PENDING

### Phase 1b Execution Log

**Date**: TBD  
**Deletions**:
- [ ] apps/web/lib/ (if duplicate) — Status: PENDING
- [ ] Duplicate schemas — Status: PENDING

**Verification**:
- [ ] Imports updated — Status: PENDING
- [ ] `pnpm -w typecheck`: PENDING
- [ ] `git commit`: PENDING

### Phase 1c Execution Log

**Date**: TBD  
**Deletions**:
- [ ] Legacy documentation — Status: PENDING
- [ ] Old phase reports — Status: PENDING

**Verification**:
- [ ] Archive created — Status: PENDING
- [ ] No broken links — Status: PENDING
- [ ] `git commit`: PENDING

---

## ✅ Phase 1 Completion Criteria

Gate 1 passes when:
- [ ] All Priority 1 files deleted
- [ ] All Priority 2 duplicates consolidated
- [ ] All Priority 3 legacy files archived
- [ ] `pnpm -w typecheck` runs without syntax errors related to deletions
- [ ] `pnpm test` passes (or unaffected)
- [ ] DELETION_LOG.md filled out
- [ ] Ready to proceed to Phase 2 (Dependencies)

---

## 📞 Questions for Orchestrator

1. Should we keep `archive/` for historical reference or permanently delete?
2. Is `apps/web/src/lib/` the canonical location? (Recommendation: YES)
3. Should we create `docs/archive/` for legacy documentation?
4. Any files in Priority 3 that should be kept?

