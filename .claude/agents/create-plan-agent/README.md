# Create Plan Agent

Create implementation plan files for features, refactoring, upgrades.

## Overview

Creates machine-readable, deterministic implementation plan files designed for autonomous execution
by AI agents or humans.

## When to Use

✅ **Use this agent for**:

- Create machine-executable plans
- Package upgrade planning
- Refactoring projects
- Feature development planning
- Architecture changes

❌ **Don't use this agent for**:

- Interactive planning (use Plan Agent)
- Quick tasks
- Vague objectives

## Invocation

```
Use the create plan agent to create a plan for upgrading the database
Run the create plan agent for the authentication refactoring
Create a plan for the new schedule API migration
```

## Plan Purposes

| Prefix           | Meaning                     | Examples                            |
| ---------------- | --------------------------- | ----------------------------------- |
| `upgrade`        | Package/dependency upgrades | Node.js, React, Firebase            |
| `refactor`       | Code refactoring            | Module extraction, API migration    |
| `feature`        | New feature development     | Auth module, schedule API           |
| `data`           | Data migration              | Schema changes, data transformation |
| `infrastructure` | Infrastructure changes      | Database, hosting, CI/CD            |
| `architecture`   | Architectural changes       | System redesign, pattern adoption   |
| `design`         | Design system updates       | Component library, design tokens    |
| `process`        | Process improvements        | Workflow, validation                |

## File Organization

Plans stored in `/plan/` directory:

**Naming**: `[purpose]-[component]-[version].md`

Examples:

- `upgrade-firebase-v12-1.md`
- `refactor-auth-module-2.md`
- `feature-schedule-api-1.md`

## Front Matter

```yaml
goal: [Concise title]
version: [e.g., 1.0, date]
date_created: [YYYY-MM-DD]
last_updated: [YYYY-MM-DD]
owner: [Team/Individual]
status: Completed|In progress|Planned|Deprecated|On Hold
tags: [feature, upgrade, chore, architecture, migration, bug]
```

## Plan Sections

### Context

- Current state analysis
- Problem definition
- Goals and constraints

### Tasks

Machine-executable tasks with:

- ID (REQ-001, TASK-001)
- Title (action-oriented)
- Description (specific, unambiguous)
- Dependencies
- Success criteria
- Estimated time

### Phases

Discrete phases with:

- Measurable completion criteria
- Parallel task indicators
- Sequential dependencies
- Validation gates

### Validation Criteria

- TypeScript: 0 errors
- Tests: All pass
- Pattern score: ≥90
- Specific functionality verified

### Success Metrics

- Quantifiable outcomes
- Performance improvements
- Coverage metrics

## Key Requirements

- **Deterministic**: Machine-readable, zero interpretation
- **Atomic Tasks**: Single responsibility each
- **Explicit Dependencies**: All relationships mapped
- **Self-Contained**: Complete context per task
- **Automated Validation**: Programmatically verifiable

## Validation Rules

- All front matter fields present
- All section headers match exactly (case-sensitive)
- All identifier prefixes follow format
- Tables include all required columns
- No placeholder text

## Process

1. **Analyze Goal**
   - Understand objective
   - Identify constraints
   - Define scope

2. **Research Context**
   - Understand current state
   - Identify existing patterns
   - Map dependencies

3. **Decompose Tasks**
   - Break into atomic tasks
   - Define dependencies
   - Estimate timeline

4. **Create Phases**
   - Group related tasks
   - Define gates
   - Identify parallelization

5. **Write Plan**
   - Follow template exactly
   - Use unambiguous language
   - Include all context

## See Also

- [Plan Agent](./../plan-agent/) — Interactive planning
- [Implement Agent](./../implement-agent/) — Execution
