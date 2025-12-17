// [P0][TEST][ENV] Vitest E2E Config
// Tags: P0, TEST, ENV, E2E
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/e2e/**/*.e2e.test.ts"],
    setupFiles: ["./tests/e2e/setup.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    maxWorkers: 1,
    // Continue running tests even if some fail
    bail: 0,
    // Report all errors, not just first
    passWithNoTests: false,
    // Retry failed tests once
    retry: 1,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@fresh-schedules/api-framework": path.resolve(__dirname, "./packages/api-framework/src"),
      "@fresh-schedules/types": path.resolve(__dirname, "./packages/types/src"),
    },
  },
});
