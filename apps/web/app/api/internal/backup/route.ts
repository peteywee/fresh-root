// [P0][INTERNAL][BACKUP][API] Backup endpoint
// Tags: P0, INTERNAL, BACKUP, API, SDK_FACTORY

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { BackupRequestSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

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
        status: "pending",
      };
      return NextResponse.json(backup);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create backup";
      console.error("Backup creation failed", {
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
