// [P0][TEST][ENV] Vitest Rules Config
// Tags: P0, TEST, ENV, RULES

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/rules/**/*.{test,spec}.{ts,mts}"],
    testTimeout: 20000,
    hookTimeout: 20000,
    pool: "threads",
    fileParallelism: false,
    maxWorkers: 1,
    passWithNoTests: false,
  },
});
