// [P1][TYPES][SCHEMAS] Fresh-schedules types shim
// Tags: P1, TYPES, SCHEMAS

/**
 * Type shim for @fresh-schedules/types module
 * Declares all exported types from the workspace types package
 */

declare module "@fresh-schedules/types" {
  import { z } from "zod";
  // Helper alias for broad, unconstrained object shapes without using `any`
  type ZAnyObj = z.ZodObject<{ [k: string]: z.ZodTypeAny }>;

  // Role enum
  export const Role: z.ZodEnum<["admin", "manager", "staff"]>;
  export type Role = "admin" | "manager" | "staff";

  // ============================================================================
  // ATTENDANCE TYPES
  // ============================================================================
  export const AttendanceStatus: z.ZodEnum<
    ["scheduled", "checked_in", "checked_out", "no_show", "excused_absence", "late"]
  >;
  export type AttendanceStatus = z.infer<typeof AttendanceStatus>;

  export const CheckMethod: z.ZodEnum<["manual", "qr_code", "nfc", "geofence", "admin_override"]>;
  export type CheckMethod = z.infer<typeof CheckMethod>;

  export const LocationSchema: ZAnyObj;
  export type Location = z.infer<typeof LocationSchema>;

  export const AttendanceRecordSchema: ZAnyObj;
  export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;

  export const CreateAttendanceRecordSchema: ZAnyObj;
  export type CreateAttendanceRecordInput = z.infer<typeof CreateAttendanceRecordSchema>;

  export const CheckInSchema: ZAnyObj;
  export type CheckInInput = z.infer<typeof CheckInSchema>;

  export const CheckOutSchema: ZAnyObj;
  export type CheckOutInput = z.infer<typeof CheckOutSchema>;

  export const UpdateAttendanceRecordSchema: ZAnyObj;
  export type UpdateAttendanceRecordInput = z.infer<typeof UpdateAttendanceRecordSchema>;

  export const ListAttendanceRecordsQuerySchema: ZAnyObj;
  export type ListAttendanceRecordsQuery = z.infer<typeof ListAttendanceRecordsQuerySchema>;

  // ============================================================================
  // JOIN TOKENS TYPES
  // ============================================================================
  export const JoinTokenStatus: z.ZodEnum<["active", "used", "expired", "disabled"]>;
  export type JoinTokenStatus = z.infer<typeof JoinTokenStatus>;

  export const JoinTokenSchema: ZAnyObj;
  export type JoinToken = z.infer<typeof JoinTokenSchema>;

  export const CreateJoinTokenSchema: ZAnyObj;
  export type CreateJoinTokenInput = z.infer<typeof CreateJoinTokenSchema>;

  export const UpdateJoinTokenSchema: ZAnyObj;
  export type UpdateJoinTokenInput = z.infer<typeof UpdateJoinTokenSchema>;

  // ============================================================================
  // ORGANIZATIONS TYPES
  // ============================================================================
  export const OrganizationStatusEnum: z.ZodEnum<["active", "inactive", "archived"]>;
  export type OrganizationStatus = z.infer<typeof OrganizationStatusEnum>;

  export const OrganizationSchema: ZAnyObj;
  export type Organization = z.infer<typeof OrganizationSchema>;

  export const CreateOrganizationSchema: ZAnyObj;
  export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;

  export const UpdateOrganizationSchema: ZAnyObj;
  export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;

  // ============================================================================
  // MEMBERSHIPS TYPES
  // ============================================================================
  export const MembershipSchema: ZAnyObj;
  export type Membership = z.infer<typeof MembershipSchema>;

  export const CreateMembershipSchema: ZAnyObj;
  export type CreateMembershipInput = z.infer<typeof CreateMembershipSchema>;

  export const UpdateMembershipSchema: ZAnyObj;
  export type UpdateMembershipInput = z.infer<typeof UpdateMembershipSchema>;

