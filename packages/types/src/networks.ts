// [P0][APP][CODE] Networks
// Tags: P0, APP, CODE
/**
 * Network Schema - Tenant Root Entity
 *
 * Network is the true tenant boundary in Fresh Schedules.
 * All scheduling data belongs to exactly one Network.
 *
 * @see docs/bible/Project_Bible_v14.0.0.md Section 3.1
 * @see docs/schema-network.md
 */

import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

// ===== ENUMS =====

export const NetworkStatusEnum = z.enum(["pending_verification", "active", "suspended", "closed"]);

export const NetworkKindEnum = z.enum([
  "independent_org",
  "corporate_network",
  "franchise_network",
  "nonprofit_network",
  "test_sandbox",
]);

export const NetworkSegmentEnum = z.enum([
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

export const NetworkPlanEnum = z.enum(["free", "starter", "growth", "enterprise", "internal"]);

export const BillingModeEnum = z.enum(["none", "card", "invoice", "partner_billed"]);

export const EnvironmentEnum = z.enum(["production", "staging", "sandbox", "demo"]);

export const PrimaryRegionEnum = z.enum(["US", "CA", "EU", "LATAM", "APAC", "OTHER"]);

export const DataResidencyEnum = z.enum(["us_only", "eu_only", "global", "unspecified"]);

export const PiiMaskingModeEnum = z.enum(["none", "mask_in_logs", "mask_everywhere"]);

export const WeekStartEnum = z.enum(["monday", "sunday"]);

export const BillingProviderEnum = z.enum(["stripe", "paddle", "manual", "none"]);

// ===== TYPES =====

export type NetworkStatus = z.infer<typeof NetworkStatusEnum>;
export type NetworkKind = z.infer<typeof NetworkKindEnum>;
export type NetworkSegment = z.infer<typeof NetworkSegmentEnum>;
export type NetworkPlan = z.infer<typeof NetworkPlanEnum>;
export type BillingMode = z.infer<typeof BillingModeEnum>;
export type Environment = z.infer<typeof EnvironmentEnum>;
export type PrimaryRegion = z.infer<typeof PrimaryRegionEnum>;
export type DataResidency = z.infer<typeof DataResidencyEnum>;
export type PiiMaskingMode = z.infer<typeof PiiMaskingModeEnum>;
export type WeekStart = z.infer<typeof WeekStartEnum>;
export type BillingProvider = z.infer<typeof BillingProviderEnum>;

// ===== FEATURE FLAGS SCHEMA =====

export const NetworkFeaturesSchema = z.object({
  analytics: z.boolean().default(true),
  forecasting: z.boolean().default(false),
  autoScheduling: z.boolean().default(false),
  attendance: z.boolean().default(true),
  broadcastMessaging: z.boolean().default(false),
  aiAssistant: z.boolean().default(false),
  apiAccess: z.boolean().default(false),
});

export type NetworkFeatures = z.infer<typeof NetworkFeaturesSchema>;

// ===== MAIN NETWORK SCHEMA =====

export const NetworkSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be URL-safe"),
  displayName: z.string().min(1).max(100),
  legalName: z.string().optional(),

  // Classification
  kind: NetworkKindEnum,
  segment: NetworkSegmentEnum,
  status: NetworkStatusEnum,

  // Environment & Region
  environment: EnvironmentEnum,
  primaryRegion: PrimaryRegionEnum,
  timeZone: z.string(), // IANA timezone, e.g., "America/Chicago"
  currency: z.string().length(3), // ISO 4217, e.g., "USD"

  // Billing
  plan: NetworkPlanEnum,
  billingMode: BillingModeEnum,
  billingProvider: BillingProviderEnum.optional(),
  billingCustomerId: z.string().optional(),

  // Limits
  maxVenues: z.number().int().positive().nullable().optional(),
  maxActiveOrgs: z.number().int().positive().nullable().optional(),
  maxActiveUsers: z.number().int().positive().nullable().optional(),
  maxShiftsPerDay: z.number().int().positive().nullable().optional(),

  // Security Posture
  requireMfaForAdmins: z.boolean().default(true),
  ipAllowlistEnabled: z.boolean().default(false),
  ipAllowlist: z.array(z.string()).optional(),
  allowedEmailDomains: z.array(z.string()).optional(),
  dataResidency: DataResidencyEnum.optional(),
  gdprMode: z.boolean().default(false),
  piiMaskingMode: PiiMaskingModeEnum.default("none"),

  // Cross-Network Features
  allowCrossOrgSharing: z.boolean().default(false),
  allowExternalCorpLinks: z.boolean().default(false),

  // Scheduling Defaults
  defaultWeekStartsOn: WeekStartEnum.default("monday"),
  defaultMinShiftLengthHours: z.number().positive().default(2),
  defaultMaxShiftLengthHours: z.number().positive().default(12),
  allowSelfScheduling: z.boolean().default(false),
  allowOvertime: z.boolean().default(true),
  overtimeThresholdHours: z.number().positive().default(40),

  // Labor Defaults
  defaultAverageWage: z.number().positive().optional(),

  // Features
  features: NetworkFeaturesSchema,

  // Ownership
  ownerUserId: z.string().min(1),
  ownerCorporateId: z.string().optional(),
  tags: z.array(z.string()).optional(),

  // Lifecycle Timestamps
  createdAt: z.custom<Timestamp>(),
  createdBy: z.string(),
  updatedAt: z.custom<Timestamp>(),
  updatedBy: z.string(),
  trialEndsAt: z.custom<Timestamp>().optional(),
  billingStartsAt: z.custom<Timestamp>().optional(),
  activatedAt: z.custom<Timestamp>().optional(),
  activatedBy: z.string().optional(),

  // Activation Tracking (GAP-2)
  activationBlockedBy: z.array(z.string()).optional(),
  nextRetryAt: z.custom<Timestamp>().optional(),

  // Suspension Tracking
  suspensionReason: z.string().optional(),
  suspendedAt: z.custom<Timestamp>().optional(),
  suspendedBy: z.string().optional(),
  mfaLostAt: z.custom<Timestamp>().optional(),
});

