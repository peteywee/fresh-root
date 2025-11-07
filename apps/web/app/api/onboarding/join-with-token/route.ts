//[P1][API][ONBOARDING] Join With Token Endpoint
// Tags: api, onboarding, join, tokens

import { NextResponse } from "next/server";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

import { adminDb } from "@/src/lib/firebase.server";

export const POST = withSecurity(
  async (req: AuthenticatedRequest) => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const { joinToken } = (body as Record<string, unknown>) || {};
    if (!joinToken) return NextResponse.json({ error: "missing_join_token" }, { status: 422 });

    const uid = req.user?.uid;
    if (!uid) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

    // Dev fallback
    if (!adminDb) {
      return NextResponse.json(
        { ok: true, membershipId: "stub-membership-id", networkId: "stub-network-id" },
        { status: 200 },
      );
    }

    const adb = adminDb;

    try {
      const tokensRoot = adb.collection("joinTokens");
      const tokenSnap = await tokensRoot.doc(String(joinToken)).get();
      if (!tokenSnap.exists)
        return NextResponse.json({ error: "token_not_found" }, { status: 404 });

      const tokenData = tokenSnap.data() as Record<string, unknown>;
      const networkId = String(tokenData.networkId || "");
      const orgId = tokenData.orgId ? String(tokenData.orgId) : null;
      const venueId = tokenData.venueId ? String(tokenData.venueId) : null;

      const membershipRef = adb.collection("memberships").doc();
      await adb.runTransaction(async (tx) => {
        tx.set(membershipRef, {
          userId: uid,
          networkId,
          orgId: orgId || null,
          venueId: venueId || null,
          role: "member",
          createdAt: Date.now(),
        });

        // Optionally invalidate single-use token
        if (tokenData.singleUse === true) {
          tx.delete(tokensRoot.doc(String(joinToken)));
        }
      });

      return NextResponse.json(
        { ok: true, membershipId: membershipRef.id, networkId },
        { status: 200 },
      );
    } catch (err) {
      console.error("join-with-token failed", err);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  },
  { requireAuth: true },
);
