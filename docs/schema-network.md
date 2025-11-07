# Network Schema Documentation

**Status:** 📋 Specification (Implementation Pending)
**Version:** Based on Bible v14.0.0
**Last Updated:** November 7, 2025

---

## Purpose

This document defines the **Network-centric data model** introduced in [Project Bible v14.0.0](./bible/Project_Bible_v14.0.0.md).
It serves as the technical reference for:

- Firestore path structures
- Entity schemas and relationships
- Collection ownership and access patterns
- Migration from org-centric to network-centric paths

---

## Core Concept: Network as Tenant Root

> **Network is the only true tenant boundary. All scheduling data belongs to exactly one Network.**

```text
Infrastructure (Firebase Project)
  └─ Network (Tenant)
       ├─ Corporate (Graph Node)
       ├─ Organization (Graph Node)
       ├─ Venue (Graph Node)
       ├─ Links (Relationships)
       ├─ Users (Network-scoped profiles)
       ├─ Memberships (Role assignments)
       └─ Schedules, Shifts, Attendance (Operational data)
```

---

## Path Map

All collections under `/networks/{networkId}` enforce tenant isolation.

### Primary Entities

| Entity             | Path                                               | Owner              | Used By    | Status       |
| ------------------ | -------------------------------------------------- | ------------------ | ---------- | ------------ |
| **Network**        | `/networks/{networkId}`                            | Platform (backend) | All blocks | ✅ Specified |
| **Corporate**      | `/networks/{networkId}/corporates/{corpId}`        | Backend            | Block 4+   | ✅ Specified |
| **Organization**   | `/networks/{networkId}/orgs/{orgId}`               | Backend            | Block 4+   | ✅ Specified |
| **Venue**          | `/networks/{networkId}/venues/{venueId}`           | Backend            | Block 4+   | ✅ Specified |
| **User (Network)** | `/networks/{networkId}/users/{uid}`                | User + Backend     | Block 4+   | ✅ Specified |
| **Membership**     | `/networks/{networkId}/memberships/{membershipId}` | Backend            | All blocks | ✅ Specified |

### Link Collections

| Link Type              | Path                                                             | Purpose                           | Status       |
| ---------------------- | ---------------------------------------------------------------- | --------------------------------- | ------------ |
| **CorpOrgLink**        | `/networks/{networkId}/links/corpOrgLinks/{linkId}`              | Corporate ↔ Org relationship     | ✅ Specified |
| **OrgVenueAssignment** | `/networks/{networkId}/links/orgVenueAssignments/{assignmentId}` | Org ↔ Venue operating assignment | ✅ Specified |

### Compliance & Sensitive Data

| Entity                        | Path                                                       | Access              | Status       |
| ----------------------------- | ---------------------------------------------------------- | ------------------- | ------------ |
| **Admin Responsibility Form** | `/networks/{networkId}/compliance/adminResponsibilityForm` | Owner + super-admin | ✅ Specified |
| **Tax ID Data**               | (embedded in AdminResponsibilityForm)                      | Encrypted at rest   | ✅ Specified |

### Operational Data (Block 3+)

| Entity         | Path                                              | Owner           | Used By    | Status              |
| -------------- | ------------------------------------------------- | --------------- | ---------- | ------------------- |
| **Schedule**   | `/networks/{networkId}/schedules/{scheduleId}`    | Org/Manager     | Block 3, 4 | 🟡 Migration needed |
| **Shift**      | `/networks/{networkId}/shifts/{shiftId}`          | Org/Manager     | Block 3, 4 | 🟡 Migration needed |
| **Event**      | `/networks/{networkId}/events/{eventId}`          | Org/Manager     | Block 4+   | 🟡 Migration needed |
| **Attendance** | `/networks/{networkId}/attendance/{attendanceId}` | Staff + Manager | Block 6+   | 🟡 Migration needed |
| **Position**   | `/networks/{networkId}/positions/{positionId}`    | Org/Manager     | Block 3, 4 | 🟡 Migration needed |
| **Zone**       | `/networks/{networkId}/zones/{zoneId}`            | Venue/Manager   | Block 4+   | 🟡 Migration needed |

---

## Entity Schemas

