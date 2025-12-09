// [P0][INTERNAL][SCHEMA] Internal operations schema (backup, publish)
// Tags: P0, INTERNAL, SCHEMA, ZOD, ADMIN

import { z } from "zod";
export const CreateBackupSchema = z.object({
  type: z.enum(["full", "incremental", "audit"]).default("full"),
  includeMedia: z.boolean().default(false),
  description: z.string().max(500).optional(),
  retentionDays: z.number().int().min(1).max(365).optional(),
});

export type CreateBackup = z.infer<typeof CreateBackupSchema>;
