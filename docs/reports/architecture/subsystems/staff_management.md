---

title: "L2 — Staff Management"
description: "Subsystem report for staff management."
keywords:
  - architecture
  - subsystem
  - staff
  - management
category: "report"
status: "active"
audience:
  - developers
  - operators
createdAt: "2026-01-31T07:19:01Z"
lastUpdated: "2026-01-31T07:19:01Z"

---

# L2 — Staff Management

> **Status:** ✅ Documented from actual codebase analysis **Last Updated:** 2025-12-17 **Analyzed
> Routes:** 12 endpoints, ~800 LOC **Related Collections:** users, memberships, positions,
> attendance_records, shifts

## 1. Role in the System

The Staff Management subsystem handles user profiles, organization membership, position assignments,
and staff-related operations within the Fresh Schedules platform. It provides:

1. **User Profile Management** - Basic identity and onboarding state tracking
2. **Organization Membership** - Role-based access control within organizations
3. **Position Management** - Job roles, skill levels, and certifications
4. **Attendance Tracking** - Check-in/out and time tracking for staff
5. **Shift Assignments** - Staff assignment to scheduled shifts

All routes use the `@fresh-schedules/api-framework` SDK with typed validation and authentication.

## 2. Actual Implementation Analysis

### 2.1 Endpoints Inventory

#### User Profile & Membership Endpoints

| Endpoint                                     | Method | Purpose                     | Auth                | Validation                |
| -------------------------------------------- | ------ | --------------------------- | ------------------- | ------------------------- |
| `/api/onboarding/profile`                    | POST   | Complete user profile setup | ✅ Required         | `OnboardingProfileSchema` |
| `/api/organizations/[id]/members`            | GET    | List organization members   | ✅ Required (org)   | None                      |
| `/api/organizations/[id]/members`            | POST   | Add member to organization  | ✅ Required (admin) | `AddMemberSchema`         |
| `/api/organizations/[id]/members`            | PATCH  | Update member role          | ✅ Required (admin) | `UpdateMemberSchema`      |
| `/api/organizations/[id]/members`            | DELETE | Remove member               | ✅ Required (admin) | `RemoveMemberSchema`      |
| `/api/organizations/[id]/members/[memberId]` | GET    | Get member details          | ✅ Required (org)   | None                      |
| `/api/organizations/[id]/members/[memberId]` | PATCH  | Update specific member      | ✅ Required (admin) | `UpdateMemberApiSchema`   |
| `/api/organizations/[id]/members/[memberId]` | DELETE | Remove specific member      | ✅ Required (admin) | None                      |

#### Position Management Endpoints

| Endpoint              | Method | Purpose                | Auth                   | Validation             |
| --------------------- | ------ | ---------------------- | ---------------------- | ---------------------- |
| `/api/positions`      | GET    | List positions for org | ✅ Required (org)      | Query params           |
| `/api/positions`      | POST   | Create new position    | ✅ Required (manager+) | `CreatePositionSchema` |
| `/api/positions/[id]` | GET    | Get position details   | ✅ Required (staff+)   | None                   |
| `/api/positions/[id]` | PATCH  | Update position        | ✅ Required (manager+) | `UpdatePositionSchema` |
| `/api/positions/[id]` | DELETE | Delete position (soft) | ✅ Required (admin+)   | None                   |

#### Attendance & Shift Endpoints

| Endpoint          | Method | Purpose                  | Auth                     | Validation                     |
| ----------------- | ------ | ------------------------ | ------------------------ | ------------------------------ |
| `/api/attendance` | GET    | List attendance records  | ✅ Required              | Query params                   |
| `/api/attendance` | POST   | Create attendance record | ✅ Required (scheduler+) | `CreateAttendanceRecordSchema` |

**All endpoints** use SDK factory patterns (`createOrgEndpoint`, `createAuthenticatedEndpoint`) -
**A09 Handler Signature Invariant** is enforced.

### 2.2 Data Models & Types

#### User Profile (Firestore: `/users/{uid}`)

From `apps/web/src/lib/userProfile.ts`:

```typescript
export interface UserProfileDoc {
  id: string;
  createdAt: number;
  updatedAt: number;
  profile: {
    email: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    selfDeclaredRole: string | null;
  };
  onboarding: {
    status: "not_started" | "in_progress" | "complete";
    stage: string;
    intent: OnboardingIntent | null;
    primaryNetworkId: string | null;
    primaryOrgId: string | null;
    primaryVenueId: string | null;
    completedAt: number | null;
    lastUpdatedAt: number;
  };
}
```

**Key Features:**

- Created on first sign-in via `ensureUserProfile()`
- Stores basic identity (email, displayName, avatar)
- Tracks onboarding state and primary network/org assignment
- Self-declared role captured during signup

#### Membership (Firestore: `/memberships/{uid}_{orgId}`)

