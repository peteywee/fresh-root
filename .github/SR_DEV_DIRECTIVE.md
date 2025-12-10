# 🎯 SR DEV DIRECTIVE: Three-Branch Governance Architecture

**Effective Date**: December 7, 2025\
**Authority**: Sr Dev (Architecture)\
**Status**: ACTIVE GOVERNANCE\
**Review Cycle**: Monthly

---

## Executive Directive

### Three Primary Branches - ONLY

Effective immediately, the Fresh Schedules codebase operates under a **three-branch governance model**:

1. **`main`** - Production-grade, tested, deployable code (runtime verified)
2. **`dev`** - Working branch for active development and feature integration
3. **`docs-tests-logs`** - Archive of all project artifacts (never merged back)

**All other branches** are **ephemeral feature branches** that:

- Are created FROM `dev`
- Require PR to merge TO `dev`
- Are **automatically deleted** upon merge completion
- Follow naming convention: `feature|fix|chore|refactor/[issue-#]-[description]`

### Authority & Enforcement

**This governance is enforced by**:

- ✅ GitHub API branch protection rules
- ✅ GitHub Actions validation workflows
- ✅ Node.js validator scripts (regex-based)
- ✅ PR requirements and auto-cleanup
- ✅ File pattern validation on every commit

**Non-compliance results in**:

- PR rejection with detailed error messages
- Blocked merges until violations resolved
- Automatic cleanup of stale/malformed branches
- Escalation to Sr Dev for repeated violations

---

## Branch Responsibilities

### 🟢 **main** Branch - Production Code

**Purpose**: Single source of truth for production deployments\
**Owner**: DevOps/Release team\
**Code Quality**: HIGHEST

**What Belongs Here**:

- ✅ Feature code (tested, verified, E2E passing)
- ✅ Configuration files (tsconfig, jest, vitest)
- ✅ Infrastructure code (firestore rules, storage rules)
- ✅ GitHub Actions workflows (CI/CD, deployment)
- ✅ Package.json, pnpm-lock.yaml
- ✅ README.md, LICENSE

**What NEVER Belongs Here**:

- ❌ Documentation files (docs/\*.md)
- ❌ Test results, reports, metrics
- ❌ CI/CD logs (.log, .report, .metrics)
- ❌ Coverage reports
- ❌ E2E test suites
- ❌ Implementation summaries
- ❌ Performance data
- ❌ Debug code or TODOs

**Merge Requirements**:

- Source: `dev` branch ONLY
- Reviews: 2+ approvals required
- Tests: All passing (unit + E2E)
- Files: Zero docs/tests/logs files
- CI: All checks green
- Description: Release notes required

**Merge Process**:

```bash
# 1. Create PR: dev → main
# 2. Get 2 approvals
# 3. All CI green
# 4. Merge
# 5. Source branch remains (dev)
# 6. No auto-delete (dev is permanent)
```

### 🟡 **dev** Branch - Working Branch

**Purpose**: Integration point for features, testing ground\
**Owner**: Engineering team\
**Code Quality**: HIGH

**What Belongs Here**:

- ✅ Feature code under development
- ✅ Feature tests (unit + integration)
- ✅ Configuration files
- ✅ Infrastructure code
- ✅ GitHub Actions workflows
- ✅ Feature-specific documentation (docs/feature-\*)

**What NEVER Belongs Here**:

- ❌ General documentation (docs/_.md excluding feature-_)
- ❌ Project reports and summaries
- ❌ Test artifacts and results
- ❌ CI/CD logs
- ❌ Coverage reports
- ❌ Performance metrics

**Merge Requirements**:

- Source: `feature/*` branches ONLY
- Reviews: 1+ approval required
- Tests: All passing
- Files: No docs/tests/logs files (except feature-specific)
- CI: All checks green

**Merge Process**:

```bash
# 1. Create feature branch from dev
git checkout dev
git pull
git checkout -b feature/123-description

# 2. Commit daily minimum
git commit -m "feat: implement X"
git push origin feature/123-description

# 3. Create PR: feature/123-description → dev
# 4. Get 1+ approval
# 5. All CI green
# 6. Merge to dev
# 7. Feature branch AUTO-DELETES ✅
```

### 📘 **docs-tests-logs** Branch - Archive

**Purpose**: Single source of truth for all project artifacts\
**Owner**: Sr Dev / Documentation team\
**Code Quality**: N/A (archive-only)\
**Special Rule**: NEVER MERGED BACK TO DEV/MAIN

**What Belongs Here**:

