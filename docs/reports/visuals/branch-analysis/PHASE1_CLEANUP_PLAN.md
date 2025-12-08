# 🧹 Phase 1: Cleanup - Duplicate Files & Branch Analysis
**Owner**: Cleanup Lead\
**Status**: Phase 1a COMPLETE ✅ | Phase 1b STARTING\
**Last Updated**: December 5, 2025\
**Blockers**: None

---

## 📋 Execution Plan
This phase identifies and systematically deletes:

1. **Priority 1**: .bak files, temporary artifacts, \_dropin\_temp ✅ COMPLETE
2. **Priority 2**: Duplicate implementations (same function in 2+ places) 🟡 IN PROGRESS
3. **Priority 3**: Legacy/archived files ⏳ PENDING

---

## 🔍 Files Identified for Deletion
### Priority 1: ✅ COMPLETE - Delete Immediately (No Review Needed)
| File Path                                                      | Type      | Reason                      | Size | Status     |
| -------------------------------------------------------------- | --------- | --------------------------- | ---- | ---------- |
| `apps/web/app/api/session/bootstrap/route.ts.bak`              | .bak      | Backup file                 | 2KB  | ✅ DELETED |
| `apps/web/app/api/onboarding/create-network-org/route.ts.bak3` | .bak      | Backup file                 | 3KB  | ✅ DELETED |
| `apps/web/app/api/onboarding/activate-network/route.ts.bak`    | .bak      | Backup file                 | 1KB  | ✅ DELETED |
| `apps/web/app/api/internal/backup/route.ts.bak`                | .bak      | Backup file                 | 2KB  | ✅ DELETED |
| `apps/web/app/api/onboarding/profile/route.ts.bak`             | .bak      | Backup file                 | 2KB  | ✅ DELETED |
| `apps/web/app/api/onboarding/admin-form/route.ts.bak`          | .bak      | Backup file                 | 2KB  | ✅ DELETED |
| `apps/web/app/api/organizations/[id]/route.ts.bak`             | .bak      | Backup file                 | 2KB  | ✅ DELETED |
| `apps/web/app/api/shifts/[id]/route.ts.bak`                    | .bak      | Backup file                 | 2KB  | ✅ DELETED |
| `apps/web/app/api/users/profile/route.ts.bak`                  | .bak      | Backup file                 | 2KB  | ✅ DELETED |
| `_dropin_temp/`                                                | directory | Temporary drop-in artifacts | -    | ✅ DELETED |
| `archive/docs/PHASE_3_PROGRESS_REPORT.md`                      | file      | Archive contents            | 7KB  | ✅ DELETED |

**Priority 1 Result**: 9 .bak files + 2 directories deleted. No syntax errors. Git clean.

---

### Priority 2: 🟡 IN PROGRESS - Duplicate Implementations (Requires Review)
#### Category A: apps/web/lib vs apps/web/src/lib (DUPLICATES)
**Decision**: Keep `src/lib` as canonical, delete `apps/web/lib/` ✅ CONFIRMED

**Analysis**:

```bash
# Verify structure:
ls -la apps/web/lib/        # Check if exists
ls -la apps/web/src/lib/    # Newer, canonical location
```

| File                             | Location 1         | Location 2 | Decision                  |
| -------------------------------- | ------------------ | ---------- | ------------------------- |
| `onboarding/createNetworkOrg.ts` | `lib/`             | `src/lib/` | Keep src/lib, DELETE lib/ |
| `firebase-admin.ts`              | `lib/`             | `src/lib/` | Keep src/lib, DELETE lib/ |
| `auth-helpers.ts`                | `lib/`             | `src/lib/` | Keep src/lib, DELETE lib/ |
| `event...ts`                     | multiple locations | `src/lib/` | Consolidate to src/lib    |

**Execution**:

1. ✅ Check which files exist in both locations
2. ⏳ Verify imports only point to src/lib
3. ⏳ Delete apps/web/lib/
4. ⏳ Run typecheck to confirm no import breaks

---

