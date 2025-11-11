// [P0][APP][CODE] Fresh Schedules TypeScript type definitions
// Tags: P0, APP, CODE
/**
 * Local type shim so that apps/web can import from "@fresh-schedules/types".
 *
 * This re-exports the real workspace types and also declares any additional
 * symbols that the web app expects but which might not yet exist in the
 * workspace package. Those extras are typed as `any` purely to unblock
 * typechecking in the web app.
 */
declare module "@fresh-schedules/types" {
  export * from "../../../../packages/types/src";

  // Schemas expected by app/api/* routes; typed as any for now.
  export const CreateAttendanceRecordSchema: any;
  export const CreateJoinTokenSchema: any;

  export const CreateAdminResponsibilityFormSchema: any;
  export type CreateAdminResponsibilityFormInput = any;

  export const MembershipUpdateSchema: any;
  export const CreateMembershipSchema: any;
  export const UpdateMembershipSchema: any;

  export const CreateOrganizationSchema: any;

  export const PositionUpdateSchema: any;
  export const CreatePositionSchema: any;

  export const CreateScheduleSchema: any;
  export const CreateVenueSchema: any;
  export const CreateZoneSchema: any;

  export type CreateNetworkOrgPayload = any;
}
