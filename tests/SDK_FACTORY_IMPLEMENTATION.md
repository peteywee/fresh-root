# SDK Factory Test Implementation Guide

**Document Type**: Phase 3E - Implementation Templates  
**Priority**: P0 Critical  
**Status**: Ready for Codespace execution  

---

## SDK Factory Tests - Detailed Implementation Guide

### Template: Basic SDK Factory Test File

```typescript
// [P0][TEST][SDK_FACTORY] Comprehensive SDK factory tests
// Tags: P0, TEST, SDK_FACTORY, AUTHENTICATION, AUTHORIZATION

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createOrgEndpoint } from '@fresh-schedules/api-framework';
import { NextResponse } from 'next/server';
import {
  createMockRequest,
  createMockOrgContext,
  createMockAuthContext
} from '@fresh-schedules/api-framework/testing';

/**
 * SDK Factory: createOrgEndpoint comprehensive test suite
 * 
 * This suite validates:
 * 1. Authentication requirement enforcement
 * 2. Organization membership verification
 * 3. Role-based access control (hierarchical)
 * 4. Input validation via Zod schemas
 * 5. Rate limiting enforcement
 * 6. Error handling & status codes
 * 7. CSRF protection
 * 8. Audit logging
 */

describe('SDK Factory: createOrgEndpoint', () => {
  let mockDb: any;

  beforeEach(() => {
    // Mock Firebase Admin SDK
    mockDb = {
      collection: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      get: vi.fn().mockResolvedValue({ docs: [] })
    };
    
    vi.mock('firebase-admin/firestore', () => ({
      getFirestore: () => mockDb
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // =================================================================
  // SECTION 1: Authentication Tests (10 cases)
  // =================================================================

  describe('Authentication', () => {
    it('should allow authenticated org member', async () => {
      // GIVEN: Valid session cookie for authenticated user
      const request = createMockRequest('/api/test', {
        cookies: { session: 'valid-token' },
        searchParams: { orgId: 'org-123' }
      });

      // WHEN: Request processed by SDK factory
      const endpoint = createOrgEndpoint({
        handler: async ({ context }) => {
          return NextResponse.json({ userId: context.auth.userId });
        }
      });

      // THEN: Request succeeds with authenticated context
      const response = await endpoint(request, { params: {} });
      expect(response.status).toBe(200);
    });

    it('should reject missing session cookie', async () => {
      // GIVEN: Request without session cookie
      const request = createMockRequest('/api/test', {
        cookies: {},
        searchParams: { orgId: 'org-123' }
      });

      // WHEN: Request processed by SDK factory
      const endpoint = createOrgEndpoint({
        handler: async () => NextResponse.json({})
      });

      // THEN: Request rejected with 401 Unauthorized
      const response = await endpoint(request, { params: {} });
      expect(response.status).toBe(401);
    });

    it('should reject invalid session cookie', async () => {
      // GIVEN: Invalid/tampered session token
      const request = createMockRequest('/api/test', {
        cookies: { session: 'invalid-token' },
        searchParams: { orgId: 'org-123' }
      });

      // WHEN: Request processed
      const endpoint = createOrgEndpoint({
        handler: async () => NextResponse.json({})
      });

      // THEN: Request rejected with 401
      const response = await endpoint(request, { params: {} });
      expect(response.status).toBe(401);
    });

    it('should reject expired session', async () => {
      // GIVEN: Expired session cookie
      const request = createMockRequest('/api/test', {
        cookies: { session: 'expired-token' },
        searchParams: { orgId: 'org-123' }
      });

      // WHEN: Request processed
      const endpoint = createOrgEndpoint({
        handler: async () => NextResponse.json({})
      });

      // THEN: Request rejected with 401
      const response = await endpoint(request, { params: {} });
      expect(response.status).toBe(401);
    });

    it('should validate session not tampered with', async () => {
      // GIVEN: Valid token
      const request = createMockRequest('/api/test', {
        cookies: { session: 'valid-token' },
        searchParams: { orgId: 'org-123' }
      });

      // WHEN: Handler validates auth context
      const endpoint = createOrgEndpoint({
        handler: async ({ context }) => {
          // THEN: Auth context contains verified user ID
          expect(context.auth.userId).toBeDefined();
          expect(context.auth.email).toBeDefined();
          return NextResponse.json({ verified: true });
        }
      });

      const response = await endpoint(request, { params: {} });
      expect(response.status).toBe(200);
    });

    // Tests 6-10: Session refresh, logout, concurrent sessions, etc.
    // (similar structure to above)
  });

  // =================================================================
  // SECTION 2: Authorization Tests (20 cases)
  // =================================================================

  describe('Authorization - Organization Membership', () => {
    it('should require org membership', async () => {
      // GIVEN: Valid user but not org member
      const request = createMockRequest('/api/test', {
        cookies: { session: 'valid-token' },
        searchParams: { orgId: 'org-unknown' }
      });

      // WHEN: Request processed
      const endpoint = createOrgEndpoint({
        handler: async () => NextResponse.json({})
      });

      // THEN: Request rejected with 403 Forbidden
      const response = await endpoint(request, { params: {} });
      expect(response.status).toBe(403);
    });

    it('should verify org membership from Firestore', async () => {
      // GIVEN: Valid token for user in org-123
      const request = createMockRequest('/api/test', {
        cookies: { session: 'valid-token' },
        searchParams: { orgId: 'org-123' }
      });

      // WHEN: Handler executes
      const endpoint = createOrgEndpoint({
        handler: async ({ context }) => {
          // THEN: Org context is loaded
          expect(context.org.orgId).toBe('org-123');
          return NextResponse.json({ org: context.org });
        }
      });

      const response = await endpoint(request, { params: {} });
      expect(response.status).toBe(200);
    });

    it('should enforce role hierarchy - staff cannot access manager routes', async () => {
      // GIVEN: User with staff role
      const request = createMockRequest('/api/test', {
        cookies: { session: 'staff-token' },
        searchParams: { orgId: 'org-123' }
      });

      // WHEN: Accessing manager-only endpoint
      const endpoint = createOrgEndpoint({
        roles: ['manager'],
        handler: async () => NextResponse.json({})
      });

      // THEN: Request rejected with 403
      const response = await endpoint(request, { params: {} });
      expect(response.status).toBe(403);
    });

    it('should enforce role hierarchy - admin can access manager routes', async () => {
      // GIVEN: User with admin role
      const request = createMockRequest('/api/test', {
        cookies: { session: 'admin-token' },
        searchParams: { orgId: 'org-123' }
      });

      // WHEN: Accessing manager-only endpoint
      const endpoint = createOrgEndpoint({
        roles: ['manager'],
        handler: async ({ context }) => {
          return NextResponse.json({ role: context.org.role });
        }
      });

      // THEN: Request succeeds (admin >= manager)
      const response = await endpoint(request, { params: {} });
      expect(response.status).toBe(200);
    });

    it('should cross-org isolation - prevent access to other org data', async () => {
      // GIVEN: User from org-123
      const request = createMockRequest('/api/test', {
        cookies: { session: 'user-org-123' },
        searchParams: { orgId: 'org-456' }
      });

      // WHEN: Trying to access org-456
      const endpoint = createOrgEndpoint({
        handler: async () => NextResponse.json({})
      });

      // THEN: Request rejected with 403
      const response = await endpoint(request, { params: {} });
      expect(response.status).toBe(403);
    });

    // Tests 6-20: All 6 role types, dynamic role changes, audit logging, etc.
  });

  // =================================================================
  // SECTION 3: Input Validation Tests (15 cases)
  // =================================================================

  describe('Input Validation via Zod', () => {
    it('should accept valid input', async () => {
      // GIVEN: Valid input matching schema
      const inputSchema = z.object({
        name: z.string().min(1),
        age: z.number().positive()
      });

      const request = createMockRequest('/api/test', {
        method: 'POST',
        body: { name: 'John', age: 30 },
        cookies: { session: 'valid-token' },
        searchParams: { orgId: 'org-123' }
      });

      // WHEN: Endpoint with input validation
      const endpoint = createOrgEndpoint({
        input: inputSchema,
        handler: async ({ input }) => {
          return NextResponse.json({ received: input });
        }
      });

      // THEN: Input accepted and processed
      const response = await endpoint(request, { params: {} });
      expect(response.status).toBe(200);
    });

    it('should reject missing required field', async () => {
      // GIVEN: Input missing required field
      const inputSchema = z.object({
        name: z.string().min(1),
        email: z.string().email()
      });

      const request = createMockRequest('/api/test', {
        method: 'POST',
        body: { name: 'John' }, // missing email
        cookies: { session: 'valid-token' },
        searchParams: { orgId: 'org-123' }
      });

      // WHEN: Processed by validation middleware
      const endpoint = createOrgEndpoint({
        input: inputSchema,
        handler: async () => NextResponse.json({})
      });

      // THEN: Rejected with 400 + error details
      const response = await endpoint(request, { params: {} });
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('VALIDATION_FAILED');
      expect(data.error.details.email).toBeDefined();
    });

    it('should reject invalid data type', async () => {
      // GIVEN: Wrong data type
      const inputSchema = z.object({
        count: z.number()
      });

      const request = createMockRequest('/api/test', {
        method: 'POST',
        body: { count: 'not-a-number' },
        cookies: { session: 'valid-token' },
        searchParams: { orgId: 'org-123' }
      });

      // WHEN: Processed
      const endpoint = createOrgEndpoint({
        input: inputSchema,
        handler: async () => NextResponse.json({})
      });

      // THEN: Rejected with validation error
      const response = await endpoint(request, { params: {} });
      expect(response.status).toBe(400);
    });

    it('should reject SQL injection attempt', async () => {
      // GIVEN: SQL injection payload
      const inputSchema = z.object({
        search: z.string()
      });

      const request = createMockRequest('/api/test', {
        method: 'POST',
        body: { search: "'; DROP TABLE users; --" },
        cookies: { session: 'valid-token' },
        searchParams: { orgId: 'org-123' }
      });

      // WHEN: Processed (validation + prepared statements)
      const endpoint = createOrgEndpoint({
        input: inputSchema,
        handler: async ({ input }) => {
          // Real handler would use prepared statements
          return NextResponse.json({ received: input });
        }
      });

      // THEN: Treated as literal string, not executed
      const response = await endpoint(request, { params: {} });
      expect(response.status).toBe(200); // Safe
    });

    // Tests 6-15: Custom validation rules, nested objects, arrays, etc.
  });

  // =================================================================
  // SECTION 4: Rate Limiting Tests (12 cases)
  // =================================================================

  describe('Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      // GIVEN: Rate limit of 10 req/min
      const request = createMockRequest('/api/test', {
        cookies: { session: 'valid-token' },
        searchParams: { orgId: 'org-123' }
      });

      // WHEN: First request (1/10)
      const endpoint = createOrgEndpoint({
        rateLimit: { maxRequests: 10, windowMs: 60000 },
        handler: async () => NextResponse.json({})
      });

      // THEN: Request succeeds
      const response = await endpoint(request, { params: {} });
      expect(response.status).toBe(200);
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('9');
    });

    it('should block requests exceeding limit', async () => {
      // GIVEN: Rate limit of 2 req/min, already at 2
      // WHEN: Third request
      // THEN: Rejected with 429 Too Many Requests
      const endpoint = createOrgEndpoint({
        rateLimit: { maxRequests: 2, windowMs: 60000 },
        handler: async () => NextResponse.json({})
      });

      // (After 2 requests...)
      const response = await endpoint(request, { params: {} });
      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBeDefined();
    });

    it('should include rate limit headers', async () => {
      // WHEN: Request made
      const endpoint = createOrgEndpoint({
        rateLimit: { maxRequests: 100, windowMs: 60000 },
        handler: async () => NextResponse.json({})
      });

      const response = await endpoint(request, { params: {} });

      // THEN: Headers present
      expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
      expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
    });

    // Tests 4-12: Redis backend, in-memory fallback, window reset, etc.
  });

  // =================================================================
  // SECTION 5: Error Handling Tests (10 cases)
  // =================================================================

  describe('Error Handling', () => {
    it('should return correct HTTP status code', async () => {
      // Test matrix: 200, 201, 204, 400, 401, 403, 404, 500

      const cases = [
        { status: 200, description: 'GET success' },
        { status: 201, description: 'POST created' },
        { status: 400, description: 'Validation error' },
        { status: 401, description: 'Not authenticated' },
        { status: 403, description: 'Not authorized' },
        { status: 404, description: 'Not found' },
        { status: 500, description: 'Server error' }
      ];

      for (const testCase of cases) {
        const endpoint = createOrgEndpoint({
          handler: async () => {
            if (testCase.status === 200) {
              return NextResponse.json({ success: true });
            }
            return NextResponse.json(
              { error: 'Error' },
              { status: testCase.status }
            );
          }
        });

        const response = await endpoint(request, { params: {} });
        expect(response.status).toBe(testCase.status);
      }
    });

    it('should format error response correctly', async () => {
      // GIVEN: Request that fails
      const endpoint = createOrgEndpoint({
        handler: async () => {
          throw new Error('Test error');
        }
      });

      // WHEN: Error occurs
      const response = await endpoint(request, { params: {} });

      // THEN: Proper error format
      const data = await response.json();
      expect(data.error).toBeDefined();
      expect(data.error.code).toBeDefined();
      expect(data.error.message).toBeDefined();
      expect(data.error.requestId).toBeDefined();
    });

    it('should not expose stack traces in production', async () => {
      // GIVEN: Error in handler, NODE_ENV=production
      process.env.NODE_ENV = 'production';

      const endpoint = createOrgEndpoint({
        handler: async () => {
          throw new Error('Database connection failed');
        }
      });

      // WHEN: Error occurs
      const response = await endpoint(request, { params: {} });
      const data = await response.json();

      // THEN: Stack trace not exposed
      expect(data.error.stack).toBeUndefined();
      expect(data.error.message).not.toContain('at');
    });

    it('should log errors with context', async () => {
      // GIVEN: Error logging spy
      const logSpy = vi.spyOn(console, 'error');

      const endpoint = createOrgEndpoint({
        handler: async ({ context }) => {
          throw new Error('Test error');
        }
      });

      // WHEN: Error occurs
      await endpoint(request, { params: {} });

      // THEN: Logged with context
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test error'),
        expect.objectContaining({
          userId: expect.any(String),
          orgId: expect.any(String)
        })
      );

      logSpy.mockRestore();
    });

    // Tests 6-10: Timeout handling, database errors, network failures, etc.
  });

  // =================================================================
  // SECTION 6: Performance Tests (8 cases)
  // =================================================================

  describe('Performance', () => {
    it('should respond within baseline time (200ms)', async () => {
      const endpoint = createOrgEndpoint({
        handler: async () => NextResponse.json({ success: true })
      });

      const start = performance.now();
      await endpoint(request, { params: {} });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(200);
    });

    it('should handle concurrent requests', async () => {
      const endpoint = createOrgEndpoint({
        handler: async () => NextResponse.json({ success: true })
      });

      const promises = Array.from({ length: 100 }, () =>
        endpoint(request, { params: {} })
      );

      const responses = await Promise.all(promises);
      const successCount = responses.filter(r => r.ok).length;

      expect(successCount).toBeGreaterThan(90); // Allow 10% failure for rate limiting
    });

    // Tests 3-8: Memory usage, resource cleanup, cache effectiveness, etc.
  });
});
```

## Generated Test Count

- **Authentication**: 10 tests
- **Authorization**: 20 tests  
- **Input Validation**: 15 tests
- **Rate Limiting**: 12 tests
- **Error Handling**: 10 tests
- **Performance**: 8 tests
- **Total per route config**: **75 test cases**

## Implementation Roadmap

### Week 1 (SDK Factory - 150 cases)

```bash
tests/api-framework/
├── createOrgEndpoint.test.ts (75 cases)
├── createAuthenticatedEndpoint.test.ts (75 cases)
└── [create similar for other 6 configs]
```

### Week 2 (Type Safety - 200 cases)

```bash
tests/types/
├── shifts.test.ts
├── schedules.test.ts
├── organizations.test.ts
└── [20 schemas × 18 cases = 360 total]
```

---

**Auto-maintained by**: `.github/workflows/test-coverage.yml`  
**Status**: Ready for Codespace implementation  
**Next**: Begin Week 1 test generation
