// [P0][AGENT][CONFIG] Iterate Agent Configuration
module.exports = {
  agent: {
    id: "iterate-agent",
    name: "Iterate Agent",
    description: "Multi-agent orchestrator",
    category: "Code Operations",
    version: "1.0.0",
  },
  invocation: {
    primary: "orchestration",
    patterns: ["Use the iterate agent to execute", "Orchestrate", "Run iterate agent"],
  },
  phases: [
    "Objective Analysis",
    "Task Graph Generation",
    "Agent Assignment",
    "Validation (Red Team)",
    "Sr Dev Review",
    "Execution",
  ],
  taskTypes: ["sequential", "parallel", "gate"],
  agentRoles: [
    "architect",
    "implementer",
    "tester",
    "reviewer",
    "docs",
    "ops",
    "security",
    "redteam",
    "srdev",
  ],
};
