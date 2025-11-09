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
 * @property {string} id - The unique identifier for the join token.
 * @property {string} orgId - The ID of the organization this token belongs to.
 * @property {string} token - The unique token string.
 * @property {MembershipRole[]} defaultRoles - The roles to be assigned to a user who redeems this token.
 * @property {JoinTokenStatus} [status=active] - The current status of the token.
 * @property {number} [maxUses] - The maximum number of times this token can be used.
 * @property {number} [currentUses=0] - The number of times this token has been used.
 * @property {string[]} [usedBy] - A list of user IDs who have used this token.
 * @property {number} [expiresAt] - The Unix timestamp of when this token expires.
 * @property {string} [description] - A description of the token's purpose.
 * @property {string} createdBy - The user ID of the user who created the token.
 * @property {number} createdAt - The timestamp of when the token was created.
 * @property {number} updatedAt - The timestamp of when the token was last updated.
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
 * @property {string} orgId - The ID of the organization this token belongs to.
 * @property {MembershipRole[]} defaultRoles - The roles to be assigned to a user who redeems this token.
 * @property {number} [maxUses] - The maximum number of times this token can be used.
 * @property {number} [expiresAt] - The Unix timestamp of when this token expires.
 * @property {string} [description] - A description of the token's purpose.
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
 * @property {JoinTokenStatus} [status] - The new status of the token.
 * @property {number} [maxUses] - The new maximum number of uses.
 * @property {number} [expiresAt] - The new expiration timestamp.
 * @property {string} [description] - The new description.
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
 * @property {string} token - The join token string to redeem.
 */
export const RedeemJoinTokenSchema = z.object({
  token: z.string().min(16, "Invalid token"),
});
export type RedeemJoinTokenInput = z.infer<typeof RedeemJoinTokenSchema>;

/**
 * Query parameters for listing join tokens
 * @property {string} orgId - The ID of the organization to list tokens for.
 * @property {JoinTokenStatus} [status] - Filter tokens by status.
 * @property {number} [limit=50] - The maximum number of tokens to return.
 * @property {string} [cursor] - The cursor for pagination.
 */
export const ListJoinTokensQuerySchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  status: JoinTokenStatus.optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListJoinTokensQuery = z.infer<typeof ListJoinTokensQuerySchema>;