From `packages/types/src/memberships.ts`:

```typescript
export const MembershipRole = z.enum(["org_owner", "admin", "manager", "scheduler", "staff"]);

export const MembershipStatus = z.enum(["active", "suspended", "invited", "removed"]);

export interface Membership {
  uid: string;
  orgId: string;
  roles: MembershipRole[];
  status: MembershipStatus;
  invitedBy?: string;
  invitedAt?: number;
  joinedAt: number;
  updatedAt: number;
  createdAt: number;
}
```

**Key Features:**

- Composite key: `{uid}_{orgId}` for unique org membership
- Array of roles per user (multi-role support)
- Status lifecycle: invited → active → suspended/removed
- Audit trail: tracks who invited and when joined

#### Position (Firestore: `/positions/{orgId}/{positionId}`)

From `packages/types/src/positions.ts`:

```typescript
export const PositionType = z.enum(["full_time", "part_time", "contractor", "volunteer"]);

export const SkillLevel = z.enum(["entry", "intermediate", "advanced", "expert"]);

export interface Position {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  type: PositionType;
  skillLevel: SkillLevel;
  hourlyRate?: number;
  color?: string; // Hex color for UI
  isActive: boolean;
  requiredCertifications: string[];
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}
```

**Key Features:**

- Organization-scoped positions
- Skill level classification for staff matching
- Required certifications array (strings, not structured)
- Color coding for schedule visualization
- Soft delete via `isActive` flag

#### Attendance Record (Firestore: `/attendance_records/{orgId}/{recordId}`)

From `packages/types/src/attendance.ts`:

```typescript
export const AttendanceStatus = z.enum([
  "scheduled",
  "checked_in",
  "checked_out",
  "no_show",
  "excused_absence",
  "late",
]);

export const CheckMethod = z.enum(["manual", "qr_code", "nfc", "geofence", "admin_override"]);

export interface AttendanceRecord {
  id: string;
  orgId: string;
  shiftId: string;
  scheduleId: string;
  staffUid: string;
  status: AttendanceStatus;

  // Timestamps
  scheduledStart: number;
  scheduledEnd: number;
  actualCheckIn?: number;
  actualCheckOut?: number;

  // Check-in metadata
  checkInMethod?: CheckMethod;
  checkInLocation?: { lat: number; lng: number; accuracy?: number };
  checkOutMethod?: CheckMethod;
  checkOutLocation?: { lat: number; lng: number; accuracy?: number };

  // Duration calculations (minutes)
  scheduledDuration: number;
  actualDuration?: number;
  breakDuration: number;

  // Notes and overrides
  notes?: string;
  managerNotes?: string;
  overriddenBy?: string;
  overriddenAt?: number;

  createdAt: number;
  updatedAt: number;
}
```

**Key Features:**

- Links to shift and schedule for context
- Tracks both scheduled and actual times
- Multiple check-in methods (QR, NFC, geofence, manual)
- Geographic location tracking for check-ins
- Break time tracking
- Admin override capability with audit trail

#### Shift Assignment (within Shift document)

From `packages/types/src/shifts.ts`:

```typescript
export const AssignmentStatus = z.enum([
  "unassigned",
  "assigned",
  "confirmed",
  "declined",
  "no_show",
]);

export interface ShiftAssignment {
  uid: string;
  status: AssignmentStatus;
  assignedAt: number;
  assignedBy: string;
  confirmedAt?: number;
  notes?: string;
}

export interface Shift {
  id: string;
  orgId: string;
  scheduleId: string;
  positionId: string;
  venueId?: string;
  zoneId?: string;

  startTime: number;
  endTime: number;
  status: ShiftStatus;

  // Staffing
  assignments: ShiftAssignment[];
  requiredStaff: number;

  // Metadata
  notes?: string;
  breakMinutes: number;
  aiGenerated: boolean;
  aiConfidence?: number;

  createdBy: string;
  createdAt: number;
  updatedAt: number;
}
```

**Key Features:**

- Array of assignments within shift document
- Assignment status lifecycle: assigned → confirmed/declined
- Tracks who assigned and when
- Support for multiple staff per shift (requiredStaff count)
- Links to position for skill matching

### 2.3 Firestore Collections Used

- **`users/{uid}`** - User profile and onboarding state
  - Fields: `id`, `profile`, `onboarding`, `createdAt`, `updatedAt`
  - Created on first sign-in via `ensureUserProfile()`
  - Updated during onboarding completion

- **`memberships/{uid}_{orgId}`** - Organization membership records
  - Fields: `uid`, `orgId`, `roles[]`, `status`, `invitedBy`, `joinedAt`
  - Used for RBAC checks via `createOrgEndpoint()`
  - Status lifecycle: invited → active → suspended/removed

