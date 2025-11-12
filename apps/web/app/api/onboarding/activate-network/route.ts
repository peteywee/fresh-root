//[P1][API][ONBOARDING] Activate Network Endpoint
// Tags: api, onboarding, network, activate

import { NextResponse } from "next/server";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

import { adminDb } from "@/lib/firebase.server";

export const POST = withSecurity(
  async (req: AuthenticatedRequest) => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const { networkId } = (body as Record<string, unknown>) || {};
    if (!networkId) return NextResponse.json({ error: "missing_network_id" }, { status: 422 });

    // Local/dev fallback
    if (!adminDb) {
      return NextResponse.json({ ok: true, networkId, status: "active" }, { status: 200 });
    }

    const adb = adminDb;

    try {
      const networkRef = adb.collection("networks").doc(String(networkId));
      await networkRef.update({ status: "active", activatedAt: Date.now() });
      return NextResponse.json({ ok: true, networkId, status: "active" }, { status: 200 });
    } catch (err) {
      console.error("activate-network failed", err);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  },
  { requireAuth: true },
);
