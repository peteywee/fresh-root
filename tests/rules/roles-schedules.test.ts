import { beforeAll, afterAll, describe, it } from "vitest";
import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";

import { createRulesTestEnv, ctxUser, seed } from "./helpers";

describe("rules: role-based schedules/shifts", () => {
  let env: Awaited<ReturnType<typeof createRulesTestEnv>>;

  const orgId = "org-a";
  const scheduleId = "sched-1";
  const shiftId = "shift-1";

  beforeAll(async () => {
    env = await createRulesTestEnv();

    await seed(env, async (db) => {
      await db.collection("orgs").doc(orgId).set({ name: "Org A" });

      await db
        .collection("orgs")
        .doc(orgId)
        .collection("schedules")
        .doc(scheduleId)
        .set({ name: "Schedule", orgId });

      await db
        .collection("orgs")
        .doc(orgId)
        .collection("schedules")
        .doc(scheduleId)
        .collection("shifts")
        .doc(shiftId)
        .set({
          orgId,
          scheduleId,
          userId: "staff-1",
          notes: "init",
          checkInTime: null,
          updatedAt: 0,
          role: "employee",
        });
    });
  });

  afterAll(async () => {
    await env.cleanup();
  });

  it("employees can read schedules", async () => {
    const db = ctxUser(env, "staff-1", { orgId, roles: ["employee"] }).firestore();

    await assertSucceeds(db.collection("orgs").doc(orgId).collection("schedules").doc(scheduleId).get());
  });

  it("employees cannot create/update/delete schedules", async () => {
    const db = ctxUser(env, "staff-1", { orgId, roles: ["employee"] }).firestore();

    await assertFails(
      db.collection("orgs").doc(orgId).collection("schedules").doc("new-sched").set({ orgId, name: "X" }),
    );

    await assertFails(
      db.collection("orgs").doc(orgId).collection("schedules").doc(scheduleId).update({ name: "Nope" }),
    );

    await assertFails(db.collection("orgs").doc(orgId).collection("schedules").doc(scheduleId).delete());
  });

  it("managers can create/update/delete schedules", async () => {
    const db = ctxUser(env, "mgr-1", { orgId, roles: ["manager"] }).firestore();

    await assertSucceeds(
      db.collection("orgs").doc(orgId).collection("schedules").doc("mgr-sched").set({ orgId, name: "Mgr" }),
    );

    await assertSucceeds(
      db.collection("orgs").doc(orgId).collection("schedules").doc(scheduleId).update({ name: "Updated" }),
    );

    await assertSucceeds(db.collection("orgs").doc(orgId).collection("schedules").doc(scheduleId).delete());
  });

  it("staff can update their own shift with limited fields only", async () => {
    const db = ctxUser(env, "staff-1", { orgId, roles: ["employee"] }).firestore();

    // Allowed: notes only
    await assertSucceeds(
      db
        .collection("orgs")
        .doc(orgId)
        .collection("schedules")
        .doc(scheduleId)
        .collection("shifts")
        .doc(shiftId)
        .update({ notes: "updated", updatedAt: 1 }),
    );

    // Denied: attempt to change userId
    await assertFails(
      db
        .collection("orgs")
        .doc(orgId)
        .collection("schedules")
        .doc(scheduleId)
        .collection("shifts")
        .doc(shiftId)
        .update({ userId: "staff-2" }),
    );
  });

  it("staff cannot update someone else's shift", async () => {
    const db = ctxUser(env, "staff-2", { orgId, roles: ["employee"] }).firestore();

    await assertFails(
      db
        .collection("orgs")
        .doc(orgId)
        .collection("schedules")
        .doc(scheduleId)
        .collection("shifts")
        .doc(shiftId)
        .update({ notes: "nope" }),
    );
  });
});
