# 3.1 - Zod Schema Foundation

e# Fresh Schedules v13 Plan C Milestone Checklist

🧱 Block 1 – Security Core (P0) ✅ COMPLETE

- [x] [BLOCK1] Implement session-cookie auth flow (/api/session, verifySessionCookie, clearSessionCookie)
  - [x] Create POST /api/session endpoint (accepts ID token, returns HttpOnly cookie)
  - [x] Create DELETE /api/session endpoint (clears session cookie)
  - [x] Add unit tests for session endpoints (apps/web/src/**tests**/session.test.ts)
- [x] [BLOCK1] Add requireSession middleware to all API routes
  - [x] Implement requireSession in apps/web/app/api/\_shared/middleware.ts
  - [x] Add OpenTelemetry spans and structured logging
  - [x] Apply to items, organizations, and other protected API routes
- [x] [BLOCK1] Add require2FAForManagers middleware for privileged writes
  - [x] Implement require2FAForManagers checking mfa=true custom claim
  - [x] Add OTel spans and Sentry user context
- [x] [BLOCK1] Enable MFA setup flow (POST /api/auth/mfa/setup, POST /api/auth/mfa/verify)
  - [x] Implement POST /api/auth/mfa/setup (TOTP secret + QR code generation)
  - [x] Implement POST /api/auth/mfa/verify (token verification + custom claim)
  - [x] Add unit tests for MFA endpoints (apps/web/src/**tests**/mfa.test.ts)
- [x] [BLOCK1] Create security.ts middleware stack (Helmet + rate limit + CORS + size cap)
  - [x] Implement Helmet, rate limiting, CORS, and body size limits
  - [x] Apply to all API routes
- [x] [BLOCK1] Add 401/403 security regression tests
  - [x] Create apps/web/src/**tests**/api-security.spec.ts (17 test cases)
- [x] [BLOCK1] Remove all legacy token-based write endpoints (pure client writes)
  - [x] Verified no direct client writes remain; all go through API routes
- [x] [BLOCK1] Verify Firestore rules enforce role-based access
  - [x] Confirmed rules check roles (owner/manager/member)
  - [x] Documented that MFA enforcement is at API middleware layer
  - [x] Created tests/rules/mfa.spec.ts documenting the pattern
- [x] [BLOCK1] Document the cookie / MFA flow in docs/security.md
  - [x] Created comprehensive docs/security.md (200+ lines)
  - [x] Documented auth flow, MFA setup/verify, security properties, endpoints

⚙️ Block 2 – Reliability Core (P1) ✅ COMPLETE

- [x] [BLOCK2] Implement shared JSON logger (lib/log.ts) → includes reqId, latencyMs, uid, orgId
  - [x] Create apps/web/src/lib/logger.ts with Logger class
  - [x] Add LogLevel enum, child logger pattern, withLatency helper
  - [x] Add reqId, latencyMs, uid, orgId fields to log entries
  - [x] Integrate logger into API middleware (requireSession, require2FAForManagers)
  - [x] Colorized dev output, JSON production output
- [x] [BLOCK2] Wire Sentry in both frontend and API with release, environment, user.id
  - [x] Install @sentry/nextjs (10.23.0) in apps/web
  - [x] Create sentry.client.config.ts (session replay 10%, 100% on error)
  - [x] Create sentry.server.config.ts
  - [x] Create sentry.edge.config.ts
  - [x] Update apps/web/src/lib/error/reporting.ts to use Sentry SDK
  - [x] Add setUserContext/clearUserContext/addBreadcrumb helpers
  - [x] Integrate Sentry user context in middleware
- [x] [BLOCK2] Add OpenTelemetry traces (@opentelemetry SDK + spans in middleware)
  - [x] Install @opentelemetry/api, sdk-node, auto-instrumentations-node
  - [x] Create apps/web/instrumentation.ts with NodeSDK initialization
  - [x] Configure OTLP HTTP exporter (fallback to console in dev)
  - [x] Add resource attributes (service name, environment, version)
  - [x] Add spans in requireSession and require2FAForManagers middleware
  - [x] Create apps/web/src/lib/otel.ts with withSpan helper
- [x] [BLOCK2] Create scripts/ops/backup-firestore.sh wrapping gcloud firestore export
  - [x] Script already existed at scripts/ops/backup-firestore.sh
  - [x] Verified script parameters and functionality
- [x] [BLOCK2] Add docs/runbooks/restore.md describing restore procedure
  - [x] Created comprehensive restore documentation
  - [x] Included gcloud firestore import commands and prerequisites
  - [x] Added troubleshooting section for common restore issues
