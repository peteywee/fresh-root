// [P1][TYPES][SCHEMAS] Fresh-schedules types shim
// Tags: P1, TYPES, SCHEMAS

/**
 * Type shim for @fresh-schedules/types module
 * Declares all exported types from the workspace types package
 */

declare module "@fresh-schedules/types" {
  import { z } from "zod";

  // Role enum
  export const Role: z.ZodEnum<["admin", "manager", "staff"]>;
  export type Role = "admin" | "manager" | "staff";

  // ============================================================================
  // ATTENDANCE TYPES
  // ============================================================================
  export const AttendanceStatus: z.ZodEnum<["scheduled", "checked_in", "checked_out", "no_show", "excused_absence", "late"]>;
  export type AttendanceStatus = z.infer<typeof AttendanceStatus>;

  export const CheckMethod: z.ZodEnum<["manual", "qr_code", "nfc", "geofence", "admin_override"]>;
  export type CheckMethod = z.infer<typeof CheckMethod>;

  export const LocationSchema: z.ZodObject<any>;
  export type Location = z.infer<typeof LocationSchema>;

  export const AttendanceRecordSchema: z.ZodObject<any>;
  export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;

  export const CreateAttendanceRecordSchema: z.ZodObject<any>;
  export type CreateAttendanceRecordInput = z.infer<typeof CreateAttendanceRecordSchema>;

  export const CheckInSchema: z.ZodObject<any>;
  export type CheckInInput = z.infer<typeof CheckInSchema>;

  export const CheckOutSchema: z.ZodObject<any>;
  export type CheckOutInput = z.infer<typeof CheckOutSchema>;

  export const UpdateAttendanceRecordSchema: z.ZodObject<any>;
  export type UpdateAttendanceRecordInput = z.infer<typeof UpdateAttendanceRecordSchema>;

  export const ListAttendanceRecordsQuerySchema: z.ZodObject<any>;
  export type ListAttendanceRecordsQuery = z.infer<typeof ListAttendanceRecordsQuerySchema>;

  // ============================================================================
  // JOIN TOKENS TYPES
  // ============================================================================
  export const JoinTokenStatus: z.ZodEnum<["active", "used", "expired", "disabled"]>;
  export type JoinTokenStatus = z.infer<typeof JoinTokenStatus>;

  export const JoinTokenSchema: z.ZodObject<any>;
  export type JoinToken = z.infer<typeof JoinTokenSchema>;

  export const CreateJoinTokenSchema: z.ZodObject<any>;
  export type CreateJoinTokenInput = z.infer<typeof CreateJoinTokenSchema>;

  export const UpdateJoinTokenSchema: z.ZodObject<any>;
  export type UpdateJoinTokenInput = z.infer<typeof UpdateJoinTokenSchema>;

  // ============================================================================
  // ORGANIZATIONS TYPES
  // ============================================================================
  export const OrganizationStatusEnum: z.ZodEnum<["active", "inactive", "archived"]>;
  export type OrganizationStatus = z.infer<typeof OrganizationStatusEnum>;

  export const OrganizationSchema: z.ZodObject<any>;
  export type Organization = z.infer<typeof OrganizationSchema>;

  export const CreateOrganizationSchema: z.ZodObject<any>;
  export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;

  export const UpdateOrganizationSchema: z.ZodObject<any>;
  export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;

  // ============================================================================
  // MEMBERSHIPS TYPES
  // ============================================================================
  export const MembershipSchema: z.ZodObject<any>;
  export type Membership = z.infer<typeof MembershipSchema>;

  export const CreateMembershipSchema: z.ZodObject<any>;
  export type CreateMembershipInput = z.infer<typeof CreateMembershipSchema>;

  export const UpdateMembershipSchema: z.ZodObject<any>;
  export type UpdateMembershipInput = z.infer<typeof UpdateMembershipSchema>;

  export const MembershipUpdateSchema: z.ZodObject<any>;
  export type MembershipUpdateInput = z.infer<typeof MembershipUpdateSchema>;

  // ============================================================================
  // POSITIONS TYPES
  // ============================================================================
  export const PositionSchema: z.ZodObject<any>;
  export type Position = z.infer<typeof PositionSchema>;

  export const CreatePositionSchema: z.ZodObject<any>;
  export type CreatePositionInput = z.infer<typeof CreatePositionSchema>;

  export const PositionUpdateSchema: z.ZodObject<any>;
  export type PositionUpdateInput = z.infer<typeof PositionUpdateSchema>;

  // ============================================================================
  // SCHEDULES TYPES
  // ============================================================================
  export const ScheduleRecurrenceType: z.ZodEnum<["once", "daily", "weekly", "biweekly", "monthly", "custom"]>;
  export type ScheduleRecurrenceType = z.infer<typeof ScheduleRecurrenceType>;

  export const ScheduleSchema: z.ZodObject<any>;
  export type Schedule = z.infer<typeof ScheduleSchema>;

  export const CreateScheduleSchema: z.ZodObject<any>;
  export type CreateScheduleInput = z.infer<typeof CreateScheduleSchema>;

  export const UpdateScheduleSchema: z.ZodObject<any>;
  export type UpdateScheduleInput = z.infer<typeof UpdateScheduleSchema>;

