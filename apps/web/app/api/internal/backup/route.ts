// [P0][INTERNAL][BACKUP][API] Backup endpoint
// Tags: P0, INTERNAL, BACKUP, API, SDK_FACTORY

import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { BackupRequestSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

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
<<<<<<< HEAD
  input: BackupRequestSchema,
  handler: async ({ input, context }) => {
    try {
      const backup = {
        id: `backup-${Date.now()}`,
        type: input.type,
        entities: input.entities,
        compression: input.compression,
        encryption: input.encryption,
=======
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
>>>>>>> origin/dev
        initiatedBy: context.auth?.userId,
        createdAt: Date.now(),
        status: "pending" as const,
      };
<<<<<<< HEAD
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
=======
      return ok(backup);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create backup";
      console.error("Failed to create backup", { error: message, userId: context.auth?.userId });
      return serverError("Failed to create backup");
>>>>>>> origin/dev
    }
  },
});
