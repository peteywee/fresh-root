// [P0][SESSION][SCHEMA] Session API schemas
// Tags: P0, SESSION, SCHEMA

import { z } from "zod";

// Session bootstrap schema (for POST requests with optional preferences)
export const SessionBootstrapSchema = z.object({
  preferences: z
    .object({
      theme: z.enum(["light", "dark", "auto"]).default("auto"),
      timezone: z.string().optional(),
      language: z.string().default("en"),
    })
    .optional(),
  deviceInfo: z
    .object({
      userAgent: z.string().optional(),
      platform: z.string().optional(),
    })
    .optional(),
});

export type SessionBootstrap = z.infer<typeof SessionBootstrapSchema>;