  // ============================================================================
  // SHIFTS TYPES
  // ============================================================================
  export const ShiftSchema: z.ZodObject<any>;
  export type Shift = z.infer<typeof ShiftSchema>;

  export const CreateShiftSchema: z.ZodObject<any>;
  export type CreateShiftInput = z.infer<typeof CreateShiftSchema>;

  export const UpdateShiftSchema: z.ZodObject<any>;
  export type UpdateShiftInput = z.infer<typeof UpdateShiftSchema>;

  // ============================================================================
  // VENUES TYPES
  // ============================================================================
  export const VenueSchema: z.ZodObject<any>;
  export type Venue = z.infer<typeof VenueSchema>;

  export const CreateVenueSchema: z.ZodObject<any>;
  export type CreateVenueInput = z.infer<typeof CreateVenueSchema>;

  export const UpdateVenueSchema: z.ZodObject<any>;
  export type UpdateVenueInput = z.infer<typeof UpdateVenueSchema>;

  // ============================================================================
  // ZONES TYPES
  // ============================================================================
  export const ZoneSchema: z.ZodObject<any>;
  export type Zone = z.infer<typeof ZoneSchema>;

  export const CreateZoneSchema: z.ZodObject<any>;
  export type CreateZoneInput = z.infer<typeof CreateZoneSchema>;

  export const UpdateZoneSchema: z.ZodObject<any>;
  export type UpdateZoneInput = z.infer<typeof UpdateZoneSchema>;

  // ============================================================================
  // NETWORKS TYPES
  // ============================================================================
  export const NetworkSchema: z.ZodObject<any>;
  export type Network = z.infer<typeof NetworkSchema>;

  export const CreateNetworkSchema: z.ZodObject<any>;
  export type CreateNetworkInput = z.infer<typeof CreateNetworkSchema>;

  export const UpdateNetworkSchema: z.ZodObject<any>;
  export type UpdateNetworkInput = z.infer<typeof UpdateNetworkSchema>;

  // ============================================================================
  // CORPORATES TYPES
  // ============================================================================
  export const CorporateSchema: z.ZodObject<any>;
  export type Corporate = z.infer<typeof CorporateSchema>;

  export const CreateCorporateSchema: z.ZodObject<any>;
  export type CreateCorporateInput = z.infer<typeof CreateCorporateSchema>;

  export const UpdateCorporateSchema: z.ZodObject<any>;
  export type UpdateCorporateInput = z.infer<typeof UpdateCorporateSchema>;

  // ============================================================================
  // COMPLIANCE FORMS TYPES
  // ============================================================================
  export const AdminResponsibilityRole: z.ZodEnum<any>;
  export type AdminResponsibilityRole = string;

  export const AdminResponsibilityStatus: z.ZodEnum<any>;
  export type AdminResponsibilityStatus = string;

  export const CertificationSchema: z.ZodObject<any>;
  export type Certification = z.infer<typeof CertificationSchema>;

  export const AdminResponsibilityFormSchema: z.ZodObject<any>;
  export type AdminResponsibilityForm = z.infer<typeof AdminResponsibilityFormSchema>;

  export const CreateAdminResponsibilityFormSchema: z.ZodObject<any>;
  export type CreateAdminResponsibilityFormInput = z.infer<typeof CreateAdminResponsibilityFormSchema>;

  export const UpdateAdminResponsibilityFormSchema: z.ZodObject<any>;
  export type UpdateAdminResponsibilityFormInput = z.infer<typeof UpdateAdminResponsibilityFormSchema>;

  // ============================================================================
  // ONBOARDING TYPES
  // ============================================================================
  export const CreateCorporateOnboardingSchema: z.ZodObject<any>;
  export type CreateCorporateOnboarding = z.infer<typeof CreateCorporateOnboardingSchema>;

  export const JoinWithTokenSchema: z.ZodObject<any>;
  export type JoinWithToken = z.infer<typeof JoinWithTokenSchema>;

  export const CreateOrgOnboardingSchema: z.ZodObject<any>;
  export type CreateOrgOnboarding = z.infer<typeof CreateOrgOnboardingSchema>;

  export const CreateNetworkOrgPayload: z.ZodObject<any>;
  export type CreateNetworkOrgPayload = z.infer<typeof CreateNetworkOrgPayload>;

  export const OnboardingIntent: z.ZodEnum<["create_org", "create_corporate", "join_existing"]>;
  export type OnboardingIntent = z.infer<typeof OnboardingIntent>;

  export const OnboardingStatus: z.ZodEnum<["not_started", "in_progress", "complete"]>;
  export type OnboardingStatus = z.infer<typeof OnboardingStatus>;

  export const OnboardingStateSchema: z.ZodObject<any>;
  export type OnboardingState = z.infer<typeof OnboardingStateSchema>;

  // ============================================================================
  // EVENTS TYPES
  // ============================================================================
  export const NewEventSchema: z.ZodObject<any>;
  export type NewEvent = z.infer<typeof NewEventSchema>;

  // ============================================================================
  // RBAC TYPES
  // ============================================================================
  export const RBAC_RULES: Record<string, any>;
}
