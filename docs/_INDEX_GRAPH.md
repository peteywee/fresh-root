---
title: "Documentation Relationship Graph"
description: "Semantic relationships between Fresh Schedules documentation files"
keywords:
  - index
  - graph
  - relationships
  - navigation
  - metadata
category: "reference"
status: "active"
audience:
  - ai-agents
  - developers
related-docs:
  - INDEX.md
  - _INDEX_KEYWORDS.md
  - _METADATA_SCHEMA.md
---

# Documentation Relationship Graph

> **Purpose**: Show semantic relationships between documents for AI navigation  
> **Format**: Document → [Related Documents]  
> **Usage**: Understand context and discover related information

---

## Core Navigation

### Master Index
**[INDEX.md]** (Entry Point)
- Related to:
  - _METADATA_SCHEMA.md (defines format)
  - _INDEX_KEYWORDS.md (provides keyword search)
  - _INDEX_GRAPH.md (this file, provides relationships)
  - All category README files (architecture/, guides/, standards/, etc.)

---

## Architecture Documentation Relationships

### [architecture/README.md]
- Related to:
  - [architecture/SYSTEM_DESIGN.md] (detailed system)
  - [architecture/DESIGN_PATTERNS.md] (architectural patterns)
  - [architecture/DATA_LAYER.md] (data architecture)
  - [architecture/API_SCHEMA_AUDIT.md] (API design analysis)
  - [decisions/] (architecture decisions)
  - [standards/CODING_RULES_AND_PATTERNS.md] (implementation rules)

### [architecture/SYSTEM_DESIGN.md]
- Related to:
  - [architecture/DATA_LAYER.md] (data layer design)
  - [architecture/DEPLOYMENT_ARCHITECTURE.md] (deployment design)
  - [guides/ARCHITECTURE_OVERVIEW.md] (beginner-friendly guide)
  - [standards/] (implementation standards)

### [architecture/API_SCHEMA_AUDIT.md]
- Related to:
  - [standards/API_DESIGN.md] (API design rules)
  - [standards/ZOD_INTEGRATION.md] (validation patterns)
  - [templates/code/API_ROUTE_TEMPLATE.md] (API route template)
  - [guides/API_DEVELOPMENT.md] (API development guide)

### [architecture/DESIGN_PATTERNS.md]
- Related to:
  - [standards/DESIGN_PATTERNS.md] (detailed pattern library)
  - [standards/ARCHITECTURE_PATTERNS.md] (architectural patterns)
  - [architecture/SDK_FACTORY_DESIGN.md] (SDK factory pattern)
  - [templates/code/] (code templates implementing patterns)

### [architecture/SDK_FACTORY_DESIGN.md]
- Related to:
  - [guides/SDK_FACTORY.md] (usage guide)
  - [standards/SDK_FACTORY_PATTERNS.md] (detailed rules)
  - [templates/code/SDK_FACTORY_TEMPLATE.md] (implementation template)

### [architecture/DEPLOYMENT_ARCHITECTURE.md]
- Related to:
  - [guides/DEPLOYMENT.md] (deployment procedures)
  - [guides/CI_CD_SETUP.md] (CI/CD setup)
  - [reference/checklists/DEPLOYMENT_CHECKLIST.md] (deployment checklist)
  - [guides/SCALING.md] (scalability)

---

## Guides & How-To Documentation Relationships

### [guides/README.md]
- Related to:
  - [guides/SETUP.md] (local setup)
  - [guides/DEPLOYMENT.md] (production deployment)
  - [guides/TESTING.md] (testing guide)
  - [guides/FIREBASE.md] (Firebase integration)
  - [guides/API_DEVELOPMENT.md] (API development)

### [guides/SETUP.md]
- Related to:
  - [guides/LOCAL_DEVELOPMENT.md] (local dev workflow)
  - [guides/ENVIRONMENT_SETUP.md] (environment configuration)
  - [guides/EMULATOR_SETUP.md] (Firebase emulators)
  - [guides/PNPM_SETUP.md] (pnpm setup)

### [guides/TESTING.md]
- Related to:
  - [guides/UNIT_TESTING.md] (unit test guide)
  - [guides/E2E_TESTING.md] (E2E test guide)
  - [guides/INTEGRATION_TESTING.md] (integration tests)
  - [standards/TEST_PATTERNS.md] (test patterns)
  - [standards/TEST_COVERAGE.md] (coverage standards)
  - [templates/code/TEST_TEMPLATE.md] (test template)

