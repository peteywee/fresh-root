// [P1][INTEGRITY][SCHEMA] Zones schema
// Tags: P1, INTEGRITY, SCHEMA, ZOD, ZONES
import { z } from "zod";

/**
 * Zone type categorization
 */
export const ZoneType = z.enum([
  "production",
  "backstage",
  "front_of_house",
  "service",
  "storage",
  "other",
]);
export type ZoneType = z.infer<typeof ZoneType>;

/**
 * Full Zone document schema
 * Firestore path: /zones/{orgId}/{zoneId}
 * @property {string} id - The unique identifier for the zone.
 * @property {string} orgId - The ID of the organization this zone belongs to.
 * @property {string} venueId - The ID of the venue this zone is a part of.
 * @property {string} name - The name of the zone.
 * @property {string} [description] - A brief description of the zone.
 * @property {ZoneType} [type=other] - The type of the zone.
 * @property {number} [capacity] - The maximum capacity of the zone.
 * @property {string} [floor] - The floor or level where the zone is located.
 * @property {boolean} [isActive=true] - Whether the zone is currently active.
 * @property {string} [color] - A hex color code associated with the zone for UI display.
 * @property {string} [notes] - General notes about the zone.
 * @property {string} createdBy - The user ID of the user who created the zone.
 * @property {number} createdAt - The timestamp of when the zone was created.
 * @property {number} updatedAt - The timestamp of when the zone was last updated.
 */
export const ZoneSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1, "Organization ID is required"),
  venueId: z.string().min(1, "Venue ID is required"),
  name: z.string().min(1, "Zone name is required").max(100),
  description: z.string().max(500).optional(),
  type: ZoneType.default("other"),
  capacity: z.number().int().positive().optional(),
  floor: z.string().max(50).optional(),
  isActive: z.boolean().default(true),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional(),
  notes: z.string().max(1000).optional(),
  createdBy: z.string().min(1),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});
export type Zone = z.infer<typeof ZoneSchema>;

/**
 * Schema for creating a new zone
 * Used in POST /api/zones
 * @property {string} orgId - The ID of the organization this zone belongs to.
 * @property {string} venueId - The ID of the venue this zone is a part of.
 * @property {string} name - The name of the zone.
 * @property {string} [description] - A brief description of the zone.
 * @property {ZoneType} [type=other] - The type of the zone.
 * @property {number} [capacity] - The maximum capacity of the zone.
 * @property {string} [floor] - The floor or level where the zone is located.
 * @property {string} [color] - A hex color code associated with the zone for UI display.
 * @property {string} [notes] - General notes about the zone.
 */
export const CreateZoneSchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  venueId: z.string().min(1, "Venue ID is required"),
  name: z.string().min(1, "Zone name is required").max(100),
  description: z.string().max(500).optional(),
  type: ZoneType.optional().default("other"),
  capacity: z.number().int().positive().optional(),
  floor: z.string().max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  notes: z.string().max(1000).optional(),
});
export type CreateZoneInput = z.infer<typeof CreateZoneSchema>;

/**
 * Schema for updating an existing zone
 * Used in PATCH /api/zones/{id}
 * @property {string} [name] - The new name of the zone.
 * @property {string} [description] - The new description of the zone.
 * @property {ZoneType} [type] - The new type of the zone.
 * @property {number} [capacity] - The new maximum capacity of the zone.
 * @property {string} [floor] - The new floor or level of the zone.
 * @property {boolean} [isActive] - The new active status of the zone.
 * @property {string} [color] - The new hex color code for the zone.
 * @property {string} [notes] - The new notes for the zone.
 */
export const UpdateZoneSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  type: ZoneType.optional(),
  capacity: z.number().int().positive().optional(),
  floor: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  notes: z.string().max(1000).optional(),
});
export type UpdateZoneInput = z.infer<typeof UpdateZoneSchema>;

/**
 * Query parameters for listing zones
 * @property {string} orgId - The ID of the organization to list zones for.
 * @property {string} [venueId] - Filter zones by venue ID.
 * @property {boolean} [isActive] - Filter zones by their active status.
 * @property {ZoneType} [type] - Filter zones by their type.
 * @property {number} [limit=50] - The maximum number of zones to return.
 * @property {string} [cursor] - The cursor for pagination.
 */
export const ListZonesQuerySchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  venueId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  type: ZoneType.optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListZonesQuery = z.infer<typeof ListZonesQuerySchema>;
