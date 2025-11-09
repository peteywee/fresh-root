//[P1][API][ONBOARDING] Verify Eligibility Endpoint (server)
// Tags: api, onboarding, eligibility

import { NextResponse } from "next/server";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

export async function verifyEligibilityHandler(
  req: AuthenticatedRequest & {
    user?: { uid: string; customClaims?: Record<string, unknown> };
  },
) {
  const uid = req.user?.uid;
  const claims = req.user?.customClaims || {};

  if (!uid) {
    return NextResponse.json({ allowed: false, reason: "not_authenticated" }, { status: 401 });
  }

  const emailVerified = Boolean(claims.email_verified === true || claims.emailVerified === true);
  if (!emailVerified) {
    return NextResponse.json({ allowed: false, reason: "email_not_verified" }, { status: 200 });
  }

  const allowedRoles = [
    "owner_founder_director",
    "manager_supervisor",
    "corporate_hq",
    "manager",
    "org_owner",
  ];
  const declared =
    (claims.selfDeclaredRole as string | undefined) || (claims.role as string | undefined);

  if (!declared || !allowedRoles.includes(declared)) {
    return NextResponse.json({ allowed: false, reason: "role_not_allowed" }, { status: 200 });
  }

  // TODO: add rate limit checks here if desired (per uid/day)

  return NextResponse.json(
    {
      allowed: true,
      reason: null,
      effectiveRole: declared,
    },
    { status: 200 },
  );
}

export const POST = withSecurity(verifyEligibilityHandler, {
  requireAuth: true,
});
