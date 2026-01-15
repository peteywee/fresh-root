---
agent: "deploy-agent"
name: "Deploy Agent"
description: "Build, validate, and deploy to production"
version: "1.0.0"
category: "Deployment & Release"
invocation:
  - type: "orchestration"
    pattern: "Use the deploy agent to deploy to"
status: "active"
tools:
  - "runCommands/terminalLastCommand"
  - "runTasks"
  - "github/github-mcp-server/*"
  - "usages"
  - "problems"
  - "testFailure"
  - "todos"
---

# Deploy Agent

Build, validate, and deploy to production.

## Quick Start

Use this agent to:
- Validate code before deployment
- Deploy to dev, staging, or production
- Execute pre-deployment checklist
- Manage Firebase rules deployment
- Execute rollback if needed

## Invocation

```
Use the deploy agent to deploy to production
Run the deploy agent for dev environment
Deploy to staging with validation
```

## Pre-Deployment Checks

```bash
pnpm typecheck       # Must pass
pnpm lint            # Must pass
pnpm test            # Must pass
pnpm test:rules      # If rules changed
node scripts/validate-patterns.mjs  # Score ≥90
pnpm build           # Must succeed
```

## Deployment Steps

### Dev Environment
```bash
git status
git branch
git push origin dev
# Verify CI passed
```

### Production Environment
```bash
git checkout main
git tag -a v[VERSION] -m "Release [VERSION]"
git push origin v[VERSION]
vercel --prod  # Or automatic via Vercel
```

### Firebase Rules
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
firebase deploy --only functions
```

## Rollback

```bash
git log --oneline -10
git revert [bad-commit-hash]
git push origin main
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
```

## See Also

- [Audit Agent](./../audit-agent/) — Security checks
- [Test Agent](./../test-agent/) — Testing
