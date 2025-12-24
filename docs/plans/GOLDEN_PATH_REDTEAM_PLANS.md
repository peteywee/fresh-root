# 🔴 Golden Path E2E — Red Team Review Plans

> **Generated:** 2025-12-20  
> **Core Values:** Speed • Accuracy • Efficiency • Security  
> **Purpose:** Select best plan for implementation

---

## 🧭 Red Team Protocol (How We Run This)

### Scope (Default)

- Targets: API routes under `/api/*`, auth/session, org scoping, rate limiting, error contract, and
  the “golden path” CRUD lifecycle.
- Exclusions unless explicitly approved: destructive prod actions, non-emulated third-party
  integrations, load testing beyond basic rate-limit validation.

### Rules of Engagement

- No secrets exfiltration attempts beyond validation of access control boundaries.
- No fuzzing that destabilizes shared dev environments; prefer isolated runs.
- All findings must include a reproduction script (curl or test), expected vs actual, and a
  recommended fix.

### Success Criteria (Exit)

- Authenticated CRUD exists in golden path tests (create → read → delete + logout).
- Error responses are machine-parseable (stable `error.code`, `error.message`, optional `details`).
- Abuse controls are validated (429 with Retry-After; no silent bypass).
- Org boundary holds (wrong-org access returns 403/NOT_FOUND as designed).

### Reporting Protocol

- Severity rubric:
  - P0: Auth bypass, cross-org data exposure, privilege escalation.
  - P1: Broken rate limiting, inconsistent error contract causing unsafe client behavior.
  - P2: Validation gaps, missing negative tests, flaky test architecture.
- Deliverables per finding:
  - Title, severity, impacted endpoints, steps to reproduce, evidence, fix guidance, verification
    steps.

### Handoff Packet Checklist (What Red Team Receives)

- Current “golden path” narrative (what success looks like)
- Known gaps and non-goals
- How to run: `pnpm typecheck`, relevant e2e command(s), emulator instructions
- Expected error contract examples

---

## 👥 Teams (Who Does What)

### Team 1 — Auth & Session

- Validate login/logout semantics, token/cookie handling, auth-required endpoints.
- Negative tests: expired token, malformed token, missing token.

### Team 2 — Org Boundary & Authorization

- Cross-org access attempts across org-scoped endpoints.
- Role boundary checks (staff/manager/admin) and least-privilege verification.

### Team 3 — Deep Analysis (Background)

- Goal: Catch “minor” issues that create outsized bug impact (silent data corruption, contract
  drift, edge-case auth failures).
- Tactics:
  - Review golden-path coverage for missing state transitions (create/read/update/delete/logout) and
    invariants.
  - Probe concurrency and idempotency edges (double-submit, retry storms, replay with same body).
  - Validate error semantics at boundaries (wrong-org vs not-found, validation vs forbidden).
  - Scan for inconsistent shapes/fields across endpoints (contract drift) that can break clients.
- Output: A short “Bug-Impact Findings” appendix (P2/P3) with reproduction steps and a suggested
  test to prevent regression.

### Team 4 — Abuse / Rate Limit / Replay

- Confirm 429 behavior, Retry-After correctness, and no trivial bypass.
- Repeat-request/replay patterns on write endpoints.

### Team 5 — Contract & Error Semantics

- Enforce consistent error shape and stable error codes.
- Confirm clients can safely branch on `error.code`.

### Team 6 — Test Quality (Flake + Coverage)

- Identify flake sources, missing assertions, false positives.
- Confirm tests fail when invariants break (no “always-pass” tests).

---

## 🗂️ Engagement Versions (Choose One Before Sending to Red Team)

### Version 1 — Rapid Triage (2–4 hours)

- Goal: Find “showstopper” security/contract failures fast.
- Team: 2 people (Auth+Org).
- Deliverables: 5–10 findings max, prioritized P0/P1 only, each with reproduction steps.

### Version 2 — Standard Review (1–2 days)

- Goal: Validate golden path, error contract, and top abuse cases.
- Team: 4 people (Teams 1–2 + 4–5) with Team 3 running in background.
- Deliverables: Full report + recommended fixes + verification checklist; identify missing tests.

### Version 3 — Deep Drill (5–10 days)

