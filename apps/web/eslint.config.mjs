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
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",
      "prefer-const": "warn",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // Firebase-heavy directories: suppress no-unsafe-* rules per firebase-typing-and-monorepo-memory.instructions.md
  {
    files: ['app/api/**/*.ts', 'src/lib/**/*.ts', 'lib/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },

  {
    files: [
      "**/*.spec.{ts,tsx,js,jsx}",
      "**/*.test.{ts,tsx,js,jsx}",
      "**/__tests__/**/*.{ts,tsx,js,jsx}",
      "vitest.setup.ts",
    ],
    languageOptions: {
      globals: { ...globals.jest, ...globals.node },
      parser: tseslint.parser,
      parserOptions: {
        // Disable project service for test files to avoid parsing errors
        project: false,
        sourceType: "module",
      },
    },
    rules: {
      "no-console": "off",
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "off",
      // Disable type-aware rules that require parserServices
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },
];
