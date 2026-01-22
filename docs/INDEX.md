---
title: "Documentation Master Index"
description:
  "Complete guide to Fresh Schedules documentation organized by category, audience, and purpose"
keywords:
  - documentation
  - index
  - reference
  - guide
  - masterindex
category: "reference"
status: "active"
audience:
  - developers
  - operators
  - architects
  - teams
  - ai-agents
---

# Documentation Master Index

> **Last Updated**: January 15, 2026  
> **Purpose**: Comprehensive guide to all Fresh Schedules documentation  
> **Format**: All docs have YAML frontmatter for AI indexing

---

## Quick Navigation by Role

### For New Developers

1. [Local Setup Guide](guides/SETUP.md) - Get dev environment running
2. [Architecture Overview](architecture/) - Understand the system
3. [Coding Standards](standards/CODING_RULES_AND_PATTERNS.md) - Our rules
4. [First Contribution Guide](guides/) - Make your first PR

### For Operators / DevOps

1. [Deployment Guide](guides/DEPLOYMENT.md) - Deploy to production
2. [Operations Guide](guides/) - Running in production
3. [Monitoring & Alerts](guides/) - Setup monitoring
4. [Production Checklist](reference/checklists/) - Pre-deploy

### For Architects

1. [Architecture Overview](architecture/) - System design
2. [Design Decisions](decisions/) - Why we chose technologies
3. [API Design Patterns](standards/) - REST endpoint patterns
4. [Security Architecture](architecture/) - Security design
5. [Scalability Patterns](architecture/) - Growth strategy

### For AI Agents

1. [Metadata Schema](_METADATA_SCHEMA.md) - How docs are tagged
2. [Keyword Index](_INDEX_KEYWORDS.md) - Searchable keywords
3. [Relationship Graph](_INDEX_GRAPH.md) - Doc relationships
4. Use frontmatter: `keywords`, `category`, `tags` for discovery

---

## Directory Structure

```
docs/
├── _METADATA_SCHEMA.md        # YAML frontmatter specification
├── _INDEX_KEYWORDS.md         # Keyword search index for AI
├── _INDEX_GRAPH.md            # Relationship graph for navigation
├── INDEX.md                   # THIS FILE - master index
│
├── architecture/              # System design, patterns, decisions
│   ├── README.md
│   ├── decisions/             # Architecture Decision Records
│   └── patterns/              # Architectural patterns
│
├── guides/                    # How-to guides, tutorials, procedures
│   ├── README.md
│   ├── setup/                 # Local development setup
│   ├── deployment/            # Production deployment
│   └── operations/            # Running in production
│
├── standards/                 # Coding standards, rules, best practices
│   ├── README.md
│   ├── patterns/              # Coding patterns
│   └── checklists/            # Code review, security checks
│
├── reference/                 # Quick reference, lookups, API docs
│   ├── README.md
│   └── checklists/            # Deployment, security, review checklists
│
├── reports/                   # Analysis reports, audits, retrospectives
│   ├── README.md
│   ├── audits/                # Security, code, performance audits
│   ├── retrospectives/        # Post-mortems, lessons learned
│   └── analyses/              # Performance, dependency analyses
│
├── templates/                 # Reusable templates (documents, code, processes)
│   ├── README.md
│   ├── documents/             # Document templates (ADRs, RFCs, etc)
│   └── code/                  # Code templates (routes, components, tests)
│
└── archived/                  # Deprecated, historical, completed work
    └── README.md
```

---

## Documentation by Category

### 📐 Architecture Documentation

System design, patterns, and technology decisions.

**Location**: [`docs/architecture/`](architecture/)  
**Category**: `architecture`  
**Audience**: Architects, Senior Developers, AI Agents

**Content Areas**:

- System design and component interactions
- Technology choices and rationale
- Integration patterns and data flows
- Scalability and performance architecture
- Security architecture and threat models

**Key Files**:

- `API_SCHEMA_AUDIT.md` - API design analysis
- `DEPENDENCY_GRAPH.md` - Package relationship map
- See [`architecture/README.md`](architecture/README.md) for complete list

**AI Tags**: `architecture`, `design`, `patterns`, `decisions`, `technology-choice`

---

### 📚 Implementation Guides

Step-by-step how-to guides, tutorials, and procedures.

**Location**: [`docs/guides/`](guides/)  
**Category**: `guide`  
**Audience**: Developers, Operators, Teams

**Subcategories**:

- **setup/** - Local development environment
- **deployment/** - Production deployment procedures
- **operations/** - Running and maintaining production
- Plus: Feature development, testing, Firebase, performance

**Key Files**:

- `SETUP.md` - Local dev environment
- `DEPLOYMENT.md` - Production deployment
- `TESTING.md` - Testing guidelines
- `FIREBASE.md` - Firebase integration
- See [`guides/README.md`](guides/README.md) for complete list

**AI Tags**: `guide`, `howto`, `tutorial`, `procedure`, `setup`, `deployment`

---

### 📋 Coding Standards & Best Practices

Rules, patterns, and quality standards.

**Location**: [`docs/standards/`](standards/)  
**Category**: `standard`  
**Audience**: All Developers, AI Agents

**Content Areas**:

- Mandatory coding rules
- Language/framework patterns (TypeScript, React, Firebase, etc)
- Security standards and OWASP compliance
- Performance optimization patterns
- Testing standards
- Accessibility standards (WCAG 2.1 AA)
- Code organization and import rules

**Key Files**:

- `CODING_RULES_AND_PATTERNS.md` - **Canonical** rules
- See [`standards/README.md`](standards/README.md) for complete list

**AI Tags**: `standard`, `pattern`, `rule`, `best-practice`, `coding-rules`

---

### 🔍 Reference Documentation

Quick references, API docs, checklists, and lookup tables.

**Location**: [`docs/reference/`](reference/)  
**Category**: `reference`  
**Audience**: All Developers, Operators, AI Agents

**Content Areas**:

- API endpoint reference
- CLI command reference
- Environment variables reference
- Firestore schema and rules reference
- Error codes and status codes
- Role hierarchy and permissions
- Database limits and quotas

**Subfolders**:

- `checklists/` - Deployment, security, code review checklists

**Key Files**:

- See [`reference/README.md`](reference/README.md) for complete list

**AI Tags**: `reference`, `lookup`, `api-docs`, `checklist`, `quick-reference`

---

### 📊 Reports & Analyses

Audit findings, performance metrics, retrospectives.

**Location**: [`docs/reports/`](reports/)  
**Category**: `report`  
**Audience**: Architects, Leads, Stakeholders

**Content Areas**:

- **audits/** - Security, code quality, infrastructure audits
- **retrospectives/** - Post-mortems, lessons learned
- **analyses/** - Performance, dependency, complexity analyses

**Key Files**:

- See [`reports/README.md`](reports/README.md) for complete list

**AI Tags**: `report`, `audit`, `analysis`, `retrospective`, `metrics`

---

### 📝 Templates

Reusable document and code templates.

**Location**: [`docs/templates/`](templates/)  
**Category**: `template`  
**Audience**: Developers, Teams, All contributors

**Content**:

- **documents/** - ADR, RFC, incident report templates
- **code/** - API route, component, test templates
- **processes/** - Deployment, review, release checklists

**Key Files**:

- See [`templates/README.md`](templates/README.md) for complete list

**AI Tags**: `template`, `boilerplate`, `scaffold`

---

### 📦 Archived Documentation

Deprecated, historical, and completed work.

**Location**: [`docs/archived/`](archived/)  
**Category**: `archive`  
**Audience**: Reference only **Status**: Mostly `deprecated`

**Note**: Always check current documentation first. Archived docs may be outdated.

**Content**:

- Deprecated approaches (replaced by newer ones)
- Historical documentation (completed projects)
- Old architecture (no longer used)
- Migration guides (completed migrations)

**AI Tags**: `archive`, `deprecated`, `historical`, `completed`

---

## Search by Keyword

Use these keywords to find related documentation:

| Keyword                                                          | Related Docs                          | Category                      |
| ---------------------------------------------------------------- | ------------------------------------- | ----------------------------- |
| `api`, `endpoint`, `rest`, `validation`                          | API Design, SDK Factory, Validation   | standards, architecture       |
| `auth`, `authentication`, `authorization`, `rbac`, `login`       | Auth patterns, Security               | guides, standards             |
| `database`, `firestore`, `firebase`, `collections`, `schema`     | Firebase integration, Database design | guides, reference, standards  |
| `deployment`, `production`, `devops`, `operations`               | Deployment guide, Operations          | guides, reference             |
| `testing`, `test`, `unit`, `integration`, `e2e`, `vitest`        | Testing guide, Test patterns          | guides, standards             |
| `performance`, `optimization`, `caching`, `metrics`, `benchmark` | Performance guide, Benchmarks         | guides, reports, standards    |
| `security`, `owasp`, `encryption`, `audit`, `vulnerability`      | Security standards, Audit             | standards, reports, reference |
| `typescript`, `types`, `zod`, `validation`, `schema`             | TypeScript standards, Zod validation  | standards, patterns           |
| `react`, `frontend`, `components`, `hooks`, `next.js`            | React patterns, Component guide       | standards, guides             |
| `firebase`, `cloud`, `gcp`, `functions`, `auth`                  | Firebase guide, Cloud architecture    | guides, standards             |
| `monorepo`, `dependencies`, `pnpm`, `workspace`, `turbo`         | Monorepo guide, Dependencies          | guides, reference             |

---

## Using Documentation for AI

### 1. **Parse YAML Frontmatter**

All files have metadata at the top:

```yaml
---
title: "..."
keywords: ["keyword1", "keyword2", ...]
category: "architecture|guide|standard|reference|decision|report|template|archive"
status: "active|draft|deprecated|archived"
audience: ["developers", "operators", "architects", "ai-agents"]
related-docs: ["path/to/related.md", ...]
---
```

### 2. **Use Keywords for Search**

The `keywords` array in frontmatter is optimized for AI semantic search. Use it to find related
content.

### 3. **Check Status First**

- `active` - Current and authoritative
- `draft` - Work in progress
- `deprecated` - Outdated, check newer docs first
- `archived` - Historical reference only

### 4. **Navigate via Related Docs**

Use `related-docs` field to understand document relationships and context.

### 5. **Filter by Audience**

If `ai-agents` is in audience field, the doc is written with AI agent needs in mind.

### 6. **Check Metadata Schema**

See [`_METADATA_SCHEMA.md`](_METADATA_SCHEMA.md) for full specification of all frontmatter fields.

---

## Contributing Documentation

When adding or updating docs:

1. **Choose location** - Pick the right category/subdirectory
2. **Add YAML frontmatter** - Use the schema from [`_METADATA_SCHEMA.md`](_METADATA_SCHEMA.md)
3. **Write for humans first** - Clear, organized content
4. **Include cross-links** - Use `related-docs` to help navigation
5. **Update INDEX.md** - Add to appropriate section
6. **Follow structure** - Keep files organized by category

---

**Last Updated**: January 15, 2026  
**Maintained By**: Development Team  
**Questions?**: Check individual category README files

# Documentation Index

> **Location**: L4 (Human-Friendly Documentation)\
> **Purpose**: Comprehensive guides for developers, operators, and stakeholders\
> **Last Updated**: 2025-12-16

---

## Document Organization

```
docs/
├── INDEX.md (this file)
├── architecture/          # System design, patterns, decisions
├── standards/            # Coding standards, patterns, templates
├── guides/               # How-to guides, tutorials
├── production/           # Operations, deployment, monitoring
├── templates/            # Reusable document templates
└── reports/              # Analysis reports, audits
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

| Document                                | Purpose                     | Status |
| --------------------------------------- | --------------------------- | ------ |
| [SETUP.md](./guides/SETUP.md)           | Local environment setup     | Active |
| [DEPLOYMENT.md](./guides/DEPLOYMENT.md) | Production deployment steps | Active |
| [TESTING.md](./guides/TESTING.md)       | Test strategy and execution | Active |
| [FIREBASE.md](./guides/FIREBASE.md)     | Firebase integration guide  | Active |
| [CODEX.md](./guides/CODEX.md)           | Codex workflow guide        | Active |

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

Analysis reports, audits, retrospectives.

| Document                                                     | Purpose                    | Status   |
| ------------------------------------------------------------ | -------------------------- | -------- |
| [REPOMIX_ANALYSIS.md](./reports/REPOMIX_ANALYSIS.md)         | Repomix integration report | Complete |
| [SECURITY_AUDIT.md](./reports/SECURITY_AUDIT.md)             | Security assessment        | Complete |
| [PERFORMANCE_ANALYSIS.md](./reports/PERFORMANCE_ANALYSIS.md) | Performance benchmarks     | Draft    |

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

### For AI Agents

- [Agents Registry](../.claude/agents/INDEX.md) - Discoverable agents, invocation methods
- [CrewOps Manual](./architecture/CREWOPS_MANUAL.md) - Multi-agent coordination
- [Governance Index](../.github/governance/INDEX.md) - Canonical rules (L0/L1)
- [Instructions Index](../.github/instructions/INDEX.md) - Implementation instructions (L2)

### For Operators

- [Deployment Checklist](./production/DEPLOYMENT_CHECKLIST.md) - Pre-deploy verification
- [Deployment Guide](./guides/DEPLOYMENT.md) - Step-by-step deployment

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
L4a: Agent Registry (.claude/agents/) ← Agent configurations & discovery
  ↓
L4b: Human Documentation (docs/) ← YOU ARE HERE
```

**Rule**: L4 documentation must align with L0-L3. For binding decisions, see
[Governance Index](../.github/governance/INDEX.md).

**Agent Registry**: All discoverable agents are registered in
[.claude/agents/INDEX.md](../.claude/agents/INDEX.md)

### L4a: Agent Registry (.claude/agents/)

Discoverable agents with invocation methods, capabilities, and configurations.

| Agent                    | Invocations                                      | Status    | Registry                                                                            |
| ------------------------ | ------------------------------------------------ | --------- | ----------------------------------------------------------------------------------- |
| **UI/UX Specialist**     | `@ui-ux`, `@ux`, `@design` / `/ui-ux`, `/design` | ✅ Active | [.claude/agents/ui-ux-specialist/](../.claude/agents/ui-ux-specialist/)             |
| **PR Conflict Resolver** | Agent-based                                      | ✅ Active | [.claude/agents/pr-conflict-resolver.md](../.claude/agents/pr-conflict-resolver.md) |

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
- **AI Agent**: Agents Registry → Governance INDEX → Instructions INDEX → CREWOPS_MANUAL
- **Agent Developer**: [.claude/agents/INDEX.md](../.claude/agents/INDEX.md) → Agent template
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
**Agent Registry Added**: January 14, 2026 (UI/UX Specialist Agent)