- Goal: Systematically probe authorization, abuse controls, and test reliability.
- Team: 5+ people (Teams 1–6).
- Deliverables: Threat model deltas, regression test plan, and “must-fix before release” gates.

---

## 📋 Issues Identified

| #   | Issue                                   | Current State                                                   | Impact                               |
| --- | --------------------------------------- | --------------------------------------------------------------- | ------------------------------------ |
| 1   | **No DELETE in golden path**            | Flow ends at PUBLISH, skips cleanup                             | Data leaks, no teardown verification |
| 2   | **Redundant POST on publish**           | Diagram shows POST twice confusingly                            | Visual error, no functional issue    |
| 3   | **DELETE should be on /schedules/[id]** | DELETE exists but not tested in flow                            | CRUD incomplete                      |
| 4   | **Error codes are inconsistent**        | Mix of `{ error: "string" }` and `{ error: { code, message } }` | Poor DX, hard to parse               |
| 5   | **Auth fixture not wired**              | EXISTS but unused                                               | Zero authenticated tests             |
| 6   | **Tests are garbage**                   | Only 401 rejection tested                                       | False confidence                     |

---

## 🎯 Plan A: Minimal Fix — Flow Diagram + DELETE Test

**Philosophy:** Smallest change, fastest ship  
**Effort:** 2 hours  
**Risk:** Low

### Changes

1. **Fix flow diagram** — Remove redundant boxes, add DELETE at end
2. **Add 1 DELETE test** — `DELETE /api/schedules/[id]` returns 401 without auth

### Pros

- Ships today
- No breaking changes
- Incremental progress

### Cons

- Still no authenticated tests
- Error codes still inconsistent
- Doesn't solve root cause

### Core Value Score

| Value      | Score      | Reason              |
| ---------- | ---------- | ------------------- |
| Speed      | ⭐⭐⭐⭐⭐ | 2 hrs               |
| Accuracy   | ⭐⭐       | Still incomplete    |
| Efficiency | ⭐⭐⭐     | Minimal rework      |
| Security   | ⭐⭐       | Auth still untested |

Total: 12/20

---

## 🎯 Plan B: Auth-First — Wire Fixtures + Full CRUD

**Philosophy:** Fix the foundation before adding features  
**Effort:** 6 hours  
**Risk:** Medium

### Changes

1. **Wire auth fixture** to `golden-path.e2e.test.ts`
2. **Add authenticated login test** — POST /api/session with valid creds
3. **Add full CRUD sequence:**
   - POST /api/organizations → create org
   - POST /api/schedules → create schedule
   - POST /api/shifts → create shift
   - GET /api/schedules/[id] → verify
   - DELETE /api/schedules/[id] → cleanup
   - DELETE /api/session → logout
4. **Fix flow diagram** — Correct visual

### Pros

- Solves root cause (no auth testing)
- Full CRUD lifecycle verified
- DELETE properly tested
- Reusable pattern for other tests

### Cons

- Requires Firebase Emulator in CI
- 6 hours of work
- Error codes still inconsistent

### Core Value Score

| Value      | Score    | Reason                   |
| ---------- | -------- | ------------------------ |
| Speed      | ⭐⭐⭐   | 6 hrs                    |
| Accuracy   | ⭐⭐⭐⭐ | Full CRUD tested         |
| Efficiency | ⭐⭐⭐⭐ | Foundation for all tests |
| Security   | ⭐⭐⭐⭐ | Auth flow verified       |

Total: 15/20

---

## 🎯 Plan C: Error Code Standardization + CRUD

**Philosophy:** Fix API contract first, tests follow  
**Effort:** 8 hours  
**Risk:** Medium-High

### Changes

1. **Standardize error responses** across ALL endpoints:

   ```typescript
   // BEFORE: Inconsistent
   { error: "Rate limit exceeded" }        // string
   { error: { code: "FORBIDDEN", message } } // object

   // AFTER: Consistent
   {
     error: {
       code: "RATE_LIMITED" | "FORBIDDEN" | "VALIDATION_ERROR" | "UNAUTHORIZED" | "INTERNAL_ERROR",
       message: string,
       requestId: string,
       retryable: boolean,
       details?: Record<string, string[]>
     }
   }
   ```

