# Legacy Route Migration Plan

**Status**: Active  
**Target**: 0 TypeScript errors from legacy routes  
**Current**: 24 errors across 17 routes  
**Timeline**: 3 migration batches (8 + 5 + 4 routes)  
**Execution**: Parallel by endpoint group (onboarding, organizations, auth, etc.)

---

## Error Categories & Fixes

### Category 1: Missing `input:` Parameter (11 routes)

Routes that have schemas but don't pass them to SDK factory.

**Fix Pattern**:

```typescript
// Before
export const POST = createOrgEndpoint({
  handler: async ({ context }) => {
    const { input } = context.request; // ❌ input is unknown
  },
});

// After
export const POST = createOrgEndpoint({
  input: CreateSchemaSchema, // ✅ Add input parameter
  handler: async ({ input, context }) => {
    // ✅ Input is now typed
    // Use input directly
  },
});
```

**Routes**:

1. `app/api/batch/route.ts` - Add `input: CreateBatchSchema`
2. `app/api/internal/backup/route.ts` - Add `input: BackupRequestSchema`
3. `app/api/items/route.ts` - Add `input: CreateItemSchema`
4. `app/api/join-tokens/route.ts` - Add `input: CreateJoinTokenSchema`
5. `app/api/onboarding/create-network-org/route.ts` - Add `input: CreateNetworkSchema`
6. `app/api/onboarding/join-with-token/route.ts` - Add `input: JoinWithTokenSchema`
7. `app/api/organizations/[id]/route.ts` - Add `input: UpdateOrganizationSchema`
8. `app/api/organizations/[id]/members/route.ts` - Add inline schema or create new
9. `app/api/positions/[id]/route.ts` - Add inline or existing schema
10. `app/api/session/route.ts` - Add inline or existing schema
11. `app/api/onboarding/activate-network/route.ts` - Add inline or existing schema

---

### Category 2: Inline Schema + Missing Input (4 routes)

Routes with inline schemas in the file but not passed to SDK factory.

**Fix Pattern**:

```typescript
// Before
const InlineSchema = z.object({
  /* ... */
});
export const POST = createAuthenticatedEndpoint({
  handler: async ({ request }) => {
    const body = await request.json(); // ❌ Not validated
  },
});

// After
const InlineSchema = z.object({
  /* ... */
});
export const POST = createAuthenticatedEndpoint({
  input: InlineSchema, // ✅ Pass to factory
  handler: async ({ input }) => {
    // ✅ Input is typed
    // Use input
  },
});
```

**Routes**:

1. `app/api/onboarding/profile/route.ts` - Move `OnboardingProfileSchema` to input
2. `app/api/onboarding/create-network-corporate/route.ts` - Inline schema → input
3. `app/api/auth/mfa/verify/route.ts` - Inline `MFAVerifySchema` → input
4. `app/api/widgets/route.ts` - Inline schema → input

---

### Category 3: Inline Schema Needs Export (2 routes)

Routes with inline schemas that don't exist in types package.

**Fix Pattern**:

```typescript
// Before: Inline schema
const AddMemberSchema = z.object({
  /* ... */
});
export const POST = createOrgEndpoint({
  handler: async ({ request }) => {
    const body = await request.json();
  },
});

// After: Add to types, then use
export const POST = createOrgEndpoint({
  input: AddMemberSchema,
  handler: async ({ input }) => {
    // Use input
  },
});
```

**Routes**:

1. `app/api/organizations/[id]/members/route.ts` - Create `AddMemberSchema` or rename
2. `app/api/positions/[id]/route.ts` - Create position update schema

---

### Category 4: Spread Type Errors (3 routes)

Routes using `...` operator on `unknown` typed Firestore data.

**Fix Pattern**:

```typescript
// Before
const data = await db.collection("items").doc(id).get();
const response = { ...data.data() }; // ❌ data is unknown

// After
const data = await db.collection("items").doc(id).get();
const response = data.data() as ItemType; // ✅ Type assert
return NextResponse.json(response);
```

**Routes**:

1. `app/api/attendance/route.ts` - Type assert Firestore data
2. `app/api/items/route.ts` - Type assert Firestore data
3. `app/api/organizations/[id]/members/route.ts` - Type assert member data

---

## Migration Batches

### Batch 1: High-Priority Routes (8 routes) - Parallel Group A

**Estimated Time**: 45 min  
**Blockers**: None  
**Dependencies**: None

| #   | Route                           | Error Count | Fix Type                   | Complexity |
| --- | ------------------------------- | ----------- | -------------------------- | ---------- |
| 1   | `batch`                         | 1           | Add input param            | Low        |
| 2   | `internal/backup`               | 5           | Add input param            | Low        |
| 3   | `items`                         | 2           | Add input + type assert    | Medium     |
| 4   | `join-tokens`                   | 1           | Add input param            | Low        |
| 5   | `onboarding/activate-network`   | 1           | Add input or inline schema | Low        |
| 6   | `onboarding/create-network-org` | 2           | Add input param            | Low        |
| 7   | `onboarding/join-with-token`    | 2           | Add input param            | Low        |
| 8   | `organizations/[id]`            | 2           | Add input param            | Low        |

