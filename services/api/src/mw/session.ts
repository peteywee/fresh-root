// [P0][SECURITY][AUTH] Session cookie verification and MFA enforcement middleware
// Tags: P0, SECURITY, AUTH, SESSION, MFA, MIDDLEWARE
import type { NextFunction, Request, Response } from "express";

import { getAdminAuth } from "../firebase.js";

export type UserToken = {
  uid: string;
  orgId?: string;
  roles?: string[];
  mfa?: boolean;
  [k: string]: any;
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
    const userToken: UserToken = {
      uid: decoded.uid,
      orgId: (decoded as any).orgId || (decoded as any).org_id,
      roles: (decoded as any).roles || [],
      mfa: (decoded as any).mfa === true || (decoded as any)["custom:mfa"] === true,
    };

    (req as any).userToken = userToken;
    next();
  } catch (_e) {
    return res.status(401).json({ error: "unauthenticated" });
  }
}

export function require2FAForManagers(req: Request, res: Response, next: NextFunction) {
  const tok: UserToken | undefined = (req as any).userToken;
  if (!tok) return res.status(401).json({ error: "unauthenticated" });
  const isPriv = (tok.roles || []).some((r) => ["org_owner", "admin", "manager"].includes(r));
  if (isPriv && !tok.mfa) return res.status(403).json({ error: "mfa_required" });
  next();
}
