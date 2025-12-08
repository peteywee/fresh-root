# SDK Factory Pattern - Comprehensive Overview & Implementation Guide

**Status**: ✅ Production Ready (90%+ Migrated)  
**Version**: 2.0.0  
**Last Updated**: December 7, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Use Cases & Implementations](#use-cases--implementations)
4. [Architecture & Flow](#architecture--flow)
5. [Enhancement Proposals](#enhancement-proposals)
6. [Migration Guide](#migration-guide)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### What is the SDK Factory?

The **SDK Factory** (`@fresh-schedules/api-framework`) is a declarative, type-safe framework for building Next.js API routes with:

- ✅ **Built-in Authentication & Authorization**
- ✅ **Organization Context Management** (multi-tenant support)
- ✅ **Role-Based Access Control** (hierarchical RBAC)
- ✅ **Input Validation** (Zod-first)
- ✅ **Rate Limiting** (Redis/in-memory)
- ✅ **CSRF Protection** (automatic)
- ✅ **Request Tracing** (unique request IDs)
- ✅ **Error Handling** (standardized responses)
- ✅ **Audit Logging** (success/failure tracking)
- ✅ **Type Safety** (full TypeScript support)

### Problem It Solves

**Before SDK Factory** (repetitive boilerplate):
```typescript
export async function GET(request: NextRequest) {
  try {
    // 1. Verify auth
    const session = await verifySession(request);
    if (!session) return unauthorized();
    
    // 2. Check rate limit
    const limited = await checkRateLimit(session.userId);
    if (limited) return tooManyRequests();
    
    // 3. Load organization
    const org = await loadOrg(request.query.orgId);
    if (!org) return notFound();
    
    // 4. Verify membership
    const member = await verifyMembership(session.userId, org.id);
    if (!member) return forbidden();
    
    // 5. Check role
    if (!canAccess(member.role, 'read')) return forbidden();
    
    // 6. Validate input
    const parsed = inputSchema.safeParse(request.query);
    if (!parsed.success) return badRequest(parsed.error);
    
    // 7. Business logic (finally!)
    const data = await fetchData(org.id);
    
    // 8. Log
    await logAudit('GET', session.userId, org.id, 'success');
    
    // 9. Response
    return NextResponse.json({ data });
  } catch (err) {
    // 10. Error handling
    await logAudit('GET', session.userId, org.id, 'error', err);
    return internalError();
  }
}
```

**After SDK Factory** (clean, focused):
```typescript
export const GET = createOrgEndpoint({
  roles: ['manager'],
  rateLimit: { maxRequests: 100, windowMs: 60000 },
  input: QuerySchema,
  handler: async ({ input, context }) => {
    // Only business logic!
    const data = await fetchData(context.org!.orgId);
    return NextResponse.json({ data });
  }
});
```

---

## Core Concepts

### 1. Endpoint Factories (4 Types)

#### Public Endpoint
**No authentication required**

```typescript
export const POST = createPublicEndpoint({
  input: NewsletterSignupSchema,
  handler: async ({ input }) => {
    await addToNewsletter(input.email);
    return NextResponse.json({ success: true });
  }
});
```

**Use Cases**: Sign-ups, public data, webhooks

#### Authenticated Endpoint
**Auth required, no org context**

```typescript
export const GET = createAuthenticatedEndpoint({
  handler: async ({ context }) => {
    // context.auth.userId available
    const profile = await getUserProfile(context.auth!.userId);
    return NextResponse.json({ profile });
  }
});
```

**Use Cases**: Personal data, user preferences, account info

#### Organization Endpoint
**Auth + org membership required**

```typescript
export const GET = createOrgEndpoint({
  roles: ['manager'],  // Optional - defaults to any member
  handler: async ({ context }) => {
    // context.org.orgId and context.org.role available
    const schedules = await fetchSchedules(context.org!.orgId);
    return NextResponse.json({ schedules });
  }
});
```

**Use Cases**: Business operations, team data, org-scoped resources

#### Admin Endpoint
**Auth + admin/org_owner role required**

```typescript
export const POST = createAdminEndpoint({
  input: UserInviteSchema,
  handler: async ({ input, context }) => {
    // Only admins can access
    await inviteUser(input.email, context.org!.orgId);
    return NextResponse.json({ success: true });
  }
});
```

**Use Cases**: User management, settings, compliance

### 2. The Middleware Pipeline

Every request passes through an automatic 8-step pipeline:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. RATE LIMITING                                            │
│    Redis-backed (prod) or in-memory (dev)                  │
│    Default: 100 req/min (configurable per endpoint)        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. AUTHENTICATION                                           │
│    Firebase session cookie verification                     │
│    Sets context.auth if valid, null if optional            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. CSRF PROTECTION                                          │
│    Double-submit cookie pattern                             │
│    Applied to POST/PUT/PATCH/DELETE (configurable)         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. ORG CONTEXT LOADING                                      │
│    Queries org membership from Firestore                    │
│    Sets context.org with role and orgId                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. ROLE-BASED AUTHORIZATION                                │
│    Hierarchical RBAC (staff < corporate < ... < org_owner) │
│    Returns 403 if insufficient privileges                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. INPUT VALIDATION                                         │
│    Zod schema validation                                    │
│    Returns 400 with detailed error info if invalid         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. HANDLER EXECUTION                                        │
│    Your business logic runs here                            │
│    Full access to validated input and context              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. AUDIT LOGGING                                            │
│    Logs request method, user, org, status, errors          │
│    Used for compliance and debugging                        │
└─────────────────────────────────────────────────────────────┘
```

### 3. Role Hierarchy

```
org_owner (100)  ← Full control, all operations
    ↓
admin (80)       ← User management, org settings
    ↓
manager (60)     ← Schedule management, reports
    ↓
scheduler (50)   ← Create/edit schedules
    ↓
corporate (45)   ← View across locations
    ↓
staff (40)       ← View own data only
```

**Hierarchical Check**: If you require `manager`, users with `admin` or `org_owner` also pass.

### 4. Error Standardization

All errors return consistent format:

```typescript
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed.",
    "requestId": "req_123abc",
    "retryable": false,
    "details": {
      "startTime": ["Must be positive integer"],
      "endTime": ["End time must be after start time"]
    }
  }
}
```

**Codes**: VALIDATION_FAILED, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT, RATE_LIMITED, INTERNAL_ERROR

---

## Use Cases & Implementations

### Use Case 1: Public API with Rate Limiting

**Scenario**: Public health check endpoint

```typescript
// apps/web/app/api/health/route.ts
import { createPublicEndpoint } from "@fresh-schedules/api-framework";
import { NextResponse } from "next/server";

export const GET = createPublicEndpoint({
  rateLimit: { maxRequests: 1000, windowMs: 60000 },
  handler: async () => {
    const db = getFirestore();
    const status = await db.collection("_health").doc("check").get();
    
    return NextResponse.json({
      status: "ok",
      timestamp: Date.now(),
      database: status.exists ? "connected" : "disconnected"
    });
  }
});
```

### Use Case 2: Authenticated User Data

**Scenario**: Get user profile

```typescript
// apps/web/app/api/user/profile/route.ts
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { NextResponse } from "next/server";

export const GET = createAuthenticatedEndpoint({
  handler: async ({ context }) => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();
    
    const user = await db
      .collection("users")
      .doc(context.auth!.userId)
      .get();
    
    return NextResponse.json({
      id: user.id,
      ...user.data()
    });
  }
});
```

### Use Case 3: Organization CRUD with Full Validation

**Scenario**: Create schedule with validation

```typescript
// apps/web/app/api/schedules/route.ts
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateScheduleSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

export const POST = createOrgEndpoint({
  roles: ['manager'],  // Only managers+
  rateLimit: { maxRequests: 50, windowMs: 60000 },
  input: CreateScheduleSchema,  // Auto-validates
  handler: async ({ input, context }) => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();
    
    const schedule = {
      ...input,
      orgId: context.org!.orgId,
      createdBy: context.auth!.userId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const docRef = await db
      .collection(`orgs/${context.org!.orgId}/schedules`)
      .add(schedule);
    
    return NextResponse.json(
      { id: docRef.id, ...schedule },
      { status: 201 }
    );
  }
});
```

### Use Case 4: Admin-Only Operation

**Scenario**: Delete user from organization

```typescript
// apps/web/app/api/orgs/[id]/members/[userId]/route.ts
import { createAdminEndpoint } from "@fresh-schedules/api-framework";
import { NextResponse } from "next/server";

export const DELETE = createAdminEndpoint({
  rateLimit: { maxRequests: 100, windowMs: 60000 },
  handler: async ({ context, params }) => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();
    
    await db
      .doc(`memberships/${params.userId}_${context.org!.orgId}`)
      .delete();
    
    await logAudit({
      action: 'MEMBER_REMOVED',
      admin: context.auth!.userId,
      org: context.org!.orgId,
      target: params.userId
    });
    
    return NextResponse.json({ success: true });
  }
});
```

### Use Case 5: Complex Business Logic with Transaction

**Scenario**: Bulk shift assignment with validation

```typescript
// apps/web/app/api/shifts/bulk-assign/route.ts
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { BulkAssignSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

export const POST = createOrgEndpoint({
  roles: ['manager'],
  rateLimit: { maxRequests: 20, windowMs: 60000 },  // Stricter for bulk ops
  input: BulkAssignSchema,
  handler: async ({ input, context }) => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();
    
    try {
      const batch = db.batch();
      const results = [];
      
      for (const assignment of input.assignments) {
        const shiftRef = db.doc(
          `orgs/${context.org!.orgId}/schedules/${input.scheduleId}/shifts/${assignment.shiftId}`
        );
        
        // Validate before batch
        const shift = await shiftRef.get();
        if (!shift.exists) {
          throw new Error(`Shift not found: ${assignment.shiftId}`);
        }
        
        batch.update(shiftRef, {
          assignedTo: assignment.staffId,
          updatedAt: Date.now()
        });
        
        results.push({ shiftId: assignment.shiftId, status: 'queued' });
      }
      
      await batch.commit();
      
      return NextResponse.json({
        assigned: results.length,
        results
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bulk assignment failed";
      console.error("Bulk assign error", { error: message, orgId: context.org?.orgId });
      
      return NextResponse.json(
        { error: { code: "BULK_ASSIGN_FAILED", message } },
        { status: 400 }
      );
    }
  }
});
```

---

## Architecture & Flow

### Request Processing Flow

```
1. HTTP Request arrives
   ↓
2. SDK Factory intercepts
   ├─ Extract request context
   ├─ Parse route params
   └─ Get request body/query
   ↓
3. Rate Limit Check
   ├─ Generate rate limit key
   ├─ Query Redis/memory
   └─ Return 429 if exceeded
   ↓
4. Authentication
   ├─ Extract session cookie
   ├─ Verify with Firebase Admin
   └─ Populate context.auth
   ↓
5. CSRF Validation (if mutation)
   ├─ Compare token with header
   └─ Return 403 if invalid
   ↓
6. Organization Loading (if org required)
   ├─ Query membership from Firestore
   ├─ Verify active status
   └─ Populate context.org
   ↓
7. Role Authorization (if roles specified)
   ├─ Get user role from context.org
   ├─ Check hierarchy
   └─ Return 403 if insufficient
   ↓
8. Input Validation (if schema provided)
   ├─ Run Zod schema parse
   ├─ Return 400 with details if invalid
   └─ Populate input parameter
   ↓
9. Handler Execution
   ├─ Call user-defined handler
   ├─ Catch any errors
   └─ Format response
   ↓
10. Audit Logging
    ├─ Log method, user, org, status
    └─ Log errors if occurred
    ↓
11. Response Sent
```

### Context Object Structure

```typescript
{
  auth: {
    userId: string;
    email: string;
    emailVerified: boolean;
    customClaims: Record<string, unknown>;
  } | null,
  org: {
    orgId: string;
    role: OrgRole;
    membershipId: string;
  } | null,
  requestId: string;      // Unique per request
  timestamp: number;      // Request start time
}
```

---

## Enhancement Proposals

### Proposal 1: Request Middleware Chain

**Problem**: Some operations need custom pre-processing

**Proposal**:
```typescript
export const POST = createOrgEndpoint({
  middleware: [
    validateDuplicates,
    checkQuotas,
    validateDependencies
  ],
  handler: async ({ input, context }) => { /* ... */ }
});
```

**Benefits**: 
- Reusable validation logic
- Clear separation of concerns
- Easier to test

**Implementation Effort**: Medium  
**Priority**: P1 (High value)

### Proposal 2: Batch Operation Handler

**Problem**: Bulk operations have different rate limits and error handling

**Proposal**:
```typescript
export const POST = createBatchEndpoint({
  roles: ['manager'],
  batchSize: 100,           // Max items per request
  timeoutPerItem: 100,      // ms per item
  handler: async (item, { context }) => {
    // Processes one item at a time
    // Returns { success: true, data } or { error }
  }
});
```

**Benefits**:
- Automatic partial success handling
- Better error reporting
- Timeout protection

**Implementation Effort**: Medium  
**Priority**: P1 (Many use cases)

### Proposal 3: Response Transformation

**Problem**: No built-in response formatting/pagination

**Proposal**:
```typescript
export const GET = createOrgEndpoint({
  output: {
    format: 'paginated',
    pageSize: 50,
    schema: ShiftSchema
  },
  handler: async ({ context }) => {
    // Returns array, SDK handles pagination
    return await fetchShifts(context.org!.orgId);
  }
});
```

**Benefits**:
- Automatic pagination
- Consistent response format
- Type-safe serialization

**Implementation Effort**: Medium  
**Priority**: P2 (Nice to have)

### Proposal 4: Webhook Security Layer

**Problem**: Webhooks need signature verification and replay protection

**Proposal**:
```typescript
export const POST = createWebhookEndpoint({
  secret: process.env.WEBHOOK_SECRET,
  events: ['shift.created', 'shift.assigned'],
  replayProtection: { maxAge: 5 * 60 * 1000 },  // 5 min
  handler: async ({ event, payload }) => {
    // payload already validated
  }
});
```

**Benefits**:
- Automatic signature verification
- Replay attack prevention
- Event type validation

**Implementation Effort**: Medium  
**Priority**: P2 (Webhook support)

### Proposal 5: Idempotency Key Support

**Problem**: Retries can cause duplicate operations

**Proposal**:
```typescript
export const POST = createOrgEndpoint({
  idempotencyKey: true,  // Extract from request header
  handler: async ({ input, context, idempotencyKey }) => {
    // SDK deduplicates based on key + operation
    const result = await createShift(input);
    return NextResponse.json(result);
  }
});
```

**Benefits**:
- Safe retries
- No duplicate data
- Better resilience

**Implementation Effort**: Medium  
**Priority**: P2 (API reliability)

---

## Migration Guide

### Step 1: Identify Target Routes

Find all unmigratedAPI routes:

```bash
grep -r "export.*async function" apps/web/app/api --include="*.ts" | head -20
```

### Step 2: Create/Update Input Schema

In `packages/types/src/your-entity.ts`:

```typescript
import { z } from "zod";

export const CreateItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active')
});

