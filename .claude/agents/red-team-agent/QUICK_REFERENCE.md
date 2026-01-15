# Red Team Agent — Quick Reference

## Invocation
```
Use the red team agent to attack [target]
```

## Attack Vectors
- **SEC**: Auth bypass, data leakage, injection, access control, secrets
- **LOG**: Logic errors, race conditions, error handling
- **PAT**: Pattern compliance, type safety, SDK factory
- **EDGE**: Null/undefined, empty arrays, boundaries

## Output
```markdown
# 🔴 RED TEAM ATTACK REPORT
## Security Checks
- SEC-01: Auth bypass [PASS/FAIL]
- SEC-02: Data leakage [PASS/FAIL]

## Logic Checks
- LOG-01: Logic errors [PASS/FAIL]

## Pattern Checks
- PAT-01: Compliance [PASS/FAIL]

## Edge Cases
- EDGE-01: Null handling [PASS/FAIL]

## Sr Dev Review
[Findings evaluation]
```

## See Also
- [README.md](./README.md) — Full documentation
- [AGENT.md](./AGENT.md) — Configuration
