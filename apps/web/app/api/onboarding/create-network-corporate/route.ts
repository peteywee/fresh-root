// [P1][ONBOARDING][CORPORATE][API] Create corporate network endpoint with orgId cookie and Firestore persistence
// Tags: P1, ONBOARDING, CORPORATE, API, SDK_FACTORY, A3, B3

import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { CreateCorporateOnboardingSchema } from "@fresh-schedules/types";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import { ok, serverError } from "../../_shared/validation";
import { FLAGS } from "../../../../src/lib/features";

/**
 * POST /api/onboarding/create-network-corporate
 * Create a corporate network and set orgId cookie
 */
export const POST = createAuthenticatedEndpoint({
  input: CreateCorporateOnboardingSchema,
  handler: async ({ request: _request, input, context, params: _params }) => {
    try {
      // Type assertion safe - input validated by SDK factory
      const typedInput = input as z.infer<typeof CreateCorporateOnboardingSchema>;
      const { corporateName, brandName, formToken } = typedInput;
      const userId = context.auth?.userId;

      if (!userId) {
        return serverError("User ID is required");
      }

      const network = {
        id: `network-${Date.now()}`,
        type: "corporate",
        corporateName,
        brandName,
        formToken,
        ownerId: userId,
        createdAt: Date.now(),
      };

      // B3: Write network document to Firestore if FIRESTORE_WRITES enabled
      if (FLAGS.FIRESTORE_WRITES) {
        const db = getFirestore();

        const networkData = {
          type: network.type,
          corporateName: network.corporateName,
          brandName: network.brandName,
          formToken: network.formToken,
          ownerId: userId,
          createdAt: network.createdAt,
        };
        await db.collection("networks").doc(network.id).set(networkData);
      }

      // A3: Set orgId cookie for session persistence
      const response = NextResponse.json(ok(network));
      response.cookies.set("orgId", network.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create corporate network";
      console.error("Create corporate network failed", {
        error: message,
        userId: context.auth?.userId,
      });
      return serverError("Failed to create corporate network");
    }
  },
});
