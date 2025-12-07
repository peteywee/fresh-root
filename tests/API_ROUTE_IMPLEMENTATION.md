# API Route Testing Implementation Guide

**Document Type**: Phase 3E - API Integration Test Templates  
**Priority**: P1 Important  
**Status**: Ready for Codespace execution  

---

## API Route Testing - Complete Implementation Guide

### Overview

This guide provides templates and specifications for testing all API routes. Each route requires:

1. **Happy Path Tests** - normal operation
2. **Authorization Tests** - RBAC enforcement
3. **Input Validation Tests** - Zod schema validation
4. **Error Handling Tests** - graceful failures
5. **Integration Tests** - Firebase operations
6. **E2E Tests** - full request/response flow

---

## Route Testing Template

### Pattern: GET Endpoint

```typescript
// [P1][TEST][API_GET] Test suite: GET /api/schedules
// Tags: P1, TEST, API_GET, INTEGRATION

import { describe, it, expect, beforeEach } from 'vitest';
import { createMockRequest } from '@fresh-schedules/api-framework/testing';
import { GET } from './route';

describe('GET /api/schedules', () => {
  let request: NextRequest;

  beforeEach(() => {
    request = createMockRequest('/api/schedules', {
      cookies: { session: 'valid-token' },
      searchParams: { orgId: 'org-123' }
    });
  });

  // ===== Happy Path (3 cases) =====

  it('should return all schedules for org', async () => {
    // GIVEN: Authenticated org member
    // WHEN: GET /api/schedules?orgId=org-123
    const response = await GET(request, { params: {} });

    // THEN: 200 OK with schedule array
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should return empty array when no schedules', async () => {
    // GIVEN: Org with no schedules
    // WHEN: GET /api/schedules?orgId=org-empty
    const emptyRequest = createMockRequest('/api/schedules', {
      cookies: { session: 'valid-token' },
      searchParams: { orgId: 'org-empty' }
    });

    // THEN: 200 OK with empty array
    const response = await GET(emptyRequest, { params: {} });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data).toEqual([]);
  });

  it('should include schedule metadata', async () => {
    // GIVEN: Valid request
    // WHEN: GET executed
    const response = await GET(request, { params: {} });
    const data = await response.json();

    // THEN: Each schedule has required fields
    if (data.data.length > 0) {
      const schedule = data.data[0];
      expect(schedule.id).toBeDefined();
      expect(schedule.name).toBeDefined();
      expect(schedule.orgId).toBeDefined();
      expect(schedule.createdAt).toBeDefined();
    }
  });

  // ===== Authorization (3 cases) =====

  it('should require org membership', async () => {
    // GIVEN: User not in org
    const unknownOrgRequest = createMockRequest('/api/schedules', {
      cookies: { session: 'valid-token' },
      searchParams: { orgId: 'org-unknown' }
    });

    // WHEN: GET executed
    const response = await GET(unknownOrgRequest, { params: {} });

    // THEN: 403 Forbidden
    expect(response.status).toBe(403);
  });

  it('should reject unauthenticated requests', async () => {
    // GIVEN: No session cookie
    const unauthRequest = createMockRequest('/api/schedules', {
      cookies: {},
      searchParams: { orgId: 'org-123' }
    });

    // WHEN: GET executed
    const response = await GET(unauthRequest, { params: {} });

    // THEN: 401 Unauthorized
    expect(response.status).toBe(401);
  });

  it('should allow staff role or higher', async () => {
    // GIVEN: Staff user (lowest role)
    const staffRequest = createMockRequest('/api/schedules', {
      cookies: { session: 'staff-token' },
      searchParams: { orgId: 'org-123' }
    });

    // WHEN: GET executed
    const response = await GET(staffRequest, { params: {} });

    // THEN: 200 OK (read-only access)
    expect(response.status).toBe(200);
  });

  // ===== Response Format (2 cases) =====

  it('should return correct Content-Type header', async () => {
    const response = await GET(request, { params: {} });

    expect(response.headers.get('Content-Type')).toContain('application/json');
  });

  it('should include request ID in response headers', async () => {
    const response = await GET(request, { params: {} });

    expect(response.headers.get('X-Request-ID')).toBeDefined();
  });

  // ===== Query Parameters (3 cases) =====

  it('should support limit parameter', async () => {
    // GIVEN: limit=10 query param
    const limitRequest = createMockRequest('/api/schedules', {
      cookies: { session: 'valid-token' },
      searchParams: { orgId: 'org-123', limit: '10' }
    });

    // WHEN: GET executed
    const response = await limitRequest(request, { params: {} });
    const data = await response.json();

    // THEN: At most 10 results
    expect(data.data.length).toBeLessThanOrEqual(10);
  });

  it('should support offset/pagination', async () => {
    // GIVEN: offset=20 query param
    const pageRequest = createMockRequest('/api/schedules', {
      cookies: { session: 'valid-token' },
      searchParams: { orgId: 'org-123', offset: '20' }
    });

    // WHEN: GET executed with pagination
    // THEN: Results skip first 20 records
    // (Response doesn't include first 20 items)
  });

  it('should support sorting', async () => {
    // GIVEN: sort=createdAt:desc
    const sortRequest = createMockRequest('/api/schedules', {
      cookies: { session: 'valid-token' },
      searchParams: { orgId: 'org-123', sort: 'createdAt:desc' }
    });

    // WHEN: GET executed
    const response = await GET(sortRequest, { params: {} });
    const data = await response.json();

    // THEN: Results sorted by createdAt descending
    if (data.data.length > 1) {
      expect(data.data[0].createdAt).toBeGreaterThanOrEqual(data.data[1].createdAt);
    }
  });

  // ===== Performance (2 cases) =====

  it('should respond in <200ms', async () => {
    const start = performance.now();
    await GET(request, { params: {} });
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(200);
  });

  it('should not trigger N+1 queries', async () => {
    // (Requires query logging in test environment)
    // WHEN: GET executed
    // THEN: Query count scales linearly with result count, not exponentially
  });
});
```

