// [P1][TEST][ENV] Vitest Config tests
// Tags: P1, TEST, ENV, TEST
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Restrict to rules tests only to avoid collecting app/unit specs
    // Using .mts as preferred extension, but allowing .ts for files without .mts versions
    include: ["tests/rules/**/*.spec.{mts,ts}"],
    globals: true,
    reporters: ["dot"],
    testTimeout: 20000,
  },
});
