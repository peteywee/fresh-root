# Migration Design Doc: Network Tenancy Implementation

**Status**: Draft
**Date**: November 2025
**Owner**: Patrick Craven

## Overview

This document outlines the strategy for migrating from org-centric data paths to network-centric paths as specified in Project Bible v14.0.0.

## Current State (Org-Centric)

All data is currently scoped under `/orgs/{orgId}` or `/organizations/{orgId}`:

- `/orgs/{orgId}/schedules/{scheduleId}`
- `/orgs/{orgId}/positions/{positionId}`
- `/orgs/{orgId}/venues/{venueId}`
- `/organizations/{orgId}/messages/{messageId}`
- `/users/{uid}` (global)
- `/memberships/{membershipId}` (global)

## Target State (Network-Centric)

All data will be scoped under `/networks/{networkId}`:

- `/networks/{networkId}/orgs/{orgId}/schedules/{scheduleId}`
- `/networks/{networkId}/corporates/{corpId}`
- `/networks/{networkId}/venues/{venueId}`
- `/networks/{networkId}/users/{uid}`
- `/networks/{networkId}/memberships/{membershipId}`
- `/networks/{networkId}/compliance/adminResponsibilityForm`

## Migration Strategy

### Phase 1: Dual-Write (Gradual Migration)

1. **Implement network paths alongside existing org paths**
   - Add network rules to `firestore.rules`
   - Keep existing org rules active
   - New data written to both paths during transition

2. **Backfill existing data**
   - Create networks for existing orgs
   - Migrate memberships to network scope
   - Update user profiles to network scope

3. **Update application code**
   - Modify API routes to use network paths
   - Update client-side queries
   - Add network context to all operations

### Phase 2: Cutover

1. **Enable network-only writes**
   - Remove dual-write logic
   - Update rules to deny org-path writes

2. **Migrate remaining data**
   - Batch migrate any remaining org-scoped data
   - Update indexes and queries

3. **Remove legacy paths**
   - Delete org-centric rules
   - Clean up old data paths

## Implementation Plan

### TEN-06: Write migration design doc (This Document)

- [x] Document current vs target paths
- [x] Define migration phases
- [x] Outline implementation steps

### TEN-07: Extend Firestore rules with network root

- [x] Add `/networks/{networkId}` skeleton rules
- [x] Implement helper functions for network access control
- [x] Ensure compliance subcollection is locked down

### TEN-08: Transitional rules

- [x] Keep existing `/orgs/{orgId}` rules active
- [x] Add TODO comments for future removal
- [x] Document transitional access patterns

### TEN-09: Rules unit tests

- [ ] Add `tests/rules/networks.spec.ts`
- [ ] Test network creation restrictions
- [ ] Test compliance document access
- [ ] Test membership scoping

## Technical Details

### Helper Functions

```javascript
function isNetworkMember(auth, networkId) {
  // Check membership under /networks/{networkId}/memberships/{uid}
  return exists(/databases/$(database)/documents/networks/$(networkId)/memberships/$(auth.uid));
}

function isNetworkOwner(auth, networkId) {
  // Check if auth.uid matches network.ownerUserId
  return get(/databases/$(database)/documents/networks/$(networkId)).data.ownerUserId == auth.uid;
}

function isSuperAdmin(auth) {
  return auth.token.superAdmin == true;
}
```

### Data Migration Script

```typescript
// Pseudo-code for migration script
async function migrateOrgToNetwork(orgId: string, networkId: string) {
  // 1. Create network document
  // 2. Move org to network scope
  // 3. Migrate memberships
  // 4. Update user profiles
  // 5. Migrate schedules, positions, etc.
}
```

## Risks & Mitigations

### Risk: Data inconsistency during transition

**Mitigation**: Implement dual-write with validation, rollback scripts

### Risk: Performance impact

**Mitigation**: Batch migrations, monitor query performance

### Risk: Breaking existing functionality

**Mitigation**: Feature flags, gradual rollout, comprehensive testing

## Timeline

- **Week 1-2**: Complete rules implementation and testing
- **Week 3-4**: Implement dual-write in application code
- **Week 5-6**: Data migration and validation
- **Week 7-8**: Cutover and legacy cleanup

## Success Criteria

- [ ] All new data written to network paths
- [ ] Existing data accessible via both paths
- [ ] No data loss during migration
- [ ] All tests passing
- [ ] Performance within acceptable bounds
- [ ] Rollback capability maintained

## Related Documents

- [Project Bible v14.0.0](../bible/Project_Bible_v14.0.0.md)
- [Schema Map – Network](../schema-network.md)
- [Firestore Rules](../../firestore.rules)
