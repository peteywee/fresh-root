// [P1][INTEGRITY][SCHEMA] Admin Responsibility Form schema
// Tags: P1, INTEGRITY, SCHEMA, ZOD, COMPLIANCE
import { z } from "zod";

export const AdminResponsibilityRole = z.enum([
  "network_owner",
  "network_admin",
  "org_owner",
  "org_admin",
]);
export type AdminResponsibilityRole = z.infer<typeof AdminResponsibilityRole>;

export const AdminResponsibilityStatus = z.enum([
  "draft",
  "submitted",
  "attached",
  "approved",
  "rejected",
]);
export type AdminResponsibilityStatus = z.infer<typeof AdminResponsibilityStatus>;

export const CertificationSchema = z.object({
  acknowledgesDataProtection: z.literal(true),
  acknowledgesGDPRCompliance: z.literal(true),
  acknowledgesAccessControl: z.literal(true),
  acknowledgesMFARequirement: z.literal(true),
  acknowledgesAuditTrail: z.literal(true),
  acknowledgesIncidentReporting: z.literal(true),
  understandsRoleScope: z.literal(true),
  agreesToTerms: z.literal(true),
});

export const AdminResponsibilityFormSchema = z.object({
  formId: z.string().min(1),
  networkId: z.string().min(1),
  uid: z.string().min(1),
  role: AdminResponsibilityRole,
  status: AdminResponsibilityStatus.optional().default("submitted"),
  certification: CertificationSchema,
  // Allow firebase Timestamp objects or plain numbers/strings; tests pass a Timestamp.
  createdAt: z.any(),
  updatedAt: z.any().optional(),
  // optional free-form data blob (could include taxId, legalName, addresses)
  data: z.record(z.string(), z.any()).optional(),
});
export type AdminResponsibilityForm = z.infer<typeof AdminResponsibilityFormSchema>;

export const CreateAdminResponsibilityFormSchema = AdminResponsibilityFormSchema.pick({
  networkId: true,
  uid: true,
  role: true,
  certification: true,
  data: true,
} as const);
export type CreateAdminResponsibilityFormInput = z.infer<
  typeof CreateAdminResponsibilityFormSchema
>;

export default AdminResponsibilityFormSchema;