export type Network = z.infer<typeof NetworkSchema>;

// ===== CREATE NETWORK SCHEMA =====

export const CreateNetworkSchema = z.object({
  displayName: z.string().min(3).max(100),
  legalName: z.string().optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(), // Auto-generated if not provided

  // Required at creation
  kind: NetworkKindEnum,
  segment: NetworkSegmentEnum,
  environment: EnvironmentEnum.default("production"),
  primaryRegion: PrimaryRegionEnum,
  timeZone: z.string(),
  currency: z.string().length(3).default("USD"),

  // Billing (defaults to free)
  plan: NetworkPlanEnum.default("free"),
  billingMode: BillingModeEnum.default("none"),

  // Security
  requireMfaForAdmins: z.boolean().default(true),
  gdprMode: z.boolean().default(false),

  // Scheduling defaults
  defaultWeekStartsOn: WeekStartEnum.default("monday"),
  defaultMinShiftLengthHours: z.number().positive().default(2),
  defaultMaxShiftLengthHours: z.number().positive().default(12),
  allowOvertime: z.boolean().default(true),
  overtimeThresholdHours: z.number().positive().default(40),

  // Features (sensible defaults)
  features: NetworkFeaturesSchema.optional(),

  // Ownership
  ownerUserId: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

export type CreateNetwork = z.infer<typeof CreateNetworkSchema>;

// ===== UPDATE NETWORK SCHEMA =====

export const UpdateNetworkSchema = z.object({
  displayName: z.string().min(3).max(100).optional(),
  legalName: z.string().optional(),

  // Cannot change: id, slug, kind, environment, ownerUserId

  // Mutable fields
  segment: NetworkSegmentEnum.optional(),
  status: NetworkStatusEnum.optional(),
  primaryRegion: PrimaryRegionEnum.optional(),
  timeZone: z.string().optional(),
  currency: z.string().length(3).optional(),

  plan: NetworkPlanEnum.optional(),
  billingMode: BillingModeEnum.optional(),
  billingProvider: BillingProviderEnum.optional(),
  billingCustomerId: z.string().optional(),

  maxVenues: z.number().int().positive().nullable().optional(),
  maxActiveOrgs: z.number().int().positive().nullable().optional(),
  maxActiveUsers: z.number().int().positive().nullable().optional(),
  maxShiftsPerDay: z.number().int().positive().nullable().optional(),

  requireMfaForAdmins: z.boolean().optional(),
  ipAllowlistEnabled: z.boolean().optional(),
  ipAllowlist: z.array(z.string()).optional(),
  allowedEmailDomains: z.array(z.string()).optional(),
  dataResidency: DataResidencyEnum.optional(),
  gdprMode: z.boolean().optional(),
  piiMaskingMode: PiiMaskingModeEnum.optional(),

  allowCrossOrgSharing: z.boolean().optional(),
  allowExternalCorpLinks: z.boolean().optional(),

  defaultWeekStartsOn: WeekStartEnum.optional(),
  defaultMinShiftLengthHours: z.number().positive().optional(),
  defaultMaxShiftLengthHours: z.number().positive().optional(),
  allowSelfScheduling: z.boolean().optional(),
  allowOvertime: z.boolean().optional(),
  overtimeThresholdHours: z.number().positive().optional(),
  defaultAverageWage: z.number().positive().optional(),

  features: NetworkFeaturesSchema.partial().optional(),

  tags: z.array(z.string()).optional(),

  // Suspension fields
  suspensionReason: z.string().optional(),
  suspendedBy: z.string().optional(),

  // Activation tracking
  activationBlockedBy: z.array(z.string()).optional(),
});

export type UpdateNetwork = z.infer<typeof UpdateNetworkSchema>;

// ===== QUERY SCHEMA =====

export const NetworkQuerySchema = z.object({
  status: NetworkStatusEnum.optional(),
  kind: NetworkKindEnum.optional(),
  segment: NetworkSegmentEnum.optional(),
  plan: NetworkPlanEnum.optional(),
  environment: EnvironmentEnum.optional(),
  ownerUserId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export type NetworkQuery = z.infer<typeof NetworkQuerySchema>;
