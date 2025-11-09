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

/**
 * Generates a random CSRF token.
 *
 * @param {number} [length=32] - The length of the token in bytes.
 * @returns {string} The generated CSRF token.
 */
export function generateCSRFToken(length: number = 32): string {
  return randomBytes(length).toString("base64url");
}

/**
 * Verifies a CSRF token using a timing-safe comparison.
 *
 * @param {string} token1 - The first token.
 * @param {string} token2 - The second token.
 * @returns {boolean} `true` if the tokens match, otherwise `false`.
 */
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

/**
 * Extracts the CSRF token from the request headers.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {string} headerName - The name of the header containing the token.
 * @returns {string | null} The token, or `null` if not found.
 */
function extractTokenFromRequest(request: NextRequest, headerName: string): string | null {
  const headerToken = request.headers.get(headerName);
  if (headerToken) return headerToken;
  return null;
}

/**
 * Sets the CSRF token as a cookie in the response.
 *
 * @param {NextResponse} response - The Next.js response object.
 * @param {string} token - The CSRF token to set.
 * @param {Required<CSRFConfig>} [config=DEFAULT_CONFIG] - The CSRF configuration.
 */
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

/**
 * A middleware that provides CSRF protection for API routes.
 *
 * @template Ctx
 * @param {CSRFConfig} [config={}] - The CSRF configuration.
 * @returns {Function} A function that takes a handler and returns a new handler with CSRF protection.
 */
export function csrfProtection<Ctx extends Record<string, unknown> = {}>(config: CSRFConfig = {}) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  type C = Ctx & { params: Record<string, string> };
  return function (handler: (request: NextRequest, context: C) => Promise<NextResponse>) {
    return async (request: NextRequest, context: C): Promise<NextResponse> => {
      const method = request.method.toUpperCase();
      if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
        return handler(request, context);
      }

      const cookies = request.headers.get("cookie") || "";
      const cookieMatch = cookies.match(new RegExp(`${fullConfig.cookieName}=([^;]+)`));
      const cookieToken = cookieMatch?.[1];
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

/**
 * A middleware that ensures a CSRF token is set for the client.
 *
 * @template Ctx
 * @param {Function} handler - The route handler to wrap.
 * @param {CSRFConfig} [config={}] - The CSRF configuration.
 * @returns {Function} The wrapped route handler.
 */
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
    const cookies = request.headers.get("cookie") || "";
    const cookieMatch = cookies.match(new RegExp(`${fullConfig.cookieName}=([^;]+)`));
    let token = cookieMatch?.[1];
    if (!token) token = generateCSRFToken(fullConfig.tokenLength);
    const response = await handler(request, context);
    if (!cookieMatch?.[1]) {
      setCSRFCookie(response, token, fullConfig);
    }
    return response;
  };
}

export const verifyCsrf = verifyCSRFToken;
export const withCsrf = csrfProtection;
