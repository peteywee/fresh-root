# Route Migration Execution Tasks

## Phase 1: Create New Schemas (5 min)

### Task 1.1: Create AddMemberSchema

- [ ] File: `packages/types/src/organizations.ts` (extend existing)
- [ ] Schema: `AddMemberSchema` with fields: `uid`, `role`, `status`
- [ ] Export from `packages/types/src/index.ts`
- [ ] Verify: `grep "AddMemberSchema" packages/types/src/index.ts`

### Task 1.2: Create UpdatePositionSchema

- [ ] File: `packages/types/src/positions.ts` (extend existing)
- [ ] Schema: `UpdatePositionSchema` with position fields
- [ ] Export from `packages/types/src/index.ts`
- [ ] Verify: `grep "UpdatePositionSchema" packages/types/src/index.ts`

### Task 1.3: Create ActivateNetworkSchema

- [ ] File: `packages/types/src/networks.ts` (extend existing)
- [ ] Schema: `ActivateNetworkSchema` with `networkId`, `metadata`
- [ ] Export from `packages/types/src/index.ts`
- [ ] Verify: `grep "ActivateNetworkSchema" packages/types/src/index.ts`

### Task 1.4: Build & Verify Types Package

- [ ] Command: `pnpm --filter @fresh-schedules/types build`
- [ ] Verify: Check `packages/types/dist/index.d.ts` has all exports
- [ ] Commit: `chore(types): add schemas for route migration`

---

## Phase 2: Batch 1 Routes (45 min)

### Stream A: items, internal/backup, batch (15 min)

#### Task 2.1: Fix `app/api/batch/route.ts`

- [ ] Add `input: CreateBatchSchema` to createOrgEndpoint config (line 16)
- [ ] Remove inline schema usage if any
- [ ] Test: `pnpm --filter @apps/web typecheck 2>&1 | grep batch`
- [ ] Commit: `fix(api): batch route - add input schema validation`

#### Task 2.2: Fix `app/api/internal/backup/route.ts`

- [ ] Add `input: BackupRequestSchema` to POST handler (line 11)
- [ ] Replace `context.request.body` with `input` parameter
- [ ] Test: `pnpm --filter @apps/web typecheck 2>&1 | grep backup`
- [ ] Commit: `fix(api): internal backup route - add input schema validation`

#### Task 2.3: Fix `app/api/items/route.ts`

- [ ] Add `input: CreateItemSchema` to POST handler
- [ ] Type assert Firestore reads: `const data = snap.data() as ItemType`
- [ ] Test: `pnpm --filter @apps/web typecheck 2>&1 | grep items`
- [ ] Commit: `fix(api): items route - add input schema and type assertions`

### Stream B: activate-network, create-network-org, join-tokens (15 min)

#### Task 2.4: Fix `app/api/onboarding/activate-network/route.ts`

- [ ] Add `input: ActivateNetworkSchema` to POST handler
- [ ] Update handler to use `input` instead of parsing request
- [ ] Test: `pnpm --filter @apps/web typecheck 2>&1 | grep activate-network`
- [ ] Commit: `fix(api): onboarding activate-network - add input schema`

#### Task 2.5: Fix `app/api/onboarding/create-network-org/route.ts`

- [ ] Add `input: CreateNetworkSchema` to POST handler (line 13)
- [ ] Test: `pnpm --filter @apps/web typecheck 2>&1 | grep create-network-org`
- [ ] Commit: `fix(api): onboarding create-network-org - add input schema`

#### Task 2.6: Fix `app/api/join-tokens/route.ts`

- [ ] Add `input: CreateJoinTokenSchema` to POST handler (line 27)
- [ ] Test: `pnpm --filter @apps/web typecheck 2>&1 | grep join-tokens`
- [ ] Commit: `fix(api): join-tokens - add input schema validation`

### Stream C: join-with-token, organizations/[id] (15 min)

