// [P0][TEST][ENV] Vitest Integration Config tests
// Tags: P0, TEST, ENV, TEST
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    setupFiles: ["./tests/integration/setup.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: "forks", // Better isolation for Firebase
    fileParallelism: false, // Run tests sequentially
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
      include: [
        "packages/api-framework/src/**/*.ts",
        "functions/src/**/*.ts",
        "apps/web/app/api/**/*.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@fresh-schedules/api-framework": path.resolve(__dirname, "./packages/api-framework/src"),
    },
  },
});
