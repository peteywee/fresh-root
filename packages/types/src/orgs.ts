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
 * @property {string} [timezone=America/New_York] - The timezone of the organization.
 * @property {string} [dateFormat=MM/DD/YYYY] - The preferred date format.
 * @property {('12h' | '24h')} [timeFormat=12h] - The preferred time format.
 * @property {number} [weekStartsOn=0] - The day the week starts on (0 for Sunday).
 * @property {boolean} [allowSelfScheduling=false] - Whether staff can schedule themselves for shifts.
 * @property {boolean} [requireShiftConfirmation=true] - Whether shifts require confirmation.
 * @property {boolean} [enableGeofencing=false] - Whether geofencing is enabled for clocking in/out.
 * @property {number} [geofenceRadius=100] - The geofence radius in meters.
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
 * @property {string} id - The unique identifier for the organization.
 * @property {string} [networkId] - The ID of the network this organization belongs to (for v14 tenancy model).
 * @property {string} name - The name of the organization.
 * @property {string} [description] - A brief description of the organization.
 * @property {string} [industry] - The industry the organization operates in.
 * @property {OrganizationSize} [size] - The size of the organization.
 * @property {OrganizationStatus} [status] - The current status of the organization.
 * @property {SubscriptionTier} [subscriptionTier] - The subscription tier of the organization.
 * @property {string} ownerId - The user ID of the organization's owner.
 * @property {number} memberCount - The number of members in the organization.
 * @property {OrganizationSettings} [settings] - The settings for the organization.
 * @property {string} [logoUrl] - URL for the organization's logo.
 * @property {string} [websiteUrl] - URL for the organization's website.
 * @property {string} [contactEmail] - The primary contact email for the organization.
 * @property {string} [contactPhone] - The primary contact phone number for the organization.
 * @property {(number | string)} createdAt - The timestamp or ISO datetime string of when the organization was created.
 * @property {(number | string)} updatedAt - The timestamp or ISO datetime string of when the organization was last updated.
 * @property {(number | string)} [trialEndsAt] - The timestamp or ISO datetime string of when the trial period ends.
 * @property {(number | string)} [subscriptionEndsAt] - The timestamp or ISO datetime string of when the subscription ends.
 */
export const OrganizationSchema = z.object({
  id: z.string().min(1),
  // Optional network scoping for v14 tenancy model
  networkId: z.string().min(1).optional(),
  name: z.string().min(1, "Organization name is required").max(100),
  description: z.string().max(500).optional(),
  industry: z.string().max(100).optional(),
  size: OrganizationSize.optional(),
  status: OrganizationStatus.optional(),
  subscriptionTier: SubscriptionTier.optional(),

  // Ownership and membership
  ownerId: z.string().min(1, "Owner ID is required"),
  memberCount: z.number().int().nonnegative(),

  // Settings
  settings: OrganizationSettingsSchema.optional(),

  // Branding
  logoUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),

  // Contact
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),

  // Timestamps (accept ISO datetime string or Unix ms number)
  createdAt: z.union([z.number().int().positive(), z.string().datetime()]),
  updatedAt: z.union([z.number().int().positive(), z.string().datetime()]),

  // Trial/subscription (accept ISO datetime string or Unix ms number)
  trialEndsAt: z.union([z.number().int().positive(), z.string().datetime()]).optional(),
  subscriptionEndsAt: z.union([z.number().int().positive(), z.string().datetime()]).optional(),
});
export type OrganizationType = z.infer<typeof OrganizationSchema>;

/**
 * Schema for creating a new organization
 * Used in POST /api/organizations
 * @property {string} [networkId] - The ID of the network this organization belongs to.
 * @property {string} name - The name of the organization.
 * @property {string} [description] - A brief description of the organization.
 * @property {string} [industry] - The industry the organization operates in.
 * @property {OrganizationSize} [size] - The size of the organization.
 * @property {string} [contactEmail] - The primary contact email for the organization.
 * @property {string} [contactPhone] - The primary contact phone number for the organization.
 * @property {OrganizationSettings} [settings] - The settings for the organization.
 */
export const CreateOrganizationSchema = z.object({
  networkId: z.string().min(1).optional(),
  name: z.string().min(1, "Organization name is required").max(100),
  description: z.string().max(500).optional(),
  industry: z.string().max(100).optional(),
  size: OrganizationSize.optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),
  settings: OrganizationSettingsSchema.optional(),
});
export type CreateOrganizationInputType = z.infer<typeof CreateOrganizationSchema>;
export const CreateOrganizationInput = CreateOrganizationSchema;
export const OrganizationCreateSchema = CreateOrganizationInput;

/**
 * Schema for updating an existing organization
 * Used in PATCH /api/organizations/{id}
 * @property {string} [networkId] - The ID of the network this organization belongs to.
 * @property {string} [name] - The name of the organization.
 * @property {string} [description] - A brief description of the organization.
 * @property {string} [industry] - The industry the organization operates in.
 * @property {OrganizationSize} [size] - The size of the organization.
 * @property {OrganizationStatus} [status] - The current status of the organization.
 * @property {string} [logoUrl] - URL for the organization's logo.
 * @property {string} [websiteUrl] - URL for the organization's website.
 * @property {string} [contactEmail] - The primary contact email for the organization.
 * @property {string} [contactPhone] - The primary contact phone number for the organization.
 * @property {OrganizationSettings} [settings] - The settings for the organization.
 */
export const UpdateOrganizationSchema = z.object({
  networkId: z.string().min(1).optional(),
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
export type UpdateOrganizationInputType = z.infer<typeof UpdateOrganizationSchema>;
export const UpdateOrganizationInput = UpdateOrganizationSchema;
export const OrganizationUpdateSchema = UpdateOrganizationInput;

/**
 * @deprecated Use `OrganizationSchema` for new code.
 * Aliases for backward/test compatibility (value exports expected by tests)
 * Historically some callers expect `Organization` to allow missing `updatedAt` in
 * minimal records while `OrganizationSchema` (the canonical schema) requires it.
 * Keep both shapes to satisfy existing tests and consumers.
 */
export const Organization = OrganizationSchema.extend({
  updatedAt: z.union([z.number().int().positive(), z.string().datetime()]).optional(),
});

/**
 * Query parameters for listing organizations
 * @property {OrganizationStatus} [status] - Filter by organization status.
 * @property {OrganizationSize} [size] - Filter by organization size.
 * @property {number} [limit=50] - The maximum number of results to return.
 * @property {string} [cursor] - The cursor for pagination.
 */
export const ListOrganizationsQuerySchema = z.object({
  status: OrganizationStatus.optional(),
  size: OrganizationSize.optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListOrganizationsQuery = z.infer<typeof ListOrganizationsQuerySchema>;
