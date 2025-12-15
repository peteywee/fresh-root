// [P0][INTERNAL][BACKUP][API] Backup endpoint
// Tags: P0, INTERNAL, BACKUP, API, SDK_FACTORY

import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

import { ok, serverError } from "../../_shared/validation";

// TODO: Move to packages/types/src/internal.ts once module resolution stabilizes
// For now, inline to avoid TypeScript import resolution issues in monorepo
const BackupRequestSchema = z.object({
  type: z.enum(["full", "partial", "incremental"]).default("full"),
  entities: z.array(z.string()).optional(),
  compression: z.boolean().default(true),
  encryption: z.boolean().default(true),
});

/**
 * POST /api/internal/backup
 * Create system backup
 */
export const POST = createAuthenticatedEndpoint({
  input: BackupRequestSchema,
  handler: async ({ input, context }) => {
    try {
      // Type assertion safe - input validated by SDK factory
      const typedInput = input as z.infer<typeof BackupRequestSchema>;
      const backup = {
        id: `backup-${Date.now()}`,
        type: typedInput.type,
        entities: typedInput.entities,
        compression: typedInput.compression,
        encryption: typedInput.encryption,
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
