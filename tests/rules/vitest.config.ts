// [P1][TEST][ENV] Vitest Config tests
// Tags: P1, TEST, ENV, TEST
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    reporters: ["dot"],
    testTimeout: 20000,
  },
});
