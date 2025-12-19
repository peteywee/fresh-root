// [P1][TEST][UNIT] createNetworkWithOrgAndVenue helper
// Tags: P1, TEST, UNIT

import { beforeEach, describe, expect, it, vi } from "vitest";

type Stored = Record<string, any>;
const store = new Map<string, Stored>();

function makeDocRef(path: string) {
  return {
    id: path.split("/").pop() as string,
    path,
    collection: (name: string) => ({
      doc: (id?: string) =>
        makeDocRef(`${path}/${name}/${id || Math.random().toString(36).slice(2)}`),
    }),
  };
}

function makeDb() {
  return {
    collection: (name: string) => ({
      doc: (id?: string) => makeDocRef(`${name}/${id || Math.random().toString(36).slice(2)}`),
    }),
    batch: () => {
      const ops: { type: string; ref: any; data?: any }[] = [];
      return {
        set: (ref: any, data: any) => ops.push({ type: "set", ref, data }),
        update: (ref: any, data: any) => ops.push({ type: "update", ref, data }),
        delete: (ref: any) => ops.push({ type: "delete", ref }),
        commit: async () => {
          for (const op of ops) {
            if (op.type === "set") {
              store.set(op.ref.path, { ...op.data });
            } else if (op.type === "update") {
              store.set(op.ref.path, { ...(store.get(op.ref.path) || {}), ...op.data });
            } else if (op.type === "delete") {
              store.delete(op.ref.path);
            }
          }
        },
      };
    },
  };
}

const { mockConsume, mockGetDraft } = vi.hoisted(() => ({
  mockConsume: vi.fn(),
  mockGetDraft: vi.fn(),
}));

vi.mock("../../apps/web/src/lib/onboarding/adminFormDrafts", () => ({
  consumeAdminFormDraft: mockConsume,
  getAdminFormDraft: mockGetDraft,
}));

import { createNetworkWithOrgAndVenue } from "../../apps/web/src/lib/onboarding/createNetworkOrg";

const payload = {
  basics: {
    orgName: "Test Org",
    hasCorporateAboveYou: false,
    segment: "hospitality",
  },
  venue: {
    venueName: "Main Venue",
    timeZone: "America/Chicago",
  },
  formToken: "token-123",
};

describe("createNetworkWithOrgAndVenue", () => {
  beforeEach(() => {
    store.clear();
    mockConsume.mockReset();
    mockGetDraft.mockReset();
  });

  it("creates network, org, venue, membership and consumes draft", async () => {
    mockGetDraft.mockResolvedValue({
      userId: "admin-1",
      form: { data: { legalName: "Legal Name LLC" } },
    });
    mockConsume.mockResolvedValue(undefined);

    const db = makeDb();
    const result = await createNetworkWithOrgAndVenue("admin-1", payload, db as any);

    expect(result.status).toBe("pending_verification");
    expect(mockConsume).toHaveBeenCalledWith({ formToken: "token-123", expectedUserId: "admin-1" });

    const networkPath = Array.from(store.keys()).find((k) => k.startsWith("networks/"));
    expect(networkPath).toBeDefined();
    const network = networkPath ? store.get(networkPath) : null;
    expect(network?.displayName).toBe("Test Org");
    expect(network?.legalName).toBe("Legal Name LLC");

    const membershipPath = Array.from(store.keys()).find((k) => k.includes("/memberships/"));
    expect(membershipPath).toBeDefined();
    const membership = membershipPath ? store.get(membershipPath) : null;
    expect(membership?.roles).toContain("network_owner");
  });

  it("rejects when draft ownership mismatches", async () => {
    mockGetDraft.mockResolvedValue({ userId: "other-user", form: { data: {} } });
    mockConsume.mockResolvedValue(undefined);

    const db = makeDb();

    await expect(createNetworkWithOrgAndVenue("admin-1", payload, db as any)).rejects.toThrow(
      "admin_form_ownership_mismatch",
    );

    expect(mockConsume).not.toHaveBeenCalled();
    expect(store.size).toBe(0);
  });
});
