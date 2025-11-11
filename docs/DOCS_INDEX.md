# Documentation Index

**Last Updated:** November 10, 2025 | **Status:** Phase 1 Complete, Phase 2 In Progress

This index provides a comprehensive map of all documentation in the Fresh Root repository.

## 📋 Quick Navigation

- [Getting Started](#getting-started)
- [Architecture & Design](#architecture--design)
- [Implementation Guides](#implementation-guides)
- [Operations & Maintenance](#operations--maintenance)
- [Testing & Quality](#testing--quality)
- [Advanced Topics](#advanced-topics)
- [Archive & Legacy](#archive--legacy)

---

## Getting Started

| Document | Purpose |
|----------|---------|
| **[SETUP.md](./SETUP.md)** | Local development environment setup, Firebase emulator configuration |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | Contribution guidelines, code standards, PR workflow |
| **[REPO_STANDARDS.md](./REPO_STANDARDS.md)** | Tooling versions, package manager, linting, formatting |

---

## Architecture & Design

| Document | Purpose |
|----------|---------|
| **[ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md)** | System diagrams: data flow, CI/CD pipeline, auth architecture |
| **[COMPLETE_TECHNICAL_DOCUMENTATION.md](./COMPLETE_TECHNICAL_DOCUMENTATION.md)** | Comprehensive technical reference for all systems |
| **[security.md](./security.md)** | Security architecture, authentication, authorization, encryption |
| **[schema-map.md](./schema-map.md)** | Firestore schema overview and relationships |
| **[schema-network.md](./schema-network.md)** | Network tenancy model and data isolation |

---

## Implementation Guides

| Document | Purpose |
|----------|---------|
| **[BLOCK1_SLO_SUMMARY.md](./BLOCK1_SLO_SUMMARY.md)** | Security Core (Block 1) feature summary and SLOs |
| **[BLOCK1_BLOCK2_PROGRESS.md](./BLOCK1_BLOCK2_PROGRESS.md)** | Detailed Block 1–2 implementation status and test results |
| **[BLOCK3_IMPLEMENTATION.md](./BLOCK3_IMPLEMENTATION.md)** | Integrity Core (Block 3): Zod validation, rules matrix |
| **[PHASE2_OPTIONS.md](./PHASE2_OPTIONS.md)** | Phase 2 planning: consolidation and cleanup decisions |
| **[ONBOARDING_BACKEND_COMPLETION.md](./ONBOARDING_BACKEND_COMPLETION.md)** | Phase 1 onboarding backend: APIs, flows, testing |
| **[ONBOARDING_BACKEND_QUICKREF.md](./ONBOARDING_BACKEND_QUICKREF.md)** | Quick reference for onboarding API endpoints and schemas |
| **[CONSOLIDATION_OPPORTUNITIES.md](./CONSOLIDATION_OPPORTUNITIES.md)** | Phase 2 consolidation roadmap: 12 identified improvements |

---

## Operations & Maintenance

| Document | Purpose |
|----------|---------|
| **[CI_WORKFLOW_STANDARDS.md](./CI_WORKFLOW_STANDARDS.md)** | Canonical CI workflow template, quality gates, best practices |
| **[runbooks/](./runbooks/)** | Operational guides: logging retention, backups, monitoring, alerts |
| **[PERFORMANCE.md](./PERFORMANCE.md)** | Performance benchmarks, optimization strategies, monitoring |
| **[USAGE.md](./USAGE.md)** | Day-to-day usage patterns and workflows |

---

## Testing & Quality

| Document | Purpose |
|----------|---------|
| **[TAGGING_SYSTEM.md](./TAGGING_SYSTEM.md)** | File tagging system for code organization and discovery |
| **[TECHNICAL_DEBT.md](./TECHNICAL_DEBT.md)** | Known technical debt, prioritized improvements, refactoring roadmap |
| **[PROCESS.md](./PROCESS.md)** | Development process, branching strategy, release procedures |

---

## Advanced Topics

| Document | Purpose |
|----------|---------|
| **[migrations/](./migrations/)** | Database migrations, schema changes, network tenancy migration |
| **[bible/](./bible/)** | Project Bible: authoritative design decisions and patterns |
| **[ai/](./ai/)** | AI/Copilot context, system prompts, chat guidelines |

---

## Archive & Legacy

| Document | Status | Purpose |
|----------|--------|---------|
| **[TODO-v14.md](./TODO-v14.md)** | Active | Phase 2 todo items and backlog |
| **[PLANNING.md](./PLANNING.md)** | Reference | Original planning and roadmap |
| **[GOALS.md](./GOALS.md)** | Reference | Project goals and objectives |
| **[SCOPE.md](./SCOPE.md)** | Reference | Original project scope definition |

---

## Document Organization

### By Role

**Developers & Maintainers**:
- Start with [SETUP.md](./SETUP.md)
- Review [CONTRIBUTING.md](./CONTRIBUTING.md)
- Reference [COMPLETE_TECHNICAL_DOCUMENTATION.md](./COMPLETE_TECHNICAL_DOCUMENTATION.md)
- Consult [ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md)

**Operations & DevOps**:
- See [CI_WORKFLOW_STANDARDS.md](./CI_WORKFLOW_STANDARDS.md)
- Reference [runbooks/](./runbooks/)
- Monitor [PERFORMANCE.md](./PERFORMANCE.md)

**Security & Compliance**:
- Read [security.md](./security.md)
- Review [REPO_STANDARDS.md](./REPO_STANDARDS.md)
- Check [migrations/](./migrations/) for data handling

**Product & Architecture**:
- Start with [ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md)
- Review [BLOCK1_SLO_SUMMARY.md](./BLOCK1_SLO_SUMMARY.md)
- Understand [schema-network.md](./schema-network.md)

### By Topic

**Authentication & Security**:
- [security.md](./security.md)
- [BLOCK1_SLO_SUMMARY.md](./BLOCK1_SLO_SUMMARY.md) — Session, MFA, rate limiting

**Database & Data**:
- [schema-map.md](./schema-map.md)
- [schema-network.md](./schema-network.md)
- [migrations/](./migrations/)

**Testing & Quality**:
- [BLOCK1_BLOCK2_PROGRESS.md](./BLOCK1_BLOCK2_PROGRESS.md)
- [BLOCK3_IMPLEMENTATION.md](./BLOCK3_IMPLEMENTATION.md)
- [TAGGING_SYSTEM.md](./TAGGING_SYSTEM.md)

**Onboarding Feature**:
- [ONBOARDING_BACKEND_COMPLETION.md](./ONBOARDING_BACKEND_COMPLETION.md)
- [ONBOARDING_BACKEND_QUICKREF.md](./ONBOARDING_BACKEND_QUICKREF.md)

---

## Key Files

**Root Repository**:
- `README.md` — Public-facing project overview
- `package.json` — Dependency manifest and scripts
- `pnpm-workspace.yaml` — Monorepo workspace configuration
- `tsconfig.base.json` — TypeScript base configuration
- `firestore.rules` — Security rules for Firestore
- `storage.rules` — Security rules for Cloud Storage
- `.github/workflows/` — CI/CD automation

**Apps**:
- `apps/web/` — Next.js PWA application
- `apps/web/README.md` — App-specific documentation
- `apps/web/docs/SERVICE_WORKER.md` — PWA/service worker guide

**Packages**:
- `packages/types/` — Shared TypeScript type definitions
- `packages/ui/` — UI component library
- `packages/rules-tests/` — Firebase rules testing

---

## Document Status

✅ = Current | ⚠️ = Needs Review | 🔄 = In Progress | 📦 = Archived

| Document | Status | Notes |
|----------|--------|-------|
| SETUP.md | ✅ | Current, maintained |
| ARCHITECTURE_DIAGRAMS.md | ✅ | Current, links verified |
| security.md | ✅ | Current, reviewed Nov 10 |
| BLOCK1_SLO_SUMMARY.md | ✅ | Current, Phase 1 complete |
| BLOCK3_IMPLEMENTATION.md | ✅ | Current, Phase 1 complete |
| ONBOARDING_BACKEND_COMPLETION.md | ✅ | Current, Phase 1 complete |
| CI_WORKFLOW_STANDARDS.md | ✅ | Current, recently updated |
| PHASE2_OPTIONS.md | 🔄 | In progress, Phase 2 planning |
| CONSOLIDATION_OPPORTUNITIES.md | ✅ | Current, Phase 2 roadmap |
| TECHNICAL_DEBT.md | ⚠️ | Needs Phase 2 update |
| TODO-v14.md | 🔄 | Active backlog, updated Nov 10 |

---

## How to Use This Index

1. **New to the project?** → Start with [SETUP.md](./SETUP.md), then [ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md)
2. **Setting up locally?** → Read [SETUP.md](./SETUP.md) and [REPO_STANDARDS.md](./REPO_STANDARDS.md)
3. **Making changes?** → Review [CONTRIBUTING.md](./CONTRIBUTING.md) and [CI_WORKFLOW_STANDARDS.md](./CI_WORKFLOW_STANDARDS.md)
4. **Understanding a feature?** → Find it in the topic sections above, or search [COMPLETE_TECHNICAL_DOCUMENTATION.md](./COMPLETE_TECHNICAL_DOCUMENTATION.md)
5. **Deploying to production?** → Follow [CI_WORKFLOW_STANDARDS.md](./CI_WORKFLOW_STANDARDS.md) and review [runbooks/](./runbooks/)

---

## Maintenance

This index is maintained by the project team. To update:

1. Add new documents to the appropriate section
2. Update the "Document Status" table
3. Keep links accurate and working
4. Remove or archive outdated documents

Last reviewed: November 10, 2025