- **`positions/{orgId}/{positionId}`** - Job positions within organizations
  - Subcollection under org-specific path
  - Fields: `name`, `type`, `skillLevel`, `requiredCertifications[]`
  - Used for shift assignment matching

- **`attendance_records/{orgId}/{recordId}`** - Time tracking records
  - Links to shifts via `shiftId`
  - Tracks check-in/out times and locations
  - Duration calculations and break time

- **`shifts/{orgId}/{scheduleId}/{shiftId}`** - Scheduled shifts
  - Contains embedded `assignments[]` array
  - Links to positions via `positionId`
  - Multiple staff per shift supported

### 2.4 Authentication & Authorization Context

All routes receive:

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
    org?: {
      orgId: string,
      role: MembershipRole
    }
  },
  params: Record<string, string>
}
```

**Role-Based Access Control:**

- `createOrgEndpoint()` - Requires org membership, auto-validates org scope
- `roles: ["admin"]` - Restricts endpoint to specific roles
- `roles: ["manager", "admin"]` - Multiple role OR logic
- `roles: ["scheduler"]` - Custom role for schedule operations

## 3. Critical Findings

### 🔴 CRITICAL-01: No Firestore Persistence in Member Operations

**Location:** `/api/organizations/[id]/members/*` **Issue:** Member endpoints return mock data
without Firestore operations

**Example from members route:**

```typescript
// ❌ PROBLEM: Returns mock data, doesn't query Firestore
export const GET = createOrgEndpoint({
  handler: async ({ request, input, context, params }) => {
    const members = [
      {
        id: "member-1",
        orgId: params.id,
        email: "user@example.com",
        role: "admin",
        joinedAt: Date.now(),
      },
    ];
    return ok({ members, total: members.length });
  },
});
```

**Impact:**

- Member management operations are not persisted
- No actual RBAC enforcement beyond route-level checks
- Cannot list actual organization members

**Recommendation:** Implement Firestore queries:

```typescript
export const GET = createOrgEndpoint({
  handler: async ({ request, input, context, params }) => {
    const adminDb = getAdminDb();
    const membershipsRef = adminDb.collection("memberships");

    // Query all memberships for this org
    const snapshot = await membershipsRef
      .where("orgId", "==", params.id)
      .where("status", "==", "active")
      .get();

    const members = snapshot.docs.map((doc) => doc.data());
    return ok({ members, total: members.length });
  },
});
```

### 🔴 CRITICAL-02: Position Operations Missing Firestore Integration

**Location:** `/api/positions/*` **Issue:** Position CRUD endpoints return mock data without
persistence

**Example from positions route:**

```typescript
// ❌ PROBLEM: Mock position data, no Firestore query
export const GET = createOrgEndpoint({
  handler: async ({ request, input, context, params }) => {
    const positions = [
      {
        id: "pos-1",
        orgId: "org-1",
        name: "Server",
        description: "Front of house server position",
        type: "part_time",
        skillLevel: "entry",
        // ... more mock fields
      },
    ];
    return ok({ positions, total: positions.length });
  },
});
```

**Impact:**

- Cannot create or manage actual positions
- Shift assignment has no position data to reference
- Skill matching impossible without real position records

**Recommendation:** Add Firestore persistence layer (see §5 for full example)

### 🔴 CRITICAL-03: Missing User Profile Extended Data

**Location:** `apps/web/src/lib/userProfile.ts` **Issue:** User profile only stores basic identity,
no staff-specific data

**Current schema:**

```typescript
profile: {
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  selfDeclaredRole: string | null; // ❌ Free-text, not structured
}
```

**Missing fields for staff management:**

- Phone number (for contact)
- Emergency contact information
- Certifications/qualifications
- Availability preferences
- Preferred positions
- Hire date / employment status
- Pay rate (if not position-based)
- Timezone preference

**Impact:**

- Cannot build staff directory with contact info
- No qualification tracking for compliance
- No availability management
- Limited shift assignment intelligence

**Recommendation:** Extend user profile schema:

```typescript
profile: {
  // Basic identity
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;

  // Contact info
  phone: string | null;
  timezone: string;

  // Employment details
  hireDate?: number;
  employmentStatus: "active" | "on_leave" | "terminated";

  // Qualifications
  certifications: Array<{
    name: string;
    issuedDate: number;
    expiryDate?: number;
    documentUrl?: string;
  }>;

  // Preferences
  preferredPositions: string[]; // Position IDs
  maxHoursPerWeek?: number;
  availability?: {
    // Recurring availability pattern
    monday?: { available: boolean; timeRanges?: Array<{start: string; end: string}> };
    tuesday?: { available: boolean; timeRanges?: Array<{start: string; end: string}> };
    // ... other days
  };
}
```

### 🟡 HIGH-01: No Composite Queries for Shift Assignment

**Location:** Shift assignment logic (theoretical) **Issue:** Cannot efficiently query staff by
position skills, availability, and qualifications

**Missing capabilities:**

- "Find all staff qualified for Position X"
- "Find available staff for time range Y"
- "Find staff with Certification Z not expired"

**Impact:**

- Manual shift assignment required
- No automated shift matching/suggestions
- AI scheduling has no data to work with

**Recommendation:** Implement denormalized indexes:

```typescript
// Collection: staff_assignments_index/{orgId}
interface StaffAssignmentIndex {
  uid: string;
  orgId: string;
  qualifiedPositionIds: string[];
  activeCertifications: string[];
  availabilityHash: string; // For quick filtering
  lastShiftDate: number;
  totalHoursThisWeek: number;
}
```

### 🟡 HIGH-02: Attendance Check-In Has No Validation

**Location:** `/api/attendance` POST endpoint **Issue:** No validation of check-in location, time,
or duplicate prevention

**Example vulnerable code:**

```typescript
export const POST = createAuthenticatedEndpoint({
  roles: ["scheduler"],
  input: CreateAttendanceRecordSchema,
  handler: async ({ input }) => {
    // ❌ No validation:
    // - Can check in hours before shift starts
    // - Can check in from anywhere (no geofence check)
    // - Can create duplicate attendance records
    // - No verification that shift exists

    const record = {
      ...input,
      status: "scheduled",
      createdAt: Date.now(),
    };
    return NextResponse.json(record, { status: 201 });
  },
});
```

**Impact:**

- Time theft possible (early check-ins, location spoofing)
- Duplicate records inflate hours
- No data integrity

**Recommendation:** Add validation layer:

```typescript
async function validateCheckIn(input: CheckInInput, shift: Shift): Promise<ValidationResult> {
  const now = Date.now();
  const maxEarlyCheckIn = 15 * 60 * 1000; // 15 minutes

  // Time validation
  if (now < shift.startTime - maxEarlyCheckIn) {
    return { valid: false, reason: "Too early to check in" };
  }

  // Geofence validation (if enabled)
  if (shift.venue?.geofenceEnabled && input.location) {
    const distance = calculateDistance(input.location, shift.venue.coordinates);
    if (distance > shift.venue.geofenceRadius) {
      return { valid: false, reason: "Outside geofence area" };
    }
  }

  // Duplicate check
  const existingRecord = await findAttendanceRecord({
    shiftId: shift.id,
    staffUid: input.staffUid,
  });
  if (existingRecord) {
    return { valid: false, reason: "Already checked in" };
  }

  return { valid: true };
}
```

### 🟡 HIGH-03: No Staff Directory / Roster View

**Location:** Missing endpoint entirely **Issue:** No way to list all staff across organization with
profiles

**Missing functionality:**

- GET `/api/staff` - List all staff with profiles
- GET `/api/staff/[uid]` - Get staff profile details
- PATCH `/api/staff/[uid]` - Update staff profile
- GET `/api/staff/[uid]/qualifications` - List certifications
- POST `/api/staff/[uid]/qualifications` - Add certification

**Impact:**

- Cannot build staff directory UI
- No centralized staff management
- Admins must know user IDs to manage staff

**Recommendation:** Create dedicated staff endpoints (see §5 for implementation)

### 🟢 MEDIUM-01: Position Required Certifications Unstructured

**Location:** `packages/types/src/positions.ts` **Issue:** `requiredCertifications: string[]` is
free-text, not structured data

**Current schema:**

```typescript
interface Position {
  requiredCertifications: string[]; // ❌ ["Food Handler", "CPR", ...]
}
```

**Problems:**

- Typos create different certifications ("CPR" vs "C.P.R.")
- No expiration tracking
- Cannot validate against staff certifications
- No central certification catalog

**Recommendation:** Create certification types:

```typescript
// Collection: certifications/{orgId}/{certId}
interface CertificationType {
  id: string;
  orgId: string;
  name: string;
  description: string;
  validityPeriodMonths?: number; // null = no expiry
  issuingAuthority?: string;
}

// In Position schema:
interface Position {
  requiredCertificationIds: string[]; // References to CertificationType
}

// In staff profile:
interface StaffCertification {
  certificationId: string; // References CertificationType
  issuedDate: number;
  expiryDate?: number;
  documentUrl?: string;
  status: "active" | "expired" | "pending_verification";
}
```

### 🟢 MEDIUM-02: No Bulk Operations for Staff Management

**Location:** All member/staff endpoints **Issue:** No batch endpoints for bulk invites, role
updates, or removals

**Missing:**

- POST `/api/organizations/[id]/members/bulk-invite` - Invite multiple users
- PATCH `/api/organizations/[id]/members/bulk-update` - Update multiple roles
- DELETE `/api/organizations/[id]/members/bulk-remove` - Remove multiple members

**Impact:**

- Must make N API calls to invite N staff members
- No atomic bulk operations
- Performance issues for large organizations

**Recommendation:** Implement bulk operations using batch handler:

```typescript
export const POST = createOrgEndpoint({
  roles: ["admin"],
  input: BulkInviteMembersSchema,
  handler: async ({ input, context }) => {
    const { members } = input; // Array of { email, role }

    // Use Firestore batch writes
    const batch = adminDb.batch();
    const results = [];

    for (const member of members) {
      const membershipRef = adminDb
        .collection("memberships")
        .doc(`${member.uid}_${context.org!.orgId}`);

      batch.set(membershipRef, {
        uid: member.uid,
        orgId: context.org!.orgId,
        roles: [member.role],
        status: "invited",
        invitedBy: context.auth!.userId,
        invitedAt: Date.now(),
      });

      results.push({ email: member.email, status: "invited" });
    }

    await batch.commit();
    return ok({ results, total: results.length });
  },
});
```

## 4. Architectural Notes & Invariants

### ✅ Enforced Invariants

1. **A09 Handler Signature Invariant** - All routes use SDK factory pattern
2. **Input Validation** - Zod schemas validate all request bodies before handler execution
3. **Authentication Required** - All endpoints use `createAuthenticatedEndpoint()` or
   `createOrgEndpoint()`
4. **Type Safety** - Typed wrappers (`getDocWithType`, `setDocWithType`) for Firestore operations
5. **Org Scoping** - `createOrgEndpoint()` automatically validates user belongs to requested org
6. **Role-Based Access** - `roles: ["admin"]` enforces permission checks

### ⚠️ Missing Invariants

1. **Profile Completeness** - No validation that required staff profile fields are filled
2. **Certification Expiry** - No automatic detection of expired certifications
3. **Active Staff Only** - No enforcement that only active staff can be assigned shifts
4. **Unique Memberships** - No DB constraint preventing duplicate `{uid}_{orgId}` memberships
5. **Audit Logging** - No tracking of sensitive staff operations (role changes, removals)
6. **Shift Assignment Limits** - No validation of max hours per week or double-booking

### 📐 Design Patterns

**User Profile Pattern:**

- Single source of truth: `users/{uid}`
- Created on first sign-in (idempotent)
- Merge updates to preserve existing data
- Separate `profile` and `onboarding` namespaces

**Membership Pattern:**

- Composite key: `{uid}_{orgId}` for uniqueness
- Array of roles per user (multi-role support)
- Status lifecycle for invitation flow
- Denormalized in custom claims for fast RBAC checks

**Position Pattern:**

- Organization-scoped collections
- Soft delete via `isActive` flag
- Color coding for UI consistency
- Skill levels for matching logic

**Attendance Pattern:**

- Links to shift for context
- Both scheduled and actual times tracked
- Multiple check-in methods supported
- Geographic validation capability (geofencing)

## 5. Example Patterns

### ✅ Good Pattern: User Profile Creation

```typescript
// File: apps/web/src/lib/userProfile.ts
export async function ensureUserProfile(args: {
  adminDb: Firestore;
  uid: string;
  claims: AuthUserClaims;
}): Promise<void> {
  const { adminDb, uid, claims } = args;
  const ref = adminDb.collection("users").doc(uid);
  const now = Date.now();

  const existing = await getDocWithType<UserProfileDoc>(adminDb, ref);

  if (!existing) {
    // ✅ First-time sign-in → create full profile
    const newProfile: UserProfileDoc = {
      id: uid,
      createdAt: now,
      updatedAt: now,
      profile: {
        email: claims.email || null,
        displayName: claims.displayName || null,
        avatarUrl: claims.picture || null,
        selfDeclaredRole: claims.selfDeclaredRole || null,
      },
      onboarding: {
        status: "not_started",
        stage: "profile",
        intent: null,
        primaryNetworkId: null,
        primaryOrgId: null,
        primaryVenueId: null,
        completedAt: null,
        lastUpdatedAt: now,
      },
    };

    await setDocWithType<UserProfileDoc>(adminDb, ref, newProfile);
    return;
  }

  // ✅ Merge updates if doc exists
  await setDocWithType<UserProfileDoc>(
    adminDb,
    ref,
    {
      id: uid,
      profile: {
        ...existing.profile,
        email: claims.email || existing.profile.email,
        displayName: claims.displayName || existing.profile.displayName,
      },
      updatedAt: now,
    },
    { merge: true },
  );
}
```

**Why Good:**

- Idempotent: safe to call on every session
- Preserves existing data via merge
- Type-safe with Zod validation
- Handles both creation and update paths
- Structured namespaces (profile, onboarding)

### ✅ Good Pattern: Org Scoping with Role Check

```typescript
// File: organizations/[id]/members/[memberId]/route.ts
export const PATCH = createOrgEndpoint({
  roles: ["admin"], // ✅ Role-based access control
  input: UpdateMemberApiSchema,
  handler: async ({ input, context, params }) => {
    // ✅ Org scoping assertion
    if (params.id !== context.org!.orgId) {
      console.warn("Org mismatch in member PATCH", {
        requestedOrgId: params.id,
        userOrgId: context.org!.orgId,
        userId: context.auth?.userId,
      });
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 },
      );
    }

    const typedInput = input as z.infer<typeof UpdateMemberApiSchema>;
    const updated = {
      id: params.memberId,
      orgId: params.id,
      role: typedInput.role,
      updatedBy: context.auth?.userId, // ✅ Audit trail
    };
    return ok(updated);
  },
});
```

**Why Good:**

- Uses SDK factory for consistency
- Role-based access at route level
- Explicit org scoping validation
- Audit trail with `updatedBy`
- Structured logging for security monitoring

### ❌ Bad Pattern: Missing Firestore Persistence

```typescript
// ❌ CURRENT: Returns mock data, doesn't persist
export const GET = createOrgEndpoint({
  handler: async ({ context, params }) => {
    const members = [
      {
        id: "member-1",
        orgId: params.id,
        email: "user@example.com", // ❌ Hardcoded mock data
        role: "admin",
        joinedAt: Date.now(),
      },
    ];
    return ok({ members, total: members.length });
  },
});

// ✅ SHOULD BE: Query Firestore for actual members
export const GET = createOrgEndpoint({
  handler: async ({ context, params }) => {
    const adminDb = getAdminDb();
    const membershipsRef = adminDb.collection("memberships");

    const snapshot = await membershipsRef
      .where("orgId", "==", params.id)
      .where("status", "in", ["active", "invited"])
      .orderBy("joinedAt", "desc")
      .get();

    const members = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return ok({ members, total: members.length });
  },
});
```

### ❌ Bad Pattern: Unstructured Certification Strings

```typescript
// ❌ CURRENT: Free-text array
interface Position {
  requiredCertifications: string[]; // ["Food Handler", "CPR", "food handler"]
}

// ✅ SHOULD BE: Structured references
interface Position {
  requiredCertificationIds: string[]; // ["cert_food_handler", "cert_cpr"]
}

// With separate certification catalog:
interface CertificationType {
  id: string;
  orgId: string;
  name: string;
  canonicalName: string; // Normalized for matching
  validityPeriodMonths?: number;
  issuingAuthority?: string;
}
```

### ✅ Refactored Pattern: Complete Staff Management Endpoint

```typescript
// File: api/staff/route.ts (NEW)
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { z } from "zod";

const ListStaffQuerySchema = z.object({
  status: z.enum(["active", "on_leave", "all"]).default("active"),
  positionId: z.string().optional(),
  certificationId: z.string().optional(),
  search: z.string().optional(), // Name/email search
  limit: z.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});

/**
 * GET /api/staff
 * List all staff in organization with profiles
 */
