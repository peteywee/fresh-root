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