### 1. Network (Tenant Root)

**Path:** `/networks/{networkId}`

**Schema (TypeScript):**

```typescript
type NetworkStatus = "pending_verification" | "active" | "suspended" | "closed";
type NetworkKind =
  | "independent_org"
  | "corporate_network"
  | "franchise_network"
  | "nonprofit_network"
  | "test_sandbox";
type NetworkSegment =
  | "restaurant"
  | "qsr"
  | "bar"
  | "hotel"
  | "nonprofit"
  | "shelter"
  | "church"
  | "retail"
  | "other";
type NetworkPlan = "free" | "starter" | "growth" | "enterprise" | "internal";
type BillingMode = "none" | "card" | "invoice" | "partner_billed";

interface Network {
  id: string;
  slug: string;
  displayName: string;
  legalName?: string;

  kind: NetworkKind;
  segment: NetworkSegment;
  status: NetworkStatus;

  environment: "production" | "staging" | "sandbox" | "demo";
  primaryRegion: "US" | "CA" | "EU" | "LATAM" | "APAC" | "OTHER";
  timeZone: string;
  currency: string;

  plan: NetworkPlan;
  billingMode: BillingMode;
  billingProvider?: "stripe" | "paddle" | "manual" | "none";
  billingCustomerId?: string;

  maxVenues?: number | null;
  maxActiveOrgs?: number | null;
  maxActiveUsers?: number | null;
  maxShiftsPerDay?: number | null;

  // Security
  requireMfaForAdmins: boolean;
  ipAllowlistEnabled: boolean;
  ipAllowlist?: string[];
  allowedEmailDomains?: string[];
  dataResidency?: "us_only" | "eu_only" | "global" | "unspecified";
  gdprMode: boolean;
  piiMaskingMode: "none" | "mask_in_logs" | "mask_everywhere";

  allowCrossOrgSharing: boolean;
  allowExternalCorpLinks: boolean;

  // Scheduling defaults
  defaultWeekStartsOn: "monday" | "sunday";
  defaultMinShiftLengthHours: number;
  defaultMaxShiftLengthHours: number;
  allowSelfScheduling: boolean;
  allowOvertime: boolean;
  overtimeThresholdHours: number;

  // Features
  features: {
    analytics: boolean;
    forecasting: boolean;
    autoScheduling: boolean;
    attendance: boolean;
    broadcastMessaging: boolean;
    aiAssistant: boolean;
    apiAccess: boolean;
  };

  // Ownership
  ownerUserId: string;
  ownerCorporateId?: string;
  tags?: string[];

  // Lifecycle
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
  trialEndsAt?: Timestamp;
  billingStartsAt?: Timestamp;
  activatedAt?: Timestamp;
  activatedBy?: string;

  // Activation tracking (GAP-2)
  activationBlockedBy?: string[];
  nextRetryAt?: Timestamp;
  suspensionReason?: string;
  suspendedAt?: Timestamp;
  suspendedBy?: string;
  mfaLostAt?: Timestamp;
}
```

**Invariants:**

- `status = "active"` only if:
  - Admin Responsibility Form complete
  - Tax ID verified (or waived)
  - MFA enabled for `ownerUserId`
  - At least one venue and membership exist

**Firestore Rules:**

```javascript
match /networks/{networkId} {
  allow read: if isNetworkMember(networkId);
  allow create, update, delete: if false; // backend only
}
```

---

### 2. Corporate (Graph Node)

**Path:** `/networks/{networkId}/corporates/{corpId}`

**Schema:**

```typescript
interface Corporate {
  id: string;
  networkId: string;
  name: string;
  brandName?: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;

  ownsLocations: boolean;
  worksWithFranchisees: boolean;
  worksWithPartners: boolean;

  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
}
```

**Firestore Rules:**

```javascript
match /corporates/{corpId} {
  allow read: if isNetworkMember(networkId);
  allow create, update, delete: if false; // backend only
}
```

---

### 3. Organization (Graph Node)

**Path:** `/networks/{networkId}/orgs/{orgId}`

**Schema:**

```typescript
interface Organization {
  id: string;
  networkId: string;
  displayName: string;
  legalName?: string;
  primaryContactUid?: string;
  notes?: string;
  isIndependent: boolean;

  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
}
```

