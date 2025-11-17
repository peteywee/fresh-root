# Phase 2: Network Tenancy Migration – Options & Recommendations

> **Tags**: P0, PLANNING, PHASE2, ARCHITECTURE

**Date**: November 8, 2025
**Status**: Planning
**Effort Estimate**: Varies by option (1-3 weeks each)

---

## Current State (Phase 1 Complete ✅)

**Completed**:

- ✅ Network-scoped Firestore rules added
- ✅ Dual-write API for network creation (v14 paths + backward-compat org paths)
- ✅ Admin form copy to `/networks/{id}/compliance/adminResponsibilityForm`
- ✅ Tests for compliance doc copy and immutable marking
- ✅ TypeScript compilation verified

**Now Available**:

- New networks created via onboarding go to `/networks/{id}/*` paths
- Existing orgs still in `/orgs/{id}/*` paths (unchanged)
- Both old and new paths coexist during transition

---

## Three Phase 2 Options

### Option A: Migration Script (Data Re-platforming)

**Goal**: Programmatically move existing orgs from `/orgs/{id}` to `/networks/{networkId}/orgs/{id}`

**Scope**:

1. Create migration script (`scripts/migrate/orgs-to-networks.ts`)
1. Iterate all existing orgs
1. Create a new network for each org (or batch them under corporate networks)
1. Copy org + related data (venues, shifts, schedules, members, etc.)
1. Update Firestore rules to prefer new paths
1. Provide rollback script (copy data back if needed)

**Implementation Plan** (first steps):

```typescript
1. Create `scripts/migrate/orgs-to-networks.ts` scaffolding
2. Define `OrgMigrationConfig` (batch size, concurrency, dry-run mode)
3. Implement `migrateOrgToNetwork(orgId, networkId)` function
4. Add logging & progress tracking
5. Create dry-run mode (no actual writes, just validation)
6. Test on emulator with seeded data
```

**Effort**: 2-3 weeks

- Week 1: Script development + emulator testing
- Week 2: Dry-run on staging
- Week 3: Execute on production with monitoring

**Risks**:

- Data consistency during migration (shifts assigned to venues might break)
- Rollback complexity (30-day retention, manual verification)
- Downtime for migrated orgs (brief, but needs careful coordination)

**When Ready**: Phase 2 → Phase 3 transition

**TODO Item**: `[MIG-01]` Create migration script for org → network re-platforming

---

### Option B: Rules Testing & Validation (Firestore Quality Assurance)

**Goal**: Comprehensively test v14 network rules to catch issues before they affect users

**Scope**:

1. Create test cases in `tests/rules/networks.spec.ts` for:
   - Network creation (admin SDK only, fail for clients)
   - Network membership (can members read? can they write?)
   - Compliance docs (server-only access, no client reads)
   - Network-scoped orgs (Phase 2+ behavior)
   - Access control for cross-network reads (prevent leaking data)
1. Test emulator + rules behavior with injected data
1. Add coverage for edge cases:
   - Invalid network IDs (traversal attacks)
   - Missing network memberships
   - Expired compliance docs (if TTL added)
   - Role-based access (network_owner vs network_member)

**Implementation Plan** (first steps):

```typescript
1. Expand existing `tests/rules/networks.spec.ts`
2. Add test suites for:
   - Network root operations (create, update, delete)
   - Compliance doc access control
   - Membership role enforcement
   - Cross-network isolation
3. Create helper function `setupNetworkAndUser(networkId, userId, role)`
4. Run emulator + Jest + track coverage
5. Document any gaps found
```

**Effort**: 1-2 weeks

- Days 1-2: Assess existing network rules (what's covered?)
- Days 3-5: Write comprehensive test suite (~30-50 test cases)
- Days 6-7: Execute in emulator, fix failures
- Days 8-10: Document findings, address gaps

**Risks**:

- Might find security gaps that require immediate fixes
- Could reveal that rules don't match Bible v14 spec

**When Ready**: Immediate (can start now)

**TODO Item**: `[TEST-02]` Comprehensive network rules unit tests

---

### Option C: Block 4 UX Prep (Foundation for Scheduling UX)

**Goal**: Set up frontend scaffolding for the "my workspace" view after onboarding

**Scope**:

1. Create protected routes for post-onboarding screens:
   - `/app/network` (network home/dashboard)
   - `/app/schedule` (schedule builder)
   - `/app/people` (team/member management)
   - `/app/settings` (network settings)
1. Add context providers for network + org + venue selection
1. Create sidebar navigation
1. Fetch network/org/venue data and display in UI
1. Implement basic network selector (if user has multiple networks)

**Implementation Plan** (first steps):

```typescript
1. Create `apps/web/app/(app)/_protected/page.tsx` landing
2. Add context: `NetworkContext` (active network, orgs, venues)
3. Create sidebar layout component
4. Add loading states + error boundaries
5. Fetch network/org from `/networks/{networkId}` via React Query
6. Implement basic schedule skeleton screen (empty state)
```

**Effort**: 2-3 weeks

- Days 1-2: Route scaffolding + layout
- Days 3-4: Context + data fetching
- Days 5-6: UI components + styling
- Days 7-8: Error handling + loading states
- Days 9-10: Integration testing

**Risks**:

- Might reveal missing API endpoints (e.g., "list my networks")
- Design decisions about network selector UX not finalized

**When Ready**: Phase 2 (prerequisite for Phase 3 scheduling UX)

**TODO Item**: `[B4-01]` UX layout shell for post-onboarding workspace

---

## Recommendation

**Start with Option B: Rules Testing & Validation** ✅

**Why**:

1. **Lowest Risk**: Read-only validation, no data changes
1. **Immediate Payoff**: Catches bugs before production usage
1. **Quick Turnaround**: 1-2 weeks vs 2-3 weeks for migration script
1. **Foundation for Later**: Better rules = safer migration script execution
1. **Parallel with Other Work**: Can run tests while doing Option A or C prep

**Secondary Priority**: Option A (Migration Script)

- After rules validated, we can confidently build the migration script
- Phase 2 is the "execution" phase for large-scale migration
- Script will benefit from comprehensive rules testing

**Tertiary**: Option C (Block 4 UX)

- Depends on Option A completion (can't show networks UI if no migrated orgs)
- Good to start in parallel for design/research (mockups, user flows)

---

## Proposed Phase 2 Timeline

- Week 1 (Now):
  - Finish Option B: Write comprehensive network rules tests
  - Start Option A: Design migration script (pseudocode + emulator POC)
  - Start Option C: Research + mockups for post-onboarding UX

- Week 2-3:
  - Execute Option A dry-run on emulator with real data volume
  - Refine Option B tests based on findings
  - Complete Option C route scaffolding

- Week 4-5:
  - Dry-run Option A on staging (non-prod)
  - Add monitoring + rollback procedures
  - Start Phase 3 (cleanup old paths)

---

## Action Items

- [ ] **[PHO2-01]** Decide: Start with Option B or A?
- [ ] **[PHO2-02]** If Option B: Create comprehensive rules test plan
- [ ] **[PHO2-03]** If Option A: Design migration script + data model
- [ ] **[PHO2-04]** If Option C: Research post-onboarding UX flows

---

## References

- `MIGRATION_NETWORK_TENANCY.md` – Migration strategy doc
- `TODO-v14.md` – Roadmap A (Network + Tenancy)
- `docs/bible/Project_Bible_v14.0.0.md` – Full v14 spec
- `firestore.rules` – Current network rules
- `apps/web/app/api/onboarding/create-network-org/route.ts` – Dual-write impl
