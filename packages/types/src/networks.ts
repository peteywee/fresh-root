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
