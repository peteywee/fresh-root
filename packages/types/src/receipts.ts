// [P1][TYPES][SCHEMA] Schema definitions
// Tags: P2, APP, CODE
import { z } from "zod";

/**
 * receipts — audit-ish acknowledgements for actions (publish, approvals, etc.)
 * Collection: receipts
 * Keyed by server-generated id.
 */
export const ReceiptSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  actorId: z.string().min(1), // uid that performed the action
  action: z.enum([
    "schedule.publish",
    "shift.assign",
    "member.approve",
    "token.issue",
    "mfa.enroll",
    "mfa.verify",
  ]),
  // optional resource linkage (schedule/shift/member/etc.)
  resource: z
    .object({
      type: z.string().min(1),
      id: z.string().min(1),
    })
    .optional(),
  createdAt: z.string(), // ISO
  // optional metadata snap for forensics/troubleshooting
  meta: z.record(z.string(), z.any()).default({}),
});

export type Receipt = z.infer<typeof ReceiptSchema>;
