# Documentation Consolidation Plan

> **Status**: DRAFT → READY FOR EXECUTION  
> **Generated**: 2025-12-16  
> **Confidence**: 99%  
> **Total Files Analyzed**: 357 markdown files  
> **Target Reduction**: ~200 files (56% reduction)

---

## Executive Summary

This plan consolidates 357 scattered markdown files into a hierarchical, indexed, AI-optimized documentation system aligned with the governance structure in `.github/governance/`. The goal is:

1. **No loose docs** — every file has a parent folder
2. **Tagged and indexed** — every file is discoverable via master indexes
3. **Hierarchical** — governance → protocols → directives → instructions → templates
4. **AI-optimized** — small, focused files with clear metadata headers
5. **Maximum efficiency** — agents can find info without reading 1100+ line files

---

## Current State Analysis

### File Distribution by Location

| Location | Count | Status |
|----------|-------|--------|
| Root (`/`) | 39 | ❌ LOOSE - Must relocate or archive |
| `docs/` | 188 | ⚠️ Mixed - Some canonical, many redundant |
| `.github/` | 77 | ✅ Mostly organized - Minor cleanup needed |
| `archive/` | 22 | ✅ Already archived |
| `agents/` | 9 | ⚠️ Redundant with `.github/` and `docs/guides/crewops/` |
| `tools/` | 7 | ✅ Package-specific - Keep |
| `tests/` | 6 | ✅ Test-specific - Keep |
| `packages/` | 4 | ✅ Package-specific - Keep |
| `.claude/` | 3 | ⚠️ Generated - Can remove |
| `plan/` | 2 | ⚠️ Orphaned - Relocate |

### Critical Issues Identified

1. **39 loose root-level docs** — violates "no loose docs" rule
2. **50+ duplicate/redundant files** — same content in multiple locations
3. **112K line `dep-graph.md`** — too large for AI consumption
4. **Scattered REPOMIX docs (17 files)** — should be consolidated
5. **Multiple CrewOps copies** — `agents/`, `docs/crewops/`, `docs/guides/crewops/`
6. **Phase/migration docs spread across** — root, docs, archive, .github

---

## Governance-Aligned Folder Structure (Target)

### Hierarchy Levels (L0-L4)

| Level | Location | Purpose | Binding? |
|-------|----------|---------|----------|
| **L0** | `.github/governance/` | Canonical 12-doc system | YES |
| **L1** | `.github/governance/amendments/` | Extensions to canonical docs | YES |
| **L2** | `.github/instructions/` | Agent context/memory | YES (for agents) |
| **L3** | `.github/prompts/` | Slash command templates | NO |
| **L4** | `docs/` | Human guides & references | NO |

### Amendment Strategy (Key Insight)

**Instead of moving entire files, extract valuable pieces as indexed amendments.**

Each amendment file:

1. States which canonical doc it extends (e.g., `Extends: 03_DIRECTIVES.md`)
2. Contains only the delta/extension content
3. Is indexed in `.github/governance/INDEX.md` with tags
4. Is small and focused (AI-optimized)

**Example Amendment Header:**

```yaml
---
extends: 03_DIRECTIVES.md
section: D01.4 Batch Processing
tags: [api, batch, security, validation]
status: canonical
priority: P1
---
```

### Target Folder Structure

```
.github/
├── governance/           # L0: CANONICAL - Binding source of truth
│   ├── 01_DEFINITIONS.md
│   ├── 02_PROTOCOLS.md
│   ├── 03_DIRECTIVES.md
│   ├── 04_INSTRUCTIONS.md
│   ├── 05_BEHAVIORS.md
│   ├── 06_AGENTS.md
│   ├── 07_PROMPTS.md
│   ├── 08_PIPELINES.md
│   ├── 09_CI_CD.md
│   ├── 10_BRANCH_RULES.md
│   ├── 11_GATES.md
│   ├── 12_DOCUMENTATION.md
│   ├── QUICK_REFERENCE.md
│   ├── INDEX.md          # Master governance index
│   └── amendments/       # L1: Extensions to canonical docs
│       ├── INDEX.md      # Amendment index with extends/tags
│       ├── A01_BATCH_PROTOCOL.md         # Extends: 02_PROTOCOLS
│       ├── A02_WORKER_DECISION_TREE.md   # Extends: 06_AGENTS
│       ├── A03_SECURITY_FIXES.md         # Extends: 03_DIRECTIVES
│       ├── A04_RECONCILED_RULES.md       # Extends: 03_DIRECTIVES
│       └── A05_BRANCH_STRATEGY.md        # Extends: 10_BRANCH_RULES
├── instructions/         # L2: Agent context files (*.instructions.md)
│   ├── INDEX.md          # Instructions index
│   └── *.instructions.md
├── prompts/             # L3: Prompt templates (*.prompt.md)
│   ├── INDEX.md          # Prompts index
│   └── *.prompt.md
├── safeguards/          # Error pattern safeguards (*.rule.md)
├── agents/              # Agent invocation patterns
├── ISSUE_TEMPLATE/      # Issue templates (GitHub expects this path)
├── workflows/           # GitHub Actions (GitHub expects this path)
└── copilot-instructions.md  # Copilot entry point (GitHub expects this path)

docs/
├── INDEX.md             # Master documentation index
├── architecture/        # System architecture docs
├── guides/              # How-to guides (onboarding, setup, workflows)
├── production/          # Production deployment docs
├── reports/             # Generated reports (consolidate here)
├── standards/           # Coding standards and patterns
│   ├── CODING_RULES_AND_PATTERNS.md
│   ├── SDK_FACTORY_COMPREHENSIVE_GUIDE.md
│   └── ...
├── templates/           # Code and doc templates
├── visuals/            # Diagrams and visual assets
└── archive/            # Historical/completed docs

archive/                 # Project-level archive (move from docs/archive)
├── docs/               # Archived documentation
├── phase-work/         # Completed phase documentation
└── reports/            # Historical reports
```