**Firestore Rules:**

```javascript
match /orgs/{orgId} {
  allow read: if isNetworkMember(networkId);
  allow create, update, delete: if false; // backend only
}
```

---

### 4. Venue (Graph Node)

**Path:** `/networks/{networkId}/venues/{venueId}`

**Schema:**

```typescript
interface Venue {
  id: string;
  networkId: string;
  name: string;

  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  lat?: number;
  lng?: number;
  timeZone: string;

  isActive: boolean;
  capacityHint?: number;

  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
}
```

**Firestore Rules:**

```javascript
match /venues/{venueId} {
  allow read: if isNetworkMember(networkId);
  allow create, update, delete: if false; // backend only
}
```

---

### 5. CorpOrgLink (Relationship)

**Path:** `/networks/{networkId}/links/corpOrgLinks/{linkId}`

**Schema:**

```typescript
type CorpOrgRelationshipType = "owns" | "serves" | "partner" | "none";
type LinkStatus = "active" | "suspended" | "ended";

interface CorpOrgLink {
  id: string;
  networkId: string;
  corpId: string;
  orgId: string;
  relationshipType: CorpOrgRelationshipType;
  status: LinkStatus;
  startDate: Timestamp;
  endDate?: Timestamp;

  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
}
```

**Semantics:**

- `"owns"` – corp has direct business ownership
- `"serves"` – org is contractor/franchisee
- `"partner"` – symmetric partnership

**Firestore Rules:**

```javascript
match /links/corpOrgLinks/{linkId} {
  allow read: if isNetworkMember(networkId);
  allow create, update, delete: if false; // backend only
}
```

---

### 6. OrgVenueAssignment (Relationship) – CLARIFIED (GAP-3)

**Path:** `/networks/{networkId}/links/orgVenueAssignments/{assignmentId}`

**Schema:**

```typescript
type AssignmentStatus = "active" | "inactive" | "archived";

interface OrgVenueAssignment {
  id: string;
  networkId: string;
  orgId: string;
  venueId: string;

  status: AssignmentStatus;
  startDate: Timestamp;
  endDate?: Timestamp;

  allowedRoles: string[];

  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;

  reason?: string;
  notes?: string;
}
```

**Invariants (from GAP-3):**

1. `status = "active"` means org is currently operating venue
2. `status = "inactive"` means historical assignment (not used in queries)
3. `status = "archived"` means moved to archive after retention window
4. Once `status = "inactive"`, cannot be set back to `"active"` (create new assignment instead)
5. Query must check: `status = "active" AND startDate <= now AND (endDate IS NULL OR now < endDate)`

**Lifecycle:**

```text
active → inactive (one-way)
inactive → archived (retention policy)
```

**Firestore Rules:**

```javascript
match /links/orgVenueAssignments/{assignmentId} {
  allow read: if isNetworkMember(networkId);

  allow create: if
    isOrgOwner(request.auth, orgId) &&
    hasRole(request.auth, "org_owner", "network_admin");

  allow update: if
    hasRole(request.auth, "org_owner", "network_admin") &&
    (
      // Can only set to "inactive" (one-way transition)
      (request.resource.data.status == "inactive" &&
       resource.data.status == "active")
      ||
      // Cannot change immutable fields
      !fieldChanged("orgId") &&
      !fieldChanged("venueId") &&
      !fieldChanged("startDate")
    );

  allow delete: if false; // keep history; use status="archived" instead
}
```

---

### 7. Membership (Network-scoped role assignment)

**Path:** `/networks/{networkId}/memberships/{membershipId}`

**Schema:**

```typescript
type MembershipRole =
  | "network_owner"
  | "network_admin"
  | "org_owner"
  | "org_manager"
  | "scheduler"
  | "staff";

type MembershipStatus = "active" | "suspended" | "invited";

interface Membership {
  id: string;
  networkId: string;
  userId: string;
  roles: MembershipRole[];
  status: MembershipStatus;

  allowedOrgs?: string[];
  allowedVenues?: string[];

  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
}
```

**Firestore Rules:**

