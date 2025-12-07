// [P1][TYPES][SCHEMA] Schema definitions
// Tags: P0, SECURITY, CODE
/**
 * Corporate Schema - Brand/HQ Graph Node within Network
 *
 * Corporate entities represent brands, HQ nodes, or parent organizations
 * within a Network. They can own or work with multiple Organizations.
 *
 * @see docs/bible/Project_Bible_v14.0.0.md Section 3.2
 * @see docs/schema-network.md
 */

import { z } from "zod";

// Type-only import for Firestore Timestamp (avoid runtime dependency)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Timestamp = any;

// ===== MAIN CORPORATE SCHEMA =====

export const CorporateSchema = z.object({
  id: z.string().min(1),
  networkId: z.string().min(1),
  name: z.string().min(1).max(100),
  brandName: z.string().max(100).optional(),
  websiteUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),

  // Business Model Flags
  ownsLocations: z.boolean().default(false),
  worksWithFranchisees: z.boolean().default(false),
  worksWithPartners: z.boolean().default(false),

  // Lifecycle
  createdAt: z.custom<Timestamp>(),
  createdBy: z.string(),
  updatedAt: z.custom<Timestamp>(),
  updatedBy: z.string(),
});

export type Corporate = z.infer<typeof CorporateSchema>;

// ===== CREATE CORPORATE SCHEMA =====

export const CreateCorporateSchema = z.object({
  networkId: z.string().min(1),
  name: z.string().min(3).max(100),
  brandName: z.string().max(100).optional(),
  websiteUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),

  ownsLocations: z.boolean().default(false),
  worksWithFranchisees: z.boolean().default(false),
  worksWithPartners: z.boolean().default(false),
});

export type CreateCorporate = z.infer<typeof CreateCorporateSchema>;

// ===== UPDATE CORPORATE SCHEMA =====

export const UpdateCorporateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  brandName: z.string().max(100).optional(),
  websiteUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),

  ownsLocations: z.boolean().optional(),
  worksWithFranchisees: z.boolean().optional(),
  worksWithPartners: z.boolean().optional(),
});

export type UpdateCorporate = z.infer<typeof UpdateCorporateSchema>;

// ===== QUERY SCHEMA =====

export const CorporateQuerySchema = z.object({
  networkId: z.string().min(1),
  name: z.string().optional(),
  ownsLocations: z.boolean().optional(),
  worksWithFranchisees: z.boolean().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export type CorporateQuery = z.infer<typeof CorporateQuerySchema>;
