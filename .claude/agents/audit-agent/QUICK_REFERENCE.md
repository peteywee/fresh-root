# Audit Agent — Quick Reference

## Invocation

```
Run the audit agent on [scope]
Use the audit agent to perform a security audit on [scope]
```

## Scope Options

- File path: `/path/to/file.ts`
- Feature name: `authentication`, `schedules`
- Full: `full` (audit entire codebase)

## OWASP Checks

- A01: Broken Access Control
- A02: Cryptographic Failures
- A03: Injection
- A05: Security Misconfiguration
- A07: Authentication Failures
- A10: SSRF

## Pattern Checks

- SDK Factory usage
- Organization scoping
- Secret detection
- Zod validation

## Output

```markdown
# Security Audit Report

**Status**: 🟢 PASS / 🟡 WARNINGS / 🔴 FAIL

## Summary

- Critical: [count]
- High: [count]
- Medium: [count]
- Low: [count]

## Findings

### [SEVERITY] Issue

**Location**: file:line **Risk**: [description] **Fix**: [resolution]
```

## See Also

- [README.md](./README.md) — Full documentation
- [AGENT.md](./AGENT.md) — Configuration
