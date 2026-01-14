# Documentation Index

> **Location**: L4 (Human-Friendly Documentation)  
> **Purpose**: Comprehensive guides for developers, operators, and stakeholders  
> **Last Updated**: 2025-12-16

---

## Document Organization

```
docs/
├── INDEX.md (this file)
├── architecture/          # System design, patterns, decisions
├── standards/            # Coding standards, patterns, templates
├── guides/               # How-to guides, tutorials
│   ├── infrastructure/   # Infrastructure setup (Redis, OTEL)
│   ├── performance/      # Performance optimization
│   └── deployment/       # Production deployment
├── production/           # Operations, deployment, monitoring
├── templates/            # Reusable document templates
├── reports/              # Analysis reports, audits, trackers
├── plans/                # Execution plans and roadmaps
├── issues/               # Issue tracking and progress
└── metrics/              # Performance metrics
```

---

## Architecture (`architecture/`)

System design, architectural decisions, and component interactions.

| Document                                                  | Purpose                   | Status |
| --------------------------------------------------------- | ------------------------- | ------ |
| [AI_AGENT_GUIDE.md](./architecture/AI_AGENT_GUIDE.md)     | AI agent onboarding       | Active |
| [CREWOPS_MANUAL.md](./architecture/CREWOPS_MANUAL.md)     | Multi-agent orchestration | Active |
| [DEPENDENCY_GRAPH.md](./architecture/DEPENDENCY_GRAPH.md) | Package dependencies      | Active |
| [API_SCHEMA_AUDIT.md](./architecture/API_SCHEMA_AUDIT.md) | API validation patterns   | Active |

---

## Standards (`standards/`)

Coding standards, patterns, and quality requirements.

| Document                                                                 | Purpose                          | Status        |
| ------------------------------------------------------------------------ | -------------------------------- | ------------- |
| [CODING_RULES_AND_PATTERNS.md](./standards/CODING_RULES_AND_PATTERNS.md) | Comprehensive coding standards   | **Canonical** |
| [CONSOLIDATION_TODO.md](./standards/CONSOLIDATION_TODO.md)               | Documentation consolidation plan | In Progress   |
| [PATTERN_VALIDATION.md](./standards/PATTERN_VALIDATION.md)               | Validation scoring rubric        | Active        |

---

## Guides (`guides/`)

Step-by-step tutorials and how-to guides.

| Category | Document | Purpose | Status |
| -------- | -------- | ------- | ------ |
| **Infrastructure** | [INDEX](./guides/infrastructure/INDEX.md) | Infrastructure setup guides | Active |
| | [MEMORY_MANAGEMENT.md](./guides/infrastructure/MEMORY_MANAGEMENT.md) | Redis configuration & rate limiting | Active |
| | [OPENTELEMETRY_SETUP.md](./guides/infrastructure/OPENTELEMETRY_SETUP.md) | Distributed tracing setup | Active |
| **Performance** | [INDEX](./guides/performance/INDEX.md) | Performance optimization guides | Active |
| | [PERFORMANCE_BENCHMARKS.md](./guides/performance/PERFORMANCE_BENCHMARKS.md) | Performance monitoring & optimization | Active |
| **Deployment** | [INDEX](./guides/deployment/INDEX.md) | Deployment guides | Active |
| | [FAST_TRACK_TO_PRODUCTION.md](./guides/deployment/FAST_TRACK_TO_PRODUCTION.md) | Production deployment checklist | Active |
| **General** | [SETUP.md](./guides/SETUP.md) | Local environment setup | Active |
| | [DEPLOYMENT.md](./guides/DEPLOYMENT.md) | Production deployment steps | Active |
| | [TESTING.md](./guides/TESTING.md) | Test strategy and execution | Active |
| | [FIREBASE.md](./guides/FIREBASE.md) | Firebase integration guide | Active |

---

## Plans (`plans/`)

Execution plans and strategic roadmaps.

| Document | Purpose | Status |
| -------- | ------- | ------ |
| [INDEX](./plans/INDEX.md) | Plans index | Active |
| [WAVE_EXECUTION_PLAN.md](./plans/WAVE_EXECUTION_PLAN.md) | Wave-based development strategy | Active |

---

## Production (`production/`)

Operations, monitoring, incident response.

| Document                                                        | Purpose                 | Status |
| --------------------------------------------------------------- | ----------------------- | ------ |
| [DEPLOYMENT_CHECKLIST.md](./production/DEPLOYMENT_CHECKLIST.md) | Pre-deploy verification | Active |
| [MONITORING.md](./production/MONITORING.md)                     | Monitoring and alerts   | Draft  |
| [INCIDENT_RESPONSE.md](./production/INCIDENT_RESPONSE.md)       | Incident runbook        | Draft  |

---

## Templates (`templates/`)

Reusable document and code templates.

| Document                                                   | Purpose                      | Status |
| ---------------------------------------------------------- | ---------------------------- | ------ |
| [API_ROUTE_TEMPLATE.md](./templates/API_ROUTE_TEMPLATE.md) | API route boilerplate        | Active |
| [AMENDMENT_TEMPLATE.md](./templates/AMENDMENT_TEMPLATE.md) | Governance amendment format  | Active |
| [ADR_TEMPLATE.md](./templates/ADR_TEMPLATE.md)             | Architecture Decision Record | Active |

