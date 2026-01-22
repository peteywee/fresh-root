# Plan Agent — Quick Reference

## Invocation

```
Use the plan agent to create a plan for [goal]
```

## Output Structure

1. **Context** — Current state and goal
2. **TODO List** — Atomic tasks with dependencies
3. **Dependency Graph** — Critical path visualization
4. **Risks** — Risks and mitigations
5. **Validation** — Success criteria

## TODO List Format

| ID  | Task        | Dependencies   | Status      |
| --- | ----------- | -------------- | ----------- |
| 1   | [3-7 words] | None / ID1,ID2 | not-started |

## Validation Criteria

- [ ] TypeScript: 0 errors
- [ ] Tests: All pass
- [ ] Pattern score: ≥90
- [ ] [Specific criteria]

## Key Principles

- Atomic tasks (one responsibility each)
- Explicit dependencies
- Identify parallelizable work
- Risk assessment
- Realistic estimates

## See Also

- [README.md](./README.md) — Full documentation
- [AGENT.md](./AGENT.md) — Configuration
