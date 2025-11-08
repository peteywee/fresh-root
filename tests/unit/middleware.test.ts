// [P0][TEST][MIDDLEWARE] Middleware Test middleware
// Tags: P0, TEST, MIDDLEWARE, TEST
// Unit tests for API middleware: requireSession and require2FAForManagers
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the firebase-admin helper used by middleware to avoid real SDK calls.
vi.mock("@/lib/firebase-admin", () => ({
  getFirebaseAdminAuth: () => ({
    verifySessionCookie: async (cookie: string) => {
      // Return a decoded token without mfa by default
      if (cookie === "valid-without-mfa") {
        return { uid: "user-no-mfa", email: "user@example.com", mfa: false } as any;
      }
      if (cookie === "valid-with-mfa") {
        return { uid: "user-mfa", email: "user2@example.com", mfa: true } as any;
      }
      throw new Error("Invalid session");
    },
  }),
}));

import {
  requireSession,
  require2FAForManagers,
} from "@/app/api/_shared/middleware";

function makeReq(overrides: Partial<any> = {}) {
  return {
    method: "GET",
    headers: {
      get: (k: string) => overrides.headers?.[k] ?? null,
    },
    cookies: {
      get: (name: string) => overrides.cookies?.[name] ?? undefined,
    },
    nextUrl: { pathname: overrides.path ?? "/api/test", origin: "http://localhost" },
  } as any;
}

describe("API middleware unit tests", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 401 when no session cookie is present", async () => {
    const req = makeReq();
    const res = await requireSession(req, async () => ({ status: 200 }) as any);
    expect(res.status).toBe(401);
  });

  it("returns 403 from require2FAForManagers when session lacks mfa claim", async () => {
    const req = makeReq({ cookies: { session: { value: "valid-without-mfa" } } });
    const res = await require2FAForManagers(req, async () => ({ status: 200 }) as any);
    expect(res.status).toBe(403);
  });

  it("allows through when session has mfa claim", async () => {
    const req = makeReq({ cookies: { session: { value: "valid-with-mfa" } } });
    const res = await require2FAForManagers(req, async () => ({ status: 200 }) as any);
    // On success, handler's response should be returned
    expect(res.status).toBe(200);
  });
});
