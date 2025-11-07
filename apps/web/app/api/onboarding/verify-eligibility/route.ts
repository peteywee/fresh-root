//[P1][API][ONBOARDING] Verify Eligibility Endpoint
// Tags: api, onboarding, eligibility, auth

import { NextRequest, NextResponse } from "next/server";

import { withSecurity, AuthenticatedRequest } from "../../_shared/middleware";

import { adminDb } from "@/src/lib/firebase.server";

/**
 * Checks whether the current authenticated user is eligible to create a Network.
 *
 * Requirements:
 * - Must be authenticated
 * - Email must be verified
 * - selfDeclaredRole must be in the allowed set (owner, manager, corporate)
 *
 * @see docs/bible/Project_Bible_v14.0.0.md Section 4.2 (Onboarding Eligibility)
 */
export const GET = withSecurity(
  async (req: AuthenticatedRequest) => {
    // requireSession via withSecurity ensures req.user is present
    const uid = req.user?.uid;
    const claims = req.user?.customClaims;

    if (!uid) {
      return NextResponse.json({ eligible: false, reason: "not_authenticated" }, { status: 401 });
    }

    // Check email verified from session claims
    const emailVerified = Boolean(
      claims?.email_verified === true || claims?.emailVerified === true,
    );
    if (!emailVerified) {
      return NextResponse.json({ eligible: false, reason: "email_not_verified" }, { status: 403 });
    }

    // Read profile from Firestore if available
    if (!adminDb) {
      // If admin DB not available, be conservative and allow based on claims only
      return NextResponse.json({ eligible: true, reason: "ok_no_db" }, { status: 200 });
    }

    try {
      const userDoc = await adminDb.collection("users").doc(uid).get();
      const profile = userDoc.exists ? (userDoc.data() as Record<string, unknown>) : null;

      const allowedRoles = [
        "owner_founder_director",
        "manager_supervisor",
        "corporate_hq",
        "manager",
        "org_owner",
      ];
      const declared =
        (profile?.selfDeclaredRole as string | undefined) ||
        (claims?.selfDeclaredRole as string | undefined) ||
        (claims?.role as string | undefined);
      if (!declared || !allowedRoles.includes(declared)) {
        return NextResponse.json({ eligible: false, reason: "role_not_allowed" }, { status: 403 });
      }

      return NextResponse.json({ eligible: true, reason: "ok" }, { status: 200 });
    } catch (err) {
      console.error("verify-eligibility failed", err);
      return NextResponse.json({ eligible: false, reason: "internal_error" }, { status: 500 });
    }
  },
  { requireAuth: true },
);
