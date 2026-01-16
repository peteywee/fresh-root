// [P0][AGENT][CONFIG] Documentation Writer Agent Configuration
module.exports = {
  agent: {
    id: "documentation-writer-agent",
    name: "Documentation Writer Agent",
    description: "Diátaxis documentation expert",
    category: "Planning & Documentation",
    version: "1.0.0",
  },
  invocation: {
    primary: "orchestration",
    patterns: [
      "Use the documentation writer agent to write",
      "Create documentation using",
      "Write documentation for",
    ],
  },
  diataxisFramework: {
    tutorials: "Learning-oriented, practical steps (lesson)",
    howToGuides: "Problem-oriented, specific solutions (recipe)",
    reference: "Information-oriented, technical descriptions (dictionary)",
    explanation: "Understanding-oriented, clarifying topics (discussion)",
  },
  principles: ["Clarity", "Accuracy", "User-Centricity", "Consistency"],
};
