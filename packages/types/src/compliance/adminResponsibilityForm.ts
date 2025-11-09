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

/**
 * Schema for the certification section of the Admin Responsibility Form.
 * All fields must be `true` for the form to be valid.
 * @property {true} acknowledgesDataProtection - Confirms understanding of data protection responsibilities.
 * @property {true} acknowledgesGDPRCompliance - Confirms understanding of GDPR compliance.
 * @property {true} acknowledgesAccessControl - Confirms understanding of access control policies.
 * @property {true} acknowledgesMFARequirement - Confirms understanding of the MFA requirement.
 * @property {true} acknowledgesAuditTrail - Confirms understanding of the audit trail.
 * @property {true} acknowledgesIncidentReporting - Confirms understanding of incident reporting procedures.
 * @property {true} understandsRoleScope - Confirms understanding of the scope of their administrative role.
 * @property {true} agreesToTerms - Confirms agreement to the terms of service.
 */
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

/**
 * Schema for the Admin Responsibility Form.
 * @property {string} formId - The unique identifier for the form.
 * @property {string} networkId - The ID of the network this form is associated with.
 * @property {string} uid - The user ID of the administrator.
 * @property {AdminResponsibilityRole} role - The administrative role.
 * @property {AdminResponsibilityStatus} [status=submitted] - The status of the form.
 * @property {CertificationSchema} certification - The certification section of the form.
 * @property {any} createdAt - The timestamp of when the form was created.
 * @property {any} [updatedAt] - The timestamp of when the form was last updated.
 * @property {Record<string, any>} [data] - A flexible data blob for additional information.
 */
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
  data: z.record(z.any()).optional(),
});
export type AdminResponsibilityForm = z.infer<typeof AdminResponsibilityFormSchema>;

/**
 * Schema for creating a new Admin Responsibility Form.
 * @property {string} networkId - The ID of the network.
 * @property {string} uid - The user ID of the administrator.
 * @property {AdminResponsibilityRole} role - The administrative role.
 * @property {CertificationSchema} certification - The certification section of the form.
 * @property {Record<string, any>} [data] - A flexible data blob for additional information.
 */
export const CreateAdminResponsibilityFormSchema = AdminResponsibilityFormSchema.pick({
  networkId: true,
  uid: true,
  role: true,
  certification: true,
  data: true,
});
export type CreateAdminResponsibilityFormInput = z.infer<
  typeof CreateAdminResponsibilityFormSchema
>;

export default AdminResponsibilityFormSchema;
