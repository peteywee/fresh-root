// [P1][INTEGRITY][SCHEMA] Package types index (v14.0.0)
// Tags: P1, INTEGRITY, SCHEMA, INDEX

/**
 * v14.0.0 Update:
 * - Added Network as tenant root
 * - Added Corporate, CorpOrgLinks, OrgVenueAssignments
 * - Added AdminResponsibilityForm for compliance
 * - Updated Org and Venue schemas with networkId
 */

import { z } from "zod";

export const Role = z.enum(["admin", "manager", "staff"]);
export type Role = z.infer<typeof Role>;

// Core entity schemas
// Note: rbac also exports Membership but memberships is canonical
export * from "./rbac";
export {
  MembershipSchema,
  MembershipRole,
  MembershipStatus,
  CreateMembershipSchema,
  UpdateMembershipSchema,
  ListMembershipsQuerySchema,
  type Membership,
  type CreateMembershipInput,
  type UpdateMembershipInput,
  type ListMembershipsQuery,
} from "./memberships"; // Explicit export to avoid ambiguity with rbac
export * from "./orgs";
export * from "./schedules";
export * from "./positions";
export * from "./shifts";
export * from "./venues";
export * from "./zones";
export * from "./attendance";
export * from "./join-tokens";

// v14.0.0: Network-centric multi-tenant schemas
export * from "./networks";
export * from "./corporates";
export * from "./links"; // CorpOrgLinks, OrgVenueAssignments
export * from "./compliance"; // AdminResponsibilityForm
