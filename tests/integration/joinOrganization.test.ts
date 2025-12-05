// [P1][TEST][INTEGRATION] joinOrganization Cloud Function
// Tags: P1, TEST, INTEGRATION

import { describe, it, expect } from "vitest";
import * as admin from "firebase-admin";
import {
  createTestOrg,
  createTestJoinToken,
  createTestUser,
  getFirestoreDoc,
} from "../integration/setup";

// Import handler for direct invocation.
import { joinOrganizationHandler } from "../../functions/src/joinOrganization";

describe("joinOrganization - integration", () => {
  it("creates a new auth user, membership and updates token on success", async () => {
    const orgId = await createTestOrg();
    const tokenId = await createTestJoinToken(orgId, { maxUses: 1 });

    const email = `join-test-${Date.now()}@example.com`;

    const result = await joinOrganizationHandler({
      data: {
        token: tokenId,
        email,
        password: "test-password-123",
        displayName: "Join Test User",
      },
      // emulate unauthenticated call
      auth: undefined,
    });

    expect(result.success).toBe(true);
    expect(result.userId).toBeDefined();
    expect(result.membershipId).toBeDefined();
    expect(result.orgId).toBe(orgId);

    const membership = await getFirestoreDoc(`memberships/${result.membershipId}`);
    expect(membership).toBeTruthy();
    expect(membership.uid).toBe(result.userId);
    expect(membership.orgId).toBe(orgId);

    const token = await getFirestoreDoc(`join_tokens/${tokenId}`);
    expect(token).toBeTruthy();
    expect(token.currentUses).toBe(1);

    // Profile created for new user
    const profile = await getFirestoreDoc(`users/${result.userId}`);
    expect(profile).toBeTruthy();
    expect(profile.email).toBe(email);
  });

  it("returns existing membership on repeated call (idempotent)", async () => {
    const orgId = await createTestOrg();
    const tokenId = await createTestJoinToken(orgId, { maxUses: 2 });

    const email = `join-test-${Date.now()}@example.com`;

    const result1 = await joinOrganizationHandler({
      data: { token: tokenId, email, password: "test-password-123", displayName: "Join Test User" },
      auth: undefined,
    });

    expect(result1.success).toBe(true);
    const result2 = await joinOrganizationHandler({
      data: { token: tokenId, email, password: "test-password-123", displayName: "Join Test User" },
      auth: undefined,
    });

    expect(result2.success).toBe(true);
    // Should return the same membership id
    expect(result2.membershipId).toBe(result1.membershipId);

    const token = await getFirestoreDoc(`join_tokens/${tokenId}`);
    expect(token.currentUses).toBe(2);
  });
});
