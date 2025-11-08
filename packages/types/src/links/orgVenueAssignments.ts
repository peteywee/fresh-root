// [P1][INTEGRITY][SCHEMA] Organization -> Venue assignment link schemas (v14)
// Tags: P1, INTEGRITY, SCHEMA, ZOD, LINKS
import { z } from "zod";

const DateLike = z.union([z.number().int().positive(), z.string().datetime()]);

export const OrgVenueAssignmentSchema = z.object({
  id: z.string().min(1),
  networkId: z.string().min(1).optional(),
  orgId: z.string().min(1),
  venueId: z.string().min(1),
  role: z.string().min(1),
  status: z.string().min(1).optional(),
  createdAt: DateLike,
  updatedAt: DateLike.optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

export type OrgVenueAssignment = z.infer<typeof OrgVenueAssignmentSchema>;

export const CreateOrgVenueAssignmentSchema = OrgVenueAssignmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  role: z.string().min(1).optional(),
  status: z.string().min(1).optional(),
});

export const UpdateOrgVenueAssignmentSchema = OrgVenueAssignmentSchema.partial().omit({ id: true });

export default OrgVenueAssignmentSchema;
