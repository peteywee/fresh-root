<<<<<<< HEAD
// [P0][SESSION][SCHEMA] Session bootstrap schema
// Tags: P0, SESSION, SCHEMA, ZOD
=======
// [P0][TYPES][SESSION] Session bootstrap input schema
// Tags: P0, TYPES, SCHEMA
>>>>>>> 2166f9b (chore(types): add standard header tags to schema files)

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
