// [P0][APP][ENV]
// Tags: P0, APP, ENV
// Flat config for ESLint ≥ v9. Centralized ignores replace .eslintignore.

import js from "@eslint/js";
import * as tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Use absolute path to repo root for tsconfigRootDir
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ignoreConfig = {
  ignores: [
    // core vendor/build
    "node_modules/**",
    "dist/**",
    "build/**",
    ".next/**",
    "apps/web/.next/**",
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
};

export default [
  ignoreConfig,
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Special ignore for files with complex optional dependency handling
  {
    ignores: [
      "apps/web/src/lib/api/redis.ts", // Complex optional dependency handling
      "services/api/src/index.ts", // import/order rule not configured
    ],
  },

  // 4) Config & setup files - type checking disabled
  {
    files: [
      "**/*.config.{js,mjs,cjs,ts}",
      "**/eslint.config.mjs",
      "**/vitest.setup.ts",
      "**/jest.setup.ts",
      "**/jest.config.ts",
      "**/vitest.config.ts",
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        tsconfigRootDir: __dirname,
        project: null, // Explicitly disable project-based type checking
      },
      ecmaVersion: "latest",
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  // 5) App source rules - strict type checking
  {
    files: ["apps/web/src/**/*.{ts,tsx}", "apps/web/app/**/*.{ts,tsx}"],
    ignores: ["**/__tests__/**", "**/*.spec.ts", "**/*.spec.tsx", "**/*.test.ts", "**/*.test.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./apps/web/tsconfig.json",
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
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": "allow-with-description",
        },
      ],
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
      "import/order": "off", // Rule not installed/configured

      // Reasonable defaults
      "no-console": "off", // Service worker + dev logs need console
      "no-debugger": "warn",
      "prefer-const": "warn",
      "no-empty": "off", // Some intentional empty blocks

      // React
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // 6a) Root scripts .mjs files - no TypeScript parser
  {
    files: ["scripts/*.mjs"],
    rules: {
      "no-console": "off",
      "no-debugger": "warn",
    },
  },

  // 6b) Other packages - type checking disabled
  {
    files: [
      "packages/**/src/**/*.{ts,tsx}",
      "services/api/src/**/*.{ts,tsx}",
      "functions/src/**/*.{ts,tsx}",
      "scripts/**/*.{ts,mts}",
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        tsconfigRootDir: __dirname,
        project: null, // Explicitly disable project-based type checking
      },
      ecmaVersion: "latest",
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "unused-imports": unusedImports,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "off", // Some packages require dynamic requires
      "@typescript-eslint/no-explicit-any": "warn", // Warn but don't error on any
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "no-console": "off",
      "no-debugger": "warn",
      "prefer-const": "warn",
      "no-empty": "warn", // Some files have intentional empty blocks
    },
  },

  // 7) Test files
  {
    files: [
      "**/*.spec.{ts,tsx,js,jsx}",
      "**/*.test.{ts,tsx,js,jsx}",
      "**/__tests__/**/*.{ts,tsx,js,jsx}",
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        tsconfigRootDir: __dirname,
        project: null, // disable project-based type checking for tests
      },
      globals: {
        ...globals.jest,
        ...globals.node,
      },
      ecmaVersion: "latest",
    },
    rules: {
      "no-console": "off",
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "off", // Test files often use any for mocking
      "@typescript-eslint/no-unused-vars": "off", // Test setup variables often unused
      "no-empty": "off", // Empty catch blocks in tests
    },
  },
];
