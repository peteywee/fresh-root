//[P1][API][TEST] Validation middleware unit tests
// Tags: test, validation, api, vitest

import { NextRequest, NextResponse } from "next/server";
import { describe, it, expect } from "vitest";
import { z } from "zod";

import {
  ValidationError,
  validateRequest,
  validateQuery,
  withValidation,
  validatePagination,
  validateSorting,
  validateDateRange,
} from "./validation";

describe("ValidationError", () => {
  it("should create error with field-level messages", () => {
    const error = new ValidationError({
      name: ["Name is required"],
      email: ["Email is invalid", "Email already exists"],
    });

    expect(error.name).toBe("ValidationError");
    expect(error.statusCode).toBe(422);
    expect(error.fields).toEqual({
      name: ["Name is required"],
      email: ["Email is invalid", "Email already exists"],
    });
  });

  it("should serialize to JSON", () => {
    const error = new ValidationError({ name: ["Required"] });
    const json = error.toJSON();

    expect(json).toEqual({
      error: "Validation failed",
      fields: { name: ["Required"] },
      statusCode: 422,
    });
  });
});

describe("validateRequest", () => {
  const testSchema = z.object({
    name: z.string().min(3),
    age: z.number().int().positive(),
  });

  it("should validate valid request body", async () => {
    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "John", age: 30 }),
    });

    const result = await validateRequest(request, testSchema);

    expect(result).toEqual({ name: "John", age: 30 });
  });

  it("should reject non-JSON content type", async () => {
    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "not json",
    });

    await expect(validateRequest(request, testSchema)).rejects.toThrow(ValidationError);

    try {
      await validateRequest(request, testSchema);
    } catch (error) {
      if (error instanceof ValidationError) {
        expect(error.statusCode).toBe(415);
        expect(error.fields._root).toContain("Content-Type must be application/json");
      }
    }
  });

  it("should reject invalid JSON", async () => {
    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not valid json",
    });

    await expect(validateRequest(request, testSchema)).rejects.toThrow(ValidationError);

    try {
      await validateRequest(request, testSchema);
    } catch (error) {
      if (error instanceof ValidationError) {
        expect(error.statusCode).toBe(400);
        expect(error.fields._root).toContain("Invalid JSON in request body");
      }
    }
  });

  it("should reject body failing schema validation", async () => {
    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "AB", age: -5 }),
    });

    try {
      await validateRequest(request, testSchema);
      expect.fail("Should have thrown ValidationError");
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      if (error instanceof ValidationError) {
        expect(error.statusCode).toBe(422);
        expect(error.fields.name).toBeDefined();
        expect(error.fields.age).toBeDefined();
      }
    }
  });

  it("should reject oversized request body", async () => {
    const largeBody = "x".repeat(2 * 1024 * 1024); // 2MB
    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": String(largeBody.length),
      },
      body: largeBody,
    });

    try {
      await validateRequest(request, testSchema);
      expect.fail("Should have thrown ValidationError");
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      if (error instanceof ValidationError) {
        expect(error.statusCode).toBe(413);
        expect(error.fields._root?.[0]).toContain("Request body too large");
      }
    }
  });
});

describe("validateQuery", () => {
  const querySchema = z.object({
    page: z.coerce.number().int().positive(),
    search: z.string().optional(),
  });

  it("should validate valid query parameters", () => {
    const request = new NextRequest("http://localhost/api/test?page=2&search=hello");

    const result = validateQuery(request, querySchema);

    expect(result).toEqual({ page: 2, search: "hello" });
  });

  it("should coerce string numbers to numbers", () => {
    const request = new NextRequest("http://localhost/api/test?page=5");

    const result = validateQuery(request, querySchema);

    expect(result.page).toBe(5);
    expect(typeof result.page).toBe("number");
  });

  it("should reject invalid query parameters", () => {
    const request = new NextRequest("http://localhost/api/test?page=invalid");

    expect(() => validateQuery(request, querySchema)).toThrow(ValidationError);

    try {
      validateQuery(request, querySchema);
    } catch (error) {
      if (error instanceof ValidationError) {
        expect(error.statusCode).toBe(422);
        expect(error.fields.page).toBeDefined();
      }
    }
  });
});

describe("withValidation", () => {
  const testSchema = z.object({
    message: z.string(),
  });

  it("should pass validated data to handler", async () => {
    const handler = withValidation(testSchema, async (_request, data) => {
      return NextResponse.json({ received: data.message });
    });

    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "hello" }),
    });

    const response = await handler(request);
    const body = await response.json();

    expect(body).toEqual({ received: "hello" });
  });

  it("should return validation error response", async () => {
    const handler = withValidation(testSchema, async (_request, data) => {
      return NextResponse.json({ received: data.message });
    });

    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: 123 }), // wrong type
    });

    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("Validation failed");
    expect(body.fields).toBeDefined();
  });
});

describe("validatePagination", () => {
  it("should validate and return pagination params", () => {
    const request = new NextRequest("http://localhost/api/test?page=3&limit=50");

    const result = validatePagination(request);

    expect(result).toEqual({ page: 3, limit: 50 });
  });

  it("should apply defaults for missing params", () => {
    const request = new NextRequest("http://localhost/api/test");

    const result = validatePagination(request);

    expect(result).toEqual({ page: 1, limit: 20 });
  });

  it("should reject limit > 100", () => {
    const request = new NextRequest("http://localhost/api/test?limit=200");

    expect(() => validatePagination(request)).toThrow(ValidationError);
  });
});

describe("validateSorting", () => {
  it("should validate sorting params", () => {
    const request = new NextRequest("http://localhost/api/test?sortBy=name&sortOrder=desc");

    const result = validateSorting(request);

    expect(result).toEqual({ sortBy: "name", sortOrder: "desc" });
  });

  it("should apply defaults", () => {
    const request = new NextRequest("http://localhost/api/test");

    const result = validateSorting(request);

    expect(result.sortOrder).toBe("asc");
  });

  it("should reject invalid sortOrder", () => {
    const request = new NextRequest("http://localhost/api/test?sortOrder=invalid");

    expect(() => validateSorting(request)).toThrow(ValidationError);
  });
});

describe("validateDateRange", () => {
  it("should validate date range", () => {
    const request = new NextRequest(
      "http://localhost/api/test?startDate=2025-01-01&endDate=2025-12-31",
    );

    const result = validateDateRange(request);

    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.endDate).toBeInstanceOf(Date);
  });

  it("should reject startDate > endDate", () => {
    const request = new NextRequest(
      "http://localhost/api/test?startDate=2025-12-31&endDate=2025-01-01",
    );

    expect(() => validateDateRange(request)).toThrow(ValidationError);

    try {
      validateDateRange(request);
    } catch (error) {
      if (error instanceof ValidationError) {
        expect(error.fields.dateRange).toContain("startDate must be less than or equal to endDate");
      }
    }
  });

  it("should allow missing dates", () => {
    const request = new NextRequest("http://localhost/api/test");

    const result = validateDateRange(request);

    expect(result.startDate).toBeUndefined();
    expect(result.endDate).toBeUndefined();
  });
});
