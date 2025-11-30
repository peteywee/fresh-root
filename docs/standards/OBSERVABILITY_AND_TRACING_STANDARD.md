# Observability & Tracing Standard

**Audience**: Senior engineers working on Fresh Root.  
**Goal**: Make production behaviour observable without drowning the codebase in noise.

This document defines:

- What "critical logic" means in the context of Fresh Root.
- When to rely on the **automatic request span** vs **explicit spans** (`withSpan`).
- How to think about rate limiting and tracing together.

The expectation is that you can read TypeScript and understand distributed systems basics. This is not a tracing tutorial; it is a policy.

---

## 1. Definitions

### 1.1 Critical Logic

**Critical logic** is any code where failure or latency materially impacts:

1. **Money / contractual outcomes**

   Examples:
   - Schedule creation/update logic that affects labour cost, hours, compliance.
   - Time-off approval/denial flows.
   - Any logic that propagates to staff notifications or external systems.

2. **Security & data isolation**

   Examples:
   - Tenant isolation checks (orgId, corporate network boundaries).
   - RBAC decision points (who can publish/delete/update).
   - Access control for destructive actions (e.g. delete schedule, revoke access).

3. **Latency-sensitive user flows**

   Examples:
   - Onboarding endpoints: `create-network-org`, `create-network-corporate`, `activate-network`.
   - Schedule/shifts reads that drive the main dashboards.
   - Any hot path that is part of the "schedule in <5 minutes" promise.

4. **External dependencies**

   Examples:
   - Future integrations: payroll, messaging, payments, analytics.
   - Any third-party API call that can time out, fail, or get rate-limited.

If you would write a post-mortem about it when it fails or is slow, it is **critical logic**.

---

## 2. Tracing Model

### 2.1 Request-Level Spans

Your middleware + `traceFn` (`apps/web/app/api/_shared/otel.ts`) are responsible for emitting a **request-level span** per API call, roughly of the form:

- `HTTP <METHOD> <route>`

This span captures:

- HTTP method, route, status code.
- End-to-end duration for the handler.

This is **mandatory** for all API routes; do not remove or bypass it.

### 2.2 Internal Spans (`withSpan`)

`withSpan` exists to make **critical internal steps** visible within the request span.

Use it to wrap:

1. **Auth and RBAC gates**
   - `requireSession` implementations.
   - Role/permission checks before mutating data.
   - Any cross-tenant boundary enforcement.

2. **Domain operations**
   - Schedule creation/update/publish pipelines.
   - Labour budget and hours computation.
   - Time-off flows and other HR-adjacent workflows.

3. **External calls**
   - Any non-trivial call across the network (present or future integrations).
   - Any Redis operations that represent a business decision rather than simple caching.

4. **Known hot spots**
   - Any code path that has historically been slow or flaky.
   - Any code path that runs in O(N) over schedules/shifts and might become an issue at scale.

### 2.3 Non-Critical Logic

Do **not** wrap trivial helpers or obvious one-liners in spans.

Examples of things that do _not_ get their own span:

- Pure data reshaping, formatting, or validation helpers.
- Small, local utility functions that are clearly cheap and not business-sensitive.
- Simple, inline calculations inside a span that already covers the surrounding operation.

---

## 3. Usage Patterns

### 3.1 Request Span + Critical Inner Spans

**Pattern**:

1. Request handler entry: request-level span via middleware / `traceFn`.
2. Within the handler, wrap critical steps in `withSpan`.

Example structure (illustrative, not exact code):

````ts
// High-level: created by middleware
HTTP POST /api/schedules
  ├─ auth.requireSession
  ├─ rbac.checkPermissions
  ├─ schedules.validatePayload
  ├─ schedules.writeToFirestore
  └─ schedules.recalculateLaborBudget
This is what you should see in Jaeger/Honeycomb/etc. when debugging.

3.2 Attributes
When calling withSpan, attach attributes that make debugging useful:

tenant.orgId

tenant.corporateId (if applicable)

user.uid

schedule.id, shift.id, etc.

Any key identifiers relevant to the operation (e.g. weekStart, locationId).

If you would filter/search by it when debugging, it should probably be an attribute.

4. Rate Limiting & Observability
4.1 Rate Limiting Strategy
We have a dual-mode rate limiter (apps/web/src/lib/api/rate-limit.ts):

Dev / single-instance: in-memory limiter (simple Map).

Production / multi-instance: Redis-backed limiter using REDIS_URL.

Requirements:

In production, when deployed behind a load balancer with multiple instances, REDIS_URL must be set and reachable.

Rate limiting keys must be derived in a way that makes business sense:

Per IP for general abuse protection.

Potentially per user or per org for more granular quotas.

