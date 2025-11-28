// [P1][COMPLIANCE][SCHEMA] Compliance schema definitions
import { z } from "zod";

import { AdminResponsibilityFormSchema } from "./adminResponsibilityForm";

/**
 * Compliance barrel export
 * Re-exports all compliance-related schemas
 */

export * from "./adminResponsibilityForm";

// Type inference from Zod schemas
export type AdminResponsibilityForm = z.infer<typeof AdminResponsibilityFormSchema>;
