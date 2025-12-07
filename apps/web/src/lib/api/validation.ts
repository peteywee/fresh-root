//[P1][API][VALIDATION] Request validation middleware and helpers
// Tags: zod, validation, api, middleware, error-handling

import { NextRequest, NextResponse } from "next/server";
import { z, ZodError, ZodSchema } from "zod";

/**
 * Maximum request body size (1MB)
 */
const MAX_BODY_SIZE = 1024 * 1024; // 1MB

/**
 * Custom validation error class with detailed field-level errors
 */
export class ValidationError extends Error {
  constructor(
    public readonly fields: Record<string, string[]>,
    public readonly statusCode: number = 422,
  ) {
    super("Validation failed");
    this.name = "ValidationError";
  }

  toJSON() {
    return {
      error: {
        code: "VALIDATION_FAILED",
        message: "Validation failed",
        details: { fields: this.fields },
      },
    };
  }
}

/**
 * Convert Zod error to field-level error messages
 */
function zodErrorToFieldErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".");
    const key = path || "_root";

    if (!fieldErrors[key]) {
      fieldErrors[key] = [];
    }

    fieldErrors[key].push(issue.message);
  }

  return fieldErrors;
}

/**
 * Validate request body against Zod schema
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated data
 * @throws ValidationError if validation fails
 *
 * @example
 * const data = await validateRequest(request, OrganizationCreateSchema);
 */
export async function validateRequest<T>(request: NextRequest, schema: ZodSchema<T>): Promise<T> {
  // Check content type
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    throw new ValidationError(
      {
        _root: ["Content-Type must be application/json"],
      },
      415,
    );
  }

  // Check body size (approximate check before parsing)
  const contentLength = request.headers.get("content-length");
  // NOTE: debug logging removed. Enable DEBUG_VALIDATION_HEADERS=1 locally
  // and re-run tests to reproduce header issues; diagnostics intentionally
  // disabled in committed code to avoid noisy test output.
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    throw new ValidationError(
      {
        _root: [`Request body too large. Maximum size: ${MAX_BODY_SIZE} bytes`],
      },
      413,
    );
  }

  // Parse raw text so we can reliably enforce size limits even when
  // the Content-Length header is missing or not set by the test harness.
  let body: unknown;
  // First, try to read the raw text. Some test environments may throw on text(),
  // so fall back to request.json() in that case to preserve previous behavior.
  try {
    const rawText = await request.text();
    // debug logging removed

    // Enforce size limit based on actual body length
    if (rawText.length > MAX_BODY_SIZE) {
      // debug logging removed
      throw new ValidationError(
        {
          _root: [`Request body too large. Maximum size: ${MAX_BODY_SIZE} bytes`],
        },
        413,
      );
    }

    try {
      body = JSON.parse(rawText || "null");
    } catch {
      throw new ValidationError({ _root: ["Invalid JSON in request body"] }, 400);
    }
  } catch (textErr) {
    // If we threw a ValidationError above (e.g. due to oversized rawText),
    // don't swallow it — re-throw immediately.
    if (textErr instanceof ValidationError) throw textErr;
    // text() failed in this environment (some runtimes throw for large bodies).
    // If Content-Length header indicates the body is too large, surface 413.
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      throw new ValidationError(
        {
          _root: [`Request body too large. Maximum size: ${MAX_BODY_SIZE} bytes`],
        },
        413,
      );
    }

    // Try to inspect the raw ArrayBuffer length if available (some runtimes
    // expose arrayBuffer even when text() throws). If it is too large, return 413.
    try {
      const buf = await request.arrayBuffer();
      if (buf && buf.byteLength > MAX_BODY_SIZE) {
        // debug logging removed
        throw new ValidationError(
          {
            _root: [`Request body too large. Maximum size: ${MAX_BODY_SIZE} bytes`],
          },
          413,
        );
      }
    } catch {
      // Ignore errors reading arrayBuffer and fall back to parsing below.
    }

    // Otherwise fall back to request.json() to detect invalid JSON and produce a 400.
    try {
      body = await request.json();
    } catch {
      throw new ValidationError({ _root: ["Invalid JSON in request body"] }, 400);
    }
  }

  // Validate against schema
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(zodErrorToFieldErrors(error));
    }
    throw error;
  }
}

/**
 * Validate request query parameters against Zod schema
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated query params
 * @throws ValidationError if validation fails
 *
 * @example
 * const params = validateQuery(request, z.object({ page: z.coerce.number() }));
 */
export function validateQuery<T>(request: NextRequest, schema: ZodSchema<T>): T {
  const { searchParams } = new URL(request.url);
  const query: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    query[key] = value;
  });

  try {
    return schema.parse(query);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(zodErrorToFieldErrors(error));
    }
    throw error;
  }
}

/**
 * Create error response from ValidationError
 *
 * @param error - ValidationError instance
 * @returns NextResponse with error details
 */
export function createValidationErrorResponse(error: ValidationError): NextResponse {
  return NextResponse.json(error.toJSON(), { status: error.statusCode });
}

/**
 * Higher-order function to wrap API route handlers with validation
 *
 * @param schema - Zod schema for request body validation
 * @param handler - Async handler function receiving validated data
 * @returns Next.js route handler with validation
 *
 * @example
 * export const POST = withValidation(
 *   OrganizationCreateSchema,
 *   async (request, data) => {
 *     // data is typed and validated
 *     const org = await createOrganization(data);
 *     return NextResponse.json(org);
 *   }
 * );
 */
export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (request: NextRequest, data: T) => Promise<NextResponse>,
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const data = await validateRequest(request, schema);
      return await handler(request, data);
    } catch (error) {
      if (error instanceof ValidationError) {
        return createValidationErrorResponse(error);
      }

      // Re-throw unexpected errors
      throw error;
    }
  };
}

/**
 * Common query parameter schemas
 */
export const QuerySchemas = {
  /**
   * Pagination query params
   */
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),

  /**
   * Sorting query params
   */
  sorting: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  }),

  /**
   * Date range query params
   */
  dateRange: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }),

  /**
   * Search query params
   */
  search: z.object({
    q: z.string().min(1).optional(),
  }),
};

/**
 * Validate pagination and return safe values
 */
export function validatePagination(request: NextRequest) {
  return validateQuery(request, QuerySchemas.pagination);
}

/**
 * Validate sorting and return safe values
 */
export function validateSorting(request: NextRequest) {
  return validateQuery(request, QuerySchemas.sorting);
}

/**
 * Validate date range and ensure startDate <= endDate
 */
export function validateDateRange(request: NextRequest) {
  const range = validateQuery(request, QuerySchemas.dateRange);

  if (range.startDate && range.endDate && range.startDate > range.endDate) {
    throw new ValidationError({
      dateRange: ["startDate must be less than or equal to endDate"],
    });
  }

  return range;
}
