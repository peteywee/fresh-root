// [P1][INTEGRITY][SCHEMA] Corp -> Org link schema
// Tags: P1, INTEGRITY, SCHEMA, LINKS
import { z } from "zod";

export const CorpOrgLinkSchema = z.object({
  linkId: z.string().min(1),
  networkId: z.string().min(1),
  corporateId: z.string().min(1),
  orgId: z.string().min(1),
  relationType: z.string().min(1),
  status: z.string().min(1),
  createdAt: z.any(),
  updatedAt: z.any().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

export type CorpOrgLink = z.infer<typeof CorpOrgLinkSchema>;

export default CorpOrgLinkSchema;