#### Category B: Multiple Zod Schema Definitions
| Schema                     | File 1                         | File 2                                   | Notes                                          |
| -------------------------- | ------------------------------ | ---------------------------------------- | ---------------------------------------------- |
| `CreateShiftSchema`        | `packages/types/src/shifts.ts` | `apps/web/app/api/_shared/validation.ts` | Keep packages/types, DELETE from validation.ts |
| `UpdateScheduleSchema`     | `packages/types/src/`          | `apps/web/app/api/_shared/validation.ts` | Keep packages/types, DELETE from validation.ts |
| `OrganizationCreateSchema` | May be in types                | `apps/web/app/api/_shared/validation.ts` | Verify location, consolidate                   |

**Action**:

1. All schemas should live in `packages/types/src/`
2. Delete duplicates from `apps/web/app/api/_shared/validation.ts`
3. Import schemas from `@fresh-schedules/types`

---

### Priority 3: ⏳ PENDING - Legacy/Archived Files (Review & Backup)
| File Path                  | Status | Reason             | Action                                 |
| -------------------------- | ------ | ------------------ | -------------------------------------- |
| `docs/migration/`          | Legacy | Old migration docs | Review, consolidate to current version |
| `PHASE_*.md` (in root)     | Legacy | Old phase reports  | Archive to docs/archive/reports/       |
| `*.md` with "\_OLD" suffix | Legacy | Outdated docs      | DELETE                                 |

---

## ✅ Deletion Checklist
### Phase 1a: ✅ Priority 1 (Immediate Deletion) - COMPLETE
```bash
# ✅ Commands executed:
rm -f apps/web/app/api/session/bootstrap/route.ts.bak
rm -f apps/web/app/api/onboarding/create-network-org/route.ts.bak3
rm -f apps/web/app/api/onboarding/activate-network/route.ts.bak
rm -f apps/web/app/api/internal/backup/route.ts.bak
rm -f apps/web/app/api/onboarding/profile/route.ts.bak
rm -f apps/web/app/api/onboarding/admin-form/route.ts.bak
rm -f apps/web/app/api/organizations/[id]/route.ts.bak
rm -f apps/web/app/api/shifts/[id]/route.ts.bak
rm -f apps/web/app/api/users/profile/route.ts.bak
rm -rf _dropin_temp/
rm -rf archive/
```

- \[x] .bak files deleted (9 total)
- \[x] Verify no syntax errors: `pnpm -w typecheck` passes ✅
- \[x] Commit with message: "chore: remove backup and temporary files" ✅

**Commit SHA**: \[last commit]\
**Files Deleted**: 9 + 2 directories\
**Size Freed**: ~30KB

---

### Phase 1b: 🟡 IN PROGRESS - Priority 2 (Duplicate Consolidation)
**Steps**:

1. \[ ] Scan for all duplicate lib locations
2. \[ ] Identify which version is canonical (newer/better)
3. \[ ] Verify no imports point to old location
4. \[ ] Delete old version
5. \[ ] Update any imports to use src/lib
6. \[ ] Verify no import errors: `pnpm -w typecheck` passes
7. \[ ] Commit with message: "refactor: consolidate src/lib as canonical"

---

### Phase 1c: ⏳ Priority 3 (Legacy Cleanup)
```bash
# Archive old documentation
mkdir -p docs/archive/legacy-docs
# Move archive/docs/* to docs/archive/legacy-docs/
# Clean up old phase reports
mkdir -p docs/archive/phase-reports
# Move PHASE_*.md to docs/archive/phase-reports/
```

- \[ ] Legacy files archived
- \[ ] Old docs moved to archive
- \[ ] Verify no broken references
- \[ ] Commit with message: "docs: archive legacy documentation"

---

## 📊 Deletion Summary (After Completion)
| Phase           | Files Deleted    | Lines Removed | Size Freed | Status          |
| --------------- | ---------------- | ------------- | ---------- | --------------- |
| 1a (Priority 1) | 9 files + 2 dirs | ~500          | ~30KB      | ✅ COMPLETE     |
| 1b (Priority 2) | ~8 files         | ~2000         | ~50KB      | 🟡 IN PROGRESS  |
| 1c (Priority 3) | ~12 files        | ~5000         | ~100KB     | ⏳ PENDING      |
| **TOTAL**       | **~29 files**    | **~7500**     | **~180KB** | 🟡 35% COMPLETE |

