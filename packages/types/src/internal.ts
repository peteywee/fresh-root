// [P0][INTERNAL][SCHEMA] Internal API schemas
// Tags: P0, INTERNAL, SCHEMA

import { z } from "zod";

// Backup request schema
export const BackupRequestSchema = z.object({
  type: z.enum(["full", "partial", "incremental"]).default("full"),
  entities: z.array(z.string()).optional(),
  compression: z.boolean().default(true),
  encryption: z.boolean().default(true),
});

export type BackupRequest = z.infer<typeof BackupRequestSchema>;

// Publish request schema
export const PublishRequestSchema = z.object({
  scheduleId: z.string().min(1, "Schedule ID is required"),
  publishAt: z.number().int().positive().optional(),
  notifyUsers: z.boolean().default(true),
  channels: z.array(z.enum(["email", "push", "sms"])).default(["email"]),
});

export type PublishRequest = z.infer<typeof PublishRequestSchema>;
