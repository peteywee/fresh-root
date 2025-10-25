# API Documentation

This document provides detailed information about the Fresh Schedules API endpoints.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require authentication. Include the Firebase ID token in the Authorization header:

```http
Authorization: Bearer <firebase-id-token>
```

## Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}
```

### Common Error Codes

- `BAD_REQUEST` - Invalid request data (400)
- `UNAUTHORIZED` - Authentication required (401)
- `FORBIDDEN` - Insufficient permissions (403)
- `NOT_FOUND` - Resource not found (404)
- `INTERNAL` - Server error (500)

## Endpoints

### Health Check

#### GET /api/health

Check API health status.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Items (Demo)

#### GET /api/items

List items (demo endpoint).

**Response**:
```json
{
  "items": [
    {
      "id": "1",
      "name": "Item 1",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/items

Create a new item.

**Request**:
```json
{
  "name": "New Item"
}
```

**Response**:
```json
{
  "id": "2",
  "name": "New Item",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Validation**:
- `name`: Required, string, 1-100 characters

---

### User Profile

#### GET /api/users/profile

Get the current user's profile.

**Authentication**: Required

**Response**:
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "bio": "Software developer",
  "phoneNumber": "+1234567890",
  "photoURL": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "preferences": {
    "theme": "light",
    "notifications": true,
    "language": "en"
  }
}
```

#### PATCH /api/users/profile

Update the current user's profile.

**Authentication**: Required

**Request**:
```json
{
  "displayName": "Jane Doe",
  "bio": "Full-stack developer",
  "preferences": {
    "theme": "dark",
    "notifications": false
  }
}
```

**Response**:
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "displayName": "Jane Doe",
  "bio": "Full-stack developer",
  "preferences": {
    "theme": "dark",
    "notifications": false,
    "language": "en"
  },
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Validation**:
- `displayName`: Optional, string, 1-100 characters
- `bio`: Optional, string, max 500 characters
- `phoneNumber`: Optional, string, E.164 format
- `preferences.theme`: Optional, enum: `light`, `dark`, `auto`
- `preferences.notifications`: Optional, boolean
- `preferences.language`: Optional, string, 2 characters (ISO 639-1)

---

### Organizations

#### GET /api/organizations

List organizations the current user belongs to.

**Authentication**: Required

**Response**:
```json
{
  "organizations": [
    {
      "id": "org-1",
      "name": "Acme Corp",
      "description": "A great company",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "memberCount": 25
    }
  ]
}
```

#### POST /api/organizations

Create a new organization.

**Authentication**: Required

**Request**:
```json
{
  "name": "New Company",
  "description": "A new organization",
  "industry": "Technology",
  "size": "11-50"
}
```

**Response**:
```json
{
  "id": "org-123",
  "name": "New Company",
  "description": "A new organization",
  "industry": "Technology",
  "size": "11-50",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "memberCount": 1
}
```

**Validation**:
- `name`: Required, string, 1-100 characters
- `description`: Optional, string, max 500 characters
- `industry`: Optional, string
- `size`: Optional, enum: `1-10`, `11-50`, `51-200`, `201-500`, `500+`

#### GET /api/organizations/[id]

Get organization details.

**Authentication**: Required

**Parameters**:
- `id`: Organization ID (path parameter)

**Response**:
```json
{
  "id": "org-1",
  "name": "Acme Corp",
  "description": "A great company",
  "industry": "Technology",
  "size": "51-200",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "settings": {
    "allowPublicSchedules": false,
    "requireShiftApproval": true,
    "defaultShiftDuration": 8
  },
  "memberCount": 25
}
```

#### PATCH /api/organizations/[id]

Update organization details.

**Authentication**: Required (admin only)

**Parameters**:
- `id`: Organization ID (path parameter)

**Request**:
```json
{
  "name": "Updated Name",
  "settings": {
    "requireShiftApproval": false,
    "defaultShiftDuration": 6
  }
}
```

**Response**:
```json
{
  "id": "org-1",
  "name": "Updated Name",
  "settings": {
    "requireShiftApproval": false,
    "defaultShiftDuration": 6
  },
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Validation**:
- Same as POST /api/organizations, all fields optional
- `settings.allowPublicSchedules`: Optional, boolean
- `settings.requireShiftApproval`: Optional, boolean
- `settings.defaultShiftDuration`: Optional, number, positive

#### DELETE /api/organizations/[id]

Delete an organization.

**Authentication**: Required (admin only)

**Parameters**:
- `id`: Organization ID (path parameter)

**Response**:
```json
{
  "message": "Organization deleted successfully",
  "id": "org-1"
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- Anonymous requests: 100 requests per hour
- Authenticated requests: 1000 requests per hour

Rate limit headers:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Pagination

Endpoints that return lists support pagination:

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## Filtering and Sorting

Some endpoints support filtering and sorting:

**Query Parameters**:
- `sort`: Field to sort by (e.g., `createdAt`, `-createdAt` for descending)
- `filter[field]`: Filter by field value

**Example**:
```
GET /api/organizations?sort=-createdAt&filter[industry]=Technology
```

## Webhooks

Configure webhooks to receive real-time notifications:

**Events**:
- `schedule.published`
- `shift.created`
- `shift.updated`
- `member.added`
- `member.removed`

**Webhook Payload**:
```json
{
  "event": "schedule.published",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "organizationId": "org-1",
    "scheduleId": "schedule-1"
  }
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { apiFetch } from './lib/http'

// Get user profile
const profile = await apiFetch('/api/users/profile')

// Update profile
const updated = await apiFetch('/api/users/profile', {
  method: 'PATCH',
  body: JSON.stringify({
    displayName: 'New Name'
  })
})

// Create organization
const org = await apiFetch('/api/organizations', {
  method: 'POST',
  body: JSON.stringify({
    name: 'My Company'
  })
})
```

### cURL

```bash
# Get health status
curl https://api.example.com/api/health

# Create item (with auth)
curl -X POST https://api.example.com/api/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Item"}'

# Update user profile
curl -X PATCH https://api.example.com/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "Jane Doe"}'
```

## Best Practices

1. **Always validate input** - Use Zod schemas for validation
2. **Handle errors gracefully** - Return consistent error responses
3. **Use appropriate HTTP methods** - GET for reads, POST for creates, PATCH for updates, DELETE for deletes
4. **Include authentication** - Check user permissions before processing requests
5. **Rate limit** - Implement rate limiting to prevent abuse
6. **Document changes** - Update this documentation when adding/modifying endpoints
7. **Version your API** - Consider versioning for breaking changes

## Support

For questions or issues with the API:
- Open an issue on GitHub
- Check the [CONTRIBUTING.md](../../CONTRIBUTING.md) guide
- Review the [USAGE.md](../../USAGE.md) documentation
