---
id: A06
extends: 03_DIRECTIVES.md
section: Implementation Patterns
tags: [patterns, api, sdk-factory, coding, types]
status: canonical
priority: P1
source: docs/standards/CODING_RULES_AND_PATTERNS.md
---

# Amendment A06: Coding Patterns & Implementation Standards

## Purpose
Extends 03_DIRECTIVES with specific implementation patterns for Fresh Schedules codebase.

## Core Patterns

### Pattern 1: SDK Factory (Current Standard)
**All API routes** use `createOrgEndpoint` or factory variants.

```typescript
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateScheduleSchema } from "@fresh-schedules/types";

export const POST = createOrgEndpoint({
  roles: ["manager"],
  rateLimit: { maxRequests: 50, windowMs: 60000 },
  input: CreateScheduleSchema,
  handler: async ({ input, context }) => {
    // input is typed & validated
    // context has auth + org
  }
});
```

### Pattern 2: Zod-First Types
**Never duplicate types**. Always use `z.infer<typeof Schema>`.

```typescript
// ❌ WRONG
export const UserSchema = z.object({ name: z.string() });
interface User { name: string; }  // Duplicate!

// ✅ CORRECT
export const UserSchema = z.object({ name: z.string() });
export type User = z.infer<typeof UserSchema>;
```

### Pattern 3: Triad of Trust
Every domain entity MUST have all three:
1. **Zod Schema** (`packages/types/src/`)
2. **API Route** (`apps/web/app/api/`)
3. **Firestore Rules** (`firestore.rules`)

### Pattern 4: Organization Isolation
**Always scope** to organization context.

```typescript
// ❌ WRONG
const schedules = await db.collection("schedules").get();

// ✅ CORRECT
const schedules = await db
  .collection(`orgs/${context.org!.orgId}/schedules`)
  .get();
```

### Pattern 5: File Headers
Every source file needs:

```typescript
// [P#][DOMAIN][CATEGORY] Description
// Tags: P#, DOMAIN, CATEGORY

// P# = Priority (P0=critical, P1=important, P2=standard)
// DOMAIN = AUTH, API, UI, DB, TEST
// CATEGORY = CODE, SCHEMA, TEST, MIDDLEWARE
```

## API Route Template

```typescript
// [P0][API][CODE] Schedules API endpoint
// Tags: P0, API, CODE

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateScheduleSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

export const GET = createOrgEndpoint({
  handler: async ({ context }) => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();
    
    const snapshot = await db
      .collection(`orgs/${context.org!.orgId}/schedules`)
      .get();
    
    const schedules = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({ data: schedules });
  }
});

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

## Schema Template

```typescript
// [P0][DOMAIN][SCHEMA] Schedule entity schema
// Tags: P0, DOMAIN, SCHEMA

import { z } from "zod";

// Base schema (full document)
export const ScheduleSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  name: z.string().min(1).max(100),
  startDate: z.number().int().positive(),
  endDate: z.number().int().positive(),
  status: z.enum(["draft", "published", "cancelled"]).default("draft"),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive()
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
});

export type Schedule = z.infer<typeof ScheduleSchema>;

// Derive Create/Update schemas
export const CreateScheduleSchema = ScheduleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const UpdateScheduleSchema = ScheduleSchema.partial().omit({
  id: true,
  orgId: true  // Immutable
});
```

## Error Handling Pattern

```typescript
try {
  const result = await operation();
  return NextResponse.json(result);
} catch (err) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  console.error("Operation failed", {
    error: message,
    userId: context.auth?.userId,
    orgId: context.org?.orgId
  });
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message } },
    { status: 500 }
  );
}
```

## Reference
Full guide: `docs/standards/SDK_FACTORY_COMPREHENSIVE_GUIDE.md`  
Source: `archive/amendment-sources/CODING_RULES_AND_PATTERNS.md`
