---

title: "Automation & CI: Continuous Visual Generation"
description: "How visual documentation is automatically generated and maintained."
keywords:
  - automation
  - ci
  - visuals
  - documentation
category: "report"
status: "active"
audience:
  - developers
  - operators
related-docs:
  - README.md
  - ../INDEX.md
createdAt: "2026-01-31T07:19:03Z"
lastUpdated: "2026-01-31T07:19:03Z"

---

# 🤖 Automation & CI: Continuous Visual Generation

**Purpose**: Enable automatic visual documentation updates on push\
**Owner**: Documentation Lead\
**Branch**: docs-and-tests (or dev)

---

## 📋 Overview

This guide establishes how visuals are automatically generated and maintained:

1. **On Every Push**: Generate basic metrics (errors, files, etc.)
2. **On Phase Complete**: Generate comprehensive phase report
3. **On Merge to main**: Archive visuals and create summary
4. **On docs-and-tests Branch**: Update visual reference library

---

## 🚀 Automation Script: Visual Generator

**File**: `scripts/generate-visuals.sh`

```bash
# !/bin/bash
# Generate visual progress reports and metrics
# Run on: Every push to dev or phase completion
set -e

echo "🎨 Generating Visual Reports..."

VISUALS_DIR="docs/visuals"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
PHASE_REPORT="${VISUALS_DIR}/progress/PHASE_$(date '+%Y%m%d_%H%M%S').md"

# 1. Count TypeScript Errors
echo "📊 Counting TypeScript errors..."
TS_ERRORS=$(pnpm -w typecheck 2>&1 | grep -c "error TS" || echo "0")

# 2. Count TypeScript Warnings
TS_WARNINGS=$(pnpm -w typecheck 2>&1 | grep -c "warning TS" || echo "0")

# 3. Count Missing Package Imports
MISSING_MODULES=$(pnpm -w typecheck 2>&1 | grep "Cannot find module" | wc -l)

# 4. File Count
TOTAL_FILES=$(find apps packages functions -type f -name "*.ts" -o -name "*.tsx" | wc -l)
DELETED_FILES=$(git log --oneline --all --grep="delete\|remove" --since="1 day ago" | wc -l)

# 5. Generate Dashboard Update
cat > "${VISUALS_DIR}/progress/METRICS_$(date '+%Y%m%d').md" << EOF
# 📊 Metrics Report - $(date '+%Y-%m-%d')
**Generated**: ${TIMESTAMP}

## Compiler Metrics
| Metric | Value | Trend |
|--------|-------|-------|
| TypeScript Errors | ${TS_ERRORS} | ↓ (goal: 0) |
| TypeScript Warnings | ${TS_WARNINGS} | ↓ (goal: 0) |
| Missing Modules | ${MISSING_MODULES} | ↓ (goal: 0) |

## Codebase Metrics
| Metric | Value |
|--------|-------|
| Total TypeScript Files | ${TOTAL_FILES} |
| Deleted This Period | ${DELETED_FILES} |

## Progress
\`\`\`
TypeScript Errors: $(printf '█%.0s' $(seq 1 $((TS_ERRORS / 10))))░░░░░░░░░░ ${TS_ERRORS}/0
Missing Modules:   $(printf '█%.0s' $(seq 1 $((MISSING_MODULES / 5))))░░░░░░░░░░ ${MISSING_MODULES}/0
\`\`\`

---
Generated at: ${TIMESTAMP}
EOF

echo "✅ Visuals generated at ${VISUALS_DIR}/progress/"
```

---

## 📅 Scheduled Tasks

### Daily at 09:00 UTC

```yaml
name: Daily Metrics Report
schedule: "0 9 * * *"
branch: dev

steps:
  1. pnpm -w typecheck 1. scripts/generate-visuals.sh 2. Commit metrics to dev 3. Update
  DASHBOARD.md
```

### On Every Push to dev

```yaml
name: Update Visuals
on:
  push:
    branches:
      - dev
    paths:
      - "apps/**"
      - "packages/**"
      - "functions/**"

steps: 1. pnpm -w typecheck 1. Count errors 2. Update progress metrics 3. Push updated visuals/
```