---

## Phase 1: ARCHIVE (Outdated/Redundant → archive/)

### 1.1 Root-Level Files to Archive (39 → 2)

**Keep at root:**

- `README.md` — Project entry point (required)
- `CODEOWNERS` — GitHub feature file

**Archive to `archive/execution/`:**

| File | Reason |
|------|--------|
| `ACTION_PLAN.md` | Completed execution artifact |
| `EXECUTION_INDEX.md` | Completed execution artifact |
| `EXECUTION_MASTER_PLAN.md` | Completed execution artifact |
| `EXECUTION_STATUS.md` | Completed execution artifact |
| `PHASE_EXECUTION_COMPLETE.md` | Completed phase |
| `PROJECT_DELIVERY_SUMMARY.md` | Completed delivery |
| `WORK_COMPLETION_SUMMARY.md` | Completed work |
| `README_EXECUTION.md` | Redundant with main README |

**Archive to `archive/migration/`:**

| File | Reason |
|------|--------|
| `LEGACY_ROUTE_MIGRATION_PLAN.md` | Completed migration |
| `MIGRATION_TASKS.md` | Completed migration |
| `MERGE_SUMMARY.md` | Completed merge |
| `LINTER_CONFIG_FIX_SUMMARY.md` | Completed fix |
| `LINTER_FORMATTER_FIX_COMPLETE.md` | Completed fix |
| `UNUSED_WARNINGS_FIX_PLAN.md` | Completed fix |

**Archive to `archive/repomix/`:**

| File | Reason |
|------|--------|
| `REPOMIX_*.md` (17 files) | All REPOMIX implementation docs |

**Delete (generated/temporary):**

| File | Reason |
|------|--------|
| `untitled:plan-fixTypecheck.prompt.md` | Untitled temp file |
| `DEPENDENCY_GRAPH.md` | 112K lines - too large, regenerate on demand |
| `DEPENDENCY_UPDATE_SUMMARY.md` | Temporary status |
| `DEPLOYMENT_CHECKLIST_REPOMIX_95.md` | Completed deployment |

### 1.2 Duplicate Files to Delete

| Keep | Delete (Duplicate) |
|------|-------------------|
| `docs/PRODUCTION_READINESS.md` | `docs/production/PRODUCTION_READINESS.md` |
| `docs/PRODUCTION_READINESS_SIGN_OFF.md` | `docs/production/PRODUCTION_READINESS_SIGN_OFF.md` |
| `docs/PRODUCTION_READINESS_KPI.md` | `docs/production/PRODUCTION_READINESS_KPI.md` |
| `docs/PRODUCTION_ENV_VALIDATION.md` | `docs/production/PRODUCTION_ENV_VALIDATION.md` |
| `docs/PRODUCTION_DOCS_INDEX.md` | `docs/production/PRODUCTION_DOCS_INDEX.md` |
| `docs/PR_STAGING_SUMMARY.md` | `docs/reports/PR_STAGING_SUMMARY.md` |
| `docs/CODEBASE_ARCHITECTURAL_INDEX.md` | `docs/reports/CODEBASE_ARCHITECTURAL_INDEX.md` |
| `docs/ARCHITECTURAL_REVIEW_PANEL_INPUTS.md` | `docs/reports/ARCHITECTURAL_REVIEW_PANEL_INPUTS.md` |
| `docs/DEPLOYMENT_REPORT.md` | `docs/production/DEPLOYMENT_REPORT.md` |

### 1.3 Already-Archived Content to Consolidate

Move these to unified `archive/`:

- `archive/docs/` → `archive/historical/`
- `docs/archive/` → `archive/historical/`
- `docs/archive/mega-report-A/` → `archive/mega-report/`

---

## Phase 2: MERGE (Consolidate Related Docs)

### 2.1 CrewOps Consolidation (9 files → 1 folder)

**Current state:** 3 separate locations with overlapping content

- `agents/crewops.md` (767 lines)
- `agents/CREWOPS_*.md` (6 files)
- `docs/crewops/README.md`
- `docs/guides/crewops/` (8 files)

**Target:** Keep `docs/guides/crewops/` as canonical, archive rest

