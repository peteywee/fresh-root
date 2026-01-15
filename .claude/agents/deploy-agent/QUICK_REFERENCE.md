# Deploy Agent — Quick Reference

## Invocation
```
Use the deploy agent to deploy to [environment]
```

## Environments
- `dev` — Development environment
- `staging` — Staging environment
- `production` — Production environment

## Pre-Deployment Checks
```bash
pnpm typecheck       # Must pass
pnpm lint            # Must pass
pnpm test            # Must pass
pnpm test:rules      # Must pass (if rules changed)
node scripts/validate-patterns.mjs  # Score ≥ 90
pnpm build           # Must succeed
```

## Deployment Commands
```bash
# Dev
git push origin dev

# Staging
git merge main && git push origin staging

# Production
git tag -a v[VERSION] -m "Release"
git push origin v[VERSION]
vercel --prod
```

## Firebase Deployment
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
firebase deploy --only functions
```

## Rollback
```bash
git revert [bad-commit-hash]
git push origin main
```

## Output
```markdown
# Deployment Report
## Environment: [env]
## Pre-Deployment: ✅/❌
## Deployment: ✅/❌
## Verification: [URL, version, time]
```

## Rules
- ✅ Never deploy with failing tests
- ✅ Always verify CI passes
- ✅ All gates must be green
- ❌ Don't skip validation

## See Also
- [README.md](./README.md) — Full documentation
- [AGENT.md](./AGENT.md) — Configuration
