// [P1][TYPES][SCHEMA] Schema definitions
// Tags: P0, APP, CODE
import { z } from "zod";

/**
 * compliance — container docs for compliance artifacts (forms, attestations).
 * Collection: compliance
 * Keyed by server-generated id. Designed to store different doc types under one roof.
 */
export const ComplianceDocSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  // schema discriminator for subtypes; e.g. "adminResponsibilityForm"
  kind: z.string().min(1),
  // version of the document schema used to produce this record
  schemaVersion: z.string().min(1),
  createdBy: z.string().min(1), // uid
  createdAt: z.string(), // ISO
  updatedAt: z.string().optional(),
  // canonical payload, validated by the corresponding subtype schema at write-time
  payload: z.record(z.string(), z.any()),
  // (optional) signatures / attestations by uid
  attestations: z
    .array(
      z.object({
        uid: z.string().min(1),
        at: z.string(), // ISO
      }),
    )
    .default([]),
});

export type ComplianceDoc = z.infer<typeof ComplianceDocSchema>;