### Pattern: POST Endpoint

```typescript
// [P1][TEST][API_POST] Test suite: POST /api/schedules
// Tags: P1, TEST, API_POST, CREATE, VALIDATION

describe('POST /api/schedules', () => {
  // ===== Happy Path =====

  it('should create schedule with valid input', async () => {
    const request = createMockRequest('/api/schedules', {
      method: 'POST',
      body: {
        name: 'Summer Schedule',
        startDate: 1704067200000,
        endDate: 1711929600000
      },
      cookies: { session: 'manager-token' },
      searchParams: { orgId: 'org-123' }
    });

    const response = await POST(request, { params: {} });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBeDefined();
    expect(data.name).toBe('Summer Schedule');
  });

  it('should return created schedule with ID', async () => {
    // GIVEN: Valid POST request
    // WHEN: POST executed
    const response = await POST(request, { params: {} });

    // THEN: Response includes generated ID
    const data = await response.json();
    expect(data.id).toMatch(/^[a-zA-Z0-9_-]+$/);
  });

  it('should set audit fields (createdAt, createdBy)', async () => {
    // WHEN: Schedule created
    const response = await POST(request, { params: {} });
    const data = await response.json();

    // THEN: Audit fields populated
    expect(data.createdAt).toBeDefined();
    expect(data.createdBy).toBeDefined();
    expect(typeof data.createdAt).toBe('number');
  });

  // ===== Authorization =====

  it('should require manager role or higher', async () => {
    // GIVEN: Staff user (insufficient role)
    const staffRequest = createMockRequest('/api/schedules', {
      method: 'POST',
      body: { name: 'Test' },
      cookies: { session: 'staff-token' },
      searchParams: { orgId: 'org-123' }
    });

    // WHEN: POST executed
    const response = await POST(staffRequest, { params: {} });

    // THEN: 403 Forbidden
    expect(response.status).toBe(403);
  });

  it('should allow manager, admin, and org_owner', async () => {
    const roles = ['manager', 'admin', 'org_owner'];

    for (const role of roles) {
      const request = createMockRequest('/api/schedules', {
        method: 'POST',
        body: { name: 'Test' },
        cookies: { session: `${role}-token` },
        searchParams: { orgId: 'org-123' }
      });

      const response = await POST(request, { params: {} });
      expect(response.status).toBe(201);
    }
  });

  // ===== Input Validation =====

  it('should reject missing required fields', async () => {
    const request = createMockRequest('/api/schedules', {
      method: 'POST',
      body: { startDate: 1704067200000 }, // missing name, endDate
      cookies: { session: 'manager-token' },
      searchParams: { orgId: 'org-123' }
    });

    const response = await POST(request, { params: {} });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe('VALIDATION_FAILED');
    expect(data.error.details.name).toBeDefined();
    expect(data.error.details.endDate).toBeDefined();
  });

  it('should reject invalid date range (endDate < startDate)', async () => {
    const request = createMockRequest('/api/schedules', {
      method: 'POST',
      body: {
        name: 'Invalid Range',
        startDate: 1711929600000,
        endDate: 1704067200000 // earlier than startDate
      },
      cookies: { session: 'manager-token' },
      searchParams: { orgId: 'org-123' }
    });

    const response = await POST(request, { params: {} });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.details.endDate).toBeDefined();
  });

  it('should reject oversized input', async () => {
    const bigBody = {
      name: 'x'.repeat(10000),
      startDate: 1704067200000,
      endDate: 1711929600000
    };

    const request = createMockRequest('/api/schedules', {
      method: 'POST',
      body: bigBody,
      cookies: { session: 'manager-token' },
      searchParams: { orgId: 'org-123' }
    });

    const response = await POST(request, { params: {} });

    expect(response.status).toBe(413); // Payload Too Large
  });

  // ===== Side Effects & Idempotency =====

  it('should not create duplicate if request retried', async () => {
    // GIVEN: Valid request
    const request = createMockRequest('/api/schedules', {
      method: 'POST',
      body: { name: 'Test', startDate: 1704067200000, endDate: 1711929600000 },
      cookies: { session: 'manager-token' },
      searchParams: { orgId: 'org-123' }
    });

    // WHEN: Same request executed twice
    const response1 = await POST(request, { params: {} });
    const data1 = await response1.json();

    const response2 = await POST(request, { params: {} });
    const data2 = await response2.json();

    // THEN: Same ID returned (idempotent or rejected)
    expect(data1.id).toBe(data2.id);
  });

  it('should trigger audit log', async () => {
    // WHEN: Schedule created
    // THEN: Audit log entry created with:
    //   - action: 'CREATE'
    //   - entityType: 'Schedule'
    //   - entityId: <created-id>
    //   - actor: <creator-userId>
    //   - timestamp: <now>
  });

  // ===== CSRF Protection =====

  it('should require CSRF token for POST', async () => {
    const request = createMockRequest('/api/schedules', {
      method: 'POST',
      body: { name: 'Test' },
      cookies: { session: 'manager-token' },
      headers: {} // missing X-CSRF-Token
    });

    const response = await POST(request, { params: {} });

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error.code).toBe('CSRF_VALIDATION_FAILED');
  });

  // ===== Rate Limiting =====

  it('should enforce rate limit for POST', async () => {
    // GIVEN: Rate limit of 10 POST requests per minute
    // WHEN: 11 requests made in rapid succession
    // THEN: 11th request rejected with 429
  });

  // ===== Error Handling =====

  it('should handle database errors gracefully', async () => {
    // GIVEN: Database connection fails
    // WHEN: POST executed
    // THEN: 500 Internal Server Error with safe message (no stack trace)
  });

  it('should return helpful error messages', async () => {
    // GIVEN: Invalid input
    // WHEN: POST executed
    // THEN: Error message explains problem (not generic "Error")
  });
});
```

