// [P1][TEST][ENV] Vitest Config
// Tags: P1, TEST, ENV, TEST

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths({ projects: ["./tsconfig.json", "./tsconfig.test.json"] })],
  test: {
    // Use a browser-like env for your React/Next code
    globals: true,
    environment: "happy-dom",

    // Avoid forking processes; keep tests single-threaded and predictable.
    pool: "threads",
    fileParallelism: false,

    // Also clamp max workers for lower RAM and less weird concurrency
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
});
