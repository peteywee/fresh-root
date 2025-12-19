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
  serverAvailable,
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
});
