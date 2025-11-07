// [P1][TEST][ROOT] Root Vitest configuration
// Tags: P1, TEST, CONFIG
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  // Avoid requiring @vitejs/plugin-react at the repo root; rely on esbuild JSX
  test: {
    globals: true,
    // Use a DOM-like environment for React component tests
    environment: "happy-dom",
    // Start/stop the Next.js dev server for integration tests that hit localhost:3000
    globalSetup: path.resolve(__dirname, "vitest.global-setup.ts"),
    // Reuse the app's setup (jest-dom, router mocks, env)
    setupFiles: [path.resolve(__dirname, "apps/web/vitest.setup.ts")],
    // Provide consistent env vars during unit tests (non-rules)
    env: {
      FIREBASE_PROJECT_ID: "fresh-schedules-dev",
      SESSION_SECRET: "test-secret-please-change",
    },
    // Limit discovery to our intended packages; avoid picking up compiled tests in services/**/dist
    include: [
      "apps/web/src/**/__tests__/**/*.{test,spec}.{ts,tsx,js,jsx}",
      "apps/web/app/**/__tests__/**/*.{test,spec}.{ts,tsx,js,jsx}",
      "apps/web/src/**/*.{test,spec}.{ts,tsx,js,jsx}",
      "apps/web/app/**/*.{test,spec}.{ts,tsx,js,jsx}",
      "packages/**/src/**/__tests__/**/*.{test,spec}.{ts,tsx,js,jsx}",
    ],
    exclude: ["**/node_modules/**", "**/dist/**", "services/**", "tests/rules/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "apps/web/app/**/*.{ts,tsx}",
        "apps/web/src/**/*.{ts,tsx}",
        "packages/**/src/**/*.{ts,tsx}",
      ],
      exclude: ["**/*.d.ts", "**/*.config.*", "**/__tests__/**"],
    },
  },
  esbuild: {
    jsx: "automatic",
    jsxDev: true,
    jsxImportSource: "react",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "apps/web"),
    },
  },
});
