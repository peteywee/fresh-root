// [P0][ONBOARDING][ORG][API] Create organization network endpoint
// Tags: P0, ONBOARDING, ORG, API, SDK_FACTORY

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { CreateOrgOnboardingSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

/**
 * POST /api/onboarding/create-network-org
 * Create organization network
 */
export const POST = createAuthenticatedEndpoint({
  input: CreateOrgOnboardingSchema,
  handler: async ({ input, context }) => {
    try {
      const org = {
        id: `org-${Date.now()}`,
        name: input.orgName,
        venueName: input.venueName,
        location: input.location,
        formToken: input.formToken,
        ownerId: context.auth?.userId,
        createdAt: Date.now(),
        status: "active",
      };
      return NextResponse.json(org);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create organization";
      console.error("Org creation failed", {
        error: message,
        userId: context.auth?.userId,
      });
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message } },
        { status: 500 }
      );
    }
  },
});
      return ok(org);
    } catch {
      return serverError("Failed to create organization network");
    }
  },
});
