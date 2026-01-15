// [P0][AGENT][CONFIG] Create Plan Agent Configuration
module.exports = {
  agent: {
    id: "create-plan-agent",
    name: "Create Plan Agent",
    description: "Create implementation plan files",
    category: "Planning & Documentation",
    version: "1.0.0",
  },
  invocation: {
    primary: "orchestration",
    patterns: ["Use the create plan agent to create a plan", "Create a plan for", "Plan the"],
  },
  purposePrefixes: ["upgrade", "refactor", "feature", "data", "infrastructure", "architecture", "design", "process"],
  fileLocation: "/plan/",
  fileNamingConvention: "[purpose]-[component]-[version].md",
  frontMatterFields: [
    "goal",
    "version",
    "date_created",
    "last_updated",
    "owner",
    "status",
    "tags",
  ],
  requiredSections: [
    "Context",
    "Tasks",
    "Validation Criteria",
    "Success Metrics",
  ],
  constraints: {
    deterministic: true,
    machineReadable: true,
    atomic: true,
    selfContained: true,
    automatedValidation: true,
  },
};
