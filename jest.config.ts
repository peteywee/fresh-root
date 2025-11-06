// [P2][APP][ENV] Jest Config
// Tags: P2, APP, ENV
import type { Config } from "jest";
const config: Config = {
  testEnvironment: "jsdom",
  transform: { "^.+\\.(t|j)sx?$": ["ts-jest", { tsconfig: "tsconfig.json" }] },
  testMatch: ["/tests//.spec.(ts|tsx)"],
  moduleNameMapper: {
    "^@/(.)$": "<rootDir>/$1",
    "^@apps/web/(.*)$": "<rootDir>/apps/web/$1",
  },
  reporters: ["default"],
  setupFilesAfterEnv: [],
  globals: {},
};
export default config;
