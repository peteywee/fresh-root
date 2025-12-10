// [P0][INTERNAL][BACKUP][API] Backup endpoint
// Tags: P0, INTERNAL, BACKUP, API, SDK_FACTORY

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { BackupRequestSchema } from "@fresh-schedules/types";
import { ok, serverError } from "../../_shared/validation";

/**
 * POST /api/internal/backup
 * Create system backup
 */
export const POST = createAuthenticatedEndpoint({
  input: BackupRequestSchema,
  handler: async ({ input, context }) => {
    try {
      const backup = {
        id: `backup-${Date.now()}`,
        type: input.type,
        entities: input.entities,
        compression: input.compression,
        encryption: input.encryption,
        initiatedBy: context.auth?.userId,
        createdAt: Date.now(),
        status: "pending" as const,
      };
      return ok(backup);
    } catch {
      return serverError("Failed to create backup");
    }
  },
});