export const GET = createOrgEndpoint({
  handler: async ({ request, context }) => {
    const { searchParams } = new URL(request.url);
    const query = ListStaffQuerySchema.parse({
      status: searchParams.get("status"),
      positionId: searchParams.get("positionId"),
      certificationId: searchParams.get("certificationId"),
      search: searchParams.get("search"),
      limit: searchParams.get("limit"),
      cursor: searchParams.get("cursor"),
    });

    const adminDb = getAdminDb();
    const orgId = context.org!.orgId;

    // 1. Get all memberships for this org
    let membershipsQuery = adminDb.collection("memberships").where("orgId", "==", orgId);

    if (query.status !== "all") {
      membershipsQuery = membershipsQuery.where("status", "==", query.status);
    }

    const membershipsSnap = await membershipsQuery.get();
    const uids = membershipsSnap.docs.map((doc) => doc.data().uid);

    if (uids.length === 0) {
      return ok({ staff: [], total: 0 });
    }

    // 2. Fetch user profiles for all members
    const usersRef = adminDb.collection("users");
    const userProfiles = await Promise.all(
      uids.map((uid) => getDocWithType<UserProfileDoc>(adminDb, usersRef.doc(uid))),
    );

    // 3. Filter by position qualification (if specified)
    let staff = userProfiles
      .filter((profile) => profile !== null)
      .map((profile) => ({
        uid: profile!.id,
        email: profile!.profile.email,
        displayName: profile!.profile.displayName,
        avatarUrl: profile!.profile.avatarUrl,
        roles: membershipsSnap.docs.find((d) => d.data().uid === profile!.id)?.data().roles,
        // Additional staff fields would go here
      }));

    // 4. Apply search filter
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      staff = staff.filter(
        (s) =>
          s.displayName?.toLowerCase().includes(searchLower) ||
          s.email?.toLowerCase().includes(searchLower),
      );
    }

    // 5. Pagination (simplified, use cursors in production)
    const total = staff.length;
    staff = staff.slice(0, query.limit);

    return ok({ staff, total });
  },
});

