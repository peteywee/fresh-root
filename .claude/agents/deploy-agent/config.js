// [P0][AGENT][CONFIG] Deploy Agent Machine Configuration
module.exports = {
  agent: {
    id: "deploy-agent",
    name: "Deploy Agent",
    description: "Build, validate, and deploy",
    category: "Deployment & Release",
    version: "1.0.0",
  },
  invocation: {
    primary: "orchestration",
    patterns: ["Use the deploy agent to deploy to", "Deploy to", "Run the deploy agent for"],
  },
  tools: [
    "runCommands/terminalLastCommand",
    "runTasks",
    "github/github-mcp-server/*",
    "usages",
    "problems",
    "testFailure",
    "todos",
  ],
  environments: ["dev", "staging", "production"],
  preDeploymentChecks: [
    { name: "typecheck", command: "pnpm typecheck", required: true },
    { name: "lint", command: "pnpm lint", required: true },
    { name: "test", command: "pnpm test", required: true },
    { name: "test:rules", command: "pnpm test:rules", required: false },
    { name: "patterns", command: "node scripts/validate-patterns.mjs", required: false, minScore: 90 },
    { name: "build", command: "pnpm build", required: true },
  ],
};
