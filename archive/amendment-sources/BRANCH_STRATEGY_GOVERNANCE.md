# 🏗️ Branch Strategy & Governance Framework

**Version**: 1.0\
**Status**: ACTIVE GOVERNANCE\
**Owner**: Sr Dev (Architecture)\
**Last Updated**: December 7, 2025\
**Enforcement**: GitHub API + GitHub Actions

---

## I. Branch Architecture

### Three Primary Branches (ONLY)

```
┌─────────────────────────────────────────────────────────────┐
│                    MAIN (Production)                         │
│  • Runtime verified, production-grade, known-good code       │
│  • Happy path only (tested, verified, deployable)            │
│  • E2E verified on all browsers/platforms                    │
│  • No docs, tests, logs (move to docs-tests-logs)            │
│  • Protected: No direct commits, PR required                 │
└─────────────────────────────────────────────────────────────┘
                           ↑
                    (merge from dev)
                           │
┌─────────────────────────────────────────────────────────────┐
│                    DEV (Working Branch)                      │
│  • Active development, feature integration                   │
│  • Tests created here, may be in-flight                      │
│  • Works in progress, experimental code allowed              │
│  • Code only (no docs/tests/logs that aren't feature-code)   │
│  • Protected: PR required, features must have tests          │
└─────────────────────────────────────────────────────────────┘
                           ↑
                 (merge features, PR only)
                           │
┌─────────────────────────────────────────────────────────────┐
│            DOCS-TESTS-LOGS (Documentation Archive)          │
│  • All documentation, test results, CI/CD logs               │
│  • Implementation summaries, reports, specifications         │
│  • E2E test suite artifacts, performance metrics             │
│  • Never merged back to dev/main                             │
│  • Single source of truth for project artifacts              │
└─────────────────────────────────────────────────────────────┘
```

### Feature Branches (Deleted After Merge)

```
feature/[issue-#]-[description]     (from dev, PR → dev)
fix/[issue-#]-[description]         (from dev, PR → dev)
chore/[issue-#]-[description]       (from dev, PR → dev)
refactor/[issue-#]-[description]    (from dev, PR → dev)

⚙️ RULE: Auto-delete after merge to dev
⚙️ RULE: PR required, tests must pass
⚙️ RULE: Delete source branch on merge completion
```

---

## II. File Pattern Governance

### A. Main Branch Patterns

**ALLOWED** (Code only):

```regex
^(apps|packages|functions)/.*\.(ts|tsx|js|jsx|json|css)$
^(public|src)/.*\.(ts|tsx|js|jsx|json|css|svg|png)$
^(\.github/workflows)/.*\.yml$
^(\.husky)/.*$
^(scripts)/.*\.(ts|js|mjs)$
^(tsconfig|jest|vitest|turbo|prettier|eslint).*\.(json|js|mjs|cjs)$
^(package\.json|pnpm-lock\.yaml)$
^(firestore|storage)\.rules$
^(README\.md|LICENSE)$
```

**NOT ALLOWED** (Move to docs-tests-logs):

```regex
^(docs)/.*\.md$                              # Documentation
^(tests|__tests__|\.e2e\.ts|\.spec\.ts).*   # Test files/suites
^(\.github)/(IMPLEMENTATION_COMPLETE|REPORTS|SUMMARIES).*\.md$
^(\.github/workflows)/(coverage|performance|test-results).*\.yml$
.*\.log$|.*\.report$|.*\.metrics$            # CI/CD logs/reports
^(coverage|.coverage).*                       # Coverage reports
^(performance-metrics|benchmark-results).*   # Performance data
```

**AUTO-REJECT** (CI Gate):

```regex
(TODO|FIXME|HACK|XXX):.*                     # Unresolved markers
console\.(log|debug|trace)\(                 # Debug logs
debugger;                                     # Debugger statements
test\.skip\(|test\.only\(                    # Skipped tests
\.env\.(local|development|production)        # Secrets/env files
node_modules/|\.next/|dist/|build/           # Build artifacts
```

### B. Dev Branch Patterns

**ALLOWED** (Code + in-flight tests):

```regex
^(apps|packages|functions)/.*\.(ts|tsx|js|jsx)$
^(tests|__tests__)/.*\.(test|spec)\.(ts|tsx|js)$  # Feature tests
^(\.github/workflows)/.*\.yml$                     # Feature workflows
.*feature-[0-9]+.*\.(ts|tsx|js|md)$                # Feature documentation
```

**NOT ALLOWED** (Archive-only content):

