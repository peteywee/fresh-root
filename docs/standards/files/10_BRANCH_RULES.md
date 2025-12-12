# FRESH SCHEDULES - BRANCH RULES

> **Version**: 1.0.0  
> **Status**: CANONICAL  
> **Authority**: Sr Dev / Architecture  
> **Binding**: YES - Enforced by GitHub

This document defines branch protection rules. Designed to be light and extensible.

---

## BRANCH HIERARCHY

```
main (production)
│
├── staging (pre-production)
│   │
│   ├── feature/* (new features)
│   ├── fix/* (bug fixes)
│   ├── refactor/* (improvements)
│   └── chore/* (maintenance)
│
└── hotfix/* (emergency fixes → main + staging)
```

---

## CORE RULES

### main Branch

| Setting | Value | Reason |
|---------|-------|--------|
| **Require PR** | Yes | No direct pushes |
| **Required approvals** | 2 | Critical review |
| **Dismiss stale reviews** | Yes | Changes need re-review |
| **Require status checks** | Yes | Gates must pass |
| **Required checks** | CI, Orchestrate | Core validation |
| **Require branches up to date** | Yes | No stale merges |
| **Restrict push** | staging only | Only from staging |
| **Allow force push** | No | Never |
| **Allow deletions** | No | Never |

### staging Branch

| Setting | Value | Reason |
|---------|-------|--------|
| **Require PR** | Yes | No direct pushes |
| **Required approvals** | 1 | Standard review |
| **Dismiss stale reviews** | Yes | Changes need re-review |
| **Require status checks** | Yes | Gates must pass |
| **Required checks** | CI | Core validation |
| **Require branches up to date** | No | Flexible merging |
| **Allow force push** | No | Never |
| **Allow deletions** | No | Never |

### Feature Branches (feature/*, fix/*, refactor/*, chore/*)

| Setting | Value | Reason |
|---------|-------|--------|
| **Require PR** | No | Can push directly |
| **Auto-delete on merge** | Yes | Keep clean |
| **Allow force push** | Yes | Allow rebasing |

### Hotfix Branches (hotfix/*)

| Setting | Value | Reason |
|---------|-------|--------|
| **Require PR** | Yes | Still needs review |
| **Required approvals** | 1 | Quick turnaround |
| **Required checks** | CI | Must pass |
| **Can merge to main** | Yes | Emergency path |

---

## BRANCH NAMING

### Pattern

```
{type}/{ticket}-{description}
```

### Types

| Type | Purpose | Example |
|------|---------|---------|
| `feature` | New functionality | `feature/FS-123-add-time-off` |
| `fix` | Bug fixes | `fix/FS-456-schedule-calc` |
| `refactor` | Code improvement | `refactor/FS-789-cleanup` |
| `chore` | Maintenance | `chore/update-deps` |
| `hotfix` | Emergency fix | `hotfix/FS-999-auth-bypass` |

### Validation Regex

```regex
^(feature|fix|refactor|chore|hotfix)\/[A-Z]+-[0-9]+-[a-z0-9-]+$|^(feature|fix|refactor|chore)\/[a-z0-9-]+$
```

---

## MERGE STRATEGIES

| Source | Target | Strategy |
|--------|--------|----------|
| `feature/*` | `staging` | Squash |
| `fix/*` | `staging` | Squash |
| `refactor/*` | `staging` | Squash |
| `chore/*` | `staging` | Squash |
| `staging` | `main` | Merge commit |
| `hotfix/*` | `main` | Merge commit |
| `hotfix/*` | `staging` | Merge commit |

### Why Squash for Features

- Clean history
- One commit = one feature/fix
- Easy to revert

### Why Merge Commit for Releases

- Preserve PR reference
- Clear audit trail
- Shows merge point

---

## WORKFLOW

### Standard Flow

```bash
# 1. Create branch from staging
git checkout staging
git pull
git checkout -b feature/FS-123-new-feature

# 2. Work on feature
# ... commits ...

# 3. Push and open PR
git push -u origin feature/FS-123-new-feature
# Open PR to staging

# 4. Review and merge (squash)
# PR merged → branch auto-deleted

# 5. Release to main
# Open PR from staging to main
# 2 approvals → merge commit
```

### Hotfix Flow

```bash
# 1. Create hotfix from main
git checkout main
git pull
git checkout -b hotfix/FS-999-critical

# 2. Fix and test
# ... minimal fix ...

# 3. Push and open PR to main
git push -u origin hotfix/FS-999-critical
# Open PR to main

# 4. Emergency review (1 approval)
# Merge to main

# 5. Also merge to staging
git checkout staging
git merge hotfix/FS-999-critical
git push
```

---

## GITHUB CONFIGURATION

### Branch Protection API

```javascript
// scripts/setup-branch-protection.mjs
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Main branch protection
await octokit.repos.updateBranchProtection({
  owner: 'peteywee',
  repo: 'frsh-root',
  branch: 'main',
  required_status_checks: {
    strict: true,
    contexts: ['CI', 'Orchestrate']
  },
  enforce_admins: true,
  required_pull_request_reviews: {
    required_approving_review_count: 2,
    dismiss_stale_reviews: true
  },
  restrictions: {
    users: [],
    teams: [],
    apps: []
  },
  allow_force_pushes: false,
  allow_deletions: false
});

// Staging branch protection
await octokit.repos.updateBranchProtection({
  owner: 'peteywee',
  repo: 'frsh-root',
  branch: 'staging',
  required_status_checks: {
    strict: false,
    contexts: ['CI']
  },
  enforce_admins: false,
  required_pull_request_reviews: {
    required_approving_review_count: 1,
    dismiss_stale_reviews: true
  },
  restrictions: null,
  allow_force_pushes: false,
  allow_deletions: false
});
```

### Rulesets (Alternative)

```yaml
# .github/rulesets/main.yml
name: Main Branch Rules
target: branch
enforcement: active
conditions:
  ref_name:
    include: [main]
rules:
  - type: pull_request
    parameters:
      required_approving_review_count: 2
      dismiss_stale_reviews_on_push: true
  - type: required_status_checks
    parameters:
      strict_required_status_checks_policy: true
      required_status_checks:
        - context: CI
        - context: Orchestrate
  - type: non_fast_forward
```

---

## EXTENDING RULES

### Adding New Branch Type

1. Define naming convention
2. Add to validation regex
3. Document merge strategy
4. Update auto-delete rules

Example: Adding `docs/*` branches

```yaml
# Additional branch type
docs/*:
  purpose: Documentation changes
  merges_to: staging
  strategy: squash
  auto_delete: true
  approvals: 1
```

### Adding Status Checks

1. Add workflow in `.github/workflows/`
2. Add check name to required checks
3. Update branch protection

```javascript
// Add new required check
required_status_checks: {
  contexts: ['CI', 'Orchestrate', 'NewCheck']
}
```

### Environment-Based Rules

```javascript
// Different rules per environment
if (process.env.ENV === 'enterprise') {
  required_approving_review_count = 3;
  required_checks.push('SecurityScan', 'Compliance');
}
```

---

## VIOLATIONS

### Common Violations

| Violation | Solution |
|-----------|----------|
| Direct push to main | Always use PR |
| Skipped approvals | Wait for reviews |
| Stale branch | Rebase on target |
| Wrong merge strategy | Use correct button |

### Recovery

```bash
# Accidentally pushed to main (if possible)
git revert HEAD
git push

# Wrong branch merged
# Create revert PR immediately
```

---

**END OF BRANCH RULES**

Next document: [11_GATES.md](./11_GATES.md)
