# 🌳 Branch Consolidation & Analysis
**Owner**: Documentation Lead / Orchestrator\
**Purpose**: Visual guide to branch structure and consolidation strategy\
**Last Updated**: December 5, 2025

---

## 📊 Current Branch State
```
Repository Structure:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  MAIN (Production)                                          │
│  ├─ Stable code                                             │
│  ├─ All tests passing                                       │
│  └─ Ready for deployment                                   │
│                                                             │
│  ↓ (Merge direction)                                        │
│                                                             │
│  DEV (Development - CURRENT)                                │
│  ├─ New features                                            │
│  ├─ Type fixes (97 errors)                                  │
│  ├─ Cleanup work (this sprint)                              │
│  ├─ Visuals/ directory (NEW)                                │
│  └─ Not yet ready for production                            │
│                                                             │
│  ↙─── FEATURE BRANCHES (Various)                            │
│  │    ├─ fix/config-typeerrors                              │
│  │    ├─ dep-fixes                                          │
│  │    └─ Other in-progress work                             │
│  │                                                          │
│  └─── docs-and-tests (NEW - proposed)                      │
│       └─ For visual documentation updates                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ File Distribution by Branch
### main (Production - Baseline)
```
Total Files: ~450
├─ apps/web/ ........................ ~180 files
│  ├─ app/ .......................... ~120 (routes, API, pages)
│  ├─ lib/ .......................... ~40 (utilities)
│  ├─ src/ .......................... ~20 (newer source)
│  └─ public/ ....................... ~5 (assets)
├─ packages/ ........................ ~100 files
│  ├─ types/src/ .................... ~35 (Zod schemas)
│  ├─ api-framework/src/ ............ ~30 (endpoint SDK)
│  ├─ ui/src/ ....................... ~20 (components)
│  └─ other packages ................ ~15
├─ functions/src/ ................... ~40 files (Cloud Functions)
├─ tests/ ........................... ~30 files
├─ docs/ ............................ ~50 files
└─ config & root files .............. ~10 files
```

### dev (Current - Our Branch)
```
Total Files: ~465 (+15 from main)
├─ [All of main]
├─ docs/visuals/ .................... ~15 files (NEW)
│  ├─ architecture/ ................. ~5
│  ├─ progress/ ..................... ~3
│  ├─ branch-analysis/ .............. ~4
│  ├─ type-errors/ .................. ~2
│  └─ dependencies/ ................. ~1
├─ Type fixes (in-progress) ......... ~0 new files
├─ Dependency updates (in-progress) . ~0 new files
└─ Cleanup targets (to DELETE) ...... ~5 files
   ├─ *.bak files ................... ~4
   ├─ _dropin_temp/ ................. ~1
   └─ duplicate libs ................ ~TBD
```

### Feature Branches (Various)
```
fix/config-typeerrors: ~480 files (+30 from main)
├─ Type error fixes (partially complete)
├─ Schema updates
├─ May have duplicate fixes
└─ Should be merged or consolidated

dep-fixes: ~475 files (+25 from main)
├─ Dependency resolution attempts
├─ May have conflicting fixes
└─ Should be reviewed before merge
```

---

## 📋 File Consolidation Decisions
### ✅ Decision 1: Canonical lib Location
**Question**: apps/web/lib vs apps/web/src/lib?

**Analysis**:

```
apps/web/lib/ (OLD):
  ├─ firebase-admin.ts
  ├─ onboarding/
  │  └─ createNetworkOrg.ts
  └─ [other utilities]
  Status: Legacy location

apps/web/src/lib/ (NEW):
  ├─ firebase-admin.ts
  ├─ onboarding/
  │  ├─ createNetworkOrg.ts
  │  └─ adminFormDrafts.ts
  └─ [utilities]
  Status: Active, canonical

Recommendation: ✅ USE src/lib/ as canonical
Action: DELETE apps/web/lib/
```

### ✅ Decision 2: Zod Schemas Location
**Question**: Where should all schemas live?

**Current State**:

```
packages/types/src/:
  ├─ shifts.ts ...................... ✅ Source of truth
  ├─ schedules.ts ................... ✅ Source of truth
  ├─ organizations.ts ............... ✅ Source of truth
  └─ [all domain schemas]