  export const MembershipUpdateSchema: ZAnyObj;
  export type MembershipUpdateInput = z.infer<typeof MembershipUpdateSchema>;

  // ============================================================================
  // POSITIONS TYPES
  // ============================================================================
  export const PositionSchema: ZAnyObj;
  export type Position = z.infer<typeof PositionSchema>;

  export const CreatePositionSchema: ZAnyObj;
  export type CreatePositionInput = z.infer<typeof CreatePositionSchema>;

  export const PositionUpdateSchema: ZAnyObj;
  export type PositionUpdateInput = z.infer<typeof PositionUpdateSchema>;

  // ============================================================================
  // SCHEDULES TYPES
  // ============================================================================
  export const ScheduleRecurrenceType: z.ZodEnum<
    ["once", "daily", "weekly", "biweekly", "monthly", "custom"]
  >;
  export type ScheduleRecurrenceType = z.infer<typeof ScheduleRecurrenceType>;

  export const ScheduleSchema: ZAnyObj;
  export type Schedule = z.infer<typeof ScheduleSchema>;

  export const CreateScheduleSchema: ZAnyObj;
  export type CreateScheduleInput = z.infer<typeof CreateScheduleSchema>;

  export const UpdateScheduleSchema: ZAnyObj;
  export type UpdateScheduleInput = z.infer<typeof UpdateScheduleSchema>;

  // ============================================================================
  // SHIFTS TYPES
  // ============================================================================
  export const ShiftSchema: ZAnyObj;
  export type Shift = z.infer<typeof ShiftSchema>;

  export const CreateShiftSchema: ZAnyObj;
  export type CreateShiftInput = z.infer<typeof CreateShiftSchema>;

  export const UpdateShiftSchema: ZAnyObj;
  export type UpdateShiftInput = z.infer<typeof UpdateShiftSchema>;

  // ============================================================================
  // VENUES TYPES
  // ============================================================================
  export const VenueSchema: ZAnyObj;
  export type Venue = z.infer<typeof VenueSchema>;

  export const CreateVenueSchema: ZAnyObj;
  export type CreateVenueInput = z.infer<typeof CreateVenueSchema>;

  export const UpdateVenueSchema: ZAnyObj;
  export type UpdateVenueInput = z.infer<typeof UpdateVenueSchema>;

  // ============================================================================
  // ZONES TYPES
  // ============================================================================
  export const ZoneSchema: ZAnyObj;
  export type Zone = z.infer<typeof ZoneSchema>;

  export const CreateZoneSchema: ZAnyObj;
  export type CreateZoneInput = z.infer<typeof CreateZoneSchema>;

  export const UpdateZoneSchema: ZAnyObj;
  export type UpdateZoneInput = z.infer<typeof UpdateZoneSchema>;

  // ============================================================================
  // NETWORKS TYPES
  // ============================================================================
  export const NetworkSchema: ZAnyObj;
  export type Network = z.infer<typeof NetworkSchema>;

  export const CreateNetworkSchema: ZAnyObj;
  export type CreateNetworkInput = z.infer<typeof CreateNetworkSchema>;

  export const UpdateNetworkSchema: ZAnyObj;
  export type UpdateNetworkInput = z.infer<typeof UpdateNetworkSchema>;

  // ============================================================================
  // CORPORATES TYPES
  // ============================================================================
  export const CorporateSchema: ZAnyObj;
  export type Corporate = z.infer<typeof CorporateSchema>;

  export const CreateCorporateSchema: ZAnyObj;
  export type CreateCorporateInput = z.infer<typeof CreateCorporateSchema>;

  export const UpdateCorporateSchema: ZAnyObj;
  export type UpdateCorporateInput = z.infer<typeof UpdateCorporateSchema>;

  // ============================================================================
  // COMPLIANCE FORMS TYPES
  // ============================================================================
  // Using ZodString placeholder until enumerated values are finalized in types package
  export const AdminResponsibilityRole: z.ZodString;
  export type AdminResponsibilityRole = string;

