//[P1][TYPES][SCHEMA] Corporate-Organization Link Schema (v14.0.0)
// Tags: zod, schema, validation, network-graph, corp-org-link

/**
 * Corporate-Organization Link Schema (v14.0.0)
 *
 * Defines the relationship between Corporate entities (brands/HQ) and Organizations
 * within a Network. This enables brand hierarchies and corporate ownership tracking.
 *
 * Path: networks/{networkId}/corpOrgLinks/{linkId}
 *
 * Related:
 * - Project Bible v14.0.0 Section 3.3.1 (Corporate-Org Links)
 * - packages/types/src/corporates.ts
 * - packages/types/src/orgs.ts
 */

import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

/**
 * Link status enum
 */
export const CorpOrgLinkStatus = z.enum(["active", "inactive", "pending", "dissolved"]);
export type CorpOrgLinkStatus = z.infer<typeof CorpOrgLinkStatus>;

/**
 * Relationship type enum
 */
export const CorpOrgRelationType = z.enum([
  "owns", // Corporate owns the organization outright
  "franchises", // Corporate franchises to the organization
  "manages", // Corporate manages the organization
  "partners", // Strategic partnership
  "sponsors", // Sponsorship relationship
  "other",
]);
export type CorpOrgRelationType = z.infer<typeof CorpOrgRelationType>;

/**
 * Full Corporate-Organization Link Schema
 * Stored at: networks/{networkId}/corpOrgLinks/{linkId}
 */
export const CorpOrgLinkSchema = z.object({
  // Identity
  linkId: z.string().min(1, "Link ID is required"),
  networkId: z.string().min(1, "Network ID is required"),

  // Relationship
  corporateId: z.string().min(1, "Corporate ID is required"),
  orgId: z.string().min(1, "Organization ID is required"),
  relationType: CorpOrgRelationType,

  // Status & metadata
  status: CorpOrgLinkStatus.default("active"),
  effectiveDate: z
    .custom<Timestamp>((val) => val instanceof Timestamp, {
      message: "Must be a Firestore Timestamp",
    })
    .optional(),
  expirationDate: z
    .custom<Timestamp>((val) => val instanceof Timestamp, {
      message: "Must be a Firestore Timestamp",
    })
    .optional()
    .nullable(),

  // Notes & context
  notes: z.string().max(1000).optional().nullable(),

  // Audit fields
  createdAt: z.custom<Timestamp>((val) => val instanceof Timestamp, {
    message: "Must be a Firestore Timestamp",
  }),
  updatedAt: z.custom<Timestamp>((val) => val instanceof Timestamp, {
    message: "Must be a Firestore Timestamp",
  }),
  createdBy: z.string().min(1, "Created by UID is required"),
  updatedBy: z.string().min(1, "Updated by UID is required"),
});

export type CorpOrgLink = z.infer<typeof CorpOrgLinkSchema>;

/**
 * Schema for creating a new Corporate-Org link
 * Used in API payloads (POST /api/networks/{networkId}/corp-org-links)
 */
export const CreateCorpOrgLinkSchema = z.object({
  networkId: z.string().min(1, "Network ID is required"),
  corporateId: z.string().min(1, "Corporate ID is required"),
  orgId: z.string().min(1, "Organization ID is required"),
  relationType: CorpOrgRelationType,
  status: CorpOrgLinkStatus.optional().default("active"),
  effectiveDate: z.string().datetime().optional(), // ISO string in API
  expirationDate: z.string().datetime().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type CreateCorpOrgLinkInput = z.infer<typeof CreateCorpOrgLinkSchema>;

/**
 * Schema for updating an existing Corporate-Org link
 * Used in API payloads (PATCH /api/networks/{networkId}/corp-org-links/{linkId})
 */
export const UpdateCorpOrgLinkSchema = z.object({
  relationType: CorpOrgRelationType.optional(),
  status: CorpOrgLinkStatus.optional(),
  effectiveDate: z.string().datetime().optional(),
  expirationDate: z.string().datetime().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type UpdateCorpOrgLinkInput = z.infer<typeof UpdateCorpOrgLinkSchema>;

/**
 * Query schema for listing Corporate-Org links
 * Used in API query params (GET /api/networks/{networkId}/corp-org-links)
 */
export const ListCorpOrgLinksQuerySchema = z.object({
  networkId: z.string().min(1, "Network ID is required"),
  corporateId: z.string().optional(),
  orgId: z.string().optional(),
  relationType: CorpOrgRelationType.optional(),
  status: CorpOrgLinkStatus.optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  startAfter: z.string().optional(), // linkId for pagination
});

export type ListCorpOrgLinksQuery = z.infer<typeof ListCorpOrgLinksQuerySchema>;