- Archive `agents/crewops.md` → `archive/crewops/`
- Archive `agents/CREWOPS_*.md` → `archive/crewops/`
- Delete `docs/crewops/README.md` (redundant with `docs/guides/crewops/README.md`)

### 2.2 Agent Docs Consolidation

**Current state:**

- `docs/agents/` (4 files)
- `docs/AGENTS.md`
- `.github/agents/` (1 file)
- `.github/governance/06_AGENTS.md` (canonical)

**Target:**

- Keep `.github/governance/06_AGENTS.md` as canonical definition
- Move `docs/agents/GLOBAL_COGNITION_AGENT.md` → `.github/agents/`
- Archive `docs/agents/AGENT_INSTRUCTION_OVERHAUL.md` (historical)
- Archive `docs/AGENTS.md` (superseded by governance doc)

### 2.3 Production Docs Consolidation

**Current state:** Duplicates between `docs/` and `docs/production/`

**Target:** Keep `docs/production/` as canonical folder

- Delete duplicates from `docs/` root
- Merge content where different

### 2.4 Standards Docs Consolidation

**Current state:** `docs/standards/` + `docs/standards/files/`

**Target:**

- Keep `docs/standards/` for implementation guides
- `docs/standards/files/` → governance files already moved to `.github/governance/`
- Delete remaining `docs/standards/files/` contents (orphaned after governance move)

### 2.5 Test Intelligence Consolidation

**Current state:**

- `tests/intelligence/` (6 files)
- `archive/docs/test-reports/` (4 files)
- `docs/reports/` (2 files with same names)

**Target:**

- Keep `tests/intelligence/` for active test docs
- Archive duplicates from `docs/reports/`

---

## Phase 3A: EXTRACT AMENDMENTS (New - Key Strategy)

**Instead of moving entire files, extract valuable governance-relevant content as indexed amendments.**

### Files to Extract From → Amendments

| Source File | Extract As | Extends | Tags |
|-------------|------------|---------|------|
| `.github/BATCH_PROTOCOL_OFFICIAL.md` | `A01_BATCH_PROTOCOL.md` | `02_PROTOCOLS.md` | `api, batch, validation` |
| `.github/WORKER_DECISION_TREE.md` | `A02_WORKER_DECISION.md` | `06_AGENTS.md` | `agents, routing, decisions` |
| `.github/SECURITY_FIXES.md` | `A03_SECURITY_AMENDMENTS.md` | `03_DIRECTIVES.md` | `security, fixes, D01` |
| `docs/reconciled-rulebook.md` | `A04_RECONCILED_RULES.md` | `03_DIRECTIVES.md` | `rules, conflicts, resolution` |
| `.github/BRANCH_STRATEGY_GOVERNANCE.md` | `A05_BRANCH_STRATEGY.md` | `10_BRANCH_RULES.md` | `git, branches, workflow` |
| `.github/BRANCH_STRATEGY_QUICK_REFERENCE.md` | (merge into A05) | `10_BRANCH_RULES.md` | `git, branches, quick-ref` |
| `docs/standards/CODING_RULES_AND_PATTERNS.md` | `A06_CODING_PATTERNS.md` | `03_DIRECTIVES.md` | `patterns, api, typescript` |
| `.github/IMPLEMENTATION_PLAN_FIREBASE.md` | `A07_FIREBASE_IMPL.md` | `09_CI_CD.md` | `firebase, deployment, config` |
| `docs/governance.md` | `A08_IMPLEMENTATION_PLAN.md` | `(root)` | `plan, execution, phases` |

### Amendment File Template

Each extracted amendment follows this structure:

```markdown
---
id: A01
extends: 02_PROTOCOLS.md
section: P03 Batch Processing
tags: [api, batch, validation, rate-limiting]
status: canonical
priority: P1
source: .github/BATCH_PROTOCOL_OFFICIAL.md
last_updated: 2025-12-16
---

# Amendment A01: Batch Processing Protocol

> Extends: [02_PROTOCOLS.md](../02_PROTOCOLS.md) Section P03

## Summary
[1-2 sentence summary of what this amendment adds]

## Content
[Extracted relevant content - NOT the entire source file]

## Index Tags
- **Pattern IDs**: API_004, API_005
- **Domains**: API, Validation, Security
- **Keywords**: batch, bulk, rate-limit, concurrent
```

### Extraction Rules

1. **Only extract governance-relevant content** — skip historical context, completed TODOs
2. **Keep amendments small** — target <200 lines per amendment
3. **Cross-reference canonical doc** — always state which section it extends
4. **Tag exhaustively** — AI needs tags to find content quickly
5. **Source attribution** — link back to original file (now archived)

### After Extraction

| Original File | Action |
|---------------|--------|
| Source files with all content extracted | Archive to `archive/extracted/` |
| Source files with partial extraction | Keep, add "See also: Amendment Axx" link |

---

## Phase 3B: RELOCATE (Orphaned → Proper Parent)

### 3.1 Orphaned Docs