4.2 Where to Apply Rate Limiting
Apply rate limiting at the API boundary on routes that:

Trigger expensive computations.

Modify data (POST, PUT, PATCH, DELETE).

Are commonly targeted in abuse scenarios:

Login / session creation.

Onboarding endpoints.

Publicly accessible endpoints.

Use route-level wrappers (e.g. withRateLimit) rather than ad-hoc calls inside the handler body, to keep rate limiting and business logic separated.

4.3 Tracing & Rate Limiting Together
Any route that is both:

Critical (as defined in §1.1) and

Rate limited

should have:

A request-level span.

At least one inner span that covers the main domain operation.

Logging/attributes that let you see when 429s are being generated and why.

This allows you to distinguish:

Genuine DDoS/abuse.

Overly aggressive rate limits.

Actual system bottlenecks.

5. Operational Guarantees
5.1 Environment
The environment is validated via packages/env/src/index.ts:

Required values must be present in production.

Optional values (e.g. REDIS_URL, OTEL_EXPORTER_OTLP_ENDPOINT) gate features:

No Redis → in-memory rate limiting only (single-instance acceptable).

No OTEL endpoint → tracing no-ops, but code still runs.

Engineering expectation:

Do not scatter process.env usage. Prefer the typed env object.

Fail fast if essential config is missing, rather than trying to limp along.

5.2 Baseline Expectations in Production
Before treating an environment as production-grade:

Request-level spans are emitted for all API routes.

Critical paths have at least one inner span (withSpan).

Redis-backed rate limiting is enabled for any multi-instance deployment.

Env validation is wired such that misconfiguration crashes early.

Anything less than the above is beta or pre-production.

6. Engineering Checklist
When you add or modify a critical feature:

Identify the critical logic:

Is this money/contract/security/latency sensitive?

Ensure the route is traced:

Request span comes from middleware.

Wrap critical sections in withSpan with useful attributes.

Decide if this route needs rate limiting:

If yes, wire it through the shared rate limit helper.

Verify observability:

Can you see this route in Jaeger/Honeycomb/other OTEL backend?

Can you tell, from spans/attributes, what org/user/schedule was involved?

Keep noise under control:

Don’t wrap every tiny helper. Focus spans where they matter.

If you can answer “yes” to all of the above, your change meets the observability standard.

EOf
cd /home/patrick/fresh-root

mkdir -p docs/standards

cat > docs/standards/OBSERVABILITY_AND_TRACING_STANDARD.md << 'EOF'
# Observability & Tracing Standard

**Audience**: Senior engineers working on Fresh Root.
**Goal**: Make production behaviour observable without drowning the codebase in noise.

This document defines:

- What "critical logic" means in the context of Fresh Root.
- When to rely on the **automatic request span** vs **explicit spans** (`withSpan`).
- How to think about rate limiting and tracing together.

The expectation is that you can read TypeScript and understand distributed systems basics. This is not a tracing tutorial; it is a policy.

---

## 1. Definitions

### 1.1 Critical Logic

**Critical logic** is any code where failure or latency materially impacts:

1. **Money / contractual outcomes**

   Examples:

   - Schedule creation/update logic that affects labour cost, hours, compliance.
   - Time-off approval/denial flows.
   - Any logic that propagates to staff notifications or external systems.

2. **Security & data isolation**

   Examples:

   - Tenant isolation checks (orgId, corporate network boundaries).
   - RBAC decision points (who can publish/delete/update).
   - Access control for destructive actions (e.g. delete schedule, revoke access).

3. **Latency-sensitive user flows**

   Examples:

   - Onboarding endpoints: `create-network-org`, `create-network-corporate`, `activate-network`.
   - Schedule/shifts reads that drive the main dashboards.
   - Any hot path that is part of the "schedule in <5 minutes" promise.

4. **External dependencies**

   Examples:

   - Future integrations: payroll, messaging, payments, analytics.
   - Any third-party API call that can time out, fail, or get rate-limited.

If you would write a post-mortem about it when it fails or is slow, it is **critical logic**.

---

## 2. Tracing Model

### 2.1 Request-Level Spans

Your middleware + `traceFn` (`apps/web/app/api/_shared/otel.ts`) are responsible for emitting a **request-level span** per API call, roughly of the form:

- `HTTP <METHOD> <route>`

This span captures:

- HTTP method, route, status code.
- End-to-end duration for the handler.

This is **mandatory** for all API routes; do not remove or bypass it.

### 2.2 Internal Spans (`withSpan`)

`withSpan` exists to make **critical internal steps** visible within the request span.

Use it to wrap:

