// [P2][APP][ENV]
// Tags: P2, APP, ENV
// App-local flat config that mirrors root but pins tsconfigRootDir to this app.

import js from "@eslint/js";
import * as tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".next/**",
      "coverage/**",
      "turbo/**",
      "**/.turbo/**",
      // SAFEGUARD: Legacy files not in tsconfig (parsing errors)
      "lib/**",
      "components/**",
      "instrumentation.ts",
      "vitest.setup.ts",

      // quarantined trees (shouldn't exist inside app, but guard anyway)
      "../../_legacy/**",
      "../../docs/archive/**",
      "../../docs/**/node_modules/**",
      "../../docs/**/.pnpm/**",
      "../../docs/**/dist/**",
      "../../docs/**/build/**",

      "playwright-report/**",
      "blob-report/**",
      "test-results/**",
      "**/*.config.js",
      "**/*.config.ts",
      "**/*.config.mjs",
      "**/*.config.cjs",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    files: ["**/*.{ts,tsx,js,jsx,mts}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        // IMPORTANT: anchor TS project resolution in this app folder
        tsconfigRootDir: new URL(".", import.meta.url).pathname,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      ecmaVersion: "latest",
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react,
      "react-hooks": reactHooks,
      "unused-imports": unusedImports,
    },
    settings: { react: { version: "detect" } },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // SAFEGUARD: Pattern detected 49x - TS rule also flags unused vars
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      // SAFEGUARD: Pattern detected 87x - Firebase/Firestore returns untyped data
      // TODO: Create typed wrappers in src/lib/firebase/typed-wrappers.ts
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      // SAFEGUARD: Pattern detected 45x - SDK factory handlers don't always need await
      "@typescript-eslint/require-await": "warn",
      // SAFEGUARD: Pattern detected 8x - Event handlers with promises (React patterns)
      "@typescript-eslint/no-misused-promises": "warn",
      // SAFEGUARD: Remaining pattern safeguards
      "@typescript-eslint/no-redundant-type-constituents": "warn",
      "@typescript-eslint/no-base-to-string": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",
      "prefer-const": "warn",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  {
    files: [
      "**/*.spec.{ts,tsx,js,jsx}",
      "**/*.test.{ts,tsx,js,jsx}",
      "**/__tests__/**/*.{ts,tsx,js,jsx}",
    ],
    languageOptions: {
      globals: { ...globals.jest, ...globals.node },
    },
    rules: {
      "no-console": "off",
      "no-undef": "off",
    },
  },
];