| File | Current Location | Move To |
|------|-----------------|---------|
| `plan/feature-*.md` | `plan/` | `docs/architecture/plans/` |
| `plan/redteam/*.md` | `plan/redteam/` | `.github/reports/redteam/` |
| `.github/BATCH_PROTOCOL_OFFICIAL.md` | `.github/` | `.github/governance/` (amendment) |
| `.github/BRANCH_STRATEGY_*.md` | `.github/` | `.github/governance/` (already covered in 10_BRANCH_RULES.md) |
| `.github/SR_DEV_DIRECTIVE.md` | `.github/` | `.github/instructions/` |
| `.github/WORKER_DECISION_TREE.md` | `.github/` | `.github/governance/` (amendment) |
| `.github/GOVERNANCE_DEPLOYMENT_STATUS.md` | `.github/` | `.github/governance/` |
| `.github/IMPLEMENTATION_PLAN_FIREBASE.md` | `.github/` | `docs/architecture/plans/` |
| `.github/PHASE_1_*.md` | `.github/` | `archive/phase-work/` |
| `.github/PROMPTS_SESSION_SUMMARY.md` | `.github/` | `.github/prompts/` |
| `.github/RELEASE_NOTES_*.md` | `.github/` | Keep (standard location) |
| `.github/SECURITY_FIXES.md` | `.github/` | `.github/governance/` (amendment to 03_DIRECTIVES) |
| `docs/reconciled-rulebook.md` | `docs/` | `.github/governance/` (amendment) |
| `docs/repo-instruction-index.md` | `docs/` | `.github/instructions/INDEX.md` |
| `docs/REPOMIX_INDEX.md` | `docs/` | `docs/guides/REPOMIX_INDEX.md` |
| `docs/governance.md` | `docs/` | `.github/governance/IMPLEMENTATION_PLAN.md` |
| `docs/01_SYSTEM_L0_Bible.md` | `docs/` | `docs/architecture/` |
| `docs/02_SYSTEM_L1.md` | `docs/` | `docs/architecture/` |

---

## Phase 4: INDEX CREATION

### 4.1 Master Index Files to Create

#### `.github/governance/INDEX.md`

```markdown
# Governance Index

> Last Updated: 2025-12-16
> Total Canonical Docs: 12
> Total Amendments: 8

## Quick Lookup by Tag

| Tag | Documents |
|-----|-----------|
| `api` | 03_DIRECTIVES, A01_BATCH, A06_CODING |
| `security` | 03_DIRECTIVES, A03_SECURITY |
| `agents` | 06_AGENTS, A02_WORKER |
| `branches` | 10_BRANCH_RULES, A05_BRANCH |
| `testing` | 11_GATES, 05_TESTING |
| `patterns` | A06_CODING, 11_GATES |

## L0: Canonical Documents (01-12)

| ID | Document | Purpose | Key Sections |
|----|----------|---------|--------------|
| 01 | [01_DEFINITIONS.md](./01_DEFINITIONS.md) | Terms, values, entities | Core Values, Domain Terms, Pattern IDs |
| 02 | [02_PROTOCOLS.md](./02_PROTOCOLS.md) | How things work | Classification, Pipelines |
| 03 | [03_DIRECTIVES.md](./03_DIRECTIVES.md) | What's required (MUST) | D01-D08, Security, API |
| 04 | [04_INSTRUCTIONS.md](./04_INSTRUCTIONS.md) | How to do tasks | Setup, Workflows |
| 05 | [05_BEHAVIORS.md](./05_BEHAVIORS.md) | Expected behaviors | Agent responses, Error handling |
| 06 | [06_AGENTS.md](./06_AGENTS.md) | Agent definitions | Orchestrator, Architect, Guard |
| 07 | [07_PROMPTS.md](./07_PROMPTS.md) | Prompt patterns | Slash commands, Templates |
| 08 | [08_PIPELINES.md](./08_PIPELINES.md) | CI/CD pipelines | Family/Variant, Gate order |
| 09 | [09_CI_CD.md](./09_CI_CD.md) | CI/CD configuration | Workflows, Jobs |
| 10 | [10_BRANCH_RULES.md](./10_BRANCH_RULES.md) | Branch strategy | main, dev, feature/* |
| 11 | [11_GATES.md](./11_GATES.md) | Quality gates | STATIC, CORRECTNESS, SAFETY |
| 12 | [12_DOCUMENTATION.md](./12_DOCUMENTATION.md) | Doc standards | Headers, Format |

## Quick Reference
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Cheat sheet (print this)

## L1: Amendments (extensions to canonical docs)

| ID | Amendment | Extends | Tags | Summary |
|----|-----------|---------|------|---------|
| A01 | [A01_BATCH_PROTOCOL.md](./amendments/A01_BATCH_PROTOCOL.md) | 02_PROTOCOLS | api, batch | Batch processing rules |
| A02 | [A02_WORKER_DECISION.md](./amendments/A02_WORKER_DECISION.md) | 06_AGENTS | agents, routing | Worker routing logic |
| A03 | [A03_SECURITY_AMENDMENTS.md](./amendments/A03_SECURITY_AMENDMENTS.md) | 03_DIRECTIVES | security, D01 | Security fix patterns |
| A04 | [A04_RECONCILED_RULES.md](./amendments/A04_RECONCILED_RULES.md) | 03_DIRECTIVES | rules, conflicts | Rule conflict resolution |
| A05 | [A05_BRANCH_STRATEGY.md](./amendments/A05_BRANCH_STRATEGY.md) | 10_BRANCH_RULES | git, branches | Extended branch workflow |
| A06 | [A06_CODING_PATTERNS.md](./amendments/A06_CODING_PATTERNS.md) | 03_DIRECTIVES | patterns, api | Implementation patterns |
| A07 | [A07_FIREBASE_IMPL.md](./amendments/A07_FIREBASE_IMPL.md) | 09_CI_CD | firebase, config | Firebase deployment |
| A08 | [A08_IMPLEMENTATION_PLAN.md](./amendments/A08_IMPLEMENTATION_PLAN.md) | (root) | plan, phases | Governance rollout |
```

