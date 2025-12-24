# L2 — Onboarding & Network Creation

> **Status:** ✅ Documented from actual codebase analysis **Last Updated:** 2025-12-17 **Analyzed
> Routes:** 7 endpoints, ~400 LOC

## 1. Role in the System

The Onboarding subsystem handles new user registration and organization network setup. It provides
three distinct flows:

1. **Create Organization Network** - New organizations starting from scratch
2. **Create Corporate Network** - Enterprise/corporate onboarding with admin controls
3. **Join Existing Network** - Users joining via invitation tokens

All routes use the `@fresh-schedules/api-framework` SDK with typed validation and authentication.

## 2. Actual Implementation Analysis

### 2.1 Endpoints Inventory

| Endpoint                                   | Method | Purpose                          | Auth        | Validation                        |
| ------------------------------------------ | ------ | -------------------------------- | ----------- | --------------------------------- |
| `/api/onboarding/profile`                  | POST   | Complete user profile setup      | ✅ Required | `OnboardingProfileSchema`         |
| `/api/onboarding/verify-eligibility`       | POST   | Check if user can create network | ✅ Required | Custom schema                     |
| `/api/onboarding/create-network-org`       | POST   | Create new organization network  | ✅ Required | `CreateOrgOnboardingSchema`       |
| `/api/onboarding/create-network-corporate` | POST   | Create corporate network         | ✅ Required | `CreateCorporateOnboardingSchema` |
| `/api/onboarding/join-with-token`          | POST   | Join existing network via token  | ✅ Required | `OnboardingJoinWithTokenSchema`   |
| `/api/onboarding/activate-network`         | POST   | Activate network post-creation   | ✅ Required | `ActivateNetworkSchema`           |
| `/api/onboarding/admin-form`               | POST   | Admin-specific onboarding data   | ✅ Required | TBD                               |

**All endpoints** use `createAuthenticatedEndpoint()` from the API framework - **A09 Handler
Signature Invariant** is enforced.

### 2.2 Data Models & Types

From `packages/types/src/onboarding.ts`:

```typescript
// Onboarding Intent
export const OnboardingIntent = z.enum(["create_org", "create_corporate", "join_existing"]);

// Onboarding Status
export const OnboardingStatus = z.enum(["not_started", "in_progress", "complete"]);

// Profile Input
export const OnboardingProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  avatar: z.string().url().optional(),
  timezone: z.string().optional(),
});

// Create Org Network
export const CreateOrgOnboardingSchema = z.object({
  orgName: z.string().min(1),
  // ... additional fields
});

// Create Corporate Network
export const CreateCorporateOnboardingSchema = z.object({
  corporateName: z.string().min(1),
  // ... additional fields
});

// Join With Token
export const OnboardingJoinWithTokenSchema = z.object({
  token: z.string().min(1),
});
```

### 2.3 Firestore Collections Used

- **`networks`** - Organization/network documents
  - Fields: `id`, `name`, `status`, `activatedAt`, `createdAt`, `updatedAt`, `ownerId`
  - Status enum: `"active" | "inactive" | "pending"`

**Note:** Limited Firestore usage detected in packed code. Most onboarding logic appears to return
mock/local data for development.

### 2.4 Authentication & Context

All routes receive:

```typescript
{
  request: NextRequest,
  input: ValidatedInput,
  context: {
    auth?: {
      userId: string,
      email: string,
      email_verified: boolean,
      customClaims: Record<string, unknown>
    }
  },
  params: Record<string, string>
}
```

Authentication is **required** via `createAuthenticatedEndpoint()` - unauthorized requests are
rejected before handler execution.

## 3. Critical Findings

### 🔴 CRITICAL-01: Missing Actual Firestore Operations

**Location:** All onboarding routes **Issue:** Most endpoints return `ok(mockData)` without
persisting to Firestore

**Example from profile route:**

```typescript
// ❌ PROBLEM: No Firestore write operation
const profile = {
  userId: context.auth?.userId,
  firstName,
  lastName,
  avatar,
  timezone: timezone || "UTC",
  updatedAt: Date.now(),
  onboardingComplete: true,
};
return ok(profile); // Just returns data, doesn't save
```

**Impact:** User profiles/onboarding state not persisted **Recommendation:** Add Firestore writes
using typed wrappers:

```typescript
await updateDocWithType<UserProfile>(adminDb, userRef, profile);
```

### 🔴 CRITICAL-02: Placeholder Test Coverage

**Location:** `apps/web/app/api/onboarding/__tests__/` **Issue:** All tests are placeholders with no
actual assertions

**Example:**

```typescript
describe("api/onboarding/profile route", () => {
  it("is wired for tests (placeholder)", () => {
    expect(true).toBe(true); // ❌ Not testing anything
  });
});
```

**Impact:** Zero coverage of critical onboarding flows **Recommendation:** Implement contract tests
for each endpoint (see §5 for examples)

### 🟡 HIGH-01: No Validation of Network Ownership

**Location:** `activate-network/route.ts` **Issue:** Any authenticated user can activate any
networkId

```typescript
const { networkId } = typedInput;
const networkRef = adb.collection("networks").doc(String(networkId));
await updateDocWithType<NetworkDoc>(adb, networkRef, {
  status: "active", // ❌ No ownership check!
});
```

**Impact:** Authorization bypass vulnerability **Recommendation:** Verify
`context.auth.userId === network.ownerId` before activation

