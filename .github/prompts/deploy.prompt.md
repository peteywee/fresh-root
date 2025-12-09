---
agent: "agent"
description: "Build, validate, and deploy to production"
tools:
  ['runCommands/terminalLastCommand', 'runTasks', 'github/github-mcp-server/*', 'usages', 'problems', 'testFailure', 'todos']
---

# Deploy Workflow

## Directive

Execute deployment workflow for: `${input:Environment}`

Environment: `dev` | `staging` | `production`

## Pre-Deployment Checklist

### 1. Code Validation

```bash
pnpm typecheck       # Must pass
pnpm lint            # Must pass
pnpm test            # Must pass
pnpm test:rules      # Must pass (if rules changed)
```

### 2. Pattern Validation

```bash
node scripts/validate-patterns.mjs
# Score must be ≥90
```

### 3. Build Verification

```bash
pnpm build           # Must succeed
```

### 4. Security Check

- [ ] No secrets in code
- [ ] All inputs validated
- [ ] SDK factory used for all routes
- [ ] Org scoping enforced

## Deployment Steps

### Dev Environment

```bash
# 1. Verify branch
git status
git branch

# 2. Push to dev
git push origin dev

# 3. Verify CI
# Check GitHub Actions passed
```

### Production Environment

```bash
# 1. Ensure on main or dev branch
git checkout main

# 2. Create release tag
git tag -a v[VERSION] -m "Release [VERSION]"

# 3. Push tag
git push origin v[VERSION]

# 4. Deploy via Vercel (automatic) or:
vercel --prod
```

### Firebase Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy Functions
firebase deploy --only functions
```

## Rollback Procedure

If deployment fails:

```bash
# 1. Identify last good commit
git log --oneline -10

# 2. Revert to last good state
git revert [bad-commit-hash]

# 3. Push revert
git push origin main

# 4. Verify rollback deployed
```

## Output Format

```markdown
# Deployment Report

## Environment
[dev/staging/production]

## Pre-Deployment Checks
- [ ] TypeScript: ✅/❌
- [ ] Lint: ✅/❌
- [ ] Tests: ✅/❌
- [ ] Pattern Score: [X]
- [ ] Build: ✅/❌
- [ ] Security: ✅/❌

## Deployment Status
- [ ] Code pushed
- [ ] CI passed
- [ ] Deploy succeeded
- [ ] Smoke test passed

## Verification
- URL: [deployed URL]
- Version: [version/commit]
- Time: [timestamp]

## Rollback Ready
- Previous version: [version]
- Rollback command: `[command]`
```

## Rules

- Never deploy with failing tests
- Always verify CI passes
- Document rollback procedure
- Verify deployment with smoke test
- Production requires all gates green
