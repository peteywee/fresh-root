//[P1][TYPES][SCHEMA] Admin Responsibility Form Schema (v14.0.0)
// Tags: zod, schema, validation, compliance, admin-responsibility, gap-2

/**
 * Admin Responsibility Form Schema (v14.0.0)
 *
 * Defines the compliance questionnaire for Network Admins and Org Admins
 * to acknowledge responsibilities, certify understanding, and document
 * their role in data governance and access control.
 *
 * Path: networks/{networkId}/adminResponsibilityForms/{formId}
 *
 * Related:
 * - Project Bible v14.0.0 Section 4.3.1 (Admin Responsibility Form)
 * - Section 4.5.6 (MFA Enforcement & Admin Gates - GAP-2)
 * - packages/types/src/networks.ts
 * - packages/types/src/orgs.ts
 *
 * GAP-2 Context:
 * This form is part of the MFA enforcement and admin gate workflow.
 * Admins must complete this form before being granted elevated privileges.
 */

import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

/**
 * Form status enum
 */
export const AdminResponsibilityFormStatus = z.enum([
  "pending", // Form created but not yet submitted
  "submitted", // Form submitted, awaiting review
  "approved", // Form approved, admin has privileges
  "rejected", // Form rejected, admin must revise
  "expired", // Form expired, admin must resubmit
  "revoked", // Form revoked, admin privileges removed
]);
export type AdminResponsibilityFormStatus = z.infer<typeof AdminResponsibilityFormStatus>;

/**
 * Admin role enum (what role is this form for?)
 */
export const AdminRole = z.enum([
  "network_admin", // Network-wide admin
  "network_owner", // Network owner
  "org_admin", // Organization admin
  "venue_manager", // Venue manager (elevated access)
]);
export type AdminRole = z.infer<typeof AdminRole>;

/**
 * Compliance certification answers
 * Each question requires acknowledgment
 */
export const AdminResponsibilityCertificationSchema = z.object({
  // Data Protection & Privacy
  acknowledgesDataProtection: z.boolean().refine((val) => val === true, {
    message: "Must acknowledge data protection responsibilities",
  }),
  acknowledgesGDPRCompliance: z.boolean().refine((val) => val === true, {
    message: "Must acknowledge GDPR compliance requirements",
  }),

  // Access Control
  acknowledgesAccessControl: z.boolean().refine((val) => val === true, {
    message: "Must acknowledge access control responsibilities",
  }),
  acknowledgesMFARequirement: z.boolean().refine((val) => val === true, {
    message: "Must acknowledge MFA requirement for admin access",
  }),

  // Audit & Accountability
  acknowledgesAuditTrail: z.boolean().refine((val) => val === true, {
    message: "Must acknowledge audit trail and accountability",
  }),
  acknowledgesIncidentReporting: z.boolean().refine((val) => val === true, {
    message: "Must acknowledge incident reporting obligations",
  }),

  // Role-Specific
  understandsRoleScope: z.boolean().refine((val) => val === true, {
    message: "Must understand the scope of the admin role",
  }),
  agreesToTerms: z.boolean().refine((val) => val === true, {
    message: "Must agree to terms and conditions",
  }),
});

export type AdminResponsibilityCertification = z.infer<
  typeof AdminResponsibilityCertificationSchema
>;

/**
 * Full Admin Responsibility Form Schema
 * Stored at: networks/{networkId}/adminResponsibilityForms/{formId}
 */