export type CreateItem = z.infer<typeof CreateItemSchema>;
```

### Step 3: Update Route Handler

Before:
```typescript
export async function POST(request: NextRequest) {
  // boilerplate...
  const body = await request.json();
  // more boilerplate...
}
```

After:
```typescript
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateItemSchema } from "@fresh-schedules/types";

export const POST = createOrgEndpoint({
  roles: ['manager'],
  input: CreateItemSchema,
  handler: async ({ input, context }) => {
    // business logic only!
  }
});
```

### Step 4: Update Tests

Test the handler directly:

```typescript
import { POST } from "./route";
import { createMockRequest } from "@fresh-schedules/api-framework/testing";

it("should create item", async () => {
  const request = createMockRequest("/api/items", {
    method: "POST",
    body: { name: "Test" },
    cookies: { session: "valid-session" }
  });

  const response = await POST(request, { params: {} });
  expect(response.status).toBe(201);
});
```

### Step 5: Verify & Test

```bash
# Type check
pnpm typecheck

# Run tests
pnpm test

# Manual testing
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item"}'
```

---

## Troubleshooting

### "Organization context not found"

**Cause**: Missing `orgId` in request

**Solution**:
```typescript
// Must include orgId in query params or header
fetch("/api/items?orgId=org-123")