- [x] [BLOCK2] Schedule daily Firestore export via Cloud Scheduler
  - [x] Create internal backup endpoint (apps/web/app/api/internal/backup/route.ts)
  - [x] Secure with BACKUP_CRON_TOKEN header
  - [x] Use Firestore Admin REST API for export
  - [x] Add scheduler script (scripts/ops/create-backup-scheduler.sh)
  - [x] Document setup (docs/runbooks/backup-scheduler.md)
- [x] [BLOCK2] Add function log retention policy (7 days → Cloud Storage)
  - [x] Create scripts/ops/logging-setup.sh (retention bucket + GCS export sink)
  - [x] Document retention setup (docs/runbooks/logging-retention.md)
- [x] [BLOCK2] Add uptime alerts → Email
  - [x] Create scripts/ops/uptime-alert-policy.json (alert policy template)
  - [x] Add scripts/ops/create-uptime-check.sh (uptime check creation)
  - [x] Add scripts/ops/create-uptime-alert.sh (alert policy creation)
  - [x] Document setup (docs/runbooks/uptime-alerts.md)
- [x] [BLOCK2] Health endpoint
  - [x] Verified apps/web/app/api/health/route.ts exists (basic implementation)
- [x] [BLOCK2] Metrics endpoint
  - [x] Verified apps/web/app/api/metrics/route.ts exists
  - [x] Note: recordRequest() defined but not called (superseded by OpenTelemetry auto-instrumentation)

🧩 Block 3 – Integrity Core (P1)

## 3.1 - Zod Schema Foundation ✅ COMPLETE

- [x] [BLOCK3.1] Expand packages/types/ with comprehensive Zod schemas
  - [x] Create `packages/types/src/organizations.ts` with Zod schemas

```text
- [x] Define `OrganizationSchema` (id, name, createdAt, updatedAt, settings)
- [x] Define `OrganizationCreateSchema` (input validation for creation)
- [x] Define `OrganizationUpdateSchema` (partial updates)
- [x] Export TypeScript types from Zod schemas
```

- [x] Create `packages/types/src/memberships.ts` with Zod schemas

```text
- [x] Define `MembershipSchema` (orgId, uid, role, joinedAt, mfaVerified)
- [x] Define `MembershipCreateSchema` (input validation)
- [x] Define role enum: owner, admin, manager, member, staff
```

- [x] Create `packages/types/src/positions.ts` with Zod schemas

```text
- [x] Define `PositionSchema` (id, orgId, title, description, hourlyRate)
- [x] Define `PositionCreateSchema` and `PositionUpdateSchema`
```

- [x] Create `packages/types/src/schedules.ts` with Zod schemas

```text
- [x] Define `ScheduleSchema` (id, orgId, name, startDate, endDate, status)
- [x] Define `ScheduleCreateSchema` and `ScheduleUpdateSchema`
- [x] Define schedule status enum: draft, published, archived
```

- [x] Create `packages/types/src/shifts.ts` with Zod schemas

```text
- [x] Define `ShiftSchema` (id, scheduleId, positionId, uid, startTime, endTime, breakMinutes)
- [x] Define `ShiftCreateSchema` and `ShiftUpdateSchema`
- [x] Add validation rules (startTime < endTime, breakMinutes >= 0)
```

- [x] Update `packages/types/src/index.ts` to export all new schemas

### 3.2 - API Validation Layer

- [x] [BLOCK3.2] Add request/response validation to all API routes
  - [x] Create `apps/web/src/lib/api/validation.ts` middleware

```text
- [x] `validateRequest` helper (accepts Zod schema, returns 422 on error)
- [x] `ValidationError` class with detailed field-level errors
- [x] Request body size validation (max 1MB)
- [x] `withValidation` HOF for route handlers
- [x] Common query schemas (pagination, sorting, dateRange)
```

- [x] Create unit tests at `apps/web/src/lib/api/validation.test.ts`
- **Status**: Middleware complete, ready for integration into API routes

- [x] Apply validation to Organizations API

```text
- [x] Update `POST /api/organizations` with `OrganizationCreateSchema`
- [x] Update `PATCH /api/organizations/[id]` with `OrganizationUpdateSchema`
- [ ] Add unit tests for validation errors
```

- [x] Apply validation to Memberships API

```text
- [x] Create `POST /api/organizations/[id]/members` with `MembershipCreateSchema`
- [x] Create `PATCH /api/organizations/[id]/members/[memberId]` with `MembershipUpdateSchema`
- [x] Add role validation (only owners/admins can assign manager role)
- [ ] Add unit tests for RBAC validation
```

- [x] Apply validation to Positions API

```text
- [x] Create `POST /api/positions` with `PositionCreateSchema`
- [x] Create `PATCH /api/positions/[id]` with `PositionUpdateSchema`
- [ ] Add unit tests
```

- [x] Apply validation to Schedules API

```text
- [x] Update `POST /api/schedules` with `ScheduleCreateSchema`
- [x] Update `PATCH /api/schedules/[id]` with `ScheduleUpdateSchema`
- [x] Validate date range logic (startDate <= endDate) - in schema refinement
- [ ] Add unit tests
```

