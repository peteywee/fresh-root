//[P1][TYPES][SCHEMA] Organization-Venue Assignment Schema (v14.0.0)
// Tags: zod, schema, validation, network-graph, org-venue-assignment, gap-3

/**
 * Organization-Venue Assignment Schema (v14.0.0)
 *
 * Defines the many-to-many relationship between Organizations and Venues.
 * Replaces legacy orgId single-parent pattern with flexible assignment model.
 *
 * Path: networks/{networkId}/orgVenueAssignments/{assignmentId}
 *
 * Related:
 * - Project Bible v14.0.0 Section 3.3.2 (OrgVenueAssignment - GAP-3)
 * - packages/types/src/orgs.ts
 * - packages/types/src/venues.ts
 *
 * GAP-3 Resolution:
 * This schema enables venues to be shared across multiple organizations
 * within a network, supporting use cases like shared facilities and
 * multi-tenant venue management.
 */

import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

/**
 * Assignment status enum
 */
export const OrgVenueAssignmentStatus = z.enum(["active", "inactive", "pending", "suspended"]);
export type OrgVenueAssignmentStatus = z.infer<typeof OrgVenueAssignmentStatus>;

/**
 * Assignment role enum
 * Defines the relationship nature between org and venue
 */
export const OrgVenueRole = z.enum([
  "owner", // Org owns the venue
  "manager", // Org manages the venue
  "tenant", // Org is a tenant at the venue
  "partner", // Org has a partnership with the venue
  "guest", // Org has guest access to the venue
  "other",
]);
export type OrgVenueRole = z.infer<typeof OrgVenueRole>;

/**
 * Full Organization-Venue Assignment Schema
 * Stored at: networks/{networkId}/orgVenueAssignments/{assignmentId}
 */
export const OrgVenueAssignmentSchema = z.object({
  // Identity
  assignmentId: z.string().min(1, "Assignment ID is required"),
  networkId: z.string().min(1, "Network ID is required"),

  // Relationship
  orgId: z.string().min(1, "Organization ID is required"),
  venueId: z.string().min(1, "Venue ID is required"),
  role: OrgVenueRole.default("tenant"),

  // Status & metadata
  status: OrgVenueAssignmentStatus.default("active"),
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

  // Access control & permissions
  canSchedule: z.boolean().default(true),
  canManageVenue: z.boolean().default(false),
  canViewReports: z.boolean().default(true),

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

export type OrgVenueAssignment = z.infer<typeof OrgVenueAssignmentSchema>;

/**
 * Schema for creating a new Org-Venue assignment
 * Used in API payloads (POST /api/networks/{networkId}/org-venue-assignments)
 */
export const CreateOrgVenueAssignmentSchema = z.object({
  networkId: z.string().min(1, "Network ID is required"),
  orgId: z.string().min(1, "Organization ID is required"),
  venueId: z.string().min(1, "Venue ID is required"),
  role: OrgVenueRole.default("tenant"),
  status: OrgVenueAssignmentStatus.optional().default("active"),
  effectiveDate: z.string().datetime().optional(), // ISO string in API
  expirationDate: z.string().datetime().optional().nullable(),
  canSchedule: z.boolean().optional().default(true),
  canManageVenue: z.boolean().optional().default(false),
  canViewReports: z.boolean().optional().default(true),
  notes: z.string().max(1000).optional().nullable(),
});

export type CreateOrgVenueAssignmentInput = z.infer<typeof CreateOrgVenueAssignmentSchema>;

/**
 * Schema for updating an existing Org-Venue assignment
 * Used in API payloads (PATCH /api/networks/{networkId}/org-venue-assignments/{assignmentId})
 */
export const UpdateOrgVenueAssignmentSchema = z.object({
  role: OrgVenueRole.optional(),
  status: OrgVenueAssignmentStatus.optional(),
  effectiveDate: z.string().datetime().optional(),
  expirationDate: z.string().datetime().optional().nullable(),
  canSchedule: z.boolean().optional(),
  canManageVenue: z.boolean().optional(),
  canViewReports: z.boolean().optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export type UpdateOrgVenueAssignmentInput = z.infer<typeof UpdateOrgVenueAssignmentSchema>;

/**
 * Query schema for listing Org-Venue assignments
 * Used in API query params (GET /api/networks/{networkId}/org-venue-assignments)
 */
export const ListOrgVenueAssignmentsQuerySchema = z.object({
  networkId: z.string().min(1, "Network ID is required"),
  orgId: z.string().optional(),
  venueId: z.string().optional(),
  role: OrgVenueRole.optional(),
  status: OrgVenueAssignmentStatus.optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  startAfter: z.string().optional(), // assignmentId for pagination
});

export type ListOrgVenueAssignmentsQuery = z.infer<typeof ListOrgVenueAssignmentsQuerySchema>;
