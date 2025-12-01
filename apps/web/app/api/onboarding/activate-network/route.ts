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
  handler: async ({ request, context }) => {
    try {
      const body = await request.json();
      const result = ActivateNetworkSchema.safeParse(body);

      if (!result.success) {
        return badRequest("validation_error");
      }

      const { networkId } = result.data;

      // Local/dev fallback
      if (!adminDb) {
        return ok({
          ok: true,
          networkId,
          status: "active",
          activatedAt: Date.now(),
        });
      }

      const adb = adminDb;
      const networkRef = adb.collection("networks").doc(String(networkId));
      await networkRef.update({
        status: "active",
        activatedAt: Date.now(),
        activatedBy: context.auth?.userId,
      });

      return ok({
        ok: true,
        networkId,
        status: "active",
        activatedAt: Date.now(),
      });
    } catch {
      return serverError("Failed to activate network");
    }
  },
});
