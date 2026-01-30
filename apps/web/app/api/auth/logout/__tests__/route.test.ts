// [P1][TEST][AUTH] Logout endpoint hardening tests
// Tags: P1, TEST, AUTH
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import {
  callEndpoint,
  createMockRequest,
  parseJsonResponse,
  testFirebaseUsers,
} from "../../../__tests__/test-utils";

vi.mock("firebase-admin/auth", () => ({
  getAuth: () => ({
    verifySessionCookie: vi.fn(async (cookie: string) => {
      if (!cookie) throw new Error("Invalid session cookie");
      return testFirebaseUsers.admin;
    }),
  }),
}));

let POST: typeof import("../route").POST;

beforeAll(async () => {
  ({ POST } = await import("../route"));
});

describe("POST /api/auth/logout", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated requests", async () => {
    const request = createMockRequest("POST", "/api/auth/logout");

    const response = await callEndpoint(POST, request);
    const body = await parseJsonResponse<{ error: { code: string } }>(response);

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("requires a valid CSRF token for authenticated requests", async () => {
    const request = createMockRequest("POST", "/api/auth/logout", {
      cookies: { session: "valid-session" },
      headers: { cookie: "session=valid-session" },
    });

    const response = await callEndpoint(POST, request);
    const body = await parseJsonResponse<{ error: { code: string } }>(response);

    expect(response.status).toBe(403);
    expect(body.error.code).toBe("FORBIDDEN");
  });

  it("clears session cookies when authenticated and CSRF is valid", async () => {
    const csrfToken = "csrf-token-123";
    const cookieHeader = `session=valid-session; csrf=${csrfToken}`;
    const request = createMockRequest("POST", "/api/auth/logout", {
      cookies: { session: "valid-session", csrf: csrfToken },
      headers: { "x-csrf-token": csrfToken, cookie: cookieHeader },
    });

    const response = await callEndpoint(POST, request);
    const body = await parseJsonResponse<{ ok: boolean }>(response);

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);

    const clearedSession = response.cookies.get("session");
    const clearedSuperAdmin = response.cookies.get("isSuperAdmin");
    const clearedOrgId = response.cookies.get("orgId");

    expect(clearedSession?.value).toBe("");
    expect(clearedSession?.maxAge).toBe(0);
    expect(clearedSuperAdmin?.value).toBe("");
    expect(clearedSuperAdmin?.maxAge).toBe(0);
    expect(clearedOrgId?.value).toBe("");
    expect(clearedOrgId?.maxAge).toBe(0);
  });
});
