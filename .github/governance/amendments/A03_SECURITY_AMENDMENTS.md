---

id: A03 extends: 03_DIRECTIVES.md section: D01 Security tags: \[security, D01, patterns, fixes,
vulnerabilities] status: canonical priority: P0

## source: .github/SECURITY_FIXES.md

# Amendment A03: Security Fix Patterns

## Purpose

Extends D01 Security Directive with documented security fix patterns and remediation workflow.

## Security Fix Workflow

### Step 1: Identify Vulnerabilities

- Check GitHub Security / Dependabot alerts
- Prioritize by severity: Critical → High → Moderate → Low
- Document CVE IDs and affected packages

### Step 2: Apply Minimal Upgrades

```bash
# Critical fixes first
pnpm update <package>@<version> --filter <workspace>

# Verify no breaking changes
pnpm -w typecheck
pnpm test
```

### Step 3: Validate

- \[ ] All tests pass
- \[ ] TypeScript compiles
- \[ ] No new vulnerabilities introduced
- \[ ] Document changes in PR

## Common Security Patterns

### SF-001: Rate Limit Implementation

**Problem**: Public endpoints without rate limiting\
**Fix**: Apply rate limiting via SDK factory

```typescript
export const POST = createPublicEndpoint({
  rateLimit: { maxRequests: 10, windowMs: 60000 },
  handler: async () => {
    /* ... */
  },
});
```

### SF-002: Input Validation

**Problem**: Unvalidated user input\
**Fix**: Use Zod schemas at API boundary

```typescript
export const POST = createOrgEndpoint({
  input: CreateEntitySchema, // Auto-validates
  handler: async ({ input }) => {
    /* input is typed & validated */
  },
});
```

### SF-003: Org Scoping

**Problem**: Queries without organization isolation\
**Fix**: Always scope to `context.org.orgId`

```typescript
// ❌ WRONG
const data = await db.collection("schedules").get();

// ✅ CORRECT
const data = await db.collection(`orgs/${context.org!.orgId}/schedules`).get();
```

### SF-004: Session Cookie Flags

**Problem**: Insecure cookie configuration\
**Fix**: Enforce security flags (automatic in SDK factory)

```
HttpOnly; Secure; SameSite=Lax; Path=/
```

### SF-005: CSRF Protection

**Problem**: Mutation endpoints without CSRF protection\
**Fix**: Enabled by default in SDK factory for POST/PUT/PATCH/DELETE

## Security Audit Checklist

Before merging:

- \[ ] No hardcoded secrets (API keys, passwords)
- \[ ] All inputs validated with Zod
- \[ ] SDK factory used for API routes
- \[ ] Org scoping on all queries
- \[ ] Error messages don't leak sensitive info
- \[ ] Dependencies up to date (no critical CVEs)

## Reference

Security alerts: GitHub Security / Dependabot\
OWASP Top 10: `.github/instructions/03_SECURITY_AND_SAFETY.instructions.md`