2. **Create error code enum:**

   ```typescript
   export const ErrorCodes = {
     // 4xx Client Errors
     VALIDATION_ERROR: 400,
     UNAUTHORIZED: 401,
     FORBIDDEN: 403,
     NOT_FOUND: 404,
     METHOD_NOT_ALLOWED: 405,
     CONFLICT: 409,
     RATE_LIMITED: 429,
     // 5xx Server Errors
     INTERNAL_ERROR: 500,
     SERVICE_UNAVAILABLE: 503,
   } as const;
   ```

3. **Update all routes** to use standardized errors
4. **Add tests** for error responses
5. **Wire auth + add CRUD tests**
6. **Fix flow diagram**

### Pros

- API contract is clean and parseable
- Frontend can switch on error codes
- Tests verify error contract
- Full CRUD coverage

### Cons

- 8 hours of work
- Touches many files
- Breaking change for existing clients (if any)
- Higher risk of regression

### Core Value Score

| Value      | Score      | Reason                  |
| ---------- | ---------- | ----------------------- |
| Speed      | ⭐⭐       | 8 hrs                   |
| Accuracy   | ⭐⭐⭐⭐⭐ | Clean API contract      |
| Efficiency | ⭐⭐⭐     | Rework now, clean later |
| Security   | ⭐⭐⭐⭐   | Auth + error codes      |

Total: 14/20

---

## 🎯 Plan D: Full Overhaul — Tests as Specification

**Philosophy:** Tests define the contract, implementation follows  
**Effort:** 12 hours  
**Risk:** High

### Changes

1. **Create test specification file:**

   ```markdown
   # API Contract Specification

   ## /api/session

   POST: Login with Firebase ID token

   - 200: { session: { userId, expiresAt } }
   - 400: { error: { code: "VALIDATION_ERROR", ... } }
   - 401: { error: { code: "UNAUTHORIZED", ... } }

   DELETE: Logout

   - 204: No content
   - 401: { error: { code: "UNAUTHORIZED", ... } }

   ## /api/schedules

   GET: List schedules (requires auth + org)

   - 200: { data: Schedule[], meta: { total, page } }
   - 401: Unauthorized
   - 403: Forbidden (wrong org) ...
   ```

2. **Generate tests from specification**
3. **Fix all failing tests** (implementation follows spec)
4. **Wire auth fixture**
5. **Add DELETE to golden path**
6. **Standardize all error codes**
7. **Add security tests:**
   - Cross-org access attempts → 403
   - Expired token → 401
   - Rate limiting → 429
   - SQL injection attempts → sanitized

### Pros

- Specification-first development
- Complete coverage
- Security explicitly tested
- Error codes fully standardized

### Cons

- 12 hours minimum
- High risk of scope creep
- Blocks other work
- Overkill for current stage

### Core Value Score

| Value      | Score      | Reason                  |
| ---------- | ---------- | ----------------------- |
| Speed      | ⭐         | 12+ hrs                 |
| Accuracy   | ⭐⭐⭐⭐⭐ | Spec-driven             |
| Efficiency | ⭐⭐       | High upfront cost       |
| Security   | ⭐⭐⭐⭐⭐ | Explicit security tests |

Total: 13/20

---

## 🎯 Plan B+C: Auth-First + Error Standardization ⭐ SELECTED

**Philosophy:** Fix auth foundation AND clean up error contract in one pass  
**Effort:** 10 hours  
**Risk:** Medium

### Changes

#### Phase 1: Error Code Infrastructure (2 hrs)

1. **Create standardized error types:**

   ```typescript
   // packages/api-framework/src/errors.ts
   export const ErrorCode = {
     VALIDATION_ERROR: 400,
     UNAUTHORIZED: 401,
     FORBIDDEN: 403,
     NOT_FOUND: 404,
     METHOD_NOT_ALLOWED: 405,
     CONFLICT: 409,
     RATE_LIMITED: 429,
     INTERNAL_ERROR: 500,
   } as const;

   export type ErrorCode = keyof typeof ErrorCode;

   export interface ApiErrorResponse {
     error: {
       code: ErrorCode;
       message: string;
       requestId: string;
       retryable: boolean;
       details?: Record<string, string[]>;
     };
   }
   ```

