# API Route Standard (Next.js App Router)

## Purpose

One way to build routes: predictable inputs/outputs, centralized guards, zero SDK sprawl.

## Required Pattern

1. **Imports**
   - Zod schema from `@fresh-schedules/types`
   - Guards from `apps/web/src/lib/api/guards`
   - Use-cases from `apps/web/src/lib/**` (no raw SDK)

2. **Validate**
   - Parse `req` via Zod (body/query).
   - Reject with `{ error: { code, message, details } }`.

3. **Authorize**
   - `requireSession(req)` → user
   - `requireOrgMembership(user, orgId)`
   - `requireRole(user, ['manager','owner'])` as needed

4. **Execute**
   - Call App Lib use-case; never embed business logic here.
   - Return stable JSON shape `{ data } | { error }`.

5. **Errors**
   - JSON error with `code`, `message`, `details`.
   - Never leak stack.

## Response Contract

```json
// success
{ "data": { /* domain object */ }, "meta": { "requestId": "<uuid>" } }
// error
{ "error": { "code": "BAD_REQUEST", "message": "Invalid payload", "details": { /* field errors */ } }, "meta": { "requestId": "<uuid>" } }
```

## Disallowed

- Direct Firestore/Admin calls here.
- Importing UI/components.
- Ad hoc payload shapes.

