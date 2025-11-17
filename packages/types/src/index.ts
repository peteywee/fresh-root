// [P1][INTEGRITY][SCHEMA] Package types index
// Tags: P1, INTEGRITY, SCHEMA, INDEX
import { z } from "zod";

export const Role = z.enum(["admin", "manager", "staff"]);
export type Role = z.infer<typeof Role>;

export * from "./rbac.js";
export * from "./corporates.js";
export * from "./orgs.js";
export * from "./schedules.js";
export * from "./memberships.js"; // This provides the canonical Membership export
export * from "./positions.js";
export * from "./shifts.js";
export * from "./venues.js";
export * from "./zones.js";
export * from "./attendance.js";
export * from "./join-tokens.js";
export * from "./compliance/adminResponsibilityForm.js";
export * from "./networks.js";
export * from "./onboarding.js";
export * from "./events.js";
export * from "./errors.js";

// Additional collections and convenience exports added by v14.5
export * as corporates from "./corporates.js";
export * as widgets from "./widgets.js";
export * as messages from "./messages.js";
export * as receipts from "./receipts.js";
export * as compliance from "./compliance/index.js";

