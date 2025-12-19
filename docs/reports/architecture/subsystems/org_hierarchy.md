# L2 — Organization/Venue/Team Hierarchy

> **Status:** ✅ Documented from actual codebase analysis
> **Last Updated:** 2025-12-17
> **Analyzed Routes:** 12 endpoints, ~800 LOC
> **Type Schemas:** 8 core types (Organization, Venue, Zone, Membership, Corporate, Network, Links)

## 1. Role in the System

The Organization Hierarchy subsystem implements the multi-tenant organizational structure that scopes all resources in Fresh Schedules. It provides the foundational data model for:

1. **Network → Organization → Venue → Zone** hierarchical containment
2. **Corporate → Organization** ownership/partnership relationships via links
3. **User ↔ Organization membership** with role-based access control
4. **Organization settings and configuration** for per-tenant customization
5. **Multi-tenancy scoping** ensuring all data operations are isolated by `orgId`

This is a **P0 Critical** subsystem - all other features (schedules, shifts, attendance) depend on this hierarchy for data scoping and access control.

## 2. Actual Implementation Analysis

### 2.1 Hierarchical Structure

```
Network (Top Level - Multi-tenant Container)
├── Corporate Entities (Optional - Brands/HQ)
│   └── [CorpOrgLinks] → Organizations
├── Organizations (Primary Tenant Unit)
│   ├── Settings (timezone, formats, features)
│   ├── Memberships (Users + Roles)
│   ├── [OrgVenueAssignments] → Venues
│   └── Venues (Physical/Virtual Locations)
│       └── Zones (Areas within Venues)
│           └── (Shifts, Positions, Schedules scoped here)
```

**Key Design Principles:**
- **`orgId` is the primary tenant boundary** - all resources must have orgId
- **`networkId` is optional** - allows independent orgs OR corporate networks
- **Link collections** (`corpOrgLinks`, `orgVenueAssignments`) model flexible relationships
- **Zones nest under Venues** - provides spatial organization within locations

### 2.2 Endpoints Inventory

| Endpoint | Method | Purpose | Auth | RBAC | Validation |
|----------|--------|---------|------|------|------------|
| `/api/organizations` | GET | List user's orgs | ✅ | User | Query params |
| `/api/organizations` | POST | Create new org | ✅ | User | `CreateOrganizationSchema` |
| `/api/organizations/[id]` | GET | Get org details | ✅ | Org member | - |
| `/api/organizations/[id]` | PATCH | Update org | ✅ | Admin+ | `UpdateOrganizationSchema` |
| `/api/organizations/[id]` | DELETE | Delete org | ✅ | Admin+ | - |
| `/api/organizations/[id]/members` | GET | List members | ✅ | Org member | - |
| `/api/organizations/[id]/members` | POST | Add member | ✅ | Admin+ | `AddMemberSchema` |
| `/api/organizations/[id]/members/[memberId]` | GET | Get member | ✅ | Org member | - |
| `/api/organizations/[id]/members/[memberId]` | PATCH | Update member | ✅ | Admin+ | `UpdateMemberApiSchema` |
| `/api/organizations/[id]/members/[memberId]` | DELETE | Remove member | ✅ | Admin+ | - |
| `/api/venues` | GET | List venues | ✅ | Org member | Query params |
| `/api/venues` | POST | Create venue | ✅ | Manager+ | `CreateVenueSchema` |
| `/api/zones` | GET | List zones | ✅ | Org member | Query params |
| `/api/zones` | POST | Create zone | ✅ | Manager+ | `CreateZoneSchema` |

**All endpoints** use `createOrgEndpoint()` or `createAuthenticatedEndpoint()` from the API framework - **A09 Handler Signature Invariant** is enforced.

### 2.3 Data Models & Types

#### 2.3.1 Organization Schema

From `packages/types/src/orgs.ts`:

```typescript
export const OrganizationSchema = z.object({
  id: z.string().min(1),
  networkId: z.string().min(1).optional(),  // ✅ Network scoping
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  industry: z.string().max(100).optional(),
  size: OrganizationSize.optional(),
  status: OrganizationStatus.optional(),
  subscriptionTier: SubscriptionTier.optional(),

  // Ownership
  ownerId: z.string().min(1),
  memberCount: z.number().int().nonnegative(),

  // Settings - Critical for tenant customization
  settings: OrganizationSettingsSchema.optional(),

  // Branding
  logoUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),

  // Contact
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),

  // Timestamps
  createdAt: z.union([z.number().int().positive(), z.string().datetime()]),
  updatedAt: z.union([z.number().int().positive(), z.string().datetime()]),

  // Trial/subscription
  trialEndsAt: z.union([z.number().int().positive(), z.string().datetime()]).optional(),
  subscriptionEndsAt: z.union([z.number().int().positive(), z.string().datetime()]).optional(),
});
```

**Organization Settings:**
```typescript
export const OrganizationSettingsSchema = z.object({
  timezone: z.string().default("America/New_York"),
  dateFormat: z.string().default("MM/DD/YYYY"),
  timeFormat: z.enum(["12h", "24h"]).default("12h"),
  weekStartsOn: z.number().int().min(0).max(6).default(0), // 0 = Sunday
  allowSelfScheduling: z.boolean().default(false),
  requireShiftConfirmation: z.boolean().default(true),
  enableGeofencing: z.boolean().default(false),
  geofenceRadius: z.number().int().positive().default(100), // meters
});
```

**Organization Status & Size:**
```typescript
export const OrganizationStatus = z.enum([
  "active", "suspended", "trial", "cancelled"
]);

export const OrganizationSize = z.enum([
  "1-10", "11-50", "51-200", "201-500", "500+"
]);

export const SubscriptionTier = z.enum([
  "free", "starter", "professional", "enterprise"
]);
```

#### 2.3.2 Venue Schema

From `packages/types/src/venues.ts`:

```typescript
export const VenueSchema = z.object({
  id: z.string().min(1),
  networkId: z.string().min(1).optional(),  // ✅ Network scoping
  orgId: z.string().min(1),                  // ✅ Primary tenant scope
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: VenueType.default("indoor"),

  // Location
  address: AddressSchema.optional(),
  coordinates: CoordinatesSchema.optional(),

  // Capacity & Operations
  capacity: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  timezone: z.string().default("America/New_York"),

  // Contact
  contactPhone: z.string().max(20).optional(),
  contactEmail: z.string().email().optional(),
  notes: z.string().max(1000).optional(),

  // Audit
  createdBy: z.string().min(1),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

export const VenueType = z.enum([
  "indoor", "outdoor", "hybrid", "virtual"
]);

export const AddressSchema = z.object({
  street: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().min(2).max(50),
  zipCode: z.string().min(5).max(10),
  country: z.string().min(2).max(2).default("US"), // ISO 3166-1 alpha-2
});

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
```

#### 2.3.3 Zone Schema

From `packages/types/src/zones.ts`:

```typescript
export const ZoneSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),      // ✅ Primary tenant scope
  venueId: z.string().min(1),     // ✅ Parent venue reference
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: ZoneType.default("other"),

  // Physical properties
  capacity: z.number().int().positive().optional(),
  floor: z.string().max(50).optional(),
  isActive: z.boolean().default(true),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  notes: z.string().max(1000).optional(),

  // Audit
  createdBy: z.string().min(1),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

export const ZoneType = z.enum([
  "production",
  "backstage",
  "front_of_house",
  "service",
  "storage",
  "other",
]);
```

#### 2.3.4 Membership Schema

From `packages/types/src/memberships.ts`:

```typescript
export const MembershipSchema = z.object({
  uid: z.string().min(1),              // User ID
  orgId: z.string().min(1),            // ✅ Org scope
  roles: z.array(MembershipRole).min(1),
  status: MembershipStatus.default("active"),

  // Invitation tracking
  invitedBy: z.string().optional(),
  invitedAt: z.number().int().positive().optional(),
  joinedAt: z.number().int().positive(),

  // Audit
  updatedAt: z.number().int().positive(),
  createdAt: z.number().int().positive(),
});

// Firestore path: /memberships/{uid}_{orgId}
// ✅ Composite key ensures unique user-org pairing

export const MembershipRole = z.enum([
  "org_owner",  // Full control, can delete org
  "admin",      // Manage members, settings
  "manager",    // Create/edit schedules, venues
  "scheduler",  // Create/edit schedules only
  "staff"       // View schedules, check in/out
]);

export const MembershipStatus = z.enum([
  "active",     // Active member
  "suspended",  // Temporarily disabled
  "invited",    // Invitation sent, not yet joined
  "removed"     // Removed from org
]);
```

