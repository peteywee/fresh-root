// [P0][AGENT][CONFIG] Document Agent Machine Configuration
module.exports = {
  agent: {
    id: "document-agent",
    name: "Document Agent",
    description: "Generate and update documentation",
    category: "Planning & Documentation",
    version: "1.0.0",
  },
  invocation: {
    primary: "orchestration",
    patterns: ["Use the document agent to document", "Generate documentation for", "Document"],
  },
  documentationTypes: ["Code (JSDoc)", "API", "Architecture (ADR)", "User Guides"],
  validationChecks: [
    "All public APIs have JSDoc",
    "README is current",
    "Examples provided",
    "Architecture documented",
  ],
};
