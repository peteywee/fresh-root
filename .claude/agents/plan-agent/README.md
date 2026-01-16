# Plan Agent

Create a structured implementation plan with TODO list, dependencies, and validation criteria.

## Overview

The Plan Agent creates comprehensive implementation plans that break down complex goals into structured, executable tasks with clear dependencies, risk assessment, and validation criteria.

## When to Use

✅ **Use this agent for**:
- Plan complex features
- Plan refactoring work
- Plan infrastructure changes
- Break down ambiguous goals
- Define dependencies before execution

❌ **Don't use this agent for**:
- Code implementation (use Implement Agent)
- Code review (use Review Agent)
- Quick tasks (direct execution is fine)

## Invocation

```
Use the plan agent to create a plan for the authentication module
Run the plan agent to plan the schedule API migration
Plan the database schema refactoring
```

## Planning Process

### Phase 1: Context Analysis
First, understand the request:
- What is the goal?
- What are the constraints?
- What files/patterns are involved?

Use tools to search the codebase and understand existing patterns.

### Phase 2: Create TODO List
Generate structured TODO with:
- Atomic, actionable tasks
- Clear acceptance criteria per task
- Dependencies explicitly mapped
- Identify parallelizable tasks

### Phase 3: Dependency Graph
Map the critical path:
```
Task 1 → Task 2 → Task 3
                ↘ Task 4
```

### Phase 4: Risk Assessment
Identify risks:
- What could fail?
- What assumptions are being made?
- What needs verification?

### Phase 5: Validation Plan
Define success criteria:
- TypeScript passes
- Tests pass
- Pattern validator ≥90
- Specific functionality verified

## Output Format

```markdown
# Implementation Plan: [Goal]

## Context
[Summary of current state and goal]

## TODO List
| ID  | Task | Dependencies | Status      |
| --- | ---- | ------------ | ----------- |
| 1   | ...  | None         | not-started |
| 2   | ...  | 1            | not-started |

## Dependency Graph
[Visual representation]

## Risks & Mitigations
- Risk 1: [Description] → Mitigation: [Plan]

## Validation Criteria
- [ ] TypeScript: 0 errors
- [ ] Tests: All pass
- [ ] Pattern score: ≥90
- [ ] [Specific criteria]

## Estimated Time
[x] hours/minutes
```

## Rules

- Use tools to verify assumptions
- Reference actual file paths
- Be specific about dependencies
- Estimate time realistically
- Identify parallel opportunities

## See Also

- [Implement Agent](./../implement-agent/) — Execute plans
- [Review Agent](./../review-agent/) — Review implementation
- [Test Agent](./../test-agent/) — Generate tests
