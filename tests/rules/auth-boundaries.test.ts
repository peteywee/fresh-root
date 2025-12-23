// [P0][TEST][RULES] Auth boundary tests for firestore.rules
// Tags: P0, TEST, RULES, AUTH, BOUNDARIES, SECURITY
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";

import { createRulesTestEnv, ctxUnauth, ctxUser, seed, cleanup, membershipId } from "./helpers";
import type { RulesTestEnvironment } from "@firebase/rules-unit-testing";

describe("rules: auth boundaries", () => {
  const orgId = "org-a";
  let env: RulesTestEnvironment;

  beforeAll(async () => {
    env = await createRulesTestEnv();
  });

  beforeEach(async () => {
    await env.clearFirestore();
    await seed(env, async (db) => {
      // Seed org documents
      await db.collection("orgs").doc(orgId).set({ name: "Org A" });
      await db.collection("organizations").doc(orgId).set({ name: "Org A" });
      // Seed user documents
      await db.collection("users").doc("user-a").set({ displayName: "User A", email: "a@example.com" });
      await db.collection("users").doc("user-b").set({ displayName: "User B", email: "b@example.com" });
    });
  });

  afterAll(async () => {
    await cleanup(env);
  });

  describe("unauthenticated access denied", () => {
    it("denies unauthenticated reads on /users collection", async () => {
      const anon = ctxUnauth(env).firestore();
      await assertFails(anon.collection("users").doc("user-a").get());
    });

    it("denies unauthenticated reads on /orgs collection", async () => {
      const anon = ctxUnauth(env).firestore();
      await assertFails(anon.collection("orgs").doc(orgId).get());
    });

    it("denies unauthenticated reads on /organizations collection", async () => {
      const anon = ctxUnauth(env).firestore();
      await assertFails(anon.collection("organizations").doc(orgId).get());
    });

    it("denies unauthenticated writes everywhere", async () => {
      const anon = ctxUnauth(env).firestore();
      await assertFails(anon.collection("users").doc("anon-user").set({ name: "Hacker" }));
      await assertFails(anon.collection("orgs").doc("hacked-org").set({ name: "Hacked" }));
    });
  });

  describe("authenticated user self-access", () => {
    it("allows authenticated user to read their own /users/{uid} doc", async () => {
      const user = ctxUser(env, "user-a", { orgId, roles: ["employee"] }).firestore();
      await assertSucceeds(user.collection("users").doc("user-a").get());
    });

    it("denies authenticated user from reading another user's doc", async () => {
      const user = ctxUser(env, "user-a", { orgId, roles: ["employee"] }).firestore();
      await assertFails(user.collection("users").doc("user-b").get());
    });

    it("allows authenticated user to create their own user doc", async () => {
      const user = ctxUser(env, "new-user", { orgId, roles: ["employee"] }).firestore();
      await assertSucceeds(
        user.collection("users").doc("new-user").set({ displayName: "New User" })
      );
    });

    it("denies authenticated user from creating another user's doc", async () => {
      const user = ctxUser(env, "user-a", { orgId, roles: ["employee"] }).firestore();
      await assertFails(
        user.collection("users").doc("impersonated").set({ displayName: "Impersonated" })
      );
    });
  });

  describe("collection enumeration protection", () => {
    it("denies listing /users collection (enumeration protection)", async () => {
      const user = ctxUser(env, "user-a", { orgId, roles: ["employee"] }).firestore();
      await assertFails(user.collection("users").get());
    });

    it("denies listing /orgs collection", async () => {
      const user = ctxUser(env, "user-a", { orgId, roles: ["employee"] }).firestore();
      await assertFails(user.collection("orgs").get());
    });

    it("denies listing /organizations collection", async () => {
      const user = ctxUser(env, "user-a", { orgId, roles: ["employee"] }).firestore();
      await assertFails(user.collection("organizations").get());
    });

    it("denies listing /memberships collection", async () => {
      const user = ctxUser(env, "user-a", { orgId, roles: ["employee"] }).firestore();
      await assertFails(user.collection("memberships").get());
    });
  });

  describe("org access requires membership or sameOrg", () => {
    it("allows org member (via token) to read their org doc", async () => {
      const user = ctxUser(env, "user-a", { orgId, roles: ["employee"] }).firestore();
      await assertSucceeds(user.collection("orgs").doc(orgId).get());
    });

    it("denies user with different orgId from reading org doc (without membership)", async () => {
      const user = ctxUser(env, "user-a", { orgId: "org-other", roles: ["employee"] }).firestore();
      await assertFails(user.collection("orgs").doc(orgId).get());
    });

    it("allows legacy membership-based access when membership doc exists", async () => {
      // Seed a membership doc for user in org-a
      await seed(env, async (db) => {
        await db.collection("memberships").doc(membershipId("legacy-user", orgId)).set({
          uid: "legacy-user",
          orgId: orgId,
          roles: ["employee"],
        });
      });

      // User without orgId token but with membership doc
      const user = ctxUser(env, "legacy-user", {}).firestore();
      await assertSucceeds(user.collection("orgs").doc(orgId).get());
    });
  });
});
