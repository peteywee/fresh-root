// [P1][ONBOARDING][CORPORATE][API] Create corporate network endpoint with orgId cookie
// Tags: P1, ONBOARDING, CORPORATE, API, SDK_FACTORY, A3

import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { CreateCorporateOnboardingSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

import { ok, serverError } from "../../_shared/validation";

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
      const network = {
        id: `network-${Date.now()}`,
        type: "corporate",
        corporateName,
        brandName,
        formToken,
        ownerId: context.auth?.userId,
        createdAt: Date.now(),
      };

      // A3: Set orgId cookie for session persistence
      const response = NextResponse.json(ok(network));
      response.cookies.set('orgId', network.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      return response;
    } catch {
      return serverError("Failed to create corporate network");
    }
  },
});
