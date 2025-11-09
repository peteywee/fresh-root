// [P1][TENANCY][SCHEMA] Network schema (single canonical export)
import { z } from "zod";

export const NetworkKind = z.enum([
  "independent_org",
  "corporate_network",
  "franchise_network",
  "nonprofit_network",
  "test_sandbox",
]);
export type NetworkKind = z.infer<typeof NetworkKind>;

export const NetworkSegment = z.enum([
  "restaurant",
  "qsr",
  "bar",
  "hotel",
  "nonprofit",
  "shelter",
  "church",
  "retail",
  "other",
]);
export type NetworkSegment = z.infer<typeof NetworkSegment>;

export const NetworkStatus = z.enum(["pending_verification", "active", "suspended", "closed"]);
export type NetworkStatus = z.infer<typeof NetworkStatus>;

export const NetworkPlan = z.enum(["free", "starter", "growth", "enterprise", "internal"]);
export type NetworkPlan = z.infer<typeof NetworkPlan>;

export const BillingMode = z.enum(["none", "card", "invoice", "partner_billed"]);
export type BillingMode = z.infer<typeof BillingMode>;

/**
 * Schema for a network, which represents a top-level tenancy construct.
 * @property {string} id - The unique identifier for the network.
 * @property {string} slug - A URL-friendly slug for the network.
 * @property {string} displayName - The display name of the network.
 * @property {string} [legalName] - The legal name of the network entity.
 * @property {NetworkKind} kind - The kind of network.
 * @property {NetworkSegment} segment - The industry segment of the network.
 * @property {NetworkStatus} status - The current status of the network.
 * @property {('production' | 'staging' | 'sandbox' | 'demo')} [environment] - The deployment environment of the network.
 * @property {string} [primaryRegion] - The primary geographical region of the network.
 * @property {string} [timeZone] - The primary timezone of the network.
 * @property {string} [currency] - The default currency for the network.
 * @property {NetworkPlan} [plan] - The subscription plan of the network.
 * @property {BillingMode} [billingMode] - The billing mode for the network.
 * @property {number} [maxVenues] - The maximum number of venues allowed.
 * @property {number} [maxActiveOrgs] - The maximum number of active organizations allowed.
 * @property {number} [maxActiveUsers] - The maximum number of active users allowed.
 * @property {number} [maxShiftsPerDay] - The maximum number of shifts that can be created per day.
 * @property {boolean} [requireMfaForAdmins] - Whether MFA is required for administrators.
 * @property {boolean} [ipAllowlistEnabled] - Whether IP allowlisting is enabled.
 * @property {string[]} [allowedEmailDomains] - A list of allowed email domains for new users.
 * @property {object} [features] - A set of feature flags.
 * @property {boolean} [features.analytics] - Whether analytics are enabled.
 * @property {boolean} [features.apiAccess] - Whether API access is enabled.
 * @property {string} [ownerUserId] - The user ID of the network owner.
 * @property {any} [createdAt] - The timestamp of when the network was created.
 * @property {string} [createdBy] - The user ID of the creator.
 * @property {any} [updatedAt] - The timestamp of the last update.
 * @property {string} [updatedBy] - The user ID of the last user who updated it.
 */
export const NetworkSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  displayName: z.string().min(1),
  legalName: z.string().optional(),
  kind: NetworkKind,
  segment: NetworkSegment,
  status: NetworkStatus,
  environment: z.enum(["production", "staging", "sandbox", "demo"]).optional(),
  primaryRegion: z.string().optional(),
  timeZone: z.string().optional(),
  currency: z.string().optional(),
  plan: NetworkPlan.optional(),
  billingMode: BillingMode.optional(),
  maxVenues: z.number().int().nullable().optional(),
  maxActiveOrgs: z.number().int().nullable().optional(),
  maxActiveUsers: z.number().int().nullable().optional(),
  maxShiftsPerDay: z.number().int().nullable().optional(),
  requireMfaForAdmins: z.boolean().optional(),
  ipAllowlistEnabled: z.boolean().optional(),
  allowedEmailDomains: z.array(z.string()).optional(),
  features: z
    .object({
      analytics: z.boolean().optional(),
      apiAccess: z.boolean().optional(),
    })
    .optional(),
  ownerUserId: z.string().optional(),
  createdAt: z.any().optional(),
  createdBy: z.string().optional(),
  updatedAt: z.any().optional(),
  updatedBy: z.string().optional(),
});

/**
 * Schema for creating a new network.
 * @property {string} slug - The URL-friendly slug.
 * @property {string} displayName - The display name of the network.
 * @property {NetworkKind} kind - The kind of network.
 * @property {NetworkSegment} segment - The industry segment of the network.
 */
export const CreateNetworkSchema = NetworkSchema.pick({
  slug: true,
  displayName: true,
  kind: true,
  segment: true,
});

export const UpdateNetworkSchema = NetworkSchema.partial();

export type Network = z.infer<typeof NetworkSchema>;
export type CreateNetworkInput = z.infer<typeof CreateNetworkSchema>;
export type UpdateNetworkInput = z.infer<typeof UpdateNetworkSchema>;

export default NetworkSchema;
