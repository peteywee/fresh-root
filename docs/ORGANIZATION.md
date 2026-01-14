# Documentation Organization Guide

> **Purpose**: Help AI agents and developers quickly locate documentation
> **Last Updated**: 2026-01-14
> **Status**: Active

---

## Folder Structure

```
docs/
├── INDEX.md                 # Main documentation index (start here)
├── QUICK_INDEX.md           # Fast reference lookup
├── README.md                # Project overview
│
├── architecture/            # System design & architectural decisions
│   ├── AI_AGENT_GUIDE.md
│   ├── CREWOPS_MANUAL.md
│   └── DEPENDENCY_GRAPH.md
│
├── standards/               # Coding standards & patterns
│   └── CODING_RULES_AND_PATTERNS.md (CANONICAL)
│
├── guides/                  # How-to guides & tutorials
│   ├── infrastructure/      # Infrastructure setup
│   │   ├── INDEX.md
│   │   ├── MEMORY_MANAGEMENT.md (Redis, rate limiting)
│   │   └── OPENTELEMETRY_SETUP.md (Tracing)
│   ├── performance/         # Performance optimization
│   │   ├── INDEX.md
│   │   └── PERFORMANCE_BENCHMARKS.md
│   ├── deployment/          # Deployment guides
│   │   ├── INDEX.md
│   │   └── FAST_TRACK_TO_PRODUCTION.md
│   ├── SETUP.md
│   ├── TESTING.md
│   └── FIREBASE.md
│
├── production/              # Operations & monitoring
│   ├── DEPLOYMENT_CHECKLIST.md
│   └── MONITORING.md
│
├── templates/               # Reusable templates
│   ├── API_ROUTE_TEMPLATE.md
│   └── ADR_TEMPLATE.md
│
├── reports/                 # Status reports & audits
│   ├── INDEX.md
│   ├── IMPLEMENTATION_TRACKER.md
│   ├── DEPRECATIONS.md
│   └── SECURITY_AUDIT.md
│
├── plans/                   # Execution plans
│   ├── INDEX.md
│   └── WAVE_EXECUTION_PLAN.md
│
├── issues/                  # Issue tracking
│   ├── INDEX.md (11/24 complete - 46%)
│   ├── ISSUE_196_*.md
│   └── FINAL_SESSION_CHECKPOINT.md
│
└── metrics/                 # Performance metrics
    └── WAVE4_PERFORMANCE_METRICS.md
```

---

## Finding Documentation by Use Case

### "I need to set up Redis rate limiting"
→ `docs/guides/infrastructure/MEMORY_MANAGEMENT.md`

### "I need to implement performance optimization"
→ `docs/guides/performance/PERFORMANCE_BENCHMARKS.md`
→ `packages/api-framework/src/performance.ts`

### "I need to set up OpenTelemetry tracing"
→ `docs/guides/infrastructure/OPENTELEMETRY_SETUP.md`

### "I need to deploy to production"
→ `docs/guides/deployment/FAST_TRACK_TO_PRODUCTION.md`
→ `docs/production/DEPLOYMENT_CHECKLIST.md`

### "I need to check project status"
→ `docs/issues/INDEX.md`
→ `docs/reports/IMPLEMENTATION_TRACKER.md`

### "I need coding standards"
→ `docs/standards/CODING_RULES_AND_PATTERNS.md` (CANONICAL)

### "I need to understand the system architecture"
→ `docs/architecture/AI_AGENT_GUIDE.md`
→ `docs/architecture/DEPENDENCY_GRAPH.md`

### "I need execution roadmap"
→ `docs/plans/WAVE_EXECUTION_PLAN.md`

---

## Finding Documentation by Topic

### Infrastructure
- **Redis & Rate Limiting**: `guides/infrastructure/MEMORY_MANAGEMENT.md`
- **OpenTelemetry**: `guides/infrastructure/OPENTELEMETRY_SETUP.md`
- **Firebase**: `guides/FIREBASE.md`

### Performance
- **Benchmarking**: `guides/performance/PERFORMANCE_BENCHMARKS.md`
- **Optimization Utils**: `packages/api-framework/src/performance.ts`
- **Metrics**: `metrics/WAVE4_PERFORMANCE_METRICS.md`

### Testing
- **Test Strategy**: `guides/TESTING.md`
- **Firestore Rules Tests**: Coverage in `tests/rules/`
- **E2E Tests**: Playwright tests in `e2e/`

### Security
- **Security Standards**: `.github/governance/amendments/A03_SECURITY_AMENDMENTS.md`
- **Security Audit**: `reports/SECURITY_AUDIT.md`
- **OWASP Guidelines**: `.github/instructions/security-and-owasp.instructions.md`

### Deployment
- **Fast Track**: `guides/deployment/FAST_TRACK_TO_PRODUCTION.md`
- **Checklist**: `production/DEPLOYMENT_CHECKLIST.md`
- **General Guide**: `guides/DEPLOYMENT.md`

### Project Status
- **Issue Tracking**: `issues/INDEX.md` (11/24 complete)
- **Implementation Tracker**: `reports/IMPLEMENTATION_TRACKER.md`
- **Execution Plan**: `plans/WAVE_EXECUTION_PLAN.md`

---

## Index Files

Every major folder has an INDEX.md file for quick navigation:

- `docs/INDEX.md` - Main documentation index
- `docs/guides/infrastructure/INDEX.md` - Infrastructure guides
- `docs/guides/performance/INDEX.md` - Performance guides
- `docs/guides/deployment/INDEX.md` - Deployment guides
- `docs/reports/INDEX.md` - Reports and trackers
- `docs/plans/INDEX.md` - Execution plans
- `docs/issues/INDEX.md` - Issue tracking (11/24 complete)

---

## Documentation Hierarchy

```
L0: Governance Canonical (.github/governance/)
  ↓
L1: Governance Amendments (.github/governance/amendments/)
  ↓
L2: Agent Instructions (.github/instructions/)
  ↓
L3: Prompt Templates (.github/prompts/)
  ↓
L4: Human Documentation (docs/) ← THIS FILE
```

**Rule**: L4 documentation must align with L0-L3 governance.

---

## Quick Reference Table

| Need | Location | Type |
|------|----------|------|
| Redis setup | `guides/infrastructure/MEMORY_MANAGEMENT.md` | Guide |
| OTEL setup | `guides/infrastructure/OPENTELEMETRY_SETUP.md` | Guide |
| Performance | `guides/performance/PERFORMANCE_BENCHMARKS.md` | Guide |
| Deployment | `guides/deployment/FAST_TRACK_TO_PRODUCTION.md` | Guide |
| Coding standards | `standards/CODING_RULES_AND_PATTERNS.md` | Standard |
| Project status | `issues/INDEX.md` | Tracking |
| Roadmap | `plans/WAVE_EXECUTION_PLAN.md` | Plan |
| Security | `.github/governance/amendments/A03_SECURITY_AMENDMENTS.md` | Governance |

---

## AI Agent Tips

### When Looking for Implementation Guides
1. Check `docs/guides/` first, organized by category
2. Check `docs/issues/INDEX.md` for implementation status
3. Check `.github/instructions/` for agent-specific instructions

### When Checking Project Status
1. `docs/issues/INDEX.md` - Current completion (11/24 - 46%)
2. `docs/reports/IMPLEMENTATION_TRACKER.md` - Detailed tracking
3. `docs/issues/FINAL_SESSION_CHECKPOINT.md` - Latest session summary

### When Implementing Features
1. Check `docs/standards/CODING_RULES_AND_PATTERNS.md` (CANONICAL)
2. Check relevant guide in `docs/guides/`
3. Check `.github/governance/` for binding rules

---

## Search Patterns

### Pattern: "How do I...?"
→ Search `docs/guides/` → Check INDEX.md files

### Pattern: "What's the status of...?"
→ Search `docs/issues/INDEX.md` → Check specific ISSUE_*.md

### Pattern: "What are the standards for...?"
→ Search `docs/standards/CODING_RULES_AND_PATTERNS.md`

### Pattern: "How do I deploy...?"
→ Search `docs/guides/deployment/` → `docs/production/`

---

**Last Reorganization**: 2026-01-14 (Consolidated loose docs into categorized folders)
