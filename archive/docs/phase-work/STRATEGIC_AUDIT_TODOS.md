# Fresh Root Strategic Audit - Action Items

**Generated:** November 29, 2025 **Status:** In Progress **Overall Grade:** A- (93/100)

---

## 🎯 Executive Summary

Fresh Root is production-ready with **3 critical infrastructure gaps** blocking horizontal scaling.
**Total Remediation Time:** 54 hours (1.5 sprints for 2 engineers)

**Ship Status:**

- ✅ **Single-Instance Production:** Ready today
- ⚠️ **Multi-Instance Production:** Ready after Critical TODOs (18-24 hours)
- ⚠️ **Enterprise Production:** Ready after 30-day roadmap

---

## 📋 CRITICAL TODOS (Week 1 - Blocking Multi-Instance Production)

### ⚠️ TODO-001: Redis Rate Limiting Implementation

**Priority:** CRITICAL **Effort:** 4-8 hours **Owner:** DevOps/Backend **Status:** 🔴 NOT STARTED

**Why Critical:** Current in-memory rate limiting won't scale horizontally. Load-balanced
deployments can bypass rate limits (each instance tracks separately).

**Tasks:**

- [ ] Install Redis client packages

  ```bash
  pnpm add ioredis @types/ioredis
  ```

- [ ] Create `RedisRateLimiter` class in `rate-limit.ts`
  - [ ] Implement `checkLimit()` method using Redis INCR/EXPIRE
  - [ ] Add connection pooling configuration
  - [ ] Add error handling for Redis unavailability (fallback to in-memory)
- [ ] Update `rate-limit.ts` factory function
  - [ ] Use Redis limiter when `REDIS_URL` is set
  - [ ] Use in-memory limiter for local development
- [ ] Update middleware in `apps/web/app/api/_shared/middleware.ts`
  - [ ] Import Redis limiter
  - [ ] Configure rate limiting per environment
- [ ] Add environment variables
  - [ ] Add `REDIS_URL` to `.env.example`
  - [ ] Add `REDIS_URL` to `.env.production`
  - [ ] Document Redis configuration in `MEMORY_MANAGEMENT.md`
- [ ] Write tests
  - [ ] Unit test: Redis rate limiter with mock Redis
  - [ ] Integration test: Rate limiting works across 2+ instances
- [ ] Verify with load balancer simulation
  - [ ] Deploy to 2 instances
  - [ ] Send 200 requests
  - [ ] Confirm 100 success + 100 rate-limited (429)

**Files to Modify:**

- `rate-limit.ts` - Add Redis backend
- `apps/web/app/api/_shared/middleware.ts` - Use Redis in production
- `.env.example` - Document REDIS_URL
- `.env.production` - Add REDIS_URL
- `MEMORY_MANAGEMENT.md` - Document Redis setup

**Verification Command:**

```bash
# After deployment to 2+ instances
for i in {1..200}; do curl -X POST https://api.example.com/api/test; done | grep -c "429"
# Expected: 100 (half the requests rate-limited)
```

**Definition of Done:**

- ✅ Redis client integrated
- ✅ Rate limiting works across multiple instances
- ✅ Fallback to in-memory when Redis unavailable
- ✅ Tests passing
- ✅ Documentation updated

---

### ⚠️ TODO-002: OpenTelemetry Tracing Implementation

**Priority:** HIGH **Effort:** 4-6 hours **Owner:** DevOps/Backend **Status:** 🟡 IN PROGRESS
(otel.ts updated, init needed)

**Why Critical:** No distributed tracing means debugging production issues is impossible. Need
end-to-end request tracing for SLA monitoring.

**Tasks:**

- [ ] Install OpenTelemetry packages

  ```bash
  pnpm add @opentelemetry/sdk-node @opentelemetry/exporter-trace-otlp-http \
           @opentelemetry/instrumentation-http @opentelemetry/instrumentation-express \
           @opentelemetry/resources @opentelemetry/semantic-conventions
  ```

