// [P0][SECURITY][TEST] RBAC and tenant isolation tests
// Tags: P0, SECURITY, TEST, RBAC, VITEST
import type { Request, Response, NextFunction } from "express";
import { describe, it, expect } from "vitest";

import { readUserToken, requireManager } from "../src/rbac.js";

describe("readUserToken", () => {
  it("parses x-user-token header", () => {
    const req = { header: (k: string) => k === "x-user-token" ? JSON.stringify({ uid: "u1", orgId: "orgA", roles: ["manager"] }) : undefined } as any;
    const tok = readUserToken(req);
    expect(tok?.uid).toBe("u1");
    expect(tok?.roles).toContain("manager");
  });
});

describe("requireManager", () => {
  it("allows manager", async () => {
    const req = { header: () => undefined } as any as Request;
    (req as any).userToken = { uid: "u", orgId: "orgA", roles: ["manager"] };
    let status = 0, body: any = null, nextCalled = false;
    const res = { status: (s: number) => { status = s; return res; }, json: (b: any) => { body = b; return res; } } as any as Response;
    const next: NextFunction = () => { nextCalled = true; };
    requireManager(req, res, next);
    expect(nextCalled).toBe(true);
    expect(status).toBe(0);
    expect(body).toBeNull();
  });

  it("denies staff", async () => {
    const req = { header: () => undefined } as any as Request;
    (req as any).userToken = { uid: "u", orgId: "orgA", roles: ["staff"] };
    let status = 0, body: any = null, nextCalled = false;
    const res = { status: (s: number) => { status = s; return res; }, json: (b: any) => { body = b; return res; } } as any as Response;
    const next: NextFunction = () => { nextCalled = true; };
    requireManager(req, res, next);
    expect(nextCalled).toBe(false);
    expect(status).toBe(403);
    expect(body?.error).toBe("forbidden");
  });
});
