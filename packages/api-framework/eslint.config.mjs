// ESLint config for api-framework package
// Extends root config - minimal local override

import rootConfig from "../../eslint.config.mjs";

export default [
  ...rootConfig,
  {
    // Package-specific overrides
    files: ["src/**/*.ts", "src/**/*.test.ts"],
    rules: {
      // Allow console in this package for debugging Redis/rate limiting
      "no-console": "off",
    },
  },
  {
    // Don't ignore test files in this package
    ignores: [],
  },
];