- [x] Apply validation to Shifts API

```text
- [x] Create `POST /api/shifts` with `ShiftCreateSchema`
- [x] Create `PATCH /api/shifts/[id]` with `ShiftUpdateSchema`
- [x] Validate time range and break logic - in schema refinement
- [ ] Add conflict detection (overlapping shifts for same user) - TODO in production
- [ ] Add unit tests
```

### 3.2.1 - Security Hardening (Critical)

> **Status**: ✅ COMPLETE - All security middleware implemented and tested
> **Completion Date**: 2025-01-XX
> **See**: `docs/SECURITY_ASSESSMENT.md` for full security audit

- [x] [SECURITY-PHASE1] Implement critical security layers

```text
- [x] Create authorization middleware (`apps/web/src/lib/api/authorization.ts`)
  - [x] `requireOrgMembership` - verify user belongs to organization
  - [x] `requireRole` - enforce RBAC (org_owner > admin > manager > scheduler > staff)
  - [x] `canAccessResource` - combined membership + role check helper
  - [x] `extractOrgId` - parse orgId from URL/query params
  - [x] Unit tests (14 tests) - authorization.test.ts

- [x] Create rate limiting middleware (`apps/web/src/lib/api/rate-limit.ts`)
  - [x] In-memory rate limiter with sliding window
  - [x] Per-IP and per-user rate limiting
  - [x] Preset limits: STRICT (10/min), STANDARD (100/min), WRITE (30/min), AUTH (5/min)
  - [x] 429 responses with Retry-After headers
  - [x] Rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
  - [x] Unit tests (9 tests) - rate-limit.test.ts

- [x] Create CSRF protection middleware (`apps/web/src/lib/api/csrf.ts`)
  - [x] Double-submit cookie pattern
  - [x] Timing-safe token comparison
  - [x] Protect POST/PUT/PATCH/DELETE operations
  - [x] Custom cookie/header names support
  - [x] SameSite=Strict, HttpOnly, Secure cookies
  - [x] Unit tests (15 tests) - csrf.test.ts

- [x] Create input sanitization utilities (`apps/web/src/lib/api/sanitize.ts`)
  - [x] HTML escaping (XSS prevention)
  - [x] URL sanitization (block javascript:, data: protocols)
  - [x] Recursive object sanitization
  - [x] Email/phone sanitization
  - [x] SQL/NoSQL injection prevention helpers
  - [x] Path traversal prevention
  - [x] Command injection prevention
```

- [ ] Apply security middleware to API routes

```text
- [ ] Add `requireOrgMembership` to all org-scoped routes
- [ ] Add `requireRole("admin")` to organization management routes
- [ ] Add `requireRole("manager")` to position/schedule/shift management routes
- [ ] Add `rateLimit(RateLimits.WRITE)` to all POST/PUT/PATCH/DELETE routes
- [ ] Add `rateLimit(RateLimits.AUTH)` to auth routes
- [ ] Add `csrfProtection()` to all state-changing routes
- [ ] Add input sanitization to user-generated content fields
```

- [ ] Integration tests for security

```text
- [ ] Test cross-org access denial (user cannot access other org's data)
- [ ] Test role enforcement (staff cannot create schedules)
- [ ] Test rate limiting (429 after threshold)
- [ ] Test CSRF protection (403 without valid token)
```

### 3.3 - Firestore Rules Test Matrix

- [ ] [BLOCK3.3] Write rules test matrix (≥ 1 allow + 3 denies per collection)
  - [ ] Create `tests/rules/organizations.spec.ts`

```text
- [ ] Test allow: member can read org
- [ ] Test deny: unauthenticated cannot read org
- [ ] Test deny: non-member cannot read org
- [ ] Test deny: member cannot update org (only managers)
- [ ] Test allow: manager can update org
```

- [ ] Create `tests/rules/memberships.spec.ts`

```text
- [ ] Test allow: member can read own membership
- [ ] Test allow: member can read other memberships in same org
- [ ] Test deny: cannot read memberships from other orgs
- [ ] Test deny: member cannot update membership role (only managers)
- [ ] Test allow: manager can update membership role
```

- [ ] Create `tests/rules/positions.spec.ts`

```text
- [ ] Test allow: member can read positions in their org
- [ ] Test deny: cannot read positions from other orgs
- [ ] Test deny: staff cannot create/update positions (only managers)
- [ ] Test allow: manager can create/update positions
```

- [ ] Create `tests/rules/schedules.spec.ts`

```text
- [ ] Test allow: member can read schedules in their org
- [ ] Test deny: cannot read schedules from other orgs
- [ ] Test deny: staff cannot publish schedules (only managers)
- [ ] Test allow: manager can create/update/publish schedules
- [ ] Test deny: cannot modify archived schedules
```