### On Phase Completion (Manual)

```bash
# When Phase 1 complete:
./scripts/generate-visuals.sh --phase=1 --complete

# When Phase 2 complete:
./scripts/generate-visuals.sh --phase=2 --complete

# ... etc
```

### On Merge to main (Archive)

```yaml
name: Archive and Summarize
on:
  pull_request:
    branches:
      - main

steps:
  1. Create archive snapshot 1. Generate completion summary 2. Document what was fixed 3. Create
  branch summary
```

---

## 📁 Artifact Structure

```
docs/visuals/
├─ progress/
│  ├─ DASHBOARD.md ..................... Live progress (updated continuously)
│  ├─ METRICS_20251205.md .............. Daily metrics snapshot
│  ├─ PHASE_20251205_140000.md ......... Phase report (generated on completion)
│  └─ PHASE_REPORTS/
│     ├─ PHASE_1_COMPLETION.md ......... Summary of Phase 1
│     ├─ PHASE_2_COMPLETION.md ......... Summary of Phase 2
│     └─ ...
│
├─ branch-analysis/
│  ├─ BRANCH_DIFF_VISUAL.md ............ Visual diff of branches
│  ├─ DUPLICATE_FILES.md .............. Files to delete (Cleanup Lead)
│  ├─ DELETION_LOG.md ................. What was deleted (Cleanup Lead)
│  └─ BRANCH_CONSOLIDATION_GUIDE.md ... Consolidation strategy
│
├─ type-errors/
│  ├─ ERROR_CATEGORIES.md ............. Errors grouped by type
│  ├─ ERROR_DASHBOARD.md .............. Visual error breakdown
│  └─ FIXES_APPLIED.md ................ What was fixed (Type Safety Lead)
│
├─ dependencies/
│  ├─ MISSING_PACKAGES.md ............. Packages to install (Dependency Specialist)
│  ├─ INSTALL_LOG.md .................. What was installed (Dependency Specialist)
│  └─ AUDIT_REPORT.md ................. Final dependency audit
│
├─ architecture/
│  ├─ SYSTEM_DIAGRAM.md ............... ASCII system architecture
│  ├─ DATA_FLOW.md .................... Data flow diagrams
│  └─ TEAM_STRUCTURE.md ............... Team roles and responsibilities
│
└─ README.md .......................... Guide to visuals/ directory

Archived artifacts:
- `docs/archived/execution-plans/PHASE1_CLEANUP_PLAN.md` — Detailed cleanup plan
```

---

## 🎨 Visual Template Examples

### ASCII Error Distribution

```markdown
## Error Distribution

\`\`\` Errors by Category:

Module Import Errors ██████████ 45 errors (46%) Type Coercion Errors ████░░░░░░ 22 errors (23%) Zod
Schema Errors ██░░░░░░░░ 12 errors (12%) Duplicate Declaration ███░░░░░░░ 14 errors (14%) Other
█░░░░░░░░░ 4 errors (5%)

Total: 97 errors Progress: ████░░░░░░░░░░░░░░ 20% (fixed 20, remaining 77) \`\`\`
```

### ASCII Progress Bar

```markdown
## Overall Progress

\`\`\` Phase 1: Cleanup ████░░░░░░ 40% Phase 2: Dependencies ░░░░░░░░░░ 0% Phase 3: Type Safety
░░░░░░░░░░ 0% Phase 4: Validation & Merge ░░░░░░░░░░ 0%

Overall: ██░░░░░░░░ 10% (1 phase underway) \`\`\`
```

### Branch Diff Tree

```markdown
## Repository Structure

\`\`\` main (production) ├─ 450 files ├─ Status: ✅ Stable └─ Last updated: 3 days ago

dev (current) ├─ 465 files (+15 new) ├─ Status: 🔧 In progress ├─ TypeScript errors: 97 ├─ Packages
to install: 9 └─ Files to delete: 5

feature-branches ├─ fix/config-typeerrors: 480 files ├─ dep-fixes: 475 files └─ Status: ⏳ Review
needed \`\`\`
```

