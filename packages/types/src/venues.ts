// [P1][INTEGRITY][SCHEMA] Venues schema
// Tags: P1, INTEGRITY, SCHEMA, ZOD, VENUES
import { z } from "zod";

/**
 * Venue type categorization
 */
export const VenueType = z.enum(["indoor", "outdoor", "hybrid", "virtual"]);
export type VenueType = z.infer<typeof VenueType>;

/**
 * Address schema for venues
 * @property {string} street - The street address.
 * @property {string} city - The city.
 * @property {string} state - The state or province.
 * @property {string} zipCode - The postal code.
 * @property {string} [country=US] - The country code (ISO 3166-1 alpha-2).
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
 * @property {number} lat - The latitude.
 * @property {number} lng - The longitude.
 */
export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type Coordinates = z.infer<typeof CoordinatesSchema>;

/**
 * Full Venue document schema
 * Firestore path: /venues/{orgId}/{venueId}
 * @property {string} id - The unique identifier for the venue.
 * @property {string} [networkId] - The ID of the network this venue belongs to.
 * @property {string} orgId - The ID of the organization this venue belongs to.
 * @property {string} name - The name of the venue.
 * @property {string} [description] - A brief description of the venue.
 * @property {VenueType} [type=indoor] - The type of the venue.
 * @property {Address} [address] - The physical address of the venue.
 * @property {Coordinates} [coordinates] - The geographic coordinates of the venue.
 * @property {number} [capacity] - The maximum capacity of the venue.
 * @property {boolean} [isActive=true] - Whether the venue is currently active.
 * @property {string} [timezone=America/New_York] - The timezone of the venue.
 * @property {string} [contactPhone] - The primary contact phone number for the venue.
 * @property {string} [contactEmail] - The primary contact email for the venue.
 * @property {string} [notes] - General notes about the venue.
 * @property {string} createdBy - The user ID of the user who created the venue.
 * @property {number} createdAt - The timestamp of when the venue was created.
 * @property {number} updatedAt - The timestamp of when the venue was last updated.
 */
export const VenueSchema = z.object({
  id: z.string().min(1),
  // Optional network scoping for v14 tenancy model
  networkId: z.string().min(1).optional(),
  orgId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Venue name is required").max(100),
  description: z.string().max(500).optional(),
  type: VenueType.default("indoor"),
  address: AddressSchema.optional(),
  coordinates: CoordinatesSchema.optional(),
  capacity: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  timezone: z.string().default("America/New_York"),
  contactPhone: z.string().max(20).optional(),
  contactEmail: z.string().email().optional(),
  notes: z.string().max(1000).optional(),
  createdBy: z.string().min(1),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});
export type Venue = z.infer<typeof VenueSchema>;

/**
 * Schema for creating a new venue
 * Used in POST /api/venues
 * @property {string} orgId - The ID of the organization this venue belongs to.
 * @property {string} [networkId] - The ID of the network this venue belongs to.
 * @property {string} name - The name of the venue.
 * @property {string} [description] - A brief description of the venue.
 * @property {VenueType} [type=indoor] - The type of the venue.
 * @property {Address} [address] - The physical address of the venue.
 * @property {Coordinates} [coordinates] - The geographic coordinates of the venue.
 * @property {number} [capacity] - The maximum capacity of the venue.
 * @property {string} [timezone] - The timezone of the venue.
 * @property {string} [contactPhone] - The primary contact phone number for the venue.
 * @property {string} [contactEmail] - The primary contact email for the venue.
 * @property {string} [notes] - General notes about the venue.
 */
export const CreateVenueSchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  networkId: z.string().min(1).optional(),
  name: z.string().min(1, "Venue name is required").max(100),
  description: z.string().max(500).optional(),
  type: VenueType.optional().default("indoor"),
  address: AddressSchema.optional(),
  coordinates: CoordinatesSchema.optional(),
  capacity: z.number().int().positive().optional(),
  timezone: z.string().optional(),
  contactPhone: z.string().max(20).optional(),
  contactEmail: z.string().email().optional(),
  notes: z.string().max(1000).optional(),
});
export type CreateVenueInput = z.infer<typeof CreateVenueSchema>;

/**
 * Schema for updating an existing venue
 * Used in PATCH /api/venues/{id}
 * @property {string} [name] - The new name of the venue.
 * @property {string} [description] - The new description of the venue.
 * @property {VenueType} [type] - The new type of the venue.
 * @property {Address} [address] - The new physical address of the venue.
 * @property {Coordinates} [coordinates] - The new geographic coordinates of the venue.
 * @property {number} [capacity] - The new maximum capacity of the venue.
 * @property {boolean} [isActive] - The new active status of the venue.
 * @property {string} [timezone] - The new timezone of the venue.
 * @property {string} [contactPhone] - The new contact phone number for the venue.
 * @property {string} [contactEmail] - The new contact email for the venue.
 * @property {string} [notes] - The new notes for the venue.
 */
export const UpdateVenueSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  type: VenueType.optional(),
  address: AddressSchema.optional(),
  coordinates: CoordinatesSchema.optional(),
  capacity: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  timezone: z.string().optional(),
  contactPhone: z.string().max(20).optional(),
  contactEmail: z.string().email().optional(),
  notes: z.string().max(1000).optional(),
});
export type UpdateVenueInput = z.infer<typeof UpdateVenueSchema>;

/**
 * Query parameters for listing venues
 * @property {string} orgId - The ID of the organization to list venues for.
 * @property {string} [networkId] - Filter venues by network ID.
 * @property {boolean} [isActive] - Filter venues by their active status.
 * @property {VenueType} [type] - Filter venues by their type.
 * @property {number} [limit=50] - The maximum number of venues to return.
 * @property {string} [cursor] - The cursor for pagination.
 */
export const ListVenuesQuerySchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  networkId: z.string().min(1).optional(),
  isActive: z.coerce.boolean().optional(),
  type: VenueType.optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListVenuesQuery = z.infer<typeof ListVenuesQuerySchema>;
