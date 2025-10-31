// [P0][SECURITY][RBAC] Role-based access control and tenant isolation guards
// Tags: P0, SECURITY, RBAC, AUTHORIZATION, TENANT_ISOLATION
import type { Request, Response, NextFunction } from "express";

// Shared shape with your Zod types: uid, orgId, roles[]
export type UserToken = {
  uid: string;
  orgId: string;
  roles: string[];
};

// Extract token from either:
//  1) x-user-token (JSON string) for local/dev, OR
//  2) Firebase Auth decoded token (populated upstream in prod).
export function readUserToken(req: Request): UserToken | null {
  const header = req.header("x-user-token");
  if (header) {
    try { return JSON.parse(header) as UserToken; } catch { return null; }
  }
  // If you add Firebase Auth middleware later, map req.user -> UserToken here.
  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const tok = readUserToken(req);
  if (!tok) return res.status(401).json({ error: "unauthenticated" });
  (req as any).userToken = tok;
  next();
}

export function requireManager(req: Request, res: Response, next: NextFunction) {
  const tok: UserToken | undefined = (req as any).userToken ?? readUserToken(req) ?? undefined;
  if (!tok) return res.status(401).json({ error: "unauthenticated" });
  const ok = tok.roles.includes("org_owner") || tok.roles.includes("admin") || tok.roles.includes("manager");
  if (!ok) return res.status(403).json({ error: "forbidden" });
  (req as any).userToken = tok;
  next();
}

export function sameOrgGuard(getOrgId: (req: Request) => string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const tok: UserToken | undefined = (req as any).userToken ?? readUserToken(req) ?? undefined;
    if (!tok) return res.status(401).json({ error: "unauthenticated" });
    const orgId = getOrgId(req);
    if (tok.orgId !== orgId) return res.status(403).json({ error: "cross-org access denied" });
    (req as any).userToken = tok;
    next();
  };
}