// Or explicitly in header
fetch("/api/items", {
  headers: { "x-org-id": "org-123" }
})
```

### "Permission denied (403)"

**Cause**: User doesn't have required role

**Solution**:
```typescript
// Check membership
const member = await getMembership(userId, orgId);
console.log(member.role);

// Adjust required roles in endpoint
export const POST = createOrgEndpoint({
  roles: ['manager']  // Change if needed
});
```

### Rate limit exceeded

**Cause**: Too many requests too fast

**Solution**:
```typescript
// Add exponential backoff retry
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.code === 'RATE_LIMITED' && i < maxRetries - 1) {
        await sleep(Math.pow(2, i) * 1000);
      } else {
        throw err;
      }
    }
  }
}
```

### Type errors in handler

**Cause**: Incorrect input schema

**Solution**:
```typescript
// Verify schema matches expected input
const result = await CreateItemSchema.parseAsync(body);
console.log(result);  // Check types match
```

---

## Summary

The SDK Factory provides:
- ✅ 90%+ migration of API routes
- ✅ Boilerplate reduction of 60-70%
- ✅ Type safety from request to response
- ✅ Production-grade security
- ✅ Standardized error handling
- ✅ Built-in monitoring & logging

**Next Steps**:
1. Implement Proposal 1 (middleware chain)
2. Implement Proposal 2 (batch operations)
3. Implement Proposal 4 (webhook security)
4. Migrate remaining 10% of routes

---

**Status**: Production Ready  
**Maintenance**: Active  
**Support**: See .github/copilot-instructions.md
