// [P1][AUTH][SESSION] Server-side session authentication middleware
// Tags: P1, AUTH, SESSION
import type { Request, Response, NextFunction } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";

import { getAdminAuth } from "../firebase.js";

export type UserToken = {
  uid: string;
  orgId?: string;
  roles?: string[];
  mfa?: boolean;
  [k: string]: unknown;
};

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

export async function requireSession(req: Request, res: Response, next: NextFunction) {
  try {
    const cookie = getCookie(req, "session");
    if (!cookie) return res.status(401).json({ error: "unauthenticated" });

    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(cookie, true);

    // Map decoded token -> userToken shape
    const decodedToken = decoded as DecodedIdToken & { orgId?: string; org_id?: string; roles?: string[]; mfa?: boolean; "custom:mfa"?: boolean };
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

export function require2FAForManagers(req: Request, res: Response, next: NextFunction) {
  const tok: UserToken | undefined = (req as Request & { userToken?: UserToken }).userToken;
  if (!tok) return res.status(401).json({ error: "unauthenticated" });
  const isPriv = (tok.roles || []).some((r) => ["org_owner", "admin", "manager"].includes(r));
  if (isPriv && !tok.mfa) return res.status(403).json({ error: "mfa_required" });
  next();
}
