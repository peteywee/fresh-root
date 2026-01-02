/**
 * OpenAPI Specification Generator
 *
 * Generates OpenAPI 3.0 spec from Zod schemas and API routes
 * Used for Swagger UI and API documentation
 */

import { z } from "zod";

export interface OpenAPIEndpoint {
  path: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  summary: string;
  description: string;
  tags: string[];
  requiresAuth: boolean;
  requiresOrg: boolean;
  roles?: string[];
  requestSchema?: z.ZodTypeAny;
  responseSchema?: z.ZodTypeAny;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

/**
 * Convert Zod schema to OpenAPI schema object
 */
function zodToOpenAPI(schema: z.ZodTypeAny): any {
  if (schema instanceof z.ZodString) {
    return { type: "string" };
  }
  if (schema instanceof z.ZodNumber) {
    return { type: "number" };
  }
  if (schema instanceof z.ZodBoolean) {
    return { type: "boolean" };
  }
  if (schema instanceof z.ZodArray) {
    return {
      type: "array",
      items: zodToOpenAPI((schema as any)._def.type),
    };
  }
  if (schema instanceof z.ZodObject) {
    const shape = (schema as any)._def.shape();
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToOpenAPI(value as z.ZodTypeAny);
      if (!(value as z.ZodTypeAny).isOptional()) {
        required.push(key);
      }
    }

    return {
      type: "object",
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }
  if (schema instanceof z.ZodEnum) {
    return {
      type: "string",
      enum: (schema as any)._def.values,
    };
  }
  if (schema instanceof z.ZodOptional) {
    return zodToOpenAPI((schema as any)._def.innerType);
  }
  if (schema instanceof z.ZodNullable) {
    return zodToOpenAPI((schema as any)._def.innerType);
  }

  // Default fallback
  return { type: "object" };
}

/**
 * Generate OpenAPI specification
 */
export function generateOpenAPISpec(endpoints: OpenAPIEndpoint[]): any {
  const paths: Record<string, any> = {};

  for (const endpoint of endpoints) {
    if (!paths[endpoint.path]) {
      paths[endpoint.path] = {};
    }

    const method = endpoint.method.toLowerCase();
    const parameters: any[] = [];

    // Add orgId query parameter if required
    if (endpoint.requiresOrg) {
      parameters.push({
        name: "orgId",
        in: "query",
        required: true,
        schema: { type: "string" },
        description: "Organization ID",
      });
    }

    // Add path parameters (if any)
    const pathParams = endpoint.path.match(/\{([^}]+)\}/g);
    if (pathParams) {
      pathParams.forEach((param) => {
        const name = param.replace(/[{}]/g, "");
        parameters.push({
          name,
          in: "path",
          required: true,
          schema: { type: "string" },
        });
      });
    }

    const operation: any = {
      summary: endpoint.summary,
      description: endpoint.description,
      tags: endpoint.tags,
      parameters: parameters.length > 0 ? parameters : undefined,
      responses: {
        "200": {
          description: "Successful response",
          content: endpoint.responseSchema
            ? {
                "application/json": {
                  schema: zodToOpenAPI(endpoint.responseSchema),
                },
              }
            : undefined,
        },
        "400": {
          description: "Validation error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "object",
                    properties: {
                      code: { type: "string" },
                      message: { type: "string" },
                      details: { type: "object" },
                    },
                  },
                },
              },
            },
          },
        },
        "401": {
          description: "Unauthorized - Authentication required",
        },
        "403": {
          description: "Forbidden - Insufficient permissions",
        },
        "429": {
          description: "Too many requests - Rate limit exceeded",
        },
        "500": {
          description: "Internal server error",
        },
      },
    };

    // Add security requirement if auth is required
    if (endpoint.requiresAuth) {
      operation.security = [{ sessionCookie: [] }];
    }

    // Add request body if schema provided
    if (endpoint.requestSchema && ["POST", "PUT", "PATCH"].includes(endpoint.method)) {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: zodToOpenAPI(endpoint.requestSchema),
          },
        },
      };
    }

    // Add rate limit info to description
    if (endpoint.rateLimit) {
      operation.description += `\n\nRate limit: ${endpoint.rateLimit.maxRequests} requests per ${endpoint.rateLimit.windowMs / 1000} seconds`;
    }

    // Add RBAC info if roles specified
    if (endpoint.roles && endpoint.roles.length > 0) {
      operation.description += `\n\nRequired roles: ${endpoint.roles.join(", ")}`;
    }

    paths[endpoint.path][method] = operation;
  }

  return {
    openapi: "3.0.0",
    info: {
      title: "Fresh Schedules API",
      version: "1.0.0",
      description: `
# Fresh Schedules API Documentation

Production-ready scheduling platform API with comprehensive security, validation, and rate limiting.

## Features

- 🔒 Session-based authentication with Firebase
- 🏢 Organization-scoped multi-tenancy
- 👥 Hierarchical RBAC (staff → manager → admin → org_owner)
- ⚡ Redis-backed rate limiting
- 📊 OpenTelemetry distributed tracing
- ✅ Zod schema validation on all inputs
- 🛡️ CSRF protection on mutations
- 🔐 Comprehensive Firestore security rules

## Authentication

All protected endpoints require a valid session cookie obtained through Firebase authentication.

1. Authenticate with Firebase (Google OAuth, Email/Password)
2. Call \`POST /api/session\` with Firebase ID token
3. Session cookie is set automatically
4. Include cookie in subsequent requests

## Rate Limiting

API endpoints are rate limited based on usage patterns:
- Read operations: 100 requests/minute
- Write operations: 50 requests/minute
- Sensitive operations: 10 requests/minute

Rate limit headers are included in responses:
- \`X-RateLimit-Limit\`: Maximum requests allowed
- \`X-RateLimit-Remaining\`: Requests remaining in window
- \`X-RateLimit-Reset\`: Timestamp when limit resets

## Organization Context

Most endpoints require organization context via \`orgId\` query parameter.

Organization membership is verified automatically, and operations are scoped to the user's organization to ensure tenant isolation.

## Error Handling

All errors follow a consistent format:

\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "requestId": "uuid",
    "retryable": boolean,
    "details": { /* field-specific errors */ }
  }
}
\`\`\`

## RBAC Roles

Hierarchical role system (higher roles inherit lower permissions):
- **staff**: Read-only access to own data
- **scheduler**: Create and manage schedules
- **manager**: Manage team members and venues
- **admin**: Organization settings and advanced features
- **org_owner**: Full organization control
      `,
      contact: {
        name: "Fresh Schedules Support",
        email: "support@freshschedules.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.freshschedules.com",
        description: "Production server",
      },
    ],
    paths,
    components: {
      securitySchemes: {
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "session",
          description: "Firebase session cookie obtained from /api/session endpoint",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            code: { type: "string" },
            message: { type: "string" },
            requestId: { type: "string" },
            retryable: { type: "boolean" },
            details: { type: "object" },
          },
          required: ["code", "message"],
        },
      },
    },
    tags: [
      { name: "Authentication", description: "Session and authentication endpoints" },
      { name: "Schedules", description: "Schedule management" },
      { name: "Shifts", description: "Shift management" },
      { name: "Organizations", description: "Organization management" },
      { name: "Users", description: "User management" },
      { name: "Onboarding", description: "User and organization onboarding" },
      { name: "Venues", description: "Venue and zone management" },
      { name: "Positions", description: "Position management" },
      { name: "Attendance", description: "Attendance tracking" },
      { name: "Metrics", description: "Metrics and health checks" },
    ],
  };
}