```regex
^(docs)/.*\.md$                              # Move to docs-tests-logs
^(\.github)/(IMPLEMENTATION_COMPLETE|REPORTS|SUMMARIES).*\.md$
.*\.log$|.*\.report$|.*\.metrics$            # Logs/reports to docs-tests-logs
^(coverage|performance-metrics).*            # Metrics to docs-tests-logs
```

### C. Docs-Tests-Logs Branch Patterns

**ALLOWED ONLY** (Archive content):

```regex
^(docs)/.*\.md$                              # All documentation
^(\.github)/(IMPLEMENTATION_COMPLETE|REPORTS|SUMMARIES).*\.md$
^(\.github/workflows)/(coverage|performance|test-results).*\.yml$
.*\.log$|.*\.report$|.*\.metrics$            # CI/CD logs
^(coverage|.coverage).*                      # Coverage reports
^(performance-metrics|benchmark-results).*   # Performance data
^(e2e)/.*\.(spec|e2e)\.(ts|tsx)$             # E2E test suites
^(tests/rules|tests/integration).*           # Test artifacts
```

**NOT ALLOWED** (Code belongs on dev/main):

```regex
^(apps|packages|functions)/.*\.ts$           # Feature code
^src/.*\.ts$                                 # Source code
^(scripts)/.*\.(ts|js)$                      # Utility scripts
```

---

## III. Commit & PR Standards

### Feature Branch Workflow

```
1. CREATE FEATURE BRANCH
   git checkout -b feature/123-add-auth-flow

1. COMMIT FREQUENTLY (minimum daily)
   git commit -m "feat: implement login form validation"
   git commit -m "feat: add session persistence"
   git commit -m "test: add E2E login tests"

1. ENSURE PASSING TESTS
   pnpm -w typecheck    ✅
   pnpm -w test         ✅
   pnpm -w lint         ✅

1. CREATE PR TO DEV
   Title: feat(auth): implement login flow
   - Tests: ✅ All passing
   - Coverage: ✅ >80% for new code
   - Docs: ✅ API docs + comments
   - Type Safety: ✅ No TS errors

1. MERGE & AUTO-DELETE
   [✓] Merge PR to dev
   [✓] Auto-delete source branch (GitHub setting)
   [✓] Feature branch gone
```

### Commit Frequency Requirements

| Branch              | Frequency     | Rule                            |
| ------------------- | ------------- | ------------------------------- |
| **Feature**         | Daily minimum | 1+ commits per day while active |
| **Dev**             | Per PR merge  | 1 merge per feature completion  |
| **Main**            | Per release   | 1 merge per release cycle       |
| **Docs-Tests-Logs** | Per update    | As documentation/reports added  |

### PR Requirements by Branch

| Criteria        | Feature→Dev   | Dev→Main                   |
| --------------- | ------------- | -------------------------- |
| **Reviewers**   | 1+            | 2+                         |
| **Tests**       | ✅ All pass   | ✅ All pass + E2E verified |
| **Type Check**  | ✅ 0 errors   | ✅ 0 errors                |
| **Lint**        | ✅ Clean      | ✅ Clean                   |
| **Coverage**    | >80% new      | >85% overall               |
| **CI Status**   | ✅ Green      | ✅ Green                   |
| **Docs**        | Feature docs  | Complete                   |
| **Performance** | No regression | <5% regression allowed     |

---

## IV. GitHub API Branch Protection Rules

### Rule: Main Branch

```bash
# Requires PR review before merge
gh api repos/{owner}/{repo}/branches/main/protection \
  --input - << EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "build",
      "test/unit",
      "test/e2e",
      "lint",
      "typecheck"
    ]
  },
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 2
  },
  "enforce_admins": true,
  "restrictions": {
    "users": [],
    "teams": ["DevOps", "Architecture"],
    "apps": []
  }
}
EOF
```

### Rule: Dev Branch

```bash
gh api repos/{owner}/{repo}/branches/dev/protection \
  --input - << EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "build",
      "test/unit",
      "lint",
      "typecheck"
    ]
  },
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "required_approving_review_count": 1
  },
  "enforce_admins": false,
  "restrictions": null
}
EOF
```

### Rule: Docs-Tests-Logs Branch

```bash
gh api repos/{owner}/{repo}/branches/docs-tests-logs/protection \
  --input - << EOF
{
  "required_status_checks": {
    "strict": false,
    "contexts": []
  },
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": false,
    "required_approving_review_count": 0
  },
  "enforce_admins": false,
  "restrictions": null
}
EOF
```

