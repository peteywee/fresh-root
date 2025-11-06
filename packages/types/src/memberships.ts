// [P1][INTEGRITY][CODE] Membership Zod schemas for organization members
// Tags: P1, INTEGRITY, CODE, RBAC, VALIDATION
import { z } from "zod";

import { OrgRole } from "./rbac";

/**
 * Complete membership record as stored in Firestore.
 * Represents a user's membership in an organization with their roles.
 */
export const MembershipRecord = z.object({
  id: z.string().min(1, "Membership ID is required"),
  orgId: z.string().min(1, "Organization ID is required"),
  uid: z.string().min(1, "User ID is required"),
  roles: z.array(OrgRole).min(1, "At least one role is required"),
  joinedAt: z.string().datetime("Invalid joinedAt timestamp"),
  mfaVerified: z.boolean().default(false),
  invitedBy: z.string().optional(),
  createdAt: z.string().datetime("Invalid createdAt timestamp"),
  updatedAt: z.string().datetime("Invalid updatedAt timestamp").optional(),
});

export type MembershipRecord = z.infer<typeof MembershipRecord>;

/**
 * Input schema for creating a new membership.
 * Used when adding a member to an organization.
 */
export const MembershipCreateSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
  roles: z
    .array(OrgRole)
    .min(1, "At least one role is required")
    .max(5, "Maximum 5 roles allowed")
    .refine(
      (roles) => {
        // Ensure org_owner is not assigned via API (only through org creation)
        return !roles.includes("org_owner");
      },
      { message: "org_owner role cannot be assigned via API" },
    ),
  mfaVerified: z.boolean().default(false),
});

export type MembershipCreateInput = z.infer<typeof MembershipCreateSchema>;

/**
 * Input schema for updating an existing membership.
 * All fields are optional for partial updates.
 */
export const MembershipUpdateSchema = z
  .object({
    roles: z
      .array(OrgRole)
      .min(1, "At least one role is required")
      .max(5, "Maximum 5 roles allowed")
      .refine(
        (roles) => {
          // Prevent org_owner from being assigned or removed via update
          return !roles.includes("org_owner");
        },
        { message: "org_owner role cannot be modified via API" },
      )
      .optional(),
    mfaVerified: z.boolean().optional(),
  })
  .strict();

export type MembershipUpdateInput = z.infer<typeof MembershipUpdateSchema>;

/**
 * Role hierarchy for permission checks.
 * Higher index = more permissions.
 */
export const ROLE_HIERARCHY: Record<OrgRole, number> = {
  staff: 0,
  scheduler: 1,
  corporate: 2,
  manager: 3,
  admin: 4,
  org_owner: 5,
};

/**
 * Helper to check if a role has permission to assign/modify another role.
 * Rule: You can only assign roles below your highest role.
 */
export function canAssignRole(assignerRoles: OrgRole[], targetRole: OrgRole): boolean {
  const maxAssignerLevel = Math.max(...assignerRoles.map((r) => ROLE_HIERARCHY[r]));
  const targetLevel = ROLE_HIERARCHY[targetRole];
  return maxAssignerLevel > targetLevel;
}

/**
 * Helper to check if a user has at least one of the required roles.
 */
export function hasAnyRole(userRoles: OrgRole[], requiredRoles: OrgRole[]): boolean {
  return requiredRoles.some((role) => userRoles.includes(role));
}

/**
 * Helper to check if a user has a specific minimum role level.
 */
export function hasMinimumRole(userRoles: OrgRole[], minimumRole: OrgRole): boolean {
  const userMaxLevel = Math.max(...userRoles.map((r) => ROLE_HIERARCHY[r]));
  const requiredLevel = ROLE_HIERARCHY[minimumRole];
  return userMaxLevel >= requiredLevel;
}