apps/web/app/api/_shared/validation.ts:
  ├─ CreateShiftSchema (DUPLICATE)
  ├─ UpdateScheduleSchema (DUPLICATE)
  ├─ OrganizationCreateSchema (DUPLICATE)
  └─ [other duplicates] ❌

Recommendation: ✅ Keep ALL in packages/types
Action: DELETE duplicates from validation.ts
        Import from @fresh-schedules/types
```

### ✅ Decision 3: Legacy File Archival
**Question**: What happens to old files?

**Strategy**:

```
Priority 1 (DELETE Immediately):
  - *.bak files (backups)
  - _dropin_temp/ (temporary)
  → These serve no purpose, DELETE

Priority 2 (ARCHIVE):
  - archive/ directory
  - Old phase reports (PHASE_*.md)
  - Legacy documentation
  → Move to docs/archive/ with timestamp
  → Keep as reference only

Priority 3 (CONSOLIDATE):
  - Old docs in multiple places
  - Duplicated utilities
  → Consolidate to single location
  → Keep only the "truth"
```

---

## 🔄 Merge Strategy
### Current Situation
```
Timeline:
┌──────────────────────────────────────────────────────────┐
│ main (Production)                                        │
│ ~450 files ✅ Stable                                     │
│                                                          │
│ ↑ (merge when ready)                                     │
│                                                          │
│ dev (Current Work) ← YOU ARE HERE                        │
│ ~465 files                                               │
│ - 15 new visuals/                                        │
│ - ~97 TS errors to fix                                   │
│ - Files to delete (~5)                                   │
│ - Packages to install (~9)                               │
│                                                          │
│ fix/config-typeerrors (Partial work)                     │
│ ~480 files                                               │
│ - May have conflicting fixes                             │
│ - Need review before merge                               │
│                                                          │
│ dep-fixes (Partial work)                                 │
│ ~475 files                                               │
│ - Dependency experiments                                 │
│ - May be stale                                           │
└──────────────────────────────────────────────────────────┘
```

### Recommended Merge Flow
**Phase 1: Consolidate on dev**

```
Step 1: Complete cleanup on dev
        - Delete .bak files
        - Remove duplicates
        - No NEW merges from feature branches
        Status: dev = CLEAN

Step 2: Complete dependency phase
        - Install all missing packages
        - Update lockfile
        Status: pnpm install passes

Step 3: Complete type safety phase
        - Fix all 97 TypeScript errors
        - Verify packages/types exports work
        Status: pnpm typecheck = 0 errors

Step 4: Final validation on dev
        - All tests pass
        - Lint passes
        - Format passes
        Status: dev = READY
```

**Phase 2: Review feature branches**

```
Step 5: Review fix/config-typeerrors
        - Check if fixes conflict with our work
        - If yes: REJECT (our fixes are better)
        - If no: Can merge after main

Step 6: Review dep-fixes
        - Check if dependency choices align
        - If yes: Can merge after main
        - If no: REJECT (our approach is cleaner)

Status: Feature branches = EVALUATED
```

**Phase 3: Merge to main**

```
Step 7: Merge dev → main
        - All gates pass
        - No conflicts with main
        - Production ready
        Status: main = UPDATED

Step 8: Create docs-and-tests branch
        - Separate branch for visual updates
        - Continuous documentation updates
        - No code changes, only docs/visuals/

Step 9: Archive old branches
        - Create archive record of feature branches
        - Document what was in each
        - Close or delete old branches
        Status: Repository = CLEAN
```

---

## 🎯 Action Items by Role
### Cleanup Lead
```
Phase 1: Branch Analysis
├─ [ ] List all files in main
├─ [ ] List all files in dev
├─ [ ] Identify unique files per branch
├─ [ ] Generate diff report
└─ ARTIFACT: docs/visuals/branch-analysis/BRANCH_DIFF_VISUAL.md

