---

agent: "agent"
description:
"Create a structured implementation plan with TODO list, dependencies, and validation criteria"
tools:
\[
"changes",
"search/codebase",
"edit/editFiles",
"fetch",
"problems",
"runTasks",
"search",
"usages",
]
-

# Create Implementation Plan
## Directive
Create a comprehensive implementation plan for: `${input:Goal}`

## Process
### 1. Context Analysis
First, understand the request:

- What is the goal?
- What are the constraints?
- What files/patterns are involved?

Use tools to search the codebase and understand existing patterns.

### 2. Create TODO List
Generate a structured TODO list with:

```
ID | Title (3-7 words) | Description | Status | Dependencies
```

Rules:

- Atomic, actionable tasks
- Clear acceptance criteria per task
- Dependencies explicitly mapped
- Identify parallelizable tasks

### 3. Dependency Graph
Map the critical path:

```
Task 1 → Task 2 → Task 3
                ↘ Task 4
```

### 4. Risk Assessment
Identify risks:

- What could fail?
- What assumptions are being made?
- What needs verification?

### 5. Validation Plan
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
- [[ ]] TypeScript: 0 errors
- [[ ]] Tests: All pass
- [[ ]] Pattern score: ≥90
- [[ ]] [Specific criteria]

## Estimated Time
[x] hours/minutes
```

## Rules
- Use tools to verify assumptions
- Reference actual file paths
- Follow existing patterns in codebase
- Mark assumptions with \[ASSUMPTION]