- [x] Update `apps/web/app/api/_shared/otel.ts` (COMPLETED)
  - [x] Implement `traceFn()` helper
  - [x] Implement `withSpan()` helper
- [ ] Create `apps/web/app/api/_shared/otel-init.ts`
  - [ ] Initialize NodeSDK with tracer provider
  - [ ] Configure OTLP exporter
  - [ ] Add resource attributes (service.name, service.version)
  - [ ] Add auto-instrumentation for HTTP/Express
  - [ ] Add graceful shutdown handling
- [ ] Update `apps/web/instrumentation.ts`
  - [ ] Call `ensureOtelStarted()` in register() hook
- [ ] Add environment variables
  - [ ] Add `OTEL_EXPORTER_OTLP_ENDPOINT` to `.env.example`
  - [ ] Add `OTEL_SERVICE_NAME=fresh-root-web` to `.env.production`
  - [ ] Add `OTEL_ENABLED=true` for production, `false` for dev
- [ ] Update middleware to use `withSpan()`
  - [ ] Wrap `requireSession()` in span
  - [ ] Wrap `require2FAForManagers()` in span
  - [ ] Add span attributes (uid, orgId, route)
- [ ] Set up local Jaeger for testing

  ```bash
  docker run -d -p16686:16686 -p4318:4318 jaegertracing/all-in-one:latest
  ```

- [ ] Verify traces appear in Jaeger UI
  - [ ] Make API request
  - [ ] Check Jaeger UI at <http://localhost:16686>
  - [ ] Verify span hierarchy (auth → handler → db)
- [ ] Document observability setup
  - [ ] Create `docs/OBSERVABILITY_SETUP.md`
  - [ ] Document Jaeger/Honeycomb configuration
  - [ ] Document span naming conventions

**Files to Create:**

- `apps/web/app/api/_shared/otel-init.ts` - OTEL initialization

**Files to Modify:**

- `apps/web/app/api/_shared/otel.ts` - ✅ DONE
- `apps/web/instrumentation.ts` - Add OTEL startup
- `apps/web/app/api/_shared/middleware.ts` - Use withSpan()
- `.env.example` - Document OTEL vars
- `.env.production` - Add OTEL vars
- `package.json` - Add OTEL packages

**Files to Create (Documentation):**

- `docs/OBSERVABILITY_SETUP.md` - Observability guide

**Verification Command:**

```bash
# Start local Jaeger
docker run -d -p16686:16686 -p4318:4318 jaegertracing/all-in-one:latest

# Make API request
curl http://localhost:3000/api/schedules

# Check Jaeger UI
open http://localhost:16686
# Should see: "fresh-root-web-api" service with traces
```

**Definition of Done:**

- ✅ OTEL SDK initialized
- ✅ Traces exported to OTLP endpoint
- ✅ Spans visible in Jaeger UI
- ✅ Middleware instrumented
- ✅ Documentation created

---

### ⚠️ TODO-003: Environment Variable Validation

**Priority:** MEDIUM **Effort:** 2 hours **Owner:** Backend **Status:** 🔴 NOT STARTED

**Why Important:** Production incidents often caused by missing/invalid environment variables. Fail
fast at startup with clear error messages.

**Tasks:**

- [ ] Create Zod schema in `packages/env/src/index.ts`
  - [ ] Define all required environment variables
  - [ ] Add validation rules (URLs, enums, min/max)
  - [ ] Add helpful error messages
- [ ] Create environment validator in `apps/web/src/env.ts`
  - [ ] Import Zod schema
  - [ ] Parse `process.env` at startup
  - [ ] Throw descriptive error on validation failure
- [ ] Update `apps/web/instrumentation.ts`
  - [ ] Call env validator in `register()` hook
  - [ ] Ensure validation runs before OTEL initialization
- [ ] Add tests
  - [ ] Test: Valid environment passes validation
  - [ ] Test: Missing required var throws error
  - [ ] Test: Invalid URL format throws error
