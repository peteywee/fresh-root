---

title: "Quick Start Guide"
description: "Entry point to the documentation set and core workflows"
keywords:
- quick-start
- documentation
- onboarding
- deployment
- standards
category: "guide"
status: "active"
audience:
- developers
- operators
- ai-agents
related-docs:
- ../INDEX.md
- ../standards/README.md
- ./DEPLOYMENT.md
- ../reference/PRODUCTION\_READINESS.md
- ./VSCODE\_TASKS.md

createdAt: "2026-01-31T00:00:00Z"
lastUpdated: "2026-01-31T00:00:00Z"

---

# Quick Start Guide

## Start here

- [Documentation Index](../INDEX.md)
- [Guides Overview](./README.md)
- [Standards Overview](../standards/README.md)

## Common workflows

### Developers

1. Review [Standards Overview](../standards/README.md)
2. Follow [Guide Index](./README.md)
3. Use [VS Code Tasks](./VSCODE_TASKS.md)

### Deployment

1. Review [Production Readiness](../reference/PRODUCTION_READINESS.md)
2. Follow [Deployment Guide](./DEPLOYMENT.md)

### Audits and history

- [Branch Consolidation Guide](../visuals/branch-analysis/BRANCH_CONSOLIDATION_GUIDE.md)

## Core commands

```bash
pnpm -w install --frozen-lockfile
pnpm dev
pnpm -w typecheck
pnpm -w lint
pnpm test
```
