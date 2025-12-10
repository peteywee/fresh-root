// [P1][TYPES][SCHEMA] Widget schema definitions
// Tags: P1, TYPES, SCHEMA, WIDGETS

import { z } from "zod";

/**
 * Widget creation schema
 */
export const CreateWidgetSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["dashboard", "chart", "metric", "custom"]).default("custom"),
  config: z.record(z.string(), z.unknown()).optional(),
});

export type CreateWidget = z.infer<typeof CreateWidgetSchema>;

/**
 * Widget domain schema
 */
export const WidgetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  type: z.enum(["dashboard", "chart", "metric", "custom"]),
  config: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

export type Widget = z.infer<typeof WidgetSchema>;
