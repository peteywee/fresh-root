// [P0][INTEGRITY][CODE] Organization Zod schemas
// Tags: P0, INTEGRITY, CODE
import { z } from "zod";

export const OrganizationSize = z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]);
export type OrganizationSize = z.infer<typeof OrganizationSize>;

export const Organization = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  industry: z.string().optional(),
  size: OrganizationSize.optional(),
  ownerId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  memberCount: z.number().int().min(0),
});
export type Organization = z.infer<typeof Organization>;

export const CreateOrganizationInput = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  industry: z.string().optional(),
  size: OrganizationSize.optional(),
});
export type CreateOrganizationInput = z.infer<typeof CreateOrganizationInput>;

export const UpdateOrganizationInput = z
  .object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    industry: z.string().optional(),
    size: OrganizationSize.optional(),
  })
  .partial();
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationInput>;
