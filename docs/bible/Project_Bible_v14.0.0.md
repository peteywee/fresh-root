# Fresh Schedules – Project Bible v14.0.0 (Production-Ready)

---

## 0. Document Metadata

- **Project Name:** Fresh Schedules
- **Bible Version:** **14.0.0** (Production-Ready Spec)
- **Status:** Executable Specification – Pre-Launch Baseline
- **Last Updated:** November 2025
- **Maintainer:** Product & Architecture (Emmit as authority-of-record)

### 0.1 Code Baseline Mapping

This Bible version is designed to be **forward-compatible** with existing code and to serve as the **authoritative reference** for production readiness.

- **App Code Tag (Implementation Baseline):** `v1.1.0`
  - **Included blocks:**
    - Block 1 – Security Core
    - Block 2 – Reliability Core
    - Block 3 – Integrity Core
  - These are **implemented & tagged** in the repo.

- **Bible v13.6:**
  - Introduced the **Network** (tenant root) and the **Corporate / Organization / Venue graph**.
  - Still treated as **design-level**, not fully implemented in code.

- **Bible v14.0.0 (this document):**
  - Freezes Blocks 1–3 as **production-grade baselines**.
  - Elevates **Network** to a production-level concept (even if partially implemented at first).
  - Defines **strict Network creation requirements**:
    - Network Admin Responsibility Form
    - Tax ID handling
    - Security gates and onboarding flows
  - Sketches the **path through Block 4 and beyond**.

The intention is:
> **This document is the "single source of truth" for what must be true before we treat Fresh Schedules as a production product for real organizations.**

---

## 1. Purpose, Non-Goals, and Audience

### 1.1 Purpose

This Bible exists to:

1. Define **exactly how data is partitioned** (Network as tenant root).
2. Define **who has the legal and technical authority** to create and operate a Network.
3. Specify the **onboarding wizard and APIs** that safely create Networks, Organizations, Venues, and Memberships.
4. Outline the **block roadmap** from the current integrity baseline (Blocks 1–3) through UX, PWA, AI, and compliance (Blocks 4–8 and extremities).
5. Protect the platform owner (you) from:
   - Being implicitly responsible for mishandling of staff data by customers; and
   - Having undefined legal and operational boundaries around data ownership and control.

### 1.2 Non-Goals

This document does **not** attempt to:

- Write actual legal ToS or DPA language. It instead defines **the technical hooks and data structures** required so lawyers can plug in their text.
- Define every tiny UI component. Block 4+ will handle detailed UX specs route-by-route.
- Fully specify **cross-network data sharing**. It acknowledges future "federation" and "analytics hub" work but keeps it out of production v14 scope.

### 1.3 Intended Audience

- **Architects** – to reason about Network, multi-tenancy, and graph relationships.
- **Senior engineers** – to design APIs, rules, and data models consistent with the spec.
- **Operators / DevOps** – to understand environment boundaries and compliance expectations.
- **Legal / Compliance** – to see where responsibility and control is assigned.

---

## 2. Core Concepts & Mental Model

### 2.1 The Three Boxes: Infra, Network, Graph

We explicitly distinguish three "layers" of containment:

1. **Infrastructure Box (App / Firebase Project)**
   - A single deployment of the app, bound to a Firebase project (or equivalent).
   - This is the outermost technical boundary:
     - All Firestore data, Storage buckets, and Functions belong to this environment.
   - This box is **opaque to end users**; they do not see or care about "which Firebase project" they are on.

2. **Tenant Box (Network)**
   - A **Network** is the tenant root – the **business boundary** inside the app.
   - Every meaningful piece of data (schedules, shifts, staff profiles, attendance, etc.) must be associated with exactly one `networkId`.
   - Networks are **created rarely** and with **strict security + legal checks**.

3. **Graph Inside the Network**
   - Within a Network, we have **graph nodes**:
     - Corporate
     - Organization
     - Venue
   - And **relationship edges**:
     - Corporate **owns** Organization(s)
     - Organization **serves** Corporate(s)
     - Organization **operates_at** Venue(s)
   - These are modeled via **link documents**, not nested collections that imply ownership semantics.

The key rule is:

> **Network is the only true tenant boundary. Corporate and Organization are graph nodes inside that boundary.**

### 2.2 Entity Overview

Within each `networkId`:

- **Network** – the tenant itself (`networks/{networkId}`).
- **Corporate** – a brand or HQ node (`networks/{networkId}/corporates/{corpId}`).
- **Organization** – an operating unit (`networks/{networkId}/orgs/{orgId}`).
- **Venue** – a physical place (`networks/{networkId}/venues/{venueId}`).
- **Links** – relationships:
  - `corpOrgLinks` (Corporate ↔ Org)
  - `orgVenueAssignments` (Org ↔ Venue)
- **Users** – user profiles scoped to a Network (`networks/{networkId}/users/{uid}`).
- **Memberships** – mapping users to roles at Network/Corporate/Org/Venue levels.

### 2.3 Security & Responsibility Principles

1. **Single Tenant Invariant**
   Every schedule, shift, membership, and attendance record belongs to exactly one Network. This is enforced via path structure and rules.

2. **Network Admin as Data Controller**
   The individual (or legal entity) who sets up the Network is the **data controller** for that Network in legal and practical terms. You (Fresh Schedules / platform) act as a **data processor**.

3. **You Are Not Responsible for Their Internal Abuse**
   The Network Admin Responsibility Form explicitly states:
   - They are responsible for who is invited and what data they store.
   - They agree not to misuse employee data.
   - They acknowledge that the platform is not liable for internal misuse that violates their own policies or laws.

