// [P0][FIREBASE][TEST] Admin Form Test tests
// Tags: P0, FIREBASE, TEST
import { NextRequest } from "next/server";
import { describe, it, expect, vi } from "vitest";

// Mock adminDb to undefined to test dev-stub path.
vi.mock("@/src/lib/firebase.server", () => ({ adminDb: undefined }));

// Import the handler after mocking
import { adminFormHandler } from "../../../app/api/onboarding/admin-form/route";

describe("admin-form handler", () => {
  it("returns stub token when adminDb is not initialized and user present", async () => {
    const payload = {
      networkId: "n-1",
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

    const req = new NextRequest("http://localhost/api/onboarding/admin-form", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }) as any;

    // Attach authenticated user info (handler expects AuthenticatedRequest)
    req.user = { uid: "test-uid" };

    const res = await adminFormHandler(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.formToken).toBeDefined();
  });

  it("returns 422 for invalid payload even when uid injected", async () => {
    const payload = { invalid: true };

    const req = new NextRequest("http://localhost/api/onboarding/admin-form", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }) as any;

    req.user = { uid: "test-uid" };

    const res = await adminFormHandler(req);
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toBe("validation_error");
  });
});

describe("admin-form handler", () => {
  it("returns stub token when adminDb is not initialized and user present", async () => {
    const payload = {
      networkId: "n-1",
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

    const req = new NextRequest("http://localhost/api/onboarding/admin-form", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }) as any;

    // Attach authenticated user info (handler expects AuthenticatedRequest)
    req.user = { uid: "test-uid" };

    const res = await adminFormHandler(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.formToken).toBeDefined();
  });

  it("returns 422 for invalid payload even when uid injected", async () => {
    const payload = { invalid: true };

    const req = new NextRequest("http://localhost/api/onboarding/admin-form", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }) as any;

    req.user = { uid: "test-uid" };

    const res = await adminFormHandler(req);
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toBe("validation_error");
  });
});
