// [P0][RBAC][CODE] Rbac
// Tags: P0, RBAC, CODE
import { z } from "zod";

/**
 * Defines the roles within an organization.
 * - `org_owner`: The primary owner of the organization.
 * - `admin`: Has administrative privileges within the organization.
 * - `manager`: Can manage schedules and staff.
 * - `scheduler`: Can create and manage schedules.
 * - `corporate`: Has access to corporate-level features.
 * - `staff`: A standard staff member.
 */
export const OrgRole = z.enum(["org_owner", "admin", "manager", "scheduler", "corporate", "staff"]);
export type OrgRole = z.infer<typeof OrgRole>;

/**
 * Represents the claims associated with a user's session.
 * @property {string} uid - The user's unique identifier.
 * @property {string} orgId - The ID of the organization the user belongs to.
 * @property {OrgRole[]} roles - The roles assigned to the user.
 */
export const UserClaims = z.object({
  uid: z.string(),
  orgId: z.string(),
  roles: z.array(OrgRole).nonempty(),
});
export type UserClaims = z.infer<typeof UserClaims>;

/**
 * A legacy membership-like shape used in some RBAC checks.
 * This is not the canonical membership stored in `/memberships/*`.
 * @property {string} orgId - The ID of the organization.
 * @property {string} userId - The user's unique identifier.
 * @property {OrgRole[]} roles - The roles assigned to the user.
 * @property {number} createdAt - The timestamp when the membership was created.
 * @property {number} updatedAt - The timestamp when the membership was last updated.
 */
export const MembershipClaimsSchema = z.object({
  orgId: z.string(),
  userId: z.string(),
  roles: z.array(OrgRole),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type MembershipClaims = z.infer<typeof MembershipClaimsSchema>;
