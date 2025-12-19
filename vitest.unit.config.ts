// Vitest config for unit tests in /tests/unit
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    testTimeout: 20000,
    hookTimeout: 20000,
  },
  resolve: {
    alias: {
      // Mirror apps/web tsconfig baseUrl+paths so imports like "@/src/..." work in unit tests.
      "@": path.resolve(__dirname, "./apps/web"),
      "@fresh-schedules/api-framework": path.resolve(__dirname, "./packages/api-framework/src"),
      "@fresh-schedules/types": path.resolve(__dirname, "./packages/types/src"),
      "@fresh-schedules/ui": path.resolve(__dirname, "./packages/ui/src"),
      "@packages/env": path.resolve(__dirname, "./packages/env/src"),
    },
  },
});