- [ ] Create `tests/rules/shifts.spec.ts`

```text
- [ ] Test allow: member can read shifts in their org's schedules
- [ ] Test deny: cannot read shifts from other orgs
- [ ] Test deny: staff cannot assign shifts to others (only managers)
- [ ] Test allow: manager can create/update/delete any shift
- [ ] Test allow: staff can update their own shift notes/checkIn
```

- [ ] Run all rules tests with Firebase emulator

```text
- [ ] Add `pnpm test:rules` script to package.json
- [ ] Ensure CI runs rules tests on every PR
- [ ] Add coverage reporting for rules tests
```

### 3.4 - Schema Validation Tests

- [ ] [BLOCK3.4] Add unit tests for Zod validators
  - [ ] Create `packages/types/src/__tests__/organizations.test.ts`

```text
- [ ] Test valid organization creation
- [ ] Test invalid organization (missing required fields)
- [ ] Test invalid types (wrong field types)
- [ ] Test string length limits (name min/max)
```

- [ ] Create `packages/types/src/__tests__/memberships.test.ts`

```text
- [ ] Test valid membership creation
- [ ] Test invalid role values
- [ ] Test required field validation
```

- [ ] Create `packages/types/src/__tests__/positions.test.ts`

```text
- [ ] Test valid position creation
- [ ] Test hourlyRate validation (must be positive number)
- [ ] Test string field limits
```

- [ ] Create `packages/types/src/__tests__/schedules.test.ts`

```text
- [ ] Test valid schedule creation
- [ ] Test date range validation (startDate <= endDate)
- [ ] Test status enum validation
```

- [ ] Create `packages/types/src/__tests__/shifts.test.ts`

```text
- [ ] Test valid shift creation
- [ ] Test time range validation (startTime < endTime)
- [ ] Test breakMinutes validation (>= 0, < shift duration)
- [ ] Test overlapping shift detection logic
```

- [ ] Add test coverage reporting

```text
- [ ] Configure Vitest coverage for packages/types
- [ ] Aim for ≥ 90% coverage on Zod schemas
- [ ] Add coverage badge to README
```

### 3.5 - Schema Parity & Documentation

- [ ] [BLOCK3.5] Add migration-check script validating schema parity vs rules
  - [ ] Create `scripts/validate-schema-parity.mjs`

```text
- [ ] Parse Firestore rules to extract collection names
- [ ] Parse Zod schemas to extract schema names
- [ ] Compare and report mismatches
- [ ] Check that every collection has corresponding Zod schema
- [ ] Check that every Zod schema has corresponding rules tests
```

- [ ] Add as pre-push git hook

```text
- [ ] Update `.husky/pre-push` to run parity check
- [ ] Fail push if parity check fails
```

- [ ] Run in CI pipeline

```text
- [ ] Add to `.github/workflows/ci.yml`
- [ ] Block PR merge if parity check fails
```

- [ ] [BLOCK3.6] Create schema index doc (docs/schema-map.md)
  - [ ] Document all collections and their schemas

```text
- [ ] `/organizations` → `OrganizationSchema`
- [ ] `/organizations/{orgId}/members` → `MembershipSchema`
- [ ] `/positions` → `PositionSchema`
- [ ] `/schedules` → `ScheduleSchema`
- [ ] `/shifts` → `ShiftSchema`
```

- [ ] Document validation rules per collection
- [ ] Document RBAC requirements (who can read/write)
- [ ] Add schema evolution guidelines
- [ ] Add examples of valid payloads

### 3.7 - Pre-commit Quality Gates

- [ ] [BLOCK3.7] Add pre-commit hook enforcing quality checks
  - [ ] Update `.husky/pre-commit` script

```text
- [ ] Run `pnpm typecheck` (already exists)
- [ ] Run `pnpm lint` (already exists)
- [ ] Add `pnpm test:schemas` (new - runs Zod schema tests only)
- [ ] Ensure all checks pass before allowing commit
```

- [ ] Document pre-commit hooks in CONTRIBUTING.md
- [ ] Add troubleshooting section for hook failures

🎨 Block 4 – Experience Layer (P1)

### 4.0 - UX Planning & Strategy

- [ ] [BLOCK4.0] Create comprehensive UX plan document
  - [ ] Define UX principles and design philosophy
  - [ ] Document user personas and roles (Manager, Staff, Corporate)
  - [ ] Map critical user journeys (≤5-minute scheduling flow)
  - [ ] Create complete component inventory (atomic + composite)
  - [ ] Define interaction patterns (drag-drop, bulk ops, inline editing)
  - [ ] Establish WCAG 2.1 AA accessibility standards
  - [ ] Set performance budgets (Core Web Vitals, bundle sizes)
  - [ ] Design mobile-first experience with PWA capabilities
  - [ ] Define success metrics and KPIs
  - [ ] Create 10-week implementation roadmap
  - **Deliverable**: `docs/UX_PLAN.md` (comprehensive UX strategy document)
  - **Status**: Draft v1.0 created, needs review and refinement

