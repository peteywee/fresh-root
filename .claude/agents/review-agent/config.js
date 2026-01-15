// [P0][AGENT][CONFIG] Review Agent Machine Configuration
module.exports = {
  agent: {
    id: "review-agent",
    name: "Review Agent",
    description: "Code review with priority tiers",
    category: "Quality & Process",
    version: "1.0.0",
  },
  invocation: {
    primary: "orchestration",
    patterns: ["Use the review agent to review", "Run the review agent on", "Review this code"],
  },
  tools: ["search/codebase", "changes", "problems", "usages", "runTasks"],
  reviewTiers: {
    critical: ["Security", "Correctness", "Breaking Changes", "Data Safety", "Validation", "Org Isolation"],
    important: ["Code Quality", "Test Coverage", "Performance", "Architecture", "Triad of Trust"],
    suggestion: ["Readability", "Optimization", "Best Practices", "Documentation"],
  },
  validationGates: [
    { name: "typecheck", required: true },
    { name: "lint", required: true },
    { name: "patterns", required: false, minScore: 90 },
  ],
};