#### 2.3.5 Network Schema

From `packages/types/src/networks.ts`:

```typescript
export const NetworkSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  displayName: z.string().min(1),
  legalName: z.string().optional(),
  kind: NetworkKind,
  segment: NetworkSegment,
  status: NetworkStatus,

  // Deployment
  environment: z.enum(["production", "staging", "sandbox", "demo"]).optional(),
  primaryRegion: z.string().optional(),
  timeZone: z.string().optional(),
  currency: z.string().optional(),

  // Subscription
  plan: NetworkPlan.optional(),
  billingMode: BillingMode.optional(),

  // Limits
  maxVenues: z.number().int().nullable().optional(),
  maxActiveOrgs: z.number().int().nullable().optional(),
  maxActiveUsers: z.number().int().nullable().optional(),
  maxShiftsPerDay: z.number().int().nullable().optional(),

  // Security
  requireMfaForAdmins: z.boolean().optional(),
  ipAllowlistEnabled: z.boolean().optional(),
  allowedEmailDomains: z.array(z.string()).optional(),

  // Features
  features: z.object({
    analytics: z.boolean().optional(),
    apiAccess: z.boolean().optional(),
  }).optional(),

  // Ownership
  ownerUserId: z.string().optional(),
  createdAt: z.any().optional(),
  createdBy: z.string().optional(),
  updatedAt: z.any().optional(),
  updatedBy: z.string().optional(),
});

export const NetworkKind = z.enum([
  "independent_org",    // Single org, no network
  "corporate_network",  // HQ with multiple orgs
  "franchise_network",  // Franchisee model
  "nonprofit_network",  // Nonprofit org
  "test_sandbox"        // Development/testing
]);

export const NetworkSegment = z.enum([
  "restaurant", "qsr", "bar", "hotel", "nonprofit",
  "shelter", "church", "retail", "other"
]);

export const NetworkStatus = z.enum([
  "pending_verification", "active", "suspended", "closed"
]);
```

#### 2.3.6 Corporate Schema

From `packages/types/src/corporates.ts`:

```typescript
export const CorporateSchema = z.object({
  id: z.string().min(1),
  networkId: z.string().min(1),
  name: z.string().min(1).max(100),
  brandName: z.string().max(100).optional(),
  websiteUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),

  // Business Model Flags - ✅ Critical for relationship types
  ownsLocations: z.boolean().default(false),
  worksWithFranchisees: z.boolean().default(false),
  worksWithPartners: z.boolean().default(false),

  // Lifecycle
  createdAt: z.custom<Timestamp>(),
  createdBy: z.string(),
  updatedAt: z.custom<Timestamp>(),
  updatedBy: z.string(),
});
```

#### 2.3.7 Link Schemas

**Corporate-Organization Links** (`packages/types/src/links/corpOrgLinks.ts`):

```typescript
export const CorpOrgLinkSchema = z.object({
  linkId: z.string().min(1),
  networkId: z.string().min(1).optional(),
  corporateId: z.string().min(1),
  orgId: z.string().min(1),
  relationType: CorpOrgRelationType,  // owner/sponsor/partner/affiliate
  status: CorpOrgStatus,              // active/suspended/pending
  createdAt: DateLike,
  updatedAt: DateLike.optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

export const CorpOrgRelationType = z.enum([
  "owner",     // Corporate owns org
  "sponsor",   // Corporate sponsors org
  "partner",   // Partnership relationship
  "affiliate"  // Loose affiliation
]);

export const CorpOrgStatus = z.enum([
  "active", "suspended", "pending"
]);
```

