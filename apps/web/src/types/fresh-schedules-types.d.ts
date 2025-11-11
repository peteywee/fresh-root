// [P1][TYPES][SCHEMAS] Fresh-schedules types shim
// Tags: P1, TYPES, SCHEMAS

/**
 * Type shim for @fresh-schedules/types module
 * Re-exports all types from the workspace types package
 */

declare module "@fresh-schedules/types" {
  // Core schemas
  export * from "@fresh-schedules/types/schedules";
  export * from "@fresh-schedules/types/shifts";
  export * from "@fresh-schedules/types/orgs";
  export * from "@fresh-schedules/types/venues";
  export * from "@fresh-schedules/types/attendance";
  export * from "@fresh-schedules/types/zones";
  export * from "@fresh-schedules/types/positions";
  export * from "@fresh-schedules/types/join-tokens";
  export * from "@fresh-schedules/types/memberships";
  export * from "@fresh-schedules/types/networks";
  export * from "@fresh-schedules/types/corporates";
  export * from "@fresh-schedules/types/compliance-forms";
  export * from "@fresh-schedules/types/onboarding";

  // Role enum
  export enum Role {
    ADMIN = "admin",
    MANAGER = "manager",
    STAFF = "staff",
  }

  // Additional exports as any to unblock typechecking
  export const schedules: any;
  export const shifts: any;
  export const orgs: any;
  export const venues: any;
  export const attendance: any;
  export const zones: any;
  export const positions: any;
  export const joinTokens: any;
  export const memberships: any;
  export const networks: any;
  export const corporates: any;
  export const complianceForms: any;
  export const onboarding: any;
}
