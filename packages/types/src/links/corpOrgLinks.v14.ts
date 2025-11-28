// [P0][INTEGRITY][SCHEMA] Corporate -> Organization link schemas (v14)
import { z } from "zod";
import { CorpOrgLinkSchema } from "./corpOrgLinks";

// Re-export from main corpOrgLinks schema
export * from "./corpOrgLinks";

// Type inference from Zod schemas
export type CorpOrgLink = z.infer<typeof CorpOrgLinkSchema>;
