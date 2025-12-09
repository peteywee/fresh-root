---
agent: "agent"
description: "Security audit based on OWASP Top 10 and codebase patterns"
tools:
  [
    "search/codebase",
    "search",
    "problems",
    "usages",
  ]
---

# Security Audit

## Directive

Perform a security audit on: `${input:Scope}`

Scope can be: file path, feature name, or "full" for complete audit.

## Audit Checklist

### A01: Broken Access Control
- [ ] All API routes use SDK factory (createOrgEndpoint, etc.)
- [ ] Organization scoping on all data queries
- [ ] Role checks appropriate for operation
- [ ] No direct database access without auth

### A02: Cryptographic Failures
- [ ] No hardcoded secrets
- [ ] Passwords hashed properly (if applicable)
- [ ] HTTPS enforced
- [ ] Sensitive data encrypted at rest

### A03: Injection
- [ ] All inputs validated with Zod
- [ ] No string concatenation in queries
- [ ] XSS prevention (no innerHTML with user data)
- [ ] Command injection prevention

### A05: Security Misconfiguration
- [ ] Security headers present
- [ ] Debug mode disabled in production
- [ ] Error messages don't leak info
- [ ] Default credentials removed

### A07: Auth Failures
- [ ] Session cookies have proper flags
- [ ] Rate limiting on auth endpoints
- [ ] Brute force protection
- [ ] Session invalidation works

### A10: SSRF
- [ ] External URLs validated
- [ ] Allowlist for external requests
- [ ] No user-controlled URLs in server requests

## Pattern Checks

### SDK Factory Usage
Search for API routes not using SDK factory:
```
grep -r "export async function (GET|POST|PUT|DELETE)" apps/web/app/api/
```

### Org Scoping
Search for queries without org context:
```
grep -r "db.collection(" --include="*.ts" | grep -v "orgId"
```

### Secret Detection
Search for potential secrets:
```
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

### [CRITICAL/HIGH/MEDIUM/LOW] Finding Title
**Location**: [file:line]
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
