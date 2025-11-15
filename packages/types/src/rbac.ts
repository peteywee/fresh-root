// [P0][RBAC][CODE] Rbac
// Tags: P0, RBAC, CODE
import { z } from "zod";

export const OrgRole = z.enum(["org_owner", "admin", "manager", "scheduler", "corporate", "staff"]);
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