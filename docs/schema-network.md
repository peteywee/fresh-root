# Schema Map – Network (Tenant Root) & Graph Entities

> Spec source: Project_Bible_v14.0.0

This document defines the **Network-centric multi-tenancy model** and relates it to:

- Firestore paths
- TypeScript/Zod schemas
- Onboarding flows (at a high level)

It is the **bridge** between the Bible and actual code.

---

## 1. Mental Model

- **Network** = tenant box. Nothing relevant to scheduling exists outside a Network.
- Inside a Network:
  - **Corporate** = HQ / brand / supervising entity.
  - **Organization** = operating unit (store, shelter team, nonprofit branch, etc.).
  - **Venue** = physical place where shifts happen.
- Relationships are modeled via **link docs**:
  - `CorpOrgLink` – corporate owns/serves/partners with org.
  - `OrgVenueAssignment` – org operates at venue.

One user can belong to multiple Networks via **memberships**, but all schedules, shifts, and attendance are always scoped to a single `networkId`.

---

## 2. Firestore Paths (Target Model)

| Entity                     | Path Example                                                           | Notes                             | Status        |
|---------------------------|-------------------------------------------------------------------------|-----------------------------------|---------------|
| Network                    | `/networks/{networkId}`                                               | Tenant root                       | PLANNED/IN PROGRESS |
| Corporate                  | `/networks/{networkId}/corporates/{corpId}`                           | Brand/HQ node                     | PLANNED       |
| Organization               | `/networks/{networkId}/orgs/{orgId}`                                  | Operating unit                    | PLANNED       |
| Venue                      | `/networks/{networkId}/venues/{venueId}`                              | Physical place                    | PLANNED       |
| Corp ↔ Org Link            | `/networks/{networkId}/links/corpOrgLinks/{linkId}`                   | `relationshipType` + status       | PLANNED       |
| Org ↔ Venue Assignment     | `/networks/{networkId}/links/orgVenueAssignments/{assignmentId}`      | Org operates at venue             | PLANNED       |
| Network User Profile       | `/networks/{networkId}/users/{uid}`                                   | User info scoped to network       | PLANNED       |
| Membership                 | `/networks/{networkId}/memberships/{membershipId}`                    | User roles + scopes               | PLANNED       |
| AdminResponsibilityForm    | `/networks/{networkId}/compliance/adminResponsibilityForm`            | Legal/administrative record       | PLANNED       |

**Rule:** Any new schedule/shift/people-related collection must either live *under* `/networks/{networkId}` or carry a `networkId` field with rules enforcing it.

---

## 3. TypeScript / Zod Schemas

### 3.1 Network

File: `packages/types/src/networks.ts`

Core types:

- `NetworkSchema` – canonical stored document.
- `CreateNetworkSchema` – onboarding create payload.
- `UpdateNetworkSchema` – update payload.
- Enums:
  - `NetworkKind`
  - `NetworkSegment`
  - `NetworkStatus`
  - `NetworkPlan`
  - `BillingMode`

Invariants:

- `status` ∈ `"pending_verification" | "active" | "suspended" | "closed"`.
- `status = "active"` only when:
  - Admin Responsibility Form exists and is accepted.
  - Email is verified for `ownerUserId`.
  - MFA is enabled for owner (policy-level).
  - At least one Org + Venue + membership exist.

### 3.2 Corporate

File: `packages/types/src/corporates.ts` (see full example in code section below).

Fields (must include):

- `id: string`
- `networkId: string`
- `name: string`
- Optional:
  - `brandName`, `websiteUrl`, `contactEmail`, `contactPhone`
  - `ownsLocations: boolean`
  - `worksWithFranchisees: boolean`
  - `worksWithPartners: boolean`

### 3.3 Organization

File: `packages/types/src/orgs.ts`

Fields (must include):

