# Audit Agent

Security audit based on OWASP Top 10 and codebase patterns.

## Overview

The Audit Agent performs comprehensive security audits following OWASP Top 10 standards and Fresh Schedules security patterns. It identifies vulnerabilities, misconfigurations, and security risks.

## When to Use

✅ **Use this agent for**:
- Security audit of new features before merge
- Compliance checks against OWASP
- Vulnerability assessment
- Secret detection
- Pattern compliance audit

❌ **Don't use this agent for**:
- Code quality review (use Review Agent)
- Attack simulation (use Red Team Agent)
- General testing (use Test Agent)

## Invocation

### Orchestration
```
Run the audit agent on the authentication module
Use the audit agent to audit the entire API layer
Perform a security audit on the new schedule routes
```

## OWASP Checks

### A01: Broken Access Control
- All API routes use SDK factory (createOrgEndpoint, etc.)
- Organization scoping on all data queries
- Role checks appropriate for operation
- No direct database access without auth

### A02: Cryptographic Failures
- No hardcoded secrets
- Passwords hashed properly
- HTTPS enforced
- Sensitive data encrypted at rest

### A03: Injection
- All inputs validated with Zod
- No string concatenation in queries
- XSS prevention (no innerHTML with user data)
- Command injection prevention

### A05: Security Misconfiguration
- Security headers present
- Debug mode disabled in production
- Error messages don't leak info
- Default credentials removed

### A07: Authentication Failures
- Session cookies have proper flags
- Rate limiting on auth endpoints
- Brute force protection
- Session invalidation works

### A10: SSRF
- External URLs validated
- Allowlist for external requests
- No user-controlled URLs in server requests

## Audit Scope

- **file path**: Audit specific file
- **feature name**: Audit entire feature
- **"full"**: Audit complete codebase

## Pattern Checks

### SDK Factory Usage
```bash
grep -r "export async function (GET|POST|PUT|DELETE)" apps/web/app/api/
```

### Org Scoping
```bash
grep -r "db.collection(" --include="*.ts" | grep -v "orgId"
```

### Secret Detection
```bash
grep -rE "(api_key|apiKey|secret|password|token)\s*[=:]" --include="*.ts"
```

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

## Verification Commands
```bash
[Commands to verify fixes]
```
```

## Rules

- Use tools to search, don't assume
- Reference specific files and lines
- Provide actionable fix recommendations
- Prioritize by severity

## See Also

- [Review Agent](./../review-agent/) — Code review
- [Red Team Agent](./../red-team-agent/) — Attack analysis
- [Deploy Agent](./../deploy-agent/) — Deployment security checks
