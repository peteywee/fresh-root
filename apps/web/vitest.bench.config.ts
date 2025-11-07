//[P1][APP][CONFIG] Vitest benchmark configuration for performance testing
// Tags: test, benchmark, performance, vitest

import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["**/*.bench.ts"],
    benchmark: {
      include: ["**/*.bench.ts"],
      exclude: ["node_modules", "dist", "build"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/components": path.resolve(__dirname, "./src/components"),
    },
  },
});
