// [P1][TEST][TEST] OrgVenueAssignments Test tests
// Tags: P1, TEST, TEST
// Tests for OrgVenueAssignments link schemas
import { describe, it, expect } from "vitest";

import {
  OrgVenueAssignmentSchema,
  CreateOrgVenueAssignmentSchema,
  UpdateOrgVenueAssignmentSchema,
} from "../links/orgVenueAssignments";

describe("OrgVenueAssignmentSchema", () => {
  it("validates a full org-venue assignment (id form)", () => {
    const a = {
      id: "av1",
      orgId: "o1",
      venueId: "v1",
      role: "primary",
      networkId: "n1",
      createdBy: "u1",
      createdAt: Date.now(),
    };

    const r = OrgVenueAssignmentSchema.safeParse(a);
    if (!r.success) console.error("DEBUG parse error", JSON.stringify(r.error.issues, null, 2));
    expect(r.success).toBe(true);
  });

  it("validates a full org-venue assignment (assignmentId form)", () => {
    const assignment = {
      id: "a1",
      networkId: "n1",
      orgId: "o1",
      venueId: "v1",
      role: "manager",
      status: "active",
      createdAt: Date.now(),
    };
    const result = OrgVenueAssignmentSchema.safeParse(assignment);
    expect(result.success).toBe(true);
  });

  it("Create schema accepts minimal valid shape", () => {
    const ok = CreateOrgVenueAssignmentSchema.safeParse({ orgId: "o1", venueId: "v1" });
    expect(ok.success).toBe(true);
  });

  it("Create schema rejects empty ids", () => {
    const bad = CreateOrgVenueAssignmentSchema.safeParse({ orgId: "", venueId: "" });
    expect(bad.success).toBe(false);
  });

  it("Update schema allows partial updates", () => {
    const res = UpdateOrgVenueAssignmentSchema.safeParse({ status: "inactive" });
    expect(res.success).toBe(true);
  });

  // TODO-v14: TEN-03 / TEN-05 - this test validates `OrgVenueAssignmentSchema` for v14 link semantics
  // See docs/TODO-v14.md for the TEN-03 and TEN-05 requirements
});
