// [P1][TEST][UNIT] userProfile smoke tests
// Tags: P1, TEST, UNIT
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./firebase/typed-wrappers", () => ({
  getDocWithType: vi.fn(),
  setDocWithType: vi.fn(),
}));
import { getDocWithType, setDocWithType } from "./firebase/typed-wrappers";
import { ensureUserProfile, type AuthUserClaims } from "./userProfile";

const makeAdminDb = () => ({
  collection: () => ({
    doc: (id: string) => ({ id }),
  }),
});

const baseClaims: AuthUserClaims = {
  email: "user@example.com",
  displayName: "User One",
  picture: "https://example.com/avatar.png",
};

describe("ensureUserProfile", () => {
  beforeEach(() => {
    getDocWithType.mockReset();
    setDocWithType.mockReset();
  });

  it("creates a profile when missing", async () => {
    getDocWithType.mockResolvedValueOnce(null);
    const adminDb = makeAdminDb();

    await ensureUserProfile({ adminDb: adminDb as any, uid: "u-1", claims: baseClaims });

    expect(setDocWithType).toHaveBeenCalledTimes(1);
    const [dbArg, refArg, dataArg] = setDocWithType.mock.calls[0];
    expect(dbArg).toBe(adminDb);
    expect(refArg).toHaveProperty("id", "u-1");
    expect(dataArg).toMatchObject({
      id: "u-1",
      profile: {
        email: "user@example.com",
        displayName: "User One",
        avatarUrl: "https://example.com/avatar.png",
        selfDeclaredRole: null,
      },
      onboarding: expect.any(Object),
    });
  });

  it("merges profile updates when doc exists", async () => {
    getDocWithType.mockResolvedValueOnce({
      id: "u-2",
      createdAt: 123,
      updatedAt: 123,
      profile: { email: "old@example.com", displayName: "Old Name", avatarUrl: null },
      onboarding: { status: "in_progress", stage: "profile", intent: null, lastUpdatedAt: 123 },
    });

    const adminDb = makeAdminDb();

    await ensureUserProfile({
      adminDb: adminDb as any,
      uid: "u-2",
      claims: { ...baseClaims, displayName: "New Name", email: "new@example.com" },
    });

    expect(setDocWithType).toHaveBeenCalledTimes(1);
    const [dbArg, refArg, dataArg, options] = setDocWithType.mock.calls[0];
    expect(dbArg).toBe(adminDb);
    expect(refArg).toHaveProperty("id", "u-2");
    expect(dataArg.profile.displayName).toBe("New Name");
    expect(dataArg.profile.email).toBe("new@example.com");
    expect(options).toEqual({ merge: true });
  });
});