### 4.1 - Design System Foundation

- [ ] [BLOCK4.1] Build comprehensive design system
  - [ ] Create design tokens in `apps/web/tailwind.config.ts`

```text
- [ ] Define color palette (primary, secondary, accent, neutral, semantic)
- [ ] Define typography scale (font sizes, weights, line heights)
- [ ] Define spacing scale (consistent margins, padding, gaps)
- [ ] Define border radius values (sm, md, lg, xl)
- [ ] Define shadow levels (sm, md, lg, xl)
- [ ] Define breakpoints (mobile, tablet, desktop, wide)
```

- [ ] Expand `apps/web/components/ui/` component library

```text
- [ ] Create `Badge.tsx` (status indicators, counts)
- [ ] Create `Dialog.tsx` (modal dialogs, confirmations)
- [ ] Create `Select.tsx` (dropdown select, multi-select)
- [ ] Create `Checkbox.tsx` and `Radio.tsx` (form inputs)
- [ ] Create `Toast.tsx` (notifications, alerts)
- [ ] Create `Tooltip.tsx` (contextual help)
- [ ] Create `Skeleton.tsx` (loading states)
- [ ] Create `Tabs.tsx` (tabbed navigation)
- [ ] Create `Accordion.tsx` (collapsible sections)
```

- [ ] Add component documentation

```text
- [ ] Create Storybook setup for component showcase
- [ ] Document props and usage for each component
- [ ] Add interactive examples
```

- [ ] Implement dark mode support

```text
- [ ] Add dark mode variants to all components
- [ ] Create theme toggle component
- [ ] Persist user theme preference
```

### 4.2 - Week Grid Scheduler

- [ ] [BLOCK4.2] Implement virtualized Week Grid with advanced features
  - [ ] Create `components/scheduler/WeekGrid.tsx`

```text
- [ ] Implement virtual scrolling for rows (handle 1000+ shifts)
- [ ] Add sticky header with date columns
- [ ] Add sticky budget row showing hours/costs
- [ ] Implement drag-and-drop shift creation
- [ ] Implement drag-and-drop shift reassignment
```

- [ ] Add keyboard accessibility

```text
- [ ] Arrow keys for cell navigation
- [ ] Enter/Space for shift selection
- [ ] Tab for focus management
- [ ] Escape to cancel operations
- [ ] Shift+Arrow for multi-select
```

- [ ] Add shift conflict detection

```text
- [ ] Visual indicators for overlapping shifts
- [ ] Real-time validation on drag/drop
- [ ] Warnings for overtime rules
```

- [ ] Implement shift templates

```text
- [ ] Save common shift patterns
- [ ] Quick-apply templates to multiple days
- [ ] Template management UI
```

- [ ] Add bulk operations

```text
- [ ] Multi-select shifts
- [ ] Bulk delete, copy, move operations
- [ ] Undo/redo support
```

### 4.3 - Performance Optimization

- [ ] [BLOCK4.3] Add Lighthouse workflow and performance benchmarks
  - [ ] Create `.github/workflows/lighthouse.yml`

```text
- [ ] Run Lighthouse CI on every PR
- [ ] Test key pages: login, dashboard, week grid, month view
- [ ] Enforce thresholds: ≥90 overall, ≥95 accessibility
- [ ] Upload reports as GitHub artifacts
```

- [ ] Optimize bundle size

```text
- [ ] Implement code splitting for routes
- [ ] Lazy load heavy components (Calendar, WeekGrid)
- [ ] Tree-shake unused dependencies
- [ ] Analyze bundle with webpack-bundle-analyzer
```

- [ ] Optimize rendering performance

```text
- [ ] Implement React.memo for expensive components
- [ ] Use useMemo/useCallback to prevent re-renders
- [ ] Virtualize long lists (shifts, users, positions)
```

- [ ] Add performance monitoring

```text
- [ ] Instrument with Web Vitals (LCP, FID, CLS)
- [ ] Add custom performance marks for key operations
- [ ] Report to analytics/monitoring service
```

- [ ] [BLOCK4.4] Benchmark critical user journeys
  - [ ] Set performance budgets

```text
- [ ] TTI (Time to Interactive) ≤ 2.5s on 3G
- [ ] MonthView initial render < 200ms
- [ ] WeekGrid scroll performance ≥ 55 FPS with 1k rows
- [ ] Shift creation interaction latency < 100ms
```

- [ ] Create performance test suite

```text
- [ ] Use Playwright for E2E performance tests
- [ ] Measure and assert on performance metrics
- [ ] Run performance tests in CI
```

- [ ] Add performance regression detection

