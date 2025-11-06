// [P1][TEST][MIDDLEWARE] Middleware Spec middleware
// Tags: P1, TEST, MIDDLEWARE, TEST
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { middleware } from "../../middleware";

function req(path: string, cookie?: string) {
  return new NextRequest(`http://localhost${path}`, {
    headers: cookie ? ({ cookie } as HeadersInit) : undefined,
  });
}

describe("middleware", () => {
  it("exempts /auth/callback", () => {
    const res = middleware(req("/auth/callback"));
    expect(res).toBeTruthy(); // NextResponse.next()
  });

  it("blocks /dashboard without __session", () => {
    const res = middleware(req("/dashboard"));
    const location = res.headers.get("location");
    expect(location).toBeTruthy();
    expect(location).toContain("/login");
  });

  it("redirects /login to /dashboard if __session present", () => {
    const res = middleware(req("/login", "__session=x"));
    const location = res.headers.get("location");
    expect(location).toBeTruthy();
    expect(location).toContain("/dashboard");
  });
});