### [guides/FIREBASE.md]
- Related to:
  - [guides/FIREBASE_DEPLOYMENT.md] (Firebase deployment)
  - [guides/EMULATOR_SETUP.md] (Firebase emulators)
  - [standards/FIRESTORE_RULES.md] (Firestore security rules)
  - [reference/FIRESTORE_SCHEMA.md] (Firestore schema)
  - [guides/DATABASE_DESIGN.md] (database design)

### [guides/API_DEVELOPMENT.md]
- Related to:
  - [guides/SDK_FACTORY.md] (SDK factory pattern usage)
  - [standards/API_DESIGN.md] (API design standards)
  - [standards/ZOD_INTEGRATION.md] (Zod validation)
  - [templates/code/API_ROUTE_TEMPLATE.md] (API route template)
  - [architecture/API_SCHEMA_AUDIT.md] (API design audit)

### [guides/DEPLOYMENT.md]
- Related to:
  - [architecture/DEPLOYMENT_ARCHITECTURE.md] (deployment design)
  - [guides/CI_CD_SETUP.md] (CI/CD setup)
  - [reference/checklists/DEPLOYMENT_CHECKLIST.md] (deployment checklist)
  - [guides/FIREBASE_DEPLOYMENT.md] (Firebase deployment)
  - [guides/SCALING.md] (scaling considerations)

### [guides/CODE_REVIEW.md]
- Related to:
  - [guides/PULL_REQUEST_PROCESS.md] (PR process)
  - [reference/checklists/CODE_REVIEW_CHECKLIST.md] (review checklist)
  - [standards/CODING_RULES_AND_PATTERNS.md] (code standards)
  - [guides/GIT_WORKFLOW.md] (Git workflow)

---

## Standards & Best Practices Relationships

### [standards/README.md]
- Related to:
  - [standards/CODING_RULES_AND_PATTERNS.md] (canonical rules)
  - [standards/SECURITY.md] (security standards)
  - [standards/PERFORMANCE_OPTIMIZATION.md] (performance standards)
  - [standards/TYPESCRIPT_STANDARDS.md] (TypeScript standards)

### [standards/CODING_RULES_AND_PATTERNS.md]
- Related to:
  - [standards/SDK_FACTORY_PATTERNS.md] (SDK factory rules)
  - [standards/API_DESIGN.md] (API design rules)
  - [standards/ZOD_INTEGRATION.md] (Zod validation rules)
  - [standards/TYPESCRIPT_STANDARDS.md] (TypeScript rules)
  - [guides/CODE_REVIEW.md] (code review guide)
  - [reference/checklists/CODE_QUALITY_CHECKLIST.md] (code quality checklist)

### [standards/API_DESIGN.md]
- Related to:
  - [standards/SDK_FACTORY_PATTERNS.md] (SDK factory patterns)
  - [standards/ZOD_INTEGRATION.md] (Zod validation)
  - [standards/REST_PATTERNS.md] (REST patterns)
  - [guides/API_DEVELOPMENT.md] (API development guide)
  - [templates/code/API_ROUTE_TEMPLATE.md] (API route template)

### [standards/ZOD_INTEGRATION.md]
- Related to:
  - [standards/VALIDATION_PATTERNS.md] (validation patterns)
  - [standards/TYPESCRIPT_STANDARDS.md] (TypeScript types)
  - [guides/VALIDATION_WITH_ZOD.md] (Zod usage guide)
  - [templates/code/SCHEMA_TEMPLATE.md] (schema template)

### [standards/SECURITY.md]
- Related to:
  - [standards/OWASP_COMPLIANCE.md] (OWASP standards)
  - [standards/ENCRYPTION.md] (encryption patterns)
  - [standards/AUTHENTICATION.md] (auth standards)
  - [standards/CSRF_PROTECTION.md] (CSRF prevention)
  - [standards/XSS_PREVENTION.md] (XSS prevention)
  - [guides/SECURITY_HARDENING.md] (hardening guide)
  - [reports/SECURITY_AUDIT.md] (security audit)

### [standards/TYPESCRIPT_STANDARDS.md]
- Related to:
  - [standards/TYPE_SYSTEM.md] (type system rules)
  - [standards/ZOD_INTEGRATION.md] (Zod validation)
  - [guides/TYPESCRIPT_SETUP.md] (TypeScript setup)
  - [templates/code/TYPESCRIPT_TEMPLATE.md] (TypeScript template)

### [standards/REACT_PATTERNS.md]
- Related to:
  - [standards/COMPONENT_PATTERNS.md] (component patterns)
  - [standards/REACT_HOOKS.md] (hooks patterns)
  - [guides/REACT_DEVELOPMENT.md] (React guide)
  - [templates/code/COMPONENT_TEMPLATE.md] (component template)
  - [templates/code/HOOK_TEMPLATE.md] (hook template)

