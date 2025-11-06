//[P1][API][TEST] CSRF protection middleware unit tests
// Tags: test, csrf, security, vitest

import { describe, it, expect } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { generateCSRFToken, verifyCSRFToken, csrfProtection } from "./csrf";

describe("generateCSRFToken", () => {
  it("should generate token of correct length", () => {
    const token = generateCSRFToken(32);
    const decoded = Buffer.from(token, "base64url");
    expect(decoded.length).toBe(32);
  });

  it("should generate unique tokens", () => {
    const token1 = generateCSRFToken();
    const token2 = generateCSRFToken();
    expect(token1).not.toBe(token2);
  });
});

describe("verifyCSRFToken", () => {
  it("should return true for matching tokens", () => {
    const token = generateCSRFToken();
    expect(verifyCSRFToken(token, token)).toBe(true);
  });

  it("should return false for different tokens", () => {
    const token1 = generateCSRFToken();
    const token2 = generateCSRFToken();
    expect(verifyCSRFToken(token1, token2)).toBe(false);
  });

  it("should return false for empty tokens", () => {
    expect(verifyCSRFToken("", "")).toBe(false);
    expect(verifyCSRFToken("token", "")).toBe(false);
    expect(verifyCSRFToken("", "token")).toBe(false);
  });

  it("should return false for tokens of different lengths", () => {
    expect(verifyCSRFToken("short", "muchchchchlonger")).toBe(false);
  });
});

describe("csrfProtection", () => {
  it("should allow GET requests without CSRF token", async () => {
    const handler = csrfProtection()(async () => {
      return NextResponse.json({ success: true });
    });

    const request = new NextRequest("http://localhost/api/test", {
      method: "GET",
    });

    const response = await handler(request, { params: {} });
    expect(response.status).toBe(200);
  });

  it("should allow HEAD requests without CSRF token", async () => {
    const handler = csrfProtection()(async () => {
      return NextResponse.json({ success: true });
    });

    const request = new NextRequest("http://localhost/api/test", {
      method: "HEAD",
    });

    const response = await handler(request, { params: {} });
    expect(response.status).toBe(200);
  });

  it("should reject POST without CSRF cookie", async () => {
    const handler = csrfProtection()(async () => {
      return NextResponse.json({ success: true });
    });

    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
    });

    const response = await handler(request, { params: {} });
    expect(response.status).toBe(403);

    const body = await response.json();
    expect(body.error).toContain("CSRF token missing from cookie");
  });

  it("should reject POST without CSRF header", async () => {
    const token = generateCSRFToken();
    const handler = csrfProtection()(async () => {
      return NextResponse.json({ success: true });
    });

    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: {
        cookie: `csrf-token=${token}`,
      },
    });

    const response = await handler(request, { params: {} });
    expect(response.status).toBe(403);

    const body = await response.json();
    expect(body.error).toContain("CSRF token missing from");
  });

  it("should reject POST with mismatched CSRF tokens", async () => {
    const cookieToken = generateCSRFToken();
    const headerToken = generateCSRFToken();

    const handler = csrfProtection()(async () => {
      return NextResponse.json({ success: true });
    });

    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: {
        cookie: `csrf-token=${cookieToken}`,
        "x-csrf-token": headerToken,
      },
    });

    const response = await handler(request, { params: {} });
    expect(response.status).toBe(403);

    const body = await response.json();
    expect(body.error).toContain("CSRF token mismatch");
  });

  it("should allow POST with matching CSRF tokens", async () => {
    const token = generateCSRFToken();

    const handler = csrfProtection()(async () => {
      return NextResponse.json({ success: true });
    });

    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: {
        cookie: `csrf-token=${token}`,
        "x-csrf-token": token,
      },
    });

    const response = await handler(request, { params: {} });
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("should protect PUT requests", async () => {
    const token = generateCSRFToken();

    const handler = csrfProtection()(async () => {
      return NextResponse.json({ success: true });
    });

    const request = new NextRequest("http://localhost/api/test", {
      method: "PUT",
      headers: {
        cookie: `csrf-token=${token}`,
        "x-csrf-token": token,
      },
    });

    const response = await handler(request, { params: {} });
    expect(response.status).toBe(200);
  });

  it("should protect DELETE requests", async () => {
    const token = generateCSRFToken();

    const handler = csrfProtection()(async () => {
      return NextResponse.json({ success: true });
    });

    const request = new NextRequest("http://localhost/api/test", {
      method: "DELETE",
      headers: {
        cookie: `csrf-token=${token}`,
        "x-csrf-token": token,
      },
    });

    const response = await handler(request, { params: {} });
    expect(response.status).toBe(200);
  });

  it("should use custom cookie and header names", async () => {
    const token = generateCSRFToken();

    const handler = csrfProtection({
      cookieName: "custom-csrf",
      headerName: "x-custom-csrf",
    })(async () => {
      return NextResponse.json({ success: true });
    });

    const request = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: {
        cookie: `custom-csrf=${token}`,
        "x-custom-csrf": token,
      },
    });

    const response = await handler(request, { params: {} });
    expect(response.status).toBe(200);
  });
});
