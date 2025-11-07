//[P1][API][ONBOARDING] Verify Eligibility Endpoint
// Tags: api, onboarding, eligibility

import { NextResponse } from "next/server";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

export const GET = withSecurity(
  async (req: AuthenticatedRequest) => {
    // requireSession already attached user info
    const uid = req.user?.uid;
    const claims = req.user?.customClaims || {};

    if (!uid)
      return NextResponse.json(
        { ok: false, allowed: false, reason: "not_authenticated" },
        { status: 401 },
      );

    const emailVerified = Boolean(claims.email_verified === true || claims.emailVerified === true);
    if (!emailVerified) {
      return NextResponse.json(
        { ok: true, allowed: false, reason: "email_not_verified" },
        { status: 200 },
      );
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
      return NextResponse.json(
        { ok: true, allowed: false, reason: "role_not_allowed" },
        { status: 200 },
      );
    }

    return NextResponse.json({ ok: true, allowed: true }, { status: 200 });
  },
  { requireAuth: true },
);
