---
title: "Architecture Documentation"
description: "System design, architectural patterns, decisions, and component interactions"
keywords:
  - architecture
  - design
  - patterns
  - decisions
category: "reference"
status: "active"
audience:
  - architects
  - developers
  - ai-agents
---

# Architecture Documentation

This section contains documentation about the system design, architectural patterns, technology decisions, and high-level component interactions.

## Categories

### System Design & Decisions
- **API Schema & Validation** - REST API design patterns, endpoint structure, request/response validation
- **Database Architecture** - Firestore structure, collections, security rules design
- **Infrastructure** - Cloud infrastructure, deployment architecture, scalability patterns
- **Integration Patterns** - How components communicate, event flows, API contracts

### Architectural Patterns
- **SDK Factory Pattern** - Type-safe API endpoint factories with built-in security
- **Zod Validation** - Type-driven validation at system boundaries
- **Security Patterns** - RBAC, authentication flows, data isolation
- **Caching Strategies** - Distributed caching, invalidation, performance optimization

### Technology Decisions
- **Firebase Ecosystem** - Why Firebase, pros/cons, alternatives considered
- **Next.js App Router** - Modern React SSR, streaming, server components
- **TypeScript** - Type safety, stricter mode, compilation targets
- **Monorepo (pnpm workspaces)** - Dependency management, package organization

---

## Quick Navigation

| Document | Purpose | Type |
|----------|---------|------|
| API Schema Audit | REST API design and validation patterns | Analysis |
| SDK Factory Guide | Type-safe API endpoint implementation | Pattern |
| Database Design | Firestore collections and security rules | Design |
| Performance Architecture | Caching, optimization, scaling strategies | Design |

---

**See also**: [Standards](../standards/) for coding patterns, [Guides](../guides/) for implementation tutorials

## Auto-Generation
| Trigger   | Script                                    | Output                | Frequency        |
| --------- | ----------------------------------------- | --------------------- | ---------------- |
| Push / PR | `.github/workflows/repomix-ci.yml`        | `repomix-ci.*`        | On every push/PR |
| Nightly   | `.github/workflows/repomix-dashboard.yml` | `repomix-dashboard.*` | 2 AM UTC daily   |
| Manual    | `pnpm repomix:ci`                         | All CI files          | On-demand        |
| Manual    | `pnpm repomix:dashboard`                  | All files + metrics   | On-demand        |

## Local Development
Generate reports locally:

```bash
# Generate CI reports (JSON + Markdown)
pnpm repomix:ci

# Generate dashboard + metrics
pnpm repomix:dashboard

# Update architecture index
pnpm docs:sync

# Collect metrics
pnpm docs:analyze
```

## Automation Hooks
### Pre-Push Hook
The `.husky/pre-push` hook runs lightweight Repomix analysis before pushing:

```bash
# Skip Repomix check
SKIP_REPOMIX=1 git push
```

### GitHub Actions
- **Repomix CI**: Generates reports on every push/PR (uploads as artifacts)
- **Repomix Dashboard**: Nightly scheduled run with auto-commit to main

## How It Works
1. **Local**: Pre-push hook generates `.repomix-cache.json` (compressed)
2. **CI (on-demand)**: GitHub Actions runs full analysis on push/PR
3. **CI (nightly)**: Scheduled dashboard regeneration with auto-commit
4. **Docs**: `docs-sync.mjs` merges reports into unified index
5. **Metrics**: `telemetry/repomix-metrics.mjs` tracks codebase growth

## Viewing Reports
- **In GitHub**: Check [Actions Artifacts](../../actions) for detailed reports
- **On main branch**: Read the auto-updated `_index.md`
- **Locally**: `pnpm repomix:ci && pnpm docs:sync`

---

**Last Generated:** Auto-managed by automation **Maintained By:** GitHub Actions + Husky hooks