1. **Auth and RBAC gates**

   - `requireSession` implementations.
   - Role/permission checks before mutating data.
   - Any cross-tenant boundary enforcement.

2. **Domain operations**

   - Schedule creation/update/publish pipelines.
   - Labour budget and hours computation.
   - Time-off flows and other HR-adjacent workflows.

3. **External calls**

   - Any non-trivial call across the network (present or future integrations).
   - Any Redis operations that represent a business decision rather than simple caching.

4. **Known hot spots**

   - Any code path that has historically been slow or flaky.
   - Any code path that runs in O(N) over schedules/shifts and might become an issue at scale.

### 2.3 Non-Critical Logic

Do **not** wrap trivial helpers or obvious one-liners in spans.

Examples of things that do *not* get their own span:

- Pure data reshaping, formatting, or validation helpers.
- Small, local utility functions that are clearly cheap and not business-sensitive.
- Simple, inline calculations inside a span that already covers the surrounding operation.

---

## 3. Usage Patterns

### 3.1 Request Span + Critical Inner Spans

**Pattern**:

1. Request handler entry: request-level span via middleware / `traceFn`.
2. Within the handler, wrap critical steps in `withSpan`.

Example structure (illustrative, not exact code):

```ts
// High-level: created by middleware
HTTP POST /api/schedules
  ├─ auth.requireSession
  ├─ rbac.checkPermissions
  ├─ schedules.validatePayload
  ├─ schedules.writeToFirestore
  └─ schedules.recalculateLaborBudget
This is what you should see in Jaeger/Honeycomb/etc. when debugging.

3.2 Attributes
When calling withSpan, attach attributes that make debugging useful:

tenant.orgId

tenant.corporateId (if applicable)

user.uid

schedule.id, shift.id, etc.

Any key identifiers relevant to the operation (e.g. weekStart, locationId).

If you would filter/search by it when debugging, it should probably be an attribute.

4. Rate Limiting & Observability
4.1 Rate Limiting Strategy
We have a dual-mode rate limiter (apps/web/src/lib/api/rate-limit.ts):

Dev / single-instance: in-memory limiter (simple Map).

Production / multi-instance: Redis-backed limiter using REDIS_URL.

Requirements:

In production, when deployed behind a load balancer with multiple instances, REDIS_URL must be set and reachable.

Rate limiting keys must be derived in a way that makes business sense:

Per IP for general abuse protection.

Potentially per user or per org for more granular quotas.

4.2 Where to Apply Rate Limiting
Apply rate limiting at the API boundary on routes that:

Trigger expensive computations.

Modify data (POST, PUT, PATCH, DELETE).

Are commonly targeted in abuse scenarios:

Login / session creation.

Onboarding endpoints.

Publicly accessible endpoints.

Use route-level wrappers (e.g. withRateLimit) rather than ad-hoc calls inside the handler body, to keep rate limiting and business logic separated.

4.3 Tracing & Rate Limiting Together
Any route that is both:

Critical (as defined in §1.1) and

Rate limited

should have:

A request-level span.

At least one inner span that covers the main domain operation.

Logging/attributes that let you see when 429s are being generated and why.

This allows you to distinguish:

Genuine DDoS/abuse.

Overly aggressive rate limits.

Actual system bottlenecks.

5. Operational Guarantees
5.1 Environment
The environment is validated via packages/env/src/index.ts:

Required values must be present in production.

Optional values (e.g. REDIS_URL, OTEL_EXPORTER_OTLP_ENDPOINT) gate features:

No Redis → in-memory rate limiting only (single-instance acceptable).

No OTEL endpoint → tracing no-ops, but code still runs.

Engineering expectation:

Do not scatter process.env usage. Prefer the typed env object.

Fail fast if essential config is missing, rather than trying to limp along.

5.2 Baseline Expectations in Production
Before treating an environment as production-grade:

Request-level spans are emitted for all API routes.

Critical paths have at least one inner span (withSpan).

Redis-backed rate limiting is enabled for any multi-instance deployment.

Env validation is wired such that misconfiguration crashes early.

Anything less than the above is beta or pre-production.

6. Engineering Checklist
When you add or modify a critical feature:

Identify the critical logic:

Is this money/contract/security/latency sensitive?

Ensure the route is traced:

Request span comes from middleware.

Wrap critical sections in withSpan with useful attributes.

Decide if this route needs rate limiting:

If yes, wire it through the shared rate limit helper.

Verify observability:

Can you see this route in Jaeger/Honeycomb/other OTEL backend?

Can you tell, from spans/attributes, what org/user/schedule was involved?

Keep noise under control:

Don’t wrap every tiny helper. Focus spans where they matter.

If you can answer “yes” to all of the above, your change meets the observability standard.

````
