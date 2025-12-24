# L3 — Cloud Functions Catalog

This file documents all Firebase Cloud Functions in the Fresh Schedules system.

---

## 1. Functions Overview

Cloud Functions are located in `functions/src/` and handle background processing, triggers, and
callable operations.

| File                          | Purpose                                |
| ----------------------------- | -------------------------------------- |
| `index.ts`                    | Main exports and function registration |
| `onboarding.ts`               | Onboarding flow functions              |
| `joinOrganization.ts`         | Join organization callable             |
| `denormalization.ts`          | Data denormalization triggers          |
| `triggers/denormalization.ts` | V2 Firestore triggers                  |
| `ledger.ts`                   | Billing/ledger operations              |
| `domain/billing.ts`           | Billing domain logic                   |

---

## 2. Firestore Triggers

### `onScheduleUpdate`

**Trigger**: `functions.firestore.onUpdate`  
**Path**: Schedule documents  
**Purpose**: React to schedule changes for denormalization and notifications

```typescript
export const onScheduleUpdate = functions.firestore.onUpdate(async (change, context) => {
  // Denormalization logic
});
```

---

### `onZoneWrite`

**Trigger**: `onDocumentWritten` (V2)  
**Path**: Zone documents  
**Purpose**: Handle zone creation/updates for denormalization

```typescript
export const onZoneWrite = onDocumentWritten("zones/{orgId}/zones/{zoneId}", async (event) => {
  // Zone denormalization
});
```

---

### `onAttendanceApproved`

**Trigger**: `onDocumentUpdated` (V2)  
**Path**: Attendance records  
**Purpose**: Process approved attendance for ledger/billing

```typescript
export const onAttendanceApproved = onDocumentUpdated(
  "attendance_records/{orgId}/records/{recordId}",
  async (event) => {
    // Process approval
  },
);
```

---

## 3. Callable Functions

### `joinOrganization`

**Type**: `onCall` (V2)  
**Purpose**: Allow users to join an organization via invite token

```typescript
interface JoinOrganizationRequest {
  token: string;
  orgId: string;
}

export const joinOrganization = onCall<JoinOrganizationRequest>(async (request) => {
  // Validate token
  // Create membership
  // Return result
});
```

**Input Schema**:

- `token`: string - Join token from invite
- `orgId`: string - Organization ID to join

**Returns**:

- `success`: boolean
- `membership`: MembershipData (on success)
- `error`: string (on failure)

---

## 4. HTTP Functions

### Onboarding Functions

Located in `functions/src/onboarding.ts`:

- Network creation
- Admin form processing
- Profile validation

---

## 5. Domain Logic

### `domain/billing.ts`

Billing calculation and ledger operations:

- Rate calculation
- Invoice generation
- Payment processing hooks

### `ledger.ts`

Time-based ledger operations:

- Hours tracking
- Overtime calculation
- Pay period aggregation

---

## 6. Deployment

Functions are deployed via Firebase CLI:

```bash
firebase deploy --only functions
```

Or individually:

```bash
firebase deploy --only functions:joinOrganization
firebase deploy --only functions:onScheduleUpdate
```

---

## 7. Environment Variables

Functions require these environment variables (set via Firebase config):

| Variable                | Purpose              |
| ----------------------- | -------------------- |
| `FIREBASE_PROJECT_ID`   | Project identifier   |
| `ADMIN_SDK_CREDENTIALS` | Service account JSON |

---

**Total Functions**: 8 files  
**Runtime**: Node.js 20  
**Last Generated**: December 2025
