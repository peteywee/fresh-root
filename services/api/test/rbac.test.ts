// [P0][SECURITY][TEST] RBAC and tenant isolation tests
// Tags: P0, SECURITY, TEST, RBAC, VITEST
import type { Request, Response, NextFunction } from "express";
import { describe, it, expect } from "vitest";

import { readUserToken, requireManager } from "../src/rbac.js";

describe("readUserToken", () => {
  it("parses x-user-token header", () => {
    const req = {
      header: (k: string) =>
        k === "x-user-token"
          ? JSON.stringify({ uid: "u1", orgId: "orgA", roles: ["manager"] })
          : undefined,
    } as Partial<Request>;
    const tok = readUserToken(req as Request);
    expect(tok?.uid).toBe("u1");
    expect(tok?.roles).toContain("manager");
  });
});

describe("requireManager", () => {
  it("allows manager", async () => {
    const req = {
      header: () => undefined,
      userToken: { uid: "u", orgId: "orgA", roles: ["manager"] },
    } as unknown as Request;
    let status = 0,
      body: Record<string, unknown> | null = null,
      nextCalled = false;
    const res = {
      status: (s: number) => {
        status = s;
        return res;
      },
      json: (b: Record<string, unknown>) => {
        body = b;
        return res;
      },
    } as unknown as Response;
    const next: NextFunction = () => {
      nextCalled = true;
    };
    requireManager(req, res, next);
    expect(nextCalled).toBe(true);
    expect(status).toBe(0);
    expect(body).toBeNull();
  });

  it("denies staff", async () => {
    const req = {
      header: () => undefined,
      userToken: { uid: "u", orgId: "orgA", roles: ["staff"] },
    } as unknown as Request;
    let status = 0,
      body: { error?: string } | null = null,
      nextCalled = false;
    const res = {
      status: (s: number) => {
        status = s;
        return res;
      },
      json: (b: { error?: string }) => {
        body = b;
        return res;
      },
    } as unknown as Response;
    const next: NextFunction = () => {
      nextCalled = true;
    };
    requireManager(req, res, next);
    expect(nextCalled).toBe(false);
    expect(status).toBe(403);
    expect(body).not.toBeNull();
    expect(body!.error).toBe("forbidden");
  });
});
