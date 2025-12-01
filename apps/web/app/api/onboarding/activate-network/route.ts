// [P0][ONBOARDING][API] Activate network endpoint

import { NextResponse } from "next/server";
import { z } from "zod";

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { ok, serverError, badRequest } from "../../_shared/validation";
import { adminDb } from "@/src/lib/firebase.server";

const ActivateNetworkSchema = z.object({
  networkId: z.string().or(z.number()),
});

/**
 * POST /api/onboarding/activate-network
 * Activate a network after onboarding
 */
export const POST = createAuthenticatedEndpoint({
  input: ActivateNetworkSchema,
  handler: async ({ input, context }) => {
    try {
      const { networkId } = input;

      // Local/dev fallback
      if (!adminDb) {
        return ok({ ok: true, networkId, status: "active" });
      }

      const adb = adminDb;

      try {
        const networkRef = adb.collection("networks").doc(String(networkId));
        await networkRef.update({ status: "active", activatedAt: Date.now() });
        return ok({ ok: true, networkId, status: "active" });
      } catch (err) {
        console.error("activate-network failed", err);
        return serverError("Internal error");
      }
    } catch {
      return serverError("Failed to activate network");
    }
  },
});