4. **Security Over Convenience, but UX-Guided**
   - Network creation is gated behind:
     - Verified identity,
     - Admin Responsibility Form,
     - Tax ID (where applicable),
     - Acceptance of terms.
   - It is still a **guided, linear wizard** so non-technical admins can complete it within minutes.

### 2.4 User Scoping & Multi-Network Context

Users (identified by uid) can belong to multiple Networks via memberships.

**Global Scope:**

```text
/users/{uid}
  - Profile: fullName, email, phone, etc. (shared across all networks)
  - Not network-specific
```

**Network-Specific Scope:**

```text
/networks/{networkId}/users/{uid}
  - Membership record
  - Roles: network_owner, network_admin, org_owner, org_manager, scheduler, staff
  - Status: active, suspended, invited
```

**Client State (JavaScript/React/etc.):**

```typescript
interface AppContext {
  currentUser: User;
  activeNetworkId: string;
  activeNetwork: Network;
  memberships: Membership[];
  switchNetwork(networkId: string): Promise<void>;
}

// On network switch:
switchNetwork(networkId) {
  validateMembership(uid, networkId); // Must exist
  setActiveNetworkId(networkId);
  clearScheduleCache(); // invalidate old network data
  reloadMemberships(networkId);
}
```

**Firestore Rules Update:**

```javascript
match /networks/{networkId}/memberships/{membershipId} {
  allow read: if request.auth.uid == membershipId.uid;
  allow write: if false; // backend only
}

match /networks/{networkId}/schedules/{scheduleId} {
  allow read, write: if
    exists(/databases/$(database)/documents/networks/$(networkId)/memberships/$(request.auth.uid))
    && getRole(networkId) in ["scheduler", "org_owner", "network_admin"];
}
```

**Invariant:**
If a user has activeNetworkId = "net-A", all queries must filter by networkId = "net-A".
Never return data from net-B even if the user is a member of both.

---

## 3. Data Model – Network and Graph (Production-Ready Version)

### 3.1 Network (Tenant Root)

**Path:**
`networks/{networkId}`

**Purpose:**
Represents the **business tenant**. All data contained in a Network belongs to a single customer or tightly-related ecosystem.

**Fields (non-exhaustive but canonical):**

```typescript
type NetworkStatus =
  | "pending_verification"
  | "active"
  | "suspended"
  | "closed";

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

type NetworkPlan =
  | "free"
  | "starter"
  | "growth"
  | "enterprise"
  | "internal";

type BillingMode =
  | "none"
  | "card"
  | "invoice"
  | "partner_billed";
```

Example schema (conceptual):

```typescript
interface Network {
  id: string;                  // Firestore doc ID (networkId)
  slug: string;                // URL-safe unique string: "top-shelf-service"
  displayName: string;         // Human-readable: "Top Shelf Service Network"
  legalName?: string;          // Legal entity, if different

  kind: NetworkKind;           // see above
  segment: NetworkSegment;     // vertical
  status: NetworkStatus;       // lifecycle status

  environment: "production" | "staging" | "sandbox" | "demo";
  primaryRegion: "US" | "CA" | "EU" | "LATAM" | "APAC" | "OTHER";
  timeZone: string;            // IANA TZ, e.g. "America/Chicago"
  currency: string;            // ISO code, e.g. "USD"

  plan: NetworkPlan;
  billingMode: BillingMode;
  billingProvider?: "stripe" | "paddle" | "manual" | "none";
  billingCustomerId?: string;  // external id, e.g. Stripe customer

  maxVenues?: number | null;
  maxActiveOrgs?: number | null;
  maxActiveUsers?: number | null;
  maxShiftsPerDay?: number | null;

  // Security posture
  requireMfaForAdmins: boolean;
  ipAllowlistEnabled: boolean;
  ipAllowlist?: string[];      // CIDRs
  allowedEmailDomains?: string[];
  dataResidency?: "us_only" | "eu_only" | "global" | "unspecified";
  gdprMode: boolean;
  piiMaskingMode: "none" | "mask_in_logs" | "mask_everywhere";

  allowCrossOrgSharing: boolean;     // within this network
  allowExternalCorpLinks: boolean;   // cross-network, future

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

  // Ownership / relationship to the platform
  ownerUserId: string;         // uid of person who created the network
  ownerCorporateId?: string;   // if the entire network is under a meta-corporate
  tags?: string[];             // arbitrary tags for ops for search/segmentation

  // Lifecycle timestamps
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;

  trialEndsAt?: Timestamp;
  billingStartsAt?: Timestamp;
  activatedAt?: Timestamp;
  activatedBy?: string;

  // Activation tracking (from GAP-2)
  activationBlockedBy?: string[]; // ["mfa_pending", "tax_id_pending", ...]
  nextRetryAt?: Timestamp;        // when to re-check

  // Suspension tracking
  suspensionReason?: string;
  suspendedAt?: Timestamp;
  suspendedBy?: string;
  mfaLostAt?: Timestamp;          // when admin MFA was detected as disabled
}
```

**Invariants:**

- `status = "active"` only after:
  - Admin Responsibility Form is completed and stored.
  - Tax ID (if required) is verified or explicitly marked "reviewed/waived".
  - At least one venue and one org membership exist.
  - MFA is enabled for the network owner (see section 4).

- When `status != "active"`:
  - Scheduling and messaging actions are disabled.
  - The UI shows "Workspace pending verification" message.

### 3.2 Corporate, Organization, Venue

Within a Network:

```text
networks/{networkId}/corporates/{corpId}
networks/{networkId}/orgs/{orgId}
networks/{networkId}/venues/{venueId}
```

**Corporate (conceptual):**

