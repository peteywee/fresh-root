---
agent: "audit-agent"
name: "Audit Agent"
description: "Security audit based on OWASP Top 10 and codebase patterns"
version: "1.0.0"
author: "Fresh Schedules Team"
category: "Quality & Process"
invocation:
  - type: "orchestration"
    pattern: "Use the audit agent to perform a security audit"
    example: "Run the audit agent on the authentication module"
status: "active"
tools:
  - "search"
  - "usages"
  - "problems"
  - "testFailure"
  - "fetch"
---

# Audit Agent

Security audit based on OWASP Top 10 and codebase patterns.

## Quick Start

Use this agent to:
- Perform security audits on code, features, or entire codebase
- Check OWASP Top 10 compliance
- Verify SDK factory usage
- Validate organization scoping
- Detect exposed secrets
- Generate audit reports with findings and fixes

## How to Use

**Orchestration invocation**:
```
Use the audit agent to perform a security audit on [scope]
Run the audit agent on the authentication module
Audit the new API routes for security issues
```

## Audit Scope

- **File path**: Audit specific file
- **Feature name**: Audit entire feature
- **"full"**: Audit complete codebase

## OWASP Checks

- A01: Broken Access Control
- A02: Cryptographic Failures
- A03: Injection
- A05: Security Misconfiguration
- A07: Authentication Failures
- A10: SSRF

## Output Format

```markdown
# Security Audit Report
**Scope**: [What was audited]
**Date**: [Date]
**Status**: 🟢 PASS / 🟡 WARNINGS / 🔴 FAIL

## Summary
- Critical: [count]
- High: [count]
- Medium: [count]
- Low: [count]

## Findings
### [SEVERITY] Finding Title
**Location**: file:line
**Issue**: [Description]
**Risk**: [What could happen]
**Fix**: [How to fix]

## Recommendations
1. [Priority action items]
```

## See Also

- [Review Agent](./../review-agent/) — Code review
- [Red Team Agent](./../red-team-agent/) — Attack analysis
