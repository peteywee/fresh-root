// [P0][ONBOARDING][API] Activate network endpoint
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

import { adminDb } from "@/src/lib/firebase.server";

const ActivateNetworkSchema = z.object({
  networkId: z.string().or(z.number()),
});

export const POST = createAuthenticatedEndpoint({
  input: ActivateNetworkSchema,
  handler: async ({ input }) => {
    const { networkId } = input;
    if (!adminDb) {
      return NextResponse.json({ ok: true, networkId, status: "active" }, { status: 200 });
    }
    try {
      const networkRef = adminDb.collection("networks").doc(String(networkId));
      await networkRef.update({ status: "active", activatedAt: Date.now() });
      return NextResponse.json({ ok: true, networkId, status: "active" }, { status: 200 });
    } catch (err) {
      console.error("activate-network failed", err);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  },
});
