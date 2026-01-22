# Implement Agent — Quick Reference

## Invocation

```
Use the implement agent to execute this plan: [description]
```

## Process

1. **Load Plan** — Create or load TODO list
2. **Execute** — For each task: in-progress → execute → validate → completed
3. **Validate** — typecheck, lint, test, patterns
4. **Report** — Show progress and next steps

## Key Tools

- `manage_todo_list` — Track task progress
- `search/codebase` — Find patterns
- `edit/editFiles` — Make changes
- `problems` — Check errors
- `runTasks` — Run validation commands

## Validation Gates

```bash
pnpm typecheck       # Must pass
pnpm lint            # Must pass
pnpm test            # If applicable
node scripts/validate-patterns.mjs  # Score ≥90
```

## Rules

- ✅ One task in-progress at a time
- ✅ Validate after each change
- ✅ Mark completed immediately
- ❌ Never skip dependencies
- ❌ Never commit broken code

## Output

```markdown
## Implementation Progress

### Task 1: [Title]

Status: ✅ Completed Changes: [files and descriptions]

## Validation Results

- TypeScript: ✅
- Lint: ✅
- Patterns: ✅ (95)
```

## See Also

- [README.md](./README.md) — Full documentation
- [AGENT.md](./AGENT.md) — Configuration and metadata