### Pattern: PATCH Endpoint

```typescript
// [P1][TEST][API_PATCH] Test suite: PATCH /api/schedules/[id]
// Tags: P1, TEST, API_PATCH, UPDATE, MODIFICATION

describe('PATCH /api/schedules/:id', () => {
  const scheduleId = 'schedule-123';

  // ===== Happy Path =====

  it('should update schedule with valid input', async () => {
    const request = createMockRequest(`/api/schedules/${scheduleId}`, {
      method: 'PATCH',
      body: { name: 'Updated Name' },
      cookies: { session: 'manager-token' },
      searchParams: { orgId: 'org-123' }
    });

    const response = await PATCH(request, { params: { id: scheduleId } });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.name).toBe('Updated Name');
  });

  it('should update only provided fields (partial update)', async () => {
    // GIVEN: PATCH with { name: 'New Name' }
    // WHEN: PATCH executed
    // THEN: Only name updated, other fields unchanged
  });

  it('should update updatedAt timestamp', async () => {
    // WHEN: PATCH executed
    // THEN: updatedAt field set to current time
  });

  // ===== Field Immutability =====

  it('should reject changes to immutable fields (id, orgId)', async () => {
    const request = createMockRequest(`/api/schedules/${scheduleId}`, {
      method: 'PATCH',
      body: { id: 'different-id', orgId: 'org-999' },
      cookies: { session: 'manager-token' },
      searchParams: { orgId: 'org-123' }
    });

    const response = await PATCH(request, { params: { id: scheduleId } });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.details).toContain('id');
  });

  // ===== Concurrent Updates =====

  it('should detect concurrent modifications (optimistic locking)', async () => {
    // GIVEN: Schedule with etag "v1"
    // WHEN: Two PATCH requests with same etag
    // THEN: First succeeds, second fails with 409 Conflict
  });

  // ===== Authorization =====

  it('should require manager role or higher', async () => {
    const request = createMockRequest(`/api/schedules/${scheduleId}`, {
      method: 'PATCH',
      body: { name: 'Updated' },
      cookies: { session: 'staff-token' },
      searchParams: { orgId: 'org-123' }
    });

    const response = await PATCH(request, { params: { id: scheduleId } });

    expect(response.status).toBe(403);
  });

  // ===== State Transitions =====

  it('should enforce valid state transitions', async () => {
    // GIVEN: Schedule in "published" state
    // WHEN: PATCH tries to change status to invalid value
    // THEN: Rejected with validation error
  });
});
```

