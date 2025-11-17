# LAYER_03_API_EDGE

## Purpose

The API Edge layer is the **boundary between HTTP and the application**.
It receives HTTP/Next requests, validates and parses them, invokes Application Library use-cases, and returns HTTP responses.

It should contain **no business logic** beyond:

- Input validation
- Authentication/authorization hookup
- Mapping application results to HTTP responses

## Scope

This layer includes:

- Next.js API routes:
  - `apps/web/app/api/_shared/**`
    - `validation.ts`
    - `middleware.ts` (shared route wrappers)
  - `apps/web/app/api/attendance/route.ts`
  - `apps/web/app/api/auth/**`
  - `apps/web/app/api/health/route.ts`
  - `apps/web/app/api/internal/**`
  - Any other `/app/api/**/route.ts`

- Edge / middleware:
  - `apps/web/middleware.ts` (Next middleware enforcing session, etc.)

- Backend API entry point:
  - `services/api/src/index.ts` (if used as standalone API process)

Out of scope:

- UI components or pages (`apps/web/app/**` views).
- Pure business logic (should reside in `apps/web/src/lib/**`).

## Inputs

API Edge consumes:

- **HTTP / Next.js primitives**:
  - `NextRequest`, `NextResponse`
  - Route params, query params, headers, cookies

- **Application Libraries**:
  - Use-case functions imported from `apps/web/src/lib/api/**` and other app libs

- **Domain Schemas**:
  - Zod schemas from `@fresh-schedules/types` via `CreateAttendanceRecordSchema`, etc.

- **Middleware helpers**:
  - `requireSession`, `requireOrgMembership`, `requireRole`
  - `parseJson`, validation wrappers, CSRF helpers

## Outputs

API Edge produces:

1. **HTTP Responses**
   - JSON payloads with well-defined structure
   - Correct status codes (200, 400, 401, 403, 404, 500, etc.)

2. **Error Normalization**
   - Maps internal errors into standardized error responses
   - Avoids leaking internal details or stack traces

3. **Side-effects limited to request scope**
   - Logging scoped to request
   - Metrics/traces for API calls
   - No global state mutation beyond what app libs and infra handle

## Dependencies

Allowed dependencies:

- `@fresh-schedules/types` for request/response schemas
- `apps/web/src/lib/api/**` and other app libs (Layer 02)
- `NextRequest`, `NextResponse`, `next/server` (framework edge)
- Middleware and helper modules under `app/api/_shared/**`
- Infrastructure-level helpers if absolutely necessary (e.g. health check)

Forbidden dependencies:

- Direct imports from:
  - `apps/web/components/**`
  - `packages/types/src/**` (must use alias)
  - Raw Firebase Admin or database SDKs (should go through Layer 02/01)

No route handler should contain full business logic; it should orchestrate, not compute.

## Consumers

API Edge is consumed by:

- External clients:
  - Browsers
  - Mobile apps
  - Other backend services

- Internal UI:
  - `apps/web/app/**` pages/components calling `/api/**` endpoints

No higher "layer" in this stack; this is the external-facing edge of the system.

## Invariants

1. **Thin Controllers**
   - Route handlers must remain small:
     - Parse input
     - Call app layer
     - Format response
   - No complex business logic or cross-entity orchestration.

2. **Validation at the Edge**
   - All incoming data must be validated against Zod schemas before reaching Application Libraries.
   - Invalid data yields a clear 4xx error.

3. **Auth Before Work**
   - Authentication and authorization checks must occur before business logic.
   - Anonymous/unauthorized access is rejected early.

4. **No Domain Duplication**
   - No hand-written types or schemas for domain objects:
     - Always import from `@fresh-schedules/types`.

5. **Framework Containment**
   - Framework-specific details (Next's request/response) are contained here.
   - Application Libraries and Domain Kernel do not depend on these details.

6. **Observability**
   - API routes should emit necessary logs/metrics so production issues can be traced.
   - No silent failures.

## Change Log

| Date       | Author         | Change                       |
| ---------- | -------------- | ---------------------------- |
| 2025-11-11 | Patrick Craven | Initial v15 layer definition |