---

## Reference Documentation Relationships

### [reference/README.md]
- Related to:
  - [reference/API_REFERENCE.md] (API reference)
  - [reference/FIRESTORE_SCHEMA.md] (Firestore schema)
  - [reference/ENVIRONMENT_VARIABLES.md] (env vars)
  - [reference/checklists/] (checklists)
  - [reference/DEPENDENCY_GRAPH.md] (dependencies)

### [reference/checklists/DEPLOYMENT_CHECKLIST.md]
- Related to:
  - [guides/DEPLOYMENT.md] (deployment guide)
  - [reference/checklists/PRODUCTION_READINESS_CHECKLIST.md] (readiness checklist)
  - [templates/documents/DEPLOYMENT_RUNBOOK.md] (deployment runbook)

### [reference/checklists/CODE_REVIEW_CHECKLIST.md]
- Related to:
  - [guides/CODE_REVIEW.md] (code review guide)
  - [standards/CODING_RULES_AND_PATTERNS.md] (code standards)
  - [guides/PULL_REQUEST_PROCESS.md] (PR process)

### [reference/checklists/SECURITY_CHECKLIST.md]
- Related to:
  - [standards/SECURITY.md] (security standards)
  - [standards/OWASP_COMPLIANCE.md] (OWASP rules)
  - [guides/SECURITY_HARDENING.md] (hardening guide)

---

## Templates Relationships

### [templates/README.md]
- Related to:
  - [templates/documents/] (document templates)
  - [templates/code/] (code templates)
  - [templates/processes/] (process templates)

### [templates/documents/ADR_TEMPLATE.md]
- Related to:
  - [decisions/] (decision documents)
  - [architecture/SYSTEM_DESIGN.md] (architectural decisions)

### [templates/documents/RFC_TEMPLATE.md]
- Related to:
  - [decisions/] (design proposals)

### [templates/code/API_ROUTE_TEMPLATE.md]
- Related to:
  - [guides/API_DEVELOPMENT.md] (API development guide)
  - [standards/API_DESIGN.md] (API design standards)
  - [standards/SDK_FACTORY_PATTERNS.md] (SDK factory patterns)

### [templates/code/SCHEMA_TEMPLATE.md]
- Related to:
  - [standards/ZOD_INTEGRATION.md] (Zod validation)
  - [guides/DATABASE_DESIGN.md] (database design)

### [templates/code/COMPONENT_TEMPLATE.md]
- Related to:
  - [standards/COMPONENT_PATTERNS.md] (component patterns)
  - [guides/REACT_DEVELOPMENT.md] (React guide)

### [templates/code/TEST_TEMPLATE.md]
- Related to:
  - [guides/TESTING.md] (testing guide)
  - [standards/TEST_PATTERNS.md] (test patterns)

---

## Reports & Analysis Relationships

### [reports/README.md]
- Related to:
  - [reports/SECURITY_AUDIT.md] (security audit)
  - [reports/PERFORMANCE_BENCHMARKS.md] (performance analysis)
  - [reports/RETROSPECTIVES.md] (retrospectives)

### [reports/SECURITY_AUDIT.md]
- Related to:
  - [standards/SECURITY.md] (security standards)
  - [standards/OWASP_COMPLIANCE.md] (OWASP rules)
  - [guides/SECURITY_HARDENING.md] (hardening guide)

### [reports/PERFORMANCE_BENCHMARKS.md]
- Related to:
  - [guides/PERFORMANCE.md] (performance guide)
  - [standards/PERFORMANCE_OPTIMIZATION.md] (optimization patterns)
  - [guides/PERFORMANCE_PROFILING.md] (profiling guide)

---

## Decision Records Relationships

### [decisions/README.md]
- Related to:
  - All decision files (001_, 002_, etc.)
  - [architecture/] (architectural outcomes)

### [decisions/001_MONOREPO_STRUCTURE.md]
- Related to:
  - [guides/MONOREPO_SETUP.md] (monorepo guide)
  - [architecture/MONOREPO_ARCHITECTURE.md] (monorepo architecture)

### [decisions/002_SDK_FACTORY_PATTERN.md]
- Related to:
  - [architecture/SDK_FACTORY_DESIGN.md] (design document)
  - [standards/SDK_FACTORY_PATTERNS.md] (implementation standards)
  - [guides/SDK_FACTORY.md] (usage guide)

---

## Archived Documentation Relationships

### [archived/README.md]
- Related to:
  - [archived/DEPRECATED_APPROACHES.md] (deprecated approaches)
  - [archived/HISTORICAL_DOCS.md] (historical docs)
  - [guides/MIGRATION_GUIDES.md] (migration guides)

