// [P0][INTEGRITY][SCHEMA] Package types index
// Tags: P1, INTEGRITY, SCHEMA, INDEX
import { z } from "zod";

import { AdminResponsibilityFormSchema } from "./compliance/adminResponsibilityForm";
import { CreateBatchSchema, CreateBatch } from "./batch";
import { BackupRequestSchema, BackupRequest } from "./internal";
import { AddMemberSchema, AddMemberInput } from "./memberships";
import { UpdatePositionSchema, UpdatePositionInput } from "./positions";
import { ActivateNetworkSchema, ActivateNetworkInput } from "./networks";

export const Role = z.enum(["admin", "manager", "staff"]);
export type Role = z.infer<typeof Role>;

// Type inference from compliance schemas
export type AdminResponsibilityForm = z.infer<typeof AdminResponsibilityFormSchema>;

// Explicit exports for batch schemas
export { CreateBatchSchema };
export type { CreateBatch };

// Explicit exports for internal schemas
export { BackupRequestSchema };
export type { BackupRequest };

// Explicit exports for new route migration schemas
export { AddMemberSchema };
export type { AddMemberInput };
export { UpdatePositionSchema };
export type { UpdatePositionInput };
export { ActivateNetworkSchema };
export type { ActivateNetworkInput };

// RBAC exports - must be first
export * from "./rbac";

export * from "./corporates";
export * from "./orgs";
export * from "./schedules";
export * from "./memberships";
export * from "./positions";
export * from "./shifts";
export * from "./venues";
export * from "./zones";
export * from "./attendance";
export * from "./join-tokens";
export * from "./items";
export * from "./batch";
export * from "./compliance/adminResponsibilityForm";
export * from "./networks";
export * from "./onboarding";
export * from "./events";
export * from "./errors";
export * from "./session";
export * from "./internal";
export * from "./links";

// Additional collections and convenience exports added by v14.5
export * as corporates from "./corporates";
export * as messages from "./messages";
export * as receipts from "./receipts";
export * as compliance from "./compliance";
export * as links from "./links";
