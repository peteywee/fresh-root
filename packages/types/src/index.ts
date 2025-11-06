// [P1][INTEGRITY][SCHEMA] Package types index
// Tags: P1, INTEGRITY, SCHEMA, INDEX
import { z } from "zod";

export const Role = z.enum(["admin", "manager", "staff"]);
export type Role = z.infer<typeof Role>;

export * from "./rbac";
export * from "./orgs";
export * from "./schedules";

// Export memberships but rename conflicting Membership
export type { Membership as MembershipDocument } from "./memberships";

export * from "./positions";
export * from "./shifts";
export * from "./venues";
export * from "./zones";
export * from "./attendance";
export * from "./join-tokens";
// export * from "./organizations"; // REMOVE or comment out the next line to avoid ambiguity
export * from "./positions";
export * from "./schedules";