- [ ] Update documentation
  - [ ] Add environment variable reference to `.env.example`
  - [ ] Document all required vs optional variables
  - [ ] Add troubleshooting section

**Required Environment Variables:**

```typescript
const EnvSchema = z.object({
  // Node
  NODE_ENV: z.enum(["development", "production", "test"]),

  // Firebase
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  FIREBASE_ADMIN_PROJECT_ID: z.string().min(1),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email(),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1),

  // Optional: Redis
  REDIS_URL: z.string().url().optional(),

  // Optional: OpenTelemetry
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
  OTEL_SERVICE_NAME: z.string().default("fresh-root-web"),
  OTEL_ENABLED: z.enum(["true", "false"]).default("false"),

  // Optional: Sentry
  SENTRY_DSN: z.string().url().optional(),
});
```

**Files to Create:**

- `packages/env/src/index.ts` - Zod schema
- `apps/web/src/env.ts` - Validator

**Files to Modify:**

- `apps/web/instrumentation.ts` - Call validator
- `.env.example` - Complete documentation
- `README.md` - Reference environment setup

**Verification Command:**

```bash
# Test with missing variable
unset NEXT_PUBLIC_FIREBASE_API_KEY
pnpm dev
# Expected: Clear error message with variable name

# Test with invalid URL
export REDIS_URL="not-a-url"
pnpm dev
# Expected: Validation error for REDIS_URL format
```

**Definition of Done:**

- ✅ Zod schema covers all environment variables
- ✅ Validation runs at app startup
- ✅ Clear error messages on failure
- ✅ Tests passing
- ✅ Documentation complete

---

## 📊 HIGH PRIORITY TODOS (Week 2-3 - Before Day 30)

### TODO-004: Firestore Rules Test Coverage

**Priority:** HIGH **Effort:** 8 hours **Owner:** QA/Backend **Status:** 🔴 NOT STARTED **Target:**
80%+ rule coverage

**Why Important:** Firestore rule changes can silently break authorization. Comprehensive tests
prevent security vulnerabilities.

**Tasks:**

- [ ] Set up Firestore Rules testing infrastructure
  - [ ] Review `packages/rules-tests/` setup
  - [ ] Configure Firebase emulator
  - [ ] Add test data fixtures
- [ ] Write permission boundary tests
  - [ ] Test: Unauthenticated users denied all access
  - [ ] Test: Users can't enumerate collections
  - [ ] Test: Users can't access other users' data
- [ ] Write tenant isolation tests
  - [ ] Test: Org A users can't read Org B schedules
  - [ ] Test: Org A users can't write to Org B documents
  - [ ] Test: Cross-tenant queries fail
- [ ] Write role-based access tests
  - [ ] Test: Employees can read schedules
  - [ ] Test: Employees can't delete schedules
  - [ ] Test: Managers can create/update/delete schedules
  - [ ] Test: Admins have full access
- [ ] Write soft-delete tests
  - [ ] Test: Deleted documents hidden from queries
  - [ ] Test: Deleted documents can be restored by admins
- [ ] Add regression tests for known issues
  - [ ] Document any historical security bugs
  - [ ] Add test cases to prevent regression
- [ ] Integrate with CI/CD
  - [ ] Add `pnpm test:rules` to CI pipeline
  - [ ] Block PRs with failing rule tests
- [ ] Generate coverage report
  - [ ] Use Firebase emulator coverage reporting
  - [ ] Target 80%+ rule coverage

**Files to Create:**

- `packages/rules-tests/src/schedules.test.ts` - Schedule rules tests
- `packages/rules-tests/src/shifts.test.ts` - Shift rules tests
- `packages/rules-tests/src/organizations.test.ts` - Org rules tests
- `packages/rules-tests/src/users.test.ts` - User rules tests

**Files to Modify:**

- `packages/rules-tests/package.json` - Add test scripts
- `.github/workflows/ci.yml` - Add rules testing job
- `firestore.rules` - Add coverage annotations