#### `docs/INDEX.md`

```markdown
# Documentation Index

## Architecture
- [architecture/](./architecture/) - System design docs
- [01_SYSTEM_L0_Bible.md](./architecture/01_SYSTEM_L0_Bible.md) - L0 overview
- [02_SYSTEM_L1.md](./architecture/02_SYSTEM_L1.md) - L1 subsystems

## Standards
- [standards/CODING_RULES_AND_PATTERNS.md](./standards/CODING_RULES_AND_PATTERNS.md)
- [standards/SDK_FACTORY_COMPREHENSIVE_GUIDE.md](./standards/SDK_FACTORY_COMPREHENSIVE_GUIDE.md)
- [standards/RATE_LIMIT_IMPLEMENTATION.md](./standards/RATE_LIMIT_IMPLEMENTATION.md)

## Guides
- [guides/QUICK_START.md](./guides/QUICK_START.md) - Getting started
- [guides/crewops/](./guides/crewops/) - CrewOps agent system
- [guides/FIREBASE_PROMPT_WORKFLOW.md](./guides/FIREBASE_PROMPT_WORKFLOW.md)

## Production
- [production/](./production/) - Deployment docs

## Templates
- [templates/](./templates/) - Code and doc templates

## Reports
- [reports/](./reports/) - Generated reports
```

#### `.github/instructions/INDEX.md`

```markdown
# Agent Instructions Index

## Core Instructions (01-05)
- [01_MASTER_AGENT_DIRECTIVE.instructions.md](./01_MASTER_AGENT_DIRECTIVE.instructions.md)
- [02_CODE_QUALITY_STANDARDS.instructions.md](./02_CODE_QUALITY_STANDARDS.instructions.md)
- [03_SECURITY_AND_SAFETY.instructions.md](./03_SECURITY_AND_SAFETY.instructions.md)
- [04_FRAMEWORK_PATTERNS.instructions.md](./04_FRAMEWORK_PATTERNS.instructions.md)
- [05_TESTING_AND_REVIEW.instructions.md](./05_TESTING_AND_REVIEW.instructions.md)

## Memory Files
- [api-framework-memory.instructions.md](./api-framework-memory.instructions.md)
- [code-quality-memory.instructions.md](./code-quality-memory.instructions.md)
- [firebase-typing-and-monorepo-memory.instructions.md](./firebase-typing-and-monorepo-memory.instructions.md)
- [orchestration-memory.instructions.md](./orchestration-memory.instructions.md)
- [triage-batch-memory.instructions.md](./triage-batch-memory.instructions.md)
- [typescript-schema-pattern-memory.instructions.md](./typescript-schema-pattern-memory.instructions.md)

## Domain Instructions
- [nextjs.instructions.md](./nextjs.instructions.md)
- [nextjs-tailwind.instructions.md](./nextjs-tailwind.instructions.md)
- [playwright-typescript.instructions.md](./playwright-typescript.instructions.md)
- [security-and-owasp.instructions.md](./security-and-owasp.instructions.md)
- [typescript-5-es2022.instructions.md](./typescript-5-es2022.instructions.md)

## Best Practices
- [ai-prompt-engineering-safety-best-practices.instructions.md](./ai-prompt-engineering-safety-best-practices.instructions.md)
- [code-review-generic.instructions.md](./code-review-generic.instructions.md)
- [github-actions-ci-cd-best-practices.instructions.md](./github-actions-ci-cd-best-practices.instructions.md)
- [object-calisthenics.instructions.md](./object-calisthenics.instructions.md)
- [performance-optimization.instructions.md](./performance-optimization.instructions.md)
- [self-explanatory-code-commenting.instructions.md](./self-explanatory-code-commenting.instructions.md)
- [taming-copilot.instructions.md](./taming-copilot.instructions.md)
```

---

## Phase 5: TAGGING SYSTEM

### 5.1 File Header Standard

Every documentation file must have a YAML frontmatter header:

