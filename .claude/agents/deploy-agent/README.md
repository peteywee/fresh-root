# Deploy Agent

Build, validate, and deploy to production.

## Overview

The Deploy Agent manages the entire deployment workflow including pre-deployment validation, deployment execution, and rollback capabilities.

## When to Use

✅ **Use this agent for**:
- Deploy to production
- Deploy to staging
- Pre-deployment validation
- Rollback management

❌ **Don't use this agent for**:
- Code implementation (use Implement Agent)
- Testing (use Test Agent)
- Local development (manual work)

## Invocation

```
Use the deploy agent to deploy to production
Run the deploy agent for staging environment
Deploy with full validation
```

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

## Deployment Environments

### Dev Environment
```bash
git status
git branch
git push origin dev
# Verify CI passed
```

### Staging Environment
```bash
git checkout staging
git pull origin staging
git merge main
git push origin staging
# Verify CI and deployment
```

### Production Environment
```bash
git checkout main
git tag -a v[VERSION] -m "Release [VERSION]"
git push origin v[VERSION]
vercel --prod  # Or automatic via Vercel
```

## Firebase Deployment

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy Cloud Functions
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
- [ ] Pattern Score: [x]
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

## See Also

- [Audit Agent](./../audit-agent/) — Security checks
- [Test Agent](./../test-agent/) — Testing
- [Review Agent](./../review-agent/) — Code review
