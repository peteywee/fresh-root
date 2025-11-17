// [P0][TEST][TEST] FirestoreMock tests
// Tags: P0, TEST, TEST
import { vi } from "vitest";

type AdminDbMock = any;

export function createAdminDbMock(): AdminDbMock {
  const formsDoc = {
    get: vi.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
    update: vi.fn().mockResolvedValue(undefined),
  };

  const complianceFormsCollection = {
    doc: vi.fn().mockImplementation((token: string) => ({ get: formsDoc.get })),
  };

  const complianceDoc = {
    collection: vi.fn().mockReturnValue(complianceFormsCollection),
  };

  const adminDb = {
    collection: vi.fn().mockImplementation((name: string) => {
      if (name === "compliance") return { doc: vi.fn().mockReturnValue(complianceDoc) };

      return {
        doc: vi.fn().mockReturnValue({
          id: `${name}-stub-id`,
          set: vi.fn().mockResolvedValue(undefined),
          get: vi.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
          collection: vi.fn().mockReturnValue({
            doc: vi.fn().mockReturnValue({
              set: vi.fn().mockResolvedValue(undefined),
              id: `${name}-subdoc-id`,
            }),
          }),
        }),
        add: vi.fn().mockResolvedValue({ id: `${name}-add-id` }),
      };
    }),
    batch: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        batch: {
          set: vi.fn(),
          commit: vi.fn().mockResolvedValue(undefined),
        },
      }),
      commit: vi.fn().mockResolvedValue(undefined),
    }),
    runTransaction: vi.fn().mockImplementation(async (cb: any) => {
      const tx = {
        set: vi.fn(),
        update: vi.fn(),
      } as any;
      await cb(tx);
      return Promise.resolve();
    }),
  } as any;

  return adminDb;
}

export function createMockReq(): any {
  return {
    json: vi.fn(),
    user: {
      uid: "test-uid-123",
      customClaims: {
        email: "corporate-admin@example.com",
        email_verified: true,
        selfDeclaredRole: "owner_founder_director",
      },
    },
  } as any;
}

export default {
  createAdminDbMock,
  createMockReq,
};
