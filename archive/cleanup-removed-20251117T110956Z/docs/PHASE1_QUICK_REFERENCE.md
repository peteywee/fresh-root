# Phase 1 Implementation: Quick Reference

**Status**: ✅ Complete (November 8, 2025)

## What Changed

### 1. Firestore Rules (`firestore.rules`)

```plaintext
Added:
- match /networks/{networkId} { ... }
  - isNetworkMember(networkId) helper
  - hasNetworkRole(networkId, roles) helper
  - Server-only compliance docs protection

- match /compliance/{document=**} { ... }
  - Global compliance docs locked to server-only

Preserved:
- All existing org rules unchanged
- Backward compatibility 100%
```

### 2. Create Network API (`apps/web/app/api/onboarding/create-network-org/route.ts`)

```typescript
Single transaction writes to:

NEW (v14) paths:
✓ /networks/{id}
✓ /networks/{id}/orgs/{id}
✓ /networks/{id}/venues/{id}
✓ /networks/{id}/memberships/{id} (network_owner)
✓ /networks/{id}/memberships/{id} (org_owner)
✓ /networks/{id}/orgVenueAssignments/{id}
✓ /networks/{id}/compliance/adminResponsibilityForm

OLD (compat) paths:
✓ /orgs/{id} (with networkId field)
✓ /venues/{id} (with networkId, orgId fields)
✓ /orgs/{id}/members/{id} (legacy membership)
```

## When Network Creation Happens

1. Form submitted → `/adminFormDrafts/{token}`
2. Consume draft → `/api/onboarding/create-network-org`
3. Validate → Email verified, role permitted
4. **Transaction** → All writes succeed or all fail
5. Return → `{ networkId, orgId, venueId, status }`

## For Developers

### Using New Networks

```typescript
// Preferred (v14+):
db.collection("networks").doc(networkId).get();
db.collection("networks").doc(networkId).collection("orgs").doc(orgId).get();
db.collection("networks").doc(networkId).collection("memberships").get();
```

### Using Legacy Orgs (Phase 1 only)

```typescript
// Still works during Phase 1:
db.collection("orgs").doc(orgId).get();
db.collection("orgs").doc(orgId).collection("members").get();
```

## For Phase 2 Migration

```bash
# Find all dual-write blocks:
grep -r "PHASE 1 DUAL-WRITE" apps/web/app/api/

# Timeline:
Phase 1 (NOW):  ✅ Dual write implemented
Phase 2 (TBD):  ⏳ Migrate existing orgs
Phase 3 (TBD):  ⏳ Remove old paths
```

## Verification

```bash
pnpm -w typecheck  # ✅ PASS
```

## Documentation

- **Strategy**: `docs/migrations/MIGRATION_NETWORK_TENANCY.md`
- **Details**: `docs/migrations/PHASE1_IMPLEMENTATION_SUMMARY.md`
- **Completion**: `PHASE1_COMPLETION_REPORT.md`

---

**Owner**: Patrick Craven
**Last Updated**: November 8, 2025
