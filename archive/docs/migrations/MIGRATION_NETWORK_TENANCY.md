# Migration to Network Tenancy

**Status**: Planned
**Estimated Effort**: Medium (2-3 weeks)
**Owner**: Patrick Craven
**Last Updated**: November 7, 2025

## Overview

This document outlines the migration strategy for transitioning from the current org-centric data model to the network-centric tenancy model introduced in Project Bible v14.0.0.

## Current State

### Data Model

- Organizations are the root tenant entity
- Paths: `/orgs/{orgId}/...`
- Venues, shifts, schedules scoped under orgs
- No explicit network concept

### Firestore Rules

- Rules are org-scoped
- Memberships control access at org level
- No network-level isolation

## Target State

### Data Model

- Networks are the root tenant entity
- Paths: `/networks/{networkId}/orgs/{orgId}/...`
- All data scoped under networks
- Networks contain orgs, venues, corporates, etc.

### Firestore Rules

- Rules are network-scoped
- Memberships control access at network level
- Compliance data locked down

## Migration Strategy

### Phase 1: Dual Write (1 week)

- Implement network creation in onboarding
- Write data to both old and new paths
- Keep old paths as primary for reads
- Monitor for data consistency

### Phase 2: Gradual Migration (1-2 weeks)

- Migrate one org at a time
- Update application code to prefer new paths
- Keep backward compatibility
- Roll back capability per org

### Phase 3: Cleanup (1 week)

- Remove old paths
- Update all code to use new paths
- Remove dual-write logic
- Full network tenancy

## Implementation Details

### Data Migration Script

```typescript
// Pseudocode for migration script
async function migrateOrgToNetwork(orgId: string) {
  const networkId = generateNetworkId();
  const batch = firestore.batch();

  // Copy org data to network
  const orgDoc = await firestore.collection("orgs").doc(orgId).get();
  batch.set(
    firestore.collection("networks").doc(networkId).collection("orgs").doc(orgId),
    orgDoc.data(),
  );

  // Copy related collections
  // ... venues, shifts, etc.

  await batch.commit();
}
```

### Rollback Strategy

- Keep old data for 30 days
- Automated rollback script
- Manual verification required

## Risks & Mitigations

| Risk                    | Impact | Mitigation                          |
| ----------------------- | ------ | ----------------------------------- |
| Data loss               | High   | Dual-write phase, backups           |
| Application downtime    | Medium | Gradual migration, feature flags    |
| Performance degradation | Low    | Monitor metrics, optimize queries   |
| User confusion          | Low    | Clear communication, phased rollout |

## Timeline

- **Week 1**: Implement dual-write, test migration script
- **Week 2**: Migrate test orgs, monitor performance
- **Week 3**: Full migration, cleanup old paths

## Success Criteria

- All data migrated without loss
- Application functions with new paths
- Performance meets or exceeds current levels
- No user-facing disruptions

## Related Documents

- [Project Bible v14.0.0](../bible/Project_Bible_v14.0.0.md)
- [Schema Network](../schema-network.md)
- [Firestore Rules](../firestore.rules)
