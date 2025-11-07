// [P1][INTEGRITY][SCHEMA] Venues schema
// Tags: P1, INTEGRITY, SCHEMA, ZOD, VENUES
// NOTE: In v14.0.0, Venues are graph nodes within a Network
// Org association is via OrgVenueAssignment links, not direct orgId
// @see docs/bible/Project_Bible_v14.0.0.md Section 3.2
import { z } from "zod";

/**
 * Venue type categorization
 */
export const VenueType = z.enum(["indoor", "outdoor", "hybrid", "virtual"]);
export type VenueType = z.infer<typeof VenueType>;

/**
 * Address schema for venues
 */
export const AddressSchema = z.object({
  street: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().min(2).max(50),
  zipCode: z.string().min(5).max(10),
  country: z.string().min(2).max(2).default("US"), // ISO 3166-1 alpha-2
});
export type Address = z.infer<typeof AddressSchema>;

/**
 * Geographic coordinates
 */
export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type Coordinates = z.infer<typeof CoordinatesSchema>;

/**
 * Full Venue document schema
 * Firestore path: /networks/{networkId}/venues/{venueId} (v14.0.0+)
 * Legacy path: /venues/{orgId}/{venueId} (pre-v14, deprecated)
 *
 * In v14.0.0, orgId is optional/deprecated. Org-Venue association is via
 * OrgVenueAssignment link documents.
 */
export const VenueSchema = z.object({
  id: z.string().min(1),
  networkId: z.string().min(1), // Added in v14.0.0
  orgId: z.string().optional(), // Deprecated in v14.0.0, kept for backward compatibility
  name: z.string().min(1, "Venue name is required").max(100),
  description: z.string().max(500).optional(),
  type: VenueType.default("indoor"),

  // Address fields (flattened in v14.0.0)
  addressLine1: z.string().max(200).optional(),
  addressLine2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  postalCode: z.string().max(10).optional(),
  country: z.string().length(2).optional(), // ISO 3166-1 alpha-2

  // Legacy address object (deprecated)
  address: AddressSchema.optional(),

  // Coordinates (flattened in v14.0.0)
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  coordinates: CoordinatesSchema.optional(), // Legacy

  capacity: z.number().int().positive().optional(),
  capacityHint: z.number().int().positive().optional(), // Added in v14.0.0
  isActive: z.boolean().default(true),
  timezone: z.string().default("America/New_York"),
  timeZone: z.string().optional(), // v14.0.0 uses camelCase
  contactPhone: z.string().max(20).optional(),
  contactEmail: z.string().email().optional(),
  notes: z.string().max(1000).optional(),
  createdBy: z.string().min(1),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  updatedBy: z.string().optional(), // Added in v14.0.0
});
export type Venue = z.infer<typeof VenueSchema>;

/**
 * Schema for creating a new venue
 * Used in POST /api/venues and onboarding flows
 */
export const CreateVenueSchema = z.object({
  networkId: z.string().min(1), // Required in v14.0.0
  orgId: z.string().optional(), // Deprecated in v14.0.0
  name: z.string().min(1, "Venue name is required").max(100),
  description: z.string().max(500).optional(),
  type: VenueType.optional().default("indoor"),

  // Flattened address fields
  addressLine1: z.string().max(200).optional(),
  addressLine2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  postalCode: z.string().max(10).optional(),
  country: z.string().length(2).optional(),

  address: AddressSchema.optional(), // Legacy

  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  coordinates: CoordinatesSchema.optional(), // Legacy

  capacity: z.number().int().positive().optional(),
  capacityHint: z.number().int().positive().optional(),
  timezone: z.string().optional(),
  timeZone: z.string().optional(),
  contactPhone: z.string().max(20).optional(),
  contactEmail: z.string().email().optional(),
  notes: z.string().max(1000).optional(),
});
export type CreateVenueInput = z.infer<typeof CreateVenueSchema>;

/**
 * Schema for updating an existing venue (v14.0.0)
 * Used in PATCH /api/venues/{id}
 * 
 * v14.0.0: Added networkId-aware fields, flattened address
 */
export const UpdateVenueSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  type: VenueType.optional(),
  
  // v14.0.0: Flattened address fields
  addressLine1: z.string().max(100).optional(),
  addressLine2: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(50).optional(),
  
  // v14.0.0: Direct lat/lng + legacy
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  address: AddressSchema.optional(), // Legacy
  coordinates: CoordinatesSchema.optional(), // Legacy
  
  capacity: z.number().int().positive().optional(),
  capacityHint: z.number().int().positive().optional(), // v14.0.0
  isActive: z.boolean().optional(),
  timeZone: z.string().optional(),
  timezone: z.string().optional(), // Legacy
  contactPhone: z.string().max(20).optional(),
  contactEmail: z.string().email().optional(),
  notes: z.string().max(1000).optional(),
});
export type UpdateVenueInput = z.infer<typeof UpdateVenueSchema>;

/**
 * Query parameters for listing venues (v14.0.0)
 * 
 * v14.0.0: Added networkId as primary scope, orgId for filtering via OrgVenueAssignments
 */
export const ListVenuesQuerySchema = z.object({
  networkId: z.string().min(1, 'Network ID is required'), // v14.0.0: Primary scope
  orgId: z.string().optional(), // v14.0.0: Optional filter via OrgVenueAssignments
  isActive: z.coerce.boolean().optional(),
  type: VenueType.optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListVenuesQuery = z.infer<typeof ListVenuesQuerySchema>;
