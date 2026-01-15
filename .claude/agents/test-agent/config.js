// [P0][AGENT][CONFIG] Test Agent Machine Configuration
module.exports = {
  agent: {
    id: "test-agent",
    name: "Test Agent",
    description: "Generate and run tests",
    category: "Quality & Process",
    version: "1.0.0",
  },
  invocation: {
    primary: "orchestration",
    patterns: ["Use the test agent to", "Generate tests for", "Run the test agent on"],
  },
  tools: ["search/codebase", "edit/editFiles", "problems", "runTasks", "testFailure"],
  testTypes: ["Unit Tests (Vitest)", "API Route Tests", "E2E Tests (Playwright)"],
  commands: {
    unit: "pnpm test",
    coverage: "pnpm test:coverage",
    e2e: "pnpm test:e2e",
    watch: "pnpm test:watch",
  },
};
