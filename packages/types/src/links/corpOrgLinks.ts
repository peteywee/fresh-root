// [P1][INTEGRITY][SCHEMA] Corporate -> Organization link schemas (v14)
// Tags: P1, INTEGRITY, SCHEMA, ZOD, LINKS
import { z } from "zod";

const DateLike = z.union([z.number().int().positive(), z.string().datetime()]);

export const CorpOrgRelationType = z.enum(["owner", "sponsor", "partner", "affiliate"]);
export type CorpOrgRelationType = z.infer<typeof CorpOrgRelationType>;

export const CorpOrgStatus = z.enum(["active", "suspended", "pending"]);
export type CorpOrgStatus = z.infer<typeof CorpOrgStatus>;

export const CorpOrgLinkSchema = z.object({
  linkId: z.string().min(1),
  networkId: z.string().min(1).optional(),
  corporateId: z.string().min(1),
  orgId: z.string().min(1),
  relationType: CorpOrgRelationType,
  status: CorpOrgStatus,
  createdAt: DateLike,
  updatedAt: DateLike.optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

export type CorpOrgLink = z.infer<typeof CorpOrgLinkSchema>;

export const CreateCorpOrgLinkSchema = CorpOrgLinkSchema.omit({
  linkId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // allow more permissive relationType/status on create inputs
  relationType: z.string().min(1),
  status: z.string().min(1),
});

export const UpdateCorpOrgLinkSchema = CorpOrgLinkSchema.partial().omit({ linkId: true });

export default CorpOrgLinkSchema;
