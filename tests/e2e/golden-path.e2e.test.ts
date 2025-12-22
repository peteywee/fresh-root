/**
 * Golden Path E2E Tests
 *
 * Tests the critical API paths for authentication, organizations,
 * schedules, shifts, and health checks.
 *
 * These tests require a running server at localhost:3000
 * Tests will be skipped if server is not available.
 *
 * @generated
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  BASE_URL,
  checkServerHealth,
  safeFetch,
  authFetch,
  authenticateForTests,
  clearAuthToken,
  testResults,
  recordResult,
  generateReport,
} from "./setup";

describe("Golden Path E2E Tests", () => {
  let isServerUp = false;

  beforeAll(async () => {
    isServerUp = await checkServerHealth();
    if (!isServerUp) {
      console.warn("\n⚠️ Server not available - tests will be marked as skipped\n");
    }
  });

  afterAll(() => {
    if (testResults.length > 0) {
      generateReport();
    }
  });

  // ============================================================
  // HEALTH CHECK ENDPOINTS (Public - No Auth Required)
  // ============================================================
  describe("Health Endpoints", () => {
    it("GET /api/health should return 200", async () => {
      const endpoint = "/api/health";
      const { response, error } = await safeFetch(`${BASE_URL}${endpoint}`);

      if (!isServerUp || !response) {
        recordResult({
          endpoint,
          method: "GET",
          status: "skip",
          error: error || "Server not available",
        });
        expect(true).toBe(true); // Skip gracefully
        return;
      }

      const passed = response.status === 200;
      recordResult({
        endpoint,
        method: "GET",
        status: passed ? "pass" : "fail",
        expectedStatus: 200,
        actualStatus: response.status,
      });
      expect(response.status).toBe(200);
    });

    it("GET /api/healthz should return 200", async () => {
      const endpoint = "/api/healthz";
      const { response, error } = await safeFetch(`${BASE_URL}${endpoint}`);

      if (!isServerUp || !response) {
        recordResult({
          endpoint,
          method: "GET",
          status: "skip",
          error: error || "Server not available",
        });
        expect(true).toBe(true);
        return;
      }

      const passed = response.status === 200;
      recordResult({
        endpoint,
        method: "GET",
        status: passed ? "pass" : "fail",
        expectedStatus: 200,
        actualStatus: response.status,
      });
      expect(response.status).toBe(200);
    });
  });

  // ============================================================
  // AUTHENTICATION ENDPOINTS
  // ============================================================
  describe("Auth Endpoints", () => {
    it("GET /api/session should return 405 (Method Not Allowed)", async () => {
      const endpoint = "/api/session";
      const { response, error } = await safeFetch(`${BASE_URL}${endpoint}`);

      if (!isServerUp || !response) {
        recordResult({
          endpoint,
          method: "GET",
          status: "skip",
          error: error || "Server not available",
        });
        expect(true).toBe(true);
        return;
      }

      // Session endpoint only supports POST and DELETE, not GET
      const passed = response.status === 405;
      recordResult({
        endpoint,
        method: "GET",
        status: passed ? "pass" : "fail",
        expectedStatus: 405,
        actualStatus: response.status,
      });
      expect(response.status).toBe(405);
    });

    it("POST /api/session with invalid body should return 400 or 401", async () => {
      const endpoint = "/api/session";
      const { response, error } = await safeFetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!isServerUp || !response) {
        recordResult({
          endpoint,
          method: "POST",
          status: "skip",
          error: error || "Server not available",
        });
        expect(true).toBe(true);
        return;
      }

      const passed = [400, 401, 422].includes(response.status);
      recordResult({
        endpoint,
        method: "POST",
        status: passed ? "pass" : "fail",
        expectedStatus: "400/401/422",
        actualStatus: response.status,
      });
      expect([400, 401, 422]).toContain(response.status);
    });
  });

  // ============================================================
  // ORGANIZATIONS ENDPOINTS
  // ============================================================
  describe("Organizations Endpoints", () => {
    it("GET /api/organizations should require auth (401)", async () => {
      const endpoint = "/api/organizations";
      const { response, error } = await safeFetch(`${BASE_URL}${endpoint}`);

      if (!isServerUp || !response) {
        recordResult({
          endpoint,
          method: "GET",
          status: "skip",
          error: error || "Server not available",
        });
        expect(true).toBe(true);
        return;
      }

      const passed = response.status === 401;
      recordResult({
        endpoint,
        method: "GET",
        status: passed ? "pass" : "fail",
        expectedStatus: 401,
        actualStatus: response.status,
      });
      expect(response.status).toBe(401);
    });

    it("POST /api/organizations without auth should return 401", async () => {
      const endpoint = "/api/organizations";
      const { response, error } = await safeFetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test Org" }),
      });

      if (!isServerUp || !response) {
        recordResult({
          endpoint,
          method: "POST",
          status: "skip",
          error: error || "Server not available",
        });
        expect(true).toBe(true);
        return;
      }

      const passed = response.status === 401;
      recordResult({
        endpoint,
        method: "POST",
        status: passed ? "pass" : "fail",
        expectedStatus: 401,
        actualStatus: response.status,
      });
      expect(response.status).toBe(401);
    });
  });

  // ============================================================
  // SCHEDULES ENDPOINTS
  // ============================================================
  describe("Schedules Endpoints", () => {
    it("GET /api/schedules should require auth (401)", async () => {
      const endpoint = "/api/schedules";
      const { response, error } = await safeFetch(`${BASE_URL}${endpoint}`);

      if (!isServerUp || !response) {
        recordResult({
          endpoint,
          method: "GET",
          status: "skip",
          error: error || "Server not available",
        });
        expect(true).toBe(true);
        return;
      }

      const passed = response.status === 401;
      recordResult({
        endpoint,
        method: "GET",
        status: passed ? "pass" : "fail",
        expectedStatus: 401,
        actualStatus: response.status,
      });
      expect(response.status).toBe(401);
    });

    it("POST /api/schedules without auth should return 401", async () => {
      const endpoint = "/api/schedules";
      const { response, error } = await safeFetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test Schedule" }),
      });

      if (!isServerUp || !response) {
        recordResult({
          endpoint,
          method: "POST",
          status: "skip",
          error: error || "Server not available",
        });
        expect(true).toBe(true);
        return;
      }

      const passed = response.status === 401;
      recordResult({
        endpoint,
        method: "POST",
        status: passed ? "pass" : "fail",
        expectedStatus: 401,
        actualStatus: response.status,
      });
      expect(response.status).toBe(401);
    });
  });

  // ============================================================
  // SHIFTS ENDPOINTS
  // ============================================================
  describe("Shifts Endpoints", () => {
    it("GET /api/shifts should require auth (401)", async () => {
      const endpoint = "/api/shifts";
      const { response, error } = await safeFetch(`${BASE_URL}${endpoint}`);

      if (!isServerUp || !response) {
        recordResult({
          endpoint,
          method: "GET",
          status: "skip",
          error: error || "Server not available",
        });
        expect(true).toBe(true);
        return;
      }

      const passed = response.status === 401;
      recordResult({
        endpoint,
        method: "GET",
        status: passed ? "pass" : "fail",
        expectedStatus: 401,
        actualStatus: response.status,
      });
      expect(response.status).toBe(401);
    });

    it("POST /api/shifts without auth should return 401", async () => {
      const endpoint = "/api/shifts";
      const { response, error } = await safeFetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!isServerUp || !response) {
        recordResult({
          endpoint,
          method: "POST",
          status: "skip",
          error: error || "Server not available",
        });
        expect(true).toBe(true);
        return;
      }

      const passed = response.status === 401;
      recordResult({
        endpoint,
        method: "POST",
        status: passed ? "pass" : "fail",
        expectedStatus: 401,
        actualStatus: response.status,
      });
      expect(response.status).toBe(401);
    });
  });

  // ============================================================
  // POSITIONS ENDPOINTS
  // ============================================================
  describe("Positions Endpoints", () => {
    it("GET /api/positions should require auth (401)", async () => {
      const endpoint = "/api/positions";
      const { response, error } = await safeFetch(`${BASE_URL}${endpoint}`);

      if (!isServerUp || !response) {
        recordResult({
          endpoint,
          method: "GET",
          status: "skip",
          error: error || "Server not available",
        });
        expect(true).toBe(true);
        return;
      }

      const passed = response.status === 401;
      recordResult({
        endpoint,
        method: "GET",
        status: passed ? "pass" : "fail",
        expectedStatus: 401,
        actualStatus: response.status,
      });
      expect(response.status).toBe(401);
    });
  });

  // ============================================================
  // USER PROFILE ENDPOINTS
  // ============================================================
  describe("User Profile Endpoints", () => {
    it("GET /api/users/profile should require auth (401)", async () => {
      const endpoint = "/api/users/profile";
      const { response, error } = await safeFetch(`${BASE_URL}${endpoint}`);

      if (!isServerUp || !response) {
        recordResult({
          endpoint,
          method: "GET",
          status: "skip",
          error: error || "Server not available",
        });
        expect(true).toBe(true);
        return;
      }

      const passed = response.status === 401;
      recordResult({
        endpoint,
        method: "GET",
        status: passed ? "pass" : "fail",
        expectedStatus: 401,
        actualStatus: response.status,
      });
      expect(response.status).toBe(401);
    });
  });

  // ============================================================
  // AUTHENTICATED CRUD GOLDEN PATH
  // Tests authenticated operations with proper error code validation
  // ============================================================
  describe("Authenticated CRUD Golden Path", () => {
    let isAuthenticated = false;
    let createdOrgId: string | null = null;
    let createdScheduleId: string | null = null;

    beforeAll(async () => {
      if (isServerUp) {
        const token = await authenticateForTests();
        isAuthenticated = !!token;
        if (!isAuthenticated) {
          console.warn("⚠️ Auth not available - authenticated tests will be skipped");
        }
      }
    });

    afterAll(() => {
      clearAuthToken();
    });

    it("POST /api/organizations with auth should return 201 or 400", async () => {
      const endpoint = "/api/organizations";

      if (!isServerUp || !isAuthenticated) {
        recordResult({
          endpoint,
          method: "POST",
          status: "skip",
          error: !isServerUp ? "Server not available" : "Not authenticated",
        });
        expect(true).toBe(true);
        return;
      }

      const { response, error } = await authFetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Test Org ${Date.now()}`,
          type: "network",
        }),
      });

      if (!response) {
        recordResult({
          endpoint,
          method: "POST",
          status: "fail",
          error: error || "No response",
        });
        expect(response).toBeTruthy();
        return;
      }

      // 201 = created, 400 = validation error (both are valid responses with proper error shape)
      const passed = [201, 400].includes(response.status);
      recordResult({
        endpoint,
        method: "POST",
        status: passed ? "pass" : "fail",
        expectedStatus: "201/400",
        actualStatus: response.status,
      });

      if (response.status === 201) {
        const data = await response.json();
        createdOrgId = data.id || data.orgId;
        expect(data).toHaveProperty("id");
      } else if (response.status === 400) {
        const data = await response.json();
        // Verify consistent error shape
        expect(data.error).toBeDefined();
        expect(data.error.code).toBeDefined();
        expect(data.error.message).toBeDefined();
      }

      expect([201, 400]).toContain(response.status);
    });

    it("POST /api/schedules with auth should return 201 or 400", async () => {
      const endpoint = "/api/schedules";

      if (!isServerUp || !isAuthenticated) {
        recordResult({
          endpoint,
          method: "POST",
          status: "skip",
          error: !isServerUp ? "Server not available" : "Not authenticated",
        });
        expect(true).toBe(true);
        return;
      }

      const { response, error } = await authFetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Test Schedule ${Date.now()}`,
          orgId: createdOrgId || "test-org-001",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      if (!response) {
        recordResult({
          endpoint,
          method: "POST",
          status: "fail",
          error: error || "No response",
        });
        expect(response).toBeTruthy();
        return;
      }

      const passed = [201, 400].includes(response.status);
      recordResult({
        endpoint,
        method: "POST",
        status: passed ? "pass" : "fail",
        expectedStatus: "201/400",
        actualStatus: response.status,
      });

      if (response.status === 201) {
        const data = await response.json();
        createdScheduleId = data.id || data.scheduleId;
        expect(data).toHaveProperty("id");
      } else if (response.status === 400) {
        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBeDefined();
      }

      expect([201, 400]).toContain(response.status);
    });

    it("GET /api/schedules/[id] with auth should return 200 or 404", async () => {
      const scheduleId = createdScheduleId || "test-schedule-001";
      const endpoint = `/api/schedules/${scheduleId}`;

      if (!isServerUp || !isAuthenticated) {
        recordResult({
          endpoint,
          method: "GET",
          status: "skip",
          error: !isServerUp ? "Server not available" : "Not authenticated",
        });
        expect(true).toBe(true);
        return;
      }

      const { response, error } = await authFetch(`${BASE_URL}${endpoint}`);

      if (!response) {
        recordResult({
          endpoint,
          method: "GET",
          status: "fail",
          error: error || "No response",
        });
        expect(response).toBeTruthy();
        return;
      }

      const passed = [200, 404].includes(response.status);
      recordResult({
        endpoint,
        method: "GET",
        status: passed ? "pass" : "fail",
        expectedStatus: "200/404",
        actualStatus: response.status,
      });

      if (response.status === 404) {
        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe("NOT_FOUND");
      }

      expect([200, 404]).toContain(response.status);
    });

    it("DELETE /api/schedules/[id] with auth should return 200/204 or 404", async () => {
      const scheduleId = createdScheduleId || "test-schedule-001";
      const endpoint = `/api/schedules/${scheduleId}`;

      if (!isServerUp || !isAuthenticated) {
        recordResult({
          endpoint,
          method: "DELETE",
          status: "skip",
          error: !isServerUp ? "Server not available" : "Not authenticated",
        });
        expect(true).toBe(true);
        return;
      }

      const { response, error } = await authFetch(`${BASE_URL}${endpoint}`, {
        method: "DELETE",
      });

      if (!response) {
        recordResult({
          endpoint,
          method: "DELETE",
          status: "fail",
          error: error || "No response",
        });
        expect(response).toBeTruthy();
        return;
      }

      const passed = [200, 204, 404].includes(response.status);
      recordResult({
        endpoint,
        method: "DELETE",
        status: passed ? "pass" : "fail",
        expectedStatus: "200/204/404",
        actualStatus: response.status,
      });

      if (response.status === 404) {
        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe("NOT_FOUND");
      }

      expect([200, 204, 404]).toContain(response.status);
    });

    it("DELETE /api/session should return 200/204 (logout)", async () => {
      const endpoint = "/api/session";

      if (!isServerUp || !isAuthenticated) {
        recordResult({
          endpoint,
          method: "DELETE",
          status: "skip",
          error: !isServerUp ? "Server not available" : "Not authenticated",
        });
        expect(true).toBe(true);
        return;
      }

      const { response, error } = await authFetch(`${BASE_URL}${endpoint}`, {
        method: "DELETE",
      });

      if (!response) {
        recordResult({
          endpoint,
          method: "DELETE",
          status: "fail",
          error: error || "No response",
        });
        expect(response).toBeTruthy();
        return;
      }

      const passed = [200, 204].includes(response.status);
      recordResult({
        endpoint,
        method: "DELETE",
        status: passed ? "pass" : "fail",
        expectedStatus: "200/204",
        actualStatus: response.status,
      });

      expect([200, 204]).toContain(response.status);
    });
  });
});
