# Onboarding Backend - Developer Quick Reference

<!-- [P1][ONBOARDING][GUIDE] Developer Quick Reference
Tags: P1, ONBOARDING, BACKEND, DEVELOPER_GUIDE -->

## Onboarding Backend - Developer Quick Reference

## Quick Start

### Installation

```bash
cd /home/patrick/fresh-root-10/fresh-root
pnpm -w install --frozen-lockfile
```

### Development Server

```bash
pnpm dev  # Starts web app on http://localhost:3000
```

### Testing

```bash
## Unit tests (watch mode)
pnpm test

## All tests (single run)
pnpm vitest run

## Rules tests (Firestore security rules)
pnpm test:rules

## E2E tests
pnpm test:e2e

## Coverage
pnpm vitest run --coverage
```

### Local Emulation

```bash
## Terminal 1: Start Firebase emulator
firebase emulators:start

## Terminal 2: Set env var and start dev server
export NEXT_PUBLIC_USE_EMULATORS=true
pnpm dev
```

---

## API Endpoints Reference

### 1. Profile Setup

**POST** `/api/onboarding/profile`

Request:

```json
{
  "fullName": "John Doe",
  "preferredName": "John",
  "phone": "555-1234567",
  "timeZone": "America/New_York",
  "selfDeclaredRole": "Manager"
}
```

Response (200 OK):

```json
{
  "ok": true
}
```

Error (422 Unprocessable Entity):

```json
{
  "error": "validation_error",
  "issues": {
    "fieldErrors": {
      "fullName": ["String must contain at least 1 character"]
    }
  }
}
```

**Authentication**: Required (Firebase auth)

**Database**: Writes to `users/{uid}/profile`

### 2. Verify Eligibility

**POST** `/api/onboarding/verify-eligibility`

Request:

```json
{
  "email": "user@example.com"
}
```

Response (200 OK):

```json
{
  "eligible": true,
  "reason": null
}
```

Response (200 OK - Not Eligible):

```json
{
  "eligible": false,
  "reason": "email_domain_not_verified"
}
```

**Authentication**: Required

**Use Case**: Check if user meets onboarding requirements

### 3. Create Organization Network

**POST** `/api/onboarding/create-network-org`

Request:

```json
{
  "organizationName": "Acme Corp",
  "organizationCode": "ACME",
  "sector": "corporate",
  "headquartersCity": "New York",
  "headquartersState": "NY",
  "headquartersCountry": "USA"
}
```

Response (200 OK):

```json
{
  "ok": true,
  "organizationId": "org_abc123xyz"
}
```

**Authentication**: Required

**Admin**: Yes (creates organization)

**Database**: Creates `organizations/{orgId}` document

### 4. Create Corporate Network

**POST** `/api/onboarding/create-network-corporate`

Request:

```json
{
  "corporateName": "Acme Holdings",
  "headquartersCity": "San Francisco",
  "headquartersState": "CA",
  "headquartersCountry": "USA"
}
```

Response (200 OK):

```json
{
  "ok": true,
  "corporateId": "corp_abc123xyz"
}
```

**Authentication**: Required

**Admin**: Yes (creates corporate parent)

**Database**: Creates `corporates/{corpId}` document

### 5. Join with Token

**POST** `/api/onboarding/join-with-token`

Request:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Response (200 OK):

```json
{
  "ok": true,
  "organizationId": "org_abc123xyz"
}
```

Error (409 Conflict):

```json
{
  "error": "token_expired"
}
```

**Authentication**: Required

**Use Case**: User joins existing organization

**Database**: Creates membership, validates token

### 6. Admin Form

**POST** `/api/onboarding/admin-form`

Request:

```json
{
  "organizationId": "org_abc123xyz",
  "responsibilityAreas": ["finance", "hr"],
  "agreedToTerms": true
}
```

Response (200 OK):

```json
{
  "ok": true,
  "formId": "form_abc123xyz"
}
```

**Authentication**: Required

**Database**: Writes to `adminResponsibilityForms/{formId}`

---

## File Structure

```text
apps/web/
├── app/
│   ├── api/
│   │   ├── onboarding/
│   │   │   ├── profile/route.ts
│   │   │   ├── verify-eligibility/route.ts
│   │   │   ├── create-network-org/route.ts
│   │   │   ├── create-network-corporate/route.ts
│   │   │   ├── join-with-token/route.ts
│   │   │   └── admin-form/route.ts
│   │   └── _shared/
│   │       ├── validation.ts        ⬅️ All Zod schemas
│   │       ├── middleware.ts        ⬅️ Auth & security
│   │       └── security.ts          ⬅️ Security utilities
│   └── onboarding/
│       ├── profile/page.tsx
│       ├── create-network-org/page.tsx
│       ├── create-network-corporate/page.tsx
│       ├── join/page.tsx
│       └── admin-form/page.tsx
├── src/
│   └── lib/
│       └── firebase.server.ts       ⬅️ Admin SDK setup
└── __tests__/
    └── *.test.ts                    ⬅️ Unit tests
```

---

## Validation Schemas

All schemas are in `apps/web/app/api/_shared/validation.ts`:

```typescript
// Import and use
import { ProfileSchema, CreateOrgNetworkSchema } from "@/app/api/_shared/validation";

// Validate input
const parsed = ProfileSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json(
    { error: "validation_error", issues: parsed.error.flatten() },
    { status: 422 }
  );
}

// Access validated data
const { fullName, preferredName, ... } = parsed.data;
```

### Available Schemas

- `ProfileSchema`
- `VerifyEligibilitySchema`
- `CreateOrgNetworkSchema`
- `CreateCorporateNetworkSchema`
- `JoinWithTokenSchema`
- `AdminResponsibilityFormSchema`

---

## Common Patterns

### Adding a New Endpoint

1. **Create route file**:

````bash

```bash
mkdir -p apps/web/app/api/onboarding/my-action
touch apps/web/app/api/onboarding/my-action/route.ts
````

````

1. **Add validation schema** to `apps/web/app/api/_shared/validation.ts`:

```typescript
export const MyActionSchema = z.object({
  field1: z.string().min(1),
  field2: z.number(),
});
````

1. **Implement handler**:

```typescript
import { NextResponse } from "next/server";
import { MyActionSchema } from "../../_shared/validation";
import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";
import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";

export async function myActionHandler(
  req: AuthenticatedRequest,
  injectedAdminDb = importedAdminDb,
) {
  const uid = req.user?.uid;
  if (!uid) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = MyActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const adminDb = injectedAdminDb;
  if (!adminDb) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Business logic here
  await adminDb.collection("...").doc(...).set(...);

  return NextResponse.json({ ok: true }, { status: 200 });
}

export const POST = withSecurity(myActionHandler);
```

1. **Add unit test** in `apps/web/src/__tests__/`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { myActionHandler } from "@/app/api/onboarding/my-action/route";

describe("myActionHandler", () => {
  it("validates input", async () => {
    const req = { ... } as any;
    const response = await myActionHandler(req);
    expect(response.status).toBe(...);
  });
});
```

### Testing a Route Locally

```bash
## Start dev server
pnpm dev

## In another terminal, make request
curl -X POST http://localhost:3000/api/onboarding/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fullName": "Test User",
    "preferredName": "Test",
    "phone": "5551234567",
    "timeZone": "UTC",
    "selfDeclaredRole": "Admin"
  }'
```

### Using Firebase Emulator

Set environment variable in `.env.local`:

```text
NEXT_PUBLIC_USE_EMULATORS=true
```

Then handlers will use emulator instead of production Firebase.

---

## Debugging Tips

### Check Handler Execution

Add console logging:

```typescript
console.log("Handler called with uid:", uid);
console.log("Parsed data:", parsed.data);
console.log("Firestore write result:", result);
```

View logs:

```bash
pnpm dev  # Shows console output
```

### Test with Invalid Data

```bash
## Missing required field
curl -X POST http://localhost:3000/api/onboarding/profile \
  -H "Content-Type: application/json" \
  -d '{ "fullName": "Test" }'

## Returns 422 with field errors
{
  "error": "validation_error",
  "issues": {
    "fieldErrors": {
      "preferredName": ["Required"],
      "phone": ["Required"],
      ...
    }
  }
}
```

### View Firebase Data

````bash

```bash
## Open Firebase emulator UI
open http://localhost:4000

## View collections and documents in real-time
````

```text

---

## Common Issues

### Issue: 401 Unauthenticated

**Cause**: No Firebase auth token in request

**Fix**: Ensure user is authenticated before calling API

### Issue: 422 Validation Error

**Cause**: Invalid field value

**Fix**: Check error details in response `issues.fieldErrors`

### Issue: Firestore write fails

**Cause**: Security rules deny access

**Fix**: Check `firestore.rules` for user/resource permissions

### Issue: Emulator not connecting

**Cause**: `NEXT_PUBLIC_USE_EMULATORS` not set

**Fix**: Set `NEXT_PUBLIC_USE_EMULATORS=true` in `.env.local`

---

## Quality Checklist

Before submitting PR:

- [ ] Run `pnpm -w typecheck` (no errors)
- [ ] Run `pnpm -w lint` (no errors)
- [ ] Run `pnpm test` (all tests pass)
- [ ] Run `pnpm test:rules` (rules tests pass)
- [ ] Update validation schema if needed
- [ ] Add unit tests for new handler
- [ ] Add JSDoc comments to complex functions
- [ ] Update this guide if adding new endpoint

---

## Resources

- **Zod Documentation**: [https://zod.dev](https://zod.dev)
- **Next.js API Routes**: [https://nextjs.org/docs/app/building-your-application/routing/route-handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- **Firebase Admin SDK**: [https://firebase.google.com/docs/firestore/manage-data/add-data](https://firebase.google.com/docs/firestore/manage-data/add-data)
- **Security Rules**: See `firestore.rules` and `/docs/security.md`
- **Project Guide**: See `/docs/COMPLETE_TECHNICAL_DOCUMENTATION.md`

---

## Metadata

Last updated: Nov 8, 2024

Maintained by: Patrick Craven
```

[onboarding]: #