```typescript
interface Corporate {
  id: string;
  networkId: string;
  name: string;          // HQ or brand name
  brandName?: string;    // public-facing brand
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;

  ownsLocations: boolean;         // does corp own any orgs directly?
  worksWithFranchisees: boolean;  // does corp use independent orgs?
  worksWithPartners: boolean;     // agencies, BPO, etc.

  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
}
```

**Organization (conceptual):**

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

**Venue (conceptual):**

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

### 3.3 Link Documents

#### 3.3.1 Corporate ↔ Organization (corpOrgLinks)

**Path:**

```text
networks/{networkId}/links/corpOrgLinks/{linkId}
```

**Schema (conceptual):**

```typescript
type CorpOrgRelationshipType =
  | "owns"
  | "serves"
  | "partner"
  | "none";

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

- `"owns"` – corp has direct business ownership of the org.
- `"serves"` – org acts as contractor/franchisee servicing the corp.
- `"partner"` – symmetric partnership.
- `"none"` – used rarely; typically no link doc at all implies independence.

#### 3.3.2 Organization ↔ Venue (orgVenueAssignments) – CLARIFIED

**Path:**

```text
networks/{networkId}/links/orgVenueAssignments/{assignmentId}
```

**Schema (updated from GAP-3):**

```typescript
type AssignmentStatus = "active" | "inactive" | "archived";

interface OrgVenueAssignment {
  id: string;
  networkId: string;
  orgId: string;
  venueId: string;

  // Logical state
  status: AssignmentStatus;
  // "active":   Org is currently operating this venue
  // "inactive": Org previously operated this venue; links removed but history kept
  // "archived": Moved to archive (older than retention window)

  // Temporal boundaries
  startDate: Timestamp;     // Org begins operating venue
  endDate?: Timestamp;      // Org stops operating venue (null = ongoing)

  // Allowances
  allowedRoles: string[];   // e.g., ["manager","scheduler","staff"]

  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;

  // Audit trail
  reason?: string;          // "contract_signed", "trial_ended", "requested_by_org", ...
  notes?: string;
}
```

**Invariants (from GAP-3):**

1. **Status Controls Visibility:**
   If status = "inactive" or "archived", this assignment is NOT used in scheduling queries.
   It is historical only.

2. **Temporal Bounds Are Data Only (Not Enforced):**
   A query MUST check:

   ```
   status = "active" AND startDate <= now AND (endDate IS NULL OR now < endDate)
   ```

   The endDate field does NOT automatically deactivate an assignment.
   To deactivate, set status = "inactive".

3. **Immutable Once "inactive":**
   Once status is set to "inactive", it cannot be set back to "active".
   If you need to re-activate, create a new OrgVenueAssignment.

**Query Patterns:**

```typescript
// Current assignments for a venue
query: {
  collection: 'networks/{networkId}/links/orgVenueAssignments',
  where: [
    ['venueId', '==', venueId],
    ['status', '==', 'active'],
    ['startDate', '<=', now],
  ],
  // Client-side filter: now < (endDate || Infinity)
}

// All historical assignments (for audit)
query: {
  collection: 'networks/{networkId}/links/orgVenueAssignments',
  where: [
    ['venueId', '==', venueId],
  ],
  orderBy: [['startDate', 'desc']],
}
```

**Lifecycle & Deactivation:**

Phase 1: Assignment Active

```typescript
{
  status: "active",
  startDate: "2025-01-15T08:00:00Z",
  endDate: null,
  reason: "contract_signed"
}
```

Phase 2: Notice of Ending

```typescript
// Admin goes to UI, clicks "Remove Org from Venue"
// Backend receives: PATCH /api/venues/{venueId}/assignments/{assignmentId}
// Payload: { status: "inactive", endDate: now() }

{
  status: "inactive",
  startDate: "2025-01-15T08:00:00Z",
  endDate: "2025-06-30T17:00:00Z",
  reason: "contract_ended",
  updatedAt: "2025-06-30T17:00:00Z"
}
```

Phase 3: Archival (after retention window, e.g., 2 years)

```typescript
{
  status: "archived",
  startDate: "2025-01-15T08:00:00Z",
  endDate: "2025-06-30T17:00:00Z",
  reason: "contract_ended",
  archiveReasonedAt: "2027-06-30T17:00:00Z"
}
```

---

## 4. Network Creation, Onboarding Wizard, and Admin Responsibility

### 4.1 Actors

We distinguish several actors in onboarding:

- **End User (Person)**
  - Human with an email and auth identity (Firebase uid).

- **Network Owner (Admin)**
  - The person claiming responsibility for a Network.
  - Must complete Admin Responsibility Form.

- **Staff / Crew**
  - End users who join via join code or invite; do not create Networks.

- **Corporate / HQ Admin**
  - Person at corporate level setting up a Network with `kind="corporate_network"`.

### 4.2 High-Level Onboarding Phases

1. **Identity & Profile (All Users)**
   - Create auth user, verify email, basic profile.

2. **Intent Selection**
   - "Join existing team" vs "Set up my team" vs "I'm at HQ / Corporate".

3. **Network Creation Path**
   - Only flows where user chooses to set up or represent a team/org/HQ may attempt to create a Network.

4. **Admin Responsibility Form + Tax ID**
   - For Network creators only; staff never see this.

5. **Network + Org + Venue Creation**
   - Using secure backend APIs; no direct client writes to networks.

6. **Activation Gate**
   - Flip `network.status` from `"pending_verification"` to `"active"` only after all checks.

### 4.3 Admin Responsibility Form – Spec

**Path (storage):**

Primary record:

```
networks/{networkId}/compliance/adminResponsibilityForm
```

Optional:

```
adminResponsibilityFormHistory/{eventId}
```

for certification history, if desired.

#### 4.3.1 Form Fields

These fields are captured during onboarding via a dedicated step.

Data model:

```typescript
interface AdminResponsibilityForm {
  networkId: string;
  adminUid: string;            // The user creating the network
  legalEntityName: string;     // Company or legal name
  taxIdNumber: string;         // EIN, VAT or national/region equivalent
  taxIdType: "ein" | "vat" | "ssn" | "other";
  businessEmail: string;
  businessPhone: string;
  country: string;             // ISO country code, e.g. "US"