export const AdminResponsibilityFormSchema = z.object({
  // Identity
  formId: z.string().min(1, "Form ID is required"),
  networkId: z.string().min(1, "Network ID is required"),

  // Admin context
  uid: z.string().min(1, "User ID is required"),
  role: AdminRole,
  orgId: z.string().optional().nullable(), // For org_admin or venue_manager
  venueId: z.string().optional().nullable(), // For venue_manager

  // Status & lifecycle
  status: AdminResponsibilityFormStatus.default("pending"),
  submittedAt: z
    .custom<Timestamp>((val) => val instanceof Timestamp, {
      message: "Must be a Firestore Timestamp",
    })
    .optional()
    .nullable(),
  approvedAt: z
    .custom<Timestamp>((val) => val instanceof Timestamp, {
      message: "Must be a Firestore Timestamp",
    })
    .optional()
    .nullable(),
  expiresAt: z
    .custom<Timestamp>((val) => val instanceof Timestamp, {
      message: "Must be a Firestore Timestamp",
    })
    .optional()
    .nullable(), // Forms expire after N months (configurable per network)

  // Certification answers
  certification: AdminResponsibilityCertificationSchema,

  // MFA context (GAP-2)
  mfaEnforcedAt: z
    .custom<Timestamp>((val) => val instanceof Timestamp, {
      message: "Must be a Firestore Timestamp",
    })
    .optional()
    .nullable(), // When MFA was enforced for this user
  mfaVerifiedAt: z
    .custom<Timestamp>((val) => val instanceof Timestamp, {
      message: "Must be a Firestore Timestamp",
    })
    .optional()
    .nullable(), // When MFA was last verified

  // Review & approval context
  reviewedBy: z.string().optional().nullable(), // UID of reviewer
  reviewNotes: z.string().max(2000).optional().nullable(),

  // Audit fields
  createdAt: z.custom<Timestamp>((val) => val instanceof Timestamp, {
    message: "Must be a Firestore Timestamp",
  }),
  updatedAt: z.custom<Timestamp>((val) => val instanceof Timestamp, {
    message: "Must be a Firestore Timestamp",
  }),
});

export type AdminResponsibilityForm = z.infer<typeof AdminResponsibilityFormSchema>;

/**
 * Schema for creating a new Admin Responsibility Form
 * Used in API payloads (POST /api/networks/{networkId}/admin-responsibility-forms)
 */
export const CreateAdminResponsibilityFormSchema = z.object({
  networkId: z.string().min(1, "Network ID is required"),
  uid: z.string().min(1, "User ID is required"),
  role: AdminRole,
  orgId: z.string().optional().nullable(),
  venueId: z.string().optional().nullable(),
});

export type CreateAdminResponsibilityFormInput = z.infer<
  typeof CreateAdminResponsibilityFormSchema
>;

/**
 * Schema for submitting/updating a form with certification
 * Used in API payloads (PATCH /api/networks/{networkId}/admin-responsibility-forms/{formId}/submit)
 */
export const SubmitAdminResponsibilityFormSchema = z.object({
  certification: AdminResponsibilityCertificationSchema,
});

export type SubmitAdminResponsibilityFormInput = z.infer<
  typeof SubmitAdminResponsibilityFormSchema
>;

/**
 * Schema for reviewing/approving a form (admin action)
 * Used in API payloads (PATCH /api/networks/{networkId}/admin-responsibility-forms/{formId}/review)
 */
export const ReviewAdminResponsibilityFormSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reviewNotes: z.string().max(2000).optional().nullable(),
  expiresInDays: z.number().int().positive().max(730).optional(), // Max 2 years
});

export type ReviewAdminResponsibilityFormInput = z.infer<
  typeof ReviewAdminResponsibilityFormSchema
>;

/**
 * Query schema for listing Admin Responsibility Forms
 * Used in API query params (GET /api/networks/{networkId}/admin-responsibility-forms)
 */
export const ListAdminResponsibilityFormsQuerySchema = z.object({
  networkId: z.string().min(1, "Network ID is required"),
  uid: z.string().optional(),
  role: AdminRole.optional(),
  status: AdminResponsibilityFormStatus.optional(),
  orgId: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  startAfter: z.string().optional(), // formId for pagination
});

export type ListAdminResponsibilityFormsQuery = z.infer<
  typeof ListAdminResponsibilityFormsQuerySchema
>;