Phase 2: Deletion Planning
├─ [ ] Prioritize deletions (Priority 1, 2, 3)
├─ [ ] Create DUPLICATE_FILES.md
├─ [ ] Create deletion checklist
└─ ARTIFACT: docs/visuals/branch-analysis/PHASE1_CLEANUP_PLAN.md ✅

Phase 3: Execution
├─ [ ] Delete Priority 1 (.bak files)
├─ [ ] Execute deletions in batches
├─ [ ] Update DELETION_LOG.md
└─ ARTIFACT: docs/visuals/branch-analysis/DELETION_LOG.md
```

### Documentation Lead
```
Continuous: Visual Updates
├─ [ ] Update DASHBOARD.md after each phase
├─ [ ] Generate ASCII progress bars
├─ [ ] Maintain this branch consolidation doc
├─ [ ] Create visual diff (tree format)
└─ ARTIFACTS: docs/visuals/progress/*
```

---

## 📊 Visual: File Consolidation Before & After
### BEFORE Consolidation (Current dev branch)
```
apps/web/
├─ lib/ ......................... (DUPLICATES)
│  ├─ firebase-admin.ts
│  ├─ auth-helpers.ts
│  └─ onboarding/
│     └─ createNetworkOrg.ts
├─ src/lib/ ..................... (CANONICAL)
│  ├─ firebase-admin.ts
│  ├─ auth-helpers.ts
│  └─ onboarding/
│     ├─ createNetworkOrg.ts
│     └─ adminFormDrafts.ts
├─ app/api/
│  ├─ _shared/
│  │  └─ validation.ts ......... (HAS DUPLICATE SCHEMAS)
│  └─ [routes]
└─ app/(auth)
   └─ [pages]

_dropin_temp/ .................. (DELETE)
archive/ ........................ (ARCHIVE)
*.bak files ..................... (DELETE)

Status: MESSY (465 files, duplicates exist)
```

### AFTER Consolidation (Post-cleanup)
```
apps/web/
├─ src/lib/ ..................... (SINGLE CANONICAL)
│  ├─ firebase-admin.ts
│  ├─ auth-helpers.ts
│  └─ onboarding/
│     ├─ createNetworkOrg.ts
│     └─ adminFormDrafts.ts
├─ app/api/
│  ├─ _shared/
│  │  └─ validation.ts ......... (IMPORTS schemas from @fresh-schedules/types)
│  └─ [routes]
└─ app/(auth)
   └─ [pages]

packages/types/src/ ............ (SCHEMAS - source of truth)
├─ shifts.ts
├─ schedules.ts
├─ organizations.ts
└─ [all schemas]

docs/archive/ ................... (LEGACY - reference only)
docs/visuals/ ................... (NEW - active documentation)

Status: CLEAN (450 files, no duplicates)
```

---

## ✅ Consolidation Checklist
### Pre-Consolidation
- \[ ] All branches backed up (or documented)
- \[ ] Current branch is `dev`
- \[ ] Git status clean
- \[ ] Decision matrix reviewed (lib location, schema location, etc.)

### During Consolidation
- \[ ] Delete .bak files
- \[ ] Remove \_dropin\_temp directory
- \[ ] Archive old files to docs/archive/
- \[ ] Consolidate apps/web/lib → apps/web/src/lib
- \[ ] Update imports to use src/lib
- \[ ] Remove duplicate schemas from validation.ts
- \[ ] Verify no syntax errors

### Post-Consolidation
- \[ ] `pnpm -w typecheck` passes
- \[ ] `pnpm test` passes (or unaffected)
- \[ ] `pnpm lint` passes
- \[ ] Commit all changes
- \[ ] Update DASHBOARD.md
- \[ ] Ready for Phase 2

---

## 🔗 Related Documents
- `TEAM_STRUCTURE.md` — Specialist roles and responsibilities
- `DASHBOARD.md` — Live progress tracker
- `PHASE1_CLEANUP_PLAN.md` — Detailed cleanup execution
- `DELETION_LOG.md` — Record of deleted files (to be created)
- `BRANCH_DIFF_VISUAL.md` — Visual diff of branches (to be created)
