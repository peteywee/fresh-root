// [P0][APP][CODE] Index - Central export for all type definitions and schemas
// Tags: P0, APP, CODE, TYPES, VALIDATION
import { z } from "zod";

export const Role = z.enum(["admin", "manager", "staff"]);
export type Role = z.infer<typeof Role>;

// RBAC and membership types
export * from "./rbac";
export * from "./memberships";

// Organization types
export * from "./orgs";

// Position types
export * from "./positions";

// Schedule and shift types
export * from "./schedules";
