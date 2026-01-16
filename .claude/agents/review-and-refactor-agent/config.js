// [P0][AGENT][CONFIG] Review & Refactor Agent Configuration
module.exports = {
  agent: {
    id: "review-and-refactor-agent",
    name: "Review & Refactor Agent",
    description: "Review and refactor code",
    category: "Quality & Process",
    version: "1.0.0",
  },
  invocation: {
    primary: "orchestration",
    patterns: ["Use the review and refactor agent to refactor", "Refactor", "Clean up code"],
  },
  guidelines: [
    ".github/instructions/*.md",
    ".github/copilot-instructions.md",
    "docs/standards/CODING_RULES_AND_PATTERNS.md",
  ],
  constraints: {
    keepFilesIntact: true,
    runTests: true,
    cleanAndMaintainable: true,
  },
};
