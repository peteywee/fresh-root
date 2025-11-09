// [P1][INTEGRITY][SCHEMA] Positions schema
// Tags: P1, INTEGRITY, SCHEMA, ZOD, POSITIONS
import { z } from "zod";

/**
 * Position type categorization
 */
export const PositionType = z.enum(["full_time", "part_time", "contractor", "volunteer"]);
export type PositionType = z.infer<typeof PositionType>;

/**
 * Skill level for positions
 */
export const SkillLevel = z.enum(["entry", "intermediate", "advanced", "expert"]);
export type SkillLevel = z.infer<typeof SkillLevel>;

/**
 * Full Position document schema
 * Firestore path: /positions/{orgId}/{positionId}
 * @property {string} id - The unique identifier for the position.
 * @property {string} orgId - The ID of the organization this position belongs to.
 * @property {string} name - The name of the position.
 * @property {string} [description] - A brief description of the position.
 * @property {PositionType} [type=part_time] - The type of employment for the position.
 * @property {SkillLevel} [skillLevel=entry] - The required skill level for the position.
 * @property {number} [hourlyRate] - The hourly rate for the position.
 * @property {string} [color] - A hex color code associated with the position for UI display.
 * @property {boolean} [isActive=true] - Whether the position is currently active.
 * @property {string[]} [requiredCertifications] - A list of required certifications for the position.
 * @property {string} createdBy - The user ID of the user who created the position.
 * @property {number} createdAt - The timestamp of when the position was created.
 * @property {number} updatedAt - The timestamp of when the position was last updated.
 */
export const PositionSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Position name is required").max(100),
  description: z.string().max(500).optional(),
  type: PositionType.default("part_time"),
  skillLevel: SkillLevel.default("entry"),
  hourlyRate: z.number().nonnegative().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional(),
  isActive: z.boolean().default(true),
  requiredCertifications: z.array(z.string()).default([]),
  createdBy: z.string().min(1),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});
export type Position = z.infer<typeof PositionSchema>;

/**
 * Schema for creating a new position
 * Used in POST /api/positions
 * @property {string} orgId - The ID of the organization this position belongs to.
 * @property {string} name - The name of the position.
 * @property {string} [description] - A brief description of the position.
 * @property {PositionType} [type=part_time] - The type of employment for the position.
 * @property {SkillLevel} [skillLevel=entry] - The required skill level for the position.
 * @property {number} [hourlyRate] - The hourly rate for the position.
 * @property {string} [color] - A hex color code associated with the position for UI display.
 * @property {string[]} [requiredCertifications] - A list of required certifications for the position.
 */
export const CreatePositionSchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Position name is required").max(100),
  description: z.string().max(500).optional(),
  type: PositionType.optional().default("part_time"),
  skillLevel: SkillLevel.optional().default("entry"),
  hourlyRate: z.number().nonnegative().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional(),
  requiredCertifications: z.array(z.string()).optional(),
});
export type CreatePositionInput = z.infer<typeof CreatePositionSchema>;

/**
 * Schema for updating an existing position
 * Used in PATCH /api/positions/{id}
 * @property {string} [name] - The new name of the position.
 * @property {string} [description] - The new description of the position.
 * @property {PositionType} [type] - The new type of employment for the position.
 * @property {SkillLevel} [skillLevel] - The new required skill level for the position.
 * @property {number} [hourlyRate] - The new hourly rate for the position.
 * @property {string} [color] - The new hex color code for the position.
 * @property {boolean} [isActive] - The new active status of the position.
 * @property {string[]} [requiredCertifications] - The new list of required certifications.
 */
export const UpdatePositionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  type: PositionType.optional(),
  skillLevel: SkillLevel.optional(),
  hourlyRate: z.number().nonnegative().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  isActive: z.boolean().optional(),
  requiredCertifications: z.array(z.string()).optional(),
});
export type UpdatePositionInput = z.infer<typeof UpdatePositionSchema>;

/**
 * Query parameters for listing positions
 * @property {string} orgId - The ID of the organization to list positions for.
 * @property {boolean} [isActive] - Filter positions by their active status.
 * @property {PositionType} [type] - Filter positions by their type.
 * @property {number} [limit=50] - The maximum number of positions to return.
 * @property {string} [cursor] - The cursor for pagination.
 */
export const ListPositionsQuerySchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  isActive: z.coerce.boolean().optional(),
  type: PositionType.optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().optional(),
});
export type ListPositionsQuery = z.infer<typeof ListPositionsQuerySchema>;
