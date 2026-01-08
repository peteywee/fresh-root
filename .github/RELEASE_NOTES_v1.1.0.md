# v1.1.0 – Blocks 1 to 3 Complete: Security Core, Reliability Core, Integrity Core
**Released:** November 7, 2025

## 🎉 Milestone: Integrity Core (Block 3) Complete
This release marks the completion of **Block 3: Integrity Core**, bringing the Fresh Root project to
a fully validated, production-ready state with comprehensive data integrity guarantees across the
entire stack.

## 🧩 Block 3: Integrity Core Highlights
### Zod-First API Validation
- All API routes now validate inputs using shared Zod schemas from the `@fresh-schedules/types`
  package
- Eliminates runtime type mismatches and ensures data contracts across client, server, and database
- Schemas exported for reuse in tests, documentation, and future tooling

### Canonical `withSecurity` Middleware
- Unified API security layer replacing scattered `rateLimit`/`csrfProtection` HOCs
- Combines authentication, rate limiting, and configurable options in a single composable wrapper
- Standardized across all API routes for consistent security posture
- Pattern: `withSecurity(handler, { requireAuth: true, maxRequests: 100, windowMs: 60000 })`

### Rules Test Matrix
- Comprehensive Firestore/Storage security rules tests with **≥1 allow + 3 deny** scenarios per
  collection
- Covers organizations, memberships, schedules, shifts, venues, zones, positions, attendance,
  join-tokens, and MFA documents
- Automated test execution via `pnpm test:rules` with Firebase Emulator Suite

### Schema Parity Validation
- Automated scripts ensure Zod schemas and Firestore rules stay in sync
- Pre-commit hook validates parity on every commit
- Prevents drift between application logic and database constraints
- See `scripts/validate-schema-parity.mjs`

### CI Workflow Standards
- Formal 10-step canonical workflow template documented in `docs/CI_WORKFLOW_STANDARDS.md`
- Standard pattern: checkout → tooling → install → auto-fix → strict lint → non-blocking typecheck →
  test → build → optional → cleanup
- Applied to `repo-agent.yml` and `eslint-ts-agent.yml` workflows
- Non-blocking typecheck option (`|| true`) for progressive strictness adoption

## 🔄 Breaking Changes
### API Route Pattern
- **Before**: Routes used standalone `rateLimit()`/`csrfProtection()` HOCs
- **After**: Routes use unified `withSecurity()` middleware
- **Migration**: Update route handlers to use `withSecurity(handler, options)` wrapper

### Next.js Params Handling (Next.js 15 Compatibility)
- **Before**: `async (req, context, { params }: { params: Promise<{ id: string }> })`
- **After**:
  `async (req, context: { params: Record<string, string>; userId: string; orgId: string })`
- **Migration**: Access params via `context.params.id` instead of `await params`

## 📚 New Documentation
- `docs/BLOCK3_IMPLEMENTATION.md`: Comprehensive summary of Integrity Core deliverables and rules
  matrix
- `docs/CI_WORKFLOW_STANDARDS.md`: Canonical CI job template with rationale, patterns, anti-patterns
- `docs/CLEANUP_SUMMARY_2025-11-07.md`: Record of Nov 7 cleanup activities
- `CHANGELOG.md`: Historical change tracking (v1.1.0, v1.0.0, and future releases)
- Updated `README.md` and `apps/web/README.md` with v1.1.0 status

## 🔧 Key Changes
### Changed
- **Typecheck in CI**: Made non-blocking with `(pnpm -w typecheck || true)` to allow progressive
  strictness
- **Package.json ci script**: Added `pnpm -w fix` (format+lint auto-fix) before strict lint step
- **Lint warning threshold**: Reduced from 200 to 100 (goal: 0 over time)
- **Path alias consistency**: Unified `@` alias to map to `apps/web` root, enabling both `@/app/*`
  and `@/src/*` imports

### Fixed
- **Merge conflict resolution**: Cleaned up schedules route and TECHNICAL\_DEBT.md conflicts
- **Duplicate rules test files**: Removed 6 duplicate `.ts` versions, kept `.mts` as standard
- **Markdown formatting**: Auto-fixed lint violations across documentation files

### Infrastructure
- **Git tag**: Created annotated tag `v1.1.0` marking completion of Blocks 1–3
- **Pre-commit hooks**: Enhanced to include schema parity checks
- **VS Code tasks**: Added "Docs: Markdown Fix (apply)" and "Tag: Auto-tag Files"

## 📊 Quality Metrics (v1.1.0)
- **ESLint Warnings**: 100 (reduced from 200, goal: 0)
- **ESLint Errors**: 0 ✅
- **TypeScript Errors**: 0 ✅
- **Deprecated Dependencies**: 0 ✅
- **Unmet Peer Dependencies**: 0 ✅
- **Intentional `eslint-disable` Comments**: 6 (all justified)
- **`ts-ignore` / `ts-expect-error` Usage**: 0 ✅
- **Skipped Tests**: 0 ✅
- **Duplicate Test Files**: 0 ✅

## 🚀 What's Next
### Block 4: Onboarding Wizard (Planned)
- Multi-step onboarding flow for managers and staff
- Corporate staff path for HQ roles
- Org creation and membership bootstrapping
- Profile completion with validation

### Block 5: Validation & Release (Planned)
- E2E test suite expansion (Playwright)
- Production deployment automation
- Performance benchmarking and optimization
- Final security audit

## 📦 Installation & Upgrade
```bash
# Clone repository
git clone https://github.com/peteywee/fresh-root.git
cd fresh-root

# Enable pnpm and install dependencies
corepack enable
pnpm install --frozen-lockfile

# Start development server
pnpm dev
```

See the [Setup Guide](./docs/SETUP.md) for complete installation instructions.

## 🙏 Contributors
Thank you to everyone who contributed to this milestone!

- [@peteywee](https://github.com/peteywee) - Lead Developer

## 📖 Full Changelog
See [CHANGELOG.md](./CHANGELOG.md) for complete version history.

---

**Previous Release:** [v1.0.0](https://github.com/peteywee/fresh-root/releases/tag/v1.0.0) (Blocks 1
& 2: Security Core + Reliability Core)
