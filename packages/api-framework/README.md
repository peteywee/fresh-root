# Fresh Schedules API Framework - Indexable Reference Guide

<!-- INDEXABLE_METADATA: api-framework, sdk, usage-guide, context-reference -->
<!-- ADOPTION_STATUS: 100% (Complete Migration) -->
<!-- LAST_UPDATED: December 10, 2025 -->
<!-- QUERY_TAGS: createOrgEndpoint, createPublicEndpoint, createAuthenticatedEndpoint, middleware, validation, auth, RBAC -->

**Version**: 1.0.0  
**Package**: `@fresh-schedules/api-framework`  
**Current Adoption**: ✅ 100% - All routes migrated to SDK factory pattern  
**Context Callable**: Use keywords `api-framework`, `sdk-factory`, `endpoint-creation`, `middleware` for AI retrieval

## 🔍 Quick Context Lookup

**For AI Agents**: This document provides complete SDK factory patterns. Use these keywords for specific sections:

- `endpoint-types` → 5 factory functions with examples
- `validation-patterns` → Zod input validation with error handling  
- `auth-patterns` → RBAC, session management, org context
- `testing-patterns` → Mock utilities and test structure
- `migration-patterns` → Legacy withSecurity → SDK factory conversion

## 📋 Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Core Concepts](#core-concepts) 🔍 `core-concepts`
3. [Endpoint Types](#endpoint-types) 🔍 `endpoint-types`
4. [Configuration Options](#configuration-options) 🔍 `config-options`
5. [Input Validation](#input-validation) 🔍 `validation-patterns`
6. [Authentication & Authorization](#authentication--authorization) 🔍 `auth-patterns`
7. [Error Handling](#error-handling) 🔍 `error-patterns`
8. [Testing](#testing) 🔍 `testing-patterns`
9. [ESLint Integration](#eslint-integration) 🔍 `eslint-patterns`
10. [Migration Guide](#migration-guide) 🔍 `migration-patterns`
11. [Examples](#examples) 🔍 `examples`
12. [Troubleshooting](#troubleshooting) 🔍 `troubleshooting`

---

## Installation & Setup

### 1. Package Installation

The API framework is already installed in this workspace via pnpm workspace reference:

```json
// apps/web/package.json
{
  "dependencies": {
    "@fresh-schedules/api-framework": "workspace:*"
  }
}
```

### 2. Build the SDK

```bash
# From workspace root
pnpm --filter @fresh-schedules/api-framework build

# Or build all packages
pnpm -w build
```

### 3. TypeScript Path Mapping

Already configured in `apps/web/tsconfig.json`:

```json
{
  "paths": {
    "@fresh-schedules/api-framework": ["../../packages/api-framework/src/index.ts"],
    "@fresh-schedules/api-framework/testing": ["../../packages/api-framework/src/testing.ts"]
  }
}
```

---

## Core Concepts

### The SDK Factory Pattern

The API framework provides **declarative endpoint factories** that handle all boilerplate:

```typescript
import { createOrgEndpoint } from "@fresh-schedules/api-framework";

export const GET = createOrgEndpoint({
  // Configuration here
  handler: async ({ request, input, context, params }) => {
    // Your business logic here
    return NextResponse.json({ data: result });
  },
});
```

### Automatic Middleware Pipeline

Every endpoint gets this pipeline automatically:

```
1. Rate Limiting (Redis/in-memory)
   ↓
2. Authentication (Firebase session cookie)
   ↓
3. CSRF Protection (POST/PUT/PATCH/DELETE)
   ↓
4. Organization Context Loading (Firestore)
   ↓
5. Role-Based Authorization (hierarchical)
   ↓
6. Input Validation (Zod)
   ↓
7. Handler Execution (your business logic)
   ↓
8. Audit Logging (success/failure)
```

---

## Endpoint Types

### 1. Public Endpoints

No authentication required:

```typescript
import { createPublicEndpoint } from "@fresh-schedules/api-framework";

export const GET = createPublicEndpoint({
  handler: async ({ request }) => {
    return NextResponse.json({ message: "Hello World" });
  },
});
```

### 2. Authenticated Endpoints

Requires valid session, no org context:

```typescript
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

export const GET = createAuthenticatedEndpoint({
  handler: async ({ context }) => {
    // context.auth.userId available
    return NextResponse.json({ userId: context.auth.userId });
  },
});
```

### 3. Organization Endpoints

Requires auth + org membership:

```typescript
import { createOrgEndpoint } from "@fresh-schedules/api-framework";

export const GET = createOrgEndpoint({
  handler: async ({ context }) => {
    // context.auth.userId, context.org.orgId, context.org.role available
    return NextResponse.json({ orgId: context.org.orgId });
  },
});
```

### 4. Admin Endpoints

Requires auth + admin/org_owner role:

```typescript
import { createAdminEndpoint } from "@fresh-schedules/api-framework";

export const POST = createAdminEndpoint({
  handler: async ({ context }) => {
    // Only admins and org_owners can access
    return NextResponse.json({ success: true });
  },
});
```

### 5. Rate-Limited Public Endpoints

Public with rate limiting:

```typescript
import { createRateLimitedEndpoint } from "@fresh-schedules/api-framework";

export const POST = createRateLimitedEndpoint({
  rateLimit: { maxRequests: 10, windowMs: 60000 },
  handler: async ({ request }) => {
    return NextResponse.json({ success: true });
  },
});
```

---

## Configuration Options

### Full Configuration Interface

```typescript
export interface EndpointConfig<TInput, TOutput> {
  // Required roles (if org context required)
  roles?: OrgRole[]; // ['org_owner', 'admin', 'manager', 'scheduler', 'corporate', 'staff']

  // Rate limiting
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };

  // CSRF protection (default: true for POST/PUT/PATCH/DELETE)
  csrf?: boolean;

  // Zod schema for validation
  input?: ZodSchema<TInput>;

  // Handler function
  handler: (params: {
    request: NextRequest;
    input: TInput;
    context: RequestContext;
    params: Record<string, string>;
  }) => Promise<TOutput>;
}
```

### Rate Limiting Options

```typescript
// Conservative (sensitive operations)
rateLimit: { maxRequests: 10, windowMs: 60000 }

// Standard (write operations)  
rateLimit: { maxRequests: 50, windowMs: 60000 }

// Generous (read operations)
rateLimit: { maxRequests: 100, windowMs: 60000 }
```

### Role Hierarchy

```typescript
// From lowest to highest permissions
staff < corporate < scheduler < manager < admin < org_owner
```

If you require `manager`, users with `admin` or `org_owner` also pass.

---

## Input Validation

### Using Zod Schemas

```typescript
import { CreateScheduleSchema } from "@fresh-schedules/types";
import { createOrgEndpoint } from "@fresh-schedules/api-framework";

export const POST = createOrgEndpoint({
  input: CreateScheduleSchema, // Auto-validates request body
  handler: async ({ input, context }) => {
    // input is typed and validated
    const schedule = await createSchedule({
      ...input,
      orgId: context.org!.orgId,
    });
    return NextResponse.json(schedule);
  },
});
```

### Validation Errors

Automatic error response for invalid input:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed.",
    "requestId": "uuid",
    "retryable": false,
    "details": {
      "startTime": ["Must be a positive integer"],
      "endTime": ["End time must be after start time"]
    }
  }
}
```

---

## Authentication & Authorization

### Context Available

```typescript
interface RequestContext {
  auth: {
    userId: string;
    email: string;
    emailVerified: boolean;
    customClaims: Record<string, unknown>;
  };
  org?: {
    orgId: string;
    role: OrgRole;
    membershipId: string;
  };
  requestId: string;
  timestamp: number;
}
```

### Role-Based Access

```typescript
// Require specific roles
export const POST = createOrgEndpoint({
  roles: ["manager"], // manager, admin, or org_owner can access
  handler: async ({ context }) => {
    // Business logic
  },
});

// Multiple role options
export const PUT = createOrgEndpoint({
  roles: ["admin", "org_owner"], // Only admins and org_owners
  handler: async ({ context }) => {
    // Business logic
  },
});
```

---

## Error Handling

### Standard Error Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "requestId": "uuid",
    "retryable": boolean,
    "details"?: {}
  }
}
```

### Error Codes

- `VALIDATION_FAILED` - Zod validation failed
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Not authorized (wrong role, CSRF, etc.)
- `NOT_FOUND` - Resource not found
- `RATE_LIMITED` - Too many requests
- `INTERNAL_ERROR` - Server error

### Manual Error Handling

```typescript
export const POST = createOrgEndpoint({
  handler: async ({ context }) => {
    try {
      // Business logic
      return NextResponse.json({ success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      console.error("Operation failed", {
        error: message,
        userId: context.auth?.userId,
        orgId: context.org?.orgId,
      });
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message } },
        { status: 500 }
      );
    }
  },
});
```

---

## Testing

### Test Utilities

```typescript
import {
  createMockRequest,
  createMockAuthContext,
  createMockOrgContext,
} from "@fresh-schedules/api-framework/testing";
```

### Mock Request

```typescript
const request = createMockRequest("/api/schedules", {
  method: "POST",
  body: { name: "Test Schedule" },
  cookies: { session: "valid-session" },
  headers: { "x-org-id": "org-123" },
  searchParams: { orgId: "org-123" },
});
```

### Mock Context

```typescript
const authContext = createMockAuthContext({
  userId: "user-123",
  email: "test@example.com",
});

const orgContext = createMockOrgContext({
  orgId: "org-123",
  role: "admin",
});
```

### Example Test

```typescript
import { describe, it, expect } from "vitest";
import { POST } from "../route";
import { createMockRequest } from "@fresh-schedules/api-framework/testing";

describe("POST /api/schedules", () => {
  it("should create schedule with valid input", async () => {
    const request = createMockRequest("/api/schedules", {
      method: "POST",
      body: { name: "Test Schedule" },
      cookies: { session: "valid-session" },
      searchParams: { orgId: "org-123" },
    });

    const response = await POST(request, { params: {} });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.name).toBe("Test Schedule");
  });
});
```

---

## ESLint Integration

### Recommended Configuration

Add to `apps/web/eslint.config.mjs`:

```javascript
rules: {
  // SAFEGUARD: SDK factory patterns don't always need await
  "@typescript-eslint/require-await": "warn",
  
  // SAFEGUARD: React event handlers with promises
  "@typescript-eslint/no-misused-promises": "warn",
  
  // SAFEGUARD: Firebase SDK returns untyped data
  "@typescript-eslint/no-unsafe-assignment": "warn",
  "@typescript-eslint/no-unsafe-member-access": "warn",
  "@typescript-eslint/no-unsafe-call": "warn",
  
  // SAFEGUARD: Unused parameters in handlers
  "@typescript-eslint/no-unused-vars": [
    "warn",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
    },
  ],
}
```

### Handler Parameter Patterns

```typescript
// Prefix unused parameters with underscore
export const GET = createOrgEndpoint({
  handler: async ({ request: _request, context }) => {
    // Only using context, not request
    return NextResponse.json({ orgId: context.org!.orgId });
  },
});
```

---

## Migration Guide

### From Legacy withSecurity Pattern

**Before** (Legacy):

```typescript
import { withSecurity } from "../_shared/middleware";
import { requireOrgMembership, requireRole } from "@/src/lib/api";
import { parseJson, badRequest } from "../_shared/validation";

export const POST = withSecurity(
  requireOrgMembership(
    requireRole("manager")(async (request, context) => {
      const parsed = await parseJson(request, CreateShiftSchema);
      if (!parsed.success) {
        return badRequest("Invalid", parsed.details);
      }
      // Business logic
      return NextResponse.json({ success: true });
    })
  ),
  { requireAuth: true, maxRequests: 50, windowMs: 60_000 }
);
```

**After** (SDK Factory):

```typescript
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateShiftSchema } from "@fresh-schedules/types";

export const POST = createOrgEndpoint({
  roles: ["manager"],
  rateLimit: { maxRequests: 50, windowMs: 60000 },
  input: CreateShiftSchema,
  handler: async ({ input, context }) => {
    // Business logic (input already validated)
    return NextResponse.json({ success: true });
  },
});
```

### Migration Benefits

- **90% less boilerplate** code
- **Automatic validation** with better error messages  
- **Type-safe context** with IntelliSense
- **Consistent error handling** across all routes
- **Built-in audit logging** and request tracing
- **CSRF protection** by default

---

## Examples

### 1. Simple GET Endpoint

```typescript
// apps/web/app/api/health/route.ts
import { createPublicEndpoint } from "@fresh-schedules/api-framework";
import { NextResponse } from "next/server";

export const GET = createPublicEndpoint({
  handler: async () => {
    return NextResponse.json({ 
      status: "healthy", 
      timestamp: Date.now() 
    });
  },
});
```

### 2. Authenticated Resource List

```typescript
// apps/web/app/api/schedules/route.ts
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { NextResponse } from "next/server";

export const GET = createOrgEndpoint({
  handler: async ({ context }) => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();

    const snapshot = await db
      .collection(`orgs/${context.org!.orgId}/schedules`)
      .get();

    const schedules = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ data: schedules });
  },
});
```

### 3. Resource Creation with Validation

```typescript
// apps/web/app/api/schedules/route.ts
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateScheduleSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

export const POST = createOrgEndpoint({
  roles: ["manager"],
  rateLimit: { maxRequests: 50, windowMs: 60000 },
  input: CreateScheduleSchema,
  handler: async ({ input, context }) => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();

    const schedule = {
      ...input,
      orgId: context.org!.orgId,
      createdBy: context.auth!.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = await db
      .collection(`orgs/${context.org!.orgId}/schedules`)
      .add(schedule);

    return NextResponse.json({
      id: docRef.id,
      ...schedule,
    }, { status: 201 });
  },
});
```

### 4. Resource Update

```typescript
// apps/web/app/api/schedules/[id]/route.ts
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { UpdateScheduleSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

export const PATCH = createOrgEndpoint({
  roles: ["manager"],
  input: UpdateScheduleSchema,
  handler: async ({ input, context, params }) => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();

    const docRef = db.doc(`orgs/${context.org!.orgId}/schedules/${params.id}`);
    
    await docRef.update({
      ...input,
      updatedAt: Date.now(),
    });

    const updated = await docRef.get();
    return NextResponse.json({
      id: updated.id,
      ...updated.data(),
    });
  },
});
```

### 5. Admin-Only Operation

```typescript
// apps/web/app/api/organizations/[id]/route.ts
import { createAdminEndpoint } from "@fresh-schedules/api-framework";
import { NextResponse } from "next/server";

export const DELETE = createAdminEndpoint({
  handler: async ({ context, params }) => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();

    // Only admins and org_owners can delete organizations
    await db.doc(`orgs/${params.id}`).delete();

    return NextResponse.json({ success: true });
  },
});
```

### 6. Public Webhook with Rate Limiting

```typescript
// apps/web/app/api/webhooks/stripe/route.ts
import { createRateLimitedEndpoint } from "@fresh-schedules/api-framework";
import { NextResponse } from "next/server";

export const POST = createRateLimitedEndpoint({
  rateLimit: { maxRequests: 100, windowMs: 60000 },
  csrf: false, // Webhooks don't use CSRF tokens
  handler: async ({ request }) => {
    const signature = request.headers.get("stripe-signature");
    // Handle webhook
    return NextResponse.json({ received: true });
  },
});
```

---

## Troubleshooting

### Common Issues

#### 1. "context.org is undefined"

**Cause**: Using `createOrgEndpoint` but not providing `orgId` in request.

**Fix**: Include `orgId` in query params or `x-org-id` header:

```typescript
// Query param
fetch("/api/schedules?orgId=org-123");

// Header
fetch("/api/schedules", {
  headers: { "x-org-id": "org-123" },
});
```

#### 2. "VALIDATION_FAILED" errors

**Cause**: Request body doesn't match Zod schema.

**Fix**: Check the error details and ensure your payload matches the schema:

```typescript
// Check the schema requirements
import { CreateScheduleSchema } from "@fresh-schedules/types";
console.log(CreateScheduleSchema._def);
```

#### 3. Rate limit errors in development

**Cause**: Using in-memory rate limiter, limits persist across requests.

**Fix**: Set Redis environment variables or restart dev server:

```bash
UPSTASH_REDIS_REST_URL=https://....upstash.io
UPSTASH_REDIS_REST_TOKEN=****
```

#### 4. "Handler execution failed" errors

**Cause**: Business logic throwing unhandled errors.

**Fix**: Wrap business logic in try/catch and log errors:

```typescript
handler: async ({ context }) => {
  try {
    // Business logic
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Handler failed", { 
      error: err instanceof Error ? err.message : "Unknown error",
      orgId: context.org?.orgId 
    });
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Operation failed" } },
      { status: 500 }
    );
  }
},
```

#### 5. TypeScript errors on handler parameters

**Cause**: Unused parameters triggering ESLint warnings.

**Fix**: Prefix unused parameters with underscore:

```typescript
handler: async ({ request: _request, input, context: _context }) => {
  // Only using input
  return NextResponse.json({ data: input });
},
```

### Getting Help

1. **Check existing routes**: Look at `apps/web/app/api/` for examples
2. **Review the Triad**: Ensure your Schema + API Route + Firestore Rules are aligned
3. **Run validation**: `node scripts/validate-patterns.mjs`
4. **Check logs**: SDK provides detailed request/response logging
5. **Test in isolation**: Use the testing utilities to debug specific issues

---

## Summary

The Fresh Schedules API Framework provides a **declarative, type-safe way** to build API endpoints with:

- ✅ **Zero boilerplate** - All middleware handled automatically
- ✅ **Type safety** - Full TypeScript support with IntelliSense  
- ✅ **Security by default** - Auth, RBAC, CSRF, rate limiting
- ✅ **Consistent errors** - Standardized error handling and logging
- ✅ **Easy testing** - Comprehensive mocking utilities
- ✅ **90%+ adoption** - Battle-tested across 95 endpoints

**Migration complete**: Legacy `withSecurity` pattern → SDK Factory pattern.

For questions or improvements, check the source code at `packages/api-framework/src/index.ts` or create an issue.