```text
- [ ] Compare metrics against baseline
- [ ] Fail CI if performance degrades > 10%
- [ ] Store historical performance data
```

### 4.4 - UX Metrics & Sub-5-Minute KPI

- [ ] [BLOCK4.5] Instrument UX metrics for scheduling KPI
  - [ ] Define sub-5-minute scheduling flow

```text
- [ ] Start: User lands on schedule page
- [ ] End: Schedule published successfully
- [ ] Track intermediate steps (positions, shifts, validation)
```

- [ ] Add analytics instrumentation

```text
- [ ] Track time per scheduling step
- [ ] Track errors and retries
- [ ] Track feature usage (templates, bulk ops, conflicts)
```

- [ ] Create UX dashboard

```text
- [ ] Visualize scheduling time distribution
- [ ] Show completion rates
- [ ] Identify bottlenecks and pain points
```

- [ ] Add user feedback collection

```text
- [ ] Post-schedule satisfaction survey
- [ ] In-app feedback widget
- [ ] Track Net Promoter Score (NPS)
```

### 4.5 - Offline Support & PWA

- [ ] [BLOCK4.6] Integrate offline cache + IndexedDB
  - [ ] Implement service worker caching strategy

```text
- [ ] Cache-first for static assets
- [ ] Network-first for API calls with fallback
- [ ] Background sync for failed mutations
```

- [ ] Add IndexedDB integration

```text
- [ ] Store schedules for offline viewing
- [ ] Queue mutations when offline
- [ ] Sync queued changes when online
```

- [ ] Implement offline UI indicators

```text
- [ ] Show offline status banner
- [ ] Indicate which data is stale/cached
- [ ] Show sync progress
```

- [ ] Test offline scenarios

```text
- [ ] Create E2E tests for offline mode
- [ ] Test CheckIn form offline sync (already verified)
- [ ] Test conflict resolution on reconnect
```

- [ ] [BLOCK4.7] Enhance PWA capabilities
  - [ ] Update PWA manifest (`public/manifest.json`)

```text
- [ ] Add app icons (192x192, 512x512)
- [ ] Configure display mode (standalone)
- [ ] Set theme colors
- [ ] Define shortcuts (quick actions)
```

- [ ] Implement install prompt

```text
- [ ] Detect when PWA is installable
- [ ] Show custom install prompt UI
- [ ] Track install events
```

- [ ] Add PWA-specific features

```text
- [ ] Share target API (share schedules)
- [ ] Push notifications (schedule reminders)
- [ ] Badge API (unread notifications)
```

- [ ] Test PWA functionality

```text
- [ ] Create E2E tests for install flow
- [ ] Test on mobile devices (iOS, Android)
- [ ] Validate PWA criteria with Lighthouse
```

### 4.6 - UI Documentation

- [ ] [BLOCK4.8] Document UI style guide
  - [ ] Create `docs/ui-guidelines.md`

```text
- [ ] Document design principles (consistency, accessibility, performance)
- [ ] Document component usage guidelines
- [ ] Document spacing and layout patterns
- [ ] Document color usage and accessibility
- [ ] Document typography hierarchy
```

- [ ] Add component composition examples

```text
- [ ] Show common UI patterns (forms, lists, cards)
- [ ] Demonstrate responsive layouts
- [ ] Show loading and error states
```

- [ ] Document accessibility requirements

```text
- [ ] ARIA label guidelines
- [ ] Keyboard navigation patterns
- [ ] Screen reader considerations
- [ ] Color contrast requirements (WCAG AA/AAA)
```

🚀 Block 5 – Validation & Release (P1→P2)

### 5.1 - End-to-End Testing

- [ ] [BLOCK5.1] Write comprehensive Playwright E2E test suite
  - [ ] Create happy-path test spec

```text
- [ ] Test: User authentication flow
- [ ] Sign up with email/password
- [ ] Verify email (if required)
- [ ] Sign in with existing account
- [ ] Sign out successfully
- [ ] Test: Organization onboarding
- [ ] Create new organization
- [ ] Set organization details
- [ ] Invite team members
- [ ] Verify member receives invitation
- [ ] Test: Schedule creation workflow
- [ ] Create new schedule
- [ ] Add positions (at least 3)
- [ ] Add shifts for multiple days
- [ ] Use shift templates
- [ ] Handle shift conflicts
- [ ] Test: Schedule publishing
- [ ] Validate schedule completeness
- [ ] Publish schedule
- [ ] Verify notifications sent
- [ ] View published schedule as staff member
```

- [ ] Add error scenario tests

```text
- [ ] Test validation errors (invalid inputs)
- [ ] Test network failures (offline mode)
- [ ] Test permission denials (unauthorized actions)
- [ ] Test conflict resolution
```

- [ ] Add mobile viewport tests

