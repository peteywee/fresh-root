// [P0][DOMAIN][SCHEMA] Session and authentication schemas
// Tags: P0, DOMAIN, SCHEMA, SESSION

import { z } from "zod";

/**
 * Session bootstrap schema
 * Used for initial session setup and user context loading
 */
export const SessionBootstrapSchema = z.object({
  idToken: z.string().min(1),
  redirectUrl: z.string().url().optional(),
  orgId: z.string().min(1).optional(),
});

export type SessionBootstrap = z.infer<typeof SessionBootstrapSchema>;

/**
 * Session refresh schema
 * Used for extending or refreshing existing sessions
 */
export const SessionRefreshSchema = z.object({
  sessionId: z.string().min(1),
  extendTTL: z.boolean().default(false),
});

export type SessionRefresh = z.infer<typeof SessionRefreshSchema>;