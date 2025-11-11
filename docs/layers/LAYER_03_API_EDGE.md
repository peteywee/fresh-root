# LAYER_03_API_EDGE

**Purpose**  
Implements the HTTP boundary between clients and application logic.  
Validates requests, calls Layer 02, and returns standardized responses.

---

## 1. Scope

- `apps/web/app/api/**`
- `apps/web/app/api/_shared/**`
- `apps/web/middleware.ts`
- `services/api/src/index.ts`

---

## 2. Responsibilities

- Parse and validate requests (Zod).
- Enforce auth & RBAC guards.
- Delegate to Layer 02 use-cases.
- Shape responses for UI.

---

## 3. Inputs

- Next.js `Request` object.
- Session context from middleware.

---

## 4. Outputs

- JSON responses conforming to standard DTOs.
- Error payloads with consistent shape, e.g.:

```ts
{
  ok: false;
  code: string;
  message: string;
}
```

---

## 5. Dependencies

- `next/server`
- `zod`
- `@fresh-schedules/types`
- Layer 02 use-cases

---

## 6. Consumers

- Layer 04 UI clients.

---

## 7. Invariants

- No business logic in routes.
- Validation before execution.
- Errors standardized.

---

## 8. Example Routes

| Route                 | Action                          |
| --------------------- | ------------------------------- |
| `/api/roles`          | Create/List Roles               |
| `/api/roles/[roleId]` | Update/Delete Role              |
| `/api/attendance`     | Record Attendance (with roleId) |
| `/api/shifts`         | Create/List Shifts (with roles) |

---

## 9. Middleware

- `requireSession()` – verifies JWT idToken.
- `requireOrgMembership()` – ensures user belongs to org.
- `requireRole()` – checks RBAC.

---

## 10. Validation Checklist

- All routes return typed responses.
- Input validated with Zod.
- Uses Layer 02, not direct Firebase calls.
- 100% E2E pass for golden path.

---

## 11. Change Log

| Date       | Author         | Change            |
| ---------- | -------------- | ----------------- |
| YYYY-MM-DD | Patrick Craven | Initial L03 guide |

# LAYER_03_API_EDGE

**Purpose**
The API Edge layer is the **boundary between HTTP and the application**.
It receives HTTP/Next requests, validates and parses them, invokes Application Library use-cases, and returns HTTP responses.

It should contain **no business logic** beyond:

- Input validation
- Authentication/authorization hookup
- Mapping application results to HTTP responses

---

**Scope**

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

---

**Inputs**

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

---

**Outputs**

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

---

**Dependencies**

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

---

**Consumers**

API Edge is consumed by:

- External clients:
  - Browsers
  - Mobile apps
  - Other backend services

- Internal UI:
  - `apps/web/app/**` pages/components calling `/api/**` endpoints

No higher “layer” in this stack; this is the external-facing edge of the system.

---

**Invariants**

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
   - Framework-specific details (Next’s request/response) are contained here.
   - Application Libraries and Domain Kernel do not depend on these details.

6. **Observability**
   - API routes should emit necessary logs/metrics so production issues can be traced.
   - No silent failures.

---

**Change Log**

| Date       | Author         | Change                       |
| ---------- | -------------- | ---------------------------- |
| YYYY-MM-DD | Patrick Craven | Initial v15 layer definition |

# LAYER_03_API_EDGE

**Purpose**
Describe exactly why this layer exists and what problems it solves.

**Scope**
Which directories, modules, or files belong to it.

**Inputs**
What it consumes (events, requests, data types).

**Outputs**
What it produces (domain entities, responses, UI state).

**Dependencies**
Which other layers or systems it depends on (always downward only).

**Consumers**
Which layers depend on this layer.

**Invariants**
Rules that must never break inside this layer.

**Change Log**

| Date       | Author         | Change        |
| ---------- | -------------- | ------------- |
| YYYY-MM-DD | Patrick Craven | Initial draft |
