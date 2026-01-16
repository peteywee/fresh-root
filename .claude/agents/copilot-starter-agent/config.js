// [P0][AGENT][CONFIG] Copilot Starter Agent Configuration
module.exports = {
  agent: {
    id: "copilot-starter-agent",
    name: "Copilot Starter Agent",
    description: "Set up Copilot configuration",
    category: "Planning & Documentation",
    version: "1.0.0",
  },
  invocation: {
    primary: "orchestration",
    patterns: ["Use the copilot starter agent to setup", "Configure Copilot for", "Set up Copilot"],
  },
  fileSystemSetup: [
    ".github/copilot-instructions.md",
    ".github/instructions/[lang].instructions.md",
    ".github/prompts/setup-*.prompt.md",
    ".github/agents/[agent].agent.md",
    ".github/workflows/copilot-setup-steps.yml",
  ],
  projectInfo: [
    "Primary Language/Framework",
    "Project Type",
    "Additional Technologies",
    "Team Size",
    "Development Style",
  ],
};
