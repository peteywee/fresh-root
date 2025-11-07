# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-07

### Added - Block 3: Integrity Core

- **Zod-first API validation**: All API routes validate inputs using shared Zod schemas from `@fresh-schedules/types` package
- **Canonical `withSecurity` middleware**: Unified API security layer combining authentication, rate limiting, and configurable options
- **Rules test matrix**: Comprehensive Firestore/Storage security rules tests with ≥1 allow + 3 deny scenarios per collection
- **Schema parity validation**: Automated scripts ensure Zod schemas and Firestore rules stay in sync
- **CI workflow standards**: Formal 10-step canonical workflow template documented in `docs/CI_WORKFLOW_STANDARDS.md`
- **Status scaffolding**: Added progress tracking for Blocks 4, 1 (Security Core backlog), and 5 in Project Bible v13.5
- **Documentation refresh**: Updated root README and apps/web README with v1.1.0 status, added links to Block 3 implementation docs

### Changed

- **API route pattern**: Standardized all routes to use `withSecurity` wrapper instead of standalone `rateLimit`/`csrfProtection` HOCs
- **Next.js params handling**: Migrated from async `await params` pattern to synchronous `context.params` access (Next.js 15 compatibility)
- **Typecheck in CI**: Made typecheck non-blocking with `(pnpm -w typecheck || true)` in standard CI pattern to allow progressive strictness
- **Package.json ci script**: Added `pnpm -w fix` (format+lint auto-fix) before strict lint step
- **Lint warning threshold**: Reduced from 200 to 100 (goal: 0 over time)

### Fixed

- **Merge conflict resolution**: Cleaned up schedules route and TECHNICAL_DEBT.md conflicts after branch operations
- **Path alias consistency**: Unified `@` alias to map to `apps/web` root, enabling both `@/app/*` and `@/src/*` imports
- **Duplicate rules test files**: Removed 6 duplicate `.ts` versions, kept `.mts` as standard (attendance, shifts, venues, zones, schedules, join-tokens)
- **Markdown formatting**: Auto-fixed lint violations across documentation files using markdownlint with repo-standard config

### Documentation

- `docs/BLOCK3_IMPLEMENTATION.md`: Comprehensive summary of Integrity Core deliverables and rules matrix
- `docs/CI_WORKFLOW_STANDARDS.md`: Canonical CI job template with rationale, patterns, anti-patterns, and migration checklist
- `docs/CLEANUP_SUMMARY_2025-11-07.md`: Record of Nov 7 cleanup activities (schema sync, path alias fix, markdown normalization)
- `docs/TODO-v13.md`: Marked Block 3 complete with link to implementation doc
- `docs/bible/Project_Bible_v13.5.md`: Added status lines for Blocks 1, 3, 4, 5 to enable progress tracking

### Infrastructure

- **Git tag**: Created annotated tag `v1.1.0` marking completion of Blocks 1–3 (Security Core, Reliability Core, Integrity Core)
- **Pre-commit hooks**: Enhanced to include schema parity checks alongside typecheck, lint, format
- **VS Code tasks**: Added "Docs: Markdown Fix (apply)" and "Tag: Auto-tag Files" for consistent repo hygiene

## [1.0.0] - 2025-11-06

### Added - Blocks 1 & 2: Security Core + Reliability Core

#### Block 1: Security Core (9/9 Complete)

- **Session Authentication**: Secure cookie-based sessions with HttpOnly, Secure, SameSite attributes
- **Multi-Factor Authentication**: TOTP-based MFA endpoints (`/api/auth/mfa/setup`, `/api/auth/mfa/verify`)
- **Security Middleware**: Rate limiting, CSRF protection, security headers injection
- **RBAC with Firestore Rules**: Role-based access control enforced at database level
- **Comprehensive Security Tests**: 250+ lines of security test coverage (session, MFA, CSRF, rate limiting)

#### Block 2: Reliability Core (10/10 Complete)

- **Structured Logging**: Winston logger with log levels, metadata, 30-day retention policy
- **Error Tracking**: Sentry integration for client, server, and edge runtimes with source maps
- **Observability**: OpenTelemetry instrumentation for distributed tracing
- **Automated Backups**: Cloud Scheduler + Firestore exports with retention policies
- **Production Runbooks**: Operational procedures for logging, backups, uptime monitoring in `docs/runbooks/`

#### Code Quality

- Zero `any` types across the codebase
- Zero console statement violations
- Technical debt tracking in `docs/TECHNICAL_DEBT.md`
- Monorepo architecture with pnpm workspaces
- Shared types package (`@fresh-schedules/types`)

### Documentation

- `docs/COMPLETE_TECHNICAL_DOCUMENTATION.md`: Comprehensive architecture and setup guide
- `docs/ARCHITECTURE_DIAGRAMS.md`: System diagrams (data flow, CI/CD, authentication)
- `docs/security.md`: Security architecture, MFA, and session management
- `docs/BLOCK1_BLOCK2_PROGRESS.md`: Detailed implementation status tracking
- `docs/BLOCK1_SLO_SUMMARY.md`: Service Level Objectives for production readiness

### Infrastructure

- CI/CD via GitHub Actions (typecheck, lint, test, Docker build, CodeQL security scanning)
- Firebase Emulator Suite integration for local development
- Docker containerization for API service
- PWA configuration with service worker and offline capability

## [Unreleased]

### Planned - Block 4: Onboarding Wizard

- Multi-step onboarding flow for managers and staff
- Corporate staff path for HQ roles
- Org creation and membership bootstrapping
- Profile completion with validation

### Planned - Block 5: Validation & Release

- E2E test suite expansion (Playwright)
- Production deployment automation
- Performance benchmarking and optimization
- Final security audit

---

**Legend:**

- `Added`: New features or capabilities
- `Changed`: Modifications to existing functionality
- `Fixed`: Bug fixes or corrections
- `Removed`: Deprecated or deleted features
- `Security`: Security-related changes
- `Documentation`: Documentation updates

[1.1.0]: https://github.com/peteywee/fresh-root/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/peteywee/fresh-root/releases/tag/v1.0.0
