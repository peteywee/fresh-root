// [P0][API][HELPER] Standardized API response helpers
// Tags: P0, API, HELPER
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiResponse<T = unknown> = {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
  };
};

export function success<T>(
  data: T,
  status = 200,
  meta?: ApiResponse["meta"],
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ data, meta }, { status });
}

export function error(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details,
      },
    },
    { status },
  );
}

export function badRequest(message: string, details?: unknown): NextResponse<ApiResponse> {
  return error("BAD_REQUEST", message, 400, details);
}

export function unauthorized(message = "Unauthorized"): NextResponse<ApiResponse> {
  return error("UNAUTHORIZED", message, 401);
}

export function forbidden(message = "Forbidden"): NextResponse<ApiResponse> {
  return error("FORBIDDEN", message, 403);
}

export function notFound(message = "Not Found"): NextResponse<ApiResponse> {
  return error("NOT_FOUND", message, 404);
}

export function internalError(
  message = "Internal Server Error",
  details?: unknown,
): NextResponse<ApiResponse> {
  return error("INTERNAL_SERVER_ERROR", message, 500, details);
}

export function fromZodError(err: ZodError): NextResponse<ApiResponse> {
  // Convert zod issues into structured field-level errors
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_root";
    if (!fieldErrors[key]) fieldErrors[key] = [];
    fieldErrors[key].push(issue.message);
  }

  return NextResponse.json(
    {
      error: {
        code: "VALIDATION_FAILED",
        message: "Validation Error",
        details: { fields: fieldErrors },
      },
    },
    { status: 422 },
  );
}

export const jsonOk = success;
export const jsonError = error;
