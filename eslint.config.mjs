import { defineConfig, globalIgnores } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import _import from "eslint-plugin-import";
import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";
import { fixupPluginRules } from "@eslint/compat";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default defineConfig([globalIgnores([
    "**/node_modules/**/*",
    "**/.next/**/*",
    "**/.duplicate-backups/**/*",
    "**/out/**/*",
    "**/dist/**/*",
    "**/build/**/*",
    "**/coverage/**/*",
    "**/docs/**/*",
    "**/reports/**/*",
    "**/.firebase/**/*",
    "**/emulator-data/**/*",
    "**/.emulator-data/**/*",
    "**/.pnpm/**/*",
    "**/pnpm-lock.yaml",
    "**/*.config.js",
    "**/*.config.ts",
    "**/*.config.mjs",
    "**/*.config.cjs",
    "**/firebase-debug.log",
    "**/ui-debug.log",
    "**/firestore-debug.log",
    "**/.turbo/**/*",
]), {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],

    plugins: {
        "@typescript-eslint": typescriptEslint,
        import: fixupPluginRules(_import),
        "react-hooks": fixupPluginRules(reactHooks),
        react,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",
    },

    rules: {
        "@typescript-eslint/no-unused-vars": ["warn", {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_",
        }],

        "@typescript-eslint/no-explicit-any": "off",
        "prefer-const": "warn",
        "no-console": "off",
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",

        "import/order": ["warn", {
            groups: [["builtin", "external"], ["internal"], ["parent", "sibling", "index"]],
            "newlines-between": "always",

            alphabetize: {
                order: "asc",
                caseInsensitive: true,
            },
        }],
    },
}, {
    files: [
        "apps/web/app/api/onboarding/__tests__/**",
        "apps/web/app/api/onboarding/**/__tests__/**",
    ],

    rules: {
        "@typescript-eslint/no-explicit-any": "off",
    },
}, {
    files: ["**/*.test.*", "**/*.spec.*"],

    languageOptions: {
        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",
    },

    rules: {
        "no-undef": "off",
    },
}, {
    files: [
        "scripts/**/*.js",
        "scripts/**/*.mjs",
        "scripts/**/*.cjs",
        "tools/**/*.js",
        "tools/**/*.mjs",
        "tools/**/*.cjs",
    ],

    languageOptions: {
        globals: {
            ...globals.node,
        },

        ecmaVersion: "latest",
        sourceType: "commonjs",
    },

    rules: {
        "@typescript-eslint/await-thenable": "off",
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/no-array-delete": "off",
    },
}, {
    files: ["**/*.{js,cjs,mjs,jsx}"],

    plugins: {
        import: fixupPluginRules(_import),
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },

    rules: {
        "import/order": ["warn", {
            groups: [["builtin", "external"], ["internal"], ["parent", "sibling", "index"]],
            "newlines-between": "always",
            alphabetize: { order: "asc", caseInsensitive: true },
        }],
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off",
    },
}]);
