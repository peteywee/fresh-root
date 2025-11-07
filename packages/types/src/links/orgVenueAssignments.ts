// [P1][INTEGRITY][SCHEMA] OrgVenueAssignment schema
// Tags: P1, INTEGRITY, SCHEMA, LINKS
import { z } from "zod";

export const OrgVenueAssignmentSchema = z.object({
  assignmentId: z.string().min(1),
  networkId: z.string().min(1),
  orgId: z.string().min(1),
  venueId: z.string().min(1),
  role: z.string().min(1),
  status: z.string().min(1),
  createdAt: z.any(),
  updatedAt: z.any().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

export type OrgVenueAssignment = z.infer<typeof OrgVenueAssignmentSchema>;

export default OrgVenueAssignmentSchema;
