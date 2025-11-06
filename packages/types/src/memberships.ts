// [P1][INTEGRITY][SCHEMA] Memberships schema
// Tags: P1, INTEGRITY, SCHEMA, ZOD, MEMBERSHIPS
import { z } from "zod";

/**
 * Membership roles within an organization
 * Maps to Firestore custom claims and RBAC checks
 */
export const MembershipRole = z.enum(["org_owner", "admin", "manager", "scheduler", "staff"]);
export type MembershipRole = z.infer<typeof MembershipRole>;

/**
 * Membership status lifecycle
 */
export const MembershipStatus = z.enum(["active", "suspended", "invited", "removed"]);
export type MembershipStatus = z.infer<typeof MembershipStatus>;

/**
 * Full Membership document schema
 * Firestore path: /memberships/{uid}_{orgId}
 */
export const MembershipSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
  orgId: z.string().min(1, "Organization ID is required"),
  roles: z.array(MembershipRole).min(1, "At least one role is required"),
  status: MembershipStatus.default("active"),
  invitedBy: z.string().optional(),
  invitedAt: z.number().int().positive().optional(),
  joinedAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  createdAt: z.number().int().positive(),
});
export type Membership = z.infer<typeof MembershipSchema>;

/**
 * Schema for creating a new membership
 * Used in POST /api/memberships
 */
export const CreateMembershipSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
  orgId: z.string().min(1, "Organization ID is required"),
  roles: z.array(MembershipRole).min(1, "At least one role is required"),
  status: MembershipStatus.optional().default("invited"),
  invitedBy: z.string().optional(),
});
export type CreateMembershipInput = z.infer<typeof CreateMembershipSchema>;

/**
 * Schema for updating an existing membership
 * Used in PATCH /api/memberships/{id}
 */
export const UpdateMembershipSchema = z.object({
  roles: z.array(MembershipRole).min(1).optional(),
  status: MembershipStatus.optional(),
});
export type UpdateMembershipInput = z.infer<typeof UpdateMembershipSchema>;

/**
 * Query parameters for listing memberships
 */
export const ListMembershipsQuerySchema = z.object({
  orgId: z.string().optional(),
  uid: z.string().optional(),
  status: MembershipStatus.optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListMembershipsQuery = z.infer<typeof ListMembershipsQuerySchema>;
