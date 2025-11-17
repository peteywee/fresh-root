# Fresh Schedules v13 Plan C Milestone Checklist

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
  - [x] Verified apps/web/app/api/health/route.ts exists and enhanced with diagnostics (uptime, timestamp, environment)
- [x] [BLOCK2] Metrics endpoint
  - [x] Verified apps/web/app/api/metrics/route.ts exists
  - [x] Note: recordRequest() defined but not called (superseded by OpenTelemetry auto-instrumentation)

🧩 Block 3 – Integrity Core (P1) ✅ COMPLETE

- [x] [BLOCK3] Expand packages/types/ with Zod schemas for orgs, memberships, positions, schedules, shifts
  - [x] Created packages/types/src/memberships.ts with full CRUD schemas
  - [x] Created packages/types/src/positions.ts with types and skill levels
  - [x] Created packages/types/src/shifts.ts with assignments and time validation
  - [x] Created packages/types/src/venues.ts with addresses and coordinates
  - [x] Created packages/types/src/zones.ts for venue subdivisions
  - [x] Created packages/types/src/attendance.ts with check-in/out and geolocation
  - [x] Created packages/types/src/join-tokens.ts for org invitations
  - [x] Enhanced packages/types/src/orgs.ts with settings and subscription tiers
  - [x] Enhanced packages/types/src/schedules.ts with AI metadata and publishing
  - [x] Updated packages/types/src/index.ts to export all schemas
- [x] [BLOCK3] Add API-level Zod validation for every write route (422 on invalid payload)
  - [x] Add validation to POST /api/organizations (uses CreateOrgSchema)
  - [x] Add validation to PATCH /api/organizations/[id] (uses UpdateOrgSchema)
  - [x] Add validation to DELETE /api/organizations/[id] (protected by withSecurity)
  - [x] Add validation to POST /api/organizations/[id]/members (uses CreateMembershipSchema)
  - [x] Add validation to PATCH /api/organizations/[id]/members (uses UpdateMembershipSchema)
  - [x] Add validation to DELETE /api/organizations/[id]/members (protected by withSecurity + requireRole)
  - [x] Add validation to POST /api/items (uses CreateItemInput)
  - [x] Add validation to GET /api/items (protected by withSecurity)
  - [x] Add validation to POST /api/session (uses CreateSessionSchema)
  - [x] Add validation to DELETE /api/session (session clearing)
  - [x] Add validation to POST /api/auth/mfa/setup (protected by withSecurity)
  - [x] Add validation to POST /api/auth/mfa/verify (uses verifySchema)
  - [x] Add validation to POST /api/publish (uses PublishSchema + requireRole("manager"))
  - [x] Add validation to GET /api/users/profile (protected by withSecurity)
  - [x] Add validation to PATCH /api/users/profile (uses UpdateProfileSchema)
  - [x] Add validation to POST /api/positions (uses CreatePositionSchema + requireRole("manager"))
  - [x] Add validation to GET /api/positions (protected by withSecurity + requireOrgMembership)
  - [x] Add validation to POST /api/schedules (uses CreateScheduleSchema + requireRole("scheduler"))
  - [x] Add validation to GET /api/schedules (protected by withSecurity + requireOrgMembership)
  - [x] Add validation to POST /api/shifts (uses CreateShiftSchema from @fresh-schedules/types)
  - [x] Add validation to GET /api/shifts (protected by withSecurity + requireOrgMembership)
  - [x] Add validation to GET /api/shifts/[id] (protected by withSecurity + requireOrgMembership)
  - [x] Add validation to PATCH /api/shifts/[id] (uses UpdateShiftSchema from @fresh-schedules/types)
  - [x] Add validation to DELETE /api/shifts/[id] (protected by withSecurity + requireRole("admin"))
  - [x] Add validation to POST /api/venues (uses CreateVenueSchema + requireRole("manager"))
  - [x] Add validation to GET /api/venues (protected by withSecurity + requireOrgMembership)
  - [x] Add validation to POST /api/zones (uses CreateZoneSchema + requireRole("manager"))
  - [x] Add validation to GET /api/zones (protected by withSecurity + requireOrgMembership)
  - [x] Add validation to POST /api/attendance (uses CreateAttendanceRecordSchema + requireRole("scheduler"))
  - [x] Add validation to GET /api/attendance (protected by withSecurity + requireOrgMembership)
  - [x] Add validation to POST /api/join-tokens (uses CreateJoinTokenSchema + requireRole("admin"))
  - [x] Add validation to GET /api/join-tokens (protected by withSecurity + requireRole("manager"))
- [x] [BLOCK3] Write rules test matrix (≥ 1 allow + 3 denies per collection; see docs/BLOCK3_IMPLEMENTATION.md)
  - [x] Created tests/rules/organizations.spec.ts (4 suites, 13+ tests)
  - [x] Created tests/rules/positions.spec.ts (2 suites, 10+ tests)
  - [x] Create tests/rules/schedules.spec.ts
  - [x] Create tests/rules/shifts.spec.ts
  - [x] Create tests/rules/venues.spec.ts
  - [x] Create tests/rules/zones.spec.ts
  - [x] Create tests/rules/attendance.spec.ts
  - [x] Create tests/rules/join-tokens.spec.ts
- [x] [BLOCK3] Add unit tests for Zod validators
  - [x] Created packages/types/src/**tests**/memberships.test.ts (9 suites, 17+ tests)
  - [x] Created packages/types/src/**tests**/positions.test.ts (7 suites, 15+ tests)
  - [x] Created packages/types/src/**tests**/shifts.test.ts (4 suites, 8+ tests)
  - [x] Created packages/types/src/**tests**/schedules.test.ts (3 suites, 7+ tests)
  - [x] Created packages/types/src/**tests**/venues.test.ts (7 suites, 15+ tests)
  - [x] Created packages/types/src/**tests**/zones.test.ts (6 suites, 12+ tests)
  - [x] Created packages/types/src/**tests**/attendance.test.ts (5 suites, 10+ tests)
  - [x] Created packages/types/src/**tests**/join-tokens.test.ts (6 suites, 12+ tests)
  - [x] Created packages/types/src/**tests**/orgs.test.ts (8 suites, 16+ tests)
- [x] [BLOCK3] Add migration-check script validating schema parity vs rules
  - [x] Created scripts/ops/validate-schema-rules-parity.ts with 4 validation checks
  - [x] Script validates collections → schemas mapping
  - [x] Script validates schemas → exports in index.ts
  - [x] Script validates collections → documentation
  - [x] Script detects orphaned schemas
  - [x] Made script executable with chmod +x
- [x] [BLOCK3] Create schema index doc (docs/schema-map.md) listing collections ↔ schemas
  - [x] Documented all 10 collections with Firestore paths
  - [x] Included schema file references and rules line numbers
  - [x] Added access control matrices for each collection
  - [x] Listed API endpoints for each collection
  - [x] Included testing requirements and migration check reference
- [x] [BLOCK3] Add pre-commit hook enforcing pnpm typecheck && pnpm lint
  - [x] Updated .husky/pre-commit to include typecheck step
  - [x] Hook now runs: tag-files → typecheck → lint → format
- [x] [BLOCK3] Standardize all API routes to consistent pattern
  - [x] All routes use withSecurity() wrapper with rate limiting
  - [x] All routes use consistent error handling (badRequest, serverError, ok)
  - [x] All protected routes require authentication via requireAuth: true
  - [x] Role-based routes use requireOrgMembership() and requireRole() patterns
  - [x] All write routes use Zod validation via parseJson() helper
  - [x] All routes have proper P0/P1 priority tags and area classifications
  - [x] Updated /api/session, /api/publish, /api/health, /api/internal/backup
  - [x] Updated /api/auth/mfa/setup, /api/auth/mfa/verify
  - [x] Updated /api/shifts and /api/shifts/[id]
  - [x] Verified typecheck and lint pass with no errors

🎨 Block 4 – Experience Layer (P1)

- [ ] [BLOCK4] Build design system (components/ui/ + tailwind.config.ts tokens)
- [ ] [BLOCK4] Implement virtualized Week Grid with sticky budget header + keyboard a11y
- [ ] [BLOCK4] Add Lighthouse workflow (≥ 90 overall, ≥ 95 a11y)
- [ ] [BLOCK4] Benchmark TTI ≤ 2.5 s, MonthView render < 200 ms, 1 k rows ≥ 55 FPS
- [ ] [BLOCK4] Instrument UX metrics for sub-5-minute scheduling KPI
- [ ] [BLOCK4] Integrate offline cache + IndexedDB (CheckIn Form verified sync)
- [ ] [BLOCK4] Add PWA manifest + service worker + install prompt tests
- [ ] [BLOCK4] Document UI style guide (docs/ui-guidelines.md)

🚀 Block 5 – Validation & Release (P1→P2)

- [ ] [BLOCK5] Write Playwright happy-path spec (auth → onboard → org → plan → publish)
- [ ] [BLOCK5] Add CI gate → fail deploy if E2E fails
- [ ] [BLOCK5] Implement Blue/Green deploy (smoke test then promote)
- [ ] [BLOCK5] Add scripts/ops/rollback.sh for instant rollback
- [ ] [BLOCK5] Tag releases with semantic versioning + changelog
- [ ] [BLOCK5] Add release dashboard (build #, branch, E2E status)
- [ ] [BLOCK5] Add CI artifact upload of Lighthouse + E2E reports
- [ ] [BLOCK5] Create docs/release-runbook.md

🌐 Environment & Config

- [ ] [env] Add unified env parser (lib/env.ts using Zod)
- [ ] [env] Enforce NODE_ENV, SESSION_SECRET, GOOGLE_APPLICATION_CREDENTIALS_JSON, REDIS_URL, etc.
- [ ] [env] Make app fail fast if env missing
- [ ] [env] Add .env.example per v13 spec
- [ ] [env] Document envs in docs/environment.md

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
