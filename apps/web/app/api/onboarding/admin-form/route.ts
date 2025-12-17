// [P0][ONBOARDING][ADMIN][API] Admin form endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

import { ok, serverError } from "../../_shared/validation";

/**
 * GET /api/onboarding/admin-form
 * Get admin onboarding form
 */
export const GET = createAuthenticatedEndpoint({
  handler: async ({ request: _request, input: _input, context, params: _params }) => {
    try {
      const form = {
        id: "admin-form",
        title: "Administrator Setup",
        fields: [
          { name: "organizationName", type: "text", required: true },
          { name: "adminEmail", type: "email", required: true },
          { name: "role", type: "select", options: ["admin", "owner"], required: true },
        ],
        userId: context.auth?.userId,
      };
      return ok(form);
    } catch {
      return serverError("Failed to fetch admin form");
    }
  },
});
