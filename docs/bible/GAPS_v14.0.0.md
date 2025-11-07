# Fresh Schedules v14.0.0 – Specification Gaps & Action Items

---

## GAP-1: Cross-Network User Scoping

**Status:** BLOCKER for multi-network support

**Current State:**
Section 3 defines Network as tenant root, but does not specify:

- Can a single user belong to multiple Networks?
- How does the client know which Network context is "active"?
- What prevents state leakage across Networks in browser/app?

**Impact:**

- Ambiguous Firestore rules
- Risk of data visibility across tenants if not explicitly scoped
- Client state management unclear

**Required Addition:**
New subsection: 2.4 "User Scoping & Multi-Network Context"

**Content to Add:**

```text
2.4 User Scoping & Multi-Network Context

Users (identified by uid) can belong to multiple Networks via memberships.

Global Scope:
  /users/{uid}
    - Profile: fullName, email, phone, etc. (shared across all networks)
    - Not network-specific

Network-Specific Scope:
  /networks/{networkId}/users/{uid}
    - Membership record
    - Roles: network_owner, network_admin, org_owner, org_manager, scheduler, staff
    - Status: active, suspended, invited

Client State (JavaScript/React/etc.):
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

Firestore Rules Update:
  match /networks/{networkId}/memberships/{membershipId} {
    allow read: if request.auth.uid == membershipId.uid;
    allow write: if false; // backend only
  }

  match /networks/{networkId}/schedules/{scheduleId} {
    allow read, write: if 
      exists(/databases/$(database)/documents/networks/$(networkId)/memberships/$(request.auth.uid))
      && getRole(networkId) in ["scheduler", "org_owner", "network_admin"];
  }

Invariant:
  If a user has activeNetworkId = "net-A", all queries must filter by networkId = "net-A".
  Never return data from net-B even if the user is a member of both.
```

**Owner:** Architecture (Emmit)

**Deadline:** Before Block 4 client code begins

---

## GAP-2: MFA Enforcement Timing & Suspension Logic

**Status:** IMPORTANT for security posture

**Current State:**
Section 4.4.3 says:
  "MFA enabled for adminUid" is required for status="active"

But does not specify:

- When is MFA checked? (at onboarding end? after activation?)
- What happens if admin disables MFA after activation?
- Is it a hard gate (blocks onboarding) or soft gate (blocks usage)?
- How is the background check implemented?

**Impact:**

- Admins may not understand why they're stuck in "pending_verification"
- No mechanism to de-activate networks if admin MFA is removed
- Unclear API behavior

**Required Addition:**
Expanded section 4.5.6 "Activation Logic & MFA Gates"

**Content to Add:**

```typescript
4.5.6 Activation Logic & MFA Gates (Detailed)

Network Status Transitions:

State Machine:

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

MFA Requirement – Hard Gate at Onboarding:

  Step 5 of onboarding (4.5.4) creates the Network in status "pending_verification".

  Immediately after creation, a Cloud Function runs:

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

  Client-Side Messaging:

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

MFA Removal After Activation (Ongoing Check):

  Background Job (runs every 6 hours):

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

  Remediation Path:

    Admin re-enables MFA → status returns to "active" (auto-check runs within 1h).

    If not re-enabled within 7 days → status → "suspended".

Onboarding UX Impact:

  At step 4 (Admin Responsibility Form), show:
    ✓ "We'll require two-factor authentication to protect your data."
    ✓ Link to MFA setup guide.

  After onboarding completes:
    If status != "active", show progress bar with blockers:
      "⏳ Setting up your workspace (2 of 4 requirements met)"
      ☐ Email verified (✓ done)
      ☐ Two-factor authentication (⏳ pending)
      ☐ Tax ID verified (⏳ pending)
      ☐ Add your first venue (☐ pending)

API Field Addition to Network Schema (Section 3.1):

  interface Network {
    // ... existing fields ...

    // Activation tracking
    status: NetworkStatus; // now more explicit
    activationBlockedBy?: string[]; // ["mfa_pending", "tax_id_pending", ...]
    nextRetryAt?: Timestamp; // when to re-check
    activatedAt?: Timestamp;
    activatedBy?: string; // "system" or uid of manual approver

    // Suspension tracking
    suspensionReason?: string;
    suspendedAt?: Timestamp;
    suspendedBy?: string;
    mfaLostAt?: Timestamp; // when admin MFA was detected as disabled
  }
```

**Owner:** Backend (Security lead)

**Deadline:** Before Block 4 activation logic implemented

---

## GAP-3: OrgVenueAssignment – Ambiguous Status vs. Dates

**Status:** IMPORTANT for data consistency

**Current State:**
Section 3.3.2 allows both:

- status: "active" | "inactive"
- startDate, endDate?: Timestamp

Problem: `{status: "active", endDate: "2024-01-01"}` is ambiguous.

**Impact:**

- Query logic must check both fields
- Risk of stale assignments left "active" past their endDate
- No clear "is this assignment in effect now?" predicate

**Required Addition:**
Clarified subsection 3.3.2 semantics + query patterns

**Content to Add:**

```typescript
3.3.2 Organization ↔ Venue (orgVenueAssignments) – CLARIFIED

Schema (updated):

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

Invariants:

  1. Status Controls Visibility:
       If status = "inactive" or "archived", this assignment is NOT used in scheduling queries.
       It is historical only.

  2. Temporal Bounds Are Data Only (Not Enforced):
       A query MUST check:
         status = "active" AND startDate <= now AND (endDate IS NULL OR now < endDate)
       The endDate field does NOT automatically deactivate an assignment.
       To deactivate, set status = "inactive".

  3. Immutable Once "inactive":
       Once status is set to "inactive", it cannot be set back to "active".
       If you need to re-activate, create a new OrgVenueAssignment.

Query Patterns:

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

Lifecycle & Deactivation:

  Phase 1: Assignment Active
    {
      status: "active",
      startDate: "2025-01-15T08:00:00Z",
      endDate: null,
      reason: "contract_signed"
    }

  Phase 2: Notice of Ending
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

  Phase 3: Archival (after retention window, e.g., 2 years)
    {
      status: "archived",
      startDate: "2025-01-15T08:00:00Z",
      endDate: "2025-06-30T17:00:00Z",
      reason: "contract_ended",
      archiveReasonedAt: "2027-06-30T17:00:00Z"
    }

Firestore Rules:

  match /networks/{networkId}/links/orgVenueAssignments/{assignmentId} {
    allow read: if isNetworkMember(request.auth, networkId);

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

**Owner:** Data Modeling (Architect)

**Deadline:** Before venues & org assignment APIs coded

---

## GAP-4: Firestore Rules – Missing Helper Function Definitions

**Status:** BLOCKING for implementation

**Current State:**
Section 5.2 references helper functions that are not defined:

- isNetworkMember(auth, networkId)
- isNetworkOwner(auth, networkId)
- isOnboardingServiceAccount(auth)
- Other role checks

**Impact:**

- Rules cannot be tested or deployed
- Unclear how to translate helpers into actual Firestore security rules syntax
- Ambiguous about custom claims vs. document queries

**Required Addition:**
New section 5.3 "Helper Function Definitions"

**Content to Add:**

```javascript
5.3 Firestore Security Rules – Helper Functions

This section defines the exact implementations of helper functions used in section 5.2.

Environment Setup:

  Custom Claims (set on auth creation via Admin SDK):
    {
      role: "network_admin" | "org_owner" | "staff" | ...,
      mfa_enabled: boolean,
      networks: [networkId, ...] // optional; allows fast check
    }

  Alternatively, if custom claims are not used:
    Query memberships collection directly (slower but more flexible).

Helper: isNetworkMember(auth, networkId)

  Implementation Option A (via Custom Claims):

    function isNetworkMember(auth, networkId) {
      return networkId in auth.token.claims.networks;
    }

  Implementation Option B (via Document Query):

    function isNetworkMember(auth, networkId) {
      return exists(
        /databases/$(database)/documents/networks/$(networkId)/memberships/$(auth.uid)
      );
    }

  Recommendation: Use Option B (document query) in v14 for clarity and auditability.

Helper: isNetworkOwner(auth, networkId)

  function isNetworkOwner(auth, networkId) {
    let membershipRef = /databases/$(database)/documents/networks/$(networkId)/memberships/$(auth.uid);
    return exists(membershipRef) &&
           get(membershipRef).data.roles.hasAny(["network_owner", "network_admin"]);
  }

Helper: isOrgOwner(auth, orgId, networkId)

  function isOrgOwner(auth, orgId, networkId) {
    let membershipRef = /databases/$(database)/documents/networks/$(networkId)/memberships/$(auth.uid);
    return exists(membershipRef) &&
           get(membershipRef).data.roles.hasAny(["org_owner", "network_admin"]) &&
           get(membershipRef).data.allowedOrgs.hasAny([orgId]);
  }

Helper: hasRole(auth, networkId, ...roles)

  function hasRole(auth, networkId, roles) {
    let membershipRef = /databases/$(database)/documents/networks/$(networkId)/memberships/$(auth.uid);
    return exists(membershipRef) &&
           get(membershipRef).data.roles.hasAny(roles);
  }

