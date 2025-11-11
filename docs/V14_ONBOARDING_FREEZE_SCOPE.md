# V14 Onboarding Freeze - Implementation Scope & Tasks

**Goal**: Freeze the v14 onboarding + tenant model so that types, APIs, and Firestore docs all match.
**Status**: READY (after PR #62 fixes)
**Effort**: ~2-3 days for full implementation + validation

---

## Files to Touch (Only These)

**Type Definitions**:

- `packages/types/src/onboarding.ts` (NEW schemas)
- `packages/types/src/orgs.ts` (use existing OrganizationSchema)
- `packages/types/src/venues.ts` (use existing VenueSchema)
- `packages/types/src/networks.ts` (use existing NetworkSchema)
- `packages/types/src/corporates.ts` (use existing Corporate type)
- `packages/types/src/join-tokens.ts` (clarify path comments)

**API Routes** (onboarding flows):

- `apps/web/app/api/onboarding/create-network-org/route.ts`
- `apps/web/app/api/onboarding/create-network-corporate/route.ts`
- `apps/web/app/api/onboarding/join-with-token/route.ts`
- `apps/web/app/api/onboarding/admin-form/route.ts` (align schema usage)

**New File**:

- `apps/web/src/lib/userOnboarding.ts` (canonical helper)

**Security Rules**:

- `firestore.rules` (explicit join-token path match)
- `tests/rules/**/*.ts` (join-token access tests)

---

## Task 1: Complete Onboarding Types (packages/types/src/onboarding.ts)

### Add to onboarding.ts

```typescript
/**
 * Schema for creating an organization during onboarding.
 * Used by create-network-org API.
 */
export const CreateOrgOnboardingSchema = z.object({
  orgName: z.string().min(1),
  venueName: z.string().min(1),
  formToken: z.string().min(1),
  location: z
    .object({
      street1: z.string().optional(),
      street2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      countryCode: z.string().min(2).max(2),
      timeZone: z.string().min(1),
    })
    .optional(),
});
export type CreateOrgOnboarding = z.infer<typeof CreateOrgOnboardingSchema>;

/**
 * User's intent when starting onboarding.
 */
export const OnboardingIntent = z.enum([
  "create_org",
  "create_corporate",
  "join_existing",
]);
export type OnboardingIntent = z.infer<typeof OnboardingIntent>;

/**
 * Current status of user's onboarding process.
 */
export const OnboardingStatus = z.enum([
  "not_started",
  "in_progress",
  "complete",
]);
export type OnboardingStatus = z.infer<typeof OnboardingStatus>;

/**
 * Complete onboarding state for a user.
 * Stored at users/{uid}.onboarding in Firestore.
 */
export const OnboardingStateSchema = z.object({
  status: OnboardingStatus,
  intent: OnboardingIntent.optional(),
  stage: z
    .enum(["profile", "admin_form", "network_created", "joined_workspace"])
    .optional(),
  primaryNetworkId: z.string().optional(),
  primaryOrgId: z.string().optional(),
  primaryVenueId: z.string().optional(),
  completedAt: z.number().int().positive().optional(),
  lastUpdatedAt: z.number().int().positive().optional(),
});
export type OnboardingState = z.infer<typeof OnboardingStateSchema>;
```

### Acceptance

- ✅ `pnpm typecheck` passes
- ✅ Add basic tests in `packages/types/src/__tests__/onboarding.test.ts` for schema validation

---

## Task 2: Use Schemas in All Onboarding APIs

### Pattern for all 4 routes

**Instead of**:

```typescript
const body = await req.json();
const { orgName, venueName, formToken } = body;
```

**Do this**:

```typescript
import { CreateOrgOnboardingSchema } from "@fresh-schedules/types";

let bodyUnknown: unknown;
try {
  bodyUnknown = await req.json();
} catch {
  return NextResponse.json({ error: "invalid_json" }, { status: 400 });
}

const parsed = CreateOrgOnboardingSchema.safeParse(bodyUnknown);
if (!parsed.success) {
  return NextResponse.json(
    { error: "validation_error", issues: parsed.error.flatten() },
    { status: 422 },
  );
}

const { orgName, venueName, formToken, location } = parsed.data;
```

### Apply to

1. `create-network-org/route.ts` - use CreateOrgOnboardingSchema
1. `create-network-corporate/route.ts` - create schema or use existing
1. `join-with-token/route.ts` - create schema or use existing
1. `admin-form/route.ts` - align with schema pattern

### Acceptance (2)

- ✅ `pnpm typecheck` passes
- ✅ All onboarding APIs import and use schemas from `@fresh-schedules/types`

---

## Task 3: Make Created Docs v14-Compliant

### Org + Venue (create-network-org/route.ts)

**Org Document**:

```typescript
const createdAt = nowMs;
tx.set(orgRef, {
  id: orgRef.id,
  networkId: networkRef.id,
  name: orgName || "Org",
  ownerId: uid,
  memberCount: 1,
  status: "trial", // consistent with OrganizationSchema
  createdAt,
  updatedAt: createdAt,
});
```

**Venue Document** (with optional location):

```typescript
tx.set(venueRef, {
  id: venueRef.id,
  orgId: orgRef.id,
  networkId: networkRef.id,
  name: venueName || "Main Venue",
  createdAt,
  updatedAt: createdAt,
  ...(location && {
    location: {
      street1: location.street1 ?? "",
      street2: location.street2 ?? "",
      city: location.city,
      state: location.state,
      postalCode: location.postalCode,
      countryCode: location.countryCode,
      timeZone: location.timeZone,
    },
  }),
});
```

**Test**: After creating via emulator:

```typescript
const orgDoc = (await adminDb.collection("orgs").doc(orgRef.id).get()).data();
OrganizationSchema.parse(orgDoc); // ✅ must pass

const venueDoc = (await adminDb.collection("venues").doc(venueRef.id).get()).data();
VenueSchema.parse(venueDoc); // ✅ must pass
```

### Corporate + Network (create-network-corporate/route.ts)

**Network Document**:

```typescript
const createdAt = nowMs;
tx.set(networkRef, {
  id: networkRef.id,
  displayName: corporateName || `Corporate Network ${new Date().toISOString()}`,
  kind: "corporate_network",
  ownerUserId: uid,
  createdAt,
  updatedAt: createdAt,
  // keep existing fields like industry, approxLocations if present
});
```

**Corporate Subdocument**:

```typescript
tx.set(corpRef, {
  id: corpRef.id,
  networkId: networkRef.id,
  name: corporateName || "Corporate",
  brandName: brandName || null,
  industry: industry || null,
  approxLocations: approxLocations || null,
  contactUserId: uid,
  createdAt,
  updatedAt: createdAt,
});
```

**Test**: After creating via emulator:

```typescript
const networkDoc = (await adminDb.collection("networks").doc(networkRef.id).get()).data();
NetworkSchema.parse(networkDoc); // ✅ must pass

const corpDoc = (await adminDb.collection("corporates").doc(corpRef.id).get()).data();
// CorporateSchema.parse(corpDoc); // ✅ must pass
```

### Acceptance (3)

- ✅ All docs created by onboarding flows are valid according to v14 Zod schemas

---

## Task 4: Implement Canonical User Onboarding State

### Create apps/web/src/lib/userOnboarding.ts

```typescript
import type { Firestore } from "firebase-admin/firestore";
import { OnboardingIntent } from "@fresh-schedules/types";

/**
 * Mark user's onboarding as complete.
 * This is the canonical place where onboarding state is recorded.
 * No other code should write to users/{uid}.onboarding.
 */
export async function markOnboardingComplete({
  adminDb,
  uid,
  intent,
  networkId,
  orgId,
  venueId,
}: {
  adminDb: Firestore;
  uid: string;
  intent: OnboardingIntent;
  networkId: string;
  orgId?: string;
  venueId?: string;
}) {
  if (!adminDb) return;
  const now = Date.now();
  const userRef = adminDb.collection("users").doc(uid);

  await userRef.set(
    {
      onboarding: {
        status: "complete",
        stage: "network_created",
        intent,
        primaryNetworkId: networkId,
        primaryOrgId: orgId ?? null,
        primaryVenueId: venueId ?? null,
        completedAt: now,
        lastUpdatedAt: now,
      },
    },
    { merge: true },
  );
}
```

### Use in All Onboarding Flows

**create-network-org/route.ts** (after successful transaction):

```typescript
import { markOnboardingComplete } from "@/src/lib/userOnboarding";

// ... after transaction commits ...
await markOnboardingComplete({
  adminDb,
  uid,
  intent: "create_org",
  networkId: networkRef.id,
  orgId: orgRef.id,
  venueId: venueRef.id,
});
```

**create-network-corporate/route.ts**:

```typescript
await markOnboardingComplete({
  adminDb,
  uid,
  intent: "create_corporate",
  networkId: networkRef.id,
  orgId: corpRef.id,
});
```

**join-with-token/route.ts**:

```typescript
await markOnboardingComplete({
  adminDb,
  uid,
  intent: "join_existing",
  networkId: data.networkId,
  orgId: data.orgId,
});
```

### Acceptance (4)

- ✅ After each onboarding flow: `users/{uid}.onboarding` exists with correct fields
- ✅ `OnboardingStateSchema.parse(userDoc.onboarding)` passes
- ✅ Single helper used by all flows; no other code writes `onboarding.status`

---

## Task 5: Normalize Join Token Path

### Inspect current implementation

Check: `apps/web/app/api/onboarding/join-with-token/route.ts`

- Is join token at `adminDb.collection("join_tokens").doc(tokenId)` ?
- Or nested: `orgs/{orgId}/join_tokens/{tokenId}` ?

**Standardize on ONE path only.**

### Update Documentation

In `packages/types/src/join-tokens.ts`:

```typescript
/**
 * Join token stored at: adminDb.collection("join_tokens").doc(tokenId)
 * (or nested path if different - be explicit, no ambiguity)
 */
```

### Update Firestore Rules

In `firestore.rules`:

```firestore
match /join_tokens/{tokenId} {
  // Only authorized actors can create/disable
  // Clients cannot read token secrets
}
```

### Add Rule Tests

In `tests/rules/**/*.spec.ts`:

```typescript
test("only admins can create join tokens", async () => {
  // verify admin can create
  // verify regular user cannot
});

test("clients cannot read token secrets", async () => {
  // verify client request blocked
  // verify admin SDK can read
});
```

### Run validation

```bash
pnpm test:rules
```

---

## ✅ Final Validation Checklist

After all tasks complete:

- [ ] `pnpm typecheck` → 0 errors
- [ ] `pnpm test` → all tests pass
- [ ] `pnpm test:rules` → all rule tests pass
- [ ] `pnpm lint` → acceptable errors only (37-50 warnings, 0 errors)
- [ ] Verify all created docs validate against Zod schemas
- [ ] Verify `users/{uid}.onboarding` is canonical source of truth
- [ ] Commit with clear message: "chore: Freeze v14 onboarding + tenant model"
- [ ] Create PR with comprehensive description

---

## Related Docs

- `docs/PR62_REVIEW_SUMMARY.md` - Summary of all review comments to fix first
- `docs/TECHNICAL_DEBT.md` - Tracks debt items (onboarding consolidation listed as Phase 2 opportunity)
- `docs/CONSOLIDATION_OPPORTUNITIES.md` - Follow-up work after freeze

