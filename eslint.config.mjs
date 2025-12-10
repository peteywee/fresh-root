// [P0][APP][ENV] Eslint Config
// Tags: P0, APP, ENV
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import js from "@eslint/js";
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
      // SAFEGUARD: Legacy files not in tsconfig (parsing errors)
      "apps/web/lib/**",
      "apps/web/components/**",
      "apps/web/instrumentation.ts",
      "apps/web/vitest.setup.ts",
      "**/__tests__/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      // Migrated from apps/web/.eslintignore
      "apps/web/app/api/__tests__/**",
      "apps/web/app/api/batch/__tests__/**",
      "apps/web/app/api/onboarding/__tests__/**",
      "apps/web/src/lib/*.test.ts",
      "apps/web/src/lib/*.test.tsx",
      "apps/web/src/lib/userProfile.test.ts",
      "apps/web/components/ui/**",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
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
      // SAFEGUARD: Pattern detected 87x - Firebase/Firestore returns untyped data
      // TODO: Create typed wrappers in src/lib/firebase/typed-wrappers.ts
      // Note: Type-aware rules disabled in main config, enabled per workspace
      // "@typescript-eslint/no-unsafe-assignment": "warn",
      // "@typescript-eslint/no-unsafe-member-access": "warn",
      // "@typescript-eslint/no-unsafe-call": "warn",
      // "@typescript-eslint/no-unsafe-argument": "warn",
      // "@typescript-eslint/no-unsafe-return": "warn",
      // SAFEGUARD: Pattern detected 45x - SDK factory handlers don't always need await
      // Note: Type-aware rule disabled in main config, enabled per workspace
      // "@typescript-eslint/require-await": "warn",
      // SAFEGUARD: Pattern detected 8x - Event handlers with promises (React patterns)
      // Note: Type-aware rule disabled in main config, enabled per workspace
      // "@typescript-eslint/no-misused-promises": "warn",
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
    files: [
      "apps/web/app/api/onboarding/__tests__/**",
      "apps/web/app/api/onboarding/**/__tests__/**",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Test files: allow globals like describe/it/beforeAll provided by Vitest/Jest
  {
    files: ["**/*.test.*", "**/*.spec.*", "**/vitest.setup.ts", "**/__tests__/**"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    rules: {
      // Turn off no-undef for test globals to avoid editor warnings
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Scripts & tooling: plain JS — do not run type-aware TS rules
  {
    files: [
      "scripts/**/*.js",
      "scripts/**/*.mjs",
      "scripts/**/*.cjs",
      "tools/**/*.js",
      "tools/**/*.mjs",
      "tools/**/*.cjs",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      globals: { node: true },
    },
    rules: {
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-array-delete": "off",
    },
  },
];
