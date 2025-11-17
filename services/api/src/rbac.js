// Extract token from either:
//  1) x-user-token (JSON string) for local/dev, OR
//  2) Firebase Auth decoded token (populated upstream in prod).
export function readUserToken(req) {
    const header = req.header("x-user-token");
    if (header) {
        try {
            return JSON.parse(header);
        }
        catch {
            return null;
        }
    }
    // If you add Firebase Auth middleware later, map req.user -> UserToken here.
    return null;
}
export function requireAuth(req, res, next) {
    const tok = readUserToken(req);
    if (!tok)
        return res.status(401).json({ error: "unauthenticated" });
    req.userToken = tok;
    next();
}
export function requireManager(req, res, next) {
    const tok = req.userToken ?? readUserToken(req) ?? undefined;
    if (!tok)
        return res.status(401).json({ error: "unauthenticated" });
    const ok = tok.roles.includes("org_owner") || tok.roles.includes("admin") || tok.roles.includes("manager");
    if (!ok)
        return res.status(403).json({ error: "forbidden" });
    req.userToken = tok;
    next();
}
export function sameOrgGuard(getOrgId) {
    return (req, res, next) => {
        const tok = req.userToken ?? readUserToken(req) ?? undefined;
        if (!tok)
            return res.status(401).json({ error: "unauthenticated" });
        const orgId = getOrgId(req);
        if (tok.orgId !== orgId)
            return res.status(403).json({ error: "cross-org access denied" });
        req.userToken = tok;
        next();
    };
}