```javascript
match /memberships/{membershipId} {
  allow read: if
    request.auth.uid == membershipId ||
    isNetworkOwner(networkId);
  allow create, update, delete: if false; // backend only
}
```

---

### 8. Admin Responsibility Form (Compliance)

**Path:** `/networks/{networkId}/compliance/adminResponsibilityForm`

**Schema:**

```typescript
interface AdminResponsibilityForm {
  networkId: string;
  adminUid: string;
  legalEntityName: string;
  taxIdNumber: string;
  taxIdType: "ein" | "vat" | "ssn" | "other";
  businessEmail: string;
  businessPhone: string;
  country: string;

  serviceStartTimestamp: Timestamp;
  adminSignature: {
    type: "typed" | "drawn" | "external_esign";
    value: string;
  };

  termsAcceptedVersion: string;
  privacyAcceptedVersion: string;
  liabilityAcknowledged: boolean;

  ipAddress: string;
  userAgent: string;
  createdAt: Timestamp;
  createdBy: string;
}
```

**Security:**

- Tax ID is sensitive; stored encrypted at rest
- Only readable by network owner and super-admins
- Immutable once created

**Firestore Rules:**

```javascript
match /compliance/adminResponsibilityForm {
  allow read: if isNetworkOwner(networkId) || isSuperAdmin(request.auth);
  allow create: if isOnboardingServiceAccount();
  allow update, delete: if false; // immutable
}
```

---

## Access Patterns & Queries

### 1. Get all networks a user belongs to

```typescript
query: {
  collection: 'networks',
  where: [
    ['memberships', 'array-contains', uid]
  ]
}
// Or via subcollection query:
query: {
  collectionGroup: 'memberships',
  where: [
    ['userId', '==', uid],
    ['status', '==', 'active']
  ]
}
```

### 2. Get all orgs in a network

```typescript
query: {
  collection: 'networks/{networkId}/orgs',
  orderBy: [['displayName', 'asc']]
}
```

### 3. Get all venues for an org

```typescript
// Via OrgVenueAssignments
query: {
  collection: 'networks/{networkId}/links/orgVenueAssignments',
  where: [
    ['orgId', '==', orgId],
    ['status', '==', 'active'],
    ['startDate', '<=', now]
  ]
}
// Then fetch venue details by venueId
```

### 4. Get schedules for a venue

```typescript
query: {
  collection: 'networks/{networkId}/schedules',
  where: [
    ['venueId', '==', venueId],
    ['startDate', '>=', weekStart],
    ['startDate', '<', weekEnd]
  ]
}
```

---

## Migration Strategy

### Current State (Block 3)

- Org-centric paths: `/orgs/{orgId}/schedules/{scheduleId}`
- No Network concept in implementation

### Target State (Block 4+)

- Network-centric paths: `/networks/{networkId}/schedules/{scheduleId}`
- All data scoped by `networkId`

### Migration Phases

#### Phase 1: Dual-Path Support (Transitional)

- Keep existing `/orgs/{orgId}/...` paths for backward compatibility
- Add new `/networks/{networkId}/...` paths
- Write to both paths temporarily
- Update Firestore rules to support both

#### Phase 2: Gradual Migration

- Create Network wrapper for each existing Org
- Backfill `networkId` field into existing documents
- Update client code to use network-scoped queries
- Deprecate org-scoped paths

#### Phase 3: Full Cutover

- Remove dual-write logic
- Delete or archive old org-scoped collections
- Enforce network-scoped rules exclusively

**Detailed migration plan:** See [MIGRATION_NETWORK_TENANCY.md](./migrations/MIGRATION_NETWORK_TENANCY.md) (to be created)

---

## Related Documentation

- [Project Bible v14.0.0](./bible/Project_Bible_v14.0.0.md) – Authoritative spec
- [TODO v14](./TODO-v14.md) – Implementation tasks
- [GAPS v14.0.0](./bible/GAPS_v14.0.0.md) – Specification gaps
- [BLOCK4_PLANNING.md](./BLOCK4_PLANNING.md) – Block 4 roadmap

---

**Last Updated:** November 7, 2025
**Maintained By:** Patrick Craven
**Status:** Living document – update as implementation progresses