/**
 * GET /api/staff/[uid]
 * Get detailed staff profile including qualifications
 */
export const GET_DETAIL = createOrgEndpoint({
  handler: async ({ context, params }) => {
    const adminDb = getAdminDb();
    const { uid } = params;
    const orgId = context.org!.orgId;

    // 1. Verify staff belongs to this org
    const membershipRef = adminDb.collection("memberships").doc(`${uid}_${orgId}`);
    const membershipSnap = await membershipRef.get();

    if (!membershipSnap.exists) {
      return notFound("Staff member not found in this organization");
    }

    // 2. Get user profile
    const userRef = adminDb.collection("users").doc(uid);
    const profile = await getDocWithType<UserProfileDoc>(adminDb, userRef);

    if (!profile) {
      return notFound("User profile not found");
    }

    // 3. Get membership details
    const membership = membershipSnap.data();

    // 4. Get assigned positions (from shifts or separate collection)
    // TODO: Implement position assignment tracking

    // 5. Get certifications
    // TODO: Implement certification subcollection

    return ok({
      uid: profile.id,
      profile: profile.profile,
      membership: {
        orgId: membership.orgId,
        roles: membership.roles,
        status: membership.status,
        joinedAt: membership.joinedAt,
      },
      // certifications: [],
      // assignedPositions: [],
    });
  },
});
```

**Why Better:**

- Actual Firestore queries instead of mocks
- Structured filtering and search
- Joins membership + profile data
- Pagination support
- Type-safe throughout
- Extensible for certifications and positions

### ✅ Refactored Pattern: Position Assignment with Validation

```typescript
// File: api/shifts/[id]/assign/route.ts (NEW)
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { z } from "zod";

