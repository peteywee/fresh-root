# Fresh Schedules v15.0 Standards - Master Index

## Quick Navigation

- [Part A: FRESH Engine Identity](#part-a-fresh-engine-identity)
- [Section 1: Core Architectural Standards (10)](#section-1-core-architectural-standards)
- [Section 2: Structural / Code Quality Standards (8)](#section-2-structural--code-quality-standards)
- [Section 3: Firebase Standards (5)](#section-3-firebase-standards)
- [Section 4: Testing, Security & Telemetry Standards (5)](#section-4-testing-security--telemetry-standards)
- [Section 5: Agents, Automation & Process Standards (11)](#section-5-agents-automation--process-standards)

---

## Part A: FRESH Engine Identity

**File:** [`00_PART_A_FRESH_ENGINE_IDENTITY.md`](./00_PART_A_FRESH_ENGINE_IDENTITY.md)

The Master Agent Identity and Prime Directive that governs all standards and operations.

- **FRESH Engine (v15.0 Doctrine):** Master Agent Identity
- **Operational Modes:** `architect`, `refactor`, `guard`, `auditor`
- **Meta-Thought Process:** 4-Phase Hierarchical (Assess → Act → Analyze → Finalize)
- **Prime Directive:** Non-destructive surgical operations with AST-based edits, diff previews, and atomic writes

---

## Section 1: Core Architectural Standards

**File:** [`01_SECTION_CORE_ARCHITECTURAL.md`](./01_SECTION_CORE_ARCHITECTURAL.md)

The foundational architectural standards that define the project's data model, authorization, multi-tenancy, and feature management.

### Standards

1. **DOMAIN_SCHEMA_STANDARD** — Zod schemas as the single source of truth for all business entities
2. **RULES_PARITY_STANDARD** — Parity between Domain (Zod), Rules (Firestore), and API (Route Handlers)
3. **API_ROUTE_STANDARD** — Consistent, secure, and observable structure for all API handlers
4. **UI_STANDARD** — Client SDK only, strict data fetching boundaries, `"use client"` directive
5. **RBAC_STANDARD** — Role-Based Access Control with canonical `USER_ROLES` constant
6. **TENANCY_STANDARD** — Single Tenant Invariant: all data partitioned by `networkId` (CRITICAL)
7. **SDK_BOUNDARY_STANDARD** — Firebase Client SDK vs. Admin SDK separation by layer
8. **CONSTANTS_ENUMS_STANDARD** — Single source of truth for all magic strings and enums
9. **MUTABILITY_STANDARD** — Explicit rules on which fields can be changed after creation
10. **FEATURE_FLAG_STANDARD** — Tenant-scoped feature flags with server-side enforcement

---

## Section 2: Structural / Code Quality Standards

**File:** [`02_SECTION_STRUCTURAL_QUALITY.md`](./02_SECTION_STRUCTURAL_QUALITY.md)

The code-level standards that ensure consistency, readability, and predictability across the codebase.

### Standards

11. **FILE_HEADER_STANDARD** — Machine-readable JSDoc headers with metadata on every file
12. **IMPORTS_STANDARD** — Deterministic 5-group import ordering with type-only promotion
13. **NAMING_STANDARD** — Authoritative naming conventions for directories, files, variables, and IDs
14. **BARREL_STANDARD** — Strict control of barrel files (`index.ts`) to prevent cycles and bloat
15. **DIRECTORY_LAYOUT_STANDARD** — Layer-based directory mapping (00-Domain, 01-Rules, 02-API, 03-UI)
16. **ID_PARAM_STANDARD** — Canonical identifiers: `networkId`, `orgId`, `venueId`, `userId`, etc.
17. **ERROR_RESPONSE_STANDARD** — Consistent JSON error shape for all API responses
18. **TYPE_EXPORT_STANDARD** — Tree-shaking-friendly type exports with `export type`

---

## Section 3: Firebase Standards

**File:** [`03_SECTION_FIREBASE.md`](./03_SECTION_FIREBASE.md)

Standards for Firebase configuration, security rules, functions, and schema validation.

### Standards

19. **FIREBASE_ENV_STANDARD** — Total environment isolation: prod, staging, dev Firebase projects
20. **FIREBASE_RULES_STANDARD** — Structure, helpers, and security principles for `firestore.rules`
21. **FIREBASE_FUNCTIONS_STANDARD** — Secure, efficient, idempotent Cloud Functions
22. **FIREBASE_SECURITY_STANDARD** — Consolidated security checklist (custom claims, MFA, app check, etc.)
23. **FIRESTORE_SCHEMA_PARITY_STANDARD** — Lightweight schema validation within `firestore.rules`

---

## Section 4: Testing, Security & Telemetry Standards

**File:** [`04_SECTION_TESTING_SECURITY.md`](./04_SECTION_TESTING_SECURITY.md)

Standards for testing, security hardening, observability, and audit trails.

### Standards

24. **TESTING_STANDARD** — Testing pyramid: unit tests (80% coverage), integration tests, E2E tests
25. **SECURITY_HARDENING_STANDARD** — Proactive security checklist (dependencies, XSS, validation, etc.)
26. **TELEMETRY_LOGGING_STANDARD** — Structured JSON logging with correlation IDs and PII masking
27. **AUDIT_TRAIL_STANDARD** — Immutable audit trail for critical state-changing actions
28. **INPUT_VALIDATION_STANDARD** — Zero-trust policy: validate all external input at entry points

---

## Section 5: Agents, Automation & Process Standards

**File:** [`05_SECTION_AGENTS_PROCESS.md`](./05_SECTION_AGENTS_PROCESS.md)

Standards for the Master Compliance Agent, migration tracking, CI/CD, and repository governance.

### Standards

29. **AGENTS_STANDARD** — Master Compliance Agent (FRESH Engine) doctrine and guardrails
30. **MIGRATION_STANDARD** — Tag-based compliance tracking: Untagged → Pending → Needs-Refactor → Ready
31. **REFACTOR_AUTOFIX_STANDARD** — Safe-to-autofix violations vs. manual-review-required violations
32. **FILETAG_METADATA_STANDARD** — Format for file metadata tags in header blocks
33. **MANIFEST_STANDARD** — `migration-manifest.csv` structure for project-wide compliance tracking
34. **AGENT_HANDOFF_STANDARD** — Handoff artifacts: `refactor-plan.md`, `refactor-plan.json`, manifest
35. **PR_GUARDRAILS_STANDARD** — Required GitHub status checks and automated PR validation
36. **CI_PIPELINE_STANDARD** — CI structure: fail-fast, parallel jobs, deterministic environment
37. **BRANCH_PROTECTION_STANDARD** — Programmatic enforcement of quality on `main` and `develop`
38. **VERSIONING_STANDARD** — Semantic Versioning with Conventional Commits and `semantic-release`
39. **DATA_ACCESS_POLICY_STANDARD** — A database-agnostic policy model and artifact (packages/types/src/policy.auth.ts)
40. **EXCEPTION_PROTOCOL_STANDARD** — Principled exception protocol and structured JSDoc annotation (`@DOCTRINE_EXCEPTION`)
41. **STANDARD_CLASSIFICATION_STANDARD** — Tiered classification of enforcement (Tier 1 / Tier 2)

---

## How to Use This Index

### For Humans

- **Exploring a Topic:** Click a section link above to jump to that category, then click an individual standard for details.
- **Searching:** Use Ctrl+F (or Cmd+F on Mac) to search across all sections for keywords like "tenancy," "RBAC," "validation," etc.
- **Quick Reference:** Each standard has a clear title, layer designation, and principles summary.

### For Machines

- **File Structure:** All 6 files are independent and can be parsed separately.
- **Linking:** Each file begins with a header indicating its scope (e.g., "Section 1: Core Architectural Standards").
- **Standards Count:** Part A (1) + Section 1-5 (10+8+5+5+11 = 39 total standards defined).

---

## Deployment Instructions

1. **Store these files** in the repository at `docs/standards/v15/`:
   - `00_PART_A_FRESH_ENGINE_IDENTITY.md`
   - `01_SECTION_CORE_ARCHITECTURAL.md`
   - `02_SECTION_STRUCTURAL_QUALITY.md`
   - `03_SECTION_FIREBASE.md`
   - `04_SECTION_TESTING_SECURITY.md`
   - `05_SECTION_AGENTS_PROCESS.md`
   - `INDEX.md` (this file)

2. **Reference from tooling:** Scripts, agents, and CI jobs should load and reference this index.

3. **Update regularly:** When standards change, update the relevant section file and regenerate the manifest.

---

## The Complete Doctrine

**All 38 standards are now fully specified and ready for enforcement.**

See the [Agent's Standard](./05_SECTION_AGENTS_PROCESS.md#29--agentsstandardmd) for guidance on how the Master Compliance Agent operates under this system.

---

**Last Updated:** November 15, 2025
**Version:** v15.0
**Authority:** Fresh Schedules Project Bible v14.0 and Architectural Doctrine
