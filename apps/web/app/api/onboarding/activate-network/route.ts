// [P0][ONBOARDING][API] Activate network endpoint
import { NextResponse } from "next/server";
import { z } from "zod";

import { adminDb } from "@/src/lib/firebase.server";
import { createPublicEndpoint } from "@fresh-schedules/api-framework";

// Schema for activate network request
const ActivateNetworkSchema = z.object({
  networkId: z.string().or(z.number()),
});

export const POST = createPublicEndpoint({
  handler: async ({ request, input, context, params }) => {
    async (req: AuthenticatedRequest) => {
  let body: unknown;
  try {
    body = await req.json(;
  }
});
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Validate input
  const result = ActivateNetworkSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "validation_error", issues: result.error.issues },
      { status: 422 },
    );
  }

  const { networkId } = result.data;

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
});
