// [P1][INTEGRITY][SCHEMA] Package types index
// Tags: P1, INTEGRITY, SCHEMA, INDEX
import { z } from "zod";

/**
 * Defines the roles available in the system.
 * - `admin`: Has full access to the system.
 * - `manager`: Can manage schedules and staff within their assigned organization.
 * - `staff`: Can view their schedules and perform basic actions.
 */
export const Role = z.enum(["admin", "manager", "staff"]);
export type Role = z.infer<typeof Role>;

export * from "./rbac";
export * from "./corporate";
export * from "./orgs";
export * from "./schedules";
export * from "./memberships"; // This provides the canonical Membership export
export * from "./positions";
export * from "./shifts";
export * from "./venues";
export * from "./zones";
export * from "./attendance";
export * from "./join-tokens";
export * from "./compliance/adminResponsibilityForm";
export * from "./networks";
export * from "./onboarding";