2. **Update `createErrorResponse`** to enforce consistent shape

3. **Fix inconsistent error returns:**

```typescript
 // BEFORE (scattered across routes)
 { error: "Rate limit exceeded" }           // ❌ string
 { error: { code: "FORBIDDEN", message } }  // ✅ object

 // AFTER (all routes)
 { error: { code: "RATE_LIMITED", message: "Rate limit exceeded", ... } }
```

#### Phase 2: Auth Fixture Wiring (2 hrs)

4. **Wire auth fixture** to `golden-path.e2e.test.ts`
5. **Add authenticated login test** — POST /api/session
6. **Store session cookie** for subsequent requests

#### Phase 3: Full CRUD Tests (4 hrs)

7. **Add org creation test:**
   - POST /api/organizations → 201
   - Store orgId

8. **Add schedule CRUD tests:**
   - POST /api/schedules → 201
   - GET /api/schedules/[id] → 200
   - PATCH /api/schedules/[id] → 200
   - DELETE /api/schedules/[id] → 204

9. **Add error code verification:**
   - Verify 401 returns `{ error: { code: "UNAUTHORIZED", ... } }`
   - Verify 403 returns `{ error: { code: "FORBIDDEN", ... } }`
   - Verify 429 returns `{ error: { code: "RATE_LIMITED", ... } }`

10. **Add logout test:**
    - DELETE /api/session → 204
    - Verify subsequent requests get 401

#### Phase 4: Cleanup (2 hrs)

11. **Fix flow diagram** — Add DELETE, remove redundancy
12. **Update all route files** with consistent error returns
13. **Run full test suite** — Verify no regressions

### Routes Requiring Error Fixes

| Route                     | Current Error Format               | Fix                                          |
| ------------------------- | ---------------------------------- | -------------------------------------------- |
| `/api/attendance`         | `{ error: "string" }`              | → `{ error: { code, message } }`             |
| `/api/widgets`            | `{ error: "string" }`              | → `{ error: { code, message } }`             |
| `/api/positions/[id]`     | `{ error: "Rate limit exceeded" }` | → `{ error: { code: "RATE_LIMITED", ... } }` |
| `/api/schedules`          | Mixed                              | Standardize                                  |
| `/api/organizations/[id]` | `{ error: { code, message } }` ✅  | Already correct                              |

### Pros

- Fixes BOTH root causes in one PR
- Auth testing enabled
- Error contract is clean and parseable
- DELETE properly tested
- Frontend can switch on error codes
- Security validated

### Cons

- 10 hours (not 6 or 8)
- Touches more files than Plan B alone
- Slightly higher regression risk

### Core Value Score

| Value      | Score      | Reason                         |
| ---------- | ---------- | ------------------------------ |
| Speed      | ⭐⭐⭐     | 10 hrs (acceptable)            |
| Accuracy   | ⭐⭐⭐⭐⭐ | Clean API contract + full CRUD |
| Efficiency | ⭐⭐⭐⭐   | One PR, two problems solved    |
| Security   | ⭐⭐⭐⭐⭐ | Auth + consistent error codes  |

Total: 17/20 ⭐ HIGHEST SCORE

---

## 📊 Plan Comparison Matrix

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PLAN COMPARISON MATRIX                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  EFFORT vs IMPACT                                                            │
│                                                                              │
│  Impact │                                                                    │
│    ▲    │                              ┌───┐                                 │
│    │    │                              │ D │  Full Overhaul                  │
│    │    │                     ┌─────┐  └───┘                                 │
│  HIGH   │                     │ B+C │  ⭐ SELECTED                           │
│    │    │              ┌───┐  └─────┘                                        │
│    │    │              │ B │  Auth-First                                     │
│    │    │              └───┘     ┌───┐                                       │
│    │    │                        │ C │  Error Standardization                │
│    │    │                        └───┘                                       │
│  MED    │                                                                    │
│    │    │  ┌───┐                                                             │
│    │    │  │ A │  Minimal Fix                                                │
│    │    │  └───┘                                                             │
│  LOW    │                                                                    │
│    │    └────────────────────────────────────────────────────────────────▶   │
│         LOW                    MED                    HIGH          Effort   │
│         (2 hrs)               (6-10 hrs)             (12+ hrs)               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏆 SELECTED: Plan B+C (Auth-First + Error Standardization)

