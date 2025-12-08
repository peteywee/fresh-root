// [P0][SESSION][SCHEMA] Session bootstrap schema
// Tags: P0, SESSION, SCHEMA, ZOD

import { z } from "zod";

/**
 * Session bootstrap payload
 * Used when creating a new session with optional metadata
 */
export const CreateSessionSchema = z.object({
  userId: z.string().min(1, "User ID required").optional(),
  email: z.string().email("Invalid email").optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});
export type CreateSession = z.infer<typeof CreateSessionSchema>;
