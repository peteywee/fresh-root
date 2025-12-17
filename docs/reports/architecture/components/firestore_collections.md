# L3 — Firestore Collections & Indexes

This file documents all Firestore collections, their schemas, security rules, and indexes used in
Fresh Schedules.

---

## 1. Collection Hierarchy

```
/users/{userId}                                     # User profiles
/orgs/{orgId}                                       # Organizations
  └── /schedules/{scheduleId}                       # Schedules (subcollection)
      └── /shifts/{shiftId}                         # Shifts (subcollection)
  └── /positions/{positionId}                       # Positions (subcollection)
  └── /join_tokens/{tokenId}                        # Invite tokens (subcollection)
/organizations/{orgId}                              # Alternate org path (alias)
  └── /messages/{messageId}                         # Messages
  └── /receipts/{receiptId}                         # Receipts
  └── /schedules/{scheduleId}                       # Schedules
  └── /positions/{positionId}                       # Positions
/memberships/{userId}_{orgId}                       # Memberships (composite ID)
/venues/{orgId}/venues/{venueId}                    # Venues per org
/zones/{orgId}/zones/{zoneId}                       # Zones per org
/positions/{orgId}/positions/{positionId}          # Positions (top-level)
/schedules/{orgId}/schedules/{scheduleId}          # Schedules (top-level)
/shifts/{orgId}/shifts/{shiftId}                   # Shifts (top-level)
/attendance_records/{orgId}/records/{recordId}     # Attendance records
/join_tokens/{orgId}/join_tokens/{tokenId}         # Join tokens (top-level)
/compliance/{complianceDocId}                      # Compliance forms (Admin SDK only)
```

---

## 2. Core Collections

### `/users/{userId}`

User profiles and preferences.

| Field           | Type     | Description                    |
| --------------- | -------- | ------------------------------ |
| `uid`           | string   | Firebase Auth UID              |
| `email`         | string   | User email                     |
| `displayName`   | string   | Display name                   |
| `photoURL`      | string?  | Profile photo URL              |
| `createdAt`     | number   | Timestamp                      |
| `updatedAt`     | number   | Timestamp                      |

**Rules**: Self-only read/write; no enumeration (list: false)

---

### `/orgs/{orgId}`

Organization entities.

| Field           | Type     | Description                    |
| --------------- | -------- | ------------------------------ |
| `name`          | string   | Organization name              |
| `ownerId`       | string   | Owner UID                      |
| `status`        | string   | active/inactive                |
| `createdAt`     | number   | Timestamp                      |
| `updatedAt`     | number   | Timestamp                      |

**Rules**: Read by members; write by org_owner only; no enumeration

---

### `/memberships/{userId}_{orgId}`

User-to-organization membership with role.

| Field           | Type     | Description                    |
| --------------- | -------- | ------------------------------ |
| `uid`           | string   | User ID                        |
| `orgId`         | string   | Organization ID                |
| `role`          | string   | Role (staff/scheduler/manager/admin/org_owner) |
| `status`        | string   | active/inactive                |
| `createdAt`     | number   | Timestamp                      |
| `updatedAt`     | number   | Timestamp                      |

**Rules**: Read by self or managers; write by managers; no enumeration

---

### `/schedules/{orgId}/schedules/{scheduleId}`

Schedule definitions.

| Field           | Type     | Description                    |
| --------------- | -------- | ------------------------------ |
| `orgId`         | string   | Organization ID                |
| `venueId`       | string   | Associated venue               |
| `name`          | string   | Schedule name                  |
| `startDate`     | number   | Start timestamp                |
| `endDate`       | number   | End timestamp                  |
| `status`        | string   | draft/published/archived       |
| `createdBy`     | string   | Creator UID                    |
| `createdAt`     | number   | Timestamp                      |
| `updatedAt`     | number   | Timestamp                      |

**Rules**: Read by org members; create/update by scheduler+; delete by manager+

---

### `/shifts/{orgId}/shifts/{shiftId}`

Individual shift assignments.

| Field           | Type     | Description                    |
| --------------- | -------- | ------------------------------ |
| `orgId`         | string   | Organization ID                |
| `scheduleId`    | string   | Parent schedule ID             |
| `userId`        | string?  | Assigned user ID               |
| `positionId`    | string   | Position ID                    |
| `startTime`     | number   | Start timestamp                |
| `endTime`       | number   | End timestamp                  |
| `notes`         | string?  | Shift notes                    |
| `status`        | string   | draft/published/cancelled      |
| `createdAt`     | number   | Timestamp                      |
| `updatedAt`     | number   | Timestamp                      |

**Rules**: Read by org members; write by scheduler+; staff can update own limited fields (notes, checkInTime)

---

### `/venues/{orgId}/venues/{venueId}`

Physical locations.

| Field           | Type     | Description                    |
| --------------- | -------- | ------------------------------ |
| `orgId`         | string   | Organization ID                |
| `name`          | string   | Venue name                     |
| `address`       | string?  | Physical address               |
| `timezone`      | string   | Timezone                       |
| `createdAt`     | number   | Timestamp                      |
| `updatedAt`     | number   | Timestamp                      |

**Rules**: Read by org members; create/update by manager+; delete by owner/admin only

---

### `/attendance_records/{orgId}/records/{recordId}`

Time tracking records.

| Field           | Type     | Description                    |
| --------------- | -------- | ------------------------------ |
| `orgId`         | string   | Organization ID                |
| `userId`        | string   | User ID                        |
| `shiftId`       | string   | Associated shift               |
| `checkInTime`   | number   | Clock-in timestamp             |
| `checkOutTime`  | number?  | Clock-out timestamp            |
| `status`        | string   | pending/approved/rejected      |
| `createdAt`     | number   | Timestamp                      |

**Rules**: Read by org members; write by scheduler+

---

## 3. Firestore Indexes

From `firestore.indexes.json`:

| Collection    | Fields                              | Query Scope |
| ------------- | ----------------------------------- | ----------- |
| `members`     | `orgId` ASC, `role` ASC             | COLLECTION  |
| `venues`      | `orgId` ASC, `name` ASC             | COLLECTION  |
| `schedules`   | `venueId` ASC, `startDate` ASC      | COLLECTION  |
| `shifts`      | `venueId` ASC, `scheduleId` ASC     | COLLECTION  |
| `zones`       | `venueId` ASC, `name` ASC           | COLLECTION  |
| `attendance`  | `orgId` ASC, `timestamp` ASC        | COLLECTION  |

---

## 4. Security Rule Helper Functions

```javascript
isSignedIn()           // request.auth != null
uid()                  // request.auth.uid
isOrgMember(orgId)     // Checks membership doc exists
hasAnyRole(roles)      // Checks token claims for roles
hasAnyRoleLegacy(orgId, roles)  // Checks membership doc role
isManager()            // hasAnyRole(['org_owner','admin','manager'])
sameOrg(orgId)         // Token org matches resource org
```

---

## 5. Anti-Enumeration Pattern

All collections use `allow list: if false` to prevent enumeration attacks. Clients must query with
explicit filters (e.g., by orgId).

---

**Last Generated**: December 2025
