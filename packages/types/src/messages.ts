// [P2][APP][CODE] Messages
// Tags: P2, APP, CODE
import { z } from "zod";

/**
 * messages — lightweight internal/user-facing message docs inside org scope.
 * Collection: messages
 * Keyed by server-generated id.
 */
export const MessageSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  // author uid; system emitters use "system"
  authorId: z.string().min(1),
  // channel semantic: "system" | "inbox" | "alerts" | "schedule"
  channel: z.enum(["system", "inbox", "alerts", "schedule"]),
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  // ISO string
  createdAt: z.string(),
  // message visibility: org-wide or targeted
  audience: z.union([
    z.literal("org"),
    z.object({
      type: z.literal("members"),
      memberIds: z.array(z.string().min(1)).min(1),
    }),
  ]),
  // optional linkage (e.g., scheduleId, shiftId)
  links: z
    .array(
      z.object({
        type: z.string().min(1),
        id: z.string().min(1),
      }),
    )
    .optional(),
  readBy: z.array(z.string()).default([]),
});

export type Message = z.infer<typeof MessageSchema>;
