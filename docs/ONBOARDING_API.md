# Onboarding API Reference — Block 3

## Overview

The Fresh Root onboarding system provides six endpoints that guide users through account setup, network creation, and organizational administration. All endpoints are protected by auth and implement consistent error handling.

**Base URL**: `https://app.freshroot.com/api/onboarding`

**Authentication**: All endpoints require Firebase auth token in `Authorization: Bearer` header.

---

## Endpoints

### 1. Session Bootstrap

**Purpose**: Initialize session and guarantee user profile exists.

```http
POST /session/bootstrap
```

**Request**:

```json
{}
```

**Response** (200 OK):

```json
{
  "ok": true,
  "uid": "user-123",
  "emailVerified": true,
  "user": {
    "id": "user-123",
    "profile": {
      "email": "user@example.com",
      "displayName": "John Doe",
      "avatarUrl": null,
      "selfDeclaredRole": "owner_founder_director"
    },
    "onboarding": {
      "status": "not_started",
      "stage": "profile",
      "intent": null,
      "primaryNetworkId": null,
      "primaryOrgId": null,
      "completedAt": null,
      "lastUpdatedAt": 1699706400000
    }
  }
}
```

**Error** (401 Unauthorized):

```json
{
  "error": "not_authenticated"
}
```

**Notes**:

- Called automatically by frontend on app load
- Creates `users/{uid}` doc if it doesn't exist
- Idempotent: safe to call on every session

---

### 2. Verify Eligibility

**Purpose**: Check if user is eligible to proceed with onboarding.

```http
POST /verify-eligibility
```

**Request**:

```json
{
  "selfDeclaredRole": "owner_founder_director"
}
```

**Valid Roles**:

- `owner_founder_director`
- `manager_supervisor`
- `hr_person`
- `scheduling_lead`
- `operations`
- `other`

**Response** (200 OK):

```json
{
  "ok": true,
  "allowed": true,
  "effectiveRole": "owner_founder_director"
}
```

**Error** (403 Forbidden - Not Eligible):

```json
{
  "ok": false,
  "allowed": false,
  "reason": "User role not eligible for onboarding"
}
```

**Error** (429 Too Many Requests):

```json
{
  "error": "rate_limit_exceeded",
  "retryAfter": 45
}
```

**Rate Limiting**: 5 requests per 60 seconds per user

---

### 3. Admin Responsibility Form

**Purpose**: Collect admin identity and tax info; generate join token.

```http
POST /admin-form
```

