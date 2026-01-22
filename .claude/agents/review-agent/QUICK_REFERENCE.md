# Review Agent — Quick Reference

## Invocation

```
Run the review agent on [target]
Use the review agent to review [target]
```

## Review Tiers

🔴 **CRITICAL**: Security, correctness, breaking changes, data safety, validation, org isolation 🟡
**IMPORTANT**: Code quality, tests, performance, architecture, Triad of Trust 🟢 **SUGGESTION**:
Readability, optimization, practices, documentation

## Validation

```bash
pnpm typecheck       # Must pass
pnpm lint            # Must pass
node scripts/validate-patterns.mjs  # Score ≥ 90
```

## Output

```markdown
## Code Review: [Target]

### 🔴 Critical Issues

[Issues that block merge]

### 🟡 Important Items

[Requires discussion]

### 🟢 Suggestions

[Non-blocking improvements]

### ✅ What's Good

[Well-implemented aspects]
```

## See Also

- [README.md](./README.md) — Full documentation
- [AGENT.md](./AGENT.md) — Configuration
