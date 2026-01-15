# Implement Agent

Execute an implementation plan with validation at each step.

## Overview

The Implement Agent executes structured implementation plans for features, refactoring, or infrastructure changes. It follows a methodical approach:

1. **Load or Create Plan** — If no plan exists, create a TODO list first
2. **Execute Tasks Sequentially** — Mark tasks in-progress, verify dependencies, execute, validate, mark completed
3. **Validation Gates** — After each change: TypeScript, ESLint, tests, pattern validator
4. **Final Validation** — All checks must pass before claiming completion

## When to Use

✅ **Use this agent for**:
- Executing multi-step feature implementations
- Refactoring large sections of code
- Following structured plans from the Plan Agent
- Making changes across multiple files with validation

❌ **Don't use this agent for**:
- Quick one-off fixes (use direct edit instead)
- Planning (use the Plan Agent)
- Code review (use the Review Agent)
- Testing (use the Test Agent)

## Invocation

### Orchestration
```
Use the implement agent to execute this plan: create the authentication module
Run the implement agent to implement the new schedule API
```

## How It Works

### Phase 1: Plan Loading
- If no plan exists, creates a TODO list
- If plan exists, loads and verifies current state
- Shows task dependencies

### Phase 2: Sequential Execution
For each task:
1. Mark task as in-progress (only one at a time)
2. Verify dependencies are complete
3. Execute the task
   - Search codebase for patterns
   - Make minimal changes
   - Follow existing conventions
4. Validate the change
   - Check for TypeScript errors
   - Verify no lint issues
   - Run relevant tests if applicable
5. Mark task as completed immediately

### Phase 3: Validation Gates
After each significant change:
- ✅ TypeScript compilation passes
- ✅ ESLint passes
- ✅ Tests pass (if applicable)
- ✅ Pattern validator ≥90

### Phase 4: Final Validation
```bash
pnpm typecheck
pnpm lint
pnpm test
node scripts/validate-patterns.mjs
```

## Code Change Rules

- **SDK Factory**: Use SDK factory pattern for API routes (`createOrgEndpoint`, etc.)
- **Zod Schemas**: Use schemas from `packages/types/src/` (never duplicate)
- **Organization Scoping**: All queries must filter by `context.org.orgId`
- **File Headers**: Add proper headers with P# priority and domain tags
- **No console.log**: Production code must not have console.log
- **Error Handling**: Handle all error cases with proper logging

## Output Format

Reports progress with:
```markdown
## Implementation Progress

### Task 1: [Title]
Status: ✅ Completed
Changes:
- [File]: [Description]

### Task 2: [Title]
Status: 🔄 In Progress
...

## Validation Results
- TypeScript: ✅
- Lint: ✅
- Tests: ✅
- Patterns: ✅ (score: 95)

## Next Steps
[What remains or what user should verify]
```

## Rules

- One task in-progress at a time
- Mark completed immediately (don't batch)
- Stop if validation fails
- Verify dependencies before proceeding
- Minimal changes only (follow DRY)

## Setup & Troubleshooting

### Prerequisites
- [ ] `pnpm install --frozen-lockfile` completed
- [ ] All tools available (search, edit, validate, run)
- [ ] Codebase in clean state (no uncommitted changes)

### Common Issues

**"Validation failed"**
- Check error message carefully
- Fix the issue before continuing
- Don't proceed with broken code

**"Dependency not complete"**
- Don't skip dependencies
- Mark dependencies as in-progress if needed
- Validate dependency completion

**"Pattern validator <90"**
- Review pattern violations
- Fix issues or document in issue
- Re-run validator

## See Also

- [Plan Agent](./../plan-agent/) — Create implementation plans
- [Review Agent](./../review-agent/) — Code review
- [Test Agent](./../test-agent/) — Generate and run tests
- [Audit Agent](./../audit-agent/) — Security audit