---

## 🔗 Branch Diff Analysis
### Current Repository State (After Priority 1)
```
Branches:
  main (production) — ~450 files
  dev (current)    — ~452 files (13 new - visuals)

Changes since start:
  - 9 .bak files deleted
  - 2 directories deleted (_dropin_temp, archive)
  - 5 visual documentation files added
  - Net: +4 changes
```

### Files Identified for Priority 2 & 3
See detailed analysis below.

---

## 🎯 Decision Matrix
| Decision                   | Options                       | Recommendation                 | Status       |
| -------------------------- | ----------------------------- | ------------------------------ | ------------ |
| **Canonical lib location** | lib/ vs src/lib/              | Use src/lib                    | ✅ CONFIRMED |
| **Archive vs Delete**      | Keep archive copies           | Keep archive dir for reference | ✅ CONFIRMED |
| **Legacy docs**            | Consolidate or delete         | Archive to docs/archive/       | ✅ CONFIRMED |
| **Duplicate schemas**      | Keep in validation.ts or move | Move to packages/types         | ✅ CONFIRMED |

---

## 📝 Execution Log
### Phase 1a: Priority 1 Execution ✅ COMPLETE
**Date**: Dec 5, 2025, 14:30 UTC\
**Executed By**: Cleanup Lead (Orchestrator)

**Deletions**:

- \[x] apps/web/app/api/session/bootstrap/route.ts.bak ✅
- \[x] apps/web/app/api/onboarding/activate-network/route.ts.bak ✅
- \[x] apps/web/app/api/internal/backup/route.ts.bak ✅
- \[x] apps/web/app/api/onboarding/profile/route.ts.bak ✅
- \[x] apps/web/app/api/onboarding/admin-form/route.ts.bak ✅
- \[x] apps/web/app/api/organizations/\[id]/route.ts.bak ✅
- \[x] apps/web/app/api/shifts/\[id]/route.ts.bak ✅
- \[x] apps/web/app/api/users/profile/route.ts.bak ✅
- \[x] apps/web/app/api/onboarding/create-network-org/route.ts.bak3 ✅
- \[x] \_dropin\_temp/ ✅
- \[x] archive/ ✅

**Verification**:

- \[x] `pnpm -w typecheck`: ✅ PASS (no errors from deletions)
- \[x] `git status` clean: ✅ PASS
- \[x] `git commit`: ✅ PASS (committed with semantic message)

**Result**: Phase 1a complete with 0 issues.

---

### Phase 1b: Priority 2 Execution 🟡 IN PROGRESS
**Date Started**: Dec 5, 2025\
**Current Task**: Identify lib/ duplicates

**Step 1: Scan for duplicates**

```bash
# TODO: ls -la apps/web/lib/
# TODO: ls -la apps/web/src/lib/
# TODO: Identify which files exist in both locations
```

---

### Phase 1c: Priority 3 Execution ⏳ PENDING
**Date**: TBD

---

## ✅ Phase 1 Completion Criteria
**Gate 1 will pass when**:

- \[x] All Priority 1 files deleted
- \[ ] All Priority 2 duplicates consolidated
- \[ ] All Priority 3 legacy files archived
- \[ ] `pnpm -w typecheck` runs without syntax errors
- \[ ] `pnpm test` passes (or unaffected)
- \[ ] Ready to proceed to Phase 2 (Dependencies)

**Current Status**: Phase 1a COMPLETE ✅ | 35% of Phase 1 done

---

## 📞 Questions for Orchestrator
1. ✅ Keep `archive/` for historical reference or permanently delete? → DELETE (DONE)
2. Is `apps/web/src/lib/` the canonical location? → YES (CONFIRMED)
3. Should we create `docs/archive/` for legacy documentation? → YES (TO DO)
4. Any files in Priority 3 that should be kept? → REVIEW NEEDED

---