**Execution Plan**:

```bash
# A1: batch, internal/backup, items
# A2: join-tokens, activate-network, create-network-org
# A3: join-with-token, organizations/[id]
```

---

### Batch 2: Onboarding Routes (4 routes) - Parallel Group B

**Estimated Time**: 30 min  
**Blockers**: None  
**Dependencies**: None

| #   | Route                                 | Error Count | Fix Type             | Complexity |
| --- | ------------------------------------- | ----------- | -------------------- | ---------- |
| 1   | `onboarding/profile`                  | 4           | Move schema to input | Low        |
| 2   | `onboarding/create-network-corporate` | 3           | Move schema to input | Low        |
| 3   | `auth/mfa/verify`                     | 2           | Move schema to input | Low        |
| 4   | `widgets`                             | 1           | Move schema to input | Low        |

**Execution Plan**:

```bash
# B1: onboarding/profile, create-network-corporate
# B2: auth/mfa/verify, widgets
```

---

### Batch 3: Organizations Routes (5 routes) - Parallel Group C

**Estimated Time**: 45 min  
**Blockers**: None  
**Dependencies**: May need new schemas in types package

| #   | Route                                   | Error Count | Fix Type                     | Complexity |
| --- | --------------------------------------- | ----------- | ---------------------------- | ---------- |
| 1   | `organizations/[id]/members`            | 4           | Create schema + add to input | Medium     |
| 2   | `organizations/[id]/members/[memberId]` | 2           | Add input param              | Low        |
| 3   | `session`                               | 2           | Move schema to input         | Low        |
| 4   | `positions/[id]`                        | 1           | Create schema + type assert  | Medium     |
| 5   | `attendance`                            | 5           | Type assert + schema fixes   | High       |

**Execution Plan**:

```bash
# C1: Create new schemas (AddMemberSchema, PositionUpdateSchema)
# C2: organizations/[id]/members, members/[memberId], positions/[id]
# C3: session, attendance
```

---

## Detailed Route Analysis

### Batch 1: Routes

#### 1. `app/api/batch/route.ts`

**Error**: `CreateBatchSchema not exported`  
**Root Cause**: Schema exists but export incomplete (fixed in types package)  
**Fix**:

- Add `input: CreateBatchSchema` to route config
- Remove inline validation logic

**Lines to Change**: 16-20 (route definition)

---

#### 2. `app/api/internal/backup/route.ts`

**Error**: `BackupRequestSchema not exported` + unknown input  
**Root Cause**: Schema not exported from types package (fixed) + missing input param  
**Fix**:

- Add `input: BackupRequestSchema` to route config
- Replace `context.request.body` access with `input` parameter

**Lines to Change**: 11-25 (route definition + handler)

---

#### 3. `app/api/items/route.ts`

**Error**: Spread type on unknown + missing input  
**Root Cause**: Firestore data is `unknown`, needs type assertion  
**Fix**:

- Add `input: CreateItemSchema` to POST handler
- Type assert Firestore read as `ItemType`
- Use SDK factory for GET route validation

**Lines to Change**: 30-60 (handlers)

---

#### 4. `app/api/join-tokens/route.ts`

**Error**: Unknown input type  
**Root Cause**: POST handler doesn't specify input schema  
**Fix**:

- Add `input: CreateJoinTokenSchema` to POST config
- Remove manual parsing

**Lines to Change**: 27-35

---

#### 5. `app/api/onboarding/activate-network/route.ts`

