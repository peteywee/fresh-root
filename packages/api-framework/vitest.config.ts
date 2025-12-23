// [P1][TEST][ENV] Vitest Config for API Framework
// Tags: P1, TEST, ENV

import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    pool: "threads",
    fileParallelism: false,
    maxWorkers: 1,
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
