# L2 — Firestore Data Architecture

> **Status:** ✅ Documented from actual codebase analysis **Last Updated:** 2025-12-17
> **Collections:** 9 primary collections, 25 type modules, 145 Zod schemas

## 1. Role in the System

The Data Architecture defines how all application state is persisted and queried in Firestore. It
establishes:

- Collection structure and naming conventions
- Document schemas and validation (via Zod)
- Data relationships and foreign keys
- Multi-tenancy via `orgId` scoping

**Critical Observation:** Most API routes return mock data - actual Firestore operations are minimal
in current implementation.

## 2. Firestore Collection Structure

### 2.1 Primary Collections

| Collection                  | Path                                     | Scope        | Document Count (est.) |
| --------------------------- | ---------------------------------------- | ------------ | --------------------- |
| `attendance_records`        | `/attendance_records/{orgId}/{recordId}` | Per-org      | 10k-100k              |
| `join_tokens`               | `/join_tokens/{orgId}/{tokenId}`         | Per-org      | 100-1k                |
| `memberships`               | `/memberships/{uid}_{orgId}`             | Global       | 1k-10k                |
| `organizations` (or `orgs`) | `/organizations/{orgId}`                 | Global       | 100-1k                |
| `positions`                 | `/positions/{orgId}/{positionId}`        | Per-org      | 100-500               |
| `schedules`                 | `/schedules/{orgId}/{scheduleId}`        | Per-org      | 1k-10k                |
| `shifts`                    | `/shifts/{orgId}/{scheduleId}/{shiftId}` | Per-schedule | 10k-100k              |
| `venues`                    | `/venues/{orgId}/{venueId}`              | Per-org      | 10-100                |
| `zones`                     | `/zones/{orgId}/{zoneId}`                | Per-org      | 50-500                |

**Note:** Collection `networks` also exists (used in onboarding) - not listed in types but found in
routes.

### 2.2 Multi-Tenancy Pattern

**All org-scoped collections use composite keys:**

```
/{collection}/{orgId}/{resourceId}
```

**Benefits:**

- ✅ Data isolation per organization
- ✅ Easy to query all resources for an org
- ✅ Supports org-level data export

**Challenges:**

- ⚠️ Can't query across orgs without collection group
- ⚠️ Org ID must be known before querying
- ⚠️ Cross-org queries require collection groups

### 2.3 Schema Definitions

All schemas defined in `packages/types/src/`:

```typescript
// Example: Schedule Schema
export const ScheduleSchema = z
  .object({
    id: z.string().min(1),
    orgId: z.string().min(1), // ✅ Always present for multi-tenancy
    name: z.string().min(1).max(100),
    startDate: z.number().int().positive(),
    endDate: z.number().int().positive(),
    status: ScheduleStatus.default("draft"),
    createdBy: z.string().min(1),
    createdAt: z.number().int().positive(),
    updatedAt: z.number().int().positive(),
    // ... more fields
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
  });
```

## 3. Critical Findings

### 🔴 CRITICAL-01: Mock Data in Production Routes

**Location:** Most API endpoints **Issue:** Routes return mock data instead of querying Firestore

**Evidence from onboarding routes:**

```typescript
// File: onboarding/profile/route.ts
const profile = {
  userId: context.auth?.userId,
  firstName,
  lastName,
  onboardingComplete: true,
};
return ok(profile); // ❌ Not saved to Firestore!
```

**Impact:**

- ❌ User data not persisted
- ❌ Can't test production data flows
- ❌ No actual multi-tenancy validation

**Only 1 actual Firestore operation found in packed code:**

```typescript
// File: onboarding/activate-network/route.ts
const networkRef = adb.collection("networks").doc(String(networkId));
await updateDocWithType<NetworkDoc>(adb, networkRef, {
  status: "active",
});
```

### 🔴 CRITICAL-02: No Composite Indexes Defined

**Location:** Project root (missing `firestore.indexes.json`) **Issue:** No index configuration file
found

**Required indexes for common queries:**