### [archived/DEPRECATED_APPROACHES.md]
- Related to:
  - Newer versions of same topic in active sections
  - [guides/MIGRATION_GUIDES.md] (migration path)

---

## Cross-Category Relationships

### Security Across Categories

**Core Standards**:
- [standards/SECURITY.md] (standards)

**Implementation Guides**:
- [guides/SECURITY_HARDENING.md] (hardening)
- [guides/AUTHENTICATION.md] (authentication)

**Architecture**:
- [architecture/SECURITY_ARCHITECTURE.md] (design)

**Reference**:
- [reference/SECURITY_CHECKLIST.md] (checklist)

**Reports**:
- [reports/SECURITY_AUDIT.md] (audit)

---

### API Development Across Categories

**Architecture**:
- [architecture/API_SCHEMA_AUDIT.md] (audit)
- [architecture/SDK_FACTORY_DESIGN.md] (design)

**Standards**:
- [standards/API_DESIGN.md] (design rules)
- [standards/SDK_FACTORY_PATTERNS.md] (patterns)

**Guides**:
- [guides/API_DEVELOPMENT.md] (guide)
- [guides/SDK_FACTORY.md] (usage)

**Templates**:
- [templates/code/API_ROUTE_TEMPLATE.md] (template)
- [templates/code/SCHEMA_TEMPLATE.md] (schema template)

**Reference**:
- [reference/API_REFERENCE.md] (API reference)

---

### Testing Across Categories

**Standards**:
- [standards/TEST_PATTERNS.md] (patterns)
- [standards/TEST_COVERAGE.md] (coverage)

**Guides**:
- [guides/TESTING.md] (guide)
- [guides/UNIT_TESTING.md] (unit tests)
- [guides/E2E_TESTING.md] (E2E tests)

**Templates**:
- [templates/code/TEST_TEMPLATE.md] (template)

**Reference**:
- [reference/checklists/TEST_CHECKLIST.md] (checklist)

---

### Deployment Across Categories

**Architecture**:
- [architecture/DEPLOYMENT_ARCHITECTURE.md] (design)

**Guides**:
- [guides/DEPLOYMENT.md] (procedures)
- [guides/CI_CD_SETUP.md] (CI/CD setup)

**Templates**:
- [templates/documents/DEPLOYMENT_RUNBOOK.md] (runbook)

**Reference**:
- [reference/checklists/DEPLOYMENT_CHECKLIST.md] (checklist)

**Reports**:
- [reports/DEPLOYMENT_ANALYSIS.md] (analysis)

---

## Discovery Patterns

### Start Here (Popular Entry Points)
1. [INDEX.md] → Master index
2. [architecture/README.md] → Understand system
3. [guides/SETUP.md] → Get running
4. [standards/CODING_RULES_AND_PATTERNS.md] → Learn rules
5. [guides/DEPLOYMENT.md] → Deploy to production

### Common Journeys

**New Developer**:
1. [guides/SETUP.md] (setup)
2. [guides/ARCHITECTURE_OVERVIEW.md] (understand system)
3. [standards/CODING_RULES_AND_PATTERNS.md] (learn rules)
4. [guides/FIRST_CONTRIBUTION.md] (make first PR)
5. [guides/CODE_REVIEW.md] (review process)

**Building API Endpoint**:
1. [guides/API_DEVELOPMENT.md] (overview)
2. [standards/API_DESIGN.md] (design rules)
3. [templates/code/API_ROUTE_TEMPLATE.md] (template)
4. [standards/ZOD_INTEGRATION.md] (validation)
5. [guides/TESTING.md] (testing)

**Deploying to Production**:
1. [guides/DEPLOYMENT.md] (procedures)
2. [reference/checklists/DEPLOYMENT_CHECKLIST.md] (checklist)
3. [guides/CI_CD_SETUP.md] (CI/CD)
4. [templates/documents/DEPLOYMENT_RUNBOOK.md] (runbook)
5. [guides/MONITORING.md] (monitoring)

**Security Audit**:
1. [standards/SECURITY.md] (standards)
2. [standards/OWASP_COMPLIANCE.md] (OWASP rules)
3. [reference/checklists/SECURITY_CHECKLIST.md] (checklist)
4. [guides/SECURITY_HARDENING.md] (hardening)
5. [reports/SECURITY_AUDIT.md] (audit results)

---

**Last Updated**: January 15, 2026  
**Total Documents**: 65+  
**Total Relationships Mapped**: 200+  
**Categories**: 8 main + subcategories
