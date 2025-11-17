# Block 3 API Reference

Complete reference for all onboarding and core API endpoints with request/response examples.

---

## Onboarding Endpoints

### 1. Profile Setup

**Endpoint**: `POST /api/onboarding/profile`

**Purpose**: Save user profile information (name, phone, timezone, role).

**Authentication**: Required (Firebase auth)

**Request Body**:

```json
{
  "fullName": "John Doe",
  "preferredName": "John",
  "phone": "+1-555-0123",
  "timeZone": "America/New_York",
  "selfDeclaredRole": "owner_founder_director"
}
```

**Schema Validation**:

- `fullName`: Required, string, min 2 chars
- `preferredName`: Required, string, min 1 char
- `phone`: Required, valid phone number
- `timeZone`: Required, valid IANA timezone
- `selfDeclaredRole`: Required, one of: `owner_founder_director`, `key_executive`, `manager`, `other`

**Success Response** (200):

```json
{
  "ok": true,
  "uid": "user123",
  "profile": {
    "fullName": "John Doe",
    "preferredName": "John",
    "phone": "+1-555-0123",
    "timeZone": "America/New_York",
    "selfDeclaredRole": "owner_founder_director",
    "createdAt": 1699704000000,
    "updatedAt": 1699704000000
  }
}
```

**Error Responses**:

- `401`: Not authenticated
- `400`: Invalid JSON
- `422`: Validation error with details

---

### 2. Verify Eligibility

**Endpoint**: `POST /api/onboarding/verify-eligibility`

**Purpose**: Check if user is eligible to create organizations (role-based + email verification).

**Authentication**: Required (Firebase auth)

**Request Body**: Empty or minimal

```json
{}
```

**Success Response** (200):

```json
{
  "allowed": true,
  "reason": null,
  "effectiveRole": "owner_founder_director",
  "rate_limit_remaining": 4
}
```

**Rejection Response** (200, but `allowed: false`):

```json
{
  "allowed": false,
  "reason": "email_not_verified",
  "effectiveRole": null,
  "rate_limit_remaining": 3
}
```

**Possible rejection reasons**:

- `email_not_verified`: User email is not verified
- `role_not_allowed`: User role is staff/restricted

**Rate Limiting**:

- Limit: 5 requests per hour per user
- Returns `429` when exceeded
- Include `rate_limit_remaining` in successful responses

**Error Responses**:

- `401`: Not authenticated
- `429`: Rate limit exceeded

---

### 3. Admin Responsibility Form

**Endpoint**: `POST /api/onboarding/admin-form`

**Purpose**: Collect admin responsibility declaration for compliance/liability purposes.

**Authentication**: Required (Firebase auth)

**Request Body**:

```json
{
  "legalEntityName": "Acme Corp Inc",
  "taxId": "12-3456789",
  "countryCode": "US",
  "businessEmail": "admin@acme.com",
  "businessPhone": "+1-555-0100",
  "liabilityAcknowledged": true,
  "termsAcceptedVersion": "TOS-2025-01",
  "privacyAcceptedVersion": "PRIV-2025-01",
  "adminSignature": {
    "type": "typed",
    "value": "John Doe"
  }
}
```

**Schema Validation**:

- `legalEntityName`: Required, string
- `taxId`: Required, string (format validated per country)
- `countryCode`: Required, valid ISO 3166-1 alpha-2
- `businessEmail`: Required, valid email
- `businessPhone`: Required, valid phone
- `liabilityAcknowledged`: Required, boolean (must be true)
- `termsAcceptedVersion`: Required if true, format: `TOS-YYYY-MM`
- `privacyAcceptedVersion`: Required if true, format: `PRIV-YYYY-MM`
- `adminSignature`: Required, object with `type` and `value`

**Success Response** (200):

```json
{
  "ok": true,
  "formToken": "form_abc123def456",
  "formId": "adminForm_xyz789",
  "savedAt": 1699704000000
}
```

The `formToken` is used as input for `create-network-org` or `create-network-corporate`.

**Error Responses**:

- `401`: Not authenticated
- `400`: Invalid JSON
- `422`: Validation error (e.g., missing required fields, invalid tax ID format)

---

### 4. Create Network + Organization

**Endpoint**: `POST /api/onboarding/create-network-org`

**Purpose**: Create a new network and organization with a primary venue.

**Authentication**: Required (Firebase auth)

**Request Body**:

```json
{
  "orgName": "Acme Corporation",
  "venueName": "Main Office",
  "formToken": "form_abc123def456",
  "location": {
    "street1": "123 Main St",
    "street2": "",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "countryCode": "US",
    "timeZone": "America/New_York"
  }
}
```

**Schema Validation**:

- `orgName`: Required, string, min 1 char
- `venueName`: Required, string, min 1 char
- `formToken`: Required, valid form token from admin-form endpoint
- `location`: Optional, object with address fields

**Success Response** (201):

```json
{
  "ok": true,
  "networkId": "network_abc123",
  "orgId": "org_def456",
  "venueId": "venue_ghi789",
  "onboardingStatus": "complete",
  "redirectTo": "/app/dashboard"
}
```

**Events Emitted**:

- `network.created` - Network document created
- `org.created` - Organization document created
- `venue.created` - Primary venue created
- `onboarding.completed` - User's onboarding marked complete

**Error Responses**:

- `401`: Not authenticated
- `400`: Invalid JSON or form token
- `422`: Validation error
- `500`: Database error

---

### 5. Create Network + Corporate

**Endpoint**: `POST /api/onboarding/create-network-corporate`

**Purpose**: Create a corporate parent entity (for multi-org structures).

**Authentication**: Required (Firebase auth)

**Request Body**:

```json
{
  "corporateName": "Acme Holdings LLC",
  "brandName": "Acme",
  "formToken": "form_abc123def456"
}
```

**Schema Validation**:

- `corporateName`: Required, string
- `brandName`: Optional, string
- `formToken`: Required, valid form token

**Success Response** (201):

```json
{
  "ok": true,
  "networkId": "network_corporate_abc123",
  "corporateId": "corp_def456",
  "onboardingStatus": "complete"
}
```

**Events Emitted**:

- `network.created`
- `onboarding.completed`

---

### 6. Join with Token

**Endpoint**: `POST /api/onboarding/join-with-token`

**Purpose**: User joins existing organization using invite token.

**Authentication**: Required (Firebase auth)

**Request Body**:

```json
{
  "joinToken": "token_abc123def456xyz789"
}
```

**Schema Validation**:

- `joinToken`: Required, valid token format

**Success Response** (200):

```json
{
  "ok": true,
  "networkId": "network_abc123",
  "orgId": "org_def456",
  "membershipId": "member_ghi789",
  "role": "manager",
  "onboardingStatus": "complete"
}
```

**Possible Failures**:

- Token not found (404)
- Token expired (410)
- Token max uses exceeded (410)
- User already member (409)

**Events Emitted**:

- `membership.created`
- `onboarding.completed`

---

### 7. Activate Network

**Endpoint**: `PUT /api/onboarding/activate-network`

**Purpose**: Transition network from `pending` to `active` status (admin-only).

**Authentication**: Required (Firebase auth + admin role)

**Request Body**:

```json
{
  "networkId": "network_abc123"
}
```

**Schema Validation**:

- `networkId`: Required, valid network ID

**Success Response** (200):

```json
{
  "ok": true,
  "networkId": "network_abc123",
  "status": "active",
  "activatedAt": 1699704000000
}
```

**Error Responses**:

- `401`: Not authenticated
- `403`: Not authorized (not admin)
- `404`: Network not found
- `409`: Network already active or in invalid state

**Events Emitted**:

- `network.activated`

---

## Core Collection Endpoints

### Organizations

#### Create Organization

**Endpoint**: `POST /api/organizations`

**Request**:

```json
{
  "name": "New Org",
  "slug": "new-org",
  "size": "small",
  "status": "active"
}
```

**Response** (201):

```json
{
  "id": "org_abc123",
  "name": "New Org",
  "slug": "new-org",
  "ownerId": "user123",
  "createdAt": 1699704000000
}
```

#### Get Organizations

**Endpoint**: `GET /api/organizations`

**Response** (200):

```json
{
  "organizations": [
    {
      "id": "org_abc123",
      "name": "New Org",
      "slug": "new-org",
      "ownerId": "user123"
    }
  ]
}
```

#### Update Organization

**Endpoint**: `PUT /api/organizations/[id]`

**Request**:

```json
{
  "name": "Updated Org",
  "size": "medium"
}
```

---

### Positions

#### Create Position

**Endpoint**: `POST /api/positions`

**Request**:

```json
{
  "orgId": "org_abc123",
  "name": "Cashier",
  "description": "Point of sale operator",
  "type": "front_of_house",
  "skillLevel": "entry",
  "isActive": true
}
```

#### Update Position

**Endpoint**: `PUT /api/positions/[id]`

---

### Venues

#### Create Venue

