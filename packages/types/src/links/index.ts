// [P1][LINKS][SCHEMA] Corporate-Organization links schema
import { z } from "zod";

import { CorpOrgLinkSchema } from "./corpOrgLinks";

/**
 * Links barrel export
 * Re-exports all link schemas for network graph relationships
 */

export * from "./corpOrgLinks";
export * from "./orgVenueAssignments";

// Type inference from Zod schemas
export type CorpOrgLink = z.infer<typeof CorpOrgLinkSchema>;