  serviceStartTimestamp: Timestamp; // when they accepted terms
  adminSignature: {
    type: "typed" | "drawn" | "external_esign";
    value: string;                // typed name or reference id
  };

  termsAcceptedVersion: string;   // e.g. "TOS-2025-01"
  privacyAcceptedVersion: string; // e.g. "PRIVACY-2025-01"
  liabilityAcknowledged: boolean; // they accept that they are the controller

  ipAddress: string;              // from request
  userAgent: string;              // from request
  createdAt: Timestamp;
  createdBy: string;              // adminUid
}
```

#### 4.3.2 Validation Rules

- `legalEntityName`: non-empty, >= 3 characters.
- `taxIdNumber`: pattern-driven validation by country:
  - For US and `taxIdType="ein"`: 2-7 digits or typical NN-NNNNNNN shape.
  - For EU/VAT: pattern per country prefix.
- `businessEmail`: must be a valid email; for corporate setup, strongly prefer non-generic domains.
- `businessPhone`: must be valid format (E.164 recommended).
- `liabilityAcknowledged`: must be `true` or the API rejects the form.

#### 4.3.3 Legal & Responsibility Semantics (Technical View)

The form encodes the following technical assertions (summary):

1. The `legalEntityName` accepts responsibility for staff data in this Network.
2. The `adminUid` is authorized to make this claim on behalf of that entity.
3. The platform offers tools and reasonable defaults but does not control or audit every use.
4. The Network owner agrees not to:
   - Use the platform to violate employment or privacy laws.
   - Store or misuse data that has nothing to do with scheduling / operations.
5. The platform reserves the right to suspend the Network if abusive or illegal activity is detected.

**Note:** The actual text of the terms must be referenced by `termsAcceptedVersion` and stored separately (e.g., in a legal system or static content). This spec focuses on the data hooks.

### 4.4 Tax ID Handling

#### 4.4.1 Why Tax ID

Tax ID (EIN/VAT/etc.) is required because:

1. It provides a verifiable link between a Network and a real-world entity.
2. It can be used to track abuse across multiple Networks if necessary (e.g., repeated TOS breaches).
3. It helps ensure that people setting up Networks have some real traceability.

#### 4.4.2 Storage & Security

Tax ID is sensitive.

It must be:

- Stored in a dedicated compliance sub-collection (`compliance`),
- Restricted in Firestore rules to `network_owner` and platform super-admins,
- Optionally encrypted at rest using an application-level encryption key (in addition to Firestore storage-level encryption).

Example:

```javascript
match /networks/{networkId}/compliance/adminResponsibilityForm {
  allow read: if isNetworkOwner(request.auth.uid, networkId) || isSuperAdmin(request.auth.uid);
  allow create: if isOnboardingServiceAccount();
  allow update, delete: if false; // immutable once created
}
```

Where:

- `isOnboardingServiceAccount()` checks auth claims for backend service identities.
- `isSuperAdmin(uid)` checks top-level admin list.

#### 4.4.3 Verification Workflow

On form submission:

1. **For supported regions:**
   - Call external or internal tax ID validation service.
   - Response: "valid", "invalid", or "unable_to_verify".

2. **For unsupported regions:**
   - Mark as `verificationStatus="manual_review"`.

**Network status is derived as follows:**

If:

- Email verified
- Form complete
- Tax ID "valid" or "manual_review" accepted
- At least one venue + membership
- MFA enabled for adminUid

→ `status = "active"`.

If:

- Form submitted but verification pending

→ `status = "pending_verification"`.

If:

- Suspicious patterns (multiple networks, mismatched countries, etc.)

→ `status = "suspended"` until reviewed.

### 4.5 Onboarding Wizard – User Flows (Detailed)

This section describes exact flows, including:

- Screens
- API calls
- Entities created or updated

#### 4.5.1 Phase 1 – Identity & Profile

**Route:** `/onboarding/profile`

**Inputs:**

- Email & password / SSO (already handled by auth provider).
- Profile form:
  - `fullName`
  - `phone`
  - `preferredLanguage`
  - `timeZone`
  - `selfDeclaredRole`:
    - "owner_founder_director"
    - "manager_supervisor"
    - "staff_crew"
    - "corporate_hq"
    - "consultant_partner"

**Writes:**

`/users/{uid}` (global or network-agnostic profile):

- `profile.fullName`
- `profile.phone`
- `profile.preferredLanguage`
- `profile.timeZone`
- `profile.selfDeclaredRole`

No Network is created at this point.

#### 4.5.2 Phase 2 – Intent Selector

**Route:** `/onboarding/intent`

**Question:** "What are you here to do?"

**Options (cards):**

1. **"I'm joining my existing team"**
   - Flow: Join (no network creation).

2. **"I'm setting this up for my team / organization"**
   - Flow: Org-centric Network creation.

3. **"I'm at HQ / Corporate / Franchise"**
   - Flow: Corporate-centric Network creation.

**Routing:**

- Join → `/onboarding/join`
- Org → `/onboarding/create-network-org`
- Corporate → `/onboarding/create-network-corporate`

Only Org and Corporate flows can ultimately invoke Network creation.

#### 4.5.3 Join Existing Team (No Network Creation)

**Route:** `/onboarding/join`

**Inputs:**

- Invite link (with token) or join code.

**Backend Flow:**

```
POST /api/onboarding/join-with-token
```

Backend:

1. Looks up `joinToken` (Block 3 types)
2. Resolves:
   - `networkId`
   - `orgId` (optional)
   - `venueId` (optional)
   - `roles` (e.g. `["staff"]` or `["manager","scheduler"]`)
3. Validates:
   - Token not expired
   - `remainingUses > 0`
   - Not revoked
4. Writes (on success):
   - Ensure Network membership:
     `networks/{networkId}/memberships/{membershipId}` for the user.
   - Org membership (if `orgId` present).
   - Optionally Venue mapping.

No Admin Responsibility Form, no Network creation. This is purely a join path.

#### 4.5.4 Org-Centric Network Creation

**Route:** `/onboarding/create-network-org`

##### Step 1 – Security Pre-check

Backend endpoint:

```
POST /api/onboarding/verify-eligibility
```

Checks:

- `request.auth != null` (user must be signed in)
- `emailVerified == true`
- `selfDeclaredRole` in:
  - "owner_founder_director"
  - "manager_supervisor"

If these conditions fail, the endpoint responds with:

- HTTP 403 or 422, plus hints:
  - "Please verify your email."
  - "This flow is for owners and managers; staff should join via an invite."

##### Step 2 – Org & Network Basics Form

Screen fields:

- `orgName` – what staff know the team as.
- `industry/vertical` – maps to `NetworkSegment`.
- `approxLocations` – one of `["1","2-5","6-20","20+"]`.
- `hasCorporateAboveYou` – boolean:
  - "Do you report to a corporate / brand above you?" yes/no.

These map to:

`network.kind`:

- If `hasCorporateAboveYou = false` → `"independent_org"`
- If `hasCorporateAboveYou = true` → `"franchise_network"` or `"nonprofit_network"` depending on segment.

This is pre-creation data; nothing written to Firestore yet aside from a temporary draft, if desired.

##### Step 3 – Initial Venue (Org defines location)

Screen fields:

- `venueName` (defaults to orgName or "Main Location")
- Address fields (city, state, country at minimum).
- `timeZone` pre-filled from user.

The wizard explicitly tells the user:

> "This is the primary location where your team works. You can add more locations later."

##### Step 4 – Admin Responsibility Form

**Route:** `/onboarding/admin-responsibility`

Fields (from 4.3.1):

- `legalEntityName`
- `taxIdNumber + taxIdType`
- `businessEmail`
- `businessPhone`
- `country`
- Checkbox: liability, terms, and privacy acceptance.
- Typed signature.

Backend endpoint:

```
POST /api/onboarding/admin-form
```

Payload (simplified):

```json
{
  "legalEntityName": "...",
  "taxIdNumber": "...",
  "taxIdType": "ein",
  "businessEmail": "...",
  "businessPhone": "...",
  "country": "US",
  "termsAcceptedVersion": "TOS-2025-01",
  "privacyAcceptedVersion": "PRIV-2025-01",
  "liabilityAcknowledged": true,
  "signature": {
    "type": "typed",
    "value": "Jane Doe"
  }
}
```

Backend behavior:

1. Validates fields (patterns, non-empty).
2. Looks up or requests tax ID verification.
3. Stores a pending `AdminResponsibilityForm` in memory or a temp collection.

##### Step 5 – Network + Org + Venue Creation (Atomic Server-Side Step)

Endpoint:

```
POST /api/onboarding/create-network-org
```

This endpoint is called after the wizard completed steps 2, 3, and 4.

The backend:

1. Re-checks:
   - Email verified
   - Role eligibility
   - No more than N networks already created by this uid (anti-abuse)
   - `AdminResponsibilityForm` exists and is valid for this session.

2. Begins an atomic operation (transaction):
   - Creates `networks/{networkId}` with:
     - `kind`, `segment`, `status = "pending_verification"` initially.
     - `ownerUserId = uid`.
   - Writes the `AdminResponsibilityForm` to:
     `networks/{networkId}/compliance/adminResponsibilityForm`.
   - Creates `orgs/{orgId}` under that Network.
   - Creates `venues/{venueId}` for the initial location.
   - Creates membership(s):
     - Network membership:
       - `uid` as `network_admin` or `network_owner`.
     - Org membership:
       - `uid` as `org_owner`.
   - Optional `OrgVenueAssignment` linking org and venue.

3. Returns to client:

```json
{
  "networkId": "...",
  "orgId": "...",
  "venueId": "...",
  "status": "pending_verification" | "active"
}
```

##### Step 6 – Activation

A separate backend process or synchronous logic checks:

- Tax ID verification result.
- MFA status of the admin user (enforce for network owners).
- Minimum configuration: venue defined, membership present.

If all good:

- Sets `network.status = "active"`.
- Sets `activatedAt` and `activatedBy`.

If not:

- Keeps `network.status = "pending_verification"`.
- Dashboard shows banner explaining pending state.

#### 4.5.5 Corporate-Centric Network Creation

**Route:** `/onboarding/create-network-corporate`

This is structurally similar to the org flow but has some extra checks.

##### Step 1 – Eligibility & Stronger Verification

Enforce business email where possible:

- If the email is from a generic domain (gmail, yahoo):
  - Warn: "Corporate setup usually uses a company email. You can proceed, but your workspace may require manual verification."
  - Set a flag on the Network: `requiresManualCorporateVerification = true`.

Same endpoint `POST /api/onboarding/verify-eligibility`, with added condition:

- `selfDeclaredRole` must be `"corporate_hq"` or `"owner_founder_director"`.

##### Step 2 – Corporate Form

Fields:

- `corporateName`
- `brandName`
- `ownsLocations` (boolean)
- `worksWithFranchisees` (boolean)
- `worksWithPartners` (boolean)
- `approxLocations` (size band)

These fields shape:

- `network.kind = "corporate_network"`.

Later flows (Block 4+) will use these to suggest flows:

- "Add owned locations now" vs "invite franchisees later".

##### Step 3 – Admin Responsibility Form & Tax ID

Same as Org flow, but this is mandatory with no shortcuts.

##### Step 4 – Network + Corporate Creation

Endpoint:

```
POST /api/onboarding/create-network-corporate
```

Backend steps (transaction):

1. Create Network with `kind="corporate_network"`.
2. Attach `AdminResponsibilityForm`.
3. Create `corporates/{corpId}` with `name` and `brandName`.
4. Create membership(s):
   - Network membership: `network_owner`.
   - Corporate membership: `corp_owner`.

At this point, an org might not yet exist.
Block 4+ flows will allow:

- Creating internal orgs and venues under this Network; or
- Generating join tokens for franchisees to create their own orgs inside this Network.

### 4.5.6 Activation Logic & MFA Gates (Detailed from GAP-2)

#### Network Status Transitions

**State Machine:**

```
pending_verification
  ├─ Tax ID verified & MFA enabled → active
  ├─ Suspicious signals detected → suspended
  └─ 30 days elapsed, no action → auto_closed

