<<<<<<< HEAD
// [P0][DOMAIN][SCHEMA] Internal operation schemas
// Tags: P0, DOMAIN, SCHEMA, INTERNAL

import { z } from "zod";

/**
 * Internal backup operation schema
 * Used for system backup and data export operations
 */
export const BackupRequestSchema = z.object({
  type: z.enum(["full", "incremental", "selective"]).default("incremental"),
  entities: z.array(z.string()).optional(),
  compression: z.boolean().default(true),
  encryption: z.boolean().default(true),
});

export type BackupRequest = z.infer<typeof BackupRequestSchema>;

/**
 * Publish operation schema
 * Used for schedule and content publishing
 */
export const PublishRequestSchema = z.object({
  entityType: z.enum(["schedule", "shift", "announcement"]),
  entityId: z.string().min(1),
  publishAt: z.number().int().positive().optional(),
  notifyUsers: z.boolean().default(true),
  channels: z.array(z.enum(["email", "sms", "push"])).default(["push"]),
});

export type PublishRequest = z.infer<typeof PublishRequestSchema>;
=======
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
>>>>>>> origin/dev