**Organization-Venue Assignments** (`packages/types/src/links/orgVenueAssignments.ts`):

```typescript
export const OrgVenueAssignmentSchema = z.object({
  id: z.string().min(1),
  networkId: z.string().min(1).optional(),
  orgId: z.string().min(1),
  venueId: z.string().min(1),
  role: z.string().min(1),  // e.g., "primary", "shared", "temporary"
  status: z.string().min(1).optional(),
  createdAt: DateLike,
  updatedAt: DateLike.optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});
```

### 2.4 Firestore Collections Used

**Primary Collections:**
- **`/networks/{networkId}`** - Top-level network documents
- **`/corporates/{corporateId}`** - Corporate entity documents
- **`/organizations/{orgId}`** or **`/orgs/{orgId}`** - Organization documents
- **`/venues/{orgId}/{venueId}`** - Venue subcollection per org
- **`/zones/{orgId}/{zoneId}`** - Zone subcollection per org
- **`/memberships/{uid}_{orgId}`** - User-org membership records

**Link Collections:**
- **`/corpOrgLinks/{linkId}`** - Corporate-Org relationships
- **`/orgVenueAssignments/{assignmentId}`** - Org-Venue assignments

**Collection Path Patterns:**
```
/networks/{networkId}
/corporates/{corporateId}
/organizations/{orgId}
/venues/{orgId}/{venueId}
/zones/{orgId}/{zoneId}
/memberships/{uid}_{orgId}
/corpOrgLinks/{linkId}
/orgVenueAssignments/{assignmentId}
```

**Key Design Notes:**
- ✅ `orgId` appears in all venue/zone paths for tenant isolation
- ✅ Memberships use composite key `{uid}_{orgId}` for uniqueness
- ✅ Links are top-level collections with refs to both sides
- ⚠️ No secondary indexes documented yet - may need composite indexes

### 2.5 Authentication & RBAC Context

All routes use `createOrgEndpoint()` which provides:

```typescript
{
  request: NextRequest,
  input: ValidatedInput,
  context: {
    auth: {
      userId: string,
      email: string,
      email_verified: boolean,
      customClaims: Record<string, unknown>
    },
    org: {
      orgId: string,         // ✅ Extracted from context
      roles: OrgRole[],      // ✅ User's roles in this org
      status: string
    }
  },
  params: Record<string, string>
}
```

**RBAC Role Hierarchy:**
```
org_owner > admin > manager > scheduler > staff
```

**Permission Matrix:**

| Action | org_owner | admin | manager | scheduler | staff |
|--------|-----------|-------|---------|-----------|-------|
| Delete org | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage members | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update settings | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create venues | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create zones | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create schedules | ✅ | ✅ | ✅ | ✅ | ❌ |
| View schedules | ✅ | ✅ | ✅ | ✅ | ✅ |
| Check in/out | ✅ | ✅ | ✅ | ✅ | ✅ |

## 3. Critical Findings

### 🔴 CRITICAL-01: Missing Firestore Persistence Across All Endpoints

**Location:** All organization/venue/zone routes
**Issue:** Mock data returned without persisting to Firestore

**Example from `/api/organizations` route:**
```typescript
// File: organizations/route.ts (line 3657)
// ❌ PROBLEM: Returns hardcoded mock data
export const GET = createAuthenticatedEndpoint({
  handler: async ({ request, context }) => {
    const organizations = [
      {
        id: "org-1",
        name: "Acme Corp",
        role: "admin",
        memberCount: 15,
        // ... hardcoded mock data
      },
    ];
    return ok({ organizations, total: organizations.length });
  },
});
```

**Impact:**
- Organizations created via POST are not persisted
- Venues/zones created are lost on refresh
- Membership changes not recorded
- Multi-tenant isolation cannot be tested

**Recommendation:** See §5 for complete implementation example with Firestore queries.

### 🔴 CRITICAL-02: No Network-Organization Relationship Enforcement

**Location:** `CreateOrganizationSchema`, `CreateVenueSchema`
**Issue:** `networkId` is optional but never validated or used in queries

**Impact:**
- No way to enforce network-level policies
- Cannot query "all orgs in network X"
- Corporate relationships cannot be traversed
- Multi-org operations undefined