#### Task 2.7: Fix `app/api/onboarding/join-with-token/route.ts`

- [ ] Add `input: JoinWithTokenSchema` to POST handler (line 13)
- [ ] Test: `pnpm --filter @apps/web typecheck 2>&1 | grep join-with-token`
- [ ] Commit: `fix(api): onboarding join-with-token - add input schema`

#### Task 2.8: Fix `app/api/organizations/[id]/route.ts`

- [ ] Add `input: UpdateOrganizationSchema` to PATCH handler (line 40)
- [ ] Test: `pnpm --filter @apps/web typecheck 2>&1 | grep 'organizations/\[id\]'`
- [ ] Commit: `fix(api): organizations - add input schema for updates`

---

## Phase 3: Batch 2 Routes (30 min)

### Stream A: onboarding/profile, create-network-corporate (15 min)

#### Task 3.1: Fix `app/api/onboarding/profile/route.ts`

- [ ] Move `OnboardingProfileSchema` from inline to `input:` parameter
- [ ] Update handler signature: `{ input, context }` instead of `{ request }`
- [ ] Test: `pnpm --filter @apps/web typecheck 2>&1 | grep profile`
- [ ] Commit: `fix(api): onboarding profile - move schema to input parameter`

#### Task 3.2: Fix `app/api/onboarding/create-network-corporate/route.ts`

- [ ] Move `CreateCorporateOnboardingSchema` usage to `input:` parameter
- [ ] Update handler to use typed `input`
- [ ] Test: `pnpm --filter @apps/web typecheck 2>&1 | grep create-network-corporate`
- [ ] Commit: `fix(api): onboarding create-network-corporate - move schema to input`

### Stream B: auth/mfa/verify, widgets (15 min)

#### Task 3.3: Fix `app/api/auth/mfa/verify/route.ts`

- [ ] Move `MFAVerifySchema` to `input:` parameter in createAuthenticatedEndpoint
- [ ] Remove `parseJson(request, MFAVerifySchema)` call
- [ ] Update handler: use `input` instead of `parsed.data`
- [ ] Test: `pnpm --filter @apps/web typecheck 2>&1 | grep mfa/verify`
- [ ] Commit: `fix(api): auth mfa/verify - move schema to input parameter`

#### Task 3.4: Fix `app/api/widgets/route.ts`

- [ ] Move inline schema to `input:` parameter
- [ ] Fix createPublicEndpoint config to include `input: CreateItemSchema`
- [ ] Test: `pnpm --filter @apps/web typecheck 2>&1 | grep widgets`
- [ ] Commit: `fix(api): widgets - move schema to input parameter`

---

## Phase 4: Batch 3 Routes (45 min)

### Stream A: organizations/[id]/members\* (15 min)

#### Task 4.1: Fix `app/api/organizations/[id]/members/route.ts`

- [ ] Use `AddMemberSchema` from types OR define inline
- [ ] Add `input: AddMemberSchema` to POST handler (line 12)
- [ ] Type assert member Firestore reads: `const member = snap.data() as Member`
- [ ] Remove spread operator on unknown types
- [ ] Test: `pnpm --filter @apps/web typecheck 2>&1 | grep members`
- [ ] Commit: `fix(api): organizations members - add schema and type assertions`

#### Task 4.2: Fix `app/api/organizations/[id]/members/[memberId]/route.ts`

- [ ] Add `input: UpdateMemberApiSchema` to PATCH handler (line 34)
- [ ] Test: `pnpm --filter @apps/web typecheck 2>&1 | grep 'members/\[memberId\]'`
- [ ] Commit: `fix(api): organizations members/[id] - add input schema`

### Stream B: session, positions/[id] (15 min)

#### Task 4.3: Fix `app/api/session/route.ts`

- [ ] Move `CreateSessionSchema` to `input:` parameter in createPublicEndpoint
- [ ] Remove `parseJson(request, CreateSessionSchema)` manual parsing
- [ ] Update handler to use typed `input` instead of `parsed.data`
- [ ] Test: `pnpm --filter @apps/web typecheck 2>&1 | grep session`
- [ ] Commit: `fix(api): session - move schema to input parameter`

