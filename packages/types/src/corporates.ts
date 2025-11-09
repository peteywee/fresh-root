// [P0][SECURITY][CODE] Corporates
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

import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

// ===== MAIN CORPORATE SCHEMA =====

/**
 * Represents a corporate entity within the system.
 * @property {string} id - The unique identifier for the corporate entity.
 * @property {string} networkId - The ID of the network this corporate entity belongs to.
 * @property {string} name - The legal name of the corporate entity.
 * @property {string} [brandName] - The brand name, if different from the legal name.
 * @property {string} [websiteUrl] - The official website of the corporate entity.
 * @property {string} [contactEmail] - The primary contact email address.
 * @property {string} [contactPhone] - The primary contact phone number.
 * @property {boolean} ownsLocations - Flag indicating if the corporate entity directly owns its locations.
 * @property {boolean} worksWithFranchisees - Flag indicating if the corporate entity works with franchisees.
 * @property {boolean} worksWithPartners - Flag indicating if the corporate entity works with partners.
 * @property {Timestamp} createdAt - Timestamp of when the corporate entity was created.
 * @property {string} createdBy - The user ID of the creator.
 * @property {Timestamp} updatedAt - Timestamp of the last update.
 * @property {string} updatedBy - The user ID of the last user who updated it.
 */
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

/**
 * Schema for creating a new corporate entity.
 * @property {string} networkId - The ID of the network this corporate entity belongs to.
 * @property {string} name - The legal name of the corporate entity.
 * @property {string} [brandName] - The brand name, if different from the legal name.
 * @property {string} [websiteUrl] - The official website of the corporate entity.
 * @property {string} [contactEmail] - The primary contact email address.
 * @property {string} [contactPhone] - The primary contact phone number.
 * @property {boolean} ownsLocations - Flag indicating if the corporate entity directly owns its locations.
 * @property {boolean} worksWithFranchisees - Flag indicating if the corporate entity works with franchisees.
 * @property {boolean} worksWithPartners - Flag indicating if the corporate entity works with partners.
 */
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

/**
 * Schema for updating an existing corporate entity. All fields are optional.
 * @property {string} [name] - The legal name of the corporate entity.
 * @property {string} [brandName] - The brand name, if different from the legal name.
 * @property {string} [websiteUrl] - The official website of the corporate entity.
 * @property {string} [contactEmail] - The primary contact email address.
 * @property {string} [contactPhone] - The primary contact phone number.
 * @property {boolean} [ownsLocations] - Flag indicating if the corporate entity directly owns its locations.
 * @property {boolean} [worksWithFranchisees] - Flag indicating if the corporate entity works with franchisees.
 * @property {boolean} [worksWithPartners] - Flag indicating if the corporate entity works with partners.
 */
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

/**
 * Schema for querying corporate entities.
 * @property {string} networkId - The ID of the network to query within.
 * @property {string} [name] - Filter by corporate name.
 * @property {boolean} [ownsLocations] - Filter by whether the corporate entity owns locations.
 * @property {boolean} [worksWithFranchisees] - Filter by whether the corporate entity works with franchisees.
 * @property {number} [limit=20] - The maximum number of results to return.
 * @property {number} [offset=0] - The number of results to skip for pagination.
 */
export const CorporateQuerySchema = z.object({
  networkId: z.string().min(1),
  name: z.string().optional(),
  ownsLocations: z.boolean().optional(),
  worksWithFranchisees: z.boolean().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export type CorporateQuery = z.infer<typeof CorporateQuerySchema>;
