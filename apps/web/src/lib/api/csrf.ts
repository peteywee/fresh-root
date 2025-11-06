//[P1][API][SECURITY] CSRF protection middleware
// Tags: csrf, security, double-submit-cookie, state-changing-operations

import { randomBytes, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * CSRF token configuration
 */
export interface CSRFConfig {
  /** Cookie name for CSRF token */
  cookieName?: string;
  /** Header name for CSRF token */
  headerName?: string;
  /** Token length in bytes */
  tokenLength?: number;
  /** Cookie options */
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
    maxAge: 86400, // 24 hours
  },
};

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(length: number = 32): string {
  return randomBytes(length).toString("base64url");
}

/**
 * Verify CSRF token using timing-safe comparison
 */
export function verifyCSRFToken(token1: string, token2: string): boolean {
  if (!token1 || !token2 || token1.length !== token2.length) {
    return false;
  }

  try {
    const buffer1 = Buffer.from(token1);
    const buffer2 = Buffer.from(token2);
    return timingSafeEqual(buffer1, buffer2);
  } catch {
    return false;
  }
}

/**
 * Extract CSRF token from request (header or body)
 */
function extractTokenFromRequest(request: NextRequest, headerName: string): string | null {
  // Try header first
  const headerToken = request.headers.get(headerName);
  if (headerToken) return headerToken;

  // For form submissions, token might be in body
  // (This would require parsing the body, which we avoid in middleware)
  return null;
}

/**
 * Set CSRF cookie in response
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
 * CSRF protection middleware
 * Protects state-changing operations (POST, PUT, PATCH, DELETE)
 */
export function csrfProtection(config: CSRFConfig = {}) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  return function (
    handler: (
      request: NextRequest,
      context: { params: Record<string, string> },
    ) => Promise<NextResponse>,
  ) {
    return async (
      request: NextRequest,
      context: { params: Record<string, string> },
    ): Promise<NextResponse> => {
      const method = request.method.toUpperCase();

      // Only protect state-changing methods
      if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
        return handler(request, context);
      }

      // Get token from cookie
      const cookies = request.headers.get("cookie") || "";
      const cookieMatch = cookies.match(new RegExp(`${fullConfig.cookieName}=([^;]+)`));
      const cookieToken = cookieMatch?.[1];

      if (!cookieToken) {
        return NextResponse.json(
          {
            error: "Forbidden - CSRF token missing from cookie",
            code: "CSRF_COOKIE_MISSING",
          },
          { status: 403 },
        );
      }

      // Get token from request (header or body)
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

      // Verify tokens match (timing-safe comparison)
      if (!verifyCSRFToken(cookieToken, requestToken)) {
        return NextResponse.json(
          {
            error: "Forbidden - CSRF token mismatch",
            code: "CSRF_TOKEN_INVALID",
          },
          { status: 403 },
        );
      }

      // Token valid, proceed with handler
      return handler(request, context);
    };
  };
}

/**
 * Helper: Generate and set CSRF token for GET requests
 * Use this for endpoints that return forms or pages with state-changing actions
 */
export function withCSRFToken(
  handler: (
    request: NextRequest,
    context: { params: Record<string, string> },
  ) => Promise<NextResponse>,
  config: CSRFConfig = {},
): (request: NextRequest, context: { params: Record<string, string> }) => Promise<NextResponse> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  return async (
    request: NextRequest,
    context: { params: Record<string, string> },
  ): Promise<NextResponse> => {
    // Check if token already exists in cookie
    const cookies = request.headers.get("cookie") || "";
    const cookieMatch = cookies.match(new RegExp(`${fullConfig.cookieName}=([^;]+)`));
    let token = cookieMatch?.[1];

    // Generate new token if none exists
    if (!token) {
      token = generateCSRFToken(fullConfig.tokenLength);
    }

    // Call handler
    const response = await handler(request, context);

    // Set token in cookie if it was generated
    if (!cookieMatch?.[1]) {
      setCSRFCookie(response, token, fullConfig);
    }

    // Also include token in response body for client-side use
    // (Clients should send this in the x-csrf-token header)
    if (response.headers.get("content-type")?.includes("application/json")) {
      try {
        const body = await response.json();
        return NextResponse.json(
          { ...body, csrfToken: token },
          { status: response.status, headers: response.headers },
        );
      } catch {
        // If response is not JSON, just return as-is
        return response;
      }
    }

    return response;
  };
}

/**
 * Middleware: Skip CSRF check for specific conditions
 * Useful for API endpoints that use other auth mechanisms (e.g., API keys)
 */
export function skipCSRFIf(
  condition: (request: NextRequest) => boolean,
  protectedHandler: ReturnType<typeof csrfProtection>,
) {
  return function (
    handler: (
      request: NextRequest,
      context: { params: Record<string, string> },
    ) => Promise<NextResponse>,
  ) {
    return async (
      request: NextRequest,
      context: { params: Record<string, string> },
    ): Promise<NextResponse> => {
      if (condition(request)) {
        return handler(request, context);
      }
      return protectedHandler(handler)(request, context);
    };
  };
}
