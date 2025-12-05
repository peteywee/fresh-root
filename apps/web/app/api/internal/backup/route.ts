// [P0][INTERNAL][BACKUP][API] Backup endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { ok, serverError } from "../../_shared/validation";

/**
 * POST /api/internal/backup
 * Create system backup
 */
export const POST = createAuthenticatedEndpoint({
  handler: async ({ request, context }) => {
    try {
      const body = await request.json();
      const { type, includeMedia } = body;

      const backup = {
        id: `backup-${Date.now()}`,
        type: type || "full",
        includeMedia: includeMedia || false,
        initiatedBy: context.auth?.userId,
        createdAt: Date.now(),
        status: "pending",
      };
      return ok(backup);
    } catch {
      return serverError("Failed to create backup");
    }
  },
});