- ✅ All documentation (docs/\*.md)
- ✅ Implementation reports
- ✅ Project summaries
- ✅ E2E test suites
- ✅ Test results and reports
- ✅ CI/CD logs
- ✅ Coverage reports
- ✅ Performance metrics
- ✅ Benchmark results
- ✅ Architecture decisions

**What NEVER Belongs Here**:

- ❌ Feature code
- ❌ Regular source code
- ❌ Configuration files (keep on dev)
- ❌ Package files

**Merge Requirements**:

- Source: Anything (artifacts, docs)
- Reviews: 0 (no review needed)
- Tests: N/A
- Files: Archive-only
- Auto-merge: Yes

**Merge Process**:

```bash
# 1. Create branch from docs-tests-logs
git checkout docs-tests-logs
git pull
git checkout -b docs/add-new-doc

# 2. Add documentation/artifacts
echo "# New Doc" > docs/new.md

# 3. Commit
git commit -m "docs: add new documentation"
git push origin docs/add-new-doc

# 4. Create PR to docs-tests-logs
# 5. No review needed, can auto-merge
# 6. Branch auto-deletes after merge
```

---

## File Pattern Governance

### Main Branch - ALLOWED PATTERNS

```regex
^apps/.*\.(ts|tsx|js|jsx|json|css)$
^packages/.*\.(ts|tsx|js|jsx|json|css)$
^functions/.*\.(ts|tsx|js|jsx|json|css)$
^public/.*\.(ts|tsx|js|jsx|json|css|svg|png|jpg)$
^src/.*\.(ts|tsx|js|jsx|json|css)$
^\.github/workflows/(?!.*-(test|coverage|performance|report)).*\.yml$
^\.husky/.*$
^scripts/(?!.*-test).*\.(ts|js|mjs)$
^(tsconfig|jest|vitest|turbo|prettier|eslint)[^/]*\.(json|js|mjs|cjs)$
^package\.json$
^pnpm-lock\.yaml$
^(firestore|storage)\.rules$
^README\.md$
^LICENSE$
```

### Main Branch - FORBIDDEN PATTERNS

```regex
^docs/                          # Documentation
\.e2e\.ts$                      # E2E tests
\.spec\.ts$                     # Unit tests (excluding package)
IMPLEMENTATION_COMPLETE|REPORT  # Project reports
PHASE_\d+|SUMMARY               # Phase reports
\.(log|report|metrics)$         # Logs and metrics
coverage/                       # Coverage reports
performance-metrics/            # Performance data
```

### Dev Branch - ALLOWED PATTERNS

```regex
^apps/.*\.(ts|tsx|js|jsx)$
^packages/.*\.(ts|tsx|js|jsx)$
^functions/.*\.(ts|tsx|js|jsx)$
^src/.*\.(ts|tsx|js|jsx)$
^tests/.*\.(test|spec)\.(ts|tsx|js)$
^__tests__/.*\.(test|spec)\.(ts|tsx|js)$
^(apps|packages|functions)/.*/__tests__/.*\.(test|spec)\.(ts|tsx|js)$
^\.github/workflows/.*\.yml$
^scripts/.*\.(ts|js|mjs)$
^(tsconfig|jest|vitest|turbo|prettier|eslint).*\.(json|js|mjs|cjs)$
^package\.json$
^pnpm-lock\.yaml$
^(firestore|storage)\.rules$
^docs/feature-\d+/.*\.md$
```

### Dev Branch - FORBIDDEN PATTERNS

```regex
^docs/(?!feature-)              # Only feature-specific docs
IMPLEMENTATION_COMPLETE|REPORT  # Project reports
PHASE_\d+|SUMMARY               # Phase reports
\.(log|report|metrics)$         # Logs and metrics
coverage/                       # Coverage reports
performance-metrics/            # Performance data
```

### Docs-Tests-Logs Branch - ALLOWED PATTERNS

```regex
^docs/.*\.md$
^\.github/(IMPLEMENTATION_COMPLETE|REPORTS|SUMMARIES|BRANCH_STRATEGY)
^\.github/workflows/(coverage|performance|test-results).*\.yml$
^e2e/.*\.(spec|e2e)\.(ts|tsx|js)$
^tests/.*\.(test|spec)\.(ts|tsx|js)$
\.(log|report|metrics)$
^coverage/
^performance-metrics/
^TEST_RESULTS/
^CI_REPORTS/
```

### Docs-Tests-Logs Branch - FORBIDDEN PATTERNS

```regex
^apps/.*\.ts$                   # Feature code
^packages/.*\.ts$               # Package code
^functions/.*\.ts$              # Function code
^scripts/.*\.(ts|js)$           # Utility scripts
^src/.*\.ts$                    # Source code
^(tsconfig|jest|vitest).*       # Configuration
```