```text
- [ ] Run all tests on mobile screen sizes
- [ ] Test touch interactions
- [ ] Test responsive layouts
```

- [ ] Add cross-browser tests

```text
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile browsers (iOS Safari, Chrome Android)
```

### 5.2 - CI/CD Integration

- [ ] [BLOCK5.2] Add E2E testing to CI pipeline
  - [ ] Update `.github/workflows/ci.yml`

```text
- [ ] Add E2E test job
- [ ] Run after unit tests pass
- [ ] Use Playwright container or GitHub Actions
- [ ] Set timeout (max 30 minutes)
```

- [ ] Configure Firebase emulators for E2E

```text
- [ ] Start emulators before tests
- [ ] Seed test data
- [ ] Clean up after tests
```

- [ ] Add CI gate for deployments

```text
- [ ] Block deploy if E2E tests fail
- [ ] Require all tests pass on main branch
- [ ] Allow deploy preview for PRs (even if tests fail)
```

- [ ] Upload test artifacts

```text
- [ ] Save screenshots on failure
- [ ] Save videos of test runs
- [ ] Upload Playwright trace files
- [ ] Generate and upload test reports
```

### 5.3 - Blue/Green Deployment

- [ ] [BLOCK5.3] Implement Blue/Green deployment strategy
  - [ ] Create deployment infrastructure

```text
- [ ] Set up staging environment (blue)
- [ ] Set up production environment (green)
- [ ] Configure load balancer for traffic switching
```

- [ ] Create deployment scripts

```text
- [ ] `scripts/ops/deploy-staging.sh`
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Report deployment status
- [ ] `scripts/ops/promote-to-production.sh`
- [ ] Switch traffic to new version
- [ ] Monitor error rates
- [ ] Auto-rollback if errors spike
```

- [ ] Implement smoke tests

```text
- [ ] Create `tests/smoke/` directory
- [ ] Test critical paths (auth, schedule CRUD)
- [ ] Run against staging before promotion
- [ ] Verify all health checks pass
```

- [ ] Add deployment monitoring

```text
- [ ] Track deployment frequency
- [ ] Track deployment success rate
- [ ] Track rollback frequency
- [ ] Alert on deployment failures
```

### 5.4 - Rollback & Recovery

- [ ] [BLOCK5.4] Add instant rollback capabilities
  - [ ] Create `scripts/ops/rollback.sh`

```text
- [ ] Switch traffic back to previous version
- [ ] Verify rollback success with health checks
- [ ] Log rollback event and reason
- [ ] Notify team of rollback
```

- [ ] Document rollback procedure

```text
- [ ] Add to `docs/release-runbook.md`
- [ ] List common rollback scenarios
- [ ] Define rollback decision criteria
- [ ] Document post-rollback actions
```

- [ ] Test rollback process

```text
- [ ] Practice rollback in staging
- [ ] Measure rollback time (target < 5 minutes)
- [ ] Verify no data loss during rollback
```

- [ ] Add rollback alerts

```text
- [ ] Alert on-call engineer
- [ ] Post to team Slack/Discord
- [ ] Create incident ticket
```

### 5.5 - Release Management

- [ ] [BLOCK5.5] Implement semantic versioning and changelogs
  - [ ] Set up semantic versioning

```text
- [ ] Define version format (MAJOR.MINOR.PATCH)
- [ ] Create git tags for releases (e.g., v1.0.0, v1.1.0)
- [ ] Automate version bumping with npm version
```

- [ ] Generate changelogs

```text
- [ ] Use conventional commits format
- [ ] Auto-generate CHANGELOG.md from commits
- [ ] Include breaking changes section
- [ ] Include migration guides when needed
```

- [ ] Create GitHub releases

```text
- [ ] Publish release notes on GitHub
- [ ] Attach build artifacts
- [ ] Link to deployed version
```

- [ ] Add release notes template

```text
- [ ] Define sections: Features, Fixes, Breaking Changes
- [ ] Include contributor acknowledgments
- [ ] Link to relevant issues/PRs
```

- [ ] [BLOCK5.6] Build release dashboard
  - [ ] Create release tracking page

```text
- [ ] Show current build number and commit
- [ ] Show active branch (main, staging, etc.)
- [ ] Show E2E test status
- [ ] Show deployment status
```

- [ ] Add release history

```text
- [ ] List recent deployments
- [ ] Show deployment duration
- [ ] Link to release notes
- [ ] Show rollback events
```

- [ ] Add health metrics

```text
- [ ] Show error rates (current vs baseline)
- [ ] Show response times
- [ ] Show uptime percentage
- [ ] Show active user count
```

### 5.6 - CI Artifact Management

- [ ] [BLOCK5.7] Upload Lighthouse and E2E reports as CI artifacts
  - [ ] Configure GitHub Actions artifact upload