**Verification Command:**

```bash
pnpm --filter @rules/firestore test
# Expected: All tests pass

firebase emulators:exec --only firestore \
  'npm --prefix packages/rules-tests test -- --coverage'
# Expected: Coverage report shows 80%+
```

**Definition of Done:**

- ✅ 80%+ rule coverage
- ✅ Permission boundary tests passing
- ✅ Tenant isolation tests passing
- ✅ Role-based access tests passing
- ✅ Integrated with CI/CD
- ✅ Coverage report generated

---

### TODO-005: API Endpoint Test Coverage

**Priority:** MEDIUM **Effort:** 12 hours **Owner:** QA/Backend **Status:** 🔴 NOT STARTED
**Target:** 60%+ API route coverage

**Why Important:** Current coverage: 6 tests for 34 routes (18%). Need tests to prevent regression
bugs.

**Tasks:**

- [ ] Set up API testing infrastructure
  - [ ] Review existing test setup in `apps/web/app/api/onboarding/__tests__/`
  - [ ] Create test utilities for authenticated requests
  - [ ] Create test fixtures for common data
- [ ] Write tests for `/api/schedules`
  - [ ] Test: GET returns schedules for authenticated user
  - [ ] Test: GET filters by orgId (tenant isolation)
  - [ ] Test: POST creates schedule with valid data
  - [ ] Test: POST validates input with Zod
  - [ ] Test: PATCH updates existing schedule
  - [ ] Test: DELETE removes schedule (soft-delete)
  - [ ] Test: 401 without session cookie
  - [ ] Test: 403 for wrong organization
- [ ] Write tests for `/api/shifts`
  - [ ] Test: CRUD operations
  - [ ] Test: Authorization checks
  - [ ] Test: Input validation
- [ ] Write tests for `/api/users`
  - [ ] Test: User profile operations
  - [ ] Test: Role-based access
  - [ ] Test: 2FA enforcement for managers
- [ ] Write tests for `/api/organizations`
  - [ ] Test: Org creation
  - [ ] Test: Member management
  - [ ] Test: Admin-only operations
- [ ] Write security edge case tests
  - [ ] Test: SQL injection prevention (if using SQL)
  - [ ] Test: XSS prevention in responses
  - [ ] Test: CSRF token validation
  - [ ] Test: Rate limiting enforcement
- [ ] Add test coverage reporting
  - [ ] Configure Vitest coverage
  - [ ] Generate coverage report
  - [ ] Add coverage badge to README
- [ ] Integrate with CI/CD
  - [ ] Ensure tests run on every PR
  - [ ] Block PRs with <60% coverage

**Files to Create:**

- `apps/web/app/api/schedules/__tests__/route.test.ts`
- `apps/web/app/api/schedules/__tests__/[id]/route.test.ts`
- `apps/web/app/api/shifts/__tests__/route.test.ts`
- `apps/web/app/api/users/__tests__/route.test.ts`
- `apps/web/app/api/organizations/__tests__/route.test.ts`
- `apps/web/app/api/__tests__/test-utils.ts` - Shared test utilities

**Files to Modify:**

- `vitest.config.ts` - Add coverage configuration
- `.github/workflows/ci.yml` - Add coverage reporting
- `README.md` - Add coverage badge

**Verification Command:**

```bash
pnpm test:coverage
# Expected: Coverage report shows 60%+ for API routes

pnpm test --run
# Expected: All tests pass
```

**Definition of Done:**

- ✅ 60%+ API route coverage
- ✅ Core CRUD operations tested
- ✅ Authorization edge cases tested
- ✅ Input validation tested
- ✅ Coverage integrated with CI/CD
- ✅ Tests passing

---

### TODO-006: Log Aggregation Configuration

**Priority:** MEDIUM **Effort:** 4 hours **Owner:** DevOps **Status:** 🔴 NOT STARTED