### Why B+C Wins

1. **Highest Score:** 17/20 — beats all individual plans
2. **Two problems, one PR:** Auth testing + error standardization
3. **DELETE is included:** Full CRUD with cleanup
4. **Clean API contract:** Frontend can switch on error codes
5. **Security validated:** Auth flow + consistent error responses

### Why Not Others

| Plan              | Rejection Reason                                |
| ----------------- | ----------------------------------------------- |
| A (Minimal)       | Kicks can down road, doesn't solve real problem |
| B (Auth Only)     | Misses opportunity to fix error codes           |
| C (Errors Only)   | Doesn't enable auth testing                     |
| D (Full Overhaul) | Overkill, blocks other work, scope creep risk   |

---

## 📝 Plan B+C Implementation Checklist

### Phase 1: Error Code Infrastructure (2 hrs)

```text
[ ] 1. Create error types in packages/api-framework/src/errors.ts
    - ErrorCode enum with HTTP status mapping
    - ApiErrorResponse interface
    - Helper functions: unauthorized(), forbidden(), rateLimited()

[ ] 2. Update createErrorResponse in index.ts
    - Enforce consistent shape
    - Add requestId to all errors
    - Add retryable flag

[ ] 3. Fix routes with string errors
    - /api/attendance → { error: { code, message } }
    - /api/widgets → { error: { code, message } }
    - /api/positions/[id] rate limit → RATE_LIMITED
```

### Phase 2: Auth Fixture Wiring (2 hrs)

```text
[ ] 4. Wire auth fixture to golden-path.e2e.test.ts
    - Import from fixtures/auth.ts
    - Add beforeAll: setupAuthFixture()
    - Add afterAll: teardownAuthFixture()

[ ] 5. Add authenticated login test
    - POST /api/session with Firebase ID token
    - Store session cookie for subsequent requests
    - Verify 200 response with session data
```

### Phase 3: Full CRUD Tests (4 hrs)

```text
[ ] 6. Add org creation test
    - POST /api/organizations with session
    - Store orgId for cleanup
    - Verify 201 response

[ ] 7. Add schedule CRUD tests
    - POST /api/schedules → 201
    - GET /api/schedules/[id] → 200
    - PATCH /api/schedules/[id] → 200
    - DELETE /api/schedules/[id] → 204

[ ] 8. Add error code verification tests
    - Verify 401 returns { error: { code: "UNAUTHORIZED", ... } }
    - Verify 403 returns { error: { code: "FORBIDDEN", ... } }
    - Verify 429 returns { error: { code: "RATE_LIMITED", ... } }

[ ] 9. Add logout test
    - DELETE /api/session → 204
    - Verify subsequent requests get 401
```

### Phase 4: Cleanup (2 hrs)

```text
[ ] 10. Fix flow diagram
     - Remove redundant boxes
     - Add DELETE step before logout
     - Update coverage indicators

[ ] 11. Run full test suite
     - pnpm test:e2e
     - pnpm typecheck
     - pnpm lint
     - Verify all pass
```

---

## 🔒 Security Considerations

| Test                       | Expected Result | Error Code       |
| -------------------------- | --------------- | ---------------- |
| Request without auth       | 401             | UNAUTHORIZED     |
| Request with expired token | 401             | UNAUTHORIZED     |
| Request to wrong org       | 403             | FORBIDDEN        |
| Request after logout       | 401             | UNAUTHORIZED     |
| Rate limit exceeded        | 429             | RATE_LIMITED     |
| Invalid request body       | 400             | VALIDATION_ERROR |

---

## ⏭️ Future Work (After B+C)

1. **Cross-org security tests** — Ensure org scoping works
2. **Rate limit tests** — Verify Redis rate limiting
3. **Batch endpoint tests** — Add missing batch.e2e.test.ts
4. **Admin endpoint tests** — Add ops/\*.e2e.test.ts
5. **MFA flow tests** — Verify 2FA setup/verify

---

## 📎 Appendix A — Team 3 Background Deep Analysis (Bug-Impact Findings)

