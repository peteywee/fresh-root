---
agent: "create-plan-agent"
name: "Create Plan Agent"
description: "Create implementation plan files for features, refactoring, upgrades"
version: "1.0.0"
category: "Planning & Documentation"
invocation:
  - type: "orchestration"
    pattern: "Use the create plan agent to create a plan"
status: "active"
---

# Create Plan Agent

Create implementation plan files for features, refactoring, upgrades.

## Quick Start

Create machine-readable, deterministic implementation plans for autonomous execution.

## Invocation

```
Use the create plan agent to create a plan for upgrading the database
Run the create plan agent for the authentication refactoring
Create a plan for the new schedule API migration
```

## Plan Purpose

- `upgrade` - Package/dependency upgrades
- `refactor` - Code refactoring
- `feature` - New feature development
- `data` - Data migration
- `infrastructure` - Infrastructure changes
- `architecture` - Architectural changes

## Output Format

Implementation plan in `/plan/` directory with:

- Front matter (metadata)
- Context analysis
- Phase-based tasks
- Success criteria
- Validation gates

## Key Requirements

- **Deterministic** - Machine-readable, no interpretation
- **Atomic tasks** - Single responsibility each
- **Explicit dependencies** - Map all relationships
- **Self-contained** - Complete context in each task
- **Automated validation** - Can be verified programmatically

## See Also

- [Plan Agent](./../plan-agent/) — Interactive planning
- [Implement Agent](./../implement-agent/) — Execution
