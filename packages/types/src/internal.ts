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