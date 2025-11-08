// [P0][FIREBASE][TEST] Admin Form Test tests
// Tags: P0, FIREBASE, TEST
import { NextRequest } from "next/server";
import { describe, it, expect, vi } from "vitest";

// Mock adminDb to undefined to test dev-stub path.
vi.mock("@/src/lib/firebase.server", () => ({ adminDb: undefined }));

// Mock types package so vitest can run without resolving the monorepo path alias
vi.mock("@fresh-schedules/types", () => {
  const { z } = require("zod");
  const CreateAdminResponsibilityFormSchema = z.object({
    networkId: z.string().optional(),
    uid: z.string().optional(),
    role: z.string().min(1),
    certification: z.object({
      acknowledgesDataProtection: z.boolean(),
      acknowledgesGDPRCompliance: z.boolean(),
      acknowledgesAccessControl: z.boolean(),
      acknowledgesMFARequirement: z.boolean(),
      acknowledgesAuditTrail: z.boolean(),
      acknowledgesIncidentReporting: z.boolean(),
      understandsRoleScope: z.boolean(),
      agreesToTerms: z.boolean(),
    }),
  });
  return { CreateAdminResponsibilityFormSchema };
});

// Import the handler after mocking
import { adminFormHandler } from "../../../app/api/onboarding/admin-form/route";

// Type for NextRequest with authentication
interface AuthenticatedRequest extends NextRequest {
  user: { uid: string };
}

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
    }) as unknown as AuthenticatedRequest;

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
    }) as unknown as AuthenticatedRequest;

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
    }) as unknown as AuthenticatedRequest;

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
    }) as unknown as AuthenticatedRequest;

    req.user = { uid: "test-uid" };

    const res = await adminFormHandler(req);
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toBe("validation_error");
  });
});
