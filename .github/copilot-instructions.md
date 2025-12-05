# AI Agent Guide: Fresh Schedules Codebase

**Version**: 2.0
**Last Updated**: December 5, 2025
**Target**: AI coding agents (GitHub Copilot, Claude Code, Cursor, etc.)

This guide provides essential knowledge for AI agents to be immediately productive in the Fresh Schedules codebase.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [The Triad of Trust](#the-triad-of-trust)
4. [SDK Factory Pattern (Current Standard)](#sdk-factory-pattern-current-standard)
5. [Type Safety & Validation](#type-safety--validation)
6. [Authentication & Authorization](#authentication--authorization)
7. [Security Patterns](#security-patterns)
8. [Data Layer & Firebase](#data-layer--firebase)
9. [Testing Patterns](#testing-patterns)
10. [Development Workflows](#development-workflows)
11. [Hard Rules (Must Follow)](#hard-rules-must-follow)
12. [Common Patterns & Examples](#common-patterns--examples)
13. [File Organization](#file-organization)
14. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Essential Context

- **Project Type**: Next.js 16 PWA (App Router) + Firebase backend
- **Monorepo**: pnpm workspaces + Turbo
- **Architecture**: SDK Factory pattern for API routes (90%+ migrated)
- **Type System**: Zod-first validation with TypeScript strict mode
- **Auth**: Firebase session cookies + hierarchical RBAC
- **Package Manager**: pnpm ONLY (enforced via pre-commit hooks)

### First Commands

```bash
# Install dependencies (use pnpm only!)
pnpm install --frozen-lockfile

# Start dev server
pnpm dev  # Runs apps/web on :3000

# Type check across workspaces
pnpm -w typecheck

# Run tests
pnpm test              # Unit tests (Vitest)
pnpm test:rules        # Firestore rules tests
pnpm test:e2e          # E2E tests (Playwright)

# Firebase emulators (local development)
NEXT_PUBLIC_USE_EMULATORS=true firebase emulators:start
```

### Critical Files to Read First

1. `packages/api-framework/src/index.ts` - SDK factory (current standard)
2. `packages/types/src/index.ts` - Zod schemas (single source of truth)
3. `docs/CODING_RULES_AND_PATTERNS.md` - Comprehensive coding standards
4. `firestore.rules` - Security rules (must sync with API routes)
5. `apps/web/app/api/_template/route.ts` - API route template

---

## Architecture Overview

### Monorepo Structure

```
fresh-root/
├── apps/
│   └── web/                 # Next.js PWA (App Router)
│       ├── app/            # Routes & API endpoints
│       ├── src/lib/        # Client utilities, Firebase helpers
│       └── lib/            # Legacy helpers (being phased out)
├── packages/
│   ├── api-framework/      # SDK factory (new standard) ⭐
│   ├── types/              # Zod schemas (single source of truth) ⭐
│   ├── ui/                 # UI component library
│   ├── config/             # Shared configuration
│   └── rules-tests/        # Firebase rules test infrastructure
├── functions/              # Firebase Cloud Functions
├── tests/rules/            # Firestore security rules tests
├── scripts/                # Automation & CI helpers
├── docs/                   # Documentation
├── firestore.rules         # Firestore security rules ⭐
└── storage.rules           # Cloud Storage security rules
```

### Service Boundaries

1. **Client**: Next.js React components (`apps/web/app/`)
2. **API Layer**: Next.js API routes (`apps/web/app/api/`)
3. **Data Layer**: Firebase Admin SDK (server-side only)
4. **Security Layer**: Firestore rules (client/server enforcement)

### Major Architectural Changes (Recent)

- **SDK Factory Migration**: 90%+ of routes migrated from `withSecurity` wrapper pattern to declarative SDK factory pattern
- **Zod-First Validation**: All API inputs validated via Zod schemas in `packages/types`
- **Series-A Standards**: pnpm enforcement, error pattern detection, enhanced pre-commit hooks

---

## The Triad of Trust

**CRITICAL PRINCIPLE**: Every domain entity that crosses system boundaries MUST have all three:

### 1. Zod Schema (Type Definition)

**Location**: `packages/types/src/[entity].ts`

```typescript
// [P0][DOMAIN][SCHEMA] Shift entity schema
// Tags: P0, DOMAIN, SCHEMA

import { z } from "zod";

// Base schema (full document)
export const ShiftSchema = z
  .object({
    id: z.string().min(1),
    orgId: z.string().min(1),
    scheduleId: z.string().min(1),
    startTime: z.number().int().positive(),
    endTime: z.number().int().positive(),
    status: z.enum(["draft", "published", "cancelled"]).default("draft"),
    createdAt: z.number().int().positive(),
    updatedAt: z.number().int().positive(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export type Shift = z.infer<typeof ShiftSchema>;

// Derive Create/Update schemas (never duplicate!)
export const CreateShiftSchema = ShiftSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateShiftSchema = ShiftSchema.partial().omit({ id: true });
```

### 2. API Route (with SDK Factory)

**Location**: `apps/web/app/api/[entities]/route.ts`

```typescript
// [P0][API][CODE] Shifts API endpoint
// Tags: P0, API, CODE

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateShiftSchema, UpdateShiftSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

export const GET = createOrgEndpoint({
  handler: async ({ context }) => {
    // Fetch shifts for context.org.orgId
    const shifts = await fetchShifts(context.org!.orgId);
    return NextResponse.json({ data: shifts });
  },
});

export const POST = createOrgEndpoint({
  roles: ["manager"], // Requires manager or higher
  rateLimit: { maxRequests: 50, windowMs: 60000 },
  input: CreateShiftSchema, // Auto-validates
  handler: async ({ input, context }) => {
    // input is typed and validated
    const shift = await createShift({
      ...input,
      orgId: context.org!.orgId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return NextResponse.json(shift, { status: 201 });
  },
});
```

### 3. Firestore Security Rules

**Location**: `firestore.rules`

```javascript
match /orgs/{orgId}/schedules/{scheduleId}/shifts/{shiftId} {
  // Read: org members only
  allow read: if isSignedIn() && isOrgMember(orgId);

  // Write: managers and above
  allow write: if isSignedIn()
                && isOrgMember(orgId)
                && hasAnyRole(['org_owner', 'admin', 'manager']);
}
```

**⚠️ CRITICAL**: If you add/modify any of the triad, you MUST update all three. Run `node scripts/validate-patterns.mjs` to verify coverage.

---

## SDK Factory Pattern (Current Standard)

**Status**: 90%+ of routes migrated. This is the **preferred pattern** for all new API routes.

### Why SDK Factory?

The SDK factory (`@fresh-schedules/api-framework`) provides a declarative, type-safe way to create API endpoints with built-in:

- ✅ Authentication verification
- ✅ Organization context loading
- ✅ Role-based authorization
- ✅ Input validation (Zod)
- ✅ Rate limiting (Redis-backed)
- ✅ CSRF protection
- ✅ Audit logging
- ✅ Error handling
- ✅ Request tracing

### Middleware Pipeline (Automatic)

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

### Factory Types

```typescript
// 1. Public endpoint (no auth required)
export const GET = createPublicEndpoint({
  handler: async ({ request }) => {
    /* ... */
  },
});

// 2. Authenticated endpoint (auth required, no org context)
export const GET = createAuthenticatedEndpoint({
  handler: async ({ context }) => {
    // context.auth.userId available
  },
});

// 3. Organization endpoint (auth + org membership required)
export const GET = createOrgEndpoint({
  handler: async ({ context }) => {
    // context.auth.userId, context.org.orgId, context.org.role available
  },
});

// 4. Admin endpoint (auth + admin/org_owner role required)
export const POST = createAdminEndpoint({
  handler: async ({ context }) => {
    // Only admins and org_owners can access
  },
});

// 5. Rate-limited public endpoint
export const POST = createRateLimitedEndpoint({
  rateLimit: { maxRequests: 10, windowMs: 60000 },
  handler: async ({ request }) => {
    /* ... */
  },
});
```

### Complete Example

```typescript
// apps/web/app/api/schedules/route.ts
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateScheduleSchema, UpdateScheduleSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

// GET /api/schedules?orgId=xxx
export const GET = createOrgEndpoint({
  handler: async ({ request, context }) => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();

    const schedulesSnap = await db.collection(`orgs/${context.org!.orgId}/schedules`).get();

    const schedules = schedulesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ data: schedules });
  },
});

// POST /api/schedules
export const POST = createOrgEndpoint({
  roles: ["manager"], // Requires manager or higher
  rateLimit: { maxRequests: 50, windowMs: 60000 },
  input: CreateScheduleSchema, // Auto-validates
  handler: async ({ input, context }) => {
    try {
      const { getFirestore } = await import("firebase-admin/firestore");
      const db = getFirestore();

      const schedule = {
        ...input,
        orgId: context.org!.orgId,
        createdBy: context.auth!.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docRef = await db.collection(`orgs/${context.org!.orgId}/schedules`).add(schedule);

      return NextResponse.json(
        {
          id: docRef.id,
          ...schedule,
        },
        { status: 201 },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      console.error("Failed to create schedule", {
        error: message,
        orgId: context.org?.orgId,
      });
      return NextResponse.json({ error: { code: "INTERNAL_ERROR", message } }, { status: 500 });
    }
  },
});
```

### Configuration Options

```typescript
export interface EndpointConfig<TInput, TOutput> {
  // Authentication requirement
  auth?: "required" | "optional" | "none";

  // Organization context requirement
  org?: "required" | "optional" | "none";

  // Required roles (if org is required)
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

---

## Type Safety & Validation

### Core Principle: Zod-First

**Never duplicate types.** All types that cross boundaries originate from Zod schemas.

### Schema Organization

**Location**: `packages/types/src/`

**Files**:

- `shifts.ts` - Shift entities
- `orgs.ts` - Organization entities
- `schedules.ts` - Schedule entities
- `positions.ts` - Position entities
- `rbac.ts` - Role definitions
- `memberships.ts` - Membership entities
- `index.ts` - Exports all schemas

### Schema Pattern

```typescript
// 1. Define base schema
export const EntitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  orgId: z.string().min(1),
  status: z.enum(["active", "inactive"]).default("active"),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

// 2. Infer TypeScript type
export type Entity = z.infer<typeof EntitySchema>;

// 3. Derive Create schema (omit auto-generated fields)
export const CreateEntitySchema = EntitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 4. Derive Update schema (partial, omit immutable fields)
export const UpdateEntitySchema = EntitySchema.partial().omit({
  id: true,
  orgId: true, // orgId is immutable
});
```

### Validation Error Handling

SDK factory automatically converts ZodErrors to user-friendly responses:

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

### Custom Validation Rules

```typescript
export const ShiftSchema = z
  .object({
    startTime: z.number().int().positive(),
    endTime: z.number().int().positive(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"], // Associates error with specific field
  });
```

---

## Authentication & Authorization

### Session Management

**Pattern**: Firebase Admin SDK session cookie verification

**Flow**:

1. Client authenticates with Firebase (via JS SDK)
2. Client sends ID token to `/api/session`
3. Server creates session cookie via `auth.createSessionCookie(idToken)`
4. Server sets HttpOnly, Secure, SameSite=Lax cookie
5. SDK factory verifies cookie on each request

**Cookie Flags** (required):

```typescript
Set-Cookie: session=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${ttl}
```

### Role-Based Access Control (RBAC)

**Role Hierarchy** (lowest to highest):

```
staff < corporate < scheduler < manager < admin < org_owner
```

**Role Definition**: `packages/types/src/rbac.ts`

```typescript
export const OrgRole = z.enum(["staff", "corporate", "scheduler", "manager", "admin", "org_owner"]);

export type OrgRole = z.infer<typeof OrgRole>;
```

**Hierarchical Checking**: If you require `manager`, users with `admin` or `org_owner` also pass.

**Usage**:

```typescript
// Require manager or higher
export const POST = createOrgEndpoint({
  roles: ["manager"],
  handler: async ({ context }) => {
    // context.org.role is guaranteed to be manager, admin, or org_owner
  },
});

// Require admin or org_owner only
export const DELETE = createOrgEndpoint({
  roles: ["admin"],
  handler: async ({ context }) => {
    // Only admin and org_owner can access
  },
});
```

### Organization Context

**Pattern**: Loaded from Firestore membership collection

**Query**:

```typescript
const membershipQuery = await db
  .collectionGroup("memberships")
  .where("uid", "==", userId)
  .where("orgId", "==", orgId)
  .where("status", "==", "active")
  .limit(1)
  .get();
```

**Membership Document** (`/memberships/{userId}_{orgId}`):

```typescript
{
  uid: string;
  orgId: string;
  role: OrgRole;
  status: "active" | "inactive";
  createdAt: number;
  updatedAt: number;
}
```

**Context Available in Handler**:

```typescript
{
  auth: {
    userId: string;
    email: string;
    emailVerified: boolean;
    customClaims: Record<string, unknown>;
  },
  org: {
    orgId: string;
    role: OrgRole;
    membershipId: string;
  },
  requestId: string;
  timestamp: number;
}
```

---

## Security Patterns

### 1. CSRF Protection

**Pattern**: Double-submit cookie pattern (automatic in SDK factory)

**Applied To**: POST, PUT, PATCH, DELETE (mutations only)

**Override** (if needed for webhooks):

```typescript
export const POST = createPublicEndpoint({
  csrf: false, // Disable CSRF
  handler: async () => {
    /* ... */
  },
});
```

**Client Must**:

- Include CSRF token in `X-CSRF-Token` header
- Token must match cookie value

### 2. Rate Limiting

**Implementation**: Redis-backed (production) or in-memory (dev)

**Environment Variables**:

- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (preferred for Vercel)
- OR `REDIS_URL` (for ioredis client)

**⚠️ WARNING**: In-memory rate limiting is NOT suitable for multi-instance deployments. Use Redis in production.

**Configuration**:

```typescript
export const POST = createOrgEndpoint({
  rateLimit: {
    maxRequests: 50, // 50 requests
    windowMs: 60000, // per 60 seconds
  },
  handler: async () => {
    /* ... */
  },
});
```

**Recommended Limits**:

- Read operations: 100 req/min
- Write operations: 50 req/min
- Sensitive operations (auth, payments): 10 req/min

**Response Headers**:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1672531200000
Retry-After: 45  (seconds until reset)
```

### 3. Input Validation

**Pattern**: Zod schemas validate ALL inputs at API boundaries

**Automatic**: When you specify `input: Schema`, SDK factory validates before handler

**Manual** (legacy):

```typescript
import { parseJson, badRequest } from "../_shared/validation";

const parsed = await parseJson(request, CreateEntitySchema);
if (!parsed.success) {
  return badRequest("Invalid payload", parsed.details);
}
```

### 4. Organization Isolation

**ALWAYS** scope queries to the user's organization:

**❌ WRONG**:

```typescript
const schedules = await db.collection("schedules").get(); // No scoping!
```

**✅ CORRECT**:

```typescript
const schedules = await db.collection(`orgs/${context.org!.orgId}/schedules`).get();
```

### 5. Security Headers

**Automatic**: Applied to all responses via SDK factory

**Headers Applied**:

- `Content-Security-Policy`: Restricts script/style sources
- `Strict-Transport-Security`: HSTS
- `X-Frame-Options`: DENY
- `X-Content-Type-Options`: nosniff
- `Referrer-Policy`: strict-origin-when-cross-origin
- `Permissions-Policy`: Disables geolocation, camera, etc.

---

## Data Layer & Firebase

### Firebase Admin SDK

**Location**: `apps/web/lib/firebase-admin.ts`

**Singleton Pattern**:

```typescript
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Get Firestore instance
const db = getFirestore();

// Get Auth instance
const auth = getAuth();
```

**Environment Variables Required**:

- `FIREBASE_PROJECT_ID` or `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `GOOGLE_APPLICATION_CREDENTIALS_JSON` (service account JSON string)

### Firestore Collection Paths

```
/users/{userId}                                    - User profiles
/orgs/{orgId}                                      - Organizations
/orgs/{orgId}/schedules/{scheduleId}              - Schedules
/orgs/{orgId}/schedules/{scheduleId}/shifts/{shiftId} - Shifts
/orgs/{orgId}/positions/{positionId}              - Positions
/memberships/{userId}_{orgId}                      - Memberships
/venues/{orgId}/venues/{venueId}                   - Venues
/zones/{orgId}/zones/{zoneId}                      - Zones
```

### Firestore Access Pattern

```typescript
export const GET = createOrgEndpoint({
  handler: async ({ context }) => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();

    // Query with org scoping
    const snapshot = await db
      .collection(`orgs/${context.org!.orgId}/schedules`)
      .where("status", "==", "active")
      .orderBy("startDate", "desc")
      .limit(50)
      .get();

    const schedules = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ data: schedules });
  },
});
```

### Firestore Security Rules

**Location**: `firestore.rules`

**Key Helper Functions**:

```javascript
function isSignedIn() {
  return request.auth != null;
}

function uid() {
  return request.auth.uid;
}

function isOrgMember(orgId) {
  return exists(/databases/$(database)/documents/memberships/$(uid() + "_" + orgId));
}

function hasAnyRole(orgId, roles) {
  return isOrgMember(orgId)
    && get(/databases/$(database)/documents/memberships/$(uid() + "_" + orgId))
       .data.role in roles;
}
```

**Common Patterns**:

```javascript
// Self-only access
match /users/{userId} {
  allow read, update: if isSignedIn() && userId == uid();
  allow list: if false;  // Prevent enumeration
}

// Organization members only
match /orgs/{orgId} {
  allow get: if isSignedIn() && isOrgMember(orgId);
  allow create: if isSignedIn();
  allow update, delete: if isSignedIn() && hasAnyRole(orgId, ['org_owner']);
  allow list: if false;  // Prevent enumeration
}

// Hierarchical permissions
match /orgs/{orgId}/schedules/{scheduleId} {
  allow read: if isSignedIn() && isOrgMember(orgId);
  allow write: if isSignedIn() && hasAnyRole(orgId, ['org_owner', 'admin', 'manager']);
}
```

---

## Testing Patterns

### Test Framework: Vitest

**Config**: `apps/web/vitest.config.ts`

**Run Tests**:

```bash
pnpm test              # Run all tests
pnpm test:coverage     # With coverage
pnpm test:watch        # Watch mode
```

### Test Utilities

**Location**: `packages/api-framework/src/testing.ts`

**Mock Request Builder**:

```typescript
import { createMockRequest } from "@fresh-schedules/api-framework/testing";

const request = createMockRequest("/api/shifts", {
  method: "POST",
  body: { startTime: 1234567890, endTime: 1234571490 },
  cookies: { session: "valid-session" },
  headers: { "x-org-id": "org-123" },
  searchParams: { orgId: "org-123" },
});
```

**Mock Context Builders**:

```typescript
import {
  createMockAuthContext,
  createMockOrgContext,
} from "@fresh-schedules/api-framework/testing";

const authContext = createMockAuthContext({
  userId: "user-123",
  email: "test@example.com",
});

const orgContext = createMockOrgContext({
  orgId: "org-123",
  role: "admin",
});
```

### Test Structure

**Location**: Co-located with code in `__tests__/` directories

```
/api/schedules/
├── route.ts
└── __tests__/
    └── schedules.test.ts
```

**Example Test**:

```typescript
// [P1][TEST][TEST] Schedules API tests
// Tags: P1, TEST, TEST

import { describe, it, expect, beforeEach } from "vitest";
import { createMockRequest } from "@fresh-schedules/api-framework/testing";
import { POST } from "../route";

describe("POST /api/schedules", () => {
  beforeEach(() => {
    // Setup mocks
  });

  it("should create schedule with valid input", async () => {
    const request = createMockRequest("/api/schedules", {
      method: "POST",
      body: {
        name: "Test Schedule",
        startDate: 1234567890,
        endDate: 1234571490,
      },
      cookies: { session: "valid-session" },
      searchParams: { orgId: "org-123" },
    });

    const response = await POST(request, { params: {} });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBeDefined();
    expect(data.name).toBe("Test Schedule");
  });

  it("should reject invalid input", async () => {
    const request = createMockRequest("/api/schedules", {
      method: "POST",
      body: { name: "" }, // Invalid: empty name
      cookies: { session: "valid-session" },
    });

    const response = await POST(request, { params: {} });

    expect(response.status).toBe(400);
  });
});
```

### Firestore Rules Tests

**Location**: `tests/rules/`

**Run**: `pnpm test:rules`

**Pattern**: Test Firestore rules with Firebase emulator

---

## Development Workflows

### Package Manager: pnpm ONLY

**⚠️ CRITICAL**: This project enforces pnpm. Using npm or yarn will be blocked by pre-commit hooks.

**Why pnpm?**:

- Workspace support
- Faster installs
- Strict dependency resolution
- Prevents phantom dependencies

**Common Commands**:

```bash
# Install (always use --frozen-lockfile in CI)
pnpm install --frozen-lockfile

# Add dependency to workspace root
pnpm add -w <package>

# Add dependency to specific package
pnpm add <package> --filter @apps/web

# Run script in specific package
pnpm --filter @apps/web dev

# Run script in all packages
pnpm -r build

# Clean all node_modules
pnpm clean
```

### Turbo Tasks

**Config**: `turbo.json`

**Tasks**:

- `build` - Build all packages (depends on `^build`)
- `test` - Run tests (depends on `^build`)
- `lint` - Lint all packages
- `typecheck` - Type check all packages
- `dev` - Start dev servers (no cache, persistent)
- `clean` - Clean build artifacts

**Run via pnpm**:

```bash
pnpm dev        # Turbo runs dev tasks
pnpm build      # Turbo runs build tasks
pnpm test       # Turbo runs test tasks
```

### Firebase Emulators

**Start Emulators**:

```bash
# Terminal 1: Start emulators
firebase emulators:start

# Terminal 2: Set env var and start dev server
NEXT_PUBLIC_USE_EMULATORS=true pnpm dev
```

**Seed Data**:

```bash
pnpm tsx scripts/seed/seed.emulator.ts
pnpm sim:auth  # Auth simulation
```

**Emulator Ports**:

- Firestore: `localhost:8080`
- Auth: `localhost:9099`
- Functions: `localhost:5001`
- Hosting: `localhost:5000`
- UI: `localhost:4000`

### Pre-Commit Hooks

**Location**: `.husky/pre-commit`

**Validation Steps** (runs automatically):

1. **pnpm enforcement** - Blocks npm/yarn usage
2. **Auto-tag files** - Adds metadata headers
3. **Typecheck** - Catches TS errors
4. **Format** - Prettier formatting
5. **Lint** - ESLint checks
6. **Pattern detection** - Catches recurring errors (>3x)

**Manual Run**:

```bash
pnpm typecheck
pnpm lint
pnpm format
```

### Local Quality Gates (Before PR)

**Checklist**:

- [ ] `pnpm install --frozen-lockfile` completes without warnings
- [ ] `pnpm -w typecheck` passes (13 React 19 compat errors acceptable)
- [ ] `pnpm test` passes
- [ ] `pnpm test:rules` passes (if you changed Firestore rules)
- [ ] `pnpm lint` passes
- [ ] If you touched markdown: Run "Docs: Markdown Fix" task
- [ ] No deprecated packages in install output
- [ ] No unmet peer dependencies

---

## Hard Rules (Must Follow)

### 1. Package Manager

**RULE**: Use pnpm ONLY. Never use npm or yarn.

**Why**: Enforced via pre-commit hooks and `.npmrc`. Using other package managers will cause CI failures.

### 2. Type Safety

**RULE**: Never duplicate types. Always use `z.infer<typeof Schema>`.

**❌ WRONG**:

```typescript
export const UserSchema = z.object({ name: z.string() });

interface User {
  // Duplicate!
  name: string;
}
```

**✅ CORRECT**:

```typescript
export const UserSchema = z.object({ name: z.string() });
export type User = z.infer<typeof UserSchema>;
```

### 3. Security Middleware

**RULE**: All API routes MUST use SDK factory or `withSecurity` wrapper.

**❌ WRONG**:

```typescript
export async function GET(request: NextRequest) {
  const data = await fetchData();
  return NextResponse.json(data);
}
```

**✅ CORRECT**:

```typescript
export const GET = createOrgEndpoint({
  handler: async ({ context }) => {
    const data = await fetchData(context.org!.orgId);
    return NextResponse.json({ data });
  },
});
```

### 4. Input Validation

**RULE**: All POST/PUT/PATCH routes MUST validate input via Zod.

**❌ WRONG**:

```typescript
export const POST = createOrgEndpoint({
  handler: async ({ request }) => {
    const body = await request.json(); // No validation!
    await db.collection("items").add(body);
  },
});
```

**✅ CORRECT**:

```typescript
export const POST = createOrgEndpoint({
  input: CreateItemSchema, // Validates automatically
  handler: async ({ input, context }) => {
    await db.collection("items").add(input);
  },
});
```

### 5. Organization Isolation

**RULE**: Always scope Firestore queries to `context.org.orgId`.

**❌ WRONG**:

```typescript
const schedules = await db.collection("schedules").get(); // No org scoping!
```

**✅ CORRECT**:

```typescript
const schedules = await db.collection(`orgs/${context.org!.orgId}/schedules`).get();
```

### 6. The Triad of Trust

**RULE**: Every domain entity MUST have:

1. Zod schema in `packages/types/src/`
2. API route in `apps/web/app/api/`
3. Firestore rules in `firestore.rules`

**Verify**: Run `node scripts/validate-patterns.mjs` to check coverage.

### 7. File Headers

**RULE**: Every source file MUST have a header:

```typescript
// [P#][DOMAIN][CATEGORY] Description
// Tags: P#, DOMAIN, CATEGORY, additional-tags

// Where:
// P# = Priority (P0=critical, P1=important, P2=standard)
// DOMAIN = AUTH, API, UI, DB, TEST, etc.
// CATEGORY = CODE, SCHEMA, TEST, MIDDLEWARE, etc.
```

**Auto-applied**: Pre-commit hook runs `node scripts/tag-files.mjs`

### 8. Lockfile Integrity

**RULE**: Never commit lockfile changes without explanation in PR description.

**Why**: Prevents accidental dependency changes.

### 9. No Deprecated Packages

**RULE**: If `pnpm install` shows deprecated warnings, fix before merging.

**Options**:

1. Upgrade to non-deprecated package
2. Replace with alternative
3. Document why it remains (with issue link)

### 10. Error Handling

**RULE**: Always log errors with context before returning error response.

**❌ WRONG**:

```typescript
catch (err) {
  return NextResponse.json({ error: "Error" }, { status: 500 });
}
```

**✅ CORRECT**:

```typescript
catch (err) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  console.error("Operation failed", {
    error: message,
    userId: context.auth?.userId,
    orgId: context.org?.orgId
  });
  return NextResponse.json({ error: "Error" }, { status: 500 });
}
```

---

## Common Patterns & Examples

### Creating a New Domain Entity

**Steps**:

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

**1. Schema** (`packages/types/src/my-entity.ts`):

```typescript
// [P0][DOMAIN][SCHEMA] MyEntity schema
// Tags: P0, DOMAIN, SCHEMA

import { z } from "zod";

export const MyEntitySchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  name: z.string().min(1).max(100),
  status: z.enum(["active", "inactive"]).default("active"),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

export type MyEntity = z.infer<typeof MyEntitySchema>;

export const CreateMyEntitySchema = MyEntitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateMyEntitySchema = MyEntitySchema.partial().omit({
  id: true,
  orgId: true,
});

// Export from index.ts
```

**2. API Route** (`apps/web/app/api/my-entities/route.ts`):

```typescript
// [P0][API][CODE] MyEntities API endpoint
// Tags: P0, API, CODE

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateMyEntitySchema, UpdateMyEntitySchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

// GET /api/my-entities?orgId=xxx
export const GET = createOrgEndpoint({
  handler: async ({ context }) => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();

    const snapshot = await db.collection(`orgs/${context.org!.orgId}/myEntities`).get();

    const entities = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ data: entities });
  },
});

// POST /api/my-entities
export const POST = createOrgEndpoint({
  roles: ["manager"],
  rateLimit: { maxRequests: 50, windowMs: 60000 },
  input: CreateMyEntitySchema,
  handler: async ({ input, context }) => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();

    const entity = {
      ...input,
      orgId: context.org!.orgId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = await db.collection(`orgs/${context.org!.orgId}/myEntities`).add(entity);

    return NextResponse.json({ id: docRef.id, ...entity }, { status: 201 });
  },
});

// PATCH /api/my-entities/[id]
export const PATCH = createOrgEndpoint({
  roles: ["manager"],
  input: UpdateMyEntitySchema,
  handler: async ({ input, context, params }) => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();

    const docRef = db.doc(`orgs/${context.org!.orgId}/myEntities/${params.id}`);

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

// DELETE /api/my-entities/[id]
export const DELETE = createOrgEndpoint({
  roles: ["admin"],
  handler: async ({ context, params }) => {
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();

    await db.doc(`orgs/${context.org!.orgId}/myEntities/${params.id}`).delete();

    return NextResponse.json({ success: true });
  },
});
```

**3. Firestore Rules** (`firestore.rules`):

```javascript
match /orgs/{orgId}/myEntities/{entityId} {
  // Read: org members
  allow read: if isSignedIn() && isOrgMember(orgId);

  // Create/Update: managers+
  allow create, update: if isSignedIn()
                        && isOrgMember(orgId)
                        && hasAnyRole(orgId, ['org_owner', 'admin', 'manager']);

  // Delete: admins+
  allow delete: if isSignedIn()
                && isOrgMember(orgId)
                && hasAnyRole(orgId, ['org_owner', 'admin']);
}
```

**4. Tests** (`apps/web/app/api/my-entities/__tests__/my-entities.test.ts`):

```typescript
// [P1][TEST][TEST] MyEntities API tests
// Tags: P1, TEST, TEST

import { describe, it, expect } from "vitest";
import { createMockRequest } from "@fresh-schedules/api-framework/testing";
import { GET, POST } from "../route";

describe("GET /api/my-entities", () => {
  it("should return entities for org", async () => {
    const request = createMockRequest("/api/my-entities", {
      cookies: { session: "valid-session" },
      searchParams: { orgId: "org-123" },
    });

    const response = await GET(request, { params: {} });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toBeInstanceOf(Array);
  });
});

describe("POST /api/my-entities", () => {
  it("should create entity with valid input", async () => {
    const request = createMockRequest("/api/my-entities", {
      method: "POST",
      body: { name: "Test Entity" },
      cookies: { session: "valid-session" },
      searchParams: { orgId: "org-123" },
    });

    const response = await POST(request, { params: {} });

    expect(response.status).toBe(201);
  });
});
```

### Migrating Legacy Route to SDK Factory

**Before** (legacy `withSecurity` pattern):

```typescript
import { withSecurity } from "../_shared/middleware";
import { requireOrgMembership, requireRole } from "@/src/lib/api";
import { parseJson, badRequest, ok } from "../_shared/validation";

export const POST = withSecurity(
  requireOrgMembership(
    requireRole("manager")(async (request: NextRequest, context) => {
      const parsed = await parseJson(request, CreateShiftSchema);
      if (!parsed.success) {
        return badRequest("Invalid", parsed.details);
      }
      // Business logic
      return ok({ success: true });
    }),
  ),
  { requireAuth: true, maxRequests: 50, windowMs: 60_000 },
);
```

**After** (SDK factory):

```typescript
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateShiftSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

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

**Benefits**:

- Declarative configuration
- Automatic validation
- Type-safe context
- Less boilerplate
- Consistent error handling

---

## File Organization

### Path Aliases

**Config**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./apps/web/*"],
      "@/src/*": ["./apps/web/src/*"],
      "@fresh-schedules/types": ["./packages/types/src"],
      "@fresh-schedules/api-framework": ["./packages/api-framework/src"]
    }
  }
}
```

**Usage**:

```typescript
// ❌ WRONG
import { helper } from "../../../src/lib/helpers";

// ✅ CORRECT
import { helper } from "@/src/lib/helpers";
```

### Import Order (Enforced by ESLint)

```typescript
// 1. External/builtin (Node.js, npm packages)
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

// 2. Internal packages (@fresh-schedules/*)
import { CreateShiftSchema } from "@fresh-schedules/types";
import { createOrgEndpoint } from "@fresh-schedules/api-framework";

// 3. Relative imports
import { withSecurity } from "../_shared/middleware";
import { ok, badRequest } from "./validation";
```

### Domain-Driven Structure

**Group by feature/domain, not by technical layer**:

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

---

## Troubleshooting

### Common Issues

#### 1. "Invalid Options: Unexpected top-level property"

**Cause**: ESLint v9 removed some CLI flags. Using `eslint_d` wrapper.

**Fix**: Use `eslint` directly (already fixed in latest):

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx --cache"
  }
}
```

#### 2. "packageManager field is required"

**Cause**: pnpm enforcement script checking package.json.

**Fix**: Ensure root `package.json` has:

```json
{
  "packageManager": "pnpm@9.12.1"
}
```

#### 3. 427 TypeScript Errors

**Cause**: Broken SDK factory migration (syntax errors).

**Fix**: Already reverted in latest commits. If you see TS1128, TS1005, TS1472 errors, revert to working commit.

#### 4. "Link cannot be used as JSX component" (TS2786)

**Cause**: React 19 types with Next.js 16 (uses React 18).

**Status**: Known issue, 13 errors acceptable. Will be fixed when Next.js 16.1+ supports React 19.

#### 5. Rate Limit Not Working in Production

**Cause**: Using in-memory rate limiter with multiple instances.

**Fix**: Set Redis environment variables:

```bash
UPSTASH_REDIS_REST_URL=https://....upstash.io
UPSTASH_REDIS_REST_TOKEN=****
```

#### 6. CSRF Token Invalid

**Cause**: Token not included in request header.

**Fix**: Client must send CSRF token in `X-CSRF-Token` header for mutations.

**Workaround**: Disable CSRF for public endpoints:

```typescript
export const POST = createPublicEndpoint({
  csrf: false,
  handler: async () => {
    /* ... */
  },
});
```

#### 7. "Organization context not found"

**Cause**: Missing `orgId` in query params or `x-org-id` header.

**Fix**: Include org ID in request:

```typescript
// Query param
fetch("/api/schedules?orgId=org-123");

// Header
fetch("/api/schedules", {
  headers: { "x-org-id": "org-123" },
});
```

#### 8. Firestore Permission Denied

**Cause**: Mismatch between API route permissions and Firestore rules.

**Fix**: Verify Firestore rules allow the operation for the user's role. Check membership document exists.

---

## Quick Reference

### Key Files

| Purpose          | Location                                |
| ---------------- | --------------------------------------- |
| SDK Factory      | `packages/api-framework/src/index.ts`   |
| Type Schemas     | `packages/types/src/index.ts`           |
| API Template     | `apps/web/app/api/_template/route.ts`   |
| Firestore Rules  | `firestore.rules`                       |
| Coding Standards | `docs/CODING_RULES_AND_PATTERNS.md`     |
| Firebase Admin   | `apps/web/lib/firebase-admin.ts`        |
| Test Utilities   | `packages/api-framework/src/testing.ts` |

### Environment Variables

```bash
# Firebase
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://....upstash.io
UPSTASH_REDIS_REST_TOKEN=****
# OR
REDIS_URL=redis://localhost:6379

# Emulators (Development)
NEXT_PUBLIC_USE_EMULATORS=true

# General
NODE_ENV=production|development
```

### Useful Scripts

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm typecheck              # Type check all packages
pnpm lint                   # Lint all packages
pnpm format                 # Format with Prettier

# Testing
pnpm test                   # Unit tests
pnpm test:coverage          # With coverage
pnpm test:rules             # Firestore rules tests
pnpm test:e2e               # E2E tests

# Firebase
pnpm deploy:rules           # Deploy Firestore/Storage rules
pnpm deploy:functions       # Deploy Cloud Functions
pnpm deploy:hosting         # Deploy hosting

# Utilities
node scripts/validate-patterns.mjs    # Validate triad coverage
node scripts/detect-error-patterns.js # Check for error patterns
node scripts/tag-files.mjs            # Add file headers
```

### Role Hierarchy

```
org_owner   (100) - Full control
  ↓
admin       (80)  - User management, settings
  ↓
manager     (60)  - Schedule management, reports
  ↓
scheduler   (50)  - Create/edit schedules
  ↓
corporate   (45)  - View across locations
  ↓
staff       (40)  - View own schedule
```

### HTTP Status Codes

```
200 OK                    - Success (GET)
201 Created              - Success (POST)
204 No Content           - Success (DELETE)
400 Bad Request          - Validation failed
401 Unauthorized         - Not authenticated
403 Forbidden            - Not authorized (CSRF, role)
404 Not Found            - Resource not found
409 Conflict             - Duplicate resource
429 Too Many Requests    - Rate limited
500 Internal Server Error - Unexpected error
```

### Error Response Format

```typescript
{
  "error": {
    "code": "VALIDATION_FAILED" | "UNAUTHORIZED" | "FORBIDDEN" |
            "NOT_FOUND" | "CONFLICT" | "RATE_LIMITED" | "INTERNAL_ERROR",
    "message": "Human-readable error message",
    "requestId": "uuid",
    "retryable": boolean,
    "details"?: {
      "field1": ["error message 1", "error message 2"],
      "field2": ["error message"]
    }
  }
}
```

---

## Summary

This codebase follows a **Zod-first, SDK factory pattern** with **hierarchical RBAC** and **comprehensive security**. Key takeaways:

1. **Use SDK factory** for all new API routes (declarative, type-safe)
2. **Follow the Triad of Trust** (Schema + API + Rules) for all entities
3. **Never duplicate types** - use `z.infer<typeof Schema>`
4. **Always validate inputs** - use Zod schemas
5. **Scope to org** - all queries must filter by `context.org.orgId`
6. **Use pnpm** - npm/yarn are blocked
7. **Test before PR** - typecheck, lint, test, rules tests
8. **Read the docs** - `docs/CODING_RULES_AND_PATTERNS.md` has comprehensive patterns

**For questions or improvements**, open an issue or PR at [github.com/peteywee/fresh-root](https://github.com/peteywee/fresh-root).

---

**Last Updated**: December 5, 2025 by AI Agent Analysis
