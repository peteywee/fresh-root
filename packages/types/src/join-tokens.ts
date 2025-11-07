// [P1][INTEGRITY][SCHEMA] Join tokens schema
// Tags: P1, INTEGRITY, SCHEMA, ZOD, JOIN_TOKENS
import { z } from "zod";

import { MembershipRole } from "./memberships";

/**
 * Join token status
 */
export const JoinTokenStatus = z.enum(["active", "used", "expired", "revoked"]);
export type JoinTokenStatus = z.infer<typeof JoinTokenStatus>;

/**
 * Full Join Token document schema
 * Firestore path: /join_tokens/{orgId}/{tokenId}
 * or /orgs/{orgId}/join_tokens/{tokenId}
 */
export const JoinTokenSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1, "Organization ID is required"),
  token: z.string().min(16, "Token must be at least 16 characters"),

  // Role assignment
  defaultRoles: z.array(MembershipRole).min(1, "At least one role is required"),

  // Usage tracking
  status: JoinTokenStatus.default("active"),
  maxUses: z.number().int().positive().optional(),
  currentUses: z.number().int().nonnegative().default(0),
  usedBy: z.array(z.string()).default([]),

  // Expiration
  expiresAt: z.number().int().positive().optional(),

  // Metadata
  description: z.string().max(200).optional(),
  createdBy: z.string().min(1),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});
export type JoinToken = z.infer<typeof JoinTokenSchema>;

/**
 * Schema for creating a new join token
 * Used in POST /api/join-tokens
 */
export const CreateJoinTokenSchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  defaultRoles: z.array(MembershipRole).min(1, "At least one role is required"),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.number().int().positive().optional(),
  description: z.string().max(200).optional(),
});
export type CreateJoinTokenInput = z.infer<typeof CreateJoinTokenSchema>;

/**
 * Schema for updating an existing join token
 * Used in PATCH /api/join-tokens/{id}
 */
export const UpdateJoinTokenSchema = z.object({
  status: JoinTokenStatus.optional(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.number().int().positive().optional(),
  description: z.string().max(200).optional(),
});
export type UpdateJoinTokenInput = z.infer<typeof UpdateJoinTokenSchema>;

/**
 * Schema for redeeming a join token
 * Used in POST /api/join-tokens/redeem
 */
export const RedeemJoinTokenSchema = z.object({
  token: z.string().min(16, "Invalid token"),
});
export type RedeemJoinTokenInput = z.infer<typeof RedeemJoinTokenSchema>;

/**
 * Query parameters for listing join tokens
 */
export const ListJoinTokensQuerySchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  status: JoinTokenStatus.optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListJoinTokensQuery = z.infer<typeof ListJoinTokensQuerySchema>;
