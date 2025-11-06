// [P0][RBAC][CODE] Rbac
// Tags: P0, RBAC, CODE
import { z } from "zod";

export const OrgRole = z.enum(["org_owner", "admin", "manager", "scheduler", "staff"]);
export type OrgRole = z.infer<typeof OrgRole>;

export const UserClaims = z.object({
  uid: z.string(),
  orgId: z.string(),
  roles: z.array(OrgRole).nonempty(),
});
export type UserClaims = z.infer<typeof UserClaims>;

export const Membership = z.object({
  orgId: z.string(),
  userId: z.string(),
  roles: z.array(OrgRole),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type Membership = z.infer<typeof Membership>;