**Error**: Unknown input (networkId doesn't exist)  
**Root Cause**: No input schema passed to SDK factory  
**Fix**:

- Create inline schema for networkId + metadata
- Add `input: ActivateNetworkSchema` to route

**Lines to Change**: 11-40

---

#### 6. `app/api/onboarding/create-network-org/route.ts`

**Error**: Unknown input  
**Root Cause**: Schema exists but not passed to SDK factory  
**Fix**:

- Add `input: CreateNetworkSchema` to POST config

**Lines to Change**: 13-20

---

#### 7. `app/api/onboarding/join-with-token/route.ts`

**Error**: Unknown input  
**Root Cause**: Schema exists but not passed to SDK factory  
**Fix**:

- Add `input: JoinWithTokenSchema` to POST config

**Lines to Change**: 13-25

---

#### 8. `app/api/organizations/[id]/route.ts`

**Error**: Unknown input  
**Root Cause**: Schema exists but not passed to SDK factory  
**Fix**:

- Add `input: UpdateOrganizationSchema` to PATCH handler

**Lines to Change**: 40-50

---

### Batch 2: Routes

#### 9. `app/api/onboarding/profile/route.ts`

**Error**: Unknown input (firstName, lastName, avatar, timezone missing)  
**Root Cause**: Input schema inline but not passed to factory  
**Fix**:

- Extract `OnboardingProfileSchema` usage to `input` parameter

**Lines to Change**: 13-18

---

#### 10. `app/api/onboarding/create-network-corporate/route.ts`

**Error**: Unknown input (corporateName, brandName, formToken missing)  
**Root Cause**: Input schema inline but not passed to factory  
**Fix**:

- Extract `CreateCorporateOnboardingSchema` usage to `input` parameter

**Lines to Change**: 13-20

---

#### 11. `app/api/auth/mfa/verify/route.ts`

**Error**: Unknown input (secret, token missing)  
**Root Cause**: Input schema inline but not passed to factory  
**Fix**:

- Move `MFAVerifySchema` to `input` parameter
- Remove manual `parseJson` call

**Lines to Change**: 11-35

---

#### 12. `app/api/widgets/route.ts`

**Error**: Wrong argument count (expects 2-3, got 1)  
**Root Cause**: `createPublicEndpoint` config missing required fields  
**Fix**:

- Add `input: CreateItemSchema` parameter
- Fix handler signature

**Lines to Change**: 8-15

---

### Batch 3: Routes

#### 13. `app/api/organizations/[id]/members/route.ts`

**Error**: Unknown input (memberId, role missing) + spread type error  
**Root Cause**: Inline schema not passed to factory + Firestore type assertion needed  
**Fix**:

- Create `AddMemberSchema` in types or use inline
- Add `input: AddMemberSchema` to POST
- Type assert member reads from Firestore

**Lines to Change**: 12-20, 60-80

---

#### 14. `app/api/organizations/[id]/members/[memberId]/route.ts`

**Error**: Unknown input (role, permissions missing)  
**Root Cause**: Schema exists but not passed to SDK factory  
**Fix**:

- Add `input: UpdateMemberApiSchema` to PATCH handler

**Lines to Change**: 34-42

---

#### 15. `app/api/session/route.ts`

**Error**: Unknown input (idToken missing) + parsed.data unknown  
**Root Cause**: Inline schema not passed to factory  
**Fix**:

- Move `CreateSessionSchema` to `input` parameter
- Update handler to use typed `input`

**Lines to Change**: 15-30

---

#### 16. `app/api/positions/[id]/route.ts`

**Error**: Unknown argument type  
**Root Cause**: Position update schema not defined + not passed to factory  
**Fix**:

- Create `UpdatePositionSchema` in types
- Add `input: UpdatePositionSchema` to PATCH handler

**Lines to Change**: 35-50

---

#### 17. `app/api/attendance/route.ts`

**Error**: Unknown data type (5 errors) + spread type  
**Root Cause**: Firestore data not typed + schema not passed to factory  
**Fix**:

- Type assert Firestore reads as `AttendanceRecord`
- Add `input: CreateAttendanceRecordSchema` to POST
- Remove spread operator, use direct assignment

**Lines to Change**: 25-35, 70-90

---

## Implementation Order

### Phase 1: Preparation (5 min)

1. Create new schemas in `packages/types/src/`:
   - `AddMemberSchema` (organizations members)
   - `UpdatePositionSchema` (positions)
   - `ActivateNetworkSchema` (onboarding)
2. Export all new schemas from `packages/types/src/index.ts`
3. Build types package: `pnpm --filter @fresh-schedules/types build`

### Phase 2: Batch 1 (8 routes, 45 min)

Execute in parallel:

- **Stream A** (3 routes): batch, internal/backup, items
- **Stream B** (3 routes): join-tokens, activate-network, create-network-org
- **Stream C** (2 routes): join-with-token, organizations/[id]

Each route: Add input param, commit, push

### Phase 3: Batch 2 (4 routes, 30 min)

Execute in parallel:

- **Stream A** (2 routes): onboarding/profile, create-network-corporate
- **Stream B** (2 routes): auth/mfa/verify, widgets

Each route: Move schema to input, commit, push

### Phase 4: Batch 3 (5 routes, 45 min)

Execute in parallel:

- **Stream A** (2 routes): organizations/[id]/members, members/[memberId]
- **Stream B** (2 routes): session, positions/[id]
- **Stream C** (1 route): attendance (complex, do last)

Each route: Create schema + add to input, type assert data, commit, push

### Phase 5: Validation (10 min)

- Run `pnpm -w typecheck` → Expect 0 errors
- Run `pnpm test` → All tests pass
- Commit final status

---

## Success Criteria

- [ ] All 24 TypeScript errors resolved
- [ ] All 17 routes use SDK factory with proper `input:` parameter
- [ ] All inline schemas either moved to input or exported from types package
- [ ] All Firestore data properly type-asserted
- [ ] `pnpm -w typecheck` shows 0 errors
- [ ] `pnpm test` passes
- [ ] 4 commits (1 per batch + 1 final)

---

## Rollback Plan

If any migration breaks functionality:

1. `git revert <commit-hash>`
2. Reanalyze the specific route
3. Restart the migration for that route only

---

## Notes

- Routes are already using SDK factory – this is NOT a major refactor
- Fixes are purely **adding the `input:` parameter** and **moving schemas**
- No business logic changes required
- All changes are backwards compatible
- Estimated total time: 2.5 hours
- Parallel execution reduces to ~90 minutes wall time

---

**Generated**: 2025-12-15T02:06:22Z  
**Target Completion**: 2025-12-15T04:00:00Z
