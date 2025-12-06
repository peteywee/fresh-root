// [P1][TEST][UNIT] eventLog smoke tests
// Tags: P1, TEST, UNIT
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("./firebase/typed-wrappers", () => ({
  setDocWithType: vi.fn(),
}));
import { setDocWithType } from "./firebase/typed-wrappers";
import { logEvent } from "./eventLog";

const makeAdminDb = () => {
  const ref = { id: "evt-1" };
  return {
    collection: () => ({
      doc: () => ref,
    }),
  } as const;
};

const validEvent = {
  at: Date.now(),
  category: "onboarding" as const,
  type: "network.created" as const,
  payload: { source: "test" },
};

describe("logEvent", () => {
  beforeEach(() => {
    setDocWithType.mockClear();
  });

  it("persists a validated event with typed wrapper", async () => {
    const adminDb = makeAdminDb();

    await logEvent(adminDb as any, validEvent);

    expect(setDocWithType).toHaveBeenCalledTimes(1);
    const [dbArg, refArg, dataArg] = setDocWithType.mock.calls[0];
    expect(dbArg).toBe(adminDb);
    expect(refArg).toHaveProperty("id", "evt-1");
    expect(dataArg).toMatchObject({ id: "evt-1", ...validEvent });
  });

  it("is a no-op when adminDb is missing", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await logEvent(undefined as any, validEvent);

    expect(setDocWithType).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