---

## V. GitHub Actions Enforcement Workflows

### Workflow 1: Branch File Pattern Validator

**Location**: `.github/workflows/branch-file-validator.yml`\
**Trigger**: On every commit push\
**Action**: Reject commits with wrong file patterns

```yaml
name: Branch File Pattern Validator

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  validate-files:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Validate file patterns for target branch
        run: |
          TARGET_BRANCH=${{ github.base_ref }}

          # Get changed files
          CHANGED_FILES=$(git diff --name-only origin/$TARGET_BRANCH...HEAD)

          case "$TARGET_BRANCH" in
            main)
              echo "Validating files for MAIN branch..."
              node scripts/validate-branch-files.js main "$CHANGED_FILES"
              ;;
            dev)
              echo "Validating files for DEV branch..."
              node scripts/validate-branch-files.js dev "$CHANGED_FILES"
              ;;
            docs-tests-logs)
              echo "Validating files for DOCS-TESTS-LOGS branch..."
              node scripts/validate-branch-files.js docs-tests-logs "$CHANGED_FILES"
              ;;
            *)
              echo "Feature branch detected: $TARGET_BRANCH"
              node scripts/validate-branch-files.js feature "$CHANGED_FILES"
              ;;
          esac
```

### Workflow 2: Feature Branch Auto-Delete

**Location**: `.github/workflows/feature-branch-cleanup.yml`\
**Trigger**: On PR merge to dev\
**Action**: Auto-delete source branch, verify commit frequency

```yaml
name: Feature Branch Auto-Delete & Cleanup

on:
  pull_request:
    types: [closed]
    branches:
      - dev

jobs:
  cleanup:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Delete source branch
        run: |
          gh api repos/{owner}/{repo}/git/refs/heads/${{ github.event.pull_request.head.ref }} \
            -X DELETE || true

      - name: Verify commit frequency
        run: |
          COMMITS=$(git log --oneline origin/dev..${{ github.event.pull_request.head.ref }} | wc -l)
          if [ $COMMITS -lt 1 ]; then
            echo "ERROR: Feature branch must have at least 1 commit"
            exit 1
          fi
          echo "✅ Commit frequency OK: $COMMITS commits"
```

### Workflow 3: Main Branch Merge Gate

**Location**: `.github/workflows/main-merge-gate.yml`\
**Trigger**: On PR to main\
**Action**: Block merge unless criteria met

```yaml
name: Main Branch Merge Gate

on:
  pull_request:
    branches:
      - main

jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Verify source is dev
        run: |
          if [ "${{ github.head_ref }}" != "dev" ]; then
            echo "ERROR: Can only merge to main from dev branch"
            exit 1
          fi

      - name: Verify all CI green
        run: |
          # Check test results
          pnpm -w test || exit 1
          pnpm -w typecheck || exit 1
          pnpm -w lint || exit 1

      - name: Verify no docs/tests/logs in main
        run: |
          INVALID_FILES=$(git diff --name-only origin/main...HEAD | grep -E '\.(log|report|metrics|coverage|e2e\.ts|spec\.ts)$' || true)
          if [ -n "$INVALID_FILES" ]; then
            echo "ERROR: Main branch cannot contain docs/tests/logs"
            echo "$INVALID_FILES"
            exit 1
          fi

      - name: Create merge commit
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          echo "✅ Ready to merge to main"
```

### Workflow 4: Docs-Tests-Logs Archive Guard

**Location**: `.github/workflows/docs-archive-guard.yml`\
**Trigger**: On PR to docs-tests-logs\
**Action**: Ensure only docs/tests/logs files

```yaml
name: Docs-Tests-Logs Archive Guard

on:
  pull_request:
    branches:
      - docs-tests-logs

jobs:
  guard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Verify only archive files
        run: |
          INVALID_FILES=$(git diff --name-only origin/docs-tests-logs...HEAD | \
            grep -v -E '\.(md|log|report|metrics|coverage|e2e\.ts|spec\.ts|yml)$' | \
            grep -v -E '^(docs|coverage|performance-metrics|\.github)' || true)

          if [ -n "$INVALID_FILES" ]; then
            echo "ERROR: docs-tests-logs can only contain documentation and test artifacts"
            echo "$INVALID_FILES"
            exit 1
          fi
```

---

## VI. Validation Scripts

### Script: Branch File Validator

**Location**: `scripts/validate-branch-files.js`

