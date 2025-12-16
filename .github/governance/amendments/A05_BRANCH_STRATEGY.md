---
id: A05
extends: 10_BRANCH_RULES.md
section: Extended Workflow
tags: [git, branches, workflow, commits]
status: canonical
priority: P1
source: .github/BRANCH_STRATEGY_*.md
---

# Amendment A05: Extended Branch Strategy & Workflow

## Purpose

Extends 10_BRANCH_RULES with detailed branch patterns, commit conventions, and merge strategies.

## Branch Patterns

| Pattern | Purpose | Merge Target | Lifespan |
|---------|---------|--------------|----------|
| `main` | Production-ready code | N/A | Permanent |
| `dev` | Integration branch | `main` | Permanent |
| `feature/*` | New features | `dev` | Short-term |
| `fix/*` | Bug fixes | `dev` or `main` | Short-term |
| `hotfix/*` | Production emergency | `main` + backport | Immediate |
| `chore/*` | Maintenance, refactor | `dev` | Short-term |
| `docs/*` | Documentation only | `dev` | Short-term |
| `test/*` | Test improvements | `dev` | Short-term |

## Commit Message Format

**Required format**: `type(scope): description`

### Types

- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `refactor` — Code refactoring (no behavior change)
- `test` — Test additions/changes
- `chore` — Build, CI, tooling
- `perf` — Performance improvement
- `style` — Formatting, whitespace

### Examples

```bash
feat(api): add batch processing endpoint
fix(auth): prevent session cookie leakage
docs(governance): add amendments extraction guide
refactor(sdk): simplify factory type signatures
test(rules): add Firestore security rules tests
chore(deps): upgrade Next.js to 16.1.0
```

## Merge Strategies

### Fast-Forward (Preferred)

```bash
git checkout main
git merge --ff-only dev
```

**Use when**: Linear history, no conflicts

### Squash (For Feature Branches)

```bash
git merge --squash feature/xyz
```

**Use when**: Multiple WIP commits, want clean history

### Merge Commit (For Integration)

```bash
git merge --no-ff dev
```

**Use when**: Preserving branch history important

## Branching Workflow

### Creating Feature Branch

```bash
git checkout dev
git pull origin dev
git checkout -b feature/add-batch-api
```

### Before Merge

```bash
# Update from target branch
git checkout dev && git pull
git checkout feature/add-batch-api
git rebase dev  # or merge dev

# Validate
pnpm -w typecheck
pnpm test
pnpm lint
```

### Merging

```bash
git checkout dev
git merge --squash feature/add-batch-api
git commit -m "feat(api): add batch processing endpoint"
git push origin dev
```

### Cleanup

```bash
git branch -d feature/add-batch-api
git push origin --delete feature/add-batch-api
```

## Hotfix Workflow

**Critical production bug** → immediate fix

```bash
# 1. Create hotfix from main
git checkout main
git checkout -b hotfix/fix-session-leak

# 2. Make minimal fix
# ... edit files ...

# 3. Test
pnpm -w typecheck && pnpm test

# 4. Merge to main
git checkout main
git merge --no-ff hotfix/fix-session-leak
git tag v1.2.3
git push origin main --tags

# 5. Backport to dev
git checkout dev
git merge main
git push origin dev

# 6. Cleanup
git branch -d hotfix/fix-session-leak
```

## Branch Protection Rules

| Branch | Rules |
|--------|-------|
| `main` | Require PR, 1 approval, passing CI |
| `dev` | Require PR, passing CI |
| `feature/*` | No restrictions |

## Reference

Detailed workflows: `archive/amendment-sources/BRANCH_STRATEGY_*.md`
