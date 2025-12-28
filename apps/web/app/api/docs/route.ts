/**
 * API Documentation Endpoint
 *
 * Serves Swagger UI for interactive API documentation
 * Accessible at /api/docs
 */

import { NextResponse } from "next/server";
import { generateOpenAPISpec } from "@/lib/openapi-generator";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

/**
 * GET /api/docs
 *
 * Returns OpenAPI specification as JSON
 */
export async function GET() {
  try {
    const spec = generateOpenAPISpec(API_ENDPOINTS);

    return NextResponse.json(spec, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Failed to generate OpenAPI spec:", error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate API documentation",
        },
      },
      { status: 500 },
    );
  }
}
