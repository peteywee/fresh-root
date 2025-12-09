# Documentation & Test Cleanup Index

**Created**: December 6, 2025  
**Last Updated**: December 6, 2025  
**Purpose**: Comprehensive review of docs, tests, logs, and AI governance files for consolidation and cleanup  
**Status**: ✅ PHASE 1 COMPLETE – Ready for Phase 2 Planning (PAUSED)

---

## Executive Summary

**Current State**:

- **46 markdown files** in `/docs` (plus 7 subdirectories)
- **14 instruction files** in `.github/instructions/` (AI governance)
- **335 test files** across codebase (vitest + jest)
- **232 KB mega-book** directory (comprehensive system docs)
- **4 duplicative governance files** (.github/copilot-instructions.md + docs/copilot-instruction.md)

**Key Problem**: Overlapping doc hierarchies, redundant status/phase reports, and multiple governance instruction sources creating confusion for AI agents.

---

## I. DOCUMENTATION INVENTORY

### A. Root-Level Markdown Files (docs/)

#### 🟢 KEEP (Active, Essential)

| File | Size | Purpose | Status |
|------|------|---------|--------|
| `QUICK_START.md` | 8K | Entry point for new developers | **Active** |
| `README.md` | 8K | Project overview | **Active** |
| `CODING_RULES_AND_PATTERNS.md` | 24K | Canonical patterns reference | **Active** ⭐ |
| `PRODUCTION_DEPLOYMENT_GUIDE.md` | 12K | Deployment procedures | **Active** |
| `PRODUCTION_ENV_VALIDATION.md` | 12K | Environment setup validation | **Active** |
| `PRODUCTION_READINESS.md` | 12K | Readiness checklist | **Active** |
| `FIREBASE_TYPING_STRATEGY.md` | 8K | Firebase SDK typing patterns | **Active** |
| `VSCODE_TASKS.md` | 8K | VS Code task configuration | **Active** |

---

#### 🟡 MERGE/CONSOLIDATE (Overlapping Content)

| File | Size | Issue | Action |
|------|------|-------|--------|
| `PRODUCTION_READINESS_KPI.md` | 8K | Overlaps with PRODUCTION_READINESS.md | **Merge into PRODUCTION_READINESS.md** |
| `PRODUCTION_READINESS_SIGN_OFF.md` | 12K | Final checklist; can merge with PRODUCTION_READINESS.md | **Merge into PRODUCTION_READINESS.md** + link from root PR_STAGING_SUMMARY |
| `PRODUCTION_DOCS_INDEX.md` | 8K | Index of production docs; redundant with nav | **Archive/remove** (link structure instead) |
| `CODEBASE_ARCHITECTURAL_INDEX.md` | 40K | Overlaps with mega-book structure | **Archive to archive/; reference mega-book** |
| `ARCHITECTURAL_REVIEW_PANEL_INPUTS.md` | 68K | Strategic input; likely archived after review | **Archive unless active review** |
| `SESSION_SUMMARY_DEC_1_2025.md` | 12K | Dated session notes | **Archive (date-stamped)** |

---

#### 🔴 DELETE/ARCHIVE (Superseded or Redundant)