### Pattern: DELETE Endpoint

```typescript
// [P1][TEST][API_DELETE] Test suite: DELETE /api/schedules/[id]
// Tags: P1, TEST, API_DELETE, REMOVAL

describe('DELETE /api/schedules/:id', () => {
  const scheduleId = 'schedule-123';

  // ===== Happy Path =====

  it('should delete existing schedule', async () => {
    const request = createMockRequest(`/api/schedules/${scheduleId}`, {
      method: 'DELETE',
      cookies: { session: 'admin-token' },
      searchParams: { orgId: 'org-123' }
    });

    const response = await DELETE(request, { params: { id: scheduleId } });

    expect(response.status).toBe(204); // No Content
  });

  it('should return 404 for non-existent resource', async () => {
    const request = createMockRequest('/api/schedules/nonexistent', {
      method: 'DELETE',
      cookies: { session: 'admin-token' },
      searchParams: { orgId: 'org-123' }
    });

    const response = await DELETE(request, { params: { id: 'nonexistent' } });

    expect(response.status).toBe(404);
  });

  // ===== Authorization =====

  it('should require admin role or higher', async () => {
    const request = createMockRequest(`/api/schedules/${scheduleId}`, {
      method: 'DELETE',
      cookies: { session: 'manager-token' },
      searchParams: { orgId: 'org-123' }
    });

    const response = await DELETE(request, { params: { id: scheduleId } });

    expect(response.status).toBe(403);
  });

  // ===== Cascade & Dependencies =====

  it('should handle cascade deletion', async () => {
    // GIVEN: Schedule with related shifts
    // WHEN: DELETE executed
    // THEN: All related shifts deleted (or error if not allowed)
  });

  it('should prevent deletion if active dependents exist', async () => {
    // GIVEN: Schedule with active shifts
    // WHEN: DELETE attempted
    // THEN: 409 Conflict with message about active dependents
  });

  // ===== Idempotency =====

  it('should be idempotent (safe to retry)', async () => {
    // GIVEN: Schedule already deleted
    // WHEN: DELETE executed again
    // THEN: Returns 204 (or 404, but safely)
  });

  // ===== Audit Trail =====

  it('should create deletion audit log', async () => {
    // WHEN: DELETE executed
    // THEN: Audit log entry created:
    //   - action: 'DELETE'
    //   - entityType: 'Schedule'
    //   - entityId: scheduleId
    //   - actor: userId
    //   - timestamp: now
  });

  // ===== Recovery =====

  it('should support soft delete (data recoverable)', async () => {
    // WHEN: DELETE executed
    // THEN: Schedule marked as deleted (timestamp set)
    //       but data preserved in database
  });
});
```

---

## Test Case Count Summary

### Per Route Type

- **GET**: ~10-12 test cases
- **POST**: ~15-18 test cases  
- **PATCH**: ~12-15 test cases
- **DELETE**: ~12-15 test cases

### Total for Major Routes (12 routes)

- **Accounts**: 40 test cases
- **Organizations**: 40 test cases
- **Schedules**: 50 test cases (complex)
- **Shifts**: 50 test cases (critical)
- **Positions**: 35 test cases
- **Staff**: 35 test cases
- **Venues**: 35 test cases
- **Reporting**: 40 test cases
- **Onboarding**: 40 test cases
- **Settings**: 30 test cases
- **Notifications**: 35 test cases
- **Billing**: 35 test cases

**Total API Route Tests**: ~430 test cases

---

## Implementation Command (for Codespace)

```bash
# Week 2: Generate all API route tests
pnpm test -- --reporter=verbose --run

# After generation, validate:
pnpm test -- --coverage --reporter=verbose

# Check 10/10 quality gates
# (CI/CD blocks if coverage < targets)
```

---

**Auto-maintained by**: `.github/workflows/test-coverage.yml`  
**Status**: Ready for Phase 4 (Codespace implementation)  
**Next**: Begin API route test generation in Week 2