```json
{
  "indexes": [
    {
      "collectionGroup": "schedules",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "orgId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "startDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "shifts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "orgId", "order": "ASCENDING" },
        { "fieldPath": "assignedTo", "order": "ASCENDING" },
        { "fieldPath": "startTime", "order": "ASCENDING" }
      ]
    }
  ]
}
```

**Impact:** Complex queries will fail in production without indexes

### 🟡 HIGH-01: Inconsistent Timestamp Format

**Location:** All schema definitions **Issue:** Some fields accept both number and string

```typescript
// From OrganizationSchema:
createdAt: z.union([
  z.number().int().positive(), // Unix milliseconds
  z.string().datetime(), // ISO string
]);
```

**Problems:**

- Mixed formats in database
- Comparison queries inconsistent
- Sorting may fail

**Recommendation:** Standardize on Unix milliseconds (number)

### 🟡 HIGH-02: Missing Foreign Key Validation

**Location:** All relationship fields **Issue:** No validation that referenced IDs exist

```typescript
// Schedule references orgId, but doesn't verify org exists
export const ScheduleSchema = z.object({
  orgId: z.string().min(1), // ❌ No FK constraint
  createdBy: z.string().min(1), // ❌ No user existence check
  templateId: z.string().optional(), // ❌ No template check
});
```

**Impact:** Orphaned records, referential integrity violations

### 🟢 MEDIUM-01: No Data Migration Strategy

**Location:** Schemas with refine() validators **Issue:** Breaking schema changes will fail on old
data

```typescript
.refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date"
});
```

**If old data has invalid dates, validation fails on read!**

## 4. Data Relationships

### 4.1 Entity Relationship Diagram

```
Network (1)
  ↓
Organization (N) ── Memberships (N) ── Users (N)
  ↓
  ├── Positions (N)
  ├── Venues (N) ── Zones (N)
  ├── Join Tokens (N)
  └── Schedules (N)
        ↓
      Shifts (N) ── Attendance Records (N)
```

### 4.2 Key Relationships

| Parent       | Child      | Relationship | FK Field                  | Cascade Delete? |
| ------------ | ---------- | ------------ | ------------------------- | --------------- |
| Organization | Schedule   | 1:N          | `schedule.orgId`          | ❓ Unknown      |
| Organization | Venue      | 1:N          | `venue.orgId`             | ❓ Unknown      |
| Schedule     | Shift      | 1:N          | `shift.scheduleId`        | ❓ Unknown      |
| Shift        | Attendance | 1:N          | `attendance.shiftId`      | ❓ Unknown      |
| Venue        | Zone       | 1:N          | `zone.venueId`            | ❓ Unknown      |
| User         | Membership | N:M          | `membership.userId/orgId` | ❓ Unknown      |

**Missing:** Explicit cascade delete policies

## 5. Type System Architecture

### 5.1 Type Module Structure

**25 type modules in `packages/types/src/`:**

Core Types:

- `rbac.ts` - Roles and permissions
- `orgs.ts` - Organization data
- `schedules.ts` - Schedule management
- `shifts.ts` - Shift definitions
- `attendance.ts` - Time tracking
- `positions.ts` - Job positions
- `venues.ts` / `zones.ts` - Location hierarchy
- `memberships.ts` - User-org relationships

Support Types:

- `onboarding.ts` - New user flows
- `join-tokens.ts` - Invitation system
- `batch.ts` - Batch operations
- `compliance.ts` - Regulatory forms
- `errors.ts` - Error handling
- `events.ts` - Event sourcing (?)
- `session.ts` - User sessions

### 5.2 Schema Export Pattern

```typescript
// Every module exports:
export const EntitySchema = z.object({ ... });
export type Entity = z.infer<typeof EntitySchema>;

// Example:
export const ScheduleSchema = z.object({ ... });
export type Schedule = z.infer<typeof ScheduleSchema>;
```

**Benefits:**

