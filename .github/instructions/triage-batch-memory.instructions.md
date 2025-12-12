---
applyTo: "**/apps/web/**, **/packages/types/**"
description:
  "Memory file for triage and batch endpoint patterns, testing best practices, and fixes applied for
  schema/api/tests triad issues."
priority: 2
---

# Triage & Batch Endpoint Memory

Tagline: Practical patterns for triaging API triad (schema → API → rules), creating batch endpoints,
and testing them reliably.

## TL;DR

- When triaging multiple PRs that touch API routes, prioritize the Triad of Trust: ensure a
  canonical `zod` schema (types), API route uses `createEndpoint/createOrgEndpoint` with `input`
  configured, and Firestore rules match the intended behavior.
- For new batch endpoints, expose an explicit `batch` schema in the `packages/types` module and add
  both: an endpoint route and a small exported helper to make unit testing easier.

## What I did (Action steps taken)

1. Identified triad Tier 0 issues in multiple PRs (missing `input` validation on write endpoints);
   created `fix/triad-remediation` branch to consolidate changes.
2. Added a new canonical `BatchItemSchema` and `CreateBatchSchema` in `packages/types/src/batch.ts`
   and exported it from `packages/types/src/index.ts`.
3. Added a new endpoint: `apps/web/app/api/batch/route.ts` using `createEndpoint` with
   `input: CreateBatchSchema` and a `createBatchHandler` from `@fresh-schedules/api-framework`.
4. Adjusted `apps/web/src/types/fresh-schedules-types.d.ts` shim to include runtime exports for
   `CreateBatchSchema` so TypeScript in apps/web can reference the types.
5. Created `processBatchItems` helper (exported) to test batch processing directly and avoid test
   flakiness due to middleware, CSRF, or auth.
6. Wrote a minimal Vitest integration test calling `processBatchItems` to validate the handler
   logic.
7. Ran the triad validator and TypeScript typecheck; fixed errors caused by missing exports,
   incorrect factory usage, and Request vs NextRequest types.

## What didn't work (Problems encountered & why)

- Initial TypeScript errors: `CreateBatchSchema` was not exported from `@fresh-schedules/types`,
  causing import failures and build errors.
- Middleware mismatch: using `createOrgEndpoint` but passing `auth`/`org` properties caused
  compile-time signature mismatches (since `createOrgEndpoint` is an alias of createEndpoint with
  `auth:'required', org:'required'`). When writing a testable route that does not require auth, use
  `createEndpoint` with `auth: 'optional' | 'none'` instead.
- CSRF protection caused test failures (Invalid CSRF token) when calling routes using
  `createEndpoint` that have default CSRF checks enabled; tests must either send the CSRF header and
  cookie or the endpoint should set `csrf: false` in test-only routes.
- Test execution differences: `processBatchItems` returns a plain `BatchResult` object, while the
  endpoint wrapper `createEndpoint` wraps results into `NextResponse` JSON with `{ data, meta }`.
  Tests that call helper vs. endpoint should assert accordingly.
- Type mismatch issues: passing `request as Request` vs `NextRequest` to the batch handler caused
  type mismatch errors. The `createBatchHandler` expects a `NextRequest` or a compatible shape; cast
  to `any` or pass `request` directly of the `NextRequest` type.

## Fixes and Patterns to Follow (--fix)

- Export schemas: Always export new schema files from `packages/types/src/index.ts` to keep schemas
  canonical and avoid duplicate definitions.
- Type shims: When adding new runtime schema exports, update
  `apps/web/src/types/fresh-schedules-types.d.ts` to include the shim to keep editors and apps/web
  TypeScript happy until schema package re-compiles.
- Testing strategy: For handler logic, export a small helper function (like `processBatchItems`)
  that receives strongly-typed params and returns plain JS objects; write unit tests against the
  helper to keep them independent of middleware.
- Middleware testing: For full integration (route-level) tests that use `createEndpoint` /
  `createOrgEndpoint`, ensure your test sets the required auth/CSRF state using `createMockRequest`
  helpers: set `cookies: { session: 'valid' }` and `headers: { 'x-csrf-token': <token> }` or set
  `csrf: false` for test-only endpoints. For production: never disable CSRF; prefer to mock tokens
  in tests.
- Factory usage: Use `createEndpoint` if you need to customize `auth`/`org` settings
  (none/optional). Use `createOrgEndpoint` if the route must always require auth & org context.
- Type safety: Avoid `as Request` casts — instead pass `request` as the supported `NextRequest`, or
  if necessary cast to `any` with a comment explaining the runtime reliability.

## Example Code Quick Reference

```typescript
// 1) Export schema in types package
export const BatchItemSchema = z.object({ id: z.string(), payload: z.any() });
export const CreateBatchSchema = z.object({ items: z.array(BatchItemSchema) });

// 2) Route: createEndpoint + input
export const POST = createEndpoint({ auth: 'optional', org: 'none', input: CreateBatchSchema, handler: async ({ input }) => { ... } });

// 3) Testing: helper
export async function processBatchItems(items, context, request) { return createBatchHandler(...)(items, context, request); }

```

