// [P0][ONBOARDING][API] Activate network endpoint (with typed wrapper)

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

import { ok, serverError } from "../../_shared/validation";

import { updateDocWithType } from "@/src/lib/firebase/typed-wrappers";
import { adminDb } from "@/src/lib/firebase.server";

const ActivateNetworkSchema = z.object({
  networkId: z.string().or(z.number()),
});

/**
 * Network document from Firestore
 */
export interface NetworkDoc {
  id: string;
  name: string;
  status: "active" | "inactive" | "pending";
  activatedAt?: number | Timestamp;
  createdAt: number | Timestamp;
  updatedAt: number | Timestamp;
  ownerId: string;
  [key: string]: unknown;
}

/**
 * POST /api/onboarding/activate-network
 * Activate a network after onboarding
 */
export const POST = createAuthenticatedEndpoint({
  input: ActivateNetworkSchema,
  handler: async ({ request: _request, input, context, params: _params }) => {
    try {
      // Type assertion safe - input validated by SDK factory
      const typedInput = input as z.infer<typeof ActivateNetworkSchema>;
      const { networkId } = typedInput;

      // Local/dev fallback
      if (!adminDb) {
        return ok({ ok: true, networkId, status: "active" });
      }

      const adb = adminDb;

      try {
        const networkRef = adb.collection("networks").doc(String(networkId));

        // Use typed wrapper for safe update
        await updateDocWithType<NetworkDoc>(adb, networkRef, {
          status: "active",
          activatedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

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