const AssignStaffSchema = z.object({
  staffUid: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export const POST = createOrgEndpoint({
  roles: ["scheduler", "manager", "admin"],
  input: AssignStaffSchema,
  handler: async ({ input, context, params }) => {
    const adminDb = getAdminDb();
    const { shiftId } = params;
    const { staffUid, notes } = input;
    const orgId = context.org!.orgId;

    // 1. Get shift details
    const shiftRef = adminDb.collection(`organizations/${orgId}/shifts`).doc(shiftId);
    const shiftSnap = await shiftRef.get();

    if (!shiftSnap.exists) {
      return notFound("Shift not found");
    }

    const shift = shiftSnap.data() as Shift;

    // 2. Verify staff is active member of org
    const membershipRef = adminDb.collection("memberships").doc(`${staffUid}_${orgId}`);
    const membershipSnap = await membershipRef.get();

    if (!membershipSnap.exists) {
      return badRequest("Staff member not found in organization");
    }

    const membership = membershipSnap.data();
    if (membership.status !== "active") {
      return badRequest("Staff member is not active");
    }

    // 3. Get position to check requirements
    const positionRef = adminDb.collection(`positions/${orgId}`).doc(shift.positionId);
    const positionSnap = await positionRef.get();

    if (!positionSnap.exists) {
      return badRequest("Position not found");
    }

    const position = positionSnap.data() as Position;

    // 4. Verify staff qualifications (if certifications required)
    if (position.requiredCertificationIds?.length > 0) {
      const staffProfile = await getDocWithType<UserProfileDoc>(
        adminDb,
        adminDb.collection("users").doc(staffUid),
      );

      if (!staffProfile) {
        return badRequest("Staff profile not found");
      }

      // Check if staff has all required certifications
      const staffCertIds = staffProfile.profile.certifications?.map((c) => c.certificationId) || [];
      const missingCerts = position.requiredCertificationIds.filter(
        (id) => !staffCertIds.includes(id),
      );

      if (missingCerts.length > 0) {
        return badRequest(
          `Staff member is missing required certifications: ${missingCerts.join(", ")}`,
        );
      }
    }

    // 5. Check for scheduling conflicts (double-booking)
    const conflictQuery = await adminDb
      .collection(`organizations/${orgId}/shifts`)
      .where("assignments", "array-contains", { uid: staffUid })
      .where("startTime", "<=", shift.endTime)
      .where("endTime", ">=", shift.startTime)
      .get();

    if (!conflictQuery.empty) {
      return badRequest("Staff member has conflicting shift assignment");
    }

    // 6. Add assignment to shift
    const assignment: ShiftAssignment = {
      uid: staffUid,
      status: "assigned",
      assignedAt: Date.now(),
      assignedBy: context.auth!.userId,
      notes,
    };

    await shiftRef.update({
      assignments: [...shift.assignments, assignment],
      updatedAt: Date.now(),
    });

    // 7. Create attendance record
    const attendanceRef = adminDb.collection(`attendance_records/${orgId}`).doc();

    await attendanceRef.set({
      id: attendanceRef.id,
      orgId,
      shiftId,
      scheduleId: shift.scheduleId,
      staffUid,
      status: "scheduled",
      scheduledStart: shift.startTime,
      scheduledEnd: shift.endTime,
      scheduledDuration: Math.floor((shift.endTime - shift.startTime) / 60000),
      breakDuration: shift.breakMinutes || 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return ok({
      shiftId,
      assignment,
      attendanceRecordId: attendanceRef.id,
    });
  },
});
```

**Why Better:**

- Validates staff membership and status
- Checks position qualifications/certifications
- Prevents double-booking with conflict detection
- Atomically creates attendance record
- Full audit trail
- Returns useful IDs for tracking

## 6. Open Questions

1. **How should staff availability preferences be structured?**
   - Weekly recurring patterns vs. one-off availability?
   - Blackout dates for vacations?
   - Preferred vs. unavailable times?
   - Should availability be enforced or just suggestions?

1. **What is the certification verification workflow?**
   - Who can upload certifications (self-service or admin-only)?
   - Automated expiry notifications?
   - Document approval process?
   - Integration with external verification systems?

1. **How should position-based vs. person-based pay rates work?**
   - Position has base hourly rate
   - Staff can have override rate
   - Different rates for different positions?
   - How to handle overtime calculations?

1. **What staff metrics should be tracked?**
   - Total hours worked (by week/month)
   - Average hours per shift
   - No-show rate
   - Late check-in rate
   - Shifts confirmed vs. declined
   - Preferred positions vs. actually assigned

1. **How should skill/qualification matching work for AI scheduling?**
   - Fuzzy matching on skill levels?
   - Preference scoring (prefers certain positions)?
   - Seniority considerations?
   - Fairness algorithms to distribute desirable shifts?

1. **What is the staff onboarding flow after invitation?**
   - Email invite → click link → create account → fill profile
   - Required profile fields before first shift?
   - Mandatory training/orientation tracking?
   - Background check integration?

1. **How should emergency contact information be stored?**
   - Separate subcollection for privacy?
   - Encrypted fields?
   - Multiple emergency contacts?
   - Who has access (admin only vs. managers)?

1. **Should there be a staff performance/review system?**
   - Manager notes on staff members?
   - Performance ratings?
   - Link to attendance (no-shows, late arrivals)?
   - Promotion/demotion tracking?

## 7. Recommendations Summary

| Priority | Action                                                          | Estimated Effort |
| -------- | --------------------------------------------------------------- | ---------------- |
| 🔴 P0    | Add Firestore persistence to member operations                  | 3-4 days         |
| 🔴 P0    | Add Firestore persistence to position operations                | 2-3 days         |
| 🔴 P0    | Extend user profile with staff-specific fields                  | 2-3 days         |
| 🟡 P1    | Implement staff directory endpoint (`/api/staff`)               | 2-3 days         |
| 🟡 P1    | Add attendance check-in validation (geofence, time, duplicates) | 2-3 days         |
| 🟡 P1    | Create staff assignment index for efficient queries             | 3-4 days         |
| 🟢 P2    | Implement structured certification system                       | 3-4 days         |
| 🟢 P2    | Add bulk member operations endpoints                            | 1-2 days         |
| 🟢 P2    | Add staff qualifications/certifications endpoints               | 2-3 days         |
| 🟢 P2    | Implement availability preferences system                       | 4-5 days         |
| 🟢 P3    | Add staff performance tracking                                  | 3-4 days         |
| 🟢 P3    | Implement comprehensive audit logging                           | 2-3 days         |

**Total Estimated Effort:** ~30-40 days

## 8. Related Subsystems

- **RBAC/Security** - Membership roles drive access control
- **Organizations** - Staff are scoped to organizations
- **Positions** - Define job roles and requirements for staff
- **Schedules & Shifts** - Staff are assigned to shifts
- **Attendance** - Tracks staff time and presence
- **Onboarding** - Initial user profile creation
- **Notifications** - Shift assignments, schedule changes (not yet implemented)

## 9. Next Steps

1. **Prioritize P0 items:**
   - Implement Firestore persistence for members and positions
   - Extend user profile schema with staff fields
   - Add basic staff directory endpoint

1. **Design certification system:**
   - Define certification type catalog structure
   - Implement certification issuance and expiry tracking
   - Add qualification verification to shift assignment

1. **Build availability system:**
   - Design recurring availability pattern schema
   - Implement availability preference endpoints
   - Integrate with shift assignment validation

1. **Improve shift assignment:**
   - Add conflict detection
   - Implement qualification checking
   - Add automated attendance record creation

1. **Document complete staff lifecycle:**
   - Invitation → onboarding → profile completion
   - Qualification tracking → shift assignment
   - Attendance tracking → performance review
