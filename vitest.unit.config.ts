// Vitest config for unit tests in /tests/unit
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
