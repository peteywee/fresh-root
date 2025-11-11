/**
 * [P1][TEST][ONBOARDING] Admin Form Endpoint Tests
 * Tags: test, onboarding, admin-form, compliance, unit
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import { adminFormHandler } from "../admin-form/route";

describe("POST /api/onboarding/admin-form", () => {
  let mockAdminDb: any;
  let mockReq: any;

  beforeEach(() => {
    mockAdminDb = {
      collection: vi.fn().mockReturnValue({
        doc: vi.fn().mockReturnValue({
          set: vi.fn().mockResolvedValue(undefined),
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => ({ status: "not_started" }),
          }),
        }),
      }),
    };

    mockReq = {
      json: vi.fn(),
      user: {
        uid: "test-uid-123",
        customClaims: {
          email: "admin@example.com",
        },
      },
    } as any;
  });

  it("should return 401 if not authenticated", async () => {
    const req = { ...mockReq, user: undefined };
    const response = await adminFormHandler(req, mockAdminDb);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("not_authenticated");
  });

  it("should return 400 if missing required compliance fields", async () => {
    mockReq.json.mockResolvedValue({
      adminName: "John Doe",
      // missing email, taxId, etc.
    });

    const response = await adminFormHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("invalid_request");
  });

  it("should validate email format", async () => {
    mockReq.json.mockResolvedValue({
      adminName: "John Doe",
      adminEmail: "invalid-email",
      taxId: "12-3456789",
      legalEntityName: "Test Corp",
    });

    const response = await adminFormHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("email");
  });

  it("should create compliance form entry and generate token", async () => {
    mockReq.json.mockResolvedValue({
      adminName: "John Doe",
      adminEmail: "john@example.com",
      taxId: "12-3456789",
      legalEntityName: "Test Corporation",
    });

    const response = await adminFormHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data).toHaveProperty("token");
    expect(data.tokenExpiresAt).toBeGreaterThan(Date.now());
  });

  it("should store form submission in Firestore", async () => {
    mockReq.json.mockResolvedValue({
      adminName: "Jane Smith",
      adminEmail: "jane@example.com",
      taxId: "98-7654321",
      legalEntityName: "Jane's Ventures",
    });

    await adminFormHandler(mockReq, mockAdminDb);

    // Verify collection method was called with "compliance_forms"
    expect(mockAdminDb.collection).toHaveBeenCalledWith("compliance_forms");
  });

  it("should handle stub mode (no adminDb)", async () => {
    mockReq.json.mockResolvedValue({
      adminName: "John Doe",
      adminEmail: "john@example.com",
      taxId: "12-3456789",
      legalEntityName: "Test Corp",
    });

    const response = await adminFormHandler(mockReq, undefined);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.isStub).toBe(true);
    expect(data).toHaveProperty("token");
  });

  it("should set token expiration to 30 days from now", async () => {
    mockReq.json.mockResolvedValue({
      adminName: "John Doe",
      adminEmail: "john@example.com",
      taxId: "12-3456789",
      legalEntityName: "Test Corp",
    });

    const now = Date.now();
    const response = await adminFormHandler(mockReq, mockAdminDb);
    const data = await response.json();

    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const expectedExpiration = now + thirtyDaysMs;

    // Allow 5 second variance
    expect(Math.abs(data.tokenExpiresAt - expectedExpiration)).toBeLessThan(5000);
  });

  it("should reject invalid tax ID format", async () => {
    mockReq.json.mockResolvedValue({
      adminName: "John Doe",
      adminEmail: "john@example.com",
      taxId: "invalid", // should be XX-XXXXXXX format
      legalEntityName: "Test Corp",
    });

    const response = await adminFormHandler(mockReq, mockAdminDb);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("taxId");
  });
});
