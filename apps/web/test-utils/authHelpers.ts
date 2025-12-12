import { createMockRequest } from "@fresh-schedules/api-framework/testing";

export function createAuthenticatedMockRequest(path: string, options: any = {}) {
  const req = createMockRequest(path, {
    method: options.method ?? "POST",
    body: options.body ?? {},
    cookies: { ...(options.cookies ?? { session: "mock-session" }) },
    headers: {
      ...(options.headers ?? {
        cookie: "session=mock-session",
        authorization: "Bearer mock-token",
      }),
    },
    searchParams: { ...(options.searchParams ?? { orgId: "org-test" }) },
  });

  return req;
}