  export const AdminResponsibilityStatus: z.ZodString;
  export type AdminResponsibilityStatus = string;

  export const CertificationSchema: ZAnyObj;
  export type Certification = z.infer<typeof CertificationSchema>;

  export const AdminResponsibilityFormSchema: ZAnyObj;
  export type AdminResponsibilityForm = z.infer<typeof AdminResponsibilityFormSchema>;

  export const CreateAdminResponsibilityFormSchema: ZAnyObj;
  export type CreateAdminResponsibilityFormInput = z.infer<
    typeof CreateAdminResponsibilityFormSchema
  >;

  export const UpdateAdminResponsibilityFormSchema: ZAnyObj;
  export type UpdateAdminResponsibilityFormInput = z.infer<
    typeof UpdateAdminResponsibilityFormSchema
  >;

  // ============================================================================
  // ONBOARDING TYPES
  // ============================================================================
  export const CreateCorporateOnboardingSchema: ZAnyObj;
  export type CreateCorporateOnboarding = z.infer<typeof CreateCorporateOnboardingSchema>;

  export const CreateCorporateNetworkSchema: ZAnyObj;
  export type CreateCorporateNetworkInput = z.infer<typeof CreateCorporateNetworkSchema>;

  export const JoinWithTokenSchema: ZAnyObj;
  export type JoinWithToken = z.infer<typeof JoinWithTokenSchema>;

  export const OnboardingJoinWithTokenSchema: ZAnyObj;
  export type OnboardingJoinWithTokenInput = z.infer<typeof OnboardingJoinWithTokenSchema>;

  export const OnboardingProfileSchema: ZAnyObj;
  export type OnboardingProfileInput = z.infer<typeof OnboardingProfileSchema>;

  export const CreateOrgOnboardingSchema: ZAnyObj;
  export type CreateOrgOnboarding = z.infer<typeof CreateOrgOnboardingSchema>;

  export const CreateNetworkOrgPayloadSchema: z.ZodObject<{
    basics: z.ZodObject<{
      orgName: z.ZodString;
      hasCorporateAboveYou: z.ZodBoolean;
      segment: z.ZodOptional<z.ZodString>;
    }>;
    venue: z.ZodOptional<
      z.ZodObject<{
        venueName: z.ZodString;
        timeZone: z.ZodString;
      }>
    >;
    formToken: z.ZodString;
  }>;
  export type CreateNetworkOrgPayload = z.infer<typeof CreateNetworkOrgPayloadSchema>;

  export const OnboardingIntent: z.ZodEnum<["create_org", "create_corporate", "join_existing"]>;
  export type OnboardingIntent = z.infer<typeof OnboardingIntent>;

  export const OnboardingStatus: z.ZodEnum<["not_started", "in_progress", "complete"]>;
  export type OnboardingStatus = z.infer<typeof OnboardingStatus>;

  export const OnboardingStateSchema: ZAnyObj;
  export type OnboardingState = z.infer<typeof OnboardingStateSchema>;

  // ============================================================================
  // ITEMS TYPES
  // ============================================================================
  export const CreateItemSchema: ZAnyObj;
  export type CreateItemInput = z.infer<typeof CreateItemSchema>;

  export const UpdateItemSchema: ZAnyObj;
  export type UpdateItemInput = z.infer<typeof UpdateItemSchema>;

  // ============================================================================
  // MEMBERSHIPS TYPES (Extended)
  // ============================================================================
  export const UpdateMemberApiSchema: ZAnyObj;
  export type UpdateMemberApiInput = z.infer<typeof UpdateMemberApiSchema>;

  // ============================================================================
  // EVENTS TYPES
  // ============================================================================
  export const NewEventSchema: ZAnyObj;
  export type NewEvent = z.infer<typeof NewEventSchema>;

  // ============================================================================
  // RBAC TYPES
  // ============================================================================
  export const RBAC_RULES: Record<string, unknown>;
}
