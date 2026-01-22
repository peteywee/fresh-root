# Create Plan Agent — Quick Reference

## Invocation

```
Use the create plan agent to create a plan for [purpose]
```

## Plan Purposes

- `upgrade` — Package/dependency upgrades
- `refactor` — Code refactoring
- `feature` — New features
- `data` — Data migration
- `infrastructure` — Infrastructure
- `architecture` — Architectural changes
- `design` — Design system
- `process` — Process improvements

## File Naming

`/plan/[purpose]-[component]-[version].md`

Examples:

- `upgrade-firebase-v12-1.md`
- `refactor-auth-module-2.md`

## Front Matter

```yaml
goal: [Title]
version: [1.0]
date_created: [YYYY-MM-DD]
owner: [Team]
status: Planned|In progress|Completed|Deprecated|On Hold
tags: [feature, upgrade, architecture, etc.]
```

## Required Sections

- Context
- Tasks (with IDs, dependencies, criteria)
- Phases (with gates and parallelization)
- Validation Criteria
- Success Metrics

## Task Format

```
ID: REQ-001 / TASK-001
Title: [Action + Noun]
Description: [Specific, unambiguous]
Dependencies: [Task IDs or None]
Success Criteria: [Measurable]
Estimated: [Xh / Xm]
```

## Key Principles

- ✅ Deterministic (machine-readable)
- ✅ Atomic tasks (single responsibility)
- ✅ Explicit dependencies
- ✅ Self-contained
- ✅ Automated validation

## See Also

- [README.md](./README.md) — Full documentation
- [AGENT.md](./AGENT.md) — Configuration
