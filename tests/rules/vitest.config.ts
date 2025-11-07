// [P1][TEST][ENV] Vitest Config tests
// Tags: P1, TEST, ENV, TEST
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Restrict to rules tests only to avoid collecting app/unit specs
    include: ["tests/rules/**/*.spec.{ts,mts}"],
    globals: true,
    reporters: ["dot"],
    testTimeout: 20000,
  },
});