---

## Reports (`reports/`)

Analysis reports, audits, retrospectives, and tracking.

| Document | Purpose | Status |
| -------- | ------- | ------ |
| [INDEX](./reports/INDEX.md) | Reports index | Active |
| [IMPLEMENTATION_TRACKER.md](./reports/IMPLEMENTATION_TRACKER.md) | Implementation progress tracker | Active |
| [DEPRECATIONS.md](./reports/DEPRECATIONS.md) | Deprecated features & migrations | Active |
| [REPOMIX_ANALYSIS.md](./reports/REPOMIX_ANALYSIS.md) | Repomix integration report | Complete |
| [SECURITY_AUDIT.md](./reports/SECURITY_AUDIT.md) | Security assessment | Complete |
| [PERFORMANCE_ANALYSIS.md](./reports/PERFORMANCE_ANALYSIS.md) | Performance benchmarks | Draft |

---

## Archive (`../archive/`)

Historical documents, superseded plans, completed migrations.

| Category          | Location                     | Contents                       |
| ----------------- | ---------------------------- | ------------------------------ |
| Execution Plans   | `archive/execution/`         | Completed master plans         |
| Migration Docs    | `archive/migration/`         | Migration guides (legacy)      |
| Repomix History   | `archive/repomix/`           | Repomix implementation docs    |
| Historical        | `archive/historical/`        | Legacy documentation           |
| CrewOps           | `archive/crewops/`           | Old CrewOps iterations         |
| Phase Work        | `archive/phase-work/`        | Temporary phase work           |
| Amendment Sources | `archive/amendment-sources/` | Source material for amendments |

---

## Quick Links

### For Developers

- [Coding Standards](./standards/CODING_RULES_AND_PATTERNS.md) - **Start here**
- [AI Agent Guide](./architecture/AI_AGENT_GUIDE.md) - AI assistant onboarding
- [Setup Guide](./guides/SETUP.md) - Local environment
- [Performance Guide](./guides/performance/PERFORMANCE_BENCHMARKS.md) - Optimization strategies
- [Infrastructure Guides](./guides/infrastructure/INDEX.md) - Redis, OTEL setup

### For AI Agents

- [CrewOps Manual](./architecture/CREWOPS_MANUAL.md) - Multi-agent coordination
- [Governance Index](../.github/governance/INDEX.md) - Canonical rules (L0/L1)
- [Instructions Index](../.github/instructions/INDEX.md) - Implementation instructions (L2)
- [Issues Tracking](./issues/INDEX.md) - Current project status

### For Operators

- [Deployment Checklist](./production/DEPLOYMENT_CHECKLIST.md) - Pre-deploy verification
- [Deployment Guide](./guides/DEPLOYMENT.md) - Step-by-step deployment
- [Fast Track to Production](./guides/deployment/FAST_TRACK_TO_PRODUCTION.md) - Quick deployment guide
- [Wave Execution Plan](./plans/WAVE_EXECUTION_PLAN.md) - Strategic roadmap

---

## Documentation Hierarchy

```
L0: Governance Canonical (.github/governance/01-12)
  ↓
L1: Governance Amendments (.github/governance/amendments/)
  ↓
L2: Agent Instructions (.github/instructions/)
  ↓
L3: Prompt Templates (.github/prompts/)
  ↓
L4: Human Documentation (docs/) ← YOU ARE HERE
```

**Rule**: L4 documentation must align with L0-L3. For binding decisions, see
[Governance Index](../.github/governance/INDEX.md).

---

## Search Tips

### Find by Topic

- **API patterns**: See [CODING_RULES_AND_PATTERNS.md](./standards/CODING_RULES_AND_PATTERNS.md) §
  SDK Factory
- **Security**: See [Governance](../.github/governance/03_DIRECTIVES.md) § D01-D02 +
  [A03_SECURITY](../.github/governance/amendments/A03_SECURITY_AMENDMENTS.md)
- **Testing**: See [TESTING.md](./guides/TESTING.md) +
  [.github/instructions/05_TESTING_AND_REVIEW.instructions.md](../.github/instructions/05_TESTING_AND_REVIEW.instructions.md)
- **Firebase**: See [FIREBASE.md](./guides/FIREBASE.md) +
  [A07_FIREBASE](../.github/governance/amendments/A07_FIREBASE_IMPL.md)

### Find by Role

- **New Developer**: AI_AGENT_GUIDE.md → CODING_RULES_AND_PATTERNS.md → SETUP.md
- **AI Agent**: Governance INDEX → Instructions INDEX → CREWOPS_MANUAL
- **Operator**: DEPLOYMENT_CHECKLIST → DEPLOYMENT.md → MONITORING.md
- **Architect**: DEPENDENCY_GRAPH → API_SCHEMA_AUDIT → Governance/03_DIRECTIVES

---

## Contributing

When adding new documentation:

1. Place in appropriate folder (architecture/standards/guides/production/templates/reports)
2. Update this INDEX.md
3. Add YAML formatter (see [AMENDMENT_TEMPLATE.md](./templates/AMENDMENT_TEMPLATE.md))
4. Link from related documents
5. Verify alignment with [Governance](../.github/governance/INDEX.md)

---

**Last Major Consolidation**: 2025-12-16 (357 files → ~150 files)
