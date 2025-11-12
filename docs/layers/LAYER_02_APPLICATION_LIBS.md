# LAYER_02_APPLICATION_LIBS

## Purpose

Application Libraries implement the **core behavior of the app**: onboarding, scheduling, attendance logic, authorization, rate limiting, and error handling, in a way that is independent of HTTP routes and UI components.

This layer turns:

- Domain types (Layer 00)
- Infrastructure capabilities (Layer 01)

into **concrete use-cases** like:

- "Create a network and org"
- "Calculate allowed labor for a week"
- "Record attendance safely"
- "Enforce org membership and roles"

## Scope

This layer includes (non-exhaustive):

- `apps/web/src/lib/api/**`
  - `session.ts`
  - `authorization.ts`
  - `csrf.ts`
  - `redis.ts`, `redis-rate-limit.ts`
  - `index.ts` (API helpers barrel)

- `apps/web/src/lib/onboarding/**`
  - `createNetworkOrg.ts`
  - `userOnboarding.ts`
  - `adminFormDrafts.ts`

- `apps/web/src/lib/error/**`
  - `ErrorContext.tsx` (if present and logic-focused)
  - `reporting.ts`

- `apps/web/src/lib/storage/**`
  - `kv.ts` (if used as generic storage)

- `apps/web/src/lib/store.ts` (shared state/store, if used across app logic)

- Any other non-React, non-route logic under `apps/web/src/lib/**` that composes domain + infra into reusable behaviors.

Not in scope:

- Next.js route handlers under `app/api/**` (Layer 03).
- React components or pages under `app/**` and `components/**` (Layer 04).

## Inputs

Application Libraries consume:

- **Domain Kernel**:
  - Types and schemas from `@fresh-schedules/types`

- **Infrastructure**:
  - Firebase server adapters (`firebase.server.ts`)
  - Env accessors (`env.server.ts`, `env.ts`)
  - Redis adapters, storage utilities, logger, telemetry hooks

- **Context from API layer** (as arguments, not imports):
  - Authenticated user/session info
  - Org/venue identifiers
  - Request payloads already validated against Zod schemas

They do **not** consume `NextRequest`, `NextResponse`, or React components directly.

## Outputs

Application Libraries produce:

1. **Use-case Functions**
   - Example:
     - `createNetworkOrg(input, context)`
     - `getUserOnboardingState(userId)`
     - `recordAttendance(input, context)`
   - These functions encapsulate a full business operation.

2. **Authorization Utilities**
   - Helpers such as `requireOrgMembership`, `requireRole`, `requireSession` (exported via `apps/web/src/lib/api/index.ts`), which enforce RBAC and membership based on domain types + infra.

3. **Rate Limiting / Security Utilities**
   - `createRateLimiter(config)`
   - CSRF helpers
   - Redis-based throttle logic

4. **Error Handling Primitives**
   - Functions for reporting errors
   - Domain-specific error types or wrappers

5. **Labor & Scheduling Calculations**

- Pure computational helpers that derive planning constraints (e.g., allowed labor budget)
- Example: `computeLaborBudget(forecastSales, laborPercent, avgWage)` returns `{ allowedDollars, allowedHours }`
- These remain framework-agnostic and side-effect free, enabling easy unit testing and reuse in API + UI layers.

All outputs are designed to be **called** from Layer 03 (API) and indirectly from Layer 04 (UI) through service hooks.

## Dependencies

Allowed dependencies:

- `@fresh-schedules/types` (Layer 00)
- Infrastructure adapters in Layer 01:
  - `apps/web/src/lib/env*.ts`
  - `apps/web/src/lib/firebase.server.ts`
  - `apps/web/src/lib/logger.ts`
  - `apps/web/src/lib/otel.ts`
  - Infra utilities exposed from `services/api` when needed
- Utility libraries (date/time, math, etc.)

Forbidden dependencies:

- `apps/web/app/**` (no direct route imports)
- `apps/web/components/**` (no React component imports)
- `next/*` (no direct NextRequest/NextResponse usage here)

Application logic must be framework-agnostic and testable without spinning up Next.js.

## Consumers

Application Libraries are consumed by:

- **Layer 03 – API Edge**
  - API routes call application functions to perform business actions.

- **Layer 04 – UI/UX**
  - UI imports app libs (directly or via hooks) to perform client-initiated actions (e.g., submit onboarding, create schedule, fetch data).

This layer sits in the middle and should not be skipped. Any business operation should pass through it.

## Invariants

1. **No Framework Entanglement**
   - No imports from React, `next/*`, or `app/api/**` files.
   - Logic is pure TS/JS + domain + infra.

2. **Single Responsibility per Function**
   - Each exported function represents a clear use-case, not a grab bag.

3. **Domain-Driven APIs**
   - Function signatures use domain types (`OrgId`, `VenueId`, `AttendanceRecordInput`) rather than raw `any` or untyped objects.

4. **Isolation of Side Effects**
   - All I/O (Firestore, Redis, etc.) is handled via Layer 01 adapters.
   - Application libs do not embed raw SDK calls; they use infra helpers.

5. **Testability**
   - Functions can be tested by mocking:
     - Domain types
     - Infra adapters
   - No direct dependency on runtime/environment or HTTP.

6. **Security-by-Default**
   - Authorization helpers (e.g., `requireOrgMembership`) must default to **deny** on missing/invalid context.
   - No function should assume a user is allowed; permission checks are explicit.

### Utility Spotlight: `computeLaborBudget`

Purpose: Provide a deterministic planning figure for weekly labor allocation based on forecast sales, target labor percent, and average wage.

Contract:

- Inputs:
  - `forecastSales: number >= 0`
  - `laborPercent: number in [0, 100]` (percentage of sales allocated to labor)
  - `avgWage: number > 0` (average hourly wage for staff)
- Output: `{ allowedDollars: number, allowedHours: number }`
  - `allowedDollars = forecastSales * (laborPercent / 100)`
  - `allowedHours = allowedDollars / avgWage`
- Errors: Throws `RangeError` when inputs violate their numeric constraints (negative sales, percent out of range, non-positive wage).

Edge Cases Covered in Tests:

- Zero sales (results in zero dollars & hours)
- Boundary laborPercent values (0% and 100%)
- Invalid percent (<0 or >100) rejected
- Negative sales rejected
- Non-positive average wage rejected

Rationale: Centralizing this calculation in Layer 02 ensures consistent labor planning across API endpoints and UI views while keeping the logic pure and testable.

## Change Log

| Date       | Author         | Change                       |
| ---------- | -------------- | ---------------------------- |
| 2025-11-11 | Patrick Craven | Initial v15 layer definition |
| 2025-11-12 | Copilot (agent) | Added labor calculation utility section & `computeLaborBudget` spotlight |
