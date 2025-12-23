import { beforeAll, afterAll, describe, it } from "vitest";
import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";

import { createRulesTestEnv, ctxUser, membershipId, seed } from "./helpers";

describe("rules: tenant isolation", () => {
  let env: Awaited<ReturnType<typeof createRulesTestEnv>>;

  const orgA = "org-a";
  const orgB = "org-b";

  beforeAll(async () => {
    env = await createRulesTestEnv();

    await seed(env, async (db) => {
      await db.collection("orgs").doc(orgA).set({ name: "Org A" });
      await db.collection("orgs").doc(orgB).set({ name: "Org B" });

      // Legacy membership doc granting user-a membership in orgA only.
      await db.collection("memberships").doc(membershipId("user-a", orgA)).set({
        uid: "user-a",
        orgId: orgA,
        roles: ["employee"],
      });

      await db
        .collection("orgs")
        .doc(orgA)
        .collection("schedules")
        .doc("sched-a")
        .set({ orgId: orgA, name: "Schedule A" });

      await db
        .collection("orgs")
        .doc(orgB)
        .collection("schedules")
        .doc("sched-b")
        .set({ orgId: orgB, name: "Schedule B" });
    });
  });

  afterAll(async () => {
    await env.cleanup();
  });

  it("allows reads within same org", async () => {
    const db = ctxUser(env, "user-a", { orgId: orgA, roles: ["employee"] }).firestore();

    await assertSucceeds(db.collection("orgs").doc(orgA).get());
    await assertSucceeds(db.collection("orgs").doc(orgA).collection("schedules").doc("sched-a").get());
  });

  it("denies reads across org boundary", async () => {
    const db = ctxUser(env, "user-a", { orgId: orgA, roles: ["employee"] }).firestore();

    await assertFails(db.collection("orgs").doc(orgB).get());
    await assertFails(db.collection("orgs").doc(orgB).collection("schedules").doc("sched-b").get());
  });

  it("denies cross-tenant queries", async () => {
    const db = ctxUser(env, "user-a", { orgId: orgA, roles: ["employee"] }).firestore();

    // Listing another org's schedules collection should fail.
    await assertFails(db.collection("orgs").doc(orgB).collection("schedules").get());
  });
});