#### Task 4.4: Fix `app/api/positions/[id]/route.ts`

- [ ] Use `UpdatePositionSchema` from types
- [ ] Add `input: UpdatePositionSchema` to PATCH handler (line 35)
- [ ] Type assert position Firestore reads
- [ ] Test: `pnpm --filter @apps/web typecheck 2>&1 | grep positions`
- [ ] Commit: `fix(api): positions/[id] - add schema and type assertions`

### Stream C: attendance (15 min)

#### Task 4.5: Fix `app/api/attendance/route.ts` (Complex)

- [ ] Type assert Firestore reads: `const record = snap.data() as AttendanceRecord`
- [ ] Add `input: CreateAttendanceRecordSchema` to POST handler (line 25)
- [ ] Replace all `...data.data()` spreads with typed assignments
- [ ] Remove spread operator on unknown types
- [ ] Test: `pnpm --filter @apps/web typecheck 2>&1 | grep attendance`
- [ ] Commit: `fix(api): attendance - add schema validation and type assertions`

---

## Phase 5: Final Validation (10 min)

#### Task 5.1: Full Typecheck

- [ ] Command: `pnpm -w typecheck 2>&1 | tail -20`
- [ ] Expected: 0 errors in @apps/web
- [ ] If errors: rerun failed route fix

#### Task 5.2: Run Tests

- [ ] Command: `pnpm test`
- [ ] Expected: All tests pass
- [ ] If failures: debug and fix

#### Task 5.3: Final Commit

- [ ] Commit: `chore: complete legacy route migration to SDK factory input validation`
- [ ] Message: Include before/after error count

#### Task 5.4: Push

- [ ] Command: `git push origin worktree-2025-12-14T08-35-30`
- [ ] Verify: All commits visible on GitHub

---

## Parallel Execution Strategy

**Key Rules**:

1. Each stream can execute in parallel
2. All phase 1 tasks must complete before starting phase 2
3. Phases can overlap (2A → 2B → 2C can run concurrently once 1 completes)
4. After each commit, verify `typecheck` still works
5. If a route breaks, revert and re-analyze

**Suggested Parallelization**:

```
Time  Phase 1       Phase 2           Phase 3           Phase 4           Phase 5
0min  [Schemas]
5min              [2A: 3 routes]
10min                              [3A: 2 routes]
15min             [2B: 3 routes]                      [4A: 2 routes]
20min                              [3B: 2 routes]
25min             [2C: 2 routes]
30min                              [Final check]      [4B: 2 routes]
35min                                                                      [Validation]
40min                                                  [4C: attendance]
45min                              [✓ Complete]
50min                                                [✓ Complete]
55min                                                                      [✓ Complete]
```

**Actual Wall Time**: ~55 minutes (instead of ~2.5 hours sequential)

---

## Error Reference

Quick lookup for error patterns:

| Error Pattern                                        | Cause                            | Fix                                       |
| ---------------------------------------------------- | -------------------------------- | ----------------------------------------- |
| `'input' is of type 'unknown'`                       | Missing `input:` param           | Add `input: SchemaName` to factory config |
| `Property 'X' does not exist on type 'unknown'`      | Schema not in input              | Move schema to `input:` parameter         |
| `Spread types may only be created from object types` | Spreading unknown Firestore data | Type assert with `as Type`                |
| `'data' is of type 'unknown'`                        | Firestore read not typed         | Type assert: `snap.data() as ItemType`    |
| `Expected 2-3 arguments, but got 1`                  | SDK factory config incomplete    | Add missing `input:` or `handler:` params |

---

**Status**: Ready to Execute  
**Created**: 2025-12-15T02:06:22Z  
**Expected Completion**: 2025-12-15T03:01:22Z