- `id: string`
- `networkId: string`
- `displayName: string`
- Optional:
  - `legalName?: string`
  - `primaryContactUid?: string`
  - `isIndependent: boolean` (true if no `CorpOrgLink`)

### 3.4 Venue

File: `packages/types/src/venues.ts`

Fields (must include):

- `id: string`
- `networkId: string`
- `name: string`
- Address (optional but strongly recommended):
  - `addressLine1`, `addressLine2`, `city`, `state`, `postalCode`, `country`
- `timeZone: string`
- `isActive: boolean`

**Note:** Venue does **not** carry `orgId` for ownership. That’s expressed with `OrgVenueAssignment` link docs.

### 3.5 Link Docs

File: `packages/types/src/links/corpOrgLinks.ts`

- `CorpOrgRelationshipType`:
  - `"owns" | "serves" | "partner" | "none"`
- `CorpOrgLinkStatus`:
  - `"active" | "suspended" | "ended"`
- `CorpOrgLinkSchema` contains:
  - `networkId`, `corpId`, `orgId`, `relationshipType`, `status`, `startDate`, `endDate?`.

File: `packages/types/src/links/orgVenueAssignments.ts`

- `OrgVenueAssignmentStatus`:
  - `"active" | "inactive"`
- `OrgVenueAssignmentSchema` contains:
  - `networkId`, `orgId`, `venueId`, `status`, `startDate`, `endDate?`, `allowedRoles[]`.

### 3.6 AdminResponsibilityForm

File: `packages/types/src/compliance/adminResponsibilityForm.ts`

- `AdminResponsibilityFormSchema` – stored under `/compliance/adminResponsibilityForm`.
- `CreateAdminResponsibilityFormSchema` – onboarding payload (no `networkId`/`adminUid` yet).

Fields:

- Entity identifiers:
  - `networkId`, `adminUid`
- Legal / business info:
  - `legalEntityName`, `taxIdNumber`, `taxIdType`, `businessEmail`, `businessPhone`, `country`
- Legal acceptance:
  - `termsAcceptedVersion`, `privacyAcceptedVersion`, `liabilityAcknowledged`
  - `adminSignature`
- Metadata:
  - `serviceStartTimestamp`, `ipAddress`, `userAgent`, `createdAt`, `createdBy`

---

## 4. Implementation Checklist (Network Model)

Use this table to track implementation status:

- [ ] Network Firestore path and rules created.
- [ ] Network schemas wired into backend services.
- [ ] Corporate/Org/Venue schemas updated to include `networkId`.
- [ ] Link doc schemas used for relationships.
- [ ] AdminResponsibilityForm creation endpoint implemented.
- [ ] Onboarding wizard flows call:
  - `/api/onboarding/admin-form`
  - `/api/onboarding/create-network-org`
  - `/api/onboarding/create-network-corporate`
- [ ] E2E: New user can create a Network, Org, Venue via wizard and land in schedule view.

Update this doc as pieces go from conceptual → implemented.
# Network Schema & Paths (summary)

This document summarizes the canonical Network-centric Firestore paths and the primary entities introduced in Project Bible v14.

Core paths (all under a tenant root):

- networks/{networkId}
  - Network document (tenant root)
- networks/{networkId}/corporates/{corpId}
- networks/{networkId}/orgs/{orgId}
- networks/{networkId}/venues/{venueId}
- networks/{networkId}/links/corpOrgLinks/{linkId}
- networks/{networkId}/links/orgVenueAssignments/{assignmentId}
- networks/{networkId}/compliance/adminResponsibilityForm
- networks/{networkId}/users/{uid}
- networks/{networkId}/memberships/{membershipId}

Notes:

- All schedule-related data must contain (or be under a path that contains) `networkId`.
- Compliance subcollections (`/compliance`) are write-only for onboarding service accounts and readable only by network owners and platform super-admins.
- Link documents model relationships (not nested ownerships).

This file is a short companion to the full Project Bible v14: `docs/bible/Project_Bible_v14.0.0.md`.