**Why Important:** Currently logs only go to stdout. Need centralized logging for debugging
production issues.

**Tasks:**

- [ ] Choose log aggregation service
  - [ ] Option 1: Self-hosted ELK stack
  - [ ] Option 2: Datadog (SaaS)
  - [ ] Option 3: Loki + Grafana (lightweight)
  - [ ] Document decision in ADR
- [ ] Configure structured logging
  - [ ] Review current logging in `apps/web/src/lib/logger.ts`
  - [ ] Ensure all logs are JSON formatted
  - [ ] Add consistent log levels (debug, info, warn, error)
- [ ] Set up log shipping
  - [ ] Configure log forwarder (Fluentd/Vector/Datadog Agent)
  - [ ] Add log shipping to Docker containers
  - [ ] Configure retention policies
- [ ] Add contextual logging
  - [ ] Include requestId in all logs
  - [ ] Include userId/orgId when available
  - [ ] Include trace context from OpenTelemetry
- [ ] Create log queries/alerts
  - [ ] Alert: Error rate > 5% of requests
  - [ ] Alert: 5xx responses > 1% of requests
  - [ ] Alert: Authentication failures spike
  - [ ] Query: All logs for a specific requestId
- [ ] Document logging practices
  - [ ] Update `docs/OBSERVABILITY_SETUP.md`
  - [ ] Add log querying guide
  - [ ] Document alert thresholds

**Files to Modify:**

- `apps/web/src/lib/logger.ts` - Enhance structured logging
- `docker-compose.yml` - Add log aggregation service (if self-hosted)
- `.env.production` - Add log aggregation credentials

**Files to Create:**

- `docs/OBSERVABILITY_SETUP.md` - Logging guide
- `docs/runbooks/LOG_QUERIES.md` - Common log queries

**Verification Command:**

```bash
# Make API request
curl http://localhost:3000/api/schedules

# Query logs by requestId
# (command depends on chosen aggregation service)
```

**Definition of Done:**

- ✅ Log aggregation service configured
- ✅ Logs centralized and searchable
- ✅ Alerts configured
- ✅ Documentation complete
- ✅ Retention policies set

---

## 🚀 MEDIUM PRIORITY TODOS (30-Day Roadmap)

### TODO-007: Monitoring Dashboards

**Priority:** MEDIUM **Effort:** 4 hours **Owner:** DevOps **Status:** 🔴 NOT STARTED

**Tasks:**

- [ ] Choose monitoring platform (Grafana/Datadog/New Relic)
- [ ] Create system health dashboard
  - [ ] CPU/Memory usage per instance
  - [ ] Request rate (req/sec)
  - [ ] Error rate (errors/sec)
  - [ ] p50/p95/p99 latency
- [ ] Create business metrics dashboard
  - [ ] Active users per hour
  - [ ] Schedules created per day
  - [ ] API endpoint usage
  - [ ] Tenant growth rate
- [ ] Set up alerting
  - [ ] Alert: CPU > 80% for 5 minutes
  - [ ] Alert: Memory > 90% for 5 minutes
  - [ ] Alert: Error rate > 5%
  - [ ] Alert: p95 latency > 2 seconds
- [ ] Document dashboard usage

**Definition of Done:**

- ✅ Dashboards created
- ✅ Alerts configured
- ✅ Team trained on dashboard usage
- ✅ Documentation complete

---

### TODO-008: E2E Test Suite (Playwright)

**Priority:** MEDIUM **Effort:** 20 hours **Owner:** QA **Status:** 🔴 NOT STARTED

**Tasks:**

- [ ] Set up Playwright
  - [ ] Install Playwright: `pnpm add -D @playwright/test`
  - [ ] Initialize config: `pnpm exec playwright install`
- [ ] Write critical user flows
  - [ ] Flow 1: Login → Create Org → Invite User
  - [ ] Flow 2: Create Schedule → Add Shifts → Publish
  - [ ] Flow 3: Employee views schedule
  - [ ] Flow 4: Manager approves time-off request
  - [ ] Flow 5: Admin manages organization settings
