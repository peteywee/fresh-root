// [P1][TEST][ENV] Vitest Config tests
// Tags: P1, TEST, ENV, TEST
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Global defaults for the monorepo
    globals: true,

    // "node" keeps things simple for rules/tests; UI bits can still run in node + happy-dom if they use it.
    environment: "node",

    // Avoid fork-based pools; use threads and force single-thread behaviour.
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },

    // Clamp workers down to keep memory/CPU predictable in Crostini.
    maxWorkers: 1,

    // Global setup – we'll use this to guard process.listeners and import other setup.
    // Use absolute path so it works when vitest runs from package directories
    setupFiles: [path.resolve(__dirname, "./vitest.setup.ts")],

    // Test globs across your workspaces.
    // Patterns are interpreted relative to each package directory when vitest runs in monorepo
    include: [
      "apps/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "apps/**/__tests__/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "services/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "services/**/__tests__/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "packages/**/__tests__/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",  // for packages with src/ structure
      "src/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",  // for packages with src/__tests__/ structure
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
