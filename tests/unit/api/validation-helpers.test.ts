// [P0][TEST][UNIT] API Validation Helper Tests
// Tags: P0, TEST, UNIT, VALIDATION

import { describe, it, expect } from "vitest";
import {
  unauthorized,
  forbidden,
  notFound,
  badRequest,
  serverError,
  rateLimited,
  ok,
} from "../../../apps/web/app/api/_shared/validation";

describe("API Validation Helpers", () => {
  describe("unauthorized()", () => {
    it("should return 401 status with UNAUTHORIZED code", async () => {
      const response = unauthorized();
      expect(response.status).toBe(401);

      const json = await response.json();
      expect(json).toMatchObject({
        error: {
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        },
      });
    });

    it("should support custom message", async () => {
      const response = unauthorized("Invalid session");
      const json = await response.json();
      expect(json.error.message).toBe("Invalid session");
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("should support custom code", async () => {
      const response = unauthorized("Bad auth", "AUTH_FAILED");
      const json = await response.json();
      expect(json.error.code).toBe("AUTH_FAILED");
    });
  });

  describe("forbidden()", () => {
    it("should return 403 status with FORBIDDEN code", async () => {
      const response = forbidden();
      expect(response.status).toBe(403);

      const json = await response.json();
      expect(json).toMatchObject({
        error: {
          code: "FORBIDDEN",
          message: "Forbidden",
        },
      });
    });

    it("should support custom message", async () => {
      const response = forbidden("2FA required");
      const json = await response.json();
      expect(json.error.message).toBe("2FA required");
      expect(json.error.code).toBe("FORBIDDEN");
    });
  });

  describe("notFound()", () => {
    it("should return 404 status with NOT_FOUND code", async () => {
      const response = notFound();
      expect(response.status).toBe(404);

      const json = await response.json();
      expect(json).toMatchObject({
        error: {
          code: "NOT_FOUND",
          message: "Not found",
        },
      });
    });

    it("should support custom message", async () => {
      const response = notFound("Organization not found");
      const json = await response.json();
      expect(json.error.message).toBe("Organization not found");
    });
  });

  describe("badRequest()", () => {
    it("should return 400 status with BAD_REQUEST code", async () => {
      const response = badRequest("Validation failed");
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json).toMatchObject({
        error: {
          code: "BAD_REQUEST",
          message: "Validation failed",
        },
      });
    });

    it("should include validation details", async () => {
      const details = { fields: ["email", "password"] };
      const response = badRequest("Validation failed", details);
      const json = await response.json();
      expect(json.error.details).toEqual(details);
    });

    it("should support custom code", async () => {
      const response = badRequest("Invalid input", undefined, "VALIDATION_ERROR");
      const json = await response.json();
      expect(json.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("rateLimited()", () => {
    it("should return 429 status with RATE_LIMITED code", async () => {
      const resetAt = Date.now() + 60000; // 60 seconds from now
      const response = rateLimited(resetAt);

      expect(response.status).toBe(429);
      const json = await response.json();
      expect(json.error.code).toBe("RATE_LIMITED");
    });

    it("should include Retry-After header", async () => {
      const resetAt = Date.now() + 60000;
      const response = rateLimited(resetAt);

      const retryAfter = response.headers.get("Retry-After");
      expect(retryAfter).toBeDefined();
      expect(parseInt(retryAfter!)).toBeGreaterThan(0);
      expect(parseInt(retryAfter!)).toBeLessThanOrEqual(60);
    });

    it("should enforce minimum 1 second Retry-After", async () => {
      const resetAt = Date.now() + 100; // 100ms from now
      const response = rateLimited(resetAt);

      const retryAfter = parseInt(response.headers.get("Retry-After")!);
      expect(retryAfter).toBeGreaterThanOrEqual(1);
    });

    it("should support custom message", async () => {
      const resetAt = Date.now() + 60000;
      const response = rateLimited(resetAt, "Too many login attempts");

      const json = await response.json();
      expect(json.error.message).toBe("Too many login attempts");
    });
  });

  describe("serverError()", () => {
    it("should return 500 status with INTERNAL code", async () => {
      const response = serverError();
      expect(response.status).toBe(500);

      const json = await response.json();
      expect(json).toMatchObject({
        error: {
          code: "INTERNAL",
          message: "Internal Server Error",
        },
      });
    });

    it("should support custom message", async () => {
      const response = serverError("Database connection failed");
      const json = await response.json();
      expect(json.error.message).toBe("Database connection failed");
    });

    it("should support custom code", async () => {
      const response = serverError("Database error", undefined, "DB_ERROR");
      const json = await response.json();
      expect(json.error.code).toBe("DB_ERROR");
    });

    it("should include error details if provided", async () => {
      const details = { query: "SELECT * FROM users" };
      const response = serverError("Query failed", details);
      const json = await response.json();
      expect(json.error.details).toEqual(details);
    });
  });

  describe("ok()", () => {
    it("should return 200 status", async () => {
      const response = ok({ success: true });
      expect(response.status).toBe(200);
    });

    it("should return provided data", async () => {
      const data = { id: "123", name: "Test" };
      const response = ok(data);
      const json = await response.json();
      expect(json).toEqual(data);
    });

    it("should handle array data", async () => {
      const data = [{ id: "1" }, { id: "2" }];
      const response = ok(data);
      const json = await response.json();
      expect(json).toEqual(data);
    });
  });

  describe("Error Response Shape Consistency", () => {
    it("all 4xx errors should have consistent shape", async () => {
      const errors = [
        unauthorized("Test"),
        forbidden("Test"),
        notFound("Test"),
        badRequest("Test"),
      ];

      for (const response of errors) {
        const json = await response.json();
        expect(json).toHaveProperty("error.code");
        expect(json).toHaveProperty("error.message");
        expect(typeof json.error.code).toBe("string");
        expect(typeof json.error.message).toBe("string");
      }
    });

    it("all error responses should be parseable JSON", async () => {
      const errors = [
        unauthorized("Test"),
        forbidden("Test"),
        notFound("Test"),
        badRequest("Test"),
        serverError("Test"),
        rateLimited(Date.now() + 60000),
      ];

      for (const response of errors) {
        expect(() => response.json()).not.toThrow();
      }
    });

    it("should preserve status codes across all helpers", async () => {
      const testCases = [
        { fn: () => unauthorized(), expectedStatus: 401 },
        { fn: () => forbidden(), expectedStatus: 403 },
        { fn: () => notFound(), expectedStatus: 404 },
        { fn: () => badRequest("test"), expectedStatus: 400 },
        { fn: () => serverError(), expectedStatus: 500 },
        { fn: () => rateLimited(Date.now() + 60000), expectedStatus: 429 },
      ];

      for (const { fn, expectedStatus } of testCases) {
        const response = fn();
        expect(response.status).toBe(expectedStatus);
      }
    });
  });
});
