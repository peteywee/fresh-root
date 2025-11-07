// [P0][AUTH][SESSION] Session Api Spec tests
// Tags: P0, AUTH, SESSION, TEST
import { NextRequest } from "next/server";
// If you have the `@` alias configured (Next.js tsconfig paths), this should work:
import { POST } from "@/api/session/route";
// If that import fails, replace the line above with the relative path, e.g.:
// import { POST } from "../../app/api/session/route";

describe("/api/session", () => {
  it("rejects missing idToken", async () => {
    // Build a NextRequest with an empty JSON body (no idToken)
    const req = new NextRequest("http://localhost/api/session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({}), // intentionally missing idToken
    });

    const res = await POST(req);

    // Should be a 400 Bad Request
    expect(res.status).toBe(400);

    const json = await res.json();

    // New error shape: error is an OBJECT, not a string
    expect(json.error).toBeDefined();
    expect(typeof json.error).toBe("object");

    // We only assert on the message so we don't depend on exact code structure
    // (e.g. whether you use BAD_REQUEST, MISSING_ID_TOKEN, etc.)
    expect(json.error.message).toMatch(/missing idtoken/i);
  });
});
