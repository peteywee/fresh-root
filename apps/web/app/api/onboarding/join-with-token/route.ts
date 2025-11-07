//[P1][API][ONBOARDING] Join With Token Endpoint
// Tags: api, onboarding, join, token

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

    const { token } = (body as Record<string, unknown>) || {};
    if (!token) return NextResponse.json({ error: "missing_token" }, { status: 422 });

    // Local/dev fallback
    if (!adminDb) {
      return NextResponse.json(
        {
          ok: true,
          joined: true,
          networkId: "stub-network-id",
          orgId: "stub-org-id",
          venueId: "stub-venue-id",
        },
        { status: 200 },
      );
    }

    const adb = adminDb;

    try {
      // Search for a matching join token in any join-tokens collection (collection group)
      const snaps = await adb
        .collectionGroup("join-tokens")
        .where("token", "==", String(token))
        .limit(1)
        .get();
      if (snaps.empty) {
        return NextResponse.json({ error: "token_not_found" }, { status: 404 });
      }

      const doc = snaps.docs[0];
      const data = doc.data();

      // Return the resolved mapping; client may perform membership creation
      return NextResponse.json(
        {
          ok: true,
          joined: true,
          tokenId: doc.id,
          mapping: data,
        },
        { status: 200 },
      );
    } catch (err) {
      console.error("join-with-token failed", err);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  },
  { requireAuth: true },
);
