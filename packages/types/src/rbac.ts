// [P1][TYPES][SCHEMA] Schema definitions
// Tags: P0, RBAC, CODE
import { z } from "zod";

// Role hierarchy (highest to lowest):
// admin (100) - Super admin, cross-org access, system-wide
// corporate (90) - Network/multi-org scope, adjacent to org_owner
// org_owner (85) - Owner of a single organization
// manager (60) - Manages schedules, staff within org
// scheduler (60) - Creates/edits schedules (manager-equivalent)
// staff (40) - Views own schedule, limited self-updates
export const OrgRole = z.enum(["admin", "corporate", "org_owner", "manager", "scheduler", "staff"]);
export type OrgRole = z.infer<typeof OrgRole>;

export const UserClaims = z.object({
  uid: z.string(),
  orgId: z.string(),
  roles: z.array(OrgRole).nonempty(),
});
export type UserClaims = z.infer<typeof UserClaims>;

// Legacy membership-like shape used in some RBAC checks. Not the canonical
// membership stored in `/memberships/*` (see `memberships.ts`). Export under a
// different name to avoid duplicate symbol collisions when re-exporting.
export const MembershipClaimsSchema = z.object({
  orgId: z.string(),
  userId: z.string(),
  roles: z.array(OrgRole),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type MembershipClaims = z.infer<typeof MembershipClaimsSchema>;
