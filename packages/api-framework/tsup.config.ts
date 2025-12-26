// [P0][API][ENV] Tsup Config
// Tags: P0, API, ENV
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    testing: "src/testing.ts",
  },
  format: ["esm"],
  dts: {
    compilerOptions: {
      composite: false,
      incremental: false,
      rootDir: undefined,
    },
  },
  sourcemap: true,
  clean: true,
  // External dependencies that should NOT be bundled:
  // - @fresh-schedules/types: resolved via package.json dependency
  // - ioredis: server-only, resolved at runtime
  // - firebase-admin: server-only, resolved at runtime
  // - next: peer dependency
  // - zod: peer dependency
  external: ["@fresh-schedules/types", "next", "firebase-admin", "zod", "ioredis"],
});
