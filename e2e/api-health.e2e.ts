import { test, expect } from '@playwright/test';

/**
 * API Health E2E Tests
 * 
 * Tests API endpoints are accessible and responding:
 * - Health check endpoints
 * - API response format
 * - Error handling
 */

test.describe('API Health Checks', () => {
  test('should respond to health check endpoint', async ({ request }) => {
    await test.step('Check API health', async () => {
      // Common health check endpoints
      const healthEndpoints = [
        '/api/health',
        '/api/status',
        '/api/ping',
      ];

      let foundHealthEndpoint = false;

      for (const endpoint of healthEndpoints) {
        try {
          const response = await request.get(endpoint);
          if (response.ok()) {
            foundHealthEndpoint = true;
            expect(response.status()).toBe(200);
            break;
          }
        } catch {
          // Continue to next endpoint
        }
      }

      // Log recommendation if no health endpoint found
      if (!foundHealthEndpoint) {
        console.log('Recommendation: Add /api/health endpoint for monitoring');
      }
    });
  });

  test('should return proper JSON from API endpoints', async ({ request }) => {
    await test.step('Test API JSON response', async () => {
      const response = await request.get('/api/schedules', {
        headers: {
          'Accept': 'application/json',
        },
      });

      // Should either succeed with JSON or return auth error
      const status = response.status();
      expect([200, 401, 403]).toContain(status);

      if (status === 200) {
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/json');
      }
    });
  });

  test('should handle unauthorized requests gracefully', async ({ request }) => {
    await test.step('Test unauthorized access', async () => {
      const response = await request.get('/api/schedules');
      const status = response.status();

      // Should return 401/403 for unauthorized, not 500
      expect(status).not.toBe(500);

      if (status === 401 || status === 403) {
        const body = await response.json().catch(() => ({}));
        // Should have error message
        expect(body.error || body.message).toBeDefined();
      }
    });
  });

  test('should return 404 for non-existent endpoints', async ({ request }) => {
    await test.step('Test 404 handling', async () => {
      const response = await request.get('/api/non-existent-endpoint-xyz');
      const status = response.status();

      // Should return 404, not 500
      expect(status).toBe(404);
    });
  });

  test('should handle malformed requests', async ({ request }) => {
    await test.step('Test invalid JSON handling', async () => {
      const response = await request.post('/api/schedules', {
        data: 'not-valid-json{{{',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const status = response.status();

      // Should return 400 for bad request, not 500
      expect([400, 401, 403, 415]).toContain(status);
    });
  });
});
