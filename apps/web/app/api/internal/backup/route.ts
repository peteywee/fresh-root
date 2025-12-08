// [P0][INTERNAL][BACKUP][API] Backup endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { z } from "zod";
import { ok, serverError } from "../../_shared/validation";

const CreateBackupSchema = z.object({
  type: z.enum(["full", "incremental", "audit"]).default("full"),
  includeMedia: z.boolean().default(false),
  description: z.string().max(500).optional(),
  retentionDays: z.number().int().min(1).max(365).optional(),
});

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
        status: "pending",
      };
      return ok(backup);
    } catch {
      return serverError("Failed to create backup");
    }
  },
});