- [ ] Add visual regression testing
  - [ ] Screenshot comparisons for key pages
  - [ ] Detect UI breakage automatically
- [ ] Integrate with CI/CD
  - [ ] Run E2E tests on staging environment
  - [ ] Block production deploys with failing E2E tests
- [ ] Document E2E testing practices

**Files to Create:**

- `tests/e2e/login-flow.spec.ts`
- `tests/e2e/schedule-creation.spec.ts`
- `tests/e2e/time-off-approval.spec.ts`
- `playwright.config.ts`

**Definition of Done:**

- ✅ 5 critical flows tested
- ✅ Visual regression testing configured
- ✅ Integrated with CI/CD
- ✅ Documentation complete

---

### TODO-009: API Documentation (OpenAPI)

**Priority:** MEDIUM **Effort:** 8 hours **Owner:** Backend **Status:** 🔴 NOT STARTED

**Tasks:**

- [ ] Install OpenAPI tools
  - [ ] `pnpm add next-swagger-doc swagger-ui-react`
- [ ] Generate OpenAPI spec from Zod schemas
  - [ ] Use `zod-to-openapi` library
  - [ ] Auto-generate from existing schemas
- [ ] Create Swagger UI endpoint
  - [ ] Add `/api/docs` route
  - [ ] Serve interactive API documentation
- [ ] Document all API endpoints
  - [ ] Request/response schemas
  - [ ] Authentication requirements
  - [ ] Example requests/responses
  - [ ] Error codes
- [ ] Add API playground
  - [ ] Allow testing endpoints from browser
  - [ ] Include authentication flow

**Files to Create:**

- `apps/web/app/api/docs/route.ts` - Swagger UI endpoint
- `apps/web/lib/openapi.ts` - OpenAPI spec generator

**Definition of Done:**

- ✅ OpenAPI spec generated
- ✅ Swagger UI accessible
- ✅ All endpoints documented
- ✅ API playground functional

---

### TODO-010: Performance Profiling

**Priority:** LOW **Effort:** 8 hours **Owner:** Backend **Status:** 🔴 NOT STARTED

**Tasks:**

- [ ] Set up profiling tools
  - [ ] Add `clinic.js` for Node.js profiling
  - [ ] Add Lighthouse CI for frontend profiling
- [ ] Profile critical endpoints
  - [ ] `/api/schedules` - List operation
  - [ ] `/api/shifts` - Bulk operations
  - [ ] Identify N+1 queries
  - [ ] Identify slow database queries
- [ ] Optimize hot paths
  - [ ] Add database indexes
  - [ ] Add caching for frequently accessed data
  - [ ] Optimize Firestore queries
- [ ] Add performance budgets
  - [ ] API response time < 200ms (p95)
  - [ ] Page load time < 2s (p95)
  - [ ] Lighthouse score > 90
- [ ] Document performance benchmarks

**Definition of Done:**

- ✅ Performance bottlenecks identified
- ✅ Optimizations implemented
- ✅ Performance budgets set
- ✅ Documentation complete

---

### TODO-011: Security Penetration Testing

**Priority:** LOW **Effort:** External engagement (16-40 hours) **Owner:** Security/External firm
**Status:** 🔴 NOT STARTED

**Tasks:**

- [ ] Hire external security firm
  - [ ] Get quotes from 3+ firms
  - [ ] Choose firm with Firebase/Next.js experience
- [ ] Define scope
  - [ ] Web application security (OWASP Top 10)
  - [ ] API security testing
  - [ ] Firestore rules testing
  - [ ] Authentication/authorization testing
- [ ] Conduct penetration test
  - [ ] Provide test accounts
  - [ ] Grant temporary access
  - [ ] Monitor during test
- [ ] Remediate findings
  - [ ] Prioritize critical/high issues
  - [ ] Create remediation plan
  - [ ] Implement fixes
