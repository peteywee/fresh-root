// [P0][INTERNAL][BACKUP][API] Backup endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { ok, serverError } from "../../_shared/validation";
import { CreateBackupSchema } from "@fresh-schedules/types";

/**
 * POST /api/internal/backup
 * Create system backup
 */
export const POST = createAuthenticatedEndpoint({
  input: CreateBackupSchema,
  handler: async ({ input, context }) => {
    try {
      const { type, includeMedia, description, retentionDays } = input;

      const backup = {
        id: `backup-${Date.now()}`,
        type,
        includeMedia,
        description,
        retentionDays,
        initiatedBy: context.auth?.userId,
        createdAt: Date.now(),
        status: "pending" as const,
      };
      return ok(backup);
    } catch (err) {
      return serverError("Failed to create backup");
    }
  },
});
