# Iterate Agent — Quick Reference

## Invocation

```
Use the iterate agent to execute [objective]
```

## Phases

1. Objective Analysis → Scope, constraints, success criteria
2. Task Graph → Decomposed tasks with dependencies
3. Agent Assignment → Match agents to tasks
4. Validation → Red team checks
5. Sr Dev Review → Final sign-off
6. Execution → Run agents

## Task Types

- **Sequential**: Run one after another
- **Parallel**: Run simultaneously
- **Gate**: Block downstream until complete

## Agent Roles

- architect, implementer, tester, reviewer, docs, ops, security, redteam, srdev

## Complexity

| Level    | Strategy | Max Parallel | Max Depth |
| -------- | -------- | ------------ | --------- |
| Trivial  | Single   | 1            | 1         |
| Moderate | Parallel | 3            | 2         |
| Complex  | Hybrid   | 5            | 3         |
| Epic     | Phased   | 8            | 4         |

## Output

Task graph visualization + agent assignments + execution plan

## See Also

- [README.md](./README.md) — Full documentation
- [AGENT.md](./AGENT.md) — Configuration
