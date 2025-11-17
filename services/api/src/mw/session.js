import { getAdminAuth } from "../firebase.js";
function getCookie(req, name) {
    const header = req.headers["cookie"];
    if (!header)
        return undefined;
    const parts = (Array.isArray(header) ? header.join(";") : header).split(";");
    for (const p of parts) {
        const [k, ...rest] = p.trim().split("=");
        if (k === name)
            return decodeURIComponent(rest.join("="));
    }
    return undefined;
}
export async function requireSession(req, res, next) {
    try {
        const cookie = getCookie(req, "session");
        if (!cookie)
            return res.status(401).json({ error: "unauthenticated" });
        const auth = getAdminAuth();
        const decoded = await auth.verifySessionCookie(cookie, true);
        // Map decoded token -> userToken shape
        const decodedToken = decoded;
        const userToken = {
            uid: decoded.uid,
            orgId: decodedToken.orgId || decodedToken.org_id,
            roles: decodedToken.roles || [],
            mfa: decodedToken.mfa === true || decodedToken["custom:mfa"] === true,
        };
        req.userToken = userToken;
        next();
    }
    catch (_e) {
        return res.status(401).json({ error: "unauthenticated" });
    }
}
export function require2FAForManagers(req, res, next) {
    const tok = req.userToken;
    if (!tok)
        return res.status(401).json({ error: "unauthenticated" });
    const isPriv = (tok.roles || []).some((r) => ["org_owner", "admin", "manager"].includes(r));
    if (isPriv && !tok.mfa)
        return res.status(403).json({ error: "mfa_required" });
    next();
}
