// [P1][TEST][API] Admin Form API tests
// Tags: P1, TEST, API, ONBOARDING
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../route";

// Mock the firebase admin
vi.mock("@/src/lib/firebase.server", () => ({
  adminDb: null,
}));

describe("POST /api/onboarding/admin-form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns stub token when adminDb is not initialized", async () => {
    const payload = {
      networkId: "net123",
      uid: "user456",
      role: "network_owner",
      certification: {
        acknowledgesDataProtection: true,
        acknowledgesGDPRCompliance: true,
        acknowledgesAccessControl: true,
        acknowledgesMFARequirement: true,
        acknowledgesAuditTrail: true,
        acknowledgesIncidentReporting: true,
        understandsRoleScope: true,
        agreesToTerms: true,
      },
    };

    const request = new NextRequest("http://localhost:3000/api/onboarding/admin-form", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.ok).toBe(true);
    expect(json.formToken).toBe("stub-form-token");
  });

  it("returns validation error for invalid payload", async () => {
    const payload = {
      networkId: "net123",
      // missing required fields
    };

    const request = new NextRequest("http://localhost:3000/api/onboarding/admin-form", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
    expect(json.error.details).toBeDefined();
  });

  it("returns validation error for invalid certification", async () => {
    const payload = {
      networkId: "net123",
      uid: "user456",
      role: "network_owner",
      certification: {
        acknowledgesDataProtection: false, // should be true
        acknowledgesGDPRCompliance: true,
        acknowledgesAccessControl: true,
        acknowledgesMFARequirement: true,
        acknowledgesAuditTrail: true,
        acknowledgesIncidentReporting: true,
        understandsRoleScope: true,
        agreesToTerms: true,
      },
    };

    const request = new NextRequest("http://localhost:3000/api/onboarding/admin-form", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("handles invalid JSON gracefully", async () => {
    const request = new NextRequest("http://localhost:3000/api/onboarding/admin-form", {
      method: "POST",
      body: "invalid json{",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
  });
});
