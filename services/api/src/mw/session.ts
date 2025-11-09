// [P1][AUTH][SESSION] Server-side session authentication middleware
// Tags: P1, AUTH, SESSION
import type { Request, Response, NextFunction } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";

import { getAdminAuth } from "../firebase.js";

/**
 * @description Represents a user's decoded token, containing their identity and authorization information.
 */
export type UserToken = {
  /** @description The user's unique identifier. */
  uid: string;
  /** @description The identifier of the organization the user belongs to. */
  orgId?: string;
  /** @description A list of roles assigned to the user. */
  roles?: string[];
  /** @description Indicates whether the user has authenticated with multi-factor authentication. */
  mfa?: boolean;
  [k: string]: unknown;
};

/**
 * @description Extracts a cookie value from the request headers.
 * @param {Request} req - The Express request object.
 * @param {string} name - The name of the cookie to retrieve.
 * @returns {string | undefined} The value of the cookie, or undefined if not found.
 */
function getCookie(req: Request, name: string): string | undefined {
  const header = req.headers["cookie"];
  if (!header) return undefined;
  const parts = (Array.isArray(header) ? header.join(";") : header).split(";");
  for (const p of parts) {
    const [k, ...rest] = p.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

/**
 * @description An Express middleware that requires a valid session cookie for authentication.
 * It verifies the session cookie, extracts the user token, and attaches it to the request object.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 */
export async function requireSession(req: Request, res: Response, next: NextFunction) {
  try {
    const cookie = getCookie(req, "session");
    if (!cookie) return res.status(401).json({ error: "unauthenticated" });

    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(cookie, true);

    // Map decoded token -> userToken shape
    const decodedToken = decoded as DecodedIdToken & {
      orgId?: string;
      org_id?: string;
      roles?: string[];
      mfa?: boolean;
      "custom:mfa"?: boolean;
    };
    const userToken: UserToken = {
      uid: decoded.uid,
      orgId: decodedToken.orgId || decodedToken.org_id,
      roles: decodedToken.roles || [],
      mfa: decodedToken.mfa === true || decodedToken["custom:mfa"] === true,
    };

    (req as Request & { userToken: UserToken }).userToken = userToken;
    next();
  } catch (_e) {
    return res.status(401).json({ error: "unauthenticated" });
  }
}

/**
 * @description An Express middleware that enforces two-factor authentication (2FA) for users with managerial roles.
 * This middleware should be used after `requireSession`.
 * @param {Request} req - The Express request object, expected to have a `userToken` property.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 */
export function require2FAForManagers(req: Request, res: Response, next: NextFunction) {
  const tok: UserToken | undefined = (req as Request & { userToken?: UserToken }).userToken;
  if (!tok) return res.status(401).json({ error: "unauthenticated" });
  const isPriv = (tok.roles || []).some((r) => ["org_owner", "admin", "manager"].includes(r));
  if (isPriv && !tok.mfa) return res.status(403).json({ error: "mfa_required" });
  next();
}