### 🟡 HIGH-02: Missing Idempotency

**Location:** All POST endpoints **Issue:** Repeated requests can cause duplicate network creation

**Recommendation:** Use idempotency keys:

```typescript
export const POST = createAuthenticatedEndpoint({
  input: Schema,
  idempotency: { keyField: "requestId" },  // ✅ Add this
  handler: async ({ input }) => { ... }
});
```

## 4. Architectural Notes & Invariants

### ✅ Enforced Invariants

1. **A09 Handler Signature Invariant** - All routes use SDK factory pattern
2. **Input Validation** - Zod schemas validate all request bodies before handler execution
3. **Authentication Required** - `createAuthenticatedEndpoint()` blocks unauthenticated requests
4. **Type Safety** - Typed wrappers (`updateDocWithType`) used for Firestore operations

### ⚠️ Missing Invariants

1. **Authorization Checks** - No validation of resource ownership
2. **Audit Logging** - No tracking of onboarding events
3. **Rate Limiting** - No protection against onboarding spam
4. **Transaction Safety** - Multi-step flows not wrapped in transactions

## 5. Example Patterns

### ✅ Good Pattern: SDK Factory Usage

```typescript
// File: onboarding/profile/route.ts
export const POST = createAuthenticatedEndpoint({
  input: OnboardingProfileSchema, // ✅ Typed validation
  handler: async ({ request, input, context, params }) => {
    // ✅ Type-safe input
    const { firstName, lastName, avatar, timezone } = input;

    // ✅ Structured response
    return ok({
      userId: context.auth?.userId,
      firstName,
      lastName,
      onboardingComplete: true,
    });
  },
});
```

**Why Good:**

- Uses standard SDK factory
- Input automatically validated
- Type-safe throughout
- Consistent error handling

### ❌ Bad Pattern: Missing Persistence

```typescript
// ❌ CURRENT: Just returns data
return ok(profile);

// ✅ SHOULD BE: Persist to Firestore
await setDoc(userRef, profile);
return ok(profile);
```

### ❌ Bad Pattern: No Authorization Check

```typescript
// File: activate-network/route.ts
// ❌ CURRENT: No ownership verification
const networkRef = adb.collection("networks").doc(String(networkId));
await updateDocWithType<NetworkDoc>(adb, networkRef, {
  status: "active",
});

// ✅ SHOULD BE: Verify ownership first
const networkSnap = await getDoc(networkRef);
const network = networkSnap.data() as NetworkDoc;

if (network.ownerId !== context.auth.userId) {
  return forbidden("Not authorized to activate this network");
}

await updateDocWithType<NetworkDoc>(adb, networkRef, {
  status: "active",
  activatedBy: context.auth.userId,
  activatedAt: Timestamp.now(),
});
```

### ✅ Refactored Pattern: Complete Onboarding Flow

```typescript
export const POST = createAuthenticatedEndpoint({
  input: OnboardingProfileSchema,
  idempotency: { keyField: "requestId" },
  handler: async ({ input, context }) => {
    const userId = context.auth!.userId;

    // 1. Validate user doesn't already have a profile
    const userRef = adminDb.collection("users").doc(userId);
    const existing = await getDoc(userRef);

    if (existing.exists()) {
      return badRequest("Profile already exists");
    }

    // 2. Create profile with audit trail
    const profile: UserProfile = {
      userId,
      ...input,
      onboardingComplete: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(userRef, profile);

    // 3. Log onboarding event
    await addDoc(adminDb.collection("audit_log"), {
      event: "onboarding_profile_created",
      userId,
      timestamp: Timestamp.now(),
    });

    return ok(profile);
  },
});
```

## 6. Open Questions

1. **What is the complete onboarding flow sequence?**
   - Which endpoints are called in what order?
   - Are there client-side state machines?

2. **How are invitation tokens generated and validated?**
   - Where is `join-with-token` logic implemented?
   - Token expiration/single-use enforcement?

3. **What triggers network activation?**
   - Is it automatic after creation or requires admin action?
   - What side effects occur on activation?

4. **How does corporate onboarding differ from org onboarding?**
   - Different permissions?
   - Additional validation steps?

## 7. Recommendations Summary

| Priority | Action                                          | Estimated Effort |
| -------- | ----------------------------------------------- | ---------------- |
| 🔴 P0    | Add Firestore persistence to all endpoints      | 2-3 days         |
| 🔴 P0    | Implement real test coverage (not placeholders) | 3-4 days         |
| 🟡 P1    | Add authorization checks (ownership validation) | 1-2 days         |
| 🟡 P1    | Add idempotency support to POST endpoints       | 1 day            |
| 🟢 P2    | Add audit logging for onboarding events         | 1 day            |
| 🟢 P2    | Add rate limiting to prevent abuse              | 1 day            |
| 🟢 P3    | Document complete onboarding flow diagram       | 1 day            |

**Total Estimated Effort:** ~10-15 days

## 8. Related Subsystems

- **RBAC/Security** - User roles assigned during onboarding
- **Organizations** - Network creation tied to org hierarchy
- **Authentication** - Firebase Auth integration
- **Notifications** - Welcome emails/onboarding notifications (not yet implemented)

## 9. Next Steps

1. Prioritize fixing CRITICAL-01 (missing Firestore persistence)
2. Add comprehensive test coverage for happy path + edge cases
3. Implement authorization checks before network operations
4. Document complete onboarding user flow with sequence diagrams
