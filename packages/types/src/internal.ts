<<<<<<< HEAD
// [P0][INTERNAL][SCHEMA] Internal operations schema (backup, publish)
// Tags: P0, INTERNAL, SCHEMA, ZOD, ADMIN
=======
// [P0][TYPES][INTERNAL] Internal operations schemas
// Tags: P0, TYPES, SCHEMA
>>>>>>> 2166f9b (chore(types): add standard header tags to schema files)

import { z } from "zod";
export const CreateBackupSchema = z.object({
  type: z.enum(["full", "incremental", "audit"]).default("full"),
  includeMedia: z.boolean().default(false),
  description: z.string().max(500).optional(),
  retentionDays: z.number().int().min(1).max(365).optional(),
});

export type CreateBackup = z.infer<typeof CreateBackupSchema>;
