---

title: "Red Team Workflow - Handoff Protocol"
description: "Red team workflow and handoff protocol for non-trivial responses."
keywords:
  - security
  - workflow
  - red-team
  - handoff
  - validation
category: "guide"
status: "active"
audience:
  - developers
  - security
version: "1.0.0"
owner: "TopShelfService LLC"
related-docs:
  - ./06_INDEX.md
  - ./01_CREWOPS_MANUAL.md
  - ./README.md
createdAt: "2026-01-31T07:18:59Z"
lastUpdated: "2026-01-31T07:18:59Z"

---

# Red Team Workflow & Handoff Protocol
## Overview
Every non-trivial agent response undergoes a three-stage validation workflow before delivery to the
user. This ensures security, logic correctness, and pattern compliance.

```
Agent Response → Red Team Attack → Sr Dev Review → User Delivery
```

---

## Workflow Stages

### Stage 1: Primary Agent Response

The primary agent completes phases A-D of the CrewOps protocol:

```
Phase A: Context Saturation (READ)
Phase B: Hierarchical Decomposition (PLAN)
Phase C: Worker Spawning (TEAM)
Phase D: Action Matrix (EXECUTE)
```

**Output**: Draft response with code, documentation, or analysis.

---

### Stage 2: Red Team Attack

The Security Red Team attacks every aspect of the draft response.

#### Attack Vectors

| Vector                         | Description                  | Check Method                             |
| ------------------------------ | ---------------------------- | ---------------------------------------- |
| **SEC-01: Auth Bypass**        | Can auth be circumvented?    | Review all auth checks, session handling |
| **SEC-02: Data Leakage**       | Is sensitive data exposed?   | Check logs, responses, error messages    |
| **SEC-03: Injection**          | SQL, XSS, command injection? | Validate all input handling              |
| **SEC-04: Access Control**     | Role/org scoping correct?    | Verify RBAC implementation               |
| **SEC-05: Secret Handling**    | Secrets in code/logs?        | Grep for API keys, passwords             |
| **LOG-01: Logic Errors**       | Does the logic make sense?   | Trace data flow, edge cases              |
| **LOG-02: Race Conditions**    | Concurrency issues?          | Check async operations                   |
| **LOG-03: Error Handling**     | All errors caught?           | Review try/catch, fallbacks              |
| **PAT-01: Pattern Compliance** | Follows codebase patterns?   | Compare to existing code                 |
| **PAT-02: Type Safety**        | Types correct and complete?  | Check Zod schemas, inference             |
| **PAT-03: SDK Factory**        | Uses SDK factory correctly?  | Verify createOrgEndpoint usage           |
| **EDGE-01: Null/Undefined**    | Handles missing data?        | Check optional chaining, defaults        |
| **EDGE-02: Empty Arrays**      | Handles empty collections?   | Verify .map(), .filter()                 |
| **EDGE-03: Boundary Values**   | Handles limits correctly?    | Test max/min values                      |

#### Red Team Output Format

```markdown
## 🔴 RED TEAM ATTACK REPORT

### Security Issues

- [[]] **SEC-01**: [PASS/FAIL] Auth bypass check
  - Finding: [Description]
  - Severity: [CRITICAL/HIGH/MEDIUM/LOW]
  - Fix: [Required action]

### Logic Issues

- [[]] **LOG-01**: [PASS/FAIL] Logic verification
  - Finding: [Description]
  - Severity: [CRITICAL/HIGH/MEDIUM/LOW]
  - Fix: [Required action]

### Pattern Issues

- [[]] **PAT-01**: [PASS/FAIL] Pattern compliance
  - Finding: [Description]
  - Severity: [CRITICAL/HIGH/MEDIUM/LOW]
  - Fix: [Required action]

### Edge Cases

- [[]] **EDGE-01**: [PASS/FAIL] Null handling
  - Finding: [Description]
  - Severity: [CRITICAL/HIGH/MEDIUM/LOW]
  - Fix: [Required action]

### Summary

- Total Issues: X
- Critical: X (blocks delivery)
- High: X (should fix)
- Medium: X (recommend fix)
- Low: X (optional)

### Veto Status

🟢 APPROVED / 🔴 BLOCKED
```

#### Veto Triggers (Auto-Block)

The following immediately block delivery:

- ❌ Auth bypass possible
- ❌ Data leakage risk
- ❌ Insecure defaults
- ❌ Missing access controls
- ❌ Secrets in code
- ❌ SQL/XSS injection possible
- ❌ Missing org scoping on data queries

---

### Stage 3: Sr Dev Review

The Sr Dev reviews the Red Team findings and corrects the response.

#### Sr Dev Responsibilities

1. **Evaluate Findings**: Confirm Red Team findings are valid
2. **Apply Fixes**: Correct all CRITICAL and HIGH issues
3. **Validate Fixes**: Ensure fixes don't introduce new issues
4. **Approve/Reject**: Final decision on delivery

#### Sr Dev Correction Criteria

| Finding Severity | Action Required            |
| ---------------- | -------------------------- |
| CRITICAL         | Must fix before delivery   |
| HIGH             | Should fix before delivery |
| MEDIUM           | Document if not fixing     |
| LOW              | Optional, note for future  |

