// [P1][TYPES][SCHEMA] Schema definitions
// Tags: P2, APP, CODE
// Template: CODE_ZOD_SCHEMA

import { z } from "zod";

/**
 * Widget domain schema
 * Owner: platform
 * Description: Domain entity
 */
export const WidgetId = z.string().min(1);

export const WidgetSchema = z.object({
  id: WidgetId,
  createdAt: z.string(),
  updatedAt: z.string(),
  // add domain fields here
});

export type Widget = z.infer<typeof WidgetSchema>;

// Index export pattern (place in src/index.ts)
// export * from "./widgets";