---

## 📊 Live Dashboard Update Logic

**DASHBOARD.md** gets updated with this logic:

```javascript
// Pseudocode for dashboard updates

function updateDashboard() {
  // 1. Count TypeScript errors
  const tsErrors = runCommand("pnpm typecheck");

  // 2. Calculate progress percentages
  const phases = {
    cleanup: filesDeleted / totalFilesToDelete,
    dependencies: packagesInstalled / totalPackages,
    typeSafety: errorsFixed / totalErrors,
    validation: testsPass ? 1.0 : 0.0,
  };

  // 3. Update visual bars
  const dashboard = {
    phase1: generateProgressBar(phases.cleanup),
    phase2: generateProgressBar(phases.dependencies),
    phase3: generateProgressBar(phases.typeSafety),
    phase4: generateProgressBar(phases.validation),
  };

  // 4. Write to DASHBOARD.md
  writeFile("docs/visuals/progress/DASHBOARD.md", dashboard);
}

function generateProgressBar(percentage) {
  const filled = Math.round(percentage * 10);
  const empty = 10 - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${Math.round(percentage * 100)}%`;
}
```

---

## 🔄 Continuous Integration Setup

### GitHub Actions Workflow

**File**: `.github/workflows/generate-visuals.yml`

```yaml
name: Generate Visuals

on:
  push:
    branches:
      - dev
      - docs-and-tests
    paths:
      - "apps/**"
      - "packages/**"
      - "functions/**"
      - "docs/**"

jobs:
  generate-visuals:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9.12.1

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate visuals
        run: bash scripts/generate-visuals.sh

      - name: Commit and push
        run: |
          git config user.name "Documentation Bot"
          git config user.email "docs@example.com"
          git add docs/visuals/
          git commit -m "docs: update visual reports" || true
          git push
```

---

## 📝 Manual Triggers

### Generate Phase Report Manually

```bash
# After Phase 1 complete
./scripts/generate-phase-report.sh --phase=1

# After Phase 2 complete
./scripts/generate-phase-report.sh --phase=2

# After Phase 3 complete
./scripts/generate-phase-report.sh --phase=3

# After Phase 4 complete
./scripts/generate-phase-report.sh --phase=4
```

---

## 🎯 Metrics Tracked

### Real-Time Metrics (Updated on every push)

- TypeScript error count
- TypeScript warning count
- Number of files changed
- Number of files deleted
- Number of imports updated
- Test pass rate

### Phase Completion Metrics

- Files deleted per phase
- Time to complete phase
- Errors fixed per phase
- Packages installed per phase
- Lines of code changed

### Branch Metrics

- File count per branch
- Unique files per branch
- Merge conflicts
- Branch age
- Last commit date

---

## 🚀 Quick Start: Run Visuals Manually

```bash
# Generate all visuals
bash scripts/generate-visuals.sh

# Generate with phase report
bash scripts/generate-visuals.sh --phase=1 --complete

# Generate branch diff
bash scripts/generate-branch-diff.sh

# Update dashboard only
bash scripts/update-dashboard.sh

# Generate all reports
bash scripts/generate-all-reports.sh
```

---

## 📌 Integration with PR/Merge Workflow

### On PR to main

```
1. Generate comparison: main vs dev
2. Create visual showing what will change
3. Update DASHBOARD.md with merge status
4. List all deletions, additions, modifications
```

### On Merge to main

```
1. Archive current visuals/ to docs/archive/
2. Create merge summary with before/after metrics
3. Generate completion report
4. Update branch archive documentation
```

### On docs-and-tests Updates

```
1. Update visual reference library
2. Add new visual templates
3. Document best practices for visuals
4. Maintain artifact links
```

---

## ✅ Checklist for Visual Automation

- \[ ] `scripts/generate-visuals.sh` created
- \[ ] GitHub Actions workflow configured
- \[ ] Manual trigger scripts ready
- \[ ] DASHBOARD.md template configured
- \[ ] Metrics tracking logic implemented
- \[ ] Automated daily reports enabled
- \[ ] Artifact structure documented
- \[ ] Team trained on visual updates