This appendix is intentionally focused on “small-looking” inconsistencies that can cause large bug
impact: contract drift, incorrect status codes, and endpoints that return successful responses
without verifying existence/ownership.

### A1) Invalid token returns HTTP 500 with `error.code = UNAUTHORIZED`

- Evidence: `POST /api/session` returns
  `serverError("Invalid token or internal error", ..., "UNAUTHORIZED")` which hard-codes HTTP 500.
- Why it matters: Clients and intermediaries will treat auth failure as a server outage (retries,
  circuit breakers, noisy alerts). Also breaks “branch on 401” logic.
- Repro:
  - `POST /api/session` with an invalid `idToken`.
  - Observe HTTP 500 with an auth-ish code.
- Expected:
  - HTTP 401 with `{ error: { code: "UNAUTHORIZED", message } }`.
- Suggested regression test:
  - Add an e2e test that submits a known-bad token and asserts HTTP 401 +
    `error.code === "UNAUTHORIZED"`.

### A2) `GET /api/schedules/[id]` does not verify existence and returns mock data

- Evidence: The handler returns a hard-coded schedule object (e.g. `name: "Q1 2025 Schedule"`) and
  does not query Firestore.
- Why it matters: A “read after write” golden-path test can pass even if persistence is broken;
  clients may behave as if schedules exist when they don’t.
- Repro:
  - `GET /api/schedules/does-not-exist` while authenticated.
  - Observe HTTP 200 with mock payload.
- Expected:
  - HTTP 404 (or 403/404 per org boundary policy) when ID does not exist.
- Suggested regression tests:
  - Create schedule → read by id should return same `id` + persisted fields.
  - Unknown id → 404 with `error.code === "NOT_FOUND"`.

### A3) Field drift: schedule “state” vs “status”

- Evidence: `POST /api/schedules` writes `state: "draft"`, but `GET /api/schedules/[id]` returns
  `status: "draft"`.
- Why it matters: UI/client code will fork on one field, causing silent bugs (filters, rendering,
  publish flow logic).
- Suggested regression test:
  - Assert a single canonical field name across list/create/detail responses.

### A4) `GET /api/shifts/[id]` returns a sample payload for any ID

- Evidence: The handler returns `{ name: "Sample Shift", ... }` without verifying the ID exists.
- Why it matters: Same “false confidence” problem as schedules; also breaks negative tests and
  client error handling.
- Repro:
  - `GET /api/shifts/does-not-exist` while authenticated.
  - Observe HTTP 200.
- Expected:
  - HTTP 404 with `error.code === "NOT_FOUND"`.

### A5) Path-param org endpoints may not validate `params.id` matches org context

- Evidence: `GET /api/organizations/[id]` returns `id: params.id` while org context is derived
  elsewhere; there is no explicit guard that `params.id === context.org.orgId`.
- Why it matters: Even without true data exposure, it creates correctness bugs (client shows org
  “id” that user doesn’t belong to) and can mask broken authorization.
- Suggested regression tests:
  - Request org detail with a mismatched `id` should return 403 or 404 (decide policy), never 200.

### A6) Response-contract drift still exists outside the golden-path routes

- Evidence:
  - `GET /api/ops/build-performance` returns `{ ok: false, error: "Failed to load..." }` (string
    error field).
  - Legacy rate limiter middleware returns
    `{ error: "Too Many Requests", message: "Rate limit exceeded..." }`.
  - There are multiple response helper systems (`_shared/validation.ts` vs `_shared/response.ts`).
- Why it matters: Client wrappers (like typed fetch) often assume a single error shape; drift
  creates “works in one area, breaks in another” bugs.
- Suggested approach:
  - Decide whether ops/legacy endpoints are exempt from the main API error contract. If not exempt,
    standardize their errors to `{ error: { code, message, details? } }`.
  - Add a single contract test that iterates a small allowlist of representative endpoints and
    asserts error shape on non-2xx.

## ✅ APPROVED — Starting Implementation

**Status:** Plan B+C selected and implemented (pending red team review)  
**Effort:** 10 hours (estimated)  
**Score:** 17/20 (Highest)

---

_Document updated 2025-12-20. Core values (Speed • Accuracy • Efficiency • Security) guide all
recommendations._