**Endpoint**: `POST /api/venues`

**Request**:

```json
{
  "orgId": "org_abc123",
  "name": "Main Location",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "US",
  "timeZone": "America/New_York",
  "isActive": true
}
```

---

### Shifts

#### Create Shift

**Endpoint**: `POST /api/shifts`

**Request**:

```json
{
  "orgId": "org_abc123",
  "scheduleId": "sched_def456",
  "venueId": "venue_ghi789",
  "zoneId": "zone_jkl012",
  "start": 1699704000000,
  "end": 1699707600000,
  "status": "draft",
  "assignedUserId": "user_abc123"
}
```

**Validation**:

- `start` < `end` (required)
- `status` in: `draft`, `published`, `canceled`

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "error_code",
  "message": "Human-readable message",
  "issues": {}
}
```

**Common error codes**:

- `not_authenticated` - No auth session
- `invalid_json` - JSON parse failed
- `validation_error` - Zod schema validation failed
- `not_authorized` - Auth OK but insufficient permissions
- `not_found` - Resource not found
- `conflict` - Duplicate or state conflict
- `rate_limited` - Rate limit exceeded
- `server_error` - Internal server error

**Validation error format**:

```json
{
  "error": "validation_error",
  "issues": {
    "fieldErrors": {
      "orgName": ["String must contain at least 1 character"]
    },
    "formErrors": []
  }
}
```

---

## Authentication & Security

### Session Headers

All authenticated endpoints require a valid Firebase session. The framework automatically handles:

- Session cookie verification
- Custom claims extraction (`orgId`, `networkId`, `role`)
- 2FA requirement checks for sensitive operations

### Role-Based Access

Available roles:

- `org_owner` - Full org access
- `admin` - Administrative access
- `manager` - Team management
- `scheduler` - Schedule creation/editing
- `corporate` - Corporate administrative
- `staff` - Staff member (limited access)

---

## Rate Limiting

Certain endpoints implement rate limiting:

| Endpoint             | Limit          | Window     |
| -------------------- | -------------- | ---------- |
| `verify-eligibility` | 5 requests     | 1 hour     |
| `admin-form`         | 10 submissions | 24 hours   |
| Login attempts       | 5 attempts     | 15 minutes |

Responses include `rate_limit_remaining` header.

---

## Webhook Events

When events are emitted, they're available via the event log API:

**Endpoint**: `GET /api/events`

**Query Parameters**:

- `after`: Unix timestamp (ms) - return events after this time
- `networkId`: Filter by network
- `type`: Filter by event type

**Response**:

```json
{
  "events": [
    {
      "id": "event_abc123",
      "at": 1699704000000,
      "type": "org.created",
      "category": "org",
      "actorUserId": "user123",
      "networkId": "network_abc123",
      "orgId": "org_def456",
      "payload": {
        "orgName": "Acme Corp"
      }
    }
  ]
}
```

---

## Testing with Emulator

### Setup

```bash
# Start Firebase emulator
firebase emulators:start

# Set environment variable in another terminal
export NEXT_PUBLIC_USE_EMULATORS=true

# Start dev server
pnpm dev
```

### Creating Test Data

Use the seeders in `scripts/seed/`:

```bash
# Seed emulator with test organizations
pnpm tsx scripts/seed/seed.emulator.ts

# Simulate auth for testing
pnpm sim:auth
```

### Inspecting Data

Visit the emulator UI:

- Firestore: `http://localhost:4000`
- Auth: `http://localhost:4000/auth`
- Event Log: Filter in Firestore by collection `events`

---

## Common Workflows

### Complete Onboarding Flow

```text
1. POST /api/onboarding/profile
   → Save user profile

2. POST /api/onboarding/verify-eligibility
   → Check if eligible

3. POST /api/onboarding/admin-form
   → Save compliance form
   → Get formToken

4. POST /api/onboarding/create-network-org
   → Create network + org
   → Mark onboarding complete
```

### Invite User to Organization

```text
1. Admin creates join token (internal)
   → POST /api/join-tokens

2. User receives token via email

3. User posts to join-with-token
   → POST /api/onboarding/join-with-token
   → User is now member
```

### Add Staff Member

```text
1. Admin creates position
   → POST /api/positions

2. Admin creates shift
   → POST /api/shifts

3. Admin assigns user to shift
   → PUT /api/shifts/[id]

4. User sees shift in schedule
   → GET /api/shifts?orgId=...
```

---

**Last Updated**: November 11, 2025
**API Version**: v14 (Block 3)
