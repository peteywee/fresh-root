# Coding Rules and Patterns Guide

> **Purpose**: Prevent errors at code creation time through clear, enforceable rules based on existing codebase patterns. Consolidates canonical rules with error prevention patterns and series-A safeguards.
>
> **Last Updated**: 2025-12-06
> **Version**: 2.1 (Consolidated with Error Prevention Patterns & Series-A Standards)
> **Based on**: Fresh Schedules v1.1.0 codebase analysis + Phase 2 consolidation

---

**Breadcrumb Navigation:**  
[Home](./README.md) · [Quick Start](./QUICK_START.md) · [Production Readiness](./PRODUCTION_READINESS.md) > **📍 You Are Here: Coding Rules** · [Deployment Guide](./PRODUCTION_DEPLOYMENT_GUIDE.md)

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [The Triad of Trust](#the-triad-of-trust)
3. [Type Safety Rules](#type-safety-rules)
4. [API Development Rules](#api-development-rules)
5. [Security Rules](#security-rules)
6. [Error Handling Rules](#error-handling-rules)
7. [Error Prevention & Pattern Recognition](#error-prevention--pattern-recognition) (NEW: Consolidated from ERROR_PREVENTION_PATTERNS.md)
8. [Testing Rules](#testing-rules)
9. [File Organization Rules](#file-organization-rules)
10. [Common Anti-Patterns to Avoid](#common-anti-patterns-to-avoid)
11. [Pattern Checklists](#pattern-checklists)
12. [Automated Validation](#automated-validation)

---

## Core Principles

### 1. **Zod-First Type Safety**

All types that cross boundaries (API, database, UI) MUST originate from Zod schemas.

**Why**: Prevents runtime type mismatches and provides automatic validation.

### 2. **Security by Default**

All API routes MUST have authentication and authorization middleware applied.

**Why**: Prevents unauthorized access and data breaches.

### 3. **Single Source of Truth**

Types, validation schemas, and business logic should have exactly one canonical location.

**Why**: Eliminates duplication and prevents synchronization bugs.

### 4. **Fail Fast with Clear Messages**

Validation should occur at boundaries with detailed, actionable error messages.

**Why**: Makes debugging easier and improves developer experience.

### 5. **Observability from Start**

Logging, tracing, and error tracking should be built-in, not added later.

**Why**: Enables rapid debugging and performance optimization in production.

---

## The Triad of Trust

Every domain entity that crosses system boundaries MUST be covered by all three components:

### 1. Schema (Type Definition)

**Location**: `packages/types/src/[entity].ts`

```typescript
// [P0][DOMAIN][SCHEMA] Entity description
// Tags: P0, DOMAIN, SCHEMA

import { z } from "zod";

export const EntitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  // ... other fields
});

export type Entity = z.infer<typeof EntitySchema>;

// Create/Update schemas derived from base
export const CreateEntitySchema = EntitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateEntityInput = z.infer<typeof CreateEntitySchema>;

export const UpdateEntitySchema = EntitySchema.partial().omit({
  id: true,
});

export type UpdateEntityInput = z.infer<typeof UpdateEntitySchema>;
```

### 2. API Route

**Location**: `apps/web/app/api/[entities]/route.ts`

```typescript
// [P0][API][CODE] Entities API endpoint
// Tags: P0, API, CODE

import { EntitySchema, CreateEntitySchema } from "@fresh-schedules/types";
import { NextRequest } from "next/server";
import { requireOrgMembership, requireRole } from "@/src/lib/api";
import { withSecurity } from "../_shared/middleware";
import { ok, badRequest, serverError, parseJson } from "../_shared/validation";

export const GET = withSecurity(
  requireOrgMembership(async (request: NextRequest, context) => {
    // Implementation with proper error handling
  }),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

export const POST = withSecurity(
  requireOrgMembership(
    requireRole("manager")(async (request: NextRequest, context) => {
      // ALWAYS validate input
      const parsed = await parseJson(request, CreateEntitySchema);
      if (!parsed.success) {
        return badRequest("Invalid payload", parsed.details);
      }

      // Use parsed.data (already typed and validated)
      // Implementation...
    }),
  ),
  { requireAuth: true, maxRequests: 50, windowMs: 60_000 },
);
```

### 3. Firestore Security Rules

**Location**: `firestore.rules`

```javascript
match /entities/{entityId} {
  // Read: members of org can read
  allow read: if isOrgMember(request, resource.data.orgId);

  // Write: managers+ can create/update
  allow create, update: if isOrgMember(request, request.resource.data.orgId)
                        && hasRole(request, request.resource.data.orgId, 'manager');

  // Delete: admins only
  allow delete: if isOrgMember(request, resource.data.orgId)
               && hasRole(request, resource.data.orgId, 'admin');
}
```

**Triad Coverage Check**: Run `node scripts/validate-patterns.mjs` to verify all entities have complete triad coverage.

---

## Type Safety Rules

### Rule TS-1: Never Duplicate Types

**❌ WRONG**:

```typescript
// In schema file
export const UserSchema = z.object({ name: z.string() });

// In API file
interface User {
  name: string;
}
```

**✅ CORRECT**:

```typescript
// In schema file
export const UserSchema = z.object({ name: z.string() });
export type User = z.infer<typeof UserSchema>;

// In API file
import { User } from "@fresh-schedules/types";
```

### Rule TS-2: Always Use Zod for Validation

**❌ WRONG**:

```typescript
export const POST = async (req: NextRequest) => {
  const body = await req.json();
  if (typeof body.name !== "string") {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }
  // Use body.name
};
```

**✅ CORRECT**:

```typescript
export const POST = withSecurity(async (req: NextRequest) => {
  const parsed = await parseJson(req, CreateEntitySchema);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.details);
  }
  // Use parsed.data (typed automatically)
});
```

### Rule TS-3: Derive Schemas, Don't Duplicate

**❌ WRONG**:

```typescript
export const UserSchema = z.object({ id: z.string(), name: z.string() });
export const CreateUserSchema = z.object({ name: z.string() });
```

**✅ CORRECT**:

```typescript
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.number(),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
});
```

### Rule TS-4: Use Strict TypeScript Config

**Required** in all `tsconfig.json` files:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## API Development Rules

### Rule API-1: Always Apply Security Middleware

**❌ WRONG**:

```typescript
export async function GET(request: NextRequest) {
  const data = await fetchData();
  return NextResponse.json(data);
}
```

**✅ CORRECT**:

```typescript
export const GET = withSecurity(
  requireOrgMembership(async (request: NextRequest, context) => {
    const data = await fetchData(context.orgId);
    return ok(data);
  }),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);
```

### Rule API-2: Middleware Composition Order

**CRITICAL**: Middleware must be applied in this exact order:

```typescript
withSecurity(
  // 1. Base security (CORS, rate limit, headers)
  requireOrgMembership(
    // 2. Organization membership check
    requireRole(
      // 3. Role-based authorization (if needed)
      handler, // 4. Your business logic
    ),
  ),
  options,
);
```

### Rule API-3: Validate ALL Inputs

**❌ WRONG**:

```typescript
export const POST = withSecurity(async (req) => {
  const body = await req.json();
  await db.collection("items").add(body); // No validation!
});
```

**✅ CORRECT**:

```typescript
export const POST = withSecurity(async (req) => {
  const parsed = await parseJson(req, CreateItemSchema);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.details);
  }
  await db.collection("items").add(parsed.data);
  return ok({ success: true });
});
```

### Rule API-4: Consistent Response Helpers

Use provided response helpers for consistency:

```typescript
import { ok, badRequest, serverError } from "../_shared/validation";

// Success
return ok({ data: result });

// Client error (400)
return badRequest("Validation failed", { field: "error message" });

// Server error (500)
return serverError("Database connection failed");
```

### Rule API-5: Handle Errors at Boundaries

```typescript
export const GET = withSecurity(async (req, context) => {
  try {
    const data = await fetchData(context.orgId);
    return ok({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    // Log error with context
    req.logger?.error("Failed to fetch data", { error: message, orgId: context.orgId });
    return serverError(message);
  }
});
```

### Rule API-6: Standard File Header

**REQUIRED** at the top of every file:

```typescript
// [P#][DOMAIN][CATEGORY] Description
// Tags: P#, DOMAIN, CATEGORY, additional-tags

// Where:
// P# = Priority (P0=critical, P1=important, P2=standard)
// DOMAIN = AUTH, API, UI, DB, TEST, etc.
// CATEGORY = CODE, SCHEMA, TEST, MIDDLEWARE, etc.
```

---

## Security Rules

### Rule SEC-1: Session-Based Authentication

All API routes MUST verify session cookies:

```typescript
export const GET = withSecurity(
  requireOrgMembership(handler),
  { requireAuth: true }, // ← REQUIRED
);
```

### Rule SEC-2: Organization Isolation

Always scope queries to the user's organization:

**❌ WRONG**:

```typescript
const schedules = await db.collection("schedules").get(); // No scoping!
```

**✅ CORRECT**:

```typescript
const schedules = await db.collection(`organizations/${context.orgId}/schedules`).get();
```

### Rule SEC-3: Role-Based Access Control

Use hierarchical role checking:

```typescript
// Role hierarchy (lowest to highest):
// staff < corporate < scheduler < manager < admin < org_owner

export const POST = withSecurity(
  requireOrgMembership(
    requireRole("manager")(handler), // Requires manager or higher
  ),
);
```

### Rule SEC-4: Input Sanitization

Let Zod handle sanitization through schema definition:

```typescript
export const CreatePostSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().max(10000),
  tags: z.array(z.string().trim().toLowerCase()).max(10),
});
```

### Rule SEC-5: Rate Limiting

Apply appropriate rate limits based on endpoint sensitivity:

```typescript
// Read operations
{ requireAuth: true, maxRequests: 100, windowMs: 60_000 }

// Write operations
{ requireAuth: true, maxRequests: 50, windowMs: 60_000 }

// Sensitive operations (auth, payments)
{ requireAuth: true, maxRequests: 10, windowMs: 60_000 }
```

### Rule SEC-6: Secure Cookie Flags

Session cookies MUST have these flags:

```typescript
res.setHeader(
  "Set-Cookie",
  `session=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${ttl}`,
);
```

---

## Error Handling Rules

### Rule ERR-1: Use Type-Safe Error Classes

**❌ WRONG**:

```typescript
throw new Error("Validation failed");
```

**✅ CORRECT**:

```typescript
// Define custom error classes
export class ValidationError extends Error {
  constructor(
    public readonly fields: Record<string, string[]>,
    public readonly statusCode: number = 422,
  ) {
    super("Validation failed");
  }

  toJSON() {
    return { error: "Validation failed", fields: this.fields };
  }
}

// Use it
throw new ValidationError({ email: ["Invalid email format"] });
```

### Rule ERR-2: Always Log Context

```typescript
try {
  await operation();
} catch (err) {
  // Include relevant context
  logger.error("Operation failed", {
    error: err instanceof Error ? err.message : String(err),
    userId: context.userId,
    orgId: context.orgId,
    operation: "createSchedule",
  });
  return serverError("Operation failed");
}
```

### Rule ERR-3: Return Structured Errors

**❌ WRONG**:

```typescript
return NextResponse.json("Error", { status: 400 });
```

**✅ CORRECT**:

```typescript
return NextResponse.json(
  {
    error: {
      code: "VALIDATION_ERROR",
      message: "Invalid input",
      details: { field: ["error message"] },
    },
  },
  { status: 400 },
);
```

### Rule ERR-4: Don't Expose Internal Details

**❌ WRONG**:

```typescript
catch (err) {
  return serverError(err.stack); // Exposes internals!
}
```

**✅ CORRECT**:

```typescript
catch (err) {
  logger.error("Database error", err);
  return serverError("An error occurred"); // Generic message
}
```

---

## Testing Rules

### Rule TEST-1: Co-locate Tests

Place tests next to the code they test:

```
/api/schedules/
├── route.ts
└── __tests__/
    └── schedules.test.ts
```

### Rule TEST-2: Test File Naming

- Unit tests: `[feature].test.ts`
- Integration tests: `[feature].integration.test.ts`
- E2E tests: `[feature].e2e.test.ts`

### Rule TEST-3: Required Test Structure

```typescript
// [P1][TEST][TEST] Feature Name tests
// Tags: P1, TEST, TEST

import { describe, it, expect, beforeEach } from "vitest";

describe("Feature Name", () => {
  beforeEach(() => {
    // Setup
  });

  it("should handle success case", async () => {
    // Arrange
    const input = {
      /* test data */
    };

    // Act
    const result = await operation(input);

    // Assert
    expect(result).toEqual(expected);
  });

  it("should handle error case", async () => {
    // Test error scenarios
  });
});
```

### Rule TEST-4: Mock External Dependencies

```typescript
import { vi } from "vitest";

// Mock Firebase
vi.mock("@/src/lib/firebase.server", () => ({
  adminDb: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        set: vi.fn(),
        get: vi.fn(),
      })),
    })),
  },
}));
```

### Rule TEST-5: Test Coverage Targets

- **Critical paths (P0)**: 90%+ coverage
- **Important features (P1)**: 80%+ coverage
- **Standard features (P2)**: 70%+ coverage

---

## File Organization Rules

### Rule ORG-1: Monorepo Structure

```
fresh-root/
├── apps/              # Applications
│   └── web/          # Next.js app
├── packages/         # Shared libraries
│   ├── types/        # Type definitions
│   ├── ui/           # UI components
│   └── config/       # Configuration
├── services/         # Backend services
│   └── api/          # Express API
├── functions/        # Cloud Functions
└── docs/             # Documentation
```

### Rule ORG-2: Domain-Driven File Structure

Group by feature/domain, not by technical layer:

**❌ WRONG**:

```
/components/Button.tsx
/components/Modal.tsx
/hooks/useSchedule.ts
/utils/scheduleHelpers.ts
```

**✅ CORRECT**:

```
/schedules/
├── components/
│   ├── ScheduleCard.tsx
│   └── ScheduleForm.tsx
├── hooks/
│   └── useSchedules.ts
└── utils/
    └── scheduleHelpers.ts
```

### Rule ORG-3: Import Organization

ESLint enforces this order:

1. External/builtin imports
2. Internal package imports
3. Relative imports (parent, sibling, index)
4. Newline between groups

```typescript
// 1. External
import { z } from "zod";
import { NextRequest } from "next/server";

// 2. Internal packages
import { ScheduleSchema } from "@fresh-schedules/types";

// 3. Relative
import { withSecurity } from "../_shared/middleware";
import { ok } from "./validation";
```

### Rule ORG-4: Path Aliases

Use configured path aliases for cleaner imports:

```typescript
// ❌ WRONG
import { helper } from "../../../src/lib/helpers";

// ✅ CORRECT
import { helper } from "@/src/lib/helpers";
```

---

## Common Anti-Patterns to Avoid

### Anti-Pattern 1: Implicit any Types

**Problem**:

```typescript
function process(data) {
  // ← implicit any
  return data.value;
}
```

**Solution**:

```typescript
function process(data: { value: string }): string {
  return data.value;
}
```

### Anti-Pattern 2: Unchecked Array Access

**Problem**:

```typescript
const first = array[0]; // ← Could be undefined
first.name; // ← Runtime error if array is empty
```

**Solution**:

```typescript
const first = array[0];
if (first) {
  console.log(first.name);
}
// OR use optional chaining
const name = array[0]?.name;
```

### Anti-Pattern 3: Manual Type Guards

**Problem**:

```typescript
if (typeof data.email === "string" && data.email.includes("@")) {
  // Type still unknown
}
```

**Solution**:

```typescript
const parsed = EmailSchema.safeParse(data.email);
if (parsed.success) {
  // parsed.data is typed as string
}
```

### Anti-Pattern 4: String-Based Status

**Problem**:

```typescript
status = "pending";  // ← Typos cause bugs
if (status === "pendin") {  // ← Typo undetected
```

**Solution**:

```typescript
const Status = z.enum(["pending", "active", "completed"]);
type Status = z.infer<typeof Status>;

const status: Status = "pending";
if (status === "pendin") {  // ← Type error caught!
```

### Anti-Pattern 5: Catch Without Logging

**Problem**:

```typescript
try {
  await operation();
} catch {
  return serverError("Error"); // ← No context logged
}
```

**Solution**:

```typescript
try {
  await operation();
} catch (err) {
  logger.error("Operation failed", { error: err, context });
  return serverError("Error");
}
```

### Anti-Pattern 6: Premature Optimization

**Problem**:

```typescript
// Creating complex caching for a read that happens once
const cache = new LRUCache({ max: 1000, ttl: 60000 });
```

**Solution**:

```typescript
// Start simple, optimize if needed
const data = await db.collection("items").where("id", "==", id).get();
```

### Anti-Pattern 7: God Objects/Functions

**Problem**:

```typescript
function handleSchedule(action, data, options, flags, config) {
  if (action === "create") {
    // 100 lines
  } else if (action === "update") {
    // 100 lines
  }
  // ... more actions
}
```

**Solution**:

```typescript
function createSchedule(data: CreateScheduleInput) {
  /* ... */
}
function updateSchedule(id: string, data: UpdateScheduleInput) {
  /* ... */
}
function deleteSchedule(id: string) {
  /* ... */
}
```

---

## Pattern Checklists

### New API Endpoint Checklist

- [ ] File header with priority and tags
- [ ] Schema defined in `packages/types/src/`
- [ ] Schema uses Zod with proper validation rules
- [ ] Type exported using `z.infer<typeof Schema>`
- [ ] Route wrapped with `withSecurity()`
- [ ] Authentication required (`requireAuth: true`)
- [ ] Organization membership verified
- [ ] Role-based auth if needed
- [ ] Input validation with `parseJson()` for writes
- [ ] Error handling with try-catch
- [ ] Proper response helpers used (`ok`, `badRequest`, `serverError`)
- [ ] Firestore rules updated for entity
- [ ] Tests created in `__tests__/` directory
- [ ] Rate limiting configured appropriately

### New Domain Entity Checklist

- [ ] Schema file in `packages/types/src/[entity].ts`
- [ ] Base schema with all fields
- [ ] Create schema (omit auto-generated fields)
- [ ] Update schema (partial, omit id)
- [ ] Types inferred with `z.infer<>`
- [ ] API route created
- [ ] GET endpoint for listing/fetching
- [ ] POST endpoint for creation (if applicable)
- [ ] PATCH/PUT endpoint for updates (if applicable)
- [ ] DELETE endpoint (if applicable)
- [ ] Firestore rules added
- [ ] Triad coverage verified with validation script

### Code Review Checklist

- [ ] No manual type definitions (use Zod inference)
- [ ] All API routes have security middleware
- [ ] Input validation present on all writes
- [ ] Error handling includes logging with context
- [ ] No sensitive data in error responses
- [ ] Tests cover happy path and error cases
- [ ] No `any` types without justification
- [ ] Proper TypeScript strict mode compliance
- [ ] Import order follows ESLint rules
- [ ] No TODO/FIXME without associated issue
- [ ] Documentation updated if public API changed

---

## Automated Validation

### Pattern Validation Script

Run automated pattern checks:

```bash
node scripts/validate-patterns.mjs
```

**Enforced Patterns**:

#### Tier 0 (SECURITY) - Blocks CI/CD

- API routes must have security wrappers
- Write operations must validate input
- Firestore rules must deny by default

#### Tier 1 (INTEGRITY) - Blocks CI/CD

- Schema files must import Zod
- Types must use `z.infer<>` pattern
- Proper error handling required

#### Tier 2 (ARCHITECTURE) - Warning

- File headers should be present
- Consistent naming conventions
- Proper code organization

#### Tier 3 (STYLE) - Informational

- Code formatting
- Comment quality
- Documentation completeness

### Minimum Score Requirement

**Default**: 90 points

Score calculation:

- Start at 100
- Tier 0 violation: -25 points each
- Tier 1 violation: -10 points each
- Tier 2 violation: -2 points each
- Tier 3 violation: -0.5 points each

**Below 90**: CI/CD fails
**Any Tier 0/1**: CI/CD blocks immediately

---

## Quick Reference: Common Patterns

### Creating a New Entity

```bash
# 1. Define schema
touch packages/types/src/my-entity.ts

# 2. Create API route
touch apps/web/app/api/my-entities/route.ts

# 3. Update Firestore rules
# Edit: firestore.rules

# 4. Create tests
mkdir apps/web/app/api/my-entities/__tests__
touch apps/web/app/api/my-entities/__tests__/my-entities.test.ts

# 5. Validate
node scripts/validate-patterns.mjs
```

### Adding Authentication to Route

```typescript
// Before
export async function GET(request: NextRequest) {
  /* ... */
}

// After
export const GET = withSecurity(
  requireOrgMembership(async (request: NextRequest, context) => {
    // Access context.userId and context.orgId
  }),
  { requireAuth: true },
);
```

### Adding Role-Based Authorization

```typescript
export const POST = withSecurity(
  requireOrgMembership(
    requireRole("manager")(async (request, context) => {
      // Only managers and above can access
      // context.roles available
    }),
  ),
  { requireAuth: true },
);
```

---

## Summary

Following these rules ensures:

✅ **Type Safety**: Zod-first approach prevents type mismatches
✅ **Security**: Authentication and authorization built-in
✅ **Consistency**: Standard patterns across codebase
✅ **Maintainability**: Clear structure and documentation
✅ **Quality**: Automated validation catches issues early
✅ **Observability**: Logging and tracing from the start

**Remember**: The goal is to catch errors at **code creation time**, not at runtime or in production.

---

## Related Documentation

- [Context Manifest](/.github/agents/CONTEXT_MANIFEST.md) - Quick reference for codebase invariants
- [Architecture Documentation](/docs/COMPLETE_TECHNICAL_DOCUMENTATION.md) - Full technical details
- [Contributing Guide](/docs/CONTRIBUTING.md) - How to contribute
- [Security Documentation](/docs/security.md) - Security architecture

---

**Questions or Improvements?**
Open an issue or PR in the repository.