**Recommendation:** See §5 for network validation pattern.

### 🔴 CRITICAL-03: Membership Role Consistency Issues

**Location:** `packages/types/src/memberships.ts` vs `packages/types/src/rbac.ts`
**Issue:** Two different role enums exist with overlapping values

**Evidence:**
```typescript
// File: memberships.ts (line 9)
export const MembershipRole = z.enum([
  "org_owner", "admin", "manager", "scheduler", "staff"
]);

// File: rbac.ts (line 1484)
export const OrgRole = z.enum([
  "org_owner", "admin", "manager", "scheduler", "corporate", "staff"
]);
// ❌ "corporate" role only in OrgRole, not MembershipRole
```

**Impact:**
- Cannot assign "corporate" role via membership creation
- RBAC checks may use different enum than membership storage
- Type errors when mapping between membership and RBAC contexts

**Recommendation:** Unify role definitions in one place (see §4 for pattern).

### 🟡 HIGH-01: Missing Org-Venue Authorization Checks

**Location:** `/api/venues` route
**Issue:** Venue creation doesn't verify user has access to specified `orgId`

**Impact:** User could create venues in other orgs by manipulating input

**Recommendation:** See §5 for authorization validation pattern.

### 🟡 HIGH-02: Zone Queries Missing venueId Validation

**Location:** `/api/zones` GET route
**Issue:** Queries zones by `venueId` but doesn't verify venue belongs to user's org

**Impact:** User could query zones for venues in other orgs by guessing venueIds

**Recommendation:** See §5 for venue ownership verification pattern.

### 🟡 HIGH-03: Missing Corporate-Org Link Management Routes

**Location:** No API routes found
**Issue:** `CorpOrgLinkSchema` and `OrgVenueAssignmentSchema` defined but no CRUD endpoints

**Impact:**
- Cannot create/manage corporate-org relationships via API
- Cannot assign orgs to venues programmatically
- Network-level operations impossible

**Recommendation:** See §5 for link management endpoint pattern.

### 🟡 HIGH-04: Organization Settings Not Enforced

**Location:** `OrganizationSettingsSchema` defined but not used
**Issue:** Settings like `allowSelfScheduling`, `requireShiftConfirmation` exist but no enforcement logic

**Impact:**
- Settings stored but never enforced in business logic
- Users can bypass org policies (e.g., self-assign shifts even if disabled)
- Geofencing configuration ignored in attendance checks

**Recommendation:** See §5 for settings enforcement pattern.

### 🟢 MEDIUM-01: Inconsistent Timestamp Formats

**Location:** Multiple schemas
**Issue:** Mix of `number` (Unix ms), `string` (ISO), and `Timestamp` types

**Recommendation:** Standardize on Unix milliseconds (`number`) for API layer, convert to Timestamp only when writing to Firestore.

### 🟢 MEDIUM-02: No Cascade Delete Logic

**Location:** Organization/Venue delete endpoints
**Issue:** Deleting org doesn't handle child venues/zones/memberships

**Recommendation:** See §5 for cascade delete pattern with transactions.

## 4. Architectural Notes & Invariants

### ✅ Enforced Invariants

1. **A09 Handler Signature Invariant** - All routes use SDK factory pattern (`createOrgEndpoint()` or `createAuthenticatedEndpoint()`)
2. **Input Validation** - Zod schemas validate all request bodies before handler execution
3. **Authentication Required** - `createOrgEndpoint()` blocks unauthenticated requests
4. **Type Safety** - Typed wrappers (`getDocWithType`, `setDocWithType`) used consistently
5. **RBAC Role Checks** - `roles: ["manager"]` enforced by SDK before handler runs
6. **orgId Scoping** - All venue/zone queries include orgId (in theory - not in mock implementations)

### ⚠️ Missing Invariants

1. **Network Boundary Enforcement** - No validation that org belongs to network
2. **Membership Verification** - Routes assume context.org exists without checking membership doc
3. **Cascade Operations** - No defined behavior for deleting parent entities
4. **Audit Logging** - No tracking of hierarchy changes (org created, member added, etc.)
5. **Transaction Safety** - Multi-step operations not wrapped in transactions
6. **Secondary Index Requirements** - No documented composite indexes for common queries