```javascript
# !/usr/bin/env node
const fs = require("fs");
const path = require("path");

const BRANCH_RULES = {
  main: {
    allowed: [
      /^(apps|packages|functions)\/.*\.(ts|tsx|js|jsx|json|css)$/,
      /^(public|src)\/.*\.(ts|tsx|js|jsx|json|css|svg|png)$/,
      /^(\.github\/workflows)\/.*\.yml$/,
      /^(\.husky)\/.*$/,
      /^(scripts)\/.*\.(ts|js|mjs)$/,
      /^(tsconfig|jest|vitest|turbo|prettier|eslint).*\.(json|js|mjs|cjs)$/,
      /^(package\.json|pnpm-lock\.yaml)$/,
      /^(firestore|storage)\.rules$/,
      /^(README\.md|LICENSE)$/,
    ],
    forbidden: [
      /^(docs)\/.*\.md$/,
      /^(\.e2e\.ts|\.spec\.ts)$/,
      /^(\.github)\/(IMPLEMENTATION_COMPLETE|REPORTS|SUMMARIES)/,
      /\.(log|report|metrics)$/,
    ],
  },
  dev: {
    allowed: [
      /^(apps|packages|functions)\/.*\.(ts|tsx|js|jsx)$/,
      /^(tests|__tests__)\/.*\.(test|spec)\.(ts|tsx|js)$/,
      /^(\.github\/workflows)\/.*\.yml$/,
      /^(scripts)\/.*\.(ts|js)$/,
    ],
    forbidden: [
      /^(docs)\/.*\.md$/,
      /^(\.github)\/(IMPLEMENTATION_COMPLETE|REPORTS|SUMMARIES)/,
      /\.(log|report|metrics)$/,
    ],
  },
  "docs-tests-logs": {
    allowed: [
      /^(docs)\/.*\.md$/,
      /^(\.github)\/(IMPLEMENTATION_COMPLETE|REPORTS|SUMMARIES)/,
      /^(e2e)\/.*\.(spec|e2e)\.(ts|tsx)$/,
      /\.(log|report|metrics)$/,
      /^(coverage|performance-metrics)/,
    ],
    forbidden: [
      /^(apps|packages|functions)\/.*\.ts$/,
      /^(scripts)\/.*\.(ts|js)$/,
    ],
  },
  feature: {
    allowed: [
      /^(apps|packages|functions)\/.*\.(ts|tsx|js|jsx)$/,
      /^(tests|__tests__)\/.*\.(test|spec)\.(ts|tsx|js)$/,
      /^(docs)\/feature-[0-9]+/,
    ],
    forbidden: [],
  },
};

const [branchType, filesStr] = process.argv.slice(2);
const files = filesStr.split("\n").filter(Boolean);
const rules = BRANCH_RULES[branchType] || BRANCH_RULES.feature;

let hasErrors = false;

files.forEach((file) => {
  const isForbidden = rules.forbidden.some((regex) => regex.test(file));
  const isAllowed = rules.allowed.some((regex) => regex.test(file));

  if (isForbidden || !isAllowed) {
    console.error(`❌ File not allowed on ${branchType}: ${file}`);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.error(
    `\n📋 For ${branchType} branch, allowed patterns are:`
  );
  console.error(rules.allowed.map((r) => `  ${r}`).join("\n"));
  process.exit(1);
}

console.log("✅ All files valid for " + branchType);
```

---

## VII. Branch Consolidation Checklist

### From Main → Docs-Tests-Logs

- \[ ] Move all docs/\*.md files
- \[ ] Move all .github/_REPORTS_.md files
- \[ ] Move all CI/CD result summaries
- \[ ] Move all test result artifacts
- \[ ] Keep only code/configuration in main
- \[ ] Create PR to docs-tests-logs
- \[ ] Verify main has 0 docs files
- \[ ] Delete source files from main

### From Dev → Appropriate Branch

- \[ ] Test artifacts → docs-tests-logs
- \[ ] Documentation files → docs-tests-logs
- \[ ] Code/tests → keep on dev
- \[ ] Performance reports → docs-tests-logs
- \[ ] Coverage reports → docs-tests-logs

### Symlink Strategy (Dev Only)

```bash
# On dev: symlink to docs-tests-logs content when needed
ln -s ../docs-tests-logs/docs ./docs-reference
ln -s ../docs-tests-logs/e2e ./test-artifacts-reference

# Code stays in place
# Only reference symlinks when reading archived content
```

---

## VIII. Enforcement Matrix