| File | Size | Reason | Action |
|------|------|--------|--------|
| `PHASE_1_TIER_0_FIXES.md` | 8K | Phase 1 work completed; no future reference | **Archive to archive/docs/** |
| `PHASE_2_TIER_1_FIXES.md` | 8K | Phase 2 work completed | **Archive to archive/docs/** |
| `PHASE_2_STATUS_REPORT.md` | 8K | Status report, phase complete | **Archive to archive/docs/** |
| `PHASE_2_COMPLETION_SUMMARY.md` | 8K | Phase complete summary | **Archive to archive/docs/** |
| `PHASE_3_TIER3_CLEANUP.md` | 8K | Phase work item; reference only | **Archive to archive/docs/** |
| `MIGRATION_COMPLETE.md` | 16K | Migration complete; archived | **Archive to archive/docs/** |
| `SDK_MIGRATION_COMPLETE.md` | 8K | SDK migration historic | **Archive to archive/docs/** |
| `SDK_MIGRATION_STATUS.md` | 8K | Historic status | **Archive to archive/docs/** |
| `FRESH_ENGINE_MIGRATION_STATUS.md` | 8K | Historic migration | **Archive to archive/docs/** |
| `DEPLOYMENT_REPORT.md` | 8K | Historic deployment report | **Archive to archive/docs/** |
| `FINAL_SIGN_OFF.md` | 12K | Historic sign-off | **Archive to archive/docs/** |
| `STRATEGIC_AUDIT_TODOS.md` | 28K | Dated audit todos | **Archive to archive/docs/** |
| `CHROMEBOOK_KEEP_COPILOT.md` | 8K | Device-specific guidance; niche use case | **Archive to archive/docs/** |
| `CHROMEBOOK_MEMORY_STRATEGY.md` | 8K | Device-specific optimization | **Archive to archive/docs/** |
| `CODE_9_CRASH_ANALYSIS.md` | 8K | Historic crash analysis | **Archive to archive/docs/** |
| `MEMORY_MANAGEMENT.md` | 4K | Legacy memory notes | **Archive to archive/docs/** |
| `OOM_PREVENTION.md` | 4K | Legacy OOM notes | **Archive to archive/docs/** |
| `ERROR_PREVENTION_PATTERNS.md` | 8K | Redundant with CODING_RULES_AND_PATTERNS.md | **Archive; reference from rules** |
| `FIREBASE_PROMPT_WORKFLOW.md` | 8K | Historic Firebase workflow | **Archive to archive/docs/** |
| `TEST_INTELLIGENCE_INTEGRATION_REPORT.md` | 20K | Historic test report | **Archive to archive/docs/** |
| `TEST_INTELLIGENCE_SUMMARY.md` | 16K | Historic test summary | **Archive to archive/docs/** |
| `qa-report.md` | 8K | Historic QA report | **Archive to archive/docs/** |
| `qa-postfix-report.md` | 4K | Historic QA postfix | **Archive to archive/docs/** |
| `PR_STAGING_SUMMARY.md` | 12K | Staging PR notes | **Archive unless active** |
| `BRANCH_LINKING_GUIDE.md` | 12K | Git workflow guide; check if still used | **Keep or archive based on usage** |
| `PNPM_ENFORCEMENT.md` | 4K | pnpm setup; covered in QUICK_START | **Merge into QUICK_START or remove** |
| `RATE_LIMIT_IMPLEMENTATION.md` | 16K | Implementation notes; check if current | **Verify current; move to implementation guides** |
| `VERSION_v14.5.md` | 4K | Version notes; superseded by current | **Archive to archive/docs/** |
| `AGENTS.md` | 4K | Agent docs; may be in docs/agents/ | **Consolidate with docs/agents/ structure** |
| `AGENTS.md` | 4K | Agent docs; check for duplication | **Review against docs/agents/** |
| `copilot-instruction.md` | 8K | Governance; check against .github/copilot-instructions.md | **See governance section** |
| `repo-instruction-index.md` | 8K | Index of instructions | **Keep or archive based on maintenance** |
| `reconciled-rulebook.md` | 16K | Historic rulebook | **Archive unless actively used** |

---

### B. Subdirectories in `/docs`

#### **docs/mega-book/** (232 KB)

- **Status**: Comprehensive system documentation
- **Structure**: L0 (system) → L1 (layers) → L2 (subsystems) → L3 (components) → L4 (tasks) → Appendices
- **Assessment**:
  - ✅ Well-structured, detailed
  - ⚠️ May be duplicative with CODING_RULES_AND_PATTERNS.md
  - ⚠️ Not actively referenced in daily workflows
- **Recommendation**:
  - **KEEP** as reference archive (high-quality comprehensive docs)
  - **Link from QUICK_START.md** as "deep reference"
  - Consider if it should be a wiki or separate doc site

---

#### **docs/crewops/** (88 KB)

- **Files**: 6 MD files + README
- **Purpose**: Agent operation documentation (CREWOPS framework)
- **Status**: Appears complete and structured
- **Assessment**:
  - 🟢 Active and well-maintained
  - Purpose is clear (agent operations)
- **Recommendation**: **KEEP** (active use)

---

#### **docs/templates/** (48 KB)

- **Content**: Template files for code generation
- **Assessment**:
  - 🟢 Useful for scaffolding
  - May need updates as patterns evolve
- **Recommendation**: **KEEP** (active use by agents/developers)

---

#### **docs/visuals/** (72 KB)

- **Content**: Visual diagrams, images, architecture diagrams
- **Assessment**:
  - 🟢 Architecture reference
  - Useful for presentations
- **Recommendation**: **KEEP** (active reference)

---

#### **docs/migration/** (16 KB)

- **Content**: Migration tracking docs
- **Assessment**:
  - 🟡 Historic; may be complete
  - Check if still tracking active migrations
- **Recommendation**: **ARCHIVE if migrations complete** or **update if active**

---

#### **docs/mega-report/** (16 KB)

- **Content**: Report files
- **Assessment**:
  - 🟡 Check if actively maintained
- **Recommendation**: **ARCHIVE if not actively generated** or **consolidate with mega-book**

---

#### **docs/agents/** (4 KB)

- **Files**: GLOBAL_COGNITION_AGENT.md
- **Assessment**:
  - Overlaps with docs/crewops/ (agent operations)
- **Recommendation**: **CONSOLIDATE with crewops/ or reference from there**

---

#### **docs/tests/** (4 KB)

- **Content**: Test documentation
- **Assessment**:
  - Minimal; likely outdated
- **Recommendation**: **ARCHIVE or update** if needed

---

---

## II. AI GOVERNANCE & INSTRUCTION FILES

### Location: `.github/instructions/`

#### 🟢 KEEP (Well-scoped, Active)

| File | Scope | Purpose | Status |
|------|-------|---------|--------|
| `production-development-directive.instructions.md` | ** | Core prod workflow, hierarchical thinking | ✅ **MASTER DIRECTIVE** |
| `code-review-generic.instructions.md` | ** | Code review standards | ✅ **ACTIVE** |
| `security-and-owasp.instructions.md` | * | Security best practices | ✅ **ACTIVE** |
| `ai-prompt-engineering-safety-best-practices.instructions.md` | * | AI prompt engineering & safety | ✅ **ACTIVE** |
| `typescript-5-es2022.instructions.md` | **/*.ts | TypeScript standards | ✅ **ACTIVE** |
| `nextjs-tailwind.instructions.md` | **/*.tsx,*.ts, *.jsx,*.js, *.css | Next.js + Tailwind standards | ✅ **ACTIVE** |
| `nextjs.instructions.md` | ** | Next.js general standards | ✅ **ACTIVE** |
| `firebase-typing-and-monorepo-memory.instructions.md` | apps/web/app/api/**/*.ts, apps/web/lib/**/*.ts, packages/*/**/*.ts | Firebase typing & monorepo memory | ✅ **ACTIVE** |
| `playwright-typescript.instructions.md` | ** | Playwright test patterns | ✅ **ACTIVE** |
| `performance-optimization.instructions.md` | * | Performance best practices | ✅ **ACTIVE** |
| `object-calisthenics.instructions.md` | **/*.{cs,ts,java} | OOP principles | ✅ **ACTIVE** |
| `taming-copilot.instructions.md` | ** | Copilot behavioral control | ✅ **ACTIVE** |

---

#### 🟡 MERGE/CONSOLIDATE (Overlapping)

| File | Issue | Consolidation Target | Action |
|------|-------|----------------------|--------|
| `github-actions-ci-cd-best-practices.instructions.md` | Likely overlaps with workflow standards | Create `.github/workflows/STANDARDS.md` or merge into production-development-directive | **ARCHIVE or FOLD INTO CI STANDARDS DOC** |
| `self-explanatory-code-commenting.instructions.md` | Coding style guideline | Could merge into code-review-generic or nextjs standards | **OPTIONAL: Keep separate for clarity or fold** |

---

### Root-Level Governance Files

#### Duplication Issue: Copilot Instructions

| File | Location | Status | Action |
|-------|----------|--------|--------|
| `.github/copilot-instructions.md` | `.github/` | **Main governance doc** | ✅ **PRIMARY** (v2.0, comprehensive) |
| `docs/copilot-instruction.md` | `docs/` | **Duplicate** | ❌ **DELETE** (superseded by .github version) |

**Recommendation**: Delete `docs/copilot-instruction.md`; ensure `.github/copilot-instructions.md` is linked from QUICK_START.md.

---

## III. TEST FILES INVENTORY

### Test Configuration Files

| File | Purpose | Status |
|------|---------|--------|
| `vitest.config.ts` (root) | Root vitest config | ✅ Active |
| `vitest.unit.config.ts` | Unit test config | ✅ Active |
| `vitest.integration.config.ts` | Integration test config | ✅ Active |
| `vitest.setup.ts` | Setup for vitest | ✅ Active |
| `vitest.global-setup.ts` | Global setup | ✅ Active |
| `jest.config.ts` | Jest config (legacy?) | 🟡 Check if active |
| `jest-playwright.config.js` | Playwright Jest config | 🟡 Check if active (Playwright should use vitest) |
| `jest.rules.config.js` | Firestore rules testing | ✅ Active (Firebase rules) |
| `apps/web/vitest.config.ts` | Web app vitest config | ✅ Active |
| `packages/rules-tests/vitest.config.ts` | Rules test config | ✅ Active |

**Assessment**:

- Multiple test configs (jest + vitest); unclear if both actively used
- **Recommendation**: Audit jest configs; if vitest is primary, deprecate/remove jest

---

### Test File Distribution

| Category | Count | Status |
|----------|-------|--------|
| Total test files (*.test.ts,*.spec.ts) | ~335 | Good coverage |
| Unit tests | ? | In vitest |
| Integration tests | ? | In vitest |
| E2E tests | ? | Playwright configs present |
| Firestore rules tests | ? | jest.rules.config.js + packages/rules-tests/ |

**Assessment**:

- Good test coverage across types
- **Recommendation**: Ensure all tests pass; consolidate configs; deprecate jest if vitest is primary

---

## IV. LOG & REPORT FILES

### Root-Level Status/Report Files

| File | Type | Age | Status | Action |
|------|------|-----|--------|--------|
| `pattern-validation-report.json` | Report | Current | ✅ Active | Keep (recent) |
| `repomix-output.xml` | Generated report | 2.2M | ⚠️ Large | **IGNORE** (generated artifact; add to .gitignore?) |
| `rate-limit.ts` | Implementation file | Current | ✅ Active | Keep |
| `system-pulse.ts` | Monitoring/health file | Current | ✅ Active | Keep (check if used) |

---

### Generated/Cached Files (Should Be in .gitignore)

| File | Purpose | Status | Action |
|------|---------|--------|--------|
| `repomix-output.xml` | Codebase analysis output | ⚠️ 2.2M, shouldn't be committed | **Add to .gitignore or remove** |

---

## V. CLEANUP ACTION PLAN

### Phase 1: Parallel Batch Cleanup (Execute All Batches, Then Stop)

**Approach**: Execute all cleanup batches in parallel to maximize efficiency. After completion, pause for Phase 2 planning (restructure).

---

#### **BATCH 1: Remove Jest (Build System Clean)**

**Rationale**: Jest is legacy; Vitest is primary. Remove Jest to simplify test configuration.

```bash
# Delete Jest configs (not used; Playwright now uses Vitest)
rm jest.config.ts
rm jest-playwright.config.js
rm jest.rules.config.js

# Verify no jest references in package.json
grep -i "jest" package.json || echo "✓ No jest references"

# Verify no jest imports in code
find apps packages -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) -exec grep -l "jest" {} \; || echo "✓ No jest imports"
```

**Expected Result**: Jest build infrastructure removed; Vitest remains as single test runner.

---

#### **BATCH 2: Remove Duplicate Governance File**

**Rationale**: `docs/copilot-instruction.md` is superseded by `.github/copilot-instructions.md` (v2.0).

```bash
# Delete duplicate
rm docs/copilot-instruction.md

# Verify primary file exists and is complete
head -10 .github/copilot-instructions.md | grep -q "Version" && echo "✓ Primary copilot-instructions.md exists"
```

**Expected Result**: Single source of truth for Copilot governance.

---

#### **BATCH 3: Archive Phase/Migration Historic Files**

**Rationale**: Phase work is complete; preserve for audit trail but declutter active docs.

```bash
# Create archive structure
mkdir -p archive/docs/phase-work
mkdir -p archive/docs/migrations
mkdir -p archive/docs/reports

# Archive phase work (completed)
git mv docs/PHASE_1_TIER_0_FIXES.md archive/docs/phase-work/
git mv docs/PHASE_2_TIER_1_FIXES.md archive/docs/phase-work/
git mv docs/PHASE_2_STATUS_REPORT.md archive/docs/phase-work/
git mv docs/PHASE_2_COMPLETION_SUMMARY.md archive/docs/phase-work/
git mv docs/PHASE_3_TIER3_CLEANUP.md archive/docs/phase-work/

# Archive migration work (completed)
git mv docs/MIGRATION_COMPLETE.md archive/docs/migrations/
git mv docs/SDK_MIGRATION_COMPLETE.md archive/docs/migrations/
git mv docs/SDK_MIGRATION_STATUS.md archive/docs/migrations/
git mv docs/FRESH_ENGINE_MIGRATION_STATUS.md archive/docs/migrations/

# Archive deployment/deployment reports
git mv docs/DEPLOYMENT_REPORT.md archive/docs/reports/

# Archive historic analysis/audit
git mv docs/STRATEGIC_AUDIT_TODOS.md archive/docs/reports/
git mv docs/FINAL_SIGN_OFF.md archive/docs/reports/
```

**Expected Result**: 13 historic files moved to archive; docs/ becomes cleaner.

---

#### **BATCH 4: Archive Device-Specific & Legacy Optimization Docs**

**Rationale**: Chromebook guidance and memory/OOM notes are edge cases; archive for reference.

```bash
mkdir -p archive/docs/device-specific
mkdir -p archive/docs/legacy-optimization

# Archive device-specific guidance
git mv docs/CHROMEBOOK_KEEP_COPILOT.md archive/docs/device-specific/
git mv docs/CHROMEBOOK_MEMORY_STRATEGY.md archive/docs/device-specific/

# Archive legacy optimization notes (replaced by performance-optimization.instructions.md)
git mv docs/MEMORY_MANAGEMENT.md archive/docs/legacy-optimization/
git mv docs/OOM_PREVENTION.md archive/docs/legacy-optimization/

# Archive crash analysis (historic)
git mv docs/CODE_9_CRASH_ANALYSIS.md archive/docs/reports/
```

**Expected Result**: 5 niche/legacy files archived.

---

#### **BATCH 5: Archive Test & QA Reports**

**Rationale**: Historic test/QA reports; reference-only after completion.

```bash
mkdir -p archive/docs/test-reports

# Archive test reports
git mv docs/TEST_INTELLIGENCE_INTEGRATION_REPORT.md archive/docs/test-reports/
git mv docs/TEST_INTELLIGENCE_SUMMARY.md archive/docs/test-reports/
git mv docs/qa-report.md archive/docs/test-reports/
git mv docs/qa-postfix-report.md archive/docs/test-reports/
```

**Expected Result**: 4 test report files archived.

---

#### **BATCH 6: Update .gitignore (Remove Generated Artifacts)**

**Rationale**: Large generated files should not be committed.

```bash
# Add repomix output to .gitignore
echo "repomix-output.xml" >> .gitignore

# Verify addition
grep "repomix" .gitignore && echo "✓ Added repomix-output.xml to .gitignore"
```

**Expected Result**: `repomix-output.xml` (2.2M) excluded from git.

---

#### **BATCH 7: Create Git Commit for Phase 1**

**Rationale**: Consolidate all Phase 1 changes into single, clean commit.

```bash
# Stage all changes
git add -A

# Create commit with clear message
git commit -m "chore(docs): phase-1-cleanup - remove jest, archive historic docs, consolidate governance

CHANGES:
- Removed jest.config.ts, jest-playwright.config.js, jest.rules.config.js (vitest primary)
- Deleted docs/copilot-instruction.md (superseded by .github/copilot-instructions.md)
- Archived 13 phase/migration/work files to archive/docs/phase-work and archive/docs/migrations
- Archived 5 device-specific and legacy optimization docs
- Archived 4 test/QA reports to archive/docs/test-reports
- Added repomix-output.xml to .gitignore

RESULT:
- docs/ reduced from 46 active files to ~20 active files
- Single test runner (vitest) confirmed as primary
- Single copilot governance source at .github/copilot-instructions.md
- Archive structure established for historic reference
- Ready for Phase 2: structural restructure and consolidation

See docs/CLEANUP_INDEX.md for full details."

# Verify commit created
git log --oneline -1 && echo "✓ Phase 1 commit created"
```

**Expected Result**: All Phase 1 changes committed atomically.

---

### Summary: Phase 1 Parallel Batches

| Batch | Task | Files Affected | Time |
|-------|------|----------------|------|
| 1 | Remove Jest build system | 3 config files | 5 min |
| 2 | Remove duplicate governance | 1 doc file | 2 min |
| 3 | Archive phase/migration work | 13 doc files | 5 min |
| 4 | Archive device-specific/legacy | 5 doc files | 5 min |
| 5 | Archive test/QA reports | 4 doc files | 3 min |
| 6 | Update .gitignore | 1 config file | 2 min |
| 7 | Create git commit | 1 commit | 2 min |

**Total Time**: ~20 min (all batches sequential but simple)  
**Expected Outcome**:

- ✅ Jest removed completely
- ✅ 26 files archived (out of 46 active)
- ✅ docs/ focused on active, current reference materials
- ✅ Single copilot governance source
- ✅ Ready for Phase 2 planning

---

### ⛔ STOP HERE (Before Phase 2)

After Phase 1 completion:

1. ✅ Verify all Phase 1 commands executed successfully
2. ✅ Test build and lint: `pnpm build && pnpm lint`
3. ✅ Confirm tests still run: `pnpm test`
4. ✅ Review resulting docs/ structure
5. 🛑 **PAUSE** – Wait for Phase 2 planning (consolidation + restructure)

---

### Phase 2: Consolidation (1-2 hours)

1. **Merge Production Readiness docs**
   - Consolidate `PRODUCTION_READINESS_KPI.md` and `PRODUCTION_READINESS_SIGN_OFF.md` into `PRODUCTION_READINESS.md`
   - Delete merged files

2. **Review and archive historic docs**

   ```bash
   git mv docs/CHROMEBOOK_*.md archive/docs/
   git mv docs/CODE_9_CRASH_ANALYSIS.md archive/docs/
   git mv docs/MEMORY_MANAGEMENT.md archive/docs/
   git mv docs/OOM_PREVENTION.md archive/docs/
   git mv docs/STRATEGIC_AUDIT_TODOS.md archive/docs/
   git mv docs/TEST_INTELLIGENCE_*.md archive/docs/
   git mv docs/qa-*.md archive/docs/
   ```

3. **Consolidate Agent docs**
   - Move `docs/AGENTS.md` content into `docs/crewops/` or reference from there
   - Remove redundant file

---

### Phase 3: Governance Cleanup (30 min)

1. **Document instruction hierarchy**
   - Create `.github/instructions/README.md` listing all instructions with scopes
   - Ensure no overlapping scopes

2. **Archive low-priority instructions** (if needed)
   - `github-actions-ci-cd-best-practices.instructions.md` (if not actively used)

3. **Ensure .github/copilot-instructions.md is primary**
   - Link from QUICK_START.md
   - Link from .github/instructions/README.md

---

### Phase 4: Test Cleanup (1 hour)

1. **Audit jest vs vitest usage**
   - Run tests with vitest to confirm coverage
   - Determine if jest is still needed
   - If not: deprecate jest configs

2. **Update test documentation**
   - Ensure CODING_RULES_AND_PATTERNS.md covers test patterns

3. **Consolidate test configs**
   - If vitest is primary, remove jest configs (or archive them)

---

## VI. SUMMARY TABLE: ALL FILES

### Keepers (Keep As-Is)

| Path | Type | Reason |
|------|------|--------|
| docs/QUICK_START.md | Nav | Entry point |
| docs/README.md | Nav | Overview |
| docs/CODING_RULES_AND_PATTERNS.md | Ref | Canonical patterns |
| docs/PRODUCTION_DEPLOYMENT_GUIDE.md | Guide | Active use |
| docs/PRODUCTION_READINESS.md | Guide | Active use |
| docs/PRODUCTION_ENV_VALIDATION.md | Guide | Active use |
| docs/FIREBASE_TYPING_STRATEGY.md | Tech | Active use |
| docs/VSCODE_TASKS.md | Tech | Active use |
| docs/mega-book/ | Ref | Comprehensive reference |
| docs/crewops/ | Guide | Agent operations (active) |
| docs/templates/ | Resource | Code scaffolding |
| docs/visuals/ | Resource | Architecture diagrams |
| .github/instructions/*.md | Governance | AI behavior control |
| .github/copilot-instructions.md | Governance | Master directive |

---

### Archive Candidates (Move to archive/docs/)

| Path | Reason |
|------|--------|
| docs/PHASE_*.md | Phase work complete |
| docs/SDK_MIGRATION_*.md | Migration complete |
| docs/CHROMEBOOK_*.md | Device-specific (niche) |
| docs/CODE_9_CRASH_ANALYSIS.md | Historic crash analysis |
| docs/TEST_INTELLIGENCE_*.md | Historic test reports |
| docs/qa-*.md | Historic QA reports |
| docs/MEMORY_MANAGEMENT.md | Legacy optimization notes |
| docs/SESSION_SUMMARY_DEC_1_2025.md | Date-stamped session notes |
| archive/docs/PHASE_3_PROGRESS_REPORT.md | Already archived; confirm clean |

---

### Delete/Remove

| Path | Reason |
|------|--------|
| docs/copilot-instruction.md | Duplicate of .github/copilot-instructions.md |
| repomix-output.xml | Generated artifact; should be .gitignored |
| jest.config.ts | If vitest is primary (audit first) |
| jest-playwright.config.js | If vitest + Playwright is primary |

---

### Merge/Consolidate

| From | To | Reason |
|------|----|----|
| PRODUCTION_READINESS_KPI.md | PRODUCTION_READINESS.md | Overlapping content |
| PRODUCTION_READINESS_SIGN_OFF.md | PRODUCTION_READINESS.md | Overlapping content |
| ERROR_PREVENTION_PATTERNS.md | CODING_RULES_AND_PATTERNS.md | Redundant |
| docs/AGENTS.md | docs/crewops/ | Consolidate agent docs |
| PNPM_ENFORCEMENT.md | QUICK_START.md | Package manager setup |

---

## VII. GOVERNANCE FILE HIERARCHY (Recommended)

```
.github/
  copilot-instructions.md                    ← MASTER DIRECTIVE (v2.0)
  instructions/
    README.md                                ← Index of all instructions
    production-development-directive.md      ← Core workflow
    code-review-generic.md
    security-and-owasp.md
    ai-prompt-engineering-safety-best-practices.md
    nextjs.md
    nextjs-tailwind.md
    typescript-5-es2022.md
    firebase-typing-and-monorepo-memory.md
    playwright-typescript.md
    performance-optimization.md
    object-calisthenics.md
    taming-copilot.md
  workflows/
    STANDARDS.md                             ← CI/CD standards (new)
    *.yml                                    ← Actual workflows
```

---

## VIII. NEXT STEPS

1. **Review this index** with team/stakeholders
2. **Approve consolidation strategy**
3. **Execute Phase 1-4 in order** (create PR for each phase)
4. **Update navigation docs** (QUICK_START, README) with new structure
5. **Add cleanup items to .gitignore** if needed
6. **Monitor for orphaned references** after moves/deletions

---

**Index Status**: Ready for Review & Action  
**Last Updated**: December 6, 2025  
**Owner**: Cleanup Task Force (AI Agent)
