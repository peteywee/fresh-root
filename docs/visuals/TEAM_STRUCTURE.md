# Specialist Team Structure
**Mission**: Break down and delegate major cleanup, dependency resolution, and type safety fixes across specialist roles.

---

## 🎯 Team Roster & Responsibilities
### 1. **Orchestrator / Primary Agent (YOU)**
- **Focus**: Strategic oversight, decision-making, phase transitions
- **Tasks**:
  - Define priorities and phase sequencing
  - Coordinate handoffs between specialists
  - Monitor progress dashboards
  - Make architecture decisions
  - Manage branch merges and CI validation

### 2. **Cleanup Lead (Specialist #1)**
- **Focus**: Identify and delete redundant/legacy files
- **Responsibilities**:
  - Audit repo for duplicate files (libs, implementations, backups)
  - Generate list of files to delete (with justification)
  - Execute deletion in batches
  - Track deleted items in visual report
- **Artifacts**:
  - `docs/visuals/branch-analysis/DUPLICATE_FILES.md` — files to delete
  - `docs/visuals/branch-analysis/DELETION_LOG.md` — what was deleted & why
- **Decision Matrix**:

  ```
  Priority 1 (Delete immediately):
  - *.bak files (old backups)
  - _dropin_temp/* (temporary drops)
  - /archive/* (archived/legacy)
  - apps/web/lib/* if src/lib exists (pick canonical)

  Priority 2 (Review & delete):
  - Duplicate implementations (same function in 2+ files)
  - Legacy naming patterns (old versions)

  Priority 3 (Backup then delete):
  - Old docs (after consolidating)
  - Legacy tests (after migrating to Vitest)
  ```

### 3. **Dependency Specialist (Specialist #2)**
- **Focus**: Install missing packages, resolve dependency conflicts
- **Responsibilities**:
  - Extract missing packages from TypeScript errors
  - Identify which packages to add to which workspace
  - Install packages with correct versions
  - Verify type declarations available
  - Document dependency audit results
- **Artifacts**:
  - `docs/visuals/dependencies/MISSING_PACKAGES.md` — list of packages to add
  - `docs/visuals/dependencies/INSTALL_LOG.md` — what was installed & status
  - `docs/visuals/dependencies/AUDIT_REPORT.md` — final audit of all deps
- **Known Missing**:

  ```
  apps/web needs:
  - firebase (client SDK: firebase/auth, firebase/firestore, firebase/storage, firebase/analytics, firebase/app)
  - @sentry/nextjs
  - @opentelemetry/* (exporter-trace-otlp-http, sdk-node, semantic-conventions)
  - qrcode
  - speakeasy
  - papaparse
  - xlsx
  - zustand
  - firebaseui
  ```

### 4. **Type Safety Lead (Specialist #3)**
- **Focus**: Fix TypeScript errors systematically
- **Responsibilities**:
  - Categorize 97 TypeScript errors by type
  - Fix high-impact errors first (ones blocking many others)
  - Update schemas to match Zod v4 API (z.record needs 2 params)
  - Fix unknown type coercions
  - Verify OrgRole exports from packages/types
- **Artifacts**:
  - `docs/visuals/type-errors/ERROR_CATEGORIES.md` — grouped by type
  - `docs/visuals/type-errors/FIXES_APPLIED.md` — what was fixed & how
  - `docs/visuals/type-errors/REMAINING_ERRORS.md` — blockers after fixes
- **Priority Categories**:

  ```
  Tier 1 (High Impact):
  - Missing module declarations (97 errors, blocks all)
  - OrgRole export issues (blocks api-framework)
  - z.record() API fixes (blocks validation)

  Tier 2 (Medium Impact):
  - Unknown type coercions (data safety)
  - Duplicate declarations (createNetworkOrg duplicates)

  Tier 3 (Low Impact):
  - Implicit any types (parameter inference)
  - Style/convention fixes
  ```

### 5. **Documentation Lead (Specialist #4)**
- **Focus**: Generate and maintain visual progress reports
- **Responsibilities**:
  - Create ASCII/Markdown diagrams showing phase progress
  - Build visual dashboard of TypeScript errors by category
  - Generate branch diff visualizations
  - Maintain live checklist of completed tasks
  - Create summary reports for each phase
- **Artifacts**:
  - `docs/visuals/progress/DASHBOARD.md` — live checklist & progress %
  - `docs/visuals/progress/PHASE_REPORTS/` — report per phase
  - `docs/visuals/branch-analysis/BRANCH_DIFF_VISUAL.md` — branch differences
  - `docs/visuals/type-errors/ERROR_DASHBOARD.md` — error breakdown

---