**Request**:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "taxIdType": "ssn",
  "taxIdLast4": "1234"
}
```

**Validation**:

- `firstName` and `lastName`: min 1 character
- `taxIdType`: `ssn` or `ein`
- `taxIdLast4`: exactly 4 digits

**Response** (200 OK):

```json
{
  "ok": true,
  "token": "join-token-abc123def456",
  "message": "Form submitted successfully"
}
```

**Error** (400 Bad Request):

```json
{
  "error": "validation_error",
  "details": {
    "taxIdLast4": "Must be last 4 digits"
  }
}
```

**Notes**:

- Generated token can be shared with other org members
- Token expires after 24 hours or max N uses (default: 10)

---

### 4. Create Network + Organization

**Purpose**: Create new network and primary organization (org intent).

```http
POST /create-network-org
```

**Request**:

```json
{
  "networkName": "Acme Corp Network",
  "orgName": "Acme Corp",
  "venueName": "Main Office",
  "city": "New York",
  "state": "NY"
}
```

**Validation**:

- `networkName`: min 2 characters (must be unique)
- `orgName`: min 2 characters
- `venueName`, `city`, `state`: optional

**Response** (200 OK):

```json
{
  "ok": true,
  "networkId": "network-12345",
  "orgId": "org-67890",
  "role": "admin"
}
```

**Events Emitted**:

- `network.created`: New network initialized
- `org.created`: Primary org created
- `membership.created`: Admin added as member
- `onboarding.completed`: Onboarding marked complete (intent: create_org)

**Firestore Changes**:

- Creates: `networks/{networkId}`
- Creates: `orgs/{orgId}`
- Creates: `memberships/{memberId}`
- Updates: `users/{uid}.onboarding` → status: "completed"
- Appends: `events/{eventId}` × 4

**Error** (400 Bad Request):

```json
{
  "error": "network_name_taken",
  "details": {
    "networkName": "This network name already exists"
  }
}
```

---

### 5. Create Network + Corporate

**Purpose**: Create new network and corporate entity (corporate intent).

```http
POST /create-network-corporate
```

**Request**:

```json
{
  "networkName": "Startup Network",
  "corporateName": "Startup Inc"
}
```

**Validation**:

- `networkName`: min 2 characters (must be unique)
- `corporateName`: min 2 characters

**Response** (200 OK):

```json
{
  "ok": true,
  "networkId": "network-98765",
  "orgId": "org-54321",
  "role": "admin"
}
```

**Events Emitted**:

- `network.created`
- `corporate.created`
- `membership.created`
- `onboarding.completed` (intent: create_corporate)

**Firestore Changes**: Same as create-network-org, but creates `corporates/{corporateId}` instead of org

---

### 6. Activate Network

**Purpose**: Activate a pending network (admin-only).

```http
POST /activate-network
```

**Request**:

```json
{
  "networkId": "network-12345"
}
```

**Response** (200 OK):

```json
{
  "ok": true,
  "networkId": "network-12345",
  "status": "active"
}
```

**Events Emitted**:

- `network.activated`: Network status changed to active

**Firestore Changes**:

- Updates: `networks/{networkId}.status` → "active"
- Appends: `events/{eventId}`

**Error** (403 Forbidden - Not Admin):

```json
{
  "error": "not_authorized",
  "reason": "Only network admin can activate"
}
```

---

### 7. Join with Token

**Purpose**: Add user to existing network/org via join token.

```http
POST /join-with-token
```

**Request**:

```json
{
  "token": "join-token-abc123def456"
}
```

**Response** (200 OK):

```json
{
  "ok": true,
  "networkId": "network-12345",
  "orgId": "org-67890",
  "role": "staff"
}
```

**Token Format**:

```json
{
  "networkId": "network-12345",
  "orgId": "org-67890",
  "role": "staff",
  "expiresAt": 1699792800000,
  "maxUses": 10,
  "usedBy": ["user-1", "user-2"],
  "disabled": false
}
```

**Events Emitted**:

- `membership.created`: New member added
- `onboarding.completed` (intent: join_existing)

**Firestore Changes**:

- Creates: `memberships/{memberId}`
- Updates: `join-tokens/{tokenId}.usedBy` → append user uid
- Updates: `users/{uid}.onboarding` → status: "completed"
- Appends: `events/{eventId}` × 2

**Error** (404 Not Found - Invalid Token):

```json
{
  "error": "token_not_found"
}
```

**Error** (410 Gone - Token Expired):

```json
{
  "error": "token_expired"
}
```

**Error** (410 Gone - Token Max Uses Exceeded):

```json
{
  "error": "token_max_uses_exceeded"
}
```

---

## Event Types

All endpoints emit structured events to `collections/events`.

### Event Schema

```typescript
type Event = {
  id: string; // Auto-generated doc ID
  at: number; // Timestamp (ms)
  category: string; // e.g., "onboarding", "membership", "network"
  type: string; // e.g., "onboarding.completed"
  actorUserId: string; // User who triggered event
  networkId?: string; // Related network
  orgId?: string; // Related org
  venueId?: string; // Related venue
  payload: Record<string, any>; // Context-specific data
};
```

### Example Events

**Onboarding Completed**:

```json
{
  "at": 1699706400000,
  "category": "onboarding",
  "type": "onboarding.completed",
  "actorUserId": "user-123",
  "networkId": "network-12345",
  "orgId": "org-67890",
  "payload": {
    "intent": "create_org"
  }
}
```

**Membership Created**:

```json
{
  "at": 1699706400000,
  "category": "membership",
  "type": "membership.created",
  "actorUserId": "user-123",
  "networkId": "network-12345",
  "orgId": "org-67890",
  "payload": {
    "source": "onboarding.create-network-org",
    "role": "admin"
  }
}
```

---

## Common Error Responses

| Status | Error                 | Reason                             |
| ------ | --------------------- | ---------------------------------- |
| 400    | `validation_error`    | Request body failed Zod validation |
| 401    | `not_authenticated`   | Missing or invalid auth token      |
| 403    | `not_authorized`      | User lacks required permissions    |
| 404    | `token_not_found`     | Join token doesn't exist           |
| 410    | `token_expired`       | Join token has expired             |
| 429    | `rate_limit_exceeded` | Rate limit exceeded (5 req/min)    |
| 500    | `internal_error`      | Firestore or server error          |

---

## State Machine

```
[Not Started]
    ↓
[Profile] → (verify-eligibility)
    ↓
[Intent Selection]
    ├→ [Admin Form] → (create-network-org) → [Completed]
    ├→ [Admin Form] → (create-network-corporate) → [Completed]
    └→ [Join Token] → (join-with-token) → [Completed]
```

---

## Testing

### Manual Testing with Emulator

```bash
# 1. Start emulator
firebase emulators:start

# 2. Set env
export NEXT_PUBLIC_USE_EMULATORS=true

# 3. Start dev server
pnpm dev

# 4. Test endpoints via Postman or curl
curl -X POST http://localhost:3000/api/session/bootstrap \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" \
  -H "Content-Type: application/json"
```

### Unit Tests

```bash
pnpm test apps/web/app/api/onboarding/__tests__/endpoints.test.ts
```

### E2E Tests

```bash
pnpm test:e2e tests/e2e/onboarding-full-flow.spec.ts
```

---

## Implementation Notes

- **Stub Mode**: When `adminDb` is undefined, all endpoints return minimal stub responses (for local dev/testing)
- **Idempotency**: Session bootstrap is idempotent (safe to call multiple times)
- **Event Logging**: All state changes emit events to central event log for auditability
- **Rate Limiting**: Shared middleware enforces 5 req/min per user across all ONB endpoints
- **Firestore Transactions**: Network + org creation uses transactional writes for data consistency

---

**Last Updated**: November 11, 2025
**Maintained By**: Patrick Craven
**Related Files**:

- Schema definitions: `apps/web/app/api/onboarding/_shared/schemas.ts`
- Event types: `packages/types/src/events.ts`
- Event logger: `apps/web/src/lib/eventLog.ts`
- Rate limiting: `apps/web/app/api/onboarding/_shared/rateLimit.ts`
