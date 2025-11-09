// [P1][TEST][ENV] Vitest Config tests
// Tags: P1, TEST, ENV, TEST
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "happy-dom",
    // Limit workers by default in local dev to reduce memory usage.
    // Developers can override via CLI flags if they want faster runs.
    maxWorkers: 1,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["app/**/*.{ts,tsx}", "src/**/*.{ts,tsx}"],
      exclude: ["**/*.d.ts", "**/*.config.*", "**/node_modules/**", "**/__tests__/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