```text
- [ ] Upload Lighthouse JSON reports
- [ ] Upload Lighthouse HTML reports
- [ ] Upload Playwright test reports
- [ ] Upload screenshots and videos
```

- [ ] Create artifact retention policy

```text
- [ ] Keep artifacts for 90 days
- [ ] Archive critical release artifacts permanently
```

- [ ] Add artifact download links to PRs

```text
- [ ] Comment on PR with artifact links
- [ ] Show performance comparison vs base branch
- [ ] Highlight regressions
```

### 5.7 - Release Documentation

- [ ] [BLOCK5.8] Create comprehensive release runbook
  - [ ] Write `docs/release-runbook.md`

```text
- [ ] Pre-release checklist
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Release process steps
- [ ] Create release branch
- [ ] Bump version
- [ ] Update changelog
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Promote to production
- [ ] Monitor for issues
- [ ] Post-release checklist
- [ ] Verify deployment
- [ ] Monitor error rates
- [ ] Announce release
- [ ] Update documentation
- [ ] Rollback procedure
- [ ] When to rollback
- [ ] How to rollback
- [ ] Post-rollback actions
- [ ] Incident response
- [ ] Define severity levels
- [ ] Escalation procedures
- [ ] Communication templates
```

🌐 Environment & Config

- [x] [env] Add unified env parser (lib/env.ts using Zod)
- [x] [env] Enforce NODE_ENV, SESSION_SECRET, GOOGLE_APPLICATION_CREDENTIALS_JSON, REDIS_URL, etc.
- [x] [env] Make app fail fast if env missing
- [x] [env] Add .env.example per v13 spec
- [x] [env] Document envs in docs/environment.md

👮‍♂️ RBAC & Rules

- [ ] [rbac] Update rules for mfa claim enforcement
- [ ] [rbac] Add org_owner/admin/manager/staff mapping doc (docs/rbac.md)
- [ ] [rbac] Implement functions to set/clear custom claims with MFA status
- [ ] [rbac] Write rules tests covering cross-tenant denial cases
- [ ] [rbac] Validate ledger append-only in rules tests

📈 Observability & SLOs

- [x] [slo] Define SLOs (API p95 read ≤ 300 ms, write ≤ 600 ms)
- [x] [slo] Add prometheus/metrics endpoint or Cloud Monitoring metrics
- [ ] [slo] Create dashboards for error rate, latency, uptime
- [ ] [slo] Set alerts (SLO breach ≥ 1 min MTTR trigger)

🧪 Testing Suite (Integration & Rules)

- [ ] [test] Expand Vitest unit suite
- [ ] [test] Add Playwright E2E for mobile viewport
- [ ] [test] Mock Firebase emulators for CI
- [ ] [test] Add tests/rules/\*.spec.ts with allow/deny matrix
- [ ] [test] Measure coverage ≥ 80 %

🧭 AI Scheduler Extension (Next Milestone)

- [ ] [AI] Scaffold services/scheduler-ai (Firestore Admin SDK + Gemini API)
- [ ] [AI] Implement endpoints:
  - /api/ai/schedule-generate
  - /api/ai/schedule-optimize
  - /api/ai/schedule-validate
- [ ] [AI] Add integration tests for AI service
- [ ] [AI] Connect to Events/Booths/Staff collections per glump model
- [ ] [AI] Store AI schedule metadata (confidenceScore, conflictWarnings)

🧰 Docs & Runbooks

- [x] [docs] Write docs/security.md (session + MFA diagram)
- [x] [docs] Write docs/ops/backup-restore.md (covered in runbooks/backup-scheduler.md + restore.md)
- [ ] [docs] Write docs/release-runbook.md
- [ ] [docs] Update docs/project-roadmap.md with v13 Blocks status
- [ ] [docs] Add README badges (build ✓, E2E ✓, Lighthouse ✓, Backup ✓)

🏁 Milestone Markers
Milestone Description When to Check Off

- [ ] M0 – Hybrid Next purged + session cookies working App builds w/out /\_document error and auth cookie verified
- [ ] M1 – Security Core complete Session + MFA + rules tests passing
- [ ] M2 – Integrity & Reliability Core ready Zod validators + observability + backups verified
- [ ] M3 – Experience Layer validated Perf metrics + sub-5-minute schedule achieved
- [ ] M4 – Validation & Release gate green E2E pipeline blocking non-green deploys
- [ ] M5 – AI Scheduler integration live AI service deploys + returns valid optimized schedule
- [ ] M6 – Production Release v13 All Green All blocks checked ✓ and CI/CD passing

💡 Tip:
Save this file as docs/TODO-v13.md or PROJECT.todo in your repo.
VS Code will render [ ] / [x] checkboxes in preview, and the TODO Tree extension will treat them as tasks.

When you start a new sprint, mark the relevant Block header (## Block 1) as ✅ once every child task is complete.
