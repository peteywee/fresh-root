// [P1][DOCS][API] OpenAPI documentation endpoint
// Tags: P1, DOCS, API

/**
 * API Documentation Endpoint
 *
 * Returns OpenAPI specification as JSON.
 * Accessible at /api/docs
 */

import { createPublicEndpoint } from "@fresh-schedules/api-framework";
import { NextResponse } from "next/server";
import { generateOpenAPISpec } from "@/lib/openapi-generator";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

export const GET = createPublicEndpoint({
  handler: async ({ request: _request, input: _input, context: _context, params: _params }) => {
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
  },
});
