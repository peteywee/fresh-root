//[P1][API][SECURITY] CSRF protection middleware
// Tags: csrf, security, double-submit-cookie

import { randomBytes, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export interface CSRFConfig {
  cookieName?: string;
  headerName?: string;
  tokenLength?: number;
  cookieOptions?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
    maxAge?: number;
  };
}

const DEFAULT_CONFIG: Required<CSRFConfig> = {
  cookieName: "csrf-token",
  headerName: "x-csrf-token",
  tokenLength: 32,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 86400,
  },
};

export function generateCSRFToken(length: number = 32): string {
  return randomBytes(length).toString("base64url");
}

export function verifyCSRFToken(token1: string, token2: string): boolean {
  if (!token1 || !token2 || token1.length !== token2.length) return false;
  try {
    const buffer1 = Buffer.from(token1);
    const buffer2 = Buffer.from(token2);
    return timingSafeEqual(buffer1, buffer2);
  } catch {
    return false;
  }
}

function extractTokenFromRequest(request: NextRequest, headerName: string): string | null {
  const headerToken = request.headers.get(headerName);
  if (headerToken) return headerToken;
  return null;
}

export function setCSRFCookie(
  response: NextResponse,
  token: string,
  config: Required<CSRFConfig> = DEFAULT_CONFIG,
): void {
  const { cookieName, cookieOptions } = config;
  const cookieValue = [
    `${cookieName}=${token}`,
    `Path=/`,
    `Max-Age=${cookieOptions.maxAge}`,
    `SameSite=${cookieOptions.sameSite}`,
    cookieOptions.httpOnly ? "HttpOnly" : "",
    cookieOptions.secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  response.headers.set("Set-Cookie", cookieValue);
}

export function csrfProtection<Ctx extends Record<string, unknown> = {}>(config: CSRFConfig = {}) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  type C = Ctx & { params: Record<string, string> };
  return function (handler: (request: NextRequest, context: C) => Promise<NextResponse>) {
    return async (request: NextRequest, context: C): Promise<NextResponse> => {
      const method = request.method.toUpperCase();
      if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
        return handler(request, context);
      }

      // Prefer parsing the Cookie header first (unit tests typically set this),
      // then fall back to the NextRequest cookies API when available.
      let cookieToken: string | undefined | null = null;
      try {
        const cookiesHeader = request.headers.get("cookie") || "";
        const cookieMatch = cookiesHeader.match(new RegExp(`${fullConfig.cookieName}=([^;]+)`));
        cookieToken = cookieMatch?.[1] ?? null;

        if (!cookieToken) {
          // Some runtimes expose a cookies.get(name) method on the request
          type MaybeCookies =
            | {
                get?: (name: string) => { value?: string } | undefined;
                // Internal runtimes may expose internal header storage; allow unknown here
                _headers?: Record<PropertyKey, unknown>;
              }
            | undefined;
          const maybeCookies = (request as unknown as { cookies?: MaybeCookies }).cookies;
          if (maybeCookies && typeof maybeCookies.get === "function") {
            const val = maybeCookies.get(fullConfig.cookieName);
            cookieToken = val?.value ?? null;
          }
        }
      } catch (_err) {
        const cookies = request.headers.get("cookie") || "";
        const cookieMatch = cookies.match(new RegExp(`${fullConfig.cookieName}=([^;]+)`));
        cookieToken = cookieMatch?.[1] ?? null;
      }
      // Extra fallback: some runtimes keep cookie data in internal headers structures
      // that aren't exposed via the public API. Try to inspect internal _headers
      // presence on the request.cookies object and look for the cookie name.
      if (!cookieToken) {
        try {
          type MaybeCookies =
            | {
                get?: (name: string) => { value?: string } | undefined;
                _headers?: Record<PropertyKey, unknown>;
              }
            | undefined;
          const maybeCookies = (request as unknown as { cookies?: MaybeCookies }).cookies;
          if (maybeCookies && maybeCookies._headers) {
            const headersStore = maybeCookies._headers as Record<PropertyKey, unknown>;
            const syms = Object.getOwnPropertySymbols(headersStore || {});
            for (const s of syms) {
              const raw = headersStore[s];
              if (!raw || typeof raw !== "object") continue;

              // Try common string form first
              try {
                const asRecord = raw as Record<string, unknown>;
                const possible =
                  asRecord[fullConfig.cookieName] || asRecord[fullConfig.cookieName.toLowerCase()];
                if (possible) {
                  let derived: string | null = null;
                  if (typeof possible === "string") derived = possible;
                  else if (
                    possible &&
                    typeof (possible as { value?: unknown }).value !== "undefined"
                  )
                    derived = String((possible as { value?: unknown }).value);
                  if (derived) {
                    const m = derived.match(new RegExp(`${fullConfig.cookieName}=([^;]+)`));
                    cookieToken = m ? m[1] : derived;
                    if (cookieToken) break;
                  }
                }

                // Search stringy entries on the object
                for (const k of Object.keys(asRecord)) {
                  const v = asRecord[k];
                  if (typeof v === "string") {
                    const m = v.match(new RegExp(`${fullConfig.cookieName}=([^;]+)`));
                    if (m) {
                      cookieToken = m[1];
                      break;
                    }
                  } else if (v && typeof v === "object") {
                    const candidate =
                      (v as { value?: unknown }).value ??
                      (v as { toString?: () => string }).toString?.();
                    if (candidate && typeof candidate === "string") {
                      const m = candidate.match(new RegExp(`${fullConfig.cookieName}=([^;]+)`));
                      if (m) {
                        cookieToken = m[1];
                        break;
                      }
                    }
                  }
                }
                if (cookieToken) break;
              } catch (_perEntry) {
                // best-effort; ignore per-entry errors
              }
            }
          }
        } catch (_e) {
          /* best-effort fallback, ignore errors */
        }
      }
      if (!cookieToken) {
        return NextResponse.json(
          { error: "Forbidden - CSRF token missing from cookie", code: "CSRF_COOKIE_MISSING" },
          { status: 403 },
        );
      }

      const requestToken = extractTokenFromRequest(request, fullConfig.headerName);
      if (!requestToken) {
        return NextResponse.json(
          {
            error: `Forbidden - CSRF token missing from ${fullConfig.headerName} header`,
            code: "CSRF_HEADER_MISSING",
          },
          { status: 403 },
        );
      }

      if (!verifyCSRFToken(cookieToken, requestToken)) {
        return NextResponse.json(
          { error: "Forbidden - CSRF token mismatch", code: "CSRF_TOKEN_INVALID" },
          { status: 403 },
        );
      }

      return handler(request, context);
    };
  };
}

