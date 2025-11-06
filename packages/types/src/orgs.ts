// [P1][INTEGRITY][SCHEMA] Organization schemas
// Tags: P1, INTEGRITY, SCHEMA, ZOD, ORGANIZATIONS
import { z } from "zod";

/**
 * Organization size categorization
 */
export const OrganizationSize = z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]);
export type OrganizationSize = z.infer<typeof OrganizationSize>;

/**
 * Organization status
 */
export const OrganizationStatus = z.enum(["active", "suspended", "trial", "cancelled"]);
export type OrganizationStatus = z.infer<typeof OrganizationStatus>;

/**
 * Subscription tier
 */
export const SubscriptionTier = z.enum(["free", "starter", "professional", "enterprise"]);
export type SubscriptionTier = z.infer<typeof SubscriptionTier>;

/**
 * Organization settings
 */
export const OrganizationSettingsSchema = z.object({
  timezone: z.string().default("America/New_York"),
  dateFormat: z.string().default("MM/DD/YYYY"),
  timeFormat: z.enum(["12h", "24h"]).default("12h"),
  weekStartsOn: z.number().int().min(0).max(6).default(0), // 0 = Sunday
  allowSelfScheduling: z.boolean().default(false),
  requireShiftConfirmation: z.boolean().default(true),
  enableGeofencing: z.boolean().default(false),
  geofenceRadius: z.number().int().positive().default(100), // meters
});
export type OrganizationSettings = z.infer<typeof OrganizationSettingsSchema>;

/**
 * Full Organization document schema
 * Firestore path: /organizations/{orgId} or /orgs/{orgId}
 */
export const OrganizationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Organization name is required").max(100),
  description: z.string().max(500).optional(),
  industry: z.string().max(100).optional(),
  size: OrganizationSize.optional(),
  status: OrganizationStatus.default("active"),
  subscriptionTier: SubscriptionTier.default("free"),

  // Ownership and membership
  ownerId: z.string().min(1, "Owner ID is required"),
  memberCount: z.number().int().nonnegative().default(1),

  // Settings
  settings: OrganizationSettingsSchema.optional(),

  // Branding
  logoUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),

  // Contact
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),

  // Timestamps
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),

  // Trial/subscription
  trialEndsAt: z.number().int().positive().optional(),
  subscriptionEndsAt: z.number().int().positive().optional(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

/**
 * Schema for creating a new organization
 * Used in POST /api/organizations
 */
export const CreateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(100),
  description: z.string().max(500).optional(),
  industry: z.string().max(100).optional(),
  size: OrganizationSize.optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),
  settings: OrganizationSettingsSchema.optional(),
});
export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;

/**
 * Schema for updating an existing organization
 * Used in PATCH /api/organizations/{id}
 */
export const UpdateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  industry: z.string().max(100).optional(),
  size: OrganizationSize.optional(),
  status: OrganizationStatus.optional(),
  logoUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),
  settings: OrganizationSettingsSchema.optional(),
});
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;

/**
 * Query parameters for listing organizations
 */
export const ListOrganizationsQuerySchema = z.object({
  status: OrganizationStatus.optional(),
  size: OrganizationSize.optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListOrganizationsQuery = z.infer<typeof ListOrganizationsQuerySchema>;
