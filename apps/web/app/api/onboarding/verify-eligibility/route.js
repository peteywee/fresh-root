//[P1][API][ONBOARDING] Verify Eligibility Endpoint (server)
// Tags: api, onboarding, eligibility
import { NextResponse } from "next/server";
import { withRequestLogging } from "../../_shared/logging";
import { withSecurity } from "../../_shared/middleware";
// Track rate limits in-memory (per uid, last 24h)
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 100; // requests per 24h
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours
function checkRateLimit(uid) {
    const now = Date.now();
    const entry = rateLimitMap.get(uid);
    if (!entry || entry.resetTime <= now) {
        // Reset window
        rateLimitMap.set(uid, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return RATE_LIMIT_MAX - 1;
    }
    entry.count++;
    return Math.max(0, RATE_LIMIT_MAX - entry.count);
}
export async function verifyEligibilityHandler(req, adminDb) {
    const uid = req.user?.uid;
    const _claims = req.user?.customClaims || {};
    // Check authentication first
    if (!uid) {
        return NextResponse.json({
            error: "Not authenticated",
            code: "GEN_NOT_AUTHENTICATED",
        }, { status: 401 });
    }
    // Parse request body to validate required fields
    let body = {};
    if (req.json) {
        try {
            body = await req.json();
        }
        catch {
            // If no body or invalid JSON, treat as missing fields
            body = {};
        }
    }
    // Narrow and validate required fields
    if (typeof body !== "object" || body === null) {
        return NextResponse.json({
            error: "Missing email or role",
            code: "ONB_ELIGIBILITY_INVALID_REQUEST",
        }, { status: 400 });
    }
    const b = body;
    if (typeof b.email !== "string" || typeof b.role !== "string") {
        return NextResponse.json({
            error: "Missing email or role",
            code: "ONB_ELIGIBILITY_INVALID_REQUEST",
        }, { status: 400 });
    }
    // Validate role is allowed
    const allowedRoles = [
        "owner_founder_director",
        "manager_supervisor",
        "corporate_hq",
        "manager",
        "org_owner",
        "admin",
    ];
    if (!allowedRoles.includes(b.role)) {
        return NextResponse.json({
            error: "Role not allowed for onboarding",
            code: "ONB_ELIGIBILITY_ROLE_DENIED",
        }, { status: 403 });
    }
    // Check rate limit
    const rateLimitRemaining = checkRateLimit(uid);
    // Stub mode (no adminDb) or use adminDb if available
    const isStub = !adminDb;
    return NextResponse.json({
        ok: true,
        eligible: true,
        email: b.email,
        role: b.role,
        isStub,
        rate_limit_remaining: rateLimitRemaining,
    }, { status: 200 });
}
// Adapter wraps the test-friendly handler for use with withSecurity middleware
async function apiRoute(req, _ctx) {
    return verifyEligibilityHandler(req);
}
export const POST = withRequestLogging(withSecurity(apiRoute, {
    requireAuth: true,
}));
