// [P0][AGENT][CONFIG] Red Team Agent Machine Configuration
module.exports = {
  agent: {
    id: "red-team-agent",
    name: "Red Team Agent",
    description: "Attack analysis and vulnerability assessment",
    category: "Quality & Process",
    version: "1.0.0",
  },
  invocation: {
    primary: "orchestration",
    patterns: ["Use the red team agent to attack", "Perform a red team analysis on", "Red team"],
  },
  attackVectors: {
    security: ["AUTH_BYPASS", "DATA_LEAKAGE", "INJECTION", "ACCESS_CONTROL", "SECRETS"],
    logic: ["LOGIC_ERRORS", "RACE_CONDITIONS", "ERROR_HANDLING"],
    patterns: ["PATTERN_COMPLIANCE", "TYPE_SAFETY", "SDK_FACTORY"],
    edgeCases: ["NULL_UNDEFINED", "EMPTY_ARRAYS", "BOUNDARY_VALUES"],
  },
};