Helper: isOnboardingServiceAccount(auth)

  Implementation Option A (via Custom Claims):

    function isOnboardingServiceAccount(auth) {
      return auth.token.firebase.identities["service-account"] != null;
    }

  Implementation Option B (via Custom Claim):

    function isOnboardingServiceAccount(auth) {
      return auth.token.claims.serviceRole == "onboarding";
    }

  Recommendation: Use Option B; set custom claim "serviceRole"="onboarding" on the Cloud Functions service account.

Helper: fieldChanged(fieldName)

  Helper for update rules to prevent mutation of immutable fields:

    function fieldChanged(fieldName) {
      return request.resource.data[fieldName] != resource.data[fieldName];
    }

Complete Rules Example (Fully Functional):

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

**Owner:** Security Engineering

**Deadline:** Before rules deployment to production

---

## GAP-5: Block 4 ("UX & Scheduling Core") – Underspecified

**Status:** MAJOR – blocks product roadmap

**Current State:**
Section 6.1 lists Block 4 as:
  "Onboarding wizard, schedule builder, labor UI"

But only onboarding is detailed. "Schedule builder" and "labor UI" are vague.

**Impact:**

- Frontend team unclear on scope and routes
- No shared mental model of day-in-the-life UX
- Risks ad-hoc implementation that doesn't fit data model

**Required Addition:**
New section "Block 4 Detailed Spec" (placeholder for next Bible update)

**Content to Add:**

```text
Block 4: UX & Scheduling Core – Routes & Screens (TBD – Next Bible Update)

This section is a placeholder for the Block 4 detailed specification.
It will define all client-facing routes, screens, data flows, and validations.

Sections to be added:

4.1 Core Routes & Navigation

  /dashboard
    - Network overview: staffing levels, schedule health, alerts
    - Quick actions: new shift, view today's schedule, team messages
    
  /schedule/week
    - Week view grid: days × venues
    - Drag-drop to create/move shifts
    - Staff availability/conflicts overlay
    
  /schedule/shift/{shiftId}
    - Edit shift details: time, role, venue, pay rate
    - Assign staff: pick from available, or auto-recommend
    - Message history & notes
    
  /labor-hub
    - Staffing dashboard: open shifts, coverage %, overtime risk
    - Forecasting: what if I add X staff?
    - Budget tracking: cost-per-shift, labor cost vs. revenue
    
  /staff
    - Team directory: profile, roles, availability, documents
    - Add/remove staff: invite, on-board, archive
    
  /settings/venue/{venueId}
    - Configure venue: hours, capacity, roles, constraints
    - Staffing rules: min/max per shift, skill requirements

4.2 Data Flows (Happy Path)

  Scenario: Manager creates a shift
    1. User navigates to /schedule/week
    2. Clicks "+" on Wednesday, 5pm
    3. Form pops: role, duration, pay, venue (pre-selected)
    4. API POST /api/shifts → backend creates Shift document
    5. UI updates grid, shows empty slot
    6. User clicks "Assign" → /staff picker → selects employee
    7. API POST /api/shifts/{shiftId}/assignments
    8. Email sent to staff member (notify or accept-decline)

4.3 Validations & Constraints (TBD)

4.4 Error States & Recovery (TBD)

4.5 Performance Budgets (TBD)
```

**Owner:** Product & UX Lead

**Deadline:** Before Block 4 frontend work begins

---

## Summary & Next Steps

This document identifies **5 critical specification gaps** in Project Bible v14.0.0:

1. **GAP-1: Cross-Network User Scoping** (BLOCKER)
   - Addresses multi-network membership and client context management
   - Required for: Firestore rules, client architecture

2. **GAP-2: MFA Enforcement & Suspension Logic** (IMPORTANT)
   - Defines activation gates, background checks, and suspension flows
   - Required for: Onboarding API, compliance monitoring

3. **GAP-3: OrgVenueAssignment Semantics** (IMPORTANT)
   - Clarifies status vs. temporal bounds, lifecycle rules
   - Required for: Venue API, scheduling queries

4. **GAP-4: Firestore Rules Helpers** (BLOCKING)
   - Provides complete, testable helper function implementations
   - Required for: Rules deployment, security testing

5. **GAP-5: Block 4 UX Specification** (MAJOR)
   - Placeholder for detailed UX/route definitions
   - Required for: Frontend development planning

**Recommended Action:**

- Address GAP-1 and GAP-4 immediately (blockers for implementation)
- Draft resolutions for GAP-2 and GAP-3 within 1 week
- Schedule dedicated session for GAP-5 (Block 4 UX design)

**Cross-Reference:**

- See `docs/TODO-v14.md` for implementation task tracking
- See `docs/bible/Project_Bible_v13.5.md` (or v14 when created) for main specification
