# Standardized Error Response Pattern

## Overview

This document describes the canonical pattern for returning structured error responses from API routes. It ensures consistency across the codebase and enables clients to handle errors reliably.

## Schema

All error responses should use the `ErrorResponse` type from `@fresh-schedules/types`:

```typescript
import { ErrorResponse } from "@fresh-schedules/types";

type ErrorResponse = {
  error: string; // Human-readable summary
  code?: ErrorCode; // Stable machine-friendly code
  details?: Record<string, unknown>; // Optional context
};
```

## Error Codes

Stable error codes are centrally defined in `packages/types/src/errors.ts`. Extend the `ErrorCode` enum when standardizing new endpoints.

### Current Error Codes

**Onboarding Eligibility:**

- `ONB_ELIGIBILITY_EMAIL_UNVERIFIED` — User email is not verified
- `ONB_ELIGIBILITY_ROLE_DENIED` — User's declared role is not allowed
- `ONB_ELIGIBILITY_RATE_LIMITED` — Too many requests from this IP
- `ONB_ELIGIBILITY_INTERNAL_ERROR` — Server error during eligibility check

**Network Activation:**

- `ONB_ACTIVATE_FORBIDDEN` — User lacks permission to activate network
- `ONB_ACTIVATE_ALREADY_ACTIVE` — Network is already active
- `ONB_ACTIVATE_INVALID_STATE` — Network state invalid for activation

**Generic / Infrastructure:**

- `GEN_NOT_AUTHENTICATED` — No valid session/auth
- `GEN_FORBIDDEN` — Authenticated but not authorized
- `GEN_INTERNAL_ERROR` — Unhandled server error

## Usage Pattern

### 1. Import the types

```typescript
import { NextResponse } from "next/server";
import { ErrorResponse } from "@fresh-schedules/types";
import { AuthenticatedRequest } from "../../_shared/middleware";
```

### 2. Return typed error responses

```typescript
export async function myHandler(req: AuthenticatedRequest) {
  // Email not verified
  if (!emailVerified) {
    return NextResponse.json<ErrorResponse>(
      {
        error: "User email is not verified",
        code: "ONB_ELIGIBILITY_EMAIL_UNVERIFIED",
      },
      { status: 403 },
    );
  }

  // Rate limited
  if (isRateLimited) {
    return NextResponse.json<ErrorResponse>(
      {
        error: "Too many requests",
        code: "ONB_ELIGIBILITY_RATE_LIMITED",
        details: { retryAfterSeconds: 60 },
      },
      { status: 429 },
    );
  }

  // Internal error
  return NextResponse.json<ErrorResponse>(
    {
      error: "An unexpected error occurred",
      code: "GEN_INTERNAL_ERROR",
    },
    { status: 500 },
  );
}
```

## Request Logging Middleware

Wrap route handlers with `withRequestLogging` to capture request/response telemetry:

```typescript
import { withRequestLogging } from "../../_shared/logging";
import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

export async function myHandler(req: AuthenticatedRequest) {
  // ... handler logic
}

export const POST = withRequestLogging(withSecurity(myHandler, { requireAuth: true }));
```

This logs:

- **request_start**: method, url, requestId, timestamp
- **request_end**: status, durationMs, requestId
- **request_error**: error details, stack trace, requestId

Each log includes a unique `requestId` for tracing across systems.

## Example: Updating an Existing Route

**Before:**

```typescript
export const POST = withSecurity(createNetworkOrgHandler, { requireAuth: true });
```

**After:**

```typescript
import { withRequestLogging } from "../../_shared/logging";

export const POST = withRequestLogging(
  withSecurity(createNetworkOrgHandler, { requireAuth: true }),
);
```

**Error responses within the handler:**

```typescript
import { ErrorResponse } from "@fresh-schedules/types";

if (!emailVerified) {
  return NextResponse.json<ErrorResponse>(
    {
      error: "Email not verified",
      code: "ONB_ELIGIBILITY_EMAIL_UNVERIFIED",
    },
    { status: 403 },
  );
}
```

## Benefits

1. **Consistency** — Clients can rely on a predictable error shape
2. **Traceability** — Stable error codes enable analytics and alerting
3. **Observability** — RequestId ties logs across multiple systems
4. **Documentation** — Central registry of error codes acts as API spec
5. **Type Safety** — TypeScript ensures responses match the schema

## Next Steps

1. Start with one critical route (e.g., `create-network-org`)
2. Wrap with `withRequestLogging` + use `ErrorResponse` type
3. Add error codes to `packages/types/src/errors.ts` as needed
4. Roll out to other routes incrementally
5. Update API documentation with error codes