- ✅ Single source of truth
- ✅ Runtime validation + TypeScript types
- ✅ Auto-generated types from schemas

## 6. Good Patterns

### ✅ Pattern: Typed Firestore Wrappers

```typescript
// From typed-wrappers:
export async function updateDocWithType<T>(
  db: Firestore,
  ref: DocumentReference,
  data: Partial<T>,
): Promise<void> {
  await ref.update(data);
}
```

**Benefits:** Type safety for Firestore operations

### ✅ Pattern: Status Enums

```typescript
export const ScheduleStatus = z.enum(["draft", "published", "active", "completed", "archived"]);
```

**Benefits:** State machine validation, no magic strings

### ✅ Pattern: Timestamps as Numbers

```typescript
createdAt: z.number().int().positive(); // Unix milliseconds
```

**Benefits:**

- Easy comparison: `date1 > date2`
- Consistent sorting
- No timezone issues

## 7. Anti-Patterns

### ❌ Anti-Pattern: Dual Timestamp Format

```typescript
createdAt: z.union([z.number().int().positive(), z.string().datetime()]);
```

**Problem:** Can't reliably compare dates without normalization

### ❌ Anti-Pattern: No Required Fields Enforcement

```typescript
// Many fields are optional that shouldn't be:
export const OrganizationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  status: OrganizationStatus.optional(), // ❌ Should have default
  subscriptionTier: SubscriptionTier.optional(), // ❌ Should default to "free"
});
```

### ❌ Anti-Pattern: String Min Length Without Context

```typescript
z.string().min(1); // ❌ Just checks not empty
z.string().min(1, "Organization name is required"); // ✅ Has context
```

## 8. Data Access Patterns

### 8.1 Common Queries (Inferred)

**Get all schedules for org:**

```typescript
const schedules = await db
  .collection("schedules")
  .doc(orgId)
  .collection("schedules")
  .where("status", "==", "published")
  .orderBy("startDate", "desc")
  .get();
```

**Get user memberships:**

```typescript
const membership = await db.collection("memberships").doc(`${userId}_${orgId}`).get();
```

**Get shifts for schedule:**

```typescript
const shifts = await db.collection("shifts").doc(orgId).collection(scheduleId).get();
```

### 8.2 Performance Considerations

**Collection Group Queries** (when needed):

```typescript
// Query all shifts across all orgs (admin dashboard)
const allShifts = await db.collectionGroup("shifts").where("startTime", ">=", startDate).get();
```

**Requires collection group index!**

## 9. Recommendations

| Priority | Action                                            | Effort   | Impact   |
| -------- | ------------------------------------------------- | -------- | -------- |
| 🔴 P0    | Implement actual Firestore operations (not mocks) | 5-7 days | Critical |
| 🔴 P0    | Create composite index definitions                | 1 day    | Critical |
| 🟡 P1    | Standardize timestamp format (numbers only)       | 2 days   | High     |
| 🟡 P1    | Add foreign key validation functions              | 2-3 days | High     |
| 🟡 P1    | Define cascade delete policies                    | 1 day    | High     |
| 🟢 P2    | Create data migration utilities                   | 2 days   | Medium   |
| 🟢 P2    | Add schema versioning                             | 1 day    | Medium   |
| 🟢 P3    | Document all query patterns                       | 1 day    | Low      |

**Total Estimated Effort:** ~15-19 days

## 10. Security Rules (Not Found)

**Missing:** `firestore.rules` file

**Recommended structure:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Multi-tenancy enforcement
    match /schedules/{orgId}/{scheduleId} {
      allow read: if request.auth != null &&
        isMemberOf(request.auth.uid, orgId);
      allow write: if request.auth != null &&
        hasRole(request.auth.uid, orgId, ['admin', 'manager']);
    }
  }
}
```

## 11. Next Steps

1. Implement actual Firestore persistence in all routes
2. Create and deploy composite indexes
3. Standardize all timestamps to Unix milliseconds
4. Add FK validation helpers
5. Define and test security rules
6. Create data migration scripts for schema evolution