active
  ├─ Admin disables MFA → pending_review (background check triggered)
  ├─ Abuse detected → suspended
  └─ Admin deletes network → closed

suspended
  └─ Manual ops review & remediation → active | closed

closed (terminal)
```

#### MFA Requirement – Hard Gate at Onboarding

Step 5 of onboarding (4.5.4) creates the Network in status `"pending_verification"`.

Immediately after creation, a Cloud Function runs:

```typescript
async function activateNetworkIfReady(networkId) {
  const network = await db.collection('networks').doc(networkId).get();
  const adminUid = network.data().ownerUserId;
  const admin = await admin.auth().getUser(adminUid);

  const isReady =
    network.data().adminResponsibilityForm.liabilityAcknowledged
    && admin.customClaims?.mfa_enabled === true
    && taxIdVerified(network)
    && hasMinConfigVenue(network);

  if (isReady) {
    await db.collection('networks').doc(networkId).update({
      status: 'active',
      activatedAt: Timestamp.now(),
      activatedBy: 'system',
    });
    sendEmail(admin.email, 'Network activated');
  } else {
    // Determine which gate failed and set a debug flag
    const blocks = [];
    if (!admin.customClaims?.mfa_enabled) blocks.push('mfa_pending');
    if (!taxIdVerified(network)) blocks.push('tax_id_pending');
    if (!hasMinConfigVenue(network)) blocks.push('missing_venue');

    await db.collection('networks').doc(networkId).update({
      status: 'pending_verification',
      activationBlockedBy: blocks,
      nextRetryAt: Timestamp.now() + Duration.minutes(5),
    });
  }
}
```

**Client-Side Messaging:**

```typescript
if (network.status === 'pending_verification') {
  const blocks = network.activationBlockedBy || [];

  if (blocks.includes('mfa_pending')) {
    showAlert('Complete setup: Enable two-factor authentication in Security Settings');
  }
  if (blocks.includes('tax_id_pending')) {
    showAlert('Tax ID verification in progress (can take 24 hours)');
  }
  if (blocks.includes('missing_venue')) {
    showAlert('Add at least one venue to activate');
  }
}
```

#### MFA Removal After Activation (Ongoing Check)

**Background Job (runs every 6 hours):**

```typescript
async function checkNetworkMFACompliance() {
  const activeNetworks = await db.collection('networks')
    .where('status', '==', 'active')
    .get();

  for (const networkDoc of activeNetworks.docs) {
    const adminUid = networkDoc.data().ownerUserId;
    const admin = await admin.auth().getUser(adminUid);

    if (admin.customClaims?.mfa_enabled !== true) {
      // Admin disabled MFA
      await networkDoc.ref.update({
        status: 'pending_review',
        mfaLostAt: Timestamp.now(),
        requiresManualReview: true,
        suspensionReason: 'Network admin MFA disabled',
      });

      await alertOps(`Network ${networkDoc.id} lost admin MFA`);
    }
  }
}
```

**Remediation Path:**

- Admin re-enables MFA → status returns to `"active"` (auto-check runs within 1h).
- If not re-enabled within 7 days → status → `"suspended"`.

#### Onboarding UX Impact

At step 4 (Admin Responsibility Form), show:

- ✓ "We'll require two-factor authentication to protect your data."
- ✓ Link to MFA setup guide.

After onboarding completes:

If `status != "active"`, show progress bar with blockers:

```
"⏳ Setting up your workspace (2 of 4 requirements met)"
☐ Email verified (✓ done)
☐ Two-factor authentication (⏳ pending)
☐ Tax ID verified (⏳ pending)
☐ Add your first venue (☐ pending)
```

---

## 5. Firestore Rules – Network & Onboarding

### 5.1 High-Level Rules

- Clients **cannot** create or delete Networks directly.
- Compliance documents (admin forms, tax IDs) are **write-only from backend**.
- Membership documents are only created through secure APIs (onboarding / invites).
- All collection paths must be prefixed with `/networks/{networkId}` for tenant-scoped data.

### 5.2 Example Rules Skeleton

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Network root
    match /networks/{networkId} {
      allow read: if isNetworkMember(request.auth, networkId);
      allow create, update, delete: if false; // only via Admin SDK

      // Compliance subcollection
      match /compliance/adminResponsibilityForm {
        allow read: if isNetworkOwner(request.auth, networkId) || isSuperAdmin(request.auth);
        allow create: if isOnboardingServiceAccount(request.auth);
        allow update, delete: if false;
      }

      // Corporates
      match /corporates/{corpId} {
        allow read: if isNetworkMember(request.auth, networkId);
        allow create, update, delete: if false; // backend only
      }

      // Orgs
      match /orgs/{orgId} {
        allow read: if isNetworkMember(request.auth, networkId);
        allow create, update, delete: if false; // backend only
      }

      // Venues (Org + Corporate may influence via backend)
      match /venues/{venueId} {
        allow read: if isNetworkMember(request.auth, networkId);

        // Creation is mediated by backend, not direct client writes.
        allow create, update, delete: if false;
      }

      // Links
      match /links/{linkCollection}/{linkId} {
        allow read: if isNetworkAdminOrOwner(request.auth, networkId);
        allow create, update, delete: if false; // backend only
      }

      // Users & memberships under this network
      match /users/{uid} {
        allow read: if request.auth.uid == uid || isNetworkAdmin(request.auth, networkId);
        allow create, update: if request.auth.uid == uid; // profile fields only
        allow delete: if false;
      }

      match /memberships/{membershipId} {
        allow read: if isNetworkMember(request.auth, networkId);
        allow create, update, delete: if false; // backend only
      }

      // OrgVenueAssignments (from GAP-3)
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

      // Other collections (schedules, shifts, attendance, etc.)
      // inherit the Block 3 Integrity rules, now nested under /networks/{networkId}
    }
  }
}
```

