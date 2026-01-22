---

applyTo: "\*"
description: "Security standards based on OWASP Top 10, AI safety, and responsible AI usage."
## priority: 3

# Security & Safety Standards
## Core Principle
**Security-first mindset.** When in doubt, choose the more secure option. Never sacrifice security
for convenience.

---

## OWASP Top 10 Compliance

### A01: Broken Access Control

**Enforce Principle of Least Privilege**

```typescript
// ❌ Bad - No access control
export async function GET(request: NextRequest) {
  const data = await db.collection("schedules").get();
  return NextResponse.json(data);
}

// ✅ Good - Org scoping enforced
export const GET = createOrgEndpoint({
  handler: async ({ context }) => {
    const data = await db.collection(`orgs/${context.org!.orgId}/schedules`).get();
    return NextResponse.json(data);
  },
});
```

**Deny by Default**: Access only if explicitly allowed.

### A02: Cryptographic Failures

- Use modern algorithms: Argon2 or bcrypt for passwords
- Never MD5 or SHA-1 for security purposes
- Always HTTPS in production
- Encrypt sensitive data at rest (AES-256)
- Never hardcode secrets

```typescript
// ❌ Bad
const API_KEY = "sk-abc123";

// ✅ Good
const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error("API_KEY not configured");
```

### A03: Injection Prevention

**Parameterized Queries Only**

```typescript
// ❌ Bad - SQL injection risk
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// ✅ Good - Parameterized
const result = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
```

**XSS Prevention**

```typescript
// ❌ Bad
element.innerHTML = userContent;

// ✅ Good
element.textContent = userContent;
// Or with sanitization:
element.innerHTML = DOMPurify.sanitize(userContent);
```

**Input Validation**

```typescript
// ✅ Always validate with Zod at boundaries
const InputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

const validated = InputSchema.parse(body);
```

### A05: Security Misconfiguration

**Security Headers Required**

```typescript
// Applied automatically by SDK factory
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

**Disable Debug in Production**

```typescript
if (process.env.NODE_ENV === "production") {
  // No verbose errors
  // No debug endpoints
  // No development tools
}
```

### A07: Authentication Failures

**Session Security**

```typescript
// Session cookie flags (required)
Set-Cookie: session=${value}; HttpOnly; Secure; SameSite=Lax; Path=/
```

**Brute Force Protection**

```typescript
export const POST = createRateLimitedEndpoint({
  rateLimit: { maxRequests: 5, windowMs: 60000 }, // 5 attempts per minute
  handler: async ({ request }) => {
    // Login logic
  },
});
```

### A08: Data Integrity

**Never deserialize untrusted data without validation**

```typescript
// ❌ Bad
const data = JSON.parse(untrustedInput);
await processData(data);

// ✅ Good
const parsed = SafeSchema.safeParse(JSON.parse(untrustedInput));
if (!parsed.success) throw new ValidationError(parsed.error);
await processData(parsed.data);
```

### A10: SSRF Prevention

**Validate all URLs from user input**

```typescript
// ✅ Allowlist for external requests
const ALLOWED_HOSTS = ["api.trusted.com", "cdn.trusted.com"];

function validateUrl(url: string): boolean {
  const parsed = new URL(url);
  return ALLOWED_HOSTS.includes(parsed.hostname);
}
```

---

## AI Safety & Prompt Engineering

### Never Generate Harmful Content

Refuse requests for:

- Illegal activities
- Violence or harm
- Harassment or hate speech
- Private information exposure
- Copyright infringement

Response: "Sorry, I can't assist with that."

### Prompt Injection Prevention

**System Prompt Isolation**

```typescript
// ❌ Bad - User input in system prompt
const prompt = `You are helpful. User says: ${userInput}`;

// ✅ Good - Clear separation
const systemPrompt = "You are a helpful coding assistant.";
const messages = [
  { role: "system", content: systemPrompt },
  { role: "user", content: sanitizeInput(userInput) },
];
```

### Bias Mitigation

- Use inclusive language
- Consider diverse user populations
- Test for bias in outputs
- Document limitations

### Responsible AI Usage

- Be transparent about AI limitations
- Don't claim false capabilities
- Acknowledge uncertainty
- Protect user privacy

---

## Fresh Schedules Security Patterns

### SDK Factory (Required for API Routes)

```typescript
// ✅ All API routes MUST use SDK factory
export const GET = createOrgEndpoint({
  roles: ["manager"],
  handler: async ({ context }) => {
    // Auth, org context, rate limiting automatic
  },
});
```

### Organization Isolation (Always)

```typescript
// ❌ Never query without org scoping
await db.collection("schedules").get();

// ✅ Always scope to organization
await db.collection(`orgs/${context.org!.orgId}/schedules`).get();
```

### Rate Limiting

```typescript
// Recommended limits
export const POST = createOrgEndpoint({
  rateLimit: {
    maxRequests: 50,   // Write operations: 50/min
    windowMs: 60000
  }
});

// Sensitive operations (auth, payments)
rateLimit: { maxRequests: 10, windowMs: 60000 }
```

### CSRF Protection

Automatic for POST/PUT/PATCH/DELETE via SDK factory.

Disable only for webhooks:

```typescript
export const POST = createPublicEndpoint({
  csrf: false, // Only for external webhooks
  handler: async () => {
    /* ... */
  },
});
```

---

## Security Checklist

### Before Committing Code

- \[ ] No secrets in code (API keys, passwords, tokens)
- \[ ] All inputs validated with Zod
- \[ ] SDK factory used for all API routes
- \[ ] Org scoping on all data queries
- \[ ] Error messages don't leak sensitive info
- \[ ] No debug code/endpoints in production

### Code Review Security Focus

1. Auth/authz correct?
2. Input validation complete?
3. Data scoped to org?
4. Rate limiting applied?
5. Secrets from env vars only?

---

## Veto Triggers (Red Team)

The following **immediately block** delivery:

- ❌ Auth bypass possible
- ❌ Data leakage risk (PII in logs, responses)
- ❌ Insecure defaults
- ❌ Missing access controls
- ❌ Secrets in code
- ❌ SQL/XSS/Command injection possible
- ❌ Missing org scoping on queries

---

**Security is not optional. It's foundational.**

**Last Updated**: December 8, 2025
