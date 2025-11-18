// [P0][TEST][TEST] CreateNetworkOrg Test tests
// Tags: P0, TEST, TEST
 
import { describe, it, expect, vi } from "vitest";

// Prevent the real firebase-admin from being imported in tests (it prints a
// warning when loaded in non-server environments). Mock the project's
// firebase.server wrapper so tests can run cleanly.
vi.mock("@/src/lib/firebase.server", () => {
  return {
    adminDb: undefined,
    adminSdk: {
      firestore: {
        Timestamp: {
          now: () => ({ toDate: () => new Date(), toMillis: () => Date.now() }),
        },
      },
    },
  };
});

import { createNetworkWithOrgAndVenue } from "./createNetworkOrg";

// Mock the local adminFormDrafts module used by createNetworkWithOrgAndVenue
vi.mock("./adminFormDrafts", () => {
  return {
    loadAdminFormDraft: async (token: string) => {
      // return a valid draft for tests
      return {
        id: token,
        userId: "admin-uid",
        payload: {
          data: { legalName: "Test Legal" },
        },
        ipAddress: "127.0.0.1",
        userAgent: "vitest",
      };
    },
    markAdminFormDraftConsumed: async () => {
      /* no-op in tests */
    },
  };
});

// Minimal fake Firestore that implements the subset used by the helper
function makeFakeFirestore() {
  let idCounter = 1;
  return {
    collection(_name: string) {
      return {
        doc(id?: string) {
          const docId = id ?? `doc_${idCounter++}`;
          const ref = {
            id: docId,
            collection(sub: string) {
              return {
                doc: (subId?: string) => ({ id: subId ?? `${docId}_${sub}_${idCounter++}` }),
              };
            },
          };
          return ref;
        },
      };
    },
    batch() {
      const ops: Array<unknown> = [];
      return {
        set(ref: unknown, data: unknown) {
          (ops as Array<any>).push({ op: "set", ref, data });
        },
        commit() {
          return Promise.resolve(ops);
        },
      };
    },
  };
}

describe("createNetworkWithOrgAndVenue (helper)", () => {
  it("creates network/org/venue and returns ids", async () => {
    const fakeDb = makeFakeFirestore() as unknown as any;

    const payload = {
      basics: { orgName: "Test Org", hasCorporateAboveYou: false, segment: "restaurant" },
      venue: { venueName: "Main Venue", timeZone: "UTC" },
      formToken: "token-123",
    } as any;

    const result = await createNetworkWithOrgAndVenue("admin-uid", payload, fakeDb);

    expect(result).toBeDefined();
    expect(typeof result.networkId).toBe("string");
    expect(typeof result.orgId).toBe("string");
    expect(typeof result.venueId).toBe("string");
    expect(result.status).toBe("pending_verification");
  });
});
