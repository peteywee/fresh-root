import { describe, expect, it } from "vitest";

import { EnvSchema, validateProductionEnv } from "@packages/env";

describe("packages/env EnvSchema", () => {
  it("rejects invalid OTEL_EXPORTER_OTLP_ENDPOINT URLs", () => {
    expect(() =>
      EnvSchema.parse({
        OTEL_EXPORTER_OTLP_ENDPOINT: "not-a-url",
      }),
    ).toThrow();
  });

  it("fails fast in production when required vars are missing", () => {
    const env = EnvSchema.parse({ NODE_ENV: "production" });

    expect(() => validateProductionEnv(env)).toThrow(/Production environment validation failed/);
  });
});