- [ ] Re-test
  - [ ] Verify fixes
  - [ ] Get final report
- [ ] Document security posture
  - [ ] Add to security documentation
  - [ ] Share with enterprise customers

**Definition of Done:**

- ✅ Penetration test completed
- ✅ All critical issues remediated
- ✅ Security report received
- ✅ Documentation updated

---

### TODO-012: Disaster Recovery Procedures

**Priority:** LOW **Effort:** 6 hours **Owner:** DevOps **Status:** 🔴 NOT STARTED

**Tasks:**

- [ ] Document backup procedures
  - [ ] Firestore backup schedule (already automated?)
  - [ ] Configuration backup (env vars, secrets)
  - [ ] Code repository backup
- [ ] Create restore procedures
  - [ ] Firestore restore runbook
  - [ ] Infrastructure restore runbook
  - [ ] Application restore runbook
- [ ] Test disaster recovery
  - [ ] Perform test restore quarterly
  - [ ] Document recovery time
  - [ ] Verify data integrity
- [ ] Document RTO/RPO
  - [ ] Recovery Time Objective: <4 hours
  - [ ] Recovery Point Objective: <1 hour
- [ ] Create incident response plan
  - [ ] Who to contact
  - [ ] Communication plan
  - [ ] Escalation procedures

**Files to Create:**

- `docs/runbooks/DISASTER_RECOVERY.md`
- `docs/runbooks/FIRESTORE_RESTORE.md`
- `docs/runbooks/INCIDENT_RESPONSE.md`

**Definition of Done:**

- ✅ Runbooks created
- ✅ Restore procedures tested
- ✅ RTO/RPO documented
- ✅ Incident response plan complete

---

## 📈 90-DAY STRATEGIC INITIATIVES

### TODO-013: Horizontal Scaling Infrastructure (30 days)

**Priority:** STRATEGIC **Effort:** 40 hours **Owner:** DevOps/Architecture

**Tasks:**

- [ ] Redis for rate limiting (TODO-001)
- [ ] Redis for session storage
  - [ ] Migrate from Firebase session cookies to Redis sessions
  - [ ] Implement session management middleware
  - [ ] Add session cleanup cron job
- [ ] Database query caching
  - [ ] Implement Redis cache layer
  - [ ] Add cache invalidation strategy
  - [ ] Add cache hit rate monitoring
- [ ] Load balancer configuration
  - [ ] Set up HAProxy/Nginx/ALB
  - [ ] Configure health checks
  - [ ] Configure session affinity (if needed)
  - [ ] Test failover scenarios
- [ ] Health check endpoints
  - [ ] Add `/api/health` endpoint
  - [ ] Add `/api/ready` endpoint (checks dependencies)
  - [ ] Add `/api/metrics` endpoint (Prometheus format)

**Definition of Done:**

- ✅ Application scales horizontally
- ✅ No single points of failure
- ✅ Load balancer configured
- ✅ Health checks working

---

### TODO-014: Service Separation (60 days)

**Priority:** STRATEGIC **Effort:** 80 hours **Owner:** Architecture/Backend

**Tasks:**

- [ ] Extract `services/api/` as autonomous service
  - [ ] Define service boundaries
  - [ ] Create API contract (OpenAPI)
  - [ ] Implement service-to-service auth
- [ ] Migrate to event-driven architecture
  - [ ] Set up event bus (Pub/Sub, Kafka, or Firebase Events)
  - [ ] Define event schemas
  - [ ] Implement event producers
  - [ ] Implement event consumers
- [ ] Implement service mesh (optional)
  - [ ] Evaluate Istio/Linkerd
  - [ ] Configure traffic management
  - [ ] Configure observability
- [ ] API gateway for routing
  - [ ] Set up Kong/Tyk/AWS API Gateway
  - [ ] Configure routing rules
  - [ ] Add rate limiting at gateway
  - [ ] Add authentication at gateway

**Definition of Done:**