export function withCSRFToken<Ctx extends Record<string, unknown> = {}>(
  handler: (
    request: NextRequest,
    context: Ctx & { params: Record<string, string> },
  ) => Promise<NextResponse>,
  config: CSRFConfig = {},
): (
  request: NextRequest,
  context: Ctx & { params: Record<string, string> },
) => Promise<NextResponse> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  return async (
    request: NextRequest,
    context: Ctx & { params: Record<string, string> },
  ): Promise<NextResponse> => {
    // Prefer cookies API when available
    let token: string | undefined | null = null;
    try {
      const cookiesHeader = request.headers.get("cookie") || "";
      const cookieMatch = cookiesHeader.match(new RegExp(`${fullConfig.cookieName}=([^;]+)`));
      token = cookieMatch?.[1] ?? null;

      if (!token) {
        type MaybeCookies =
          | {
              get?: (name: string) => { value?: string } | undefined;
              _headers?: Record<PropertyKey, unknown>;
            }
          | undefined;
        const maybeCookies = (request as unknown as { cookies?: MaybeCookies }).cookies;
        if (maybeCookies && typeof maybeCookies.get === "function") {
          const val = maybeCookies.get(fullConfig.cookieName);
          token = val?.value ?? null;
        }
      }
    } catch {
      const cookies = request.headers.get("cookie") || "";
      const cookieMatch = cookies.match(new RegExp(`${fullConfig.cookieName}=([^;]+)`));
      token = cookieMatch?.[1] ?? null;
    }
    const hadCookie = token != null;
    if (!token) token = generateCSRFToken(fullConfig.tokenLength);
    const response = await handler(request, context);
    if (!hadCookie) {
      setCSRFCookie(response, token, fullConfig);
    }
    return response;
  };
}

export const verifyCsrf = verifyCSRFToken;
export const withCsrf = csrfProtection;