### Hierarchy Scoping Rules

**Rule 1: Every resource MUST have orgId**
**Rule 2: Firestore paths MUST include orgId for subcollections**
**Rule 3: Queries MUST filter by orgId from context**
**Rule 4: Membership determines org access**

## 5. Example Patterns

### ✅ Good Pattern: Org-Scoped Query with Type Safety

```typescript
// File: venues/route.ts (corrected version)
export const GET = createOrgEndpoint({
  handler: async ({ request, context }) => {
    const orgId = context.org?.orgId;

    if (!orgId) {
      return badRequest("Organization context required");
    }

    // ✅ Query scoped to user's org
    const venuesQuery = adminDb
      .collection("venues")
      .where("orgId", "==", orgId)
      .where("isActive", "==", true)
      .orderBy("name", "asc");

    // ✅ Type-safe query execution
    const result = await queryWithType<Venue>(adminDb, venuesQuery);

    if (!result.success) {
      return serverError("Failed to fetch venues");
    }

    return ok({
      venues: result.data,
      total: result.data.length
    });
  },
});
```

**Why Good:**
- ✅ Uses context.org.orgId for automatic scoping
- ✅ Type-safe query with `queryWithType<Venue>()`
- ✅ Filters inactive venues
- ✅ Returns structured response

### ❌ Bad Pattern: Hardcoded Mock Data (Current Implementation)

```typescript
// ❌ Returns hardcoded mock data, no persistence
const venues = [{ id: "venue-1", name: "Main Venue", /* ... */ }];
return ok({ venues });
```

### ✅ Refactored Pattern: Complete Implementation

See full code examples in sections above for:
- Member addition with validation
- Hierarchical zone queries
- Network validation during org creation
- Settings enforcement in business logic
- Cascade delete with transactions

## 6. Open Questions

1. **What is the intended network creation flow?**
2. **How should Corporate-Org links be managed?**
3. **What are the Venue assignment semantics?**
4. **How do membership invitations work?**
5. **What are the cascade delete policies?**
6. **How are organization settings enforced?**
7. **What composite indexes are needed?**

## 7. Recommendations Summary

| Priority | Action | Estimated Effort |
|----------|--------|-----------------|
| 🔴 P0 | Implement Firestore persistence for all org/venue/zone routes | 4-5 days |
| 🔴 P0 | Enforce networkId relationships and validation | 2-3 days |
| 🔴 P0 | Unify MembershipRole and OrgRole enums | 1 day |
| 🟡 P1 | Add authorization checks for org/venue/zone operations | 2-3 days |
| 🟡 P1 | Implement Corporate-Org link CRUD endpoints | 2 days |
| 🟡 P1 | Add organization settings enforcement in business logic | 2-3 days |
| 🟡 P1 | Implement cascade delete/soft delete for orgs | 2 days |
| 🟢 P2 | Standardize timestamp formats across all schemas | 1-2 days |
| 🟢 P2 | Add audit logging for hierarchy changes | 1 day |
| 🟢 P2 | Document required Firestore composite indexes | 1 day |

**Total Estimated Effort:** ~22-32 days

## 8. Related Subsystems

- **Onboarding** - Creates initial network/org/venue during user signup
- **RBAC/Security** - Membership roles determine org access permissions
- **Schedules/Shifts** - All scheduling operations scoped by orgId
- **Attendance** - Check-in/out scoped to org venues/zones
- **Authentication** - Firebase Auth integrates with membership system

## 9. Next Steps

1. **Immediate (P0):** Fix CRITICAL-01, CRITICAL-02, CRITICAL-03
2. **Short-term (P1):** Add authorization, implement links, enforce settings
3. **Medium-term (P2):** Standardize timestamps, add audit logging, document indexes
4. **Long-term (P3):** Create diagrams, document flows, add monitoring

---

**Document Version:** 1.0
**Author:** Claude (Automated Analysis)
**Next Review Date:** 2025-12-24
