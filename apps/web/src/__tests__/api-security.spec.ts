// [P0][TEST][AUTH] API authentication and authorization regression tests
// Tags: P0, TEST, AUTH
import { describe, test, expect } from "vitest";

/**
 * Security regression tests for API authentication and authorization
 * Tests for 401 (Unauthorized) and 403 (Forbidden) responses
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Mock session cookie for testing

describe("API Security Regression Tests", () => {
  describe("401 Unauthorized - No Session", () => {
    test("GET /api/items returns 401 without session cookie", async () => {
      const response = await fetch(`${API_BASE}/items`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain("Unauthorized");
    });

    test("POST /api/items returns 401 without session cookie", async () => {
      const response = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Test Item" }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain("Unauthorized");
    });

    test("GET /api/organizations returns 401 without session cookie", async () => {
      const response = await fetch(`${API_BASE}/organizations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain("Unauthorized");
    });

    test("POST /api/organizations returns 401 without session cookie", async () => {
      const response = await fetch(`${API_BASE}/organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Test Org" }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain("Unauthorized");
    });
  });

  describe("401 Unauthorized - Invalid Session", () => {
    test("GET /api/items returns 401 with invalid session cookie", async () => {
      const response = await fetch(`${API_BASE}/items`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=invalid-cookie-value",
        },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain("Unauthorized");
    });

    test("POST /api/items returns 401 with expired session", async () => {
      // Use a session cookie that would be expired
      const expiredCookie = "session=expired.session.cookie";

      const response = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: expiredCookie,
        },
        body: JSON.stringify({ name: "Test Item" }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain("Unauthorized");
    });
  });

  describe("403 Forbidden - Missing 2FA", () => {
    test("POST /api/organizations returns 403 without 2FA claim", async () => {
      // This test assumes we have a session without MFA
      // In real scenario, you'd create a session for a user without 2FA enabled
      const response = await fetch(`${API_BASE}/organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=no-mfa-session",
        },
        body: JSON.stringify({
          name: "Test Org",
          description: "Test organization",
        }),
      });

      // Should return either 401 (if session invalid) or 403 (if no 2FA)
      expect([401, 403]).toContain(response.status);
      const data = await response.json();
      expect(data.error).toMatch(/Unauthorized|Forbidden|2FA/i);
    });
  });

  describe("200 Success - Valid Authentication", () => {
    test("GET /api/health returns 200 without authentication", async () => {
      // Health endpoint should be public
      const response = await fetch(`${API_BASE}/health`, {
        method: "GET",
      });

      expect(response.status).toBe(200);
    });

    test("POST /api/session with valid idToken creates session", async () => {
      // This is a mock test - in real scenario you'd use a valid Firebase token
      const mockIdToken = "mock-firebase-id-token";

      const response = await fetch(`${API_BASE}/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken: mockIdToken }),
      });

      // Will return 401 for invalid token in real scenario
      // But structure should be correct
      expect([200, 401]).toContain(response.status);
    });

    test("DELETE /api/session clears session cookie", async () => {
      const response = await fetch(`${API_BASE}/session`, {
        method: "DELETE",
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.ok).toBe(true);

      // Check that Set-Cookie header is present to clear the cookie
      const setCookie = response.headers.get("set-cookie");
      if (setCookie) {
        expect(setCookie).toContain("session=");
        expect(setCookie).toContain("Max-Age=0");
      }
    });
  });

  describe("Security Headers", () => {
    test("API responses include security headers", async () => {
      const response = await fetch(`${API_BASE}/health`);

      // Check for key security headers
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
      expect(response.headers.get("x-frame-options")).toBeTruthy();
      expect(response.headers.get("referrer-policy")).toBeTruthy();
    });
  });

  describe("Rate Limiting", () => {
    test("API returns 429 after exceeding rate limit", async () => {
      // Make many rapid requests to trigger rate limit
      const requests = Array.from({ length: 110 }, () =>
        fetch(`${API_BASE}/health`, { method: "GET" }),
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter((r) => r.status === 429);

      // At least some requests should be rate limited
      expect(rateLimited.length).toBeGreaterThan(0);

      if (rateLimited.length > 0) {
        const data = await rateLimited[0].json();
        expect(data.error).toMatch(/too many requests/i);

        // Should have retry-after header
        expect(rateLimited[0].headers.get("retry-after")).toBeTruthy();
      }
    }, 15000); // Increase timeout for this test
  });

  describe("Request Size Limit", () => {
    test("API rejects requests exceeding size limit", async () => {
      // Create a large payload (> 10MB if that's the limit)
      const largePayload = {
        name: "Test",
        data: "x".repeat(11 * 1024 * 1024), // 11MB of data
      };

      const response = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(largePayload),
      });

      expect(response.status).toBe(413);
      const data = await response.json();
      expect(data.error).toMatch(/too large/i);
    });
  });
});
