// [P1][TEST][TEST] Next Server tests
// Tags: P1, TEST, TEST
// Vitest shim for `next/server` used in unit tests.
export const NextResponse = {
  json: (body: any, init?: any) => ({
    status: init?.status ?? 200,
    json: async () => body,
  }),
};

export default { NextResponse };