## Test & CI commands (copyable)

```bash
# Run the validator
node scripts/validate-patterns.mjs --verbose

# Typecheck workspace
pnpm -w typecheck

# Run specific tests
pnpm -C apps/web test -- app/api/batch/__tests__/route.test.ts
```

## Notes / Caveats

- Never remove CSRF protection from a route in production just to make testing easier — instead mock
  CSRF or isolate business logic in testable helpers.
- Keep the triad in sync: if you add a schema, add tests, and consider security rules that may need
  updates.
- If you need to enable `auth`/`org` in a test, create mock auth/context helpers instead of
  weakening the route.

## Testing: Firebase auth + Firestore Mocks

Tagline: How to mock Firebase Admin auth and Firestore for `createOrgEndpoint` protected routes in
Vitest.

When validating route-level integration tests for endpoints that use `createOrgEndpoint`, the test
environment must provide both an authenticated session and a valid org membership record in
Firestore. These are common causes of 401/403 and test flakiness in integration tests.

Patterns:

- Mock both `firebase-admin` and the `firebase-admin/auth` and `firebase-admin/firestore` entry
  points if the codebase uses either granular imports or the default import. Provide mocks for
  `getAuth().verifySessionCookie` or `getAuth().verifyIdToken` (whichever your route uses). Also
  mock `getFirestore().collectionGroup(...).get()` to return a membership document with proper role.
- Always send a cookie header AND an Authorization header (bearer token) and
  `searchParams: { orgId }` to the test request when calling `createOrgEndpoint`, to be robust
  against code that expects either the cookie or the token.
- Keep tokens & cookie values stable and small; use a shared test value like `mock-session` and
  `mock-token` that your mocks accept.

Example mocks (recommended centralization in `vitest.setup.ts`):

```ts
vi.mock("firebase-admin/auth", () => ({
  getAuth: () => ({
    verifySessionCookie: async () => ({ uid: "test-user-1" }),
    verifyIdToken: async () => ({ uid: "test-user-1" }),
  }),
}));

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: () => ({
    collectionGroup: () => ({
      where: () => ({
        limit: () => ({
          get: async () => ({
            empty: false,
            docs: [
              {
                id: "mem-1",
                data: () => ({ uid: "test-user-1", orgId: "org-test", role: "manager" }),
              },
            ],
          }),
        }),
      }),
    }),
  }),
}));

// Also mock default import when code uses `import admin from 'firebase-admin'`
vi.mock("firebase-admin", () => ({
  getAuth: () => ({ verifySessionCookie: async () => ({ uid: "test-user-1" }) }),
  getFirestore: () => ({
    collectionGroup: () => ({
      where: () => ({
        limit: () => ({
          get: async () => ({
            empty: false,
            docs: [
              {
                id: "mem-1",
                data: () => ({ uid: "test-user-1", orgId: "org-test", role: "manager" }),
              },
            ],
          }),
        }),
      }),
    }),
  }),
}));
```

Test request setup:

- Use `createMockRequest` but also pass cookie (+ header) and `searchParams: { orgId }`.
- Example call:

```ts
const req = createMockRequest("/api/batch", {
  method: "POST",
  body: { items },
  cookies: { session: "mock-session" },
  headers: { cookie: "session=mock-session", authorization: "Bearer mock-token" },
  searchParams: { orgId: "org-test" },
});
```

Testing best practices:

- Centralize the Firebase mocks in `vitest.setup.ts` (or a shared helper) so they don't need to be
  redefined in every test file.
- Avoid duplicating NextRequest bodies across test calls; create per-request instances to prevent
  body stream reuse errors.
- Prefer testing the handler directly via exported helpers (like `processBatchItems`) for logic
  tests, and run a small number of route-level integration tests that assert wrapper behavior and
  authentication.
- Remove console.log debug lines once tests are stable and the correct shapes are asserted.

Suggested followups:

- Move these mocks into `apps/web/vitest.setup.ts` (or `packages/api-framework/testing` shared
  helpers) to reduce duplication.
- Add an `authTestHelpers.ts` utility that returns pre-configured `createMockRequest` with session
  cookie, header, and orgId.
- Add a lint rule or test check to prevent reusing request bodies across test calls.
- Ensure `CreateBatchSchema` is exported from `packages/types` and re-exported from the root types
  index so `apps/web` can import it reliably.

## Process Suggestions

- When multiple PRs touch the same domain (API routes), create a triage branch that consolidates
  changes, run `pnpm -w typecheck` and `node scripts/validate-patterns.mjs` early, and create small
  follow-up PRs for docs-only or test-only cleanups.

---

Generated at: 2025-12-08 by the Copilot agent during triage and remediations.