---

## GitHub Actions Enforcement Workflows

### Workflow 1: Branch File Pattern Validator

- **Trigger**: Every PR (opened, updated)
- **Action**: Validates file patterns match target branch
- **Output**: PR comment with validation result
- **Failure**: Blocks merge with detailed error

### Workflow 2: Feature Branch Auto-Cleanup

- **Trigger**: PR merge to dev
- **Action**: Auto-deletes feature branch
- **Output**: PR comment confirming cleanup
- **Success**: Branch removed from repo

### Workflow 3: Main Branch Merge Gate

- **Trigger**: PR to main
- **Action**: Enforces main branch rules
- **Validation**:
  - Source must be `dev`
  - No docs/tests/logs files
  - Must have release notes
  - Requires 2 approvals
- **Output**: PR comment with gate status

### Workflow 4: Docs-Tests-Logs Archive Guard

- **Trigger**: PR to docs-tests-logs
- **Action**: Ensures archive-only content
- **Validation**: Blocks feature code
- **Output**: PR comment confirming archive integrity

---

## Commit Standards by Branch

### Feature Branches (feature/\*)

```bash
# Daily minimum: 1 commit per day
git commit -m "feat: implement login validation"
git commit -m "test: add E2E login tests"
git commit -m "fix: resolve edge case in session"

# MUST HAVE by merge time:
# ✅ Tests passing locally
# ✅ TypeScript no errors
# ✅ Lint passing
# ✅ Documentation in code
```

### Dev Branch Merges

```bash
# Via PR from feature branches
# Automatically commits feature to dev
# One PR = one feature merge
# One feature = multiple commits (daily min)
```

### Main Branch Merges

```bash
# Via PR from dev
# Includes release notes
# Typically monthly or quarterly
# Requires 2 approvals
```

### Docs-Tests-Logs Branch

```bash
# As artifacts are generated
git commit -m "docs: add architecture overview"
git commit -m "test: add E2E test results"
git commit -m "report: add performance metrics"

# No review needed
# Auto-merge enabled
```

---

## Escalation & Exceptions

### When to Contact Sr Dev

1. **Merge blocked** and you don't understand why
2. **Committed to wrong branch** (not yet pushed)
3. **Need to revert** a main branch commit
4. **Special cases** (multiple feature merges, hotfixes)
5. **Questions** about governance

### Emergency: Hotfix to Main

**If production is broken:**

```bash
# 1. Contact Sr Dev IMMEDIATELY
# 2. If approved:
# - Create hotfix/issue-# from main
# - Fix the issue
# - Create PR to main
# - Fast-track review (1 approval)
# 3. After merge:
# - Cherry-pick fix to dev
# - Document the hotfix
```

---

## Monitoring & Metrics

### Track Monthly

- Commits per feature (target: ≥1 per day)
- Feature branch lifetime (target: <1 week)
- PRs merged per sprint
- Main branch deployment frequency
- Branch violation rate

### Audit Quarterly

- Review branch sizes
- Check for stale branches
- Verify compliance rate
- Update governance if needed

---

## Summary: Standard Operating Procedure

```
1. ALWAYS start feature work on dev
   git checkout dev
   git pull origin dev
   git checkout -b feature/123-description

1. COMMIT DAILY MINIMUM
   git commit -m "feat: implement X"
   git push origin feature/123-description

1. PASS LOCAL VALIDATION
   pnpm typecheck  ✅
   pnpm lint       ✅
   pnpm test       ✅

1. CREATE PR TO DEV (when done)
   - Get 1+ approval
   - All CI green
   - Merge

1. FEATURE BRANCH AUTO-DELETES ✅

1. FOR PRODUCTION RELEASE
   - Create PR: dev → main
   - Get 2+ approvals
   - Merge
   - Your code is in production!

1. FOR DOCUMENTATION
   - Create branch from docs-tests-logs
   - Add your documentation
   - Create PR to docs-tests-logs
   - Merge (no review needed)
   - Committed to archive!
```

---

## Final Authority Statement

**Effective immediately**:

1. ✅ Three-branch architecture is standard
2. ✅ Feature branches are ephemeral (auto-deleted)
3. ✅ File patterns are enforced by CI
4. ✅ Main only accepts from dev
5. ✅ Docs-tests-logs is archive-only
6. ✅ All governance is API-enforced

**This governance applies to**:

- All engineers
- All feature work
- All PRs
- All commits

**Questions or concerns**: Contact Sr Dev

---

**Signed**: Sr Dev (Architecture)\
**Date**: December 7, 2025\
**Status**: ACTIVE GOVERNANCE\
**Review Date**: January 7, 2026
