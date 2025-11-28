// [P0][INTEGRITY][SCHEMA] Package types index
// Tags: P1, INTEGRITY, SCHEMA, INDEX
import { z } from "zod";

import { AdminResponsibilityFormSchema } from "./compliance/adminResponsibilityForm";

export const Role = z.enum(["admin", "manager", "staff"]);
export type Role = z.infer<typeof Role>;

// Type inference from compliance schemas
export type AdminResponsibilityForm = z.infer<typeof AdminResponsibilityFormSchema>;

export * from "./rbac";
export * from "./corporates";
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
export * from "./events";
export * from "./errors";

// Additional collections and convenience exports added by v14.5
export * as corporates from "./corporates";
export * as widgets from "./widgets";
export * as messages from "./messages";
export * as receipts from "./receipts";
export * as compliance from "./compliance";
