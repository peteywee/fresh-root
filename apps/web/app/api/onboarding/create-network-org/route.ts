// [P1][ONBOARDING][ORG][API] Create organization network endpoint with orgId cookie
// Tags: P1, ONBOARDING, ORG, API, SDK_FACTORY, A3

import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { CreateNetworkSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

import { ok, serverError } from "../../_shared/validation";

/**
 * POST /api/onboarding/create-network-org
 * Create organization network and set orgId cookie
 */
export const POST = createAuthenticatedEndpoint({
  input: CreateNetworkSchema,
  handler: async ({ request: _request, input, context, params: _params }) => {
    try {
      // Type assertion safe - input validated by SDK factory
      const typedInput = input as z.infer<typeof CreateNetworkSchema>;
      const org = {
        id: `org-${Date.now()}`,
        name: typedInput.organizationName,
        type: typedInput.type,
        ownerId: context.auth?.userId,
        createdAt: Date.now(),
        status: "active",
      };

      // A3: Set orgId cookie for session persistence
      const response = NextResponse.json(ok(org));
      response.cookies.set('orgId', org.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      return response;
    } catch {
      return serverError("Failed to create organization network");
    }
  },
});
