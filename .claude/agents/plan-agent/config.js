// [P0][AGENT][CONFIG] Plan Agent Machine Configuration
module.exports = {
  agent: {
    id: "plan-agent",
    name: "Plan Agent",
    description: "Create implementation plans",
    category: "Planning & Documentation",
    version: "1.0.0",
  },
  invocation: {
    primary: "orchestration",
    patterns: ["Use the plan agent to create a plan for", "Plan the", "Create a plan for"],
  },
  tools: ["changes", "search/codebase", "edit/editFiles", "fetch", "problems", "runTasks", "search", "usages"],
  planComponents: ["Context Analysis", "TODO List", "Dependency Graph", "Risk Assessment", "Validation Plan"],
  validationCriteria: [
    "TypeScript: 0 errors",
    "Tests: All pass",
    "Pattern score: ≥90",
    "Specific functionality verified",
  ],
};
