// [P0][API][ENV] Tsup Config
// Tags: P0, API, ENV
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    testing: "src/testing.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["next", "firebase-admin", "zod"],
});
