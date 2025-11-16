// [P2][APP][ENV] Jest Rules Config
// Tags: P2, APP, ENV
export default {
  testEnvironment: "node",
  // Explicit list to avoid picking up a broken intermediate file during edits
  testMatch: ["**/tests/rules/**/*.spec.ts", "**/tests/rules/**/*.spec.mts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        diagnostics: true,
        babelConfig: false,
        isolatedModules: true,
      },
    ],
  },
  // Increase timeout to allow emulator startup and test environment initialization
  testTimeout: 30000,
  setupFilesAfterEnv: ["<rootDir>/jest-setup.mjs"],
};