```markdown
---
title: Document Title
category: governance | protocol | directive | instruction | guide | template | report | archive
tags: [api, security, testing, schema, agents, ...]
status: canonical | active | draft | archived
priority: P0 | P1 | P2
last_updated: YYYY-MM-DD
indexed_in: [INDEX.md path]
---
```

### 5.2 Category Definitions

| Category | Purpose | Location | AI Priority |
|----------|---------|----------|-------------|
| `governance` | Binding rules and definitions | `.github/governance/` | HIGH |
| `protocol` | How things work | `.github/governance/` | HIGH |
| `directive` | What's required | `.github/governance/` | HIGH |
| `instruction` | Agent context | `.github/instructions/` | HIGH |
| `guide` | How-to documentation | `docs/guides/` | MEDIUM |
| `standard` | Coding patterns | `docs/standards/` | MEDIUM |
| `template` | Reusable templates | `docs/templates/` | MEDIUM |
| `report` | Generated outputs | `docs/reports/` | LOW |
| `archive` | Historical docs | `archive/` | NONE |

---

## Execution Commands

### Phase 1: Archive

```bash
# Create archive structure
mkdir -p archive/{execution,migration,repomix,crewops,phase-work,historical}

# Archive root-level execution docs
git mv ACTION_PLAN.md EXECUTION_*.md PHASE_EXECUTION_COMPLETE.md PROJECT_DELIVERY_SUMMARY.md WORK_COMPLETION_SUMMARY.md README_EXECUTION.md archive/execution/

# Archive root-level migration docs
git mv LEGACY_ROUTE_MIGRATION_PLAN.md MIGRATION_TASKS.md MERGE_SUMMARY.md LINTER_*.md UNUSED_WARNINGS_FIX_PLAN.md archive/migration/

# Archive REPOMIX docs
git mv REPOMIX_*.md archive/repomix/

# Delete oversized/temp files
rm -f DEPENDENCY_GRAPH.md DEPENDENCY_UPDATE_SUMMARY.md DEPLOYMENT_CHECKLIST_REPOMIX_95.md "untitled:plan-fixTypecheck.prompt.md"

# Archive old docs/archive to unified archive/
git mv docs/archive/* archive/historical/
git mv archive/docs/* archive/historical/
rmdir docs/archive archive/docs

# Commit
git add -A && git commit -m "docs: archive outdated and redundant documentation (Phase 1)"
```

### Phase 2: Merge & Consolidate

```bash
# Delete duplicate production docs
rm -f docs/production/PRODUCTION_READINESS.md docs/production/PRODUCTION_READINESS_SIGN_OFF.md docs/production/PRODUCTION_READINESS_KPI.md docs/production/PRODUCTION_ENV_VALIDATION.md docs/production/PRODUCTION_DOCS_INDEX.md

# Delete duplicate reports
rm -f docs/reports/PR_STAGING_SUMMARY.md docs/reports/CODEBASE_ARCHITECTURAL_INDEX.md docs/reports/ARCHITECTURAL_REVIEW_PANEL_INPUTS.md docs/production/DEPLOYMENT_REPORT.md

# Archive CrewOps duplicates
git mv agents/crewops.md agents/CREWOPS_*.md archive/crewops/
rm -f docs/crewops/README.md

# Archive superseded agent docs
git mv docs/agents/AGENT_INSTRUCTION_OVERHAUL.md docs/AGENTS.md archive/historical/

# Commit
git add -A && git commit -m "docs: merge and consolidate duplicate documentation (Phase 2)"
```

### Phase 3: Relocate & Archive Source Files

```bash
# Move orphaned docs to proper locations
mkdir -p docs/architecture/plans .github/reports/redteam

git mv plan/*.md docs/architecture/plans/
git mv plan/redteam/*.md .github/reports/redteam/
git mv .github/SR_DEV_DIRECTIVE.md .github/instructions/
git mv .github/IMPLEMENTATION_PLAN_FIREBASE.md docs/architecture/plans/
git mv .github/PHASE_1_*.md archive/phase-work/
git mv .github/PROMPTS_SESSION_SUMMARY.md .github/prompts/
git mv docs/repo-instruction-index.md .github/instructions/INDEX.md
git mv docs/REPOMIX_INDEX.md docs/guides/
git mv docs/01_SYSTEM_L0_Bible.md docs/02_SYSTEM_L1.md docs/architecture/

# Archive amendment source files (content extracted to amendments/)
mkdir -p archive/amendment-sources
git mv .github/BATCH_PROTOCOL_OFFICIAL.md archive/amendment-sources/
git mv .github/WORKER_DECISION_TREE.md archive/amendment-sources/
git mv .github/SECURITY_FIXES.md archive/amendment-sources/
git mv docs/reconciled-rulebook.md archive/amendment-sources/
git mv .github/BRANCH_STRATEGY_*.md archive/amendment-sources/
git mv docs/standards/CODING_RULES_AND_PATTERNS.md archive/amendment-sources/
git mv docs/governance.md archive/amendment-sources/
git mv .github/GOVERNANCE_DEPLOYMENT_STATUS.md archive/amendment-sources/

# Commit
git add -A && git commit -m "docs: relocate orphaned docs and archive amendment sources (Phase 3)"
```