- ✅ Services deployed independently
- ✅ Event-driven communication working
- ✅ Service mesh configured (if chosen)
- ✅ API gateway routing traffic

---

### TODO-015: Advanced Observability (90 days)

**Priority:** STRATEGIC **Effort:** 40 hours **Owner:** DevOps/SRE

**Tasks:**

- [ ] Distributed tracing across all services
  - [ ] OpenTelemetry in all services (TODO-002)
  - [ ] Trace propagation working
  - [ ] Trace visualization in Jaeger/Honeycomb
- [ ] Custom business metrics dashboard
  - [ ] Track user engagement metrics
  - [ ] Track revenue metrics (if applicable)
  - [ ] Track feature usage
- [ ] Automated anomaly detection
  - [ ] Set up anomaly detection alerts
  - [ ] Machine learning models for baselines
  - [ ] Auto-scaling based on metrics
- [ ] Cost attribution per tenant
  - [ ] Track compute costs per organization
  - [ ] Track storage costs per organization
  - [ ] Create cost allocation reports

**Definition of Done:**

- ✅ Full distributed tracing
- ✅ Business metrics dashboard
- ✅ Anomaly detection working
- ✅ Cost attribution reports

---

## ✅ VERIFICATION CHECKLIST

Before marking overall project as complete, verify:

### Pre-Production Checklist

- [ ] Pattern validator: 90+ score
- [ ] TypeScript compilation: 0 errors
- [ ] ESLint: 0 errors
- [ ] All critical TODOs complete (TODO-001, TODO-002, TODO-003)
- [ ] Redis rate limiting tested with 2+ instances
- [ ] OpenTelemetry traces visible in backend
- [ ] Environment validation working

### 30-Day Checklist

- [ ] Firestore rules: 80%+ test coverage
- [ ] API routes: 60%+ test coverage
- [ ] Log aggregation configured
- [ ] Monitoring dashboards created
- [ ] Alerts configured

### 90-Day Checklist

- [ ] E2E test suite (5+ critical flows)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Performance profiling complete
- [ ] Security penetration test complete
- [ ] Disaster recovery tested

---

## 📊 PROGRESS TRACKING

### Overall Status

- **Critical TODOs:** 0/3 complete (0%)
- **High Priority TODOs:** 0/3 complete (0%)
- **Medium Priority TODOs:** 0/6 complete (0%)
- **Strategic Initiatives:** 0/3 complete (0%)

### Timeline

- **Week 1:** Critical infrastructure (TODO-001, TODO-002, TODO-003)
- **Week 2-3:** Testing & observability (TODO-004, TODO-005, TODO-006)
- **Week 4-8:** Medium priority items
- **Month 3:** Strategic initiatives

---

## 📞 QUESTIONS FOR PATRICK

Before starting implementation, need answers to:

1. **Timeline:** Are you planning single-instance or multi-instance deployment initially?
2. **Observability:** Do you have a preferred tracing backend (Jaeger/Honeycomb/Datadog)?
3. **Redis:** Do you have Redis infrastructure already, or need to provision?
4. **Help:** Want me to implement any of these TODOs? I can start with Redis rate limiting (4
   hours).
5. **Budget:** Any budget constraints for SaaS tools (Datadog, Honeycomb, etc.)?
6. **Timeline Constraints:** Any hard deadlines for production launch?

---

## 🎯 RECOMMENDED PRIORITIZATION

**If launching in 1 week:**

1. TODO-001: Redis rate limiting (CRITICAL)
2. TODO-002: OpenTelemetry tracing (HIGH)
3. TODO-003: Environment validation (MEDIUM)

**If launching in 1 month:** Add: 4. TODO-004: Firestore rules tests (HIGH) 5. TODO-006: Log
aggregation (MEDIUM) 6. TODO-007: Monitoring dashboards (MEDIUM)

**If launching in 3 months:** Add all remaining items for production-grade enterprise deployment.

---

**Last Updated:** November 29, 2025 **Next Review:** After critical TODOs complete
