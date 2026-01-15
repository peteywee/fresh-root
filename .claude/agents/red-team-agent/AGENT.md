---
agent: "red-team-agent"
name: "Red Team Agent"
description: "Red Team attack analysis and vulnerability assessment"
version: "1.0.0"
category: "Quality & Process"
invocation:
  - type: "orchestration"
    pattern: "Use the red team agent to attack"
status: "active"
---

# Red Team Agent

Red Team attack analysis and vulnerability assessment.

## Quick Start

Perform adversarial analysis on code to find vulnerabilities.

## Invocation

```
Use the red team agent to attack this code
Run the red team agent on the authentication module
Perform a red team analysis on the API routes
```

## Attack Vectors

- **Security (SEC)**: Auth bypass, data leakage, injection, access control, secrets
- **Logic (LOG)**: Logic errors, race conditions, error handling
- **Patterns (PAT)**: Pattern compliance, type safety, SDK factory
- **Edge Cases (EDGE)**: Null/undefined, empty arrays, boundary values

## Output Format

```markdown
# 🔴 RED TEAM ATTACK REPORT
## Target: [What was analyzed]

## Security Checks
- [ ] SEC-01: Auth bypass [PASS/FAIL]
- [ ] SEC-02: Data leakage [PASS/FAIL]
- [ ] SEC-03: Injection [PASS/FAIL]

## Logic Checks
- [ ] LOG-01: Logic errors [PASS/FAIL]

## Pattern Checks
- [ ] PAT-01: Compliance [PASS/FAIL]

## Edge Case Checks
- [ ] EDGE-01: Null handling [PASS/FAIL]

## Sr Dev Review
[Evaluation of findings and corrections]
```

## See Also

- [Audit Agent](./../audit-agent/) — Security audit
- [Review Agent](./../review-agent/) — Code review