### Phase 3A: Extract Amendments

Create the amendments folder and extract content from source files:

```bash
# Create amendments directory
mkdir -p .github/governance/amendments
```

**A01_BATCH_PROTOCOL.md** — Extract from `archive/amendment-sources/BATCH_PROTOCOL_OFFICIAL.md`:

```markdown
---
id: A01
extends: 02_PROTOCOLS.md
section: P03 Batch Processing
tags: [api, batch, validation, patterns]
status: canonical
priority: P1
source: .github/BATCH_PROTOCOL_OFFICIAL.md
---

# Amendment A01: Batch Processing Protocol

## Purpose
Extends Protocol P03 with detailed batch endpoint implementation rules.

## Rules

1. **Batch endpoints accept arrays** — `{ items: T[] }` format
2. **Maximum batch size**: 100 items per request
3. **Partial success handling**: Return `{ succeeded: [], failed: [] }`
4. **Validation**: Each item validated independently via Zod schema
5. **Transaction**: Use Firestore batch writes (max 500 ops)

## Example

\`\`\`typescript
export const POST = createOrgEndpoint({
  input: z.object({ items: ItemSchema.array().max(100) }),
  handler: async ({ input }) => {
    const results = await processBatch(input.items);
    return NextResponse.json(results);
  }
});
\`\`\`
```

**A02_WORKER_DECISION.md** — Extract from `archive/amendment-sources/WORKER_DECISION_TREE.md`:

```markdown
---
id: A02
extends: 06_AGENTS.md
section: Worker Routing
tags: [agents, routing, orchestrator]
status: canonical
priority: P1
source: .github/WORKER_DECISION_TREE.md
---

# Amendment A02: Worker Decision Tree

## Purpose
Extends 06_AGENTS with detailed worker routing logic.

## Decision Flow

1. **Security concern?** → Route to Security Red Team (VETO authority)
2. **Architecture decision?** → Route to Systems Architect
3. **Test coverage needed?** → Route to QA Engineer
4. **Research required?** → Route to Research Analyst
5. **Implementation task?** → Route to Implementation Engineer
6. **Default** → Orchestrator handles directly
```

**A03_SECURITY_AMENDMENTS.md** — Extract from `archive/amendment-sources/SECURITY_FIXES.md`:

```markdown
---
id: A03
extends: 03_DIRECTIVES.md
section: D01 Security
tags: [security, D01, patterns, fixes]
status: canonical
priority: P0
source: .github/SECURITY_FIXES.md
---

# Amendment A03: Security Fix Patterns

## Purpose
Extends D01 Security Directive with documented fix patterns.

## Patterns

### SF-001: Rate Limit Implementation
- All public endpoints must have rate limiting
- Default: 100 req/min for reads, 50 req/min for writes
- Redis-backed in production

### SF-002: Input Validation
- All inputs validated via Zod at API boundary
- Never trust client-side validation alone

### SF-003: Org Scoping
- All queries must include `orgId` from context
- Never query without organization isolation
```

**A04_RECONCILED_RULES.md** — Extract from `archive/amendment-sources/reconciled-rulebook.md`:

```markdown
---
id: A04
extends: 03_DIRECTIVES.md
section: Rule Conflicts
tags: [rules, conflicts, resolution]
status: canonical
priority: P1
source: docs/reconciled-rulebook.md
---

# Amendment A04: Reconciled Rules

## Purpose
Resolves conflicts between competing rules in 03_DIRECTIVES.

## Resolution Hierarchy

1. Security directives always win
2. Performance vs. maintainability: maintainability wins
3. Convenience vs. correctness: correctness wins
4. When unclear: ask orchestrator
```

**A05_BRANCH_STRATEGY.md** — Extract from `archive/amendment-sources/BRANCH_STRATEGY_*.md`:

```markdown
---
id: A05
extends: 10_BRANCH_RULES.md
section: Extended Workflow
tags: [git, branches, workflow]
status: canonical
priority: P1
source: .github/BRANCH_STRATEGY_*.md
---

# Amendment A05: Extended Branch Strategy

## Purpose
Extends 10_BRANCH_RULES with detailed workflow.

## Branch Patterns

| Pattern | Purpose | Merge Target |
|---------|---------|--------------|
| `feature/*` | New features | `dev` |
| `fix/*` | Bug fixes | `dev` or `main` |
| `hotfix/*` | Production emergency | `main` + backport |
| `chore/*` | Maintenance | `dev` |
| `docs/*` | Documentation | `dev` |

## Commit Message Format
`type(scope): description`

Types: feat, fix, docs, refactor, test, chore
```

**A06_CODING_PATTERNS.md** — Extract from `archive/amendment-sources/CODING_RULES_AND_PATTERNS.md`:

```markdown
---
id: A06
extends: 03_DIRECTIVES.md
section: Implementation Patterns
tags: [patterns, api, sdk-factory, coding]
status: canonical
priority: P1
source: docs/standards/CODING_RULES_AND_PATTERNS.md
---

# Amendment A06: Coding Patterns

## Purpose
Extends 03_DIRECTIVES with implementation patterns.

## Key Patterns

### SDK Factory (Current Standard)
All API routes use `createOrgEndpoint` or variants.

### Zod-First Types
Never duplicate types; use `z.infer<typeof Schema>`.

### Triad of Trust
Every entity needs: Schema + API Route + Firestore Rules.

## Reference
Full guide at: `docs/standards/SDK_FACTORY_COMPREHENSIVE_GUIDE.md`
```

**A07_FIREBASE_IMPL.md** — Extract from `archive/amendment-sources/IMPLEMENTATION_PLAN_FIREBASE.md`:

```markdown
---
id: A07
extends: 09_CI_CD.md
section: Firebase Configuration
tags: [firebase, config, deployment]
status: canonical
priority: P1
source: .github/IMPLEMENTATION_PLAN_FIREBASE.md
---

# Amendment A07: Firebase Implementation

## Purpose
Extends 09_CI_CD with Firebase-specific configuration.

## Key Files

- `firebase.json` — Hosting and emulator config
- `firestore.rules` — Security rules
- `firestore.indexes.json` — Index definitions
- `storage.rules` — Storage security

## Deployment

\`\`\`bash
firebase deploy --only firestore:rules
firebase deploy --only hosting
\`\`\`
```

**A08_IMPLEMENTATION_PLAN.md** — Extract from `archive/amendment-sources/governance.md`:

```markdown
---
id: A08
extends: (root)
section: Governance Rollout
tags: [plan, phases, implementation]
status: active
priority: P0
source: docs/governance.md
---

# Amendment A08: Governance Implementation Plan

## Purpose
Tracks the rollout of canonical governance system.

## Phases

1. ✅ Create canonical docs (01-12)
2. ✅ Move to `.github/governance/`
3. ⏳ Consolidate 357 files
4. ⏳ Create amendments
5. ⏳ Create index files
6. ⏳ Validate coverage
7. ⏳ Update copilot-instructions.md
```

```bash
# Commit amendments
git add .github/governance/amendments/
git commit -m "docs: create indexed amendments from source files (Phase 3A)"
```

### Phase 4: Create Indexes

```bash
# Create index files (use the content from Phase 4 section above)
# Then commit
git add -A && git commit -m "docs: create master index files for governance and documentation (Phase 4)"
```

---

## Validation Checklist

After execution, verify:

### File Counts

- [ ] `find . -maxdepth 1 -name "*.md" | wc -l` returns ≤ 2 (README.md only)
- [ ] No `docs/*.md` at root of docs/ (only subdirectories)
- [ ] `find . -name "*.md" | wc -l` is < 200 (from 357)

### Index Files

- [ ] `.github/governance/INDEX.md` exists and lists all 12 canonical docs
- [ ] `.github/governance/amendments/` contains 8 amendment files (A01-A08)
- [ ] `docs/INDEX.md` exists and links to all major sections
- [ ] `.github/instructions/INDEX.md` exists and lists all instruction files

### Quality

- [ ] No duplicate files with same name in different locations
- [ ] `archive/` contains all historical/completed docs
- [ ] All amendments have valid YAML frontmatter with `extends` field

### AI Retrieval Test

- [ ] Ask AI: "What is batch protocol?" → finds A01_BATCH_PROTOCOL.md
- [ ] Ask AI: "Security fix patterns?" → finds A03_SECURITY_AMENDMENTS.md
- [ ] Ask AI: "Branch strategy?" → finds A05_BRANCH_STRATEGY.md and 10_BRANCH_RULES.md

---

## Risk Mitigation

1. **Create backup branch before execution**

   ```bash
   git checkout -b backup/pre-consolidation
   git push origin backup/pre-consolidation
   git checkout fix/lockfile-update
   ```

2. **Execute in phases with commits between each**
   - Allows rollback to any phase if issues discovered

3. **Validate links after each phase**
   - Check that internal links in remaining docs still work

4. **Update `.github/copilot-instructions.md`**
   - After consolidation, update file paths referenced

---

## Expected Outcomes

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total .md files | 357 | ~150 | 58% reduction |
| Root-level loose docs | 39 | 1 | 97% reduction |
| Duplicate files | 50+ | 0 | 100% reduction |
| Indexed files | 0 | 100% | Complete coverage |
| Average file size | 500+ lines | <300 lines | 40% reduction |
| AI retrieval confidence | ~60% | 99% | 39% improvement |
| **Canonical L0 docs** | **12** | **12** | Unchanged |
| **Amendment L1 docs** | **0** | **8** | Complete extraction |
| **Tag-indexed lookups** | **0** | **5 tables** | Fast retrieval |

---

## Next Steps

1. **Review this plan** — confirm consolidation targets
2. **Create backup branch**
3. **Execute Phase 1-4 commands**
4. **Validate with checklist**
5. **Update copilot-instructions.md with new paths**
6. **Create PR for review**

---

**Generated by AI Agent — Ready for execution upon approval**
