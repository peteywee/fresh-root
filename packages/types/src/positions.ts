// [P1][INTEGRITY][CODE] Position Zod schemas for job positions in organizations
// Tags: P1, INTEGRITY, CODE, VALIDATION, SCHEDULES
import { z } from "zod";

/**
 * Complete position record as stored in Firestore.
 * Represents a job position within an organization.
 */
export const PositionSchema = z.object({
  id: z.string().min(1, "Position ID is required"),
  orgId: z.string().min(1, "Organization ID is required"),
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  hourlyRate: z
    .number()
    .min(0, "Hourly rate must be non-negative")
    .max(9999.99, "Hourly rate must be less than $10,000")
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color code")
    .optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime("Invalid createdAt timestamp"),
  updatedAt: z.string().datetime("Invalid updatedAt timestamp").optional(),
  createdBy: z.string().min(1, "Created by user ID is required"),
});

export type Position = z.infer<typeof PositionSchema>;

/**
 * Input schema for creating a new position.
 */
export const PositionCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  hourlyRate: z
    .number()
    .min(0, "Hourly rate must be non-negative")
    .max(9999.99, "Hourly rate must be less than $10,000")
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color code")
    .optional(),
  isActive: z.boolean().optional().default(true),
});

export type PositionCreateInput = z.infer<typeof PositionCreateSchema>;

/**
 * Input schema for updating an existing position.
 * All fields are optional for partial updates.
 */
export const PositionUpdateSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(100, "Title must be 100 characters or less")
      .optional(),
    description: z.string().max(500, "Description must be 500 characters or less").optional(),
    hourlyRate: z
      .number()
      .min(0, "Hourly rate must be non-negative")
      .max(9999.99, "Hourly rate must be less than $10,000")
      .optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color code")
      .optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export type PositionUpdateInput = z.infer<typeof PositionUpdateSchema>;

/**
 * Default position colors for UI (Material Design palette).
 */
export const DEFAULT_POSITION_COLORS = [
  "#1976D2", // Blue
  "#388E3C", // Green
  "#F57C00", // Orange
  "#7B1FA2", // Purple
  "#C2185B", // Pink
  "#0097A7", // Cyan
  "#689F38", // Light Green
  "#E64A19", // Deep Orange
  "#5D4037", // Brown
  "#455A64", // Blue Grey
];

/**
 * Helper to get a default color based on position index.
 */
export function getDefaultPositionColor(index: number): string {
  return DEFAULT_POSITION_COLORS[index % DEFAULT_POSITION_COLORS.length];
}
