// [P0][APP][ENV] Eslint Config
// Tags: P0, APP, ENV
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/docs/**",
      "**/reports/**",
      "**/.firebase/**",
      "**/emulator-data/**",
      "**/.emulator-data/**",
      "**/.pnpm/**",
      "**/pnpm-lock.yaml",
      "**/*.config.js",
      "**/*.config.ts",
      "**/*.config.mjs",
      "**/*.config.cjs",
      "**/firebase-debug.log",
      "**/ui-debug.log",
      "**/firestore-debug.log",
      "**/.turbo/**",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.mts"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      import: importPlugin,
      "react-hooks": reactHooks,
      react: react,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn", // Warn on explicit any types
      "prefer-const": "warn",
      "no-console": "off", // Disabled: service worker needs console
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "import/order": [
        "warn",
        {
          groups: [["builtin", "external"], ["internal"], ["parent", "sibling", "index"]],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
  // Onboarding API tests: silence explicit any warnings (scaffolding/mocks)
  {
    files: ["apps/web/app/api/onboarding/__tests__/**", "apps/web/app/api/onboarding/**/__tests__/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Test files: allow globals like describe/it/beforeAll provided by Vitest/Jest
  {
    files: ["**/*.test.*", "**/*.spec.*"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      // Turn off no-undef for test globals to avoid editor warnings
      "no-undef": "off",
    },
  },
];