### 5.3 Firestore Security Rules – Helper Functions (from GAP-4)

This section defines the exact implementations of helper functions used in section 5.2.

#### Environment Setup

**Custom Claims (set on auth creation via Admin SDK):**

```json
{
  "role": "network_admin" | "org_owner" | "staff" | ...,
  "mfa_enabled": boolean,
  "networks": [networkId, ...] // optional; allows fast check
}
```

Alternatively, if custom claims are not used:
Query memberships collection directly (slower but more flexible).

#### Helper: isNetworkMember(auth, networkId)

**Implementation Option A (via Custom Claims):**

```javascript
function isNetworkMember(auth, networkId) {
  return networkId in auth.token.claims.networks;
}
```

**Implementation Option B (via Document Query):**

```javascript
function isNetworkMember(auth, networkId) {
  return exists(
    /databases/$(database)/documents/networks/$(networkId)/memberships/$(auth.uid)
  );
}
```

**Recommendation:** Use Option B (document query) in v14 for clarity and auditability.

#### Helper: isNetworkOwner(auth, networkId)

```javascript
function isNetworkOwner(auth, networkId) {
  let membershipRef = /databases/$(database)/documents/networks/$(networkId)/memberships/$(auth.uid);
  return exists(membershipRef) &&
         get(membershipRef).data.roles.hasAny(["network_owner", "network_admin"]);
}
```

