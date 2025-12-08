---
agent: "agent"
description: "Execute an implementation plan with validation at each step"
tools:
  [
    "changes",
    "search/codebase",
    "edit/editFiles",
    "problems",
    "runTasks",
    "runCommands/terminalLastCommand",
    "usages",
  ]
---

# Execute Implementation

## Directive

Execute the implementation plan for: `${input:TaskDescription}`

## Process

### 1. Load or Create Plan

If no plan exists, create TODO list first.
If plan exists, load and verify current state.

### 2. Execute Tasks Sequentially

For each task:

1. **Mark in-progress** (only one at a time)
2. **Verify dependencies** are complete
3. **Execute the task**
   - Search codebase for patterns
   - Make minimal changes
   - Follow existing conventions
4. **Validate the change**
   - Check for errors
   - Verify patterns match
5. **Mark completed** immediately

### 3. Validation Gates

After each significant change:
- Check for TypeScript errors
- Verify no lint issues
- Run relevant tests if applicable

### 4. Final Validation

After all tasks:
```bash
pnpm typecheck
pnpm lint
pnpm test
node scripts/validate-patterns.mjs
```

## Code Change Rules

- Use SDK factory pattern for API routes
- Use Zod schemas from packages/types
- Scope all queries to organization
- Add proper file headers
- No console.log in production code
- Handle all error cases

## Output Format

```markdown
## Implementation Progress

### Task 1: [Title]
Status: ✅ Completed
Changes:
- [File]: [Description of change]

### Task 2: [Title]
Status: 🔄 In Progress
...

## Validation Results
- TypeScript: ✅/❌
- Lint: ✅/❌
- Tests: ✅/❌
- Patterns: [score]

## Next Steps
[What remains or what user should verify]
```

## Rules

- One task in-progress at a time
- Mark completed immediately
- Validate after each change
- Stop if validation fails
