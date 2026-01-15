// [P0][AGENT][CONFIG] Implement Agent Machine Configuration
// Tags: P0, AGENT, CONFIG

module.exports = {
  agent: {
    id: "implement-agent",
    name: "Implement Agent",
    description: "Execute an implementation plan with validation at each step",
    category: "Code Operations",
    version: "1.0.0",
  },
  invocation: {
    primary: "orchestration",
    patterns: [
      "Use the implement agent to execute a plan",
      "Run the implement agent to implement",
      "Use implement agent to make these changes",
    ],
    examples: [
      "Run the implement agent to create the auth module",
      "Use the implement agent to migrate these routes",
      "Execute the implement plan for schedules",
    ],
  },
  tools: [
    "changes",
    "search/codebase",
    "edit/editFiles",
    "problems",
    "runTasks",
    "runCommands/terminalLastCommand",
    "usages",
  ],
  capabilities: {
    canSearch: true,
    canEdit: true,
    canValidate: true,
    canTest: true,
    canManageTodos: true,
  },
  validationGates: [
    { name: "typecheck", command: "pnpm -w typecheck", required: true },
    { name: "lint", command: "pnpm lint", required: true },
    { name: "test", command: "pnpm test", required: false },
    { name: "patterns", command: "node scripts/validate-patterns.mjs", required: false },
  ],
  taskManagement: {
    todoListEnabled: true,
    maxInProgress: 1,
    markCompletedImmediately: true,
  },
};