## 📊 Workflow Sequencing
```
Phase 1: Cleanup (Cleanup Lead + Orchestrator)
  ↓ Audit branches, identify duplicates
  ↓ Create deletion list
  ↓ Execute deletion in batches
  ✅ GATE: Verify no syntax errors after deletion

Phase 2: Dependencies (Dependency Specialist + Orchestrator)
  ↓ Extract packages from typecheck output
  ↓ Install missing packages
  ✅ GATE: pnpm -w install succeeds

Phase 3: Type Safety (Type Safety Lead + Orchestrator)
  ↓ Fix Zod schema issues (z.record)
  ↓ Fix OrgRole exports
  ↓ Fix unknown type coercions
  ✅ GATE: pnpm -w typecheck passes

Phase 4: Validation & Merge (Orchestrator + Documentation Lead)
  ↓ Final typecheck across all packages
  ↓ Generate completion report
  ↓ Create visual summary
  ✅ GATE: All tests pass, lint passes
  ✅ Merge to dev branch
  ✅ Create branch archive visualization

Documentation Lead (Continuous):
  ↓ Update DASHBOARD.md after each phase
  ↓ Generate ASCII diagrams
  ↓ Maintain artifact links
```

---

## 🔄 Branch Strategy
**Primary Branches**:

- `dev` — main development branch (current)
- `main` — production-ready (merge after validation)
- `docs-and-tests` — dedicated docs/test updates (new)

**Workflow**:

1. All changes on `dev` branch
2. Visual artifacts pushed to `docs/visuals/` on `dev`
3. When cleanup/fixes complete → merge to `main`
4. Separate PR to `docs-and-tests` for visual archive & documentation
5. Visual generation happens automatically (CI trigger or manual script)

---

## 📈 Progress Tracking
Each specialist maintains a progress log:

| Specialist            | Log File           | Status              | ETA        |
| --------------------- | ------------------ | ------------------- | ---------- |
| Cleanup Lead          | `DELETION_LOG.md`  | Starting → Complete | 1 hour     |
| Dependency Specialist | `INSTALL_LOG.md`   | Starting → Complete | 30 min     |
| Type Safety Lead      | `FIXES_APPLIED.md` | Starting → Complete | 2 hours    |
| Documentation Lead    | `DASHBOARD.md`     | Starting → Complete | Continuous |

---

## 🎯 Decision Gates (Checkpoints)
After each phase, before proceeding:

```
GATE 1 (After Cleanup):
  ☐ All .bak files deleted
  ☐ All duplicates consolidated
  ☐ No syntax errors
  ☐ DELETION_LOG.md complete

GATE 2 (After Dependencies):
  ☐ All missing packages installed
  ☐ pnpm -w install --frozen-lockfile succeeds
  ☐ INSTALL_LOG.md complete

GATE 3 (After Type Safety):
  ☐ pnpm -w typecheck passes (0 errors)
  ☐ FIXES_APPLIED.md complete
  ☐ All tests pass

GATE 4 (Before Merge):
  ☐ pnpm lint passes
  ☐ pnpm format passes
  ☐ DASHBOARD.md updated
  ☐ All visuals generated
  ☐ Ready for merge to main
```

---

## 🚀 How to Delegate
**For Orchestrator (YOU)**:

1. Review this document
2. Assign each specialist their starting task
3. Monitor progress via artifacts
4. Unblock when needed
5. Make decisions at gates

**For Specialists**:

1. Read your section above
2. Check artifacts directory
3. Execute your phase tasks
4. Update your log file continuously
5. Report blockers to Orchestrator

---

## 📝 Artifact Template
Each specialist creates artifacts following this template:

```markdown
# [Specialist Role] - [Phase Name]
**Status**: [Starting / In Progress / Complete]
**Last Updated**: [Date/Time]
**Blockers**: None / [List]

## Summary
- Items Processed: N/M
- Success Rate: X%
- Critical Issues: N

## Items Processed
| Item     | Action | Status | Notes                |
| -------- | ------ | ------ | -------------------- |
| file1.ts | DELETE | ✅     | Duplicate of src/lib |
| file2.ts | KEEP   | ✅     | Only production copy |

## Next Steps
1. [Next action]
2. [Next action]

## Decision Log
- [Date]: Decision to [action] because [reason]
```

---

## 🎨 Visual Examples
Visual artifacts will include:

**ASCII Progress Bar**:

```
Phase 1: Cleanup ████░░░░░░ 40%
Phase 2: Dependencies ░░░░░░░░░░ 0%
Phase 3: Type Safety ░░░░░░░░░░ 0%
Phase 4: Validation ░░░░░░░░░░ 0%
```

**Error Category Breakdown**:

```
Missing Modules: ████████░░ 45 errors (46%)
Type Coercions: ████░░░░░░ 22 errors (23%)
Zod Issues: ██░░░░░░░░ 12 errors (12%)
Other: ██░░░░░░░░ 18 errors (19%)
```

**Branch Diff Visualization**:

```
File Structure:
main        → 450 files
dev         → 465 files (15 new/modified)
feature-X   → 480 files (30 new/modified)

Unique to dev (to clean):
  - apps/web/lib/           [DUPLICATE - should use src/lib]
  - *.bak files (5 files)   [DELETE]
  - archive/docs/*          [ARCHIVE]
```

---

## 🔗 Links to Phase Artifacts
- Phase 1: `docs/visuals/branch-analysis/`
- Phase 2: `docs/visuals/dependencies/`
- Phase 3: `docs/visuals/type-errors/`
- Phase 4: `docs/visuals/progress/PHASE_REPORTS/`
