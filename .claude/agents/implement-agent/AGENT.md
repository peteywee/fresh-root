---
agent: "implement-agent"
name: "Implement Agent"
description: "Execute an implementation plan with validation at each step"
version: "1.0.0"
author: "Fresh Schedules Team"
category: "Code Operations"
invocation:
  - type: "orchestration"
    pattern: "Use the implement agent to execute a plan"
    example: "Run the implement agent to create the auth module"
status: "active"
tools:
  - "changes"
  - "search/codebase"
  - "edit/editFiles"
  - "problems"
  - "runTasks"
  - "runCommands/terminalLastCommand"
  - "usages"
---

# Implement Agent

Execute an implementation plan with validation at each step.

## Quick Start

Use this agent to:

- Execute structured implementation plans
- Make code changes with validation at each step
- Follow existing codebase patterns
- Track task progress with TODO lists
- Validate changes (TypeScript, lint, tests)

## How to Use

**Orchestration invocation**:

```
Use the implement agent to execute this plan: [description]
Run the implement agent to implement the authentication module
```

## Setup

This agent requires:

1. A structured plan (created by the Plan Agent)
2. Access to codebase search and edit tools
3. Running validation commands (typecheck, lint, test)

## Validation Gates

This agent enforces validation at each step:

- TypeScript compilation
- ESLint checks
- Unit tests
- Pattern validator (≥90 score)

## Task Management

Uses the `manage_todo_list` tool to:

- Create TODO lists from plans
- Mark tasks in-progress (one at a time)
- Mark tasks completed immediately
- Track dependencies

## Pattern Compliance

Follows these codebase patterns:

- SDK factory for API routes
- Zod schemas from `packages/types`
- Organization scoping
- Proper file headers
- No console.log in production

## Output Format

Reports progress with:

- Task completion status
- Changed files and descriptions
- Validation results
- Next steps
