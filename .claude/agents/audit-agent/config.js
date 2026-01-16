// [P0][AGENT][CONFIG] Audit Agent Machine Configuration
// Tags: P0, AGENT, CONFIG

module.exports = {
  agent: {
    id: "audit-agent",
    name: "Audit Agent",
    description: "Security audit based on OWASP Top 10 and codebase patterns",
    category: "Quality & Process",
    version: "1.0.0",
  },
  invocation: {
    primary: "orchestration",
    patterns: [
      "Use the audit agent to perform a security audit on",
      "Run the audit agent on",
      "Audit for security issues",
    ],
    examples: [
      "Run the audit agent on the authentication module",
      "Audit the new API routes for security issues",
      "Use the audit agent to check the database layer",
    ],
  },
  tools: ["search", "usages", "problems", "testFailure", "fetch"],
  capabilities: {
    canSearch: true,
    canFetch: true,
    canAnalyzePatterns: true,
    canGenerateReports: true,
  },
  owaspChecks: [
    "A01: Broken Access Control",
    "A02: Cryptographic Failures",
    "A03: Injection",
    "A05: Security Misconfiguration",
    "A07: Authentication Failures",
    "A10: SSRF",
  ],
  patternChecks: ["SDK Factory Usage", "Org Scoping", "Secret Detection", "Zod Validation"],
};
