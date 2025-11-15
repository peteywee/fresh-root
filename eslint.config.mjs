// [P0][APP][ENV]
// Tags: P0, APP, ENV
// Flat config for ESLint ≥ v9. Centralized ignores replace .eslintignore.

import js from "@eslint/js";
import * as tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

// Use absolute path to repo root for tsconfigRootDir
const __dirname = "/home/patrick/fresh-root-10/fresh-root";

export default [
  // 1) Global ignores (replaces .eslintignore)
  {
    ignores: [
      // core vendor/build
      "node_modules/**",
      "dist/**",
      "build/**",
      ".next/**",
      "coverage/**",
      "turbo/**",
      "**/.turbo/**",

      // caches
      ".pnp.*",
      "pnpm-store/**",
      ".pnpm-store/**",

      // quarantined trees (critical)
      "_legacy/**",
      "docs/archive/**",
      "docs/**/node_modules/**",
      "docs/**/.pnpm/**",
      "docs/**/dist/**",
      "docs/**/build/**",

      // artifacts & config (non-source)
      "playwright-report/**",
      "blob-report/**",
      "test-results/**",
      "**/firebase-debug.log",
      "**/ui-debug.log",
      "**/firestore-debug.log",
      "**/.firebase/**",
      "**/emulator-data/**",
      "**/reports/**",
      "**/pnpm-lock.yaml",
    ],
  },

  // 2) JS recommended
  js.configs.recommended,

  // 3) TypeScript strict
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // 3.5) Config files (before strict type checking to avoid tsconfig issues)
  {
    files: ["**/*.config.{js,mjs,cjs,ts}"],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      ecmaVersion: "latest",
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
  },

  // 4) App/Lib source rules
  {
    files: ["**/*.{ts,tsx,js,jsx,mts}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
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
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // TS strictness
      "@typescript-eslint/no-unused-vars": "off", // superseded by unused-imports
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
      "@typescript-eslint/no-explicit-any": "warn",

      // Reasonable defaults
      "no-console": "off", // Service worker + dev logs need console
      "no-debugger": "warn",
      "prefer-const": "warn",

      // React
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // 5) Onboarding API tests: silence explicit any warnings (scaffolding/mocks)
  {
    files: [
      "apps/web/app/api/onboarding/__tests__/**",
      "apps/web/app/api/onboarding/**/__tests__/**",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // 6) Test files: allow globals & relax console
  {
    files: [
      "**/*.spec.{ts,tsx,js,jsx}",
      "**/*.test.{ts,tsx,js,jsx}",
      "**/__tests__/**/*.{ts,tsx,js,jsx}",
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      "no-console": "off",
      "no-undef": "off",
    },
  },
];
