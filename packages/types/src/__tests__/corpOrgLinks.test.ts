// [P1][TEST][TEST] CorpOrgLinks Test tests
// Tags: P1, TEST, TEST
// Tests for corp-org link schemas
// TODO-v14: TEN-03 / TEN-05 - this test validates the v14 `CorpOrgLinkSchema` and is part of the link-schema
// test coverage requested in docs/TODO-v14.md
import { describe, it, expect } from "vitest";

import {
  CorpOrgLinkSchema,
  CreateCorpOrgLinkSchema,
  UpdateCorpOrgLinkSchema,
} from "../links/corpOrgLinks";

describe("CorpOrgLinkSchema", () => {
  it("validates a full corp-org link with number timestamp", () => {
    const link = {
      linkId: "l1",
      networkId: "n1",
      corporateId: "c1",
      orgId: "o1",
      relationType: "partner",
      status: "active",
      createdAt: Date.now(),
    };
    const result = CorpOrgLinkSchema.safeParse(link);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = CorpOrgLinkSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("Create schema accepts minimal create shape and rejects empty ids", () => {
    const ok = CreateCorpOrgLinkSchema.safeParse({
      networkId: "n1",
      corporateId: "c1",
      orgId: "o1",
      relationType: "r",
      status: "active",
    });
    expect(ok.success).toBe(true);

    const bad = CreateCorpOrgLinkSchema.safeParse({
      networkId: "",
      corporateId: "",
      orgId: "",
      relationType: "",
      status: "",
    });
    expect(bad.success).toBe(false);
  });

  it("Update schema allows partial updates", () => {
    const res = UpdateCorpOrgLinkSchema.safeParse({ status: "suspended" });
    expect(res.success).toBe(true);
  });
});