#### Sr Dev Output Format

```markdown
## 👨‍💼 SR DEV REVIEW

### Red Team Findings Addressed

- [[]] SEC-01: Fixed auth check in line 45
- [[]] LOG-01: Added edge case handling
- [[]] PAT-01: Deferred to next iteration (documented)

### Corrections Applied

1. [File:Line] Changed X to Y because Z
2. [File:Line] Added validation for edge case
3. [File:Line] Removed secret from log statement

### Validation Results

- TypeScript: ✅
- Lint: ✅
- Tests: ✅
- Pattern Score: ≥90

### Final Decision

🟢 APPROVED FOR DELIVERY

### Confidence Score

- Security: 95%
- Logic: 90%
- Patterns: 85%
- Overall: 90%
```

---

## Simulated Workflow (Single Response)

For most responses, the workflow executes within a single agent response:

```markdown
## ## Response to: [User Request]

### 🤖 PHASE D: Implementation

[Draft response content here]

---

### 🔴 RED TEAM ATTACK

**Security Checks**

- [[]] SEC-01: Auth validated via createOrgEndpoint
- [[]] SEC-02: No PII in logs
- [[]] SEC-03: Zod validates all inputs
- [[]] SEC-04: Org scoping enforced
- [[]] SEC-05: No secrets in code

**Logic Checks**

- [[]] LOG-01: Logic verified
- [[]] LOG-02: No race conditions
- [[]] LOG-03: Errors caught with proper messages

**Pattern Checks**

- [[]] PAT-01: Follows SDK factory pattern
- [[]] PAT-02: Types inferred from Zod
- [[]] PAT-03: Matches existing route patterns

**Edge Cases**

- [[]] EDGE-01: Optional chaining used
- [[]] EDGE-02: Empty array handling verified
- [[]] EDGE-03: Boundary values tested

**Veto Status**: 🟢 APPROVED

---

### 👨‍💼 SR DEV REVIEW

All checks passed. No corrections needed.

**Confidence Score**: 92%

---

### ✅ VALIDATED RESPONSE

[Final response content here]
```

---

## Manual Workflow (Complex Cases)

For complex requests requiring multiple iterations:

### Step 1: User Invokes Red Team

```
/red-team [paste agent response here]
```

### Step 2: Red Team Returns Findings

Agent responds with attack report.

### Step 3: User Reviews and Requests Fixes

```
Apply fixes for: SEC-01, LOG-02, PAT-01
```

### Step 4: Agent Applies Fixes

Agent corrects issues and re-runs Red Team.

### Step 5: Sr Dev Approval

```
CREWOPS_APPROVE
```

---

## Integration with CrewOps Phase E

The Red Team workflow integrates with CrewOps Phase E (Security Veto + Reflexion):

```
Phase E: Security & Reflexion
├── Mixtural Optimization (reconcile constraints)
├── Red Team Attack (this workflow)
├── Security Veto Check (approve/block)
└── Reflexion Loop (critique, revise)
```

### Activation

Red Team workflow activates automatically for:

- All code generation requests
- All security-related requests
- All API route modifications
- All auth/authz changes
- All database schema changes

### Bypass (Not Recommended)

```
CREWOPS_SKIP_REDTEAM
```

Only use for trivial changes with explicit user acknowledgment.

---

## Slash Command Integration

### /red-team Command

## \`\`\`markdown

agent: "agent"

## description: "Invoke Red Team attack on a response or code"

# Red Team Attack

Analyze the provided content for:

1. Security vulnerabilities (OWASP Top 10)
2. Logic errors and edge cases
3. Pattern compliance violations
4. Type safety issues

Output: Attack report with findings and veto status.

````

### /approve Command
## ```markdown
agent: "agent"
## description: "Sr Dev approval for Red Team findings"
# Sr Dev Approval
Review Red Team findings and either:

1. Apply fixes for identified issues
2. Document reasons for deferring issues
3. Approve or reject for delivery
````

---

## Metrics & Reporting

### Tracked Metrics

| Metric              | Description                        |
| ------------------- | ---------------------------------- |
| Red Team Block Rate | % of responses blocked by Red Team |
| Issue Categories    | Distribution of finding types      |
| Fix Time            | Time from finding to fix           |
| False Positive Rate | % of findings that were incorrect  |
| Escape Rate         | Issues found post-delivery         |

### Continuous Improvement

After each blocked response:

1. Document the finding type
2. Check if safeguard exists
3. If 3+ occurrences → create safeguard
4. Update Red Team checklist if new pattern

---

## Quick Reference

### Veto = Immediate Block

- Auth bypass
- Data leakage
- Injection risk
- Missing access control
- Exposed secrets

### Must Fix Before Delivery

- CRITICAL severity
- HIGH severity
- Tier 0 pattern violations
- Tier 1 pattern violations

### Document and Proceed

- MEDIUM severity (with justification)
- LOW severity (optional)
- Tier 2-3 pattern violations

### Confidence Thresholds

- ≥90%: High confidence, proceed
- 80-89%: Medium confidence, user should verify
- <80%: Low confidence, recommend manual review

---

**Last Updated**: December 8, 2025\
**Owner**: TopShelfService LLC\
**Status**: Active
