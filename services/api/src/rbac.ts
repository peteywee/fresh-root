// [P0][SECURITY][RBAC] Role-based access control and tenant isolation guards
// Tags: P0, SECURITY, RBAC, AUTHORIZATION, TENANT_ISOLATION
import type { Request, Response, NextFunction } from "express";

/**
 * @description Represents the structure of a user's decoded token, containing identity and authorization information.
 */
export type UserToken = {
  /** @description The user's unique identifier. */
  uid: string;
  /** @description The identifier of the organization the user belongs to. */
  orgId: string;
  /** @description A list of roles assigned to the user. */
  roles: string[];
};

/**
 * @description Extracts a user token from the request.
 * In a development environment, it reads the token from the `x-user-token` header.
 * In production, this should be adapted to read from where the Firebase Auth middleware places the decoded token.
 * @param {Request} req - The Express request object.
 * @returns {UserToken | null} The user token, or null if not found or parsing fails.
 */
export function readUserToken(req: Request): UserToken | null {
  const header = req.header("x-user-token");
  if (header) {
    try {
      return JSON.parse(header) as UserToken;
    } catch {
      return null;
    }
  }
  // If you add Firebase Auth middleware later, map req.user -> UserToken here.
  return null;
}

/**
 * @description An Express middleware that requires a user to be authenticated.
 * It reads the user token and attaches it to the request object.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const tok = readUserToken(req);
  if (!tok) return res.status(401).json({ error: "unauthenticated" });
  (req as Request & { userToken: UserToken }).userToken = tok;
  next();
}

/**
 * @description An Express middleware that requires the authenticated user to have a manager-level role.
 * Allowed roles include "org_owner", "admin", and "manager".
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 */
export function requireManager(req: Request, res: Response, next: NextFunction) {
  const tok: UserToken | undefined =
    (req as Request & { userToken?: UserToken }).userToken ?? readUserToken(req) ?? undefined;
  if (!tok) return res.status(401).json({ error: "unauthenticated" });
  const ok =
    tok.roles.includes("org_owner") || tok.roles.includes("admin") || tok.roles.includes("manager");
  if (!ok) return res.status(403).json({ error: "forbidden" });
  (req as Request & { userToken: UserToken }).userToken = tok;
  next();
}

/**
 * @description A factory function that creates an Express middleware for enforcing tenant isolation.
 * The returned middleware ensures that the authenticated user belongs to the same organization as the resource being accessed.
 * @param {function(Request): string} getOrgId - A function that extracts the organization ID from the request.
 * @returns {function(Request, Response, NextFunction): void} An Express middleware function.
 */
export function sameOrgGuard(getOrgId: (req: Request) => string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const tok: UserToken | undefined =
      (req as Request & { userToken?: UserToken }).userToken ?? readUserToken(req) ?? undefined;
    if (!tok) return res.status(401).json({ error: "unauthenticated" });
    const orgId = getOrgId(req);
    if (tok.orgId !== orgId) return res.status(403).json({ error: "cross-org access denied" });
    (req as Request & { userToken: UserToken }).userToken = tok;
    next();
  };
}
