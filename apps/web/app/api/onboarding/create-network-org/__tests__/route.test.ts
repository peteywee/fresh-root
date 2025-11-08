// [P1][TEST][API] Create Network Org API tests
// Tags: P1, TEST, API, ONBOARDING
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import type { AuthenticatedRequest } from "../../../_shared/middleware";

// Mock the firebase admin
vi.mock("@/src/lib/firebase.server", () => ({
  adminDb: null,
}));

// Mock the middleware
vi.mock("../../../_shared/middleware", () => ({
  withSecurity: (handler: Function) => handler,
}));

describe("POST /api/onboarding/create-network-org", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns stub response when adminDb is not initialized", async () => {
    const mockRequest = {
      user: {
        uid: "user123",
        email: "test@example.com",
        customClaims: {
          email_verified: true,
          selfDeclaredRole: "org_owner",
        },
      },
      json: async () => ({
        orgName: "Test Org",
        venueName: "Test Venue",
        formToken: "test-token",
      }),
    } as unknown as AuthenticatedRequest;

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.ok).toBe(true);
    expect(json.networkId).toBe("stub-network-id");
    expect(json.orgId).toBe("stub-org-id");
    expect(json.venueId).toBe("stub-venue-id");
    expect(json.status).toBe("pending_verification");
  });

  it("returns error when user is not authenticated", async () => {
    const mockRequest = {
      user: undefined,
      json: async () => ({
        orgName: "Test Org",
        venueName: "Test Venue",
        formToken: "test-token",
      }),
    } as unknown as AuthenticatedRequest;

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error.code).toBe("NOT_AUTHENTICATED");
  });

  it("returns error when email is not verified", async () => {
    const mockRequest = {
      user: {
        uid: "user123",
        email: "test@example.com",
        customClaims: {
          email_verified: false,
          selfDeclaredRole: "org_owner",
        },
      },
      json: async () => ({
        orgName: "Test Org",
        venueName: "Test Venue",
        formToken: "test-token",
      }),
    } as unknown as AuthenticatedRequest;

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error.code).toBe("EMAIL_NOT_VERIFIED");
  });

  it("returns error when role is not allowed", async () => {
    const mockRequest = {
      user: {
        uid: "user123",
        email: "test@example.com",
        customClaims: {
          email_verified: true,
          selfDeclaredRole: "staff",
        },
      },
      json: async () => ({
        orgName: "Test Org",
        venueName: "Test Venue",
        formToken: "test-token",
      }),
    } as unknown as AuthenticatedRequest;

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error.code).toBe("ROLE_NOT_ALLOWED");
  });

  it("returns validation error for missing fields", async () => {
    const mockRequest = {
      user: {
        uid: "user123",
        email: "test@example.com",
        customClaims: {
          email_verified: true,
          selfDeclaredRole: "org_owner",
        },
      },
      json: async () => ({
        orgName: "Test Org",
        // missing venueName and formToken
      }),
    } as unknown as AuthenticatedRequest;

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
    expect(json.error.details).toBeDefined();
  });
});
