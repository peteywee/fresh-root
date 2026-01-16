# Red Team Agent

Red Team attack analysis and vulnerability assessment.

## Overview

The Red Team Agent performs adversarial analysis to identify vulnerabilities and edge cases before code reaches production.

## When to Use

✅ **Use this agent for**:
- Security vulnerability assessment
- Attack simulation on critical features
- Edge case discovery
- Before-merge security check

❌ **Don't use this agent for**:
- General code review (use Review Agent)
- Compliance audit (use Audit Agent)
- Performance analysis

## Invocation

```
Use the red team agent to attack this code
Run the red team agent on the authentication module
Perform a red team analysis on the API routes
```

## Attack Vectors

### Security (SEC)
- SEC-01: Auth bypass
- SEC-02: Data leakage
- SEC-03: Injection attacks
- SEC-04: Access control bypass
- SEC-05: Secret exposure

### Logic (LOG)
- LOG-01: Logic errors
- LOG-02: Race conditions
- LOG-03: Error handling gaps

### Patterns (PAT)
- PAT-01: Pattern compliance
- PAT-02: Type safety
- PAT-03: SDK factory usage

### Edge Cases (EDGE)
- EDGE-01: Null/undefined handling
- EDGE-02: Empty array handling
- EDGE-03: Boundary value handling

## Process

### Stage 1: Attack
For each vector, analyze and attempt to find vulnerabilities.

### Stage 2: Report
Generate attack report with all findings.

### Stage 3: Sr Dev Review
Evaluate findings and provide corrections.

## Output Format

```markdown
# 🔴 RED TEAM ATTACK REPORT
## Target
[What was analyzed]

## Security Checks
- [ ] **SEC-01**: Auth bypass [PASS/FAIL]
  - Finding: [Description]
  - Severity: CRITICAL/HIGH/MEDIUM/LOW
  - Fix: [Required action]

## Logic Checks
[Similar format]

## Pattern Checks
[Similar format]

## Edge Case Checks
[Similar format]

## Sr Dev Review
[Evaluation of findings with justification]
```

## See Also

- [Audit Agent](./../audit-agent/) — Security audit
- [Review Agent](./../review-agent/) — Code review