#### Helper: isOrgOwner(auth, orgId, networkId)

```javascript
function isOrgOwner(auth, orgId, networkId) {
  let membershipRef = /databases/$(database)/documents/networks/$(networkId)/memberships/$(auth.uid);
  return exists(membershipRef) &&
         get(membershipRef).data.roles.hasAny(["org_owner", "network_admin"]) &&
         get(membershipRef).data.allowedOrgs.hasAny([orgId]);
}
```

#### Helper: hasRole(auth, networkId, ...roles)

```javascript
function hasRole(auth, networkId, roles) {
  let membershipRef = /databases/$(database)/documents/networks/$(networkId)/memberships/$(auth.uid);
  return exists(membershipRef) &&
         get(membershipRef).data.roles.hasAny(roles);
}
```

#### Helper: isOnboardingServiceAccount(auth)

**Implementation Option A (via Custom Claims):**

```javascript
function isOnboardingServiceAccount(auth) {
  return auth.token.firebase.identities["service-account"] != null;
}
```

**Implementation Option B (via Custom Claim):**

```javascript
function isOnboardingServiceAccount(auth) {
  return auth.token.claims.serviceRole == "onboarding";
}
```

**Recommendation:** Use Option B; set custom claim `"serviceRole"="onboarding"` on the Cloud Functions service account.

#### Helper: fieldChanged(fieldName)

Helper for update rules to prevent mutation of immutable fields:

```javascript
function fieldChanged(fieldName) {
  return request.resource.data[fieldName] != resource.data[fieldName];
}
```

