// [P1][API][TEST] create-network-org handler tests
import { NextRequest } from "next/server";
import { describe, it, expect, vi } from "vitest";

// Mock adminDb to undefined to test dev-stub path.
vi.mock("@/src/lib/firebase.server", () => ({ adminDb: undefined }));

// Import the handler after mocking
import { createNetworkOrgHandler } from "../../../app/api/onboarding/create-network-org/route";

// Type for NextRequest with authentication
interface AuthenticatedRequest extends NextRequest {
  user?: { uid: string; customClaims?: Record<string, unknown> };
}

describe("create-network-org handler", () => {
  it("returns stub ids when adminDb is not initialized and user present", async () => {
    const payload = { orgName: "Test Org", venueName: "Main", formToken: "t-1" };

    const req = new NextRequest("http://localhost/api/onboarding/create-network-org", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }) as unknown as AuthenticatedRequest;

    req.user = { uid: "test-uid", customClaims: { email_verified: true, role: "org_owner" } };

    const res = await createNetworkOrgHandler(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.networkId).toBeDefined();
    expect(body.orgId).toBeDefined();
    expect(body.venueId).toBeDefined();
  });

  it("returns 422 when formToken missing", async () => {
    const payload = { orgName: "Test Org" };

    const req = new NextRequest("http://localhost/api/onboarding/create-network-org", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }) as unknown as AuthenticatedRequest;

    req.user = { uid: "test-uid", customClaims: { email_verified: true, role: "org_owner" } };

    // Inject a fake adminDb so the handler doesn't return the dev stub early and reaches validation
    const fakeAdminDb = {
      collection: () => ({
        doc: () => ({
          collection: () => ({ doc: () => ({ get: async () => ({ exists: false }) }) }),
        }),
      }),
    };

    const res = await createNetworkOrgHandler(req, fakeAdminDb);
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toBe("missing_form_token");
  });
});