| Action               | Main       | Dev       | Docs-Tests-Logs | Feature     |
| -------------------- | ---------- | --------- | --------------- | ----------- |
| **Direct Commit**    | ❌         | ⚠️ PR     | ✅              | ❌          |
| **PR Merge**         | 2+ reviews | 1+ review | Auto            | Auto-delete |
| **File Validation**  | Strict     | Moderate  | Archive only    | Loose       |
| **Commit Frequency** | N/A        | Per PR    | Per artifact    | Daily min   |
| **Auto-Delete**      | ❌         | ❌        | ❌              | ✅          |
| **E2E Required**     | ✅         | ⚠️        | N/A             | ✅          |
| **Tests Required**   | ✅         | ✅        | N/A             | ✅          |

---

## IX. Implementation Timeline

### Phase 1: Foundation (Today)

- \[x] Create branch strategy document
- \[x] Define file patterns with regex
- \[ ] Create validation scripts
- \[ ] Set up GitHub API branch protection

### Phase 2: Enforcement (This Week)

- \[ ] Deploy GitHub Actions workflows
- \[ ] Enable file pattern validation
- \[ ] Enable branch protection rules
- \[ ] Test on feature branches

### Phase 3: Migration (Next Week)

- \[ ] Consolidate main → docs-tests-logs
- \[ ] Consolidate dev → appropriate branches
- \[ ] Verify no file violations
- \[ ] Document for team

### Phase 4: Continuous (Ongoing)

- \[ ] Monitor branch violations
- \[ ] Auto-delete completed features
- \[ ] Enforce commit frequency
- \[ ] Audit branch health monthly

---

## X. Team Communication

### Branch Responsibilities

| Branch              | Owner          | Purpose                |
| ------------------- | -------------- | ---------------------- |
| **main**            | DevOps/Release | Production deployments |
| **dev**             | Engineering    | Active development     |
| **docs-tests-logs** | Sr Dev/Docs    | Project artifacts      |
| **feature/**\*      | Feature Team   | Feature development    |

### Quick Reference: Where Do I Commit?

```
Rule 1: Code changes?
  → Branch from dev, PR to dev

Rule 2: Documentation?
  → Branch from docs-tests-logs, PR to docs-tests-logs

Rule 3: Test results/Reports?
  → Branch from docs-tests-logs, PR to docs-tests-logs

Rule 4: Production ready?
  → Merge from dev to main (2 reviews)

Rule 5: Done with feature?
  → Merge to dev, branch auto-deletes
```

---

## XI. FAQ & Troubleshooting

### Q: Where do I commit my documentation?

**A**: Always to `docs-tests-logs`. If on dev/main, move to docs-tests-logs PR first.

### Q: Can I merge feature to main directly?

**A**: No. Always: feature → dev → main. Main only accepts from dev.

### Q: My feature branch has 1 commit, can I merge?

**A**: Yes, if tests pass. 1+ commits is minimum requirement.

### Q: Can I revert a main merge?

**A**: Escalate to Sr Dev. Main is immutable. Create fix PR to dev.

### Q: Why auto-delete feature branches?

**A**: Keeps repo clean, prevents stale branches, enforces cleanup discipline.

### Q: Can I symlink test artifacts to main?

**A**: No. Reference docs-tests-logs via CI/documentation only. Never symlink to main.

---

## XII. Metrics & Monitoring

**Track These Metrics**:

- Commits per feature (should be ≥1 per day)
- PRs merged per sprint
- Main branch deployment frequency
- Docs-tests-logs commit frequency
- Branch violation rate
- Feature branch lifetime (target: <1 week)

**Monthly Audit**:

- Review branch sizes
- Check for stale branches
- Verify file pattern compliance
- Analyze commit frequency trends
- Update governance rules if needed

---

## Summary

This three-branch architecture enforces:

- ✅ **Main**: Production code only (runtime-verified, testable, deployable)
- ✅ **Dev**: Working codebase (features, tests, active development)
- ✅ **Docs-Tests-Logs**: Archive of all project artifacts (never merged back)
- ✅ **Features**: Auto-deleted after merge (ephemeral by design)
- ✅ **Governance**: API-enforced rules, validation scripts, CI gates
- ✅ **Frequency**: Minimum daily commits, auto-merge completion
- ✅ **Cleanup**: Automatic on merge completion

**Status**: Ready to deploy.

---

_Created: December 7, 2025_\
_Owner: Sr Dev (Architecture)_\
_Review Status: Draft → Ready for Implementation_
