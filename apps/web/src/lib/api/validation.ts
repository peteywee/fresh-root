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
/**
 * A custom error class for validation errors.
 *
 * @param {Record<string, string[]>} fields - An object containing field-level error messages.
 * @param {number} [statusCode=422] - The HTTP status code to be returned.
 */
export class ValidationError extends Error {
  constructor(
    public readonly fields: Record<string, string[]>,
    public readonly statusCode: number = 422,
  ) {
    super("Validation failed");
    this.name = "ValidationError";
  }

  /**
   * Converts the validation error to a JSON object.
   *
   * @returns {object} The JSON representation of the error.
   */
  toJSON() {
    return {
      error: "Validation failed",
      fields: this.fields,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Converts a ZodError into a more structured, field-level error object.
 *
 * @param {ZodError} error - The ZodError to convert.
 * @returns {Record<string, string[]>} A record of field names to an array of error messages.
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
 * Validates the request body against a Zod schema.
 *
 * @template T
 * @param {NextRequest} request - The Next.js request object.
 * @param {ZodSchema<T>} schema - The Zod schema to validate against.
 * @returns {Promise<T>} The parsed and validated data.
 * @throws {ValidationError} If validation fails.
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
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    throw new ValidationError(
      {
        _root: [`Request body too large. Maximum size: ${MAX_BODY_SIZE} bytes`],
      },
      413,
    );
  }

  // Parse JSON
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError(
      {
        _root: ["Invalid JSON in request body"],
      },
      400,
    );
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
 * Validates the request query parameters against a Zod schema.
 *
 * @template T
 * @param {NextRequest} request - The Next.js request object.
 * @param {ZodSchema<T>} schema - The Zod schema to validate against.
 * @returns {T} The parsed and validated query parameters.
 * @throws {ValidationError} If validation fails.
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
 * Creates a NextResponse object from a ValidationError.
 *
 * @param {ValidationError} error - The validation error.
 * @returns {NextResponse} A Next.js response object with the error details.
 */
export function createValidationErrorResponse(error: ValidationError): NextResponse {
  return NextResponse.json(error.toJSON(), { status: error.statusCode });
}

/**
 * A higher-order function that wraps an API route handler with validation logic.
 *
 * @template T
 * @param {ZodSchema<T>} schema - The Zod schema for request body validation.
 * @param {(request: NextRequest, data: T) => Promise<NextResponse>} handler - The handler function to be executed with the validated data.
 * @returns {Function} A Next.js route handler with built-in validation.
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
 * A collection of common query parameter schemas.
 * @property {ZodSchema} pagination - Schema for pagination parameters.
 * @property {ZodSchema} sorting - Schema for sorting parameters.
 * @property {ZodSchema} dateRange - Schema for date range parameters.
 * @property {ZodSchema} search - Schema for search parameters.
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
 * Validates pagination query parameters and returns safe values.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @returns {{page: number, limit: number}} The validated pagination parameters.
 */
export function validatePagination(request: NextRequest) {
  return validateQuery(request, QuerySchemas.pagination);
}

/**
 * Validates sorting query parameters and returns safe values.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @returns {{sortBy?: string, sortOrder: 'asc' | 'desc'}} The validated sorting parameters.
 */
export function validateSorting(request: NextRequest) {
  return validateQuery(request, QuerySchemas.sorting);
}

/**
 * Validates date range query parameters and ensures that the start date is not after the end date.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @returns {{startDate?: Date, endDate?: Date}} The validated date range.
 * @throws {ValidationError} If the start date is after the end date.
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
