// [P1][INTEGRITY][VALIDATION] Validation
// Tags: P1, INTEGRITY, VALIDATION
import { NextResponse } from "next/server";

/** Standard API error payload shape */
export type ApiError = {
  error: { code: string; message: string; details?: unknown };
};

/** Build a 400 error response with consistent shape */
export function badRequest(message: string, details?: unknown, code = "BAD_REQUEST") {
  return NextResponse.json({ error: { code, message, details } } as ApiError, { status: 400 });
}

/** Build a 500 error response with consistent shape */
export function serverError(
  message = "Internal Server Error",
  details?: unknown,
  code = "INTERNAL",
) {
  return NextResponse.json({ error: { code, message, details } } as ApiError, { status: 500 });
}

/** Build a 401 unauthorized error response */
export function unauthorized(message = "Unauthorized", code = "UNAUTHORIZED") {
  return NextResponse.json({ error: { code, message } } as ApiError, { status: 401 });
}

/** Build a 403 forbidden error response */
export function forbidden(message = "Forbidden", code = "FORBIDDEN") {
  return NextResponse.json({ error: { code, message } } as ApiError, { status: 403 });
}

/** Build a 404 not found error response */
export function notFound(message = "Not found", code = "NOT_FOUND") {
  return NextResponse.json({ error: { code, message } } as ApiError, { status: 404 });
}

/** Build a 429 rate limit error response */
export function rateLimited(resetAt: number, message = "Rate limit exceeded") {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return NextResponse.json({ error: { code: "RATE_LIMITED", message } } as ApiError, {
    status: 429,
    headers: { "Retry-After": String(Math.max(1, retryAfter)) },
  });
}

/** Build a 200 response */
export function ok<T>(data: T) {
  return NextResponse.json(data, { status: 200 });
}

/** Utility to parse JSON request bodies against a Zod schema */
export async function parseJson(req: Request, schema: import("zod").ZodTypeAny) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new Error("Invalid JSON");
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i: any) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    return { success: false as const, details };
  }
  return { success: true as const, data: parsed.data };
}