#### Complete Rules Example (Fully Functional)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ===== HELPERS =====
    function isNetworkMember(networkId) {
      return exists(
        /databases/$(database)/documents/networks/$(networkId)/memberships/$(request.auth.uid)
      );
    }

    function isNetworkOwner(networkId) {
      let m = get(/databases/$(database)/documents/networks/$(networkId)/memberships/$(request.auth.uid));
      return m != null && m.data.roles.hasAny(["network_owner", "network_admin"]);
    }

    function hasRole(networkId, roles) {
      let m = get(/databases/$(database)/documents/networks/$(networkId)/memberships/$(request.auth.uid));
      return m != null && m.data.roles.hasAny(roles);
    }

    function isOnboarding() {
      return request.auth.token.firebase.sign_in_provider == "service_account" ||
             request.auth.token.claims.serviceRole == "onboarding";
    }

    function fieldChanged(fieldName) {
      return request.resource.data[fieldName] != resource.data[fieldName];
    }

    // ===== RULES =====

    match /networks/{networkId} {
      allow read: if isNetworkMember(networkId);
      allow create, update, delete: if false; // backend only

      match /compliance/adminResponsibilityForm {
        allow read: if isNetworkOwner(networkId);
        allow create: if isOnboarding();
        allow update, delete: if false; // immutable
      }

      match /corporates/{corpId} {
        allow read: if isNetworkMember(networkId);
        allow create, update, delete: if false;
      }

      match /orgs/{orgId} {
        allow read: if isNetworkMember(networkId);
        allow create, update, delete: if false;
      }

      match /venues/{venueId} {
        allow read: if isNetworkMember(networkId);
        allow create, update, delete: if false;
      }

      match /memberships/{membershipId} {
        allow read: if request.auth.uid == membershipId || isNetworkOwner(networkId);
        allow create, update, delete: if false;
      }

      match /links/{linkType}/{linkId} {
        allow read: if isNetworkMember(networkId);
        allow create, update, delete: if false;
      }

      // Schedules, shifts, attendance, etc. (Block 3 rules, nested here)
      match /schedules/{scheduleId} {
        allow read, write: if
          isNetworkMember(networkId) &&
          hasRole(networkId, ["scheduler", "org_owner", "network_admin"]);
      }
    }
  }
}
```

---

## 6. Blocks 1–3 (Completed) and Beyond

### 6.1 Block Status Table (Bible v14 View)

| Block | Name                    | Scope                                               | Status (Spec v14)          | Code Tag |
| ----- | ----------------------- | --------------------------------------------------- | -------------------------- | -------- |
| 1     | Security Core           | Auth, sessions, 2FA, SLOs                           | ✅ Complete                | v1.1.0   |
| 2     | Reliability Core        | Observability, backups, CI/CD, error budgets        | ✅ Complete                | v1.1.0   |
| 3     | Integrity Core          | Zod schemas, API validation, Firestore rules        | ✅ Complete (see BLOCK3 docs) | v1.1.0   |
| 4     | UX & Scheduling Core    | Onboarding wizard, schedule builder, labor UI       | 🟡 Spec-approved, in progress | —        |
| 5     | PWA & Deployment        | PWA shell, offline, performance, rollout            | 🟡 Spec-level only         | —        |
| 6     | AI & Forecast Layer     | Forecast engine, AI assistant for scheduling        | 🟡 Spec-level only         | —        |
| 7     | Integrations & APIs     | Payroll, POS, webhooks, stable external API         | 🟡 Spec-level only         | —        |
| 8     | Compliance & Gov        | Audit logs, DLP, legal tooling, SOC2 prep           | 🟡 Spec-level only         | —        |

Blocks 4–8 represent the pre-launch runway from an internal MVP to a production SaaS.

---

## 7. Future Initiatives ("Extremities") – After Block 8

These are deliberately out of scope for initial production launch but are acknowledged here so we don't forget them or redesign ourselves into a corner.

### 7.1 Multi-Tenant Analytics Hub

- Read-only, aggregated index of sanitized metrics across Networks.
- No raw PII; only aggregated or anonymized stats.
- Access controlled either:
  - By Network-level opt-in; or
  - For internal ops only.

### 7.2 RAG / AI Training Sandbox

- All training data for internal models must be:
  - Synthetic; or
  - Fully anonymized and aggregated; or
  - Sourced from networks that explicitly grant consent.
- RAG indexes:
  - Built on docs (Bible, block specs, policies, `docs/schema-map`).
  - Kept separate from production schedule data.

### 7.3 Network Federation Connect

A future where multiple Networks can:

- Share data via signed agreements (e.g., corporate ↔ independent franchise).
- Use explicit cross-network links instead of mixing data.

Requires:

- New link types between `networkId`s.
- Strong legal contracts.
- Fine-grained controls at the field level.

### 7.4 Compliance Operations Dashboard

Dashboard for Fresh Schedules internal ops:

- Lists Networks, statuses, form completion, tax verification results.
- Flags:
  - Missing tax ID in required countries.
  - Networks with no MFA on any admin.
  - Networks that exceed plan limits.
- Drives:
  - Manual reviews.
  - Outreach or suspension flows.

---

## 8. KPIs & Definition of "Production-Ready"

### 8.1 KPIs for v14 Spec Compliance

**KPI-1: Tenant Boundary Correctness**

- 100% of new Firestore collections storing schedule-related data have a `networkId` in their path or fields and are covered by rules.

**KPI-2: Network Creation Safety**

- 0 Networks with `status="active"` exist without:
  - Completed Admin Responsibility Form
  - Verified email for network owner
  - At least one Venue and one Org membership

**KPI-3: Onboarding Completion**

- At least 90–95% of legitimate owner/manager signups complete the wizard up to the "First Schedule View" step in under 5 minutes.

**KPI-4: Liability Position Clarity**

- Every Network has:
  - `AdminResponsibilityForm` document with `liabilityAcknowledged=true`.
  - `termsAcceptedVersion` and `privacyAcceptedVersion` fields set.

### 8.2 Definition of "Production-Ready" for Fresh Schedules

Fresh Schedules is considered **production-ready** when:

1. **Blocks 1–3** are implemented and actively enforced (they already are at v1.1.0).

2. **Block 4** has:
   - Secure onboarding wizard implementing Network creation as described.
   - Basic schedule builder UX with appropriate validations.

3. **Networks:**
   - Cannot be created without Admin Responsibility Form and necessary checks.
   - Cannot be "active" without owner MFA enabled (policy-level, not just suggested).

4. **Docs:**
   - This Bible v14.0.0 is grounded in actual routes, schemas, and rule files.
   - Any intentional deviation between spec and implementation is tracked.

At that point, onboarding new customers is no longer ad-hoc. It's governed by this spec, and network creation is:

- **Secure**,
- **Legally bounded**, and
- **Understandable** to a non-technical admin.

---

**End of Project Bible v14.0.0**
