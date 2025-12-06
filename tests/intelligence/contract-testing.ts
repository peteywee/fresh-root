// [P0][TEST][TEST] Contract Testing tests
// Tags: P0, TEST, TEST
/**
 * Contract Testing with Auto-Generated OpenAPI Specifications
 * Ensures API contracts are maintained and generates documentation
 */

import * as fs from "fs";
import * as path from "path";
import { z } from "zod";

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{ url: string; description: string }>;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
    securitySchemes: Record<string, any>;
  };
}

interface ContractViolation {
  endpoint: string;
  type: "request" | "response";
  field: string;
  expected: any;
  actual: any;
  severity: "error" | "warning";
}

export class ContractTester {
  private spec: OpenAPISpec;
  private violations: ContractViolation[] = [];

  constructor() {
    this.spec = {
      openapi: "3.0.0",
      info: {
        title: "Fresh Root Scheduling API",
        version: "1.2.0",
        description: "Enterprise scheduling platform API with comprehensive endpoint coverage",
      },
      servers: [
        { url: "http://localhost:3000", description: "Development" },
        { url: "https://api.fresh-schedules.com", description: "Production" },
      ],
      paths: {},
      components: {
        schemas: {},
        securitySchemes: {
          FirebaseAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Firebase Authentication token",
          },
          SessionCookie: {
            type: "apiKey",
            in: "cookie",
            name: "session",
            description: "Session cookie for authenticated requests",
          },
        },
      },
    };
  }

  /**
   * Registers an endpoint contract
   */
  registerEndpoint(config: {
    path: string;
    method: string;
    summary: string;
    description?: string;
    tags?: string[];
    security?: string[];
    requestBody?: z.ZodObject<any>;
    responses: Record<number, { description: string; schema?: z.ZodObject<any> }>;
    parameters?: Array<{
      name: string;
      in: "path" | "query" | "header";
      required?: boolean;
      schema: z.ZodType<any>;
      description?: string;
    }>;
  }): void {
    const {
      path: endpoint,
      method,
      summary,
      description,
      tags,
      security,
      requestBody,
      responses,
      parameters,
    } = config;

    if (!this.spec.paths[endpoint]) {
      this.spec.paths[endpoint] = {};
    }

    const operation: any = {
      summary,
      description: description || summary,
      tags: tags || ["API"],
      security: security
        ? security.map((s) => ({ [s]: [] }))
        : [{ FirebaseAuth: [] }, { SessionCookie: [] }],
      responses: {},
    };

    // Add parameters
    if (parameters) {
      operation.parameters = parameters.map((p) => ({
        name: p.name,
        in: p.in,
        required: p.required || false,
        description: p.description || "",
        schema: this.zodToOpenAPISchema(p.schema),
      }));
    }

    // Add request body
    if (requestBody) {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: this.zodToOpenAPISchema(requestBody),
          },
        },
      };
    }

    // Add responses
    Object.entries(responses).forEach(([statusCode, response]) => {
      operation.responses[statusCode] = {
        description: response.description,
        content: response.schema
          ? {
              "application/json": {
                schema: this.zodToOpenAPISchema(response.schema),
              },
            }
          : undefined,
      };
    });

    this.spec.paths[endpoint][method.toLowerCase()] = operation;
  }

  /**
   * Converts Zod schema to OpenAPI schema
   */
  private zodToOpenAPISchema(schema: z.ZodType<any>): any {
    if (schema instanceof z.ZodObject) {
      const shape = schema.shape;
      const properties: Record<string, any> = {};
      const required: string[] = [];

      Object.entries(shape).forEach(([key, value]) => {
        properties[key] = this.zodToOpenAPISchema(value as z.ZodType<any>);

        // Check if field is required
        if (!(value instanceof z.ZodOptional) && !(value instanceof z.ZodNullable)) {
          required.push(key);
        }
      });

      return {
        type: "object",
        properties,
        required: required.length > 0 ? required : undefined,
      };
    }

    if (schema instanceof z.ZodString) {
      const def = schema._def as any;
      const openApiSchema: any = { type: "string" };

      // Check for email validation
      if (def.checks) {
        for (const check of def.checks as any[]) {
          if (check.kind === "email") openApiSchema.format = "email";
          if (check.kind === "url") openApiSchema.format = "uri";
          if (check.kind === "uuid") openApiSchema.format = "uuid";
          if (check.kind === "min") openApiSchema.minLength = check.value;
          if (check.kind === "max") openApiSchema.maxLength = check.value;
        }
      }

      return openApiSchema;
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
        items: this.zodToOpenAPISchema((schema._def as any).type),
      };
    }

    if (schema instanceof z.ZodEnum) {
      return {
        type: "string",
        enum: (schema._def as any).values,
      };
    }

    if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
      return this.zodToOpenAPISchema((schema._def as any).innerType);
    }

    if (schema instanceof z.ZodUnion) {
      return {
        oneOf: (schema._def as any).options.map((opt: any) => this.zodToOpenAPISchema(opt)),
      };
    }

    return { type: "string" }; // Fallback
  }

  /**
   * Validates a request against the contract
   */
  validateRequest(endpoint: string, method: string, data: any): ContractViolation[] {
    const violations: ContractViolation[] = [];
    const operation = this.spec.paths[endpoint]?.[method.toLowerCase()];

    if (!operation) {
      violations.push({
        endpoint: `${method} ${endpoint}`,
        type: "request",
        field: "endpoint",
        expected: "registered",
        actual: "not found",
        severity: "error",
      });
      return violations;
    }

    // Validate request body against schema
    if (operation.requestBody) {
      const schema = operation.requestBody.content["application/json"].schema;
      const validation = this.validateAgainstSchema(data, schema);

      validation.forEach((v) => {
        violations.push({
          endpoint: `${method} ${endpoint}`,
          type: "request",
          field: v.field,
          expected: v.expected,
          actual: v.actual,
          severity: "error",
        });
      });
    }

    this.violations.push(...violations);
    return violations;
  }

  /**
   * Validates a response against the contract
   */
  validateResponse(
    endpoint: string,
    method: string,
    statusCode: number,
    data: any,
  ): ContractViolation[] {
    const violations: ContractViolation[] = [];
    const operation = this.spec.paths[endpoint]?.[method.toLowerCase()];

    if (!operation) return violations;

    const responseSpec = operation.responses[statusCode];
    if (!responseSpec) {
      violations.push({
        endpoint: `${method} ${endpoint}`,
        type: "response",
        field: "statusCode",
        expected: Object.keys(operation.responses).join(", "),
        actual: statusCode,
        severity: "warning",
      });
      return violations;
    }

    // Validate response body against schema
    if (responseSpec.content?.["application/json"]?.schema) {
      const schema = responseSpec.content["application/json"].schema;
      const validation = this.validateAgainstSchema(data, schema);

      validation.forEach((v) => {
        violations.push({
          endpoint: `${method} ${endpoint}`,
          type: "response",
          field: v.field,
          expected: v.expected,
          actual: v.actual,
          severity: "error",
        });
      });
    }

    this.violations.push(...violations);
    return violations;
  }

  /**
   * Validates data against OpenAPI schema
   */
  private validateAgainstSchema(
    data: any,
    schema: any,
  ): Array<{ field: string; expected: any; actual: any }> {
    const violations: Array<{ field: string; expected: any; actual: any }> = [];

    if (schema.type === "object" && schema.properties) {
      // Check required fields
      if (schema.required) {
        schema.required.forEach((field: string) => {
          if (!(field in data)) {
            violations.push({
              field,
              expected: "required",
              actual: "missing",
            });
          }
        });
      }

      // Validate each property
      Object.entries(schema.properties).forEach(([key, propSchema]: [string, any]) => {
        if (key in data) {
          const value = data[key];
          const valueType = Array.isArray(value) ? "array" : typeof value;

          if (propSchema.type && valueType !== propSchema.type) {
            violations.push({
              field: key,
              expected: propSchema.type,
              actual: valueType,
            });
          }

          // Validate nested objects
          if (propSchema.type === "object" && propSchema.properties) {
            const nested = this.validateAgainstSchema(value, propSchema);
            nested.forEach((v) => {
              violations.push({
                field: `${key}.${v.field}`,
                expected: v.expected,
                actual: v.actual,
              });
            });
          }
        }
      });
    }

    return violations;
  }

  /**
   * Generates OpenAPI specification file
   */
  generateSpec(outputPath: string = "docs/openapi.json"): void {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(this.spec, null, 2));
    console.log(`✅ Generated OpenAPI spec at ${outputPath}`);
  }

  /**
   * Generates Swagger UI HTML
   */
  generateSwaggerUI(outputPath: string = "docs/api-docs.html"): void {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Fresh Root API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        spec: ${JSON.stringify(this.spec)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
      window.ui = ui;
    };
  </script>
</body>
</html>`;

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html);
    console.log(`✅ Generated Swagger UI at ${outputPath}`);
  }

  /**
   * Gets all contract violations
   */
  getViolations(): ContractViolation[] {
    return this.violations;
  }

  /**
   * Generates contract violation report
   */
  generateViolationReport(): string {
    if (this.violations.length === 0) {
      return "✅ No contract violations found!";
    }

    const errors = this.violations.filter((v) => v.severity === "error");
    const warnings = this.violations.filter((v) => v.severity === "warning");

    let report = `📋 Contract Violation Report\n`;
    report += `${"=".repeat(50)}\n\n`;

    if (errors.length > 0) {
      report += `❌ Errors (${errors.length}):\n`;
      errors.forEach((v) => {
        report += `  ${v.endpoint} [${v.type}]\n`;
        report += `    Field: ${v.field}\n`;
        report += `    Expected: ${JSON.stringify(v.expected)}\n`;
        report += `    Actual: ${JSON.stringify(v.actual)}\n\n`;
      });
    }

    if (warnings.length > 0) {
      report += `⚠️  Warnings (${warnings.length}):\n`;
      warnings.forEach((v) => {
        report += `  ${v.endpoint} [${v.type}]\n`;
        report += `    Field: ${v.field}\n`;
        report += `    Expected: ${JSON.stringify(v.expected)}\n`;
        report += `    Actual: ${JSON.stringify(v.actual)}\n\n`;
      });
    }

    return report;
  }
}

/**
 * Auto-registers all API endpoints from the codebase
 */
export async function autoGenerateAPIContracts(): Promise<ContractTester> {
  const tester = new ContractTester();

  // Register common schemas
  tester.registerEndpoint({
    path: "/api/session",
    method: "POST",
    summary: "Create session",
    tags: ["Authentication"],
    requestBody: z.object({
      idToken: z.string().min(1),
    }),
    responses: {
      200: {
        description: "Session created successfully",
        schema: z.object({
          sessionCookie: z.string(),
          user: z.object({
            uid: z.string(),
            email: z.string().email(),
          }),
        }),
      },
      401: { description: "Invalid token" },
    },
  });

  tester.registerEndpoint({
    path: "/api/organizations",
    method: "POST",
    summary: "Create organization",
    tags: ["Organizations"],
    requestBody: z.object({
      name: z.string().min(1).max(100),
      subdomain: z.string().min(3).max(50),
      timezone: z.string().optional(),
    }),
    responses: {
      201: {
        description: "Organization created",
        schema: z.object({
          id: z.string(),
          name: z.string(),
          subdomain: z.string(),
          createdAt: z.string(),
        }),
      },
      400: { description: "Invalid input" },
      409: { description: "Subdomain already exists" },
    },
  });

  tester.registerEndpoint({
    path: "/api/organizations/:id",
    method: "GET",
    summary: "Get organization details",
    tags: ["Organizations"],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: z.string(),
        description: "Organization ID",
      },
    ],
    responses: {
      200: {
        description: "Organization details",
        schema: z.object({
          id: z.string(),
          name: z.string(),
          subdomain: z.string(),
          createdAt: z.string(),
        }),
      },
      404: { description: "Organization not found" },
    },
  });

  tester.registerEndpoint({
    path: "/api/schedules",
    method: "POST",
    summary: "Create schedule",
    tags: ["Scheduling"],
    requestBody: z.object({
      organizationId: z.string(),
      name: z.string().min(1).max(100),
      startDate: z.string(),
      endDate: z.string(),
      venueId: z.string().optional(),
    }),
    responses: {
      201: {
        description: "Schedule created",
        schema: z.object({
          id: z.string(),
          name: z.string(),
          startDate: z.string(),
          endDate: z.string(),
        }),
      },
      400: { description: "Invalid input" },
      403: { description: "Insufficient permissions" },
    },
  });

  // Generate files
  tester.generateSpec("docs/openapi.json");
  tester.generateSwaggerUI("docs/api-docs.html");

  return tester;
}

// Export singleton
export const contractTester = new ContractTester();
