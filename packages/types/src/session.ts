<<<<<<< HEAD
// [P0][DOMAIN][SCHEMA] Session and authentication schemas
// Tags: P0, DOMAIN, SCHEMA, SESSION
=======
// [P0][SESSION][SCHEMA] Session bootstrap schema
// Tags: P0, SESSION, SCHEMA, ZOD
>>>>>>> origin/dev

import { z } from "zod";

/**
<<<<<<< HEAD
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
=======
 * Session bootstrap payload
 * Used when creating a new session with optional metadata
 */
export const CreateSessionSchema = z.object({
  userId: z.string().min(1, "User ID required").optional(),
  email: z.string().email("Invalid email").optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});
export type CreateSession = z.infer<typeof CreateSessionSchema>;
>>>>>>> origin/dev
