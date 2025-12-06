# 🏗️ Fresh Root Architecture: Complete System Topology & Organization Guide

**Owner**: Architecture Lead / Technical Orchestrator  
**Purpose**: Comprehensive visual guide to codebase structure, branch topology, deduplication strategy, and documentation audit  
**Last Updated**: December 5, 2025  
**Status**: Production Reference + Cleanup Action Plan

---

## 📑 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture Layers](#system-architecture-layers)
3. [Codebase Topology](#codebase-topology)
4. [Branch & File Distribution Analysis](#branch--file-distribution-analysis)
5. [Deduplication Index](#deduplication-index)
6. [Documentation Audit](#documentation-audit)
7. [Deletion & Consolidation Strategy](#deletion--consolidation-strategy)
8. [Visual Diagrams](#visual-diagrams)
9. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

**Fresh Root** is a production-grade **Next.js 16 + Firebase PWA** with enterprise security, hierarchical RBAC, and comprehensive observability. The codebase exhibits:

### ✅ Strengths

- Clear **layered architecture** (Domain → App Libs → API Edge → Client)
- **SDK Factory pattern** for type-safe API routes (90%+ coverage)
- **Zod-first validation** across all boundaries
- Comprehensive **security by default** (CSRF, rate limiting, org isolation)
- Multiple **branches** with partial/experimental work

### ⚠️ Issues to Address

- **Duplicate code** (lib/, src/lib/, schemas in validation.ts)
- **Outdated docs** (PHASE reports, experimental branches, archived patterns)
- **File organization** gaps (scattered docs, unclear consolidation)
- **Branch confusion** (fix/config-typeerrors, dep-fixes, docs-and-tests overlap)

### 🎯 Opportunities

- **~40-50 outdated doc files** can be archived/merged
- **~15-20 duplicate utilities** across lib/ and src/lib/
- **~10 schema duplicates** to consolidate
- **Clear deduplication path** without breaking code

---

## System Architecture Layers

```
┌─────────────────────────────────────────────────────────────────────────┐
│ LAYER 00: DOMAIN (Single Source of Truth)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  packages/types/src/                                                    │
│  ├─ shifts.ts ..................... ✅ Canonical Zod schemas            │
│  ├─ schedules.ts .................. ✅ All shift/schedule entities     │
│  ├─ organizations.ts .............. ✅ Org & membership schemas        │
│  ├─ positions.ts .................. ✅ Positions, venues, zones        │
│  ├─ session.ts .................... ✅ Auth & session types           │
│  ├─ rbac.ts ....................... ✅ Role hierarchy definitions      │
│  └─ internal.ts ................... ✅ Internal operations            │
│                                                                         │
│  Properties:                                                            │
│  • Single export per domain                                             │
│  • Zod schemas ONLY (no TS interfaces)                                  │
│  • Re-exported in packages/types/src/index.ts                          │
│  • Used by ALL layers via @fresh-schedules/types                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ LAYER 01: INFRASTRUCTURE (Framework & Services)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  packages/api-framework/src/                                            │
│  ├─ index.ts ...................... ✅ SDK factory (all endpoints)     │
│  └─ testing.ts .................... ✅ Mock request/context builders   │
│                                                                         │
│  apps/web/lib/                                                          │
│  ├─ firebase-admin.ts ............. ✅ Firebase Admin singleton        │
│  ├─ onboarding/            ........✅ Onboarding helpers              │
│  └─ [legacy utilities]  ........... ⚠️  DEPRECATED (move to src/lib)  │
│                                                                         │
│  apps/web/src/lib/                                                      │
│  ├─ firebase-admin.ts ............. ✅ Alias for apps/web/lib/        │
│  ├─ firebase.server.ts ............ ✅ Server-side Firebase helpers   │
│  ├─ firebase/typed-wrappers.ts .... ✅ Type-safe Firestore ops       │
│  ├─ env.ts ........................ ✅ Validated environment vars      │
│  ├─ logger.ts ..................... ✅ Structured logging             │
│  ├─ onboarding/            ........✅ Onboarding business logic       │
│  └─ [helpers]  ................... ✅ General utilities               │
│                                                                         │
│  Properties:                                                            │
│  • Pure functions, no side effects                                      │
│  • Error handling built-in                                              │
│  • Type-safe (Zod validation)                                           │
│  • Imported by Layer 02 (App Logic) and Layer 03 (API Edge)            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ LAYER 02: APPLICATION (Business Logic & Features)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  apps/web/src/lib/                                                      │
│  ├─ onboarding/adminFormDrafts.ts . ✅ Onboarding domain logic        │
│  ├─ [feature]/handlers.ts ......... ✅ Business operations            │
│  └─ [feature]/utilities.ts ........ ✅ Feature-specific helpers       │
│                                                                         │
│  functions/src/                                                         │
│  ├─ domain/ ........................✅ Domain business logic           │
│  ├─ denormalization.ts ............ ✅ Event-driven sync logic        │
│  ├─ ledger.ts ..................... ✅ Audit logging                  │
│  └─ onboarding.ts ................. ✅ Onboarding cloud functions     │
│                                                                         │
│  Properties:                                                            │
│  • Feature-specific business logic                                      │
│  • Depends on Layer 00 (schemas) and Layer 01 (infrastructure)         │
│  • Used by Layer 03 (API routes) and Layer 04 (Client)                │
│  • No HTTP concerns here                                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ LAYER 03: API EDGE (Request/Response Boundary)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  apps/web/app/api/                                                      │
│  ├─ [resource]/route.ts ........... ✅ SDK factory pattern            │
│  ├─ _template/route.ts ............ ✅ Reference template             │
│  ├─ _shared/validation.ts ......... ⚠️  LEGACY (imports from types)  │
│  └─ [nested]/route.ts ............ ✅ All routes type-safe            │
│                                                                         │
│  firestore.rules ..................✅ Security rules for Firestore    │
│  storage.rules ...................✅ Security rules for Storage        │
│                                                                         │
│  Properties:                                                            │
│  • Thin handlers: parse → validate → auth → call Layer 02 → respond   │
│  • Uses SDK factory for built-in middleware                            │
│  • Zod validation via Layer 00 schemas                                 │
│  • Returns structured JSON (error or data)                             │
│  • NO business logic here (that's Layer 02)                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ LAYER 04: CLIENT (UI & User Interaction)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  apps/web/app/(routes)/                                                │
│  ├─ (auth)/               ........✅ Authentication pages             │
│  ├─ (onboarding)/         ........✅ Onboarding flows                 │
│  ├─ dashboard/            ........✅ Main app UI                      │
│  └─ [page].tsx ..................✅ Server/client components          │
│                                                                         │
│  apps/web/src/components/                                               │
│  ├─ shared/               ........✅ Reusable UI components           │
│  ├─ [feature]/            ........✅ Feature-specific components      │
│  └─ layouts/              ........✅ Page layouts                     │
│                                                                         │
│  packages/ui/src/                                                       │
│  └─ [component]/index.tsx .........✅ Design system components        │
│                                                                         │
│  Properties:                                                            │
│  • React Server & Client Components                                    │
│  • Uses Layer 01 Firebase client SDK                                   │
│  • Calls Layer 03 API routes via fetch/TanStack Query                 │
│  • Validates with Zod schemas (Layer 00)                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE: CONFIG & TOOLING                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  packages/config/src/                                                   │
│  └─ index.ts ..................... ✅ Shared configuration constants  │
│                                                                         │
│  packages/env/src/                                                      │
│  └─ index.ts ..................... ✅ Environment variable validation │
│                                                                         │
│  Root Configuration:                                                    │
│  ├─ tsconfig.json ................✅ TypeScript configuration         │
│  ├─ tailwind.config.cjs ...........✅ TailwindCSS theme               │
│  ├─ next.config.mjs ..............✅ Next.js configuration           │
│  ├─ turbo.json ...................✅ Turbo build orchestration        │
│  ├─ pnpm-workspace.yaml ...........✅ pnpm workspace definition       │
│  └─ firestore.indexes.json ........✅ Firestore index definitions     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Codebase Topology

### File Distribution by Layer

```
TOTAL: ~500 source files (excluding node_modules)

LAYER 00 (Domain):                    ~35 files
  packages/types/src/                ~30 files
    ├─ Zod schemas               ✅ CANONICAL
    ├─ Type exports              ✅ z.infer<>
    └─ Re-exports (index.ts)     ✅ Single entry point

LAYER 01 (Infrastructure):           ~80 files
  packages/api-framework/src/         ~40 files  ✅ SDK factory
  packages/config/src/                ~5 files   ✅ Config
  packages/env/src/                   ~5 files   ✅ Env validation
  apps/web/lib/                       ~20 files  ⚠️  LEGACY
  apps/web/src/lib/                   ~10 files  ✅ NEW (canonical)
    └─ Note: apps/web/lib/ should alias to src/lib/

LAYER 02 (Application):              ~120 files
  apps/web/src/lib/[feature]/         ~60 files  ✅ Business logic
  functions/src/                      ~30 files  ✅ Cloud Functions
  [other app lib utilities]           ~30 files  ✅ Helpers

LAYER 03 (API Edge):                 ~100 files
  apps/web/app/api/*/route.ts         ~22 files  ✅ SDK factory endpoints
  apps/web/app/api/_shared/           ~3 files   ⚠️  Legacy validation
  firestore.rules                     ~1 file    ✅ Security rules
  storage.rules                       ~1 file    ✅ Security rules

LAYER 04 (Client):                   ~140 files
  apps/web/app/(routes)/              ~45 files  ✅ Pages
  apps/web/src/components/            ~60 files  ✅ Components
  packages/ui/src/                    ~30 files  ✅ Design system
  apps/web/src/hooks/                 ~5 files   ✅ Custom hooks

TESTS & CONFIG:                      ~25 files
  vitest.config.ts                    ✅ Unit test config
  tests/rules/                        ✅ Firestore rules tests
  .github/workflows/                  ✅ CI/CD workflows
```

### Key Observa tions

✅ **Well-Organized**:

- Clear layer separation
- Single entry points (index.ts exports)
- Type-safe schema-driven design

⚠️ **Potential Issues**:

- `apps/web/lib/` and `apps/web/src/lib/` duplication
- `apps/web/app/api/_shared/validation.ts` has duplicate schemas
- Documentation spread across 185+ files
- Some outdated phase reports still active

---

## Branch & File Distribution Analysis

### Active Branches

```
┌─────────────────────────────────────┬──────────┬──────────┬──────────────┐
│ Branch                              │ Files    │ Status   │ Merge Path   │
├─────────────────────────────────────┼──────────┼──────────┼──────────────┤
│ main (Production)                   │ ~450     │ ✅ Ready │ Deploy      │
│ fix/triad-remediation (CURRENT)     │ ~465     │ ⏳ Active│ → main      │
│ dev (Remote)                        │ ~465     │ ⚠️  Stale│ Archive     │
│ fix/config-typeerrors               │ ~480     │ ⚠️  Partial│ Review    │
│ dep-fixes                           │ ~475     │ ⚠️  Partial│ Review    │
│ docs-and-tests                      │ ~450+15  │ ⏳ Proposed│ Feature   │
│ feat/sdk-extraction                 │ ~460     │ 🔴 Old   │ Superseded │
└─────────────────────────────────────┴──────────┴──────────┴──────────────┘

Legend:
  ✅ Ready    = All tests passing, documentation complete
  ⏳ Active   = Work in progress, staged for review
  ⚠️  Partial = Incomplete, needs evaluation
  🔴 Old     = Superseded by newer work
```

### Branch Consolidation Matrix

```
Branch                  Merge Decision        Rationale
─────────────────────────────────────────────────────────────────
main                    KEEP (production)     Stable baseline

fix/triad-remediation   MERGE → main          Current work, ready
                        Status: ~90% complete

dev (remote)            ARCHIVE               Superseded by fix/triad-remediation
                        Action: Delete remote tracking branch

fix/config-typeerrors   EVALUATE              Check for conflicts with
                        Status: ~60% complete triad-remediation
                        Action: Review before merge

dep-fixes               EVALUATE              Check dependency choices
                        Status: ~50% complete align with current setup
                        Action: Review before merge

docs-and-tests          KEEP (separate)       For continuous doc updates
                        Status: Proposed      Use for visual/doc-only PRs

feat/sdk-extraction     DELETE (archive)      Superseded by SDK factory
                        Status: Old            Create archive reference
```

---

## Deduplication Index

### 1. Library File Duplication

```
ISSUE: Duplicate helpers across apps/web/lib/ and apps/web/src/lib/

❌ DUPLICATES FOUND:

apps/web/lib/
├─ firebase-admin.ts .................... DUPLICATE
├─ onboarding/
│  └─ createNetworkOrg.ts ............... DUPLICATE
└─ [other utilities] .................... DUPLICATE (partial)

apps/web/src/lib/
├─ firebase-admin.ts .................... CANONICAL ✅
├─ firebase.server.ts ................... NEW
├─ firebase/
│  └─ typed-wrappers.ts ................. IMPROVED
├─ onboarding/
│  ├─ createNetworkOrg.ts ............... CANONICAL ✅
│  └─ adminFormDrafts.ts ................ NEW
└─ [helpers] ............................ CANONICAL ✅

CONSOLIDATION PLAN:

Priority 1 (IMMEDIATE):
  1. Verify src/lib/ versions are superior
  2. Update all imports to use src/lib/
  3. DELETE apps/web/lib/ directory

   Command:
   $ rm -rf apps/web/lib

Priority 2 (VALIDATION):
  1. Run full test suite
  2. Typecheck all imports
  3. Verify no import breakage

   Command:
   $ pnpm -w typecheck
   $ pnpm test
```

### 2. Schema Duplication

```
ISSUE: Zod schemas duplicated in validation.ts

❌ DUPLICATES FOUND:

packages/types/src/                     CANONICAL SOURCE ✅
├─ shifts.ts ............................ CreateShiftSchema
├─ schedules.ts ......................... CreateScheduleSchema
├─ organizations.ts ..................... CreateOrganizationSchema
├─ positions.ts ......................... CreatePositionSchema
└─ [others] ............................ All canonical

apps/web/app/api/_shared/validation.ts  DEPRECATED COPIES ❌
├─ CreateShiftSchema (DUPLICATE) ........ DELETE
├─ UpdateScheduleSchema (DUPLICATE) .... DELETE
├─ OrganizationCreateSchema (DUPLICATE). DELETE
└─ [others] ............................ DELETE all

CONSOLIDATION PLAN:

Priority 1 (AUDIT):
  1. List all schemas in validation.ts
  2. Verify they exist in packages/types/src/
  3. Generate migration checklist

Priority 2 (MIGRATION):
  1. Update all imports in API routes:
     OLD: import { CreateShiftSchema } from '../_shared/validation'
     NEW: import { CreateShiftSchema } from '@fresh-schedules/types'
  
  2. Delete duplicate schemas from validation.ts

Priority 3 (KEEP ONLY):
  validation.ts should only contain:
  - Helper functions (parseJson, badRequest, ok, serverError)
  - Response formatting utilities
  - NO schema definitions

ESTIMATED DELETIONS:
  • ~8-12 duplicate schemas
  • ~50-100 lines of code
```

### 3. Utility Consolidation Opportunities

```
CANDIDATES FOR CONSOLIDATION:

Location                            Type              Action
─────────────────────────────────────────────────────────────────
apps/web/lib/onboarding/           Business Logic    REVIEW & KEEP
  createNetworkOrg.ts                                (superior version in src/lib)

apps/web/lib/firebase/             Helpers           CONSOLIDATE
  [various]                                          (merge into src/lib/firebase/)

apps/web/lib/auth/                 Auth Helpers      CONSOLIDATE
  [various]                                          (move to src/lib/auth/)

RECOMMENDATION:
  • Audit apps/web/lib/ file by file
  • For each file, check if superior version exists in src/lib/
  • If yes: update imports, DELETE from apps/web/lib/
  • If no: MOVE to apps/web/src/lib/ with same path structure
  • Goal: Single canonical location per utility
```

### 4. Dependency Duplication

```
Potential duplicate package references:

REVIEW NEEDED:
  • @fresh-schedules/types
  • Firebase Admin SDK versions
  • Zod version consistency
  • React version alignment

ACTION:
  1. Run: pnpm ls --depth=0 (check root)
  2. Run: pnpm ls @fresh-schedules/types (check references)
  3. Run: pnpm audit (check security)
  4. Resolve any version conflicts

EXPECTED OUTCOME:
  • All workspace packages on same major versions
  • No duplicate installs of same package
  • Consistent dependency tree across apps/
```

---

## Documentation Audit

### Documentation File Statistics

```
Total Markdown Files:        185+
├─ Active (Current)          ~45 files  ✅ KEEP
├─ Outdated (Phase reports)  ~35 files  🟡 REVIEW
├─ Experimental (Branches)   ~25 files  🔴 DELETE/ARCHIVE
├─ Duplicates (Multiple)     ~15 files  ⚠️  CONSOLIDATE
├─ Templates (Reference)     ~15 files  ✅ KEEP
└─ Operational (Runbooks)    ~35 files  ✅ KEEP
```

### Documentation Audit Matrix

```
┌──────────────────────────────────────┬────────┬──────────────────────┐
│ Document                             │ Status │ Recommendation       │
├──────────────────────────────────────┼────────┼──────────────────────┤
│ PHASE_1_TIER_0_FIXES.md              │ 🟡 OLD │ → archive/PHASE_1    │
│ PHASE_2_TIER_1_FIXES.md              │ 🟡 OLD │ → archive/PHASE_2    │
│ PHASE_3_TIER3_CLEANUP.md             │ 🟡 OLD │ → archive/PHASE_3    │
│ SDK_MIGRATION_STATUS.md              │ 🟡 OLD │ → archive/SDK_v1.0   │
│ SDK_MIGRATION_COMPLETE.md            │ 🟡 OLD │ → archive/SDK_v1.0   │
│ MIGRATION_COMPLETE.md                │ 🟡 OLD │ → archive/COMPLETE   │
│ CHROMEBOOK_KEEP_COPILOT.md           │ 🔴 EXP │ DELETE (dev notes)   │
│ CHROMEBOOK_MEMORY_STRATEGY.md        │ 🔴 EXP │ DELETE (dev notes)   │
│ MEMORY_MANAGEMENT.md                 │ 🔴 EXP │ DELETE (obsolete)    │
│ OOM_PREVENTION.md                    │ 🔴 EXP │ DELETE (obsolete)    │
│ CODE_9_CRASH_ANALYSIS.md             │ 🔴 EXP │ DELETE (old crash)   │
│ RATE_LIMIT_IMPLEMENTATION.md         │ ✅ ACT │ KEEP (reference)     │
│ PRODUCTION_STATUS.txt                │ ✅ ACT │ KEEP (current)       │
│ PRODUCTION_READINESS_KPI.md          │ ✅ ACT │ KEEP (metrics)       │
│ PRODUCTION_READINESS_SIGN_OFF.md     │ ✅ ACT │ KEEP (approval)      │
│ FINAL_SIGN_OFF.md                    │ ✅ ACT │ KEEP (current)       │
│ PRODUCTION_DEPLOYMENT_GUIDE.md       │ ✅ ACT │ KEEP (runbook)       │
│ PRODUCTION_ENV_VALIDATION.md         │ ✅ ACT │ KEEP (checklist)     │
│ PRODUCTION_DOCS_INDEX.md             │ ✅ ACT │ KEEP (index)         │
│ docs/CODING_RULES_AND_PATTERNS.md    │ ✅ ACT │ KEEP (standards)     │
│ docs/QUICK_START.md                  │ ✅ ACT │ KEEP (guide)         │
│ docs/visuals/TEAM_STRUCTURE.md       │ ✅ ACT │ KEEP (org chart)     │
│ docs/visuals/progress/DASHBOARD.md   │ ✅ ACT │ KEEP (metrics)       │
│ CODEBASE_ARCHITECTURAL_INDEX.md      │ ✅ ACT │ KEEP (reference)     │
│ ARCHITECTURAL_REVIEW_PANEL_INPUTS.md │ ✅ ACT │ KEEP (deep dive)     │
│ TEST_INTELLIGENCE_INTEGRATION_REPORT │ ✅ ACT │ KEEP (analytics)     │
│ docs/templates/                      │ ✅ REF │ KEEP (templates)     │
│ .github/instructions/                │ ✅ ACT │ KEEP (guidelines)    │
│ .github/PROMPTS_SESSION_SUMMARY.md   │ 🟡 OLD │ → archive/sessions   │
│ .github/PHASE_1_COMPLETION_SUMMARY.md│ 🟡 OLD │ → archive/PHASE_1    │
│ agents/CREWOPS_*.md                  │ 🟡 OLD │ → archive/crewops    │
└──────────────────────────────────────┴────────┴──────────────────────┘

Legend:
  ✅ ACT = Active, current, production-relevant
  🟡 OLD = Historical, useful as reference
  🔴 EXP = Experimental, development artifacts
  ✅ REF = Reference templates/examples
```

### Documentation Consolidation Recommendations

```
ARCHIVE STRATEGY (Move to docs/archive/):

Priority 1 - Phase Reports (Historical):
  ├─ PHASE_1_TIER_0_FIXES.md
  ├─ PHASE_2_TIER_1_FIXES.md
  ├─ PHASE_3_TIER3_CLEANUP.md
  ├─ PHASE_2_COMPLETION_SUMMARY.md
  ├─ PHASE_2_STATUS_REPORT.md
  ├─ PHASE_1_WORKER_HIERARCHY.md
  ├─ PHASE_1_COMPLETION_SUMMARY.md
  └─ Archive Path: docs/archive/phases/

Priority 2 - SDK & Migration (Historical):
  ├─ SDK_MIGRATION_STATUS.md
  ├─ SDK_MIGRATION_COMPLETE.md
  ├─ MIGRATION_COMPLETE.md
  └─ Archive Path: docs/archive/migrations/v1.0/

Priority 3 - Session & AI Notes (Temporary):
  ├─ CHROMEBOOK_KEEP_COPILOT.md
  ├─ CHROMEBOOK_MEMORY_STRATEGY.md
  ├─ MEMORY_MANAGEMENT.md
  ├─ OOM_PREVENTION.md
  ├─ CODE_9_CRASH_ANALYSIS.md
  ├─ agents/CREWOPS_*.md
  ├─ .github/PROMPTS_SESSION_SUMMARY.md
  └─ Archive Path: docs/archive/sessions/ DELETE AFTER 30 DAYS

DELETE IMMEDIATELY (No value):
  ├─ repomix-output.xml (generated artifact)
  ├─ system-pulse.ts (debug artifact)
  └─ rate-limit.ts (duplicate, moved to packages/)

CONSOLIDATE (Merge into single canonical doc):
  ├─ Multiple rate-limit docs → RATE_LIMIT_IMPLEMENTATION.md
  ├─ Multiple deployment docs → PRODUCTION_DEPLOYMENT_GUIDE.md
  ├─ Multiple README variations → docs/QUICK_START.md (canonical)
```

### Documentation Obsolescence Timeline

```
Age         Status          Action                      Deadline
──────────────────────────────────────────────────────────────────
< 2 weeks   ACTIVE          Keep, review for accuracy   Continuous
2-4 weeks   REVIEW          Verify still relevant       End of week
1-3 months  ARCHIVE         Move to docs/archive/       This sprint
> 3 months  DELETE (unless  Remove from active repo,    This quarter
            superseded)     reference in git history

RATIONALE:
  • Prevents information decay
  • Keeps active docs focused
  • Maintains git history (git log still available)
  • Encourages documentation updates
```

---

## Deletion & Consolidation Strategy

### Phase 1: Safe Deletions (No Impact)

```
ACTION 1: Delete Development Artifacts

Files to Delete:
  ├─ repomix-output.xml ........... Generated artifact (can regenerate)
  ├─ system-pulse.ts .............. Debug utility (unused)
  ├─ pattern-validation-report.json  Build output (regenerates)
  └─ *.bak files .................. Backups (git has history)

Command:
  $ git rm repomix-output.xml system-pulse.ts pattern-validation-report.json

Impact: ZERO (no imports, no runtime effect)
Verification: pnpm -w typecheck (should pass)
```

### Phase 2: Consolidation (High Impact, Low Risk)

```
ACTION 1: Consolidate apps/web/lib/ → apps/web/src/lib/

Current State:
  apps/web/lib/                (OLD - DUPLICATE)
  ├─ firebase-admin.ts
  ├─ onboarding/
  │  └─ createNetworkOrg.ts
  └─ [legacy utilities]

  apps/web/src/lib/            (NEW - CANONICAL)
  ├─ firebase-admin.ts (alias)
  ├─ firebase.server.ts
  ├─ onboarding/
  │  ├─ createNetworkOrg.ts
  │  └─ adminFormDrafts.ts
  └─ [helpers]

Plan:
  1. Audit apps/web/lib/ file by file
  2. For each file:
     a. Check if superior version exists in src/lib/
     b. If yes: DELETE, update imports
     c. If no: MOVE to src/lib/ with same structure
  3. DELETE apps/web/lib/ directory
  4. Create alias in apps/web/lib/index.ts (if needed for backward compat):
     export * from '../src/lib';

Commands:
  $ pnpm grep -r "from.*apps/web/lib" (find all imports)
  $ pnpm grep -r "from '@/lib" (check which resolve to apps/web/lib/)
  $ git mv apps/web/lib/* apps/web/src/lib/ (move files)
  $ rm -rf apps/web/lib

Verification:
  $ pnpm -w typecheck (should pass)
  $ pnpm test (all tests pass)
  $ pnpm lint (no import errors)

Expected Outcome:
  • All imports point to single location: apps/web/src/lib/
  • No duplicate files
  • Clean import paths
  • All tests passing
```

### Phase 3: Schema Consolidation

```
ACTION 1: Remove duplicate schemas from apps/web/app/api/_shared/validation.ts

Current State:
  packages/types/src/                    CANONICAL ✅
  ├─ shifts.ts
  ├─ schedules.ts
  ├─ organizations.ts
  └─ [all domain schemas]

  apps/web/app/api/_shared/validation.ts (DEPRECATED) ❌
  ├─ CreateShiftSchema (DUPLICATE)
  ├─ UpdateScheduleSchema (DUPLICATE)
  └─ [other duplicates]

Plan:
  1. Audit all schemas in validation.ts
  2. Verify each has canonical home in packages/types/
  3. Update all API routes to import from @fresh-schedules/types:

     Before:
     import { CreateShiftSchema } from '../_shared/validation'

     After:
     import { CreateShiftSchema } from '@fresh-schedules/types'

  4. Remove duplicate schema definitions from validation.ts

Files to Update:
  $ pnpm grep -r "import.*from.*_shared/validation" apps/web/app/api/

Verification:
  $ pnpm -w typecheck
  $ pnpm test
  $ pnpm lint

Expected Outcome:
  • validation.ts contains ONLY helpers (parseJson, badRequest, etc.)
  • NO schema definitions in validation.ts
  • All imports from @fresh-schedules/types
  • ~50-100 lines deleted
```

### Phase 4: Documentation Archival

```
STEP 1: Create archive structure

  $ mkdir -p docs/archive/{phases,migrations,sessions,crewops}

STEP 2: Move phase reports

  $ git mv PHASE_1_TIER_0_FIXES.md docs/archive/phases/
  $ git mv PHASE_2_TIER_1_FIXES.md docs/archive/phases/
  $ git mv PHASE_3_TIER3_CLEANUP.md docs/archive/phases/
  [etc.]

STEP 3: Move session notes

  $ git mv .github/PHASE_1_COMPLETION_SUMMARY.md docs/archive/sessions/
  $ git mv agents/CREWOPS_*.md docs/archive/crewops/

STEP 4: Create archive index

  Create: docs/archive/README.md
  Content:
    # Archived Documentation
    
    Historical reference documents. Current documentation is in docs/
    
    ## Phases
    - Phase 1: [link]
    - Phase 2: [link]
    ...
    
    ## Migrations
    - SDK v1.0: [link]
    ...
    
    ## Sessions
    - DecMember 1, 2025: [link]
    ...

STEP 5: Add redirect in root docs/

  Create: docs/README.md
  Content:
    # Fresh Root Documentation
    
    ## Active Documentation
    - [Coding Rules & Patterns](./CODING_RULES_AND_PATTERNS.md)
    - [Quick Start](./QUICK_START.md)
    - [Architecture](./visuals/ARCHITECTURE.md)
    - [Production Deployment](./PRODUCTION_DEPLOYMENT_GUIDE.md)
    - [Visuals](./visuals/README.md)
    
    ## Archived (Historical)
    See [docs/archive/README.md](./archive/README.md)

Commands:
  $ git add docs/archive/
  $ git add docs/README.md
  $ git commit -m "docs: archive historical phase & session reports"

Verification:
  $ pnpm lint:docs (if you have a docs linter)
```

---

## Visual Diagrams

### 1. Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                           │
│  (React Components, TanStack Query, Zustand)                     │
└─────────────────────────┬──────────────────────────────────────┘
                          │ fetch()/TanStack Query
                          ↓
┌──────────────────────────────────────────────────────────────────┐
│                    LAYER 03: API EDGE                             │
│               (Next.js API Routes, Middleware)                   │
│                                                                  │
│  Request → Rate Limit → Auth → CSRF → Zod Validation            │
│            ↓                    ↓         ↓                       │
│         (Fail: 429)          (Fail: 401) (Fail: 400)            │
│                              (Fail: 403) (Fail: 422)            │
│            ↓──── (Pass) ────┐ ┌────────────────────┐            │
│                             ↓ ↓                    ↓             │
│                      Call Layer 02 → Respond    Business Logic    │
│                      (Handler)    JSON                           │
└────────────┬──────────────────────────────────────────┬──────────┘
             │                                          │
             │ Input (Zod)                    Response (JSON)
             ↓                                          ↑
┌──────────────────────────────────────────────────────────────────┐
│                 LAYER 02: APPLICATION                             │
│         (Business Logic, Domain Operations)                      │
│                                                                  │
│  ├─ Validate input against Layer 00 schemas                      │
│  ├─ Check permissions (Layer 00 RBAC)                            │
│  ├─ Read/write to Firestore (Layer 01 helpers)                   │
│  ├─ Transform data                                               │
│  └─ Return result                                                │
└──────────────┬───────────────────────────────────────────────────┘
               │ Firestore operations
               ↓
┌──────────────────────────────────────────────────────────────────┐
│                 LAYER 01: INFRASTRUCTURE                          │
│  (Firebase Admin SDK, Type-Safe Wrappers, Env Validation)        │
│                                                                  │
│  ├─ Singleton Firebase Admin instances                           │
│  ├─ Type-safe Firestore operations (getDocWithType, etc)        │
│  ├─ Error handling                                               │
│  └─ Logging & observability                                      │
└──────────────┬──────────────────────────────────────────┬────────┘
               │                                          │
               ↓ Firestore                    Firestore rules
┌──────────────────────────────────────────────────────────────────┐
│           LAYER 00: DOMAIN & DATA                                 │
│  (Firestore Collections, Security Rules, Zod Schemas)            │
│                                                                  │
│  ├─ /orgs/{orgId}/schedules/{scheduleId}                         │
│  ├─ /orgs/{orgId}/shifts/{shiftId}                               │
│  ├─ /memberships/{uid}_{orgId}                                   │
│  ├─ /users/{userId}                                              │
│  └─ [all domain collections]                                     │
│                                                                  │
│  ├─ Firestore Rules (enforce access control)                     │
│  ├─ Zod Schemas (type definition)                                │
│  └─ Collection Indexes (performance)                             │
└──────────────────────────────────────────────────────────────────┘
```

### 2. Deduplication Before/After

```
┌─ BEFORE (Duplicated) ──────────────┐
│                                    │
│  apps/web/lib/                     │
│  ├─ firebase-admin.ts (v1)         │
│  ├─ onboarding/                    │
│  │  └─ createNetworkOrg.ts         │
│  └─ [legacy]                       │
│                                    │
│  apps/web/src/lib/                 │
│  ├─ firebase-admin.ts (v1 alias)  │
│  ├─ firebase.server.ts (NEW)       │
│  ├─ onboarding/                    │
│  │  ├─ createNetworkOrg.ts (v2)   │
│  │  └─ adminFormDrafts.ts          │
│  └─ [updated helpers]              │
│                                    │
│  Impact: Confusing, 2 paths to     │
│          same logic, sync bugs     │
│                                    │
└────────────────────────────────────┘
              ↓↓↓ Consolidate ↓↓↓
┌─ AFTER (Consolidated) ─────────────┐
│                                    │
│  apps/web/src/lib/ (CANONICAL)     │
│  ├─ firebase-admin.ts (v2)         │
│  ├─ firebase.server.ts             │
│  ├─ firebase/                      │
│  │  └─ typed-wrappers.ts           │
│  ├─ onboarding/                    │
│  │  ├─ createNetworkOrg.ts         │
│  │  └─ adminFormDrafts.ts          │
│  ├─ auth/                          │
│  │  └─ helpers.ts                  │
│  └─ [all utilities]                │
│                                    │
│  All imports use single path:      │
│  import { ... } from '@/lib'       │
│                                    │
│  Impact: Clear, maintainable,      │
│          single source of truth    │
│                                    │
└────────────────────────────────────┘
```

### 3. Branch Consolidation Timeline

```
Timeline:
─────────────────────────────────────────────────────────────────

Now (Dec 5)
    │
    ├─ main
    │  ✅ Stable, prod baseline
    │
    ├─ fix/triad-remediation (CURRENT)
    │  ⏳ Work in progress, staged for review
    │  └─ Target: ~90% complete
    │
    ├─ fix/config-typeerrors
    │  ⚠️  Partial, needs evaluation
    │  └─ Action: Rebase & evaluate conflicts
    │
    ├─ dep-fixes
    │  ⚠️  Partial, needs evaluation
    │  └─ Action: Validate dependency choices
    │
    ├─ dev (remote)
    │  ⏳ Superseded by fix/triad-remediation
    │  └─ Action: Archive & delete
    │
    └─ docs-and-tests (proposed)
       📋 For continuous doc/test updates
       └─ Action: Keep separate for doc-only PRs

    ↓ (1 week)

Week 1 (Dec 12):
    │
    ├─ main (unchanged)
    │
    ├─ fix/triad-remediation → MERGED
    │  └─ Includes: triad fixes, deduplication
    │
    ├─ fix/config-typeerrors (REVIEWED)
    │  └─ Action: Rebase & merge if compatible
    │
    ├─ dep-fixes (REVIEWED)
    │  └─ Action: Merge if dependencies align
    │
    └─ docs-and-tests → BRANCHED
       └─ For ongoing visual/doc updates

    ↓ (1 week)

Week 2 (Dec 19):
    │
    └─ main (updated)
       ├─ triad-remediation merged
       ├─ config-typeerrors merged (if compatible)
       ├─ dep-fixes merged (if validated)
       └─ Ready for next phase
```

---

## Implementation Roadmap

### Sprint 1: Safe Deletions (2-3 hours)

**Goal**: Remove development artifacts with zero impact

```
TASKS:

[ ] 1. Delete generated artifacts
    - repomix-output.xml
    - pattern-validation-report.json
    - *.bak files (if any)
    Command: git rm [files]

[ ] 2. Remove debug utilities
    - system-pulse.ts
    Command: git rm system-pulse.ts

[ ] 3. Verify no breakage
    Command:
      pnpm -w typecheck
      pnpm test

[ ] 4. Commit changes
    Commit message:
      "chore(cleanup): remove generated artifacts & debug files"

Expected outcome:
  • 5-10 files deleted
  • Zero import errors
  • All tests passing
```

### Sprint 2: Library Consolidation (4-6 hours)

**Goal**: Consolidate apps/web/lib → apps/web/src/lib

```
TASKS:

[ ] 1. Audit apps/web/lib/ file-by-file
    Find: apps/web/lib/ files
    Check: Does superior version exist in apps/web/src/lib/?
    Document: audit-lib-consolidation.txt

[ ] 2. Update imports
    Find all:
      grep -r "from .*apps/web/lib" apps/
      grep -r "from '@/lib'" apps/  (but check which resolve to lib/)
    Replace with:
      import X from '@/src/lib/path'
      OR
      import X from '@/lib' (if created alias)
    Command: pnpm grep -r ... (to validate)

[ ] 3. Move files (if needed)
    For files without src/lib version:
      git mv apps/web/lib/file.ts apps/web/src/lib/file.ts
      git mv apps/web/lib/dir/ apps/web/src/lib/dir/

[ ] 4. Create alias (optional)
    File: apps/web/lib/index.ts
    Content:
      // Deprecated: use @/src/lib instead
      export * from '../src/lib';

[ ] 5. Delete apps/web/lib directory
    Command: rm -rf apps/web/lib

[ ] 6. Verify all imports resolve
    Command:
      pnpm -w typecheck (should pass)
      pnpm lint (should pass)
      pnpm test (should pass)

[ ] 7. Commit
    Commit message:
      "refactor(lib): consolidate apps/web/lib → src/lib"

Expected outcome:
  • Single canonical lib location
  • All imports consistent
  • All tests passing
```

### Sprint 3: Schema Consolidation (3-4 hours)

**Goal**: Remove duplicate schemas from validation.ts

```
TASKS:

[ ] 1. Audit validation.ts
    File: apps/web/app/api/_shared/validation.ts
    Find: All schema exports (CreateShiftSchema, etc.)
    Check: Does packages/types export the same?
    Document: audit-schema-duplicates.txt

[ ] 2. Update all API route imports
    Find: import X from '../_shared/validation'
    Check: Is X a schema (CreateShiftSchema)?
    If yes:
      Replace: import { CreateShiftSchema } from '@fresh-schedules/types'
      Remove: import from '../_shared/validation' (if only schemas)
    Command: pnpm grep -r "import.*Schema.*from.*_shared"

[ ] 3. Remove duplicate schemas
    File: apps/web/app/api/_shared/validation.ts
    Delete: All schema definitions
    Keep: Helper functions (parseJson, badRequest, ok, serverError)

[ ] 4. Verify validation.ts structure
    Expected contents:
      ├─ parseJson() ............ ✅ KEEP
      ├─ badRequest() ........... ✅ KEEP
      ├─ ok() ................... ✅ KEEP
      ├─ serverError() .......... ✅ KEEP
      └─ [other helpers] ........ ✅ KEEP
    
    Should NOT contain:
      ├─ CreateShiftSchema ..... ❌ DELETE
      ├─ UpdateScheduleSchema .. ❌ DELETE
      └─ [any Zod schema] ...... ❌ DELETE

[ ] 5. Run full test suite
    Command:
      pnpm -w typecheck
      pnpm lint
      pnpm test

[ ] 6. Commit
    Commit message:
      "refactor(api): remove duplicate schemas, import from @fresh-schedules/types"

Expected outcome:
  • Single schema source: packages/types/
  • validation.ts contains only helpers
  • ~50-100 lines deleted
  • All tests passing
```

### Sprint 4: Documentation Archival (2-3 hours)

**Goal**: Archive outdated docs, create clear index

```
TASKS:

[ ] 1. Create archive structure
    Commands:
      mkdir -p docs/archive/{phases,migrations,sessions,crewops}

[ ] 2. Move phase reports
    Commands:
      git mv PHASE_*.md docs/archive/phases/
      git mv .github/PHASE_*.md docs/archive/sessions/
      git mv archive/docs/PHASE_*.md docs/archive/phases/

[ ] 3. Move migration docs
    Commands:
      git mv SDK_MIGRATION_*.md docs/archive/migrations/

[ ] 4. Move session/crewops docs
    Commands:
      git mv agents/CREWOPS_*.md docs/archive/crewops/
      git mv .github/PROMPTS_SESSION_SUMMARY.md docs/archive/sessions/

[ ] 5. Create archive index
    File: docs/archive/README.md
    Content:
      # Archived Documentation
      
      Historical reference. Current docs in [docs/](../README.md)
      
      ## Phases (Historical Reference)
      - [Phase 1 Tier 0 Fixes](./phases/PHASE_1_TIER_0_FIXES.md)
      - [Phase 2 Tier 1 Fixes](./phases/PHASE_2_TIER_1_FIXES.md)
      ...

[ ] 6. Create docs index
    File: docs/README.md
    Content:
      # Fresh Root Documentation
      
      ## 🚀 Active (Use These)
      - [Quick Start](./QUICK_START.md)
      - [Coding Rules & Patterns](./CODING_RULES_AND_PATTERNS.md)
      - [Architecture](./visuals/ARCHITECTURE.md)
      - [Production Deployment](./PRODUCTION_DEPLOYMENT_GUIDE.md)
      ...
      
      ## 📦 Archived (Historical Reference)
      See [archive/README.md](./archive/README.md)

[ ] 7. Delete obsolete files
    Files to delete (after archiving):
      - CHROMEBOOK_*.md
      - MEMORY_MANAGEMENT.md
      - OOM_PREVENTION.md
      - CODE_9_CRASH_ANALYSIS.md
      - repomix-output.xml (already done)
      - system-pulse.ts (already done)
    
    Command: git rm [files]

[ ] 8. Commit
    Commit message:
      "docs: archive historical phase reports, create documentation index"

Expected outcome:
  • Outdated docs in docs/archive/
  • Clear docs/README.md index
  • Active docs focused on current state
  • ~40 files archived
```

### Sprint 5: Validation & Cleanup (2 hours)

**Goal**: Verify everything works, prepare for merge

```
TASKS:

[ ] 1. Full validation
    Commands:
      pnpm install --frozen-lockfile
      pnpm -w typecheck
      pnpm lint
      pnpm format:check
      pnpm test
      pnpm test:rules

[ ] 2. Build check
    Command: pnpm build

[ ] 3. Document changes
    Create: CONSOLIDATION_COMPLETE.md
    Content:
      # Consolidation Complete
      
      ## Deletions
      - Removed X generated artifacts
      - Deleted Y duplicate utilities
      ...
      
      ## Consolidations
      - Merged apps/web/lib/ → src/lib/
      - Consolidated schemas in packages/types/
      ...
      
      ## Archival
      - Archived X phase reports
      - Created Y documentation indexes
      ...
      
      ## Verification
      - ✅ pnpm typecheck: passed
      - ✅ pnpm test: passed
      - ✅ pnpm build: passed
      - ✅ No import errors
      - ✅ All schema imports from @fresh-schedules/types

[ ] 4. Create summary PR
    Title: "refactor: codebase consolidation & documentation cleanup"
    Body:
      - Library consolidation (apps/web/lib → src/lib/)
      - Schema deduplication (import from @fresh-schedules/types)
      - Documentation archival & indexing
      - Artifact cleanup
      
      All tests passing ✅
      Typecheck passing ✅
      Build passing ✅

[ ] 5. Submit for review
    Command: git push origin fix/triad-remediation

Expected outcome:
  • Everything working
  • Ready for merge to main
  • Clean commit history
  • Clear documentation of changes
```

---

## Implementation Execution Checklist

### Phase-by-Phase Checklist

```
[ ] PHASE 1: Safe Deletions (2-3 hours)
    [ ] Delete generated artifacts (repomix, pulse, bak files)
    [ ] Verify: pnpm typecheck ✅
    [ ] Verify: pnpm test ✅
    [ ] Commit: "chore(cleanup): remove artifacts"

[ ] PHASE 2: Library Consolidation (4-6 hours)
    [ ] Audit apps/web/lib/ contents
    [ ] Identify duplicate vs new files
    [ ] Update all imports to src/lib/
    [ ] Move remaining files to src/lib/
    [ ] Delete apps/web/lib/ directory
    [ ] Verify: pnpm typecheck ✅
    [ ] Verify: pnpm lint ✅
    [ ] Verify: pnpm test ✅
    [ ] Commit: "refactor(lib): consolidate apps/web/lib → src/lib"

[ ] PHASE 3: Schema Consolidation (3-4 hours)
    [ ] Audit validation.ts schemas
    [ ] Update all API route imports
    [ ] Remove duplicate schemas
    [ ] Keep only helpers in validation.ts
    [ ] Verify: pnpm typecheck ✅
    [ ] Verify: pnpm lint ✅
    [ ] Verify: pnpm test ✅
    [ ] Commit: "refactor(api): remove duplicate schemas"

[ ] PHASE 4: Documentation Archival (2-3 hours)
    [ ] Create archive directory structure
    [ ] Move phase reports to archive/
    [ ] Move session/migration docs to archive/
    [ ] Create archive index (README.md)
    [ ] Create docs index (docs/README.md)
    [ ] Delete truly obsolete files
    [ ] Commit: "docs: archive & index documentation"

[ ] PHASE 5: Validation & Merge Prep (2 hours)
    [ ] Full validation (typecheck, lint, test, build)
    [ ] Create consolidation summary
    [ ] Prepare PR with comprehensive description
    [ ] Ready for review & merge

TOTAL TIME: 13-18 hours
RISK LEVEL: LOW (all changes are refactoring, no behavior changes)
CONFIDENCE: HIGH (schema-driven, tested)
```

---

## Key Metrics & Success Criteria

```
BEFORE Consolidation:
  • Duplicate lib files: ~15
  • Duplicate schemas: ~8-10
  • Active documentation: 45 files (unclear which)
  • Total markdown files: 185+
  • Source files: ~500
  • API routes using old pattern: ~2
  • Import paths: 4+ variations of same utility

AFTER Consolidation:
  ✅ Duplicate lib files: 0
  ✅ Duplicate schemas: 0
  ✅ Active documentation: 45 files (clearly marked)
  ✅ Archived documentation: 40 files (in docs/archive/)
  ✅ Total markdown files: 45 active + 40 archived
  ✅ Source files: ~500 (same, but cleaner)
  ✅ API routes using SDK factory: 22 (100%)
  ✅ Import paths: 1 canonical location per utility

SUCCESS INDICATORS:
  ✅ All tests passing
  ✅ pnpm typecheck: 0 errors
  ✅ pnpm lint: 0 errors
  ✅ pnpm build: successful
  ✅ No import ambiguity
  ✅ Documentation clear & current
```

---

## Related Documents & References

| Document | Purpose | Location |
|----------|---------|----------|
| Coding Rules & Patterns | Enforce standards | `docs/CODING_RULES_AND_PATTERNS.md` |
| Production Deployment | Runbook | `docs/PRODUCTION_DEPLOYMENT_GUIDE.md` |
| Quick Start | Onboarding | `docs/QUICK_START.md` |
| SDK Factory | API pattern | `packages/api-framework/src/index.ts` |
| Zod Schemas | Type definitions | `packages/types/src/index.ts` |
| Branch Consolidation Guide | Branch strategy | `docs/visuals/BRANCH_CONSOLIDATION_GUIDE.md` |
| Dashboard | Progress tracking | `docs/visuals/progress/DASHBOARD.md` |

---

## Summary & Next Steps

### What This Document Provides

✅ **Clear visibility** into system architecture across 5 layers
✅ **Deduplication roadmap** with specific deletions and consolidations
✅ **Documentation audit** with keep/archive/delete recommendations
✅ **Actionable sprints** with time estimates and success criteria
✅ **Visual diagrams** showing before/after states
✅ **Low-risk execution plan** with validation gates

### Recommended Next Actions

1. **Review & Approve** this architecture document
2. **Execute Sprint 1-5** in sequence (can overlap if needed)
3. **Validate at each step** (typecheck, lint, test)
4. **Document changes** in PR description
5. **Merge to main** when complete

### Estimated Timeline

- **Sprint 1**: 2-3 hours → Safe deletions
- **Sprint 2**: 4-6 hours → Library consolidation
- **Sprint 3**: 3-4 hours → Schema consolidation
- **Sprint 4**: 2-3 hours → Documentation archival
- **Sprint 5**: 2 hours → Validation & merge prep

**Total**: 13-18 hours of focused work

**Can be done in**: 2-3 days of focused effort
**Ideal pace**: 1 sprint per day with validation

---

**Document Version**: 1.0  
**Last Updated**: December 5, 2025  
**Status**: Ready for Implementation  
**Owner**: Architecture Lead  
**Next Review**: After completion of all sprints
