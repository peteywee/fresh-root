# API Security Assessment & Hardening Plan

**Date:** November 6, 2025
**Status:** CRITICAL SECURITY GAPS IDENTIFIED
**Priority:** HIGH - Must address before production deployment

---

## Executive Summary

The current API implementation has **authentication** (verifies user identity) but lacks **authorization** (verifies user permissions). This means any authenticated user can access any organization's data and perform any action. Additional security layers are needed before production deployment.

---

## Current Security Posture

### ✅ Implemented Security Controls

1. **Authentication via Firebase Session Cookies**
   - All routes protected by `requireSession` middleware
   - Session cookies verified with Firebase Admin SDK
   - Invalid/expired sessions rejected with 401

1. **Input Validation with Zod**
   - Type-safe validation for all request bodies
   - Schema-based validation with field-level errors
   - Malformed JSON rejected with 400

1. **Request Size Limits**
   - 1MB maximum body size prevents resource exhaustion
   - Content-Length header checked before parsing

1. **Content-Type Enforcement**
   - Only `application/json` accepted
   - Prevents multipart/form-data attacks

1. **Structured Error Responses**
   - Consistent error format
   - Field-level validation errors
   - No stack traces leaked to clients

1. **Observability**
   - OpenTelemetry tracing for all auth operations
   - Sentry error tracking
   - Structured logging with request context

---

## 🚨 Critical Security Gaps (MUST FIX BEFORE PRODUCTION)

### 1. **No Authorization/RBAC Enforcement** ⚠️ CRITICAL

**Risk:** Any authenticated user can:

- Access any organization's data
- Modify schedules they don't own
- Assign themselves admin roles
- Delete positions from other organizations

**Example Attack:**

```bash
# User from Org A can access Org B's data
curl -X GET "https://api.example.com/api/schedules?orgId=org-b" \
  -H "Cookie: session=valid-token-from-org-a"
```

**Fix Required:**

- Add `requireOrgMembership` middleware to verify user belongs to target org
- Add `requireRole` middleware to enforce RBAC (e.g., only managers can publish schedules)
- Validate orgId in every route against user's memberships
- Implement Firestore security rules as backend validation

**Implementation Priority:** P0 (Block 3.3)

---

### 2. **No Rate Limiting** ⚠️ CRITICAL

**Risk:** Vulnerable to:

- Brute force attacks on API endpoints
- Resource exhaustion (DoS)
- Data scraping
- Credential stuffing

**Example Attack:**

```bash
# Spam schedule creation 10,000 times
for i in {1..10000}; do
  curl -X POST "https://api.example.com/api/schedules" \
    -H "Cookie: session=..." \
    -d '{"name":"Spam Schedule '$i'", ...}'
done
```

**Fix Required:**

- Implement rate limiting middleware (Redis-based)
- Limits per endpoint:
  - Read operations: 100 req/min per IP
  - Write operations: 20 req/min per user
  - Authentication: 5 req/min per IP
- Return 429 Too Many Requests with Retry-After header

**Implementation Priority:** P0 (Before public deployment)

---

### 3. **No CSRF Protection** ⚠️ HIGH

**Risk:** Malicious websites can trigger API requests with user's session cookie

**Example Attack:**

```html
<!-- Malicious site at evil.com -->
<form action="https://api.yourapp.com/api/organizations/org-1/members" method="POST">
  <input type="hidden" name="uid" value="attacker-uid">
  <input type="hidden" name="roles" value='["admin"]'>
</form>
<script>document.forms[0].submit()</script>
```

**Fix Required:**

- Add SameSite=Strict to session cookies
- Implement CSRF token middleware for state-changing operations
- Verify Origin/Referer headers
- Use custom headers (X-Requested-With) for AJAX requests

**Implementation Priority:** P0 (Before public deployment)

---

### 4. **Insufficient Input Sanitization** ⚠️ HIGH

**Risk:** XSS attacks via unsanitized string inputs

**Example Attack:**

```json
POST /api/positions
{
  "title": "Server",
  "description": "<img src=x onerror='alert(document.cookie)' />"
}
```

**Fix Required:**

- Add DOMPurify or similar HTML sanitization library
- Escape all user-provided strings before storing
- Add Content-Security-Policy headers
- Validate hex color codes properly (already in schema)

**Implementation Priority:** P1 (Before MVP)

---

## 🟡 High Priority Security Enhancements

### 5. **Missing Security Headers**

**Risk:** Browsers don't apply security protections

**Fix Required:**

```typescript
// Add to middleware.ts or next.config.js
headers: {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}
```

**Implementation Priority:** P1

---

### 6. **No Audit Logging**

**Risk:** Cannot detect, investigate, or prove security incidents

**Fix Required:**

- Log all authentication events (success/failure)
- Log all authorization failures
- Log all data modifications with user, timestamp, before/after
- Store logs in tamper-proof storage (Cloud Logging, Splunk)
- Implement log retention policy (90 days minimum)

**Implementation Priority:** P1 (Required for compliance)

---

### 7. **Array Length Validation Missing**

**Risk:** Memory exhaustion via large arrays

**Example Attack:**

```json
POST /api/organizations/org-1/members
{
  "uid": "user-123",
  "roles": ["staff", "staff", "staff", ... x 10000]
}
```

**Fix Required:**

- Add `.max()` to all array validations in Zod schemas
- Limit roles array to 5 items ✅ (already implemented)
- Limit query result pagination to 100 items ✅ (already implemented)

**Implementation Priority:** P1

---

## 🟢 Medium Priority Hardening

### 8. **Information Disclosure**

**Current Issues:**

- Mock data uses predictable IDs (`org-1`, `pos-1`)
- Error messages too detailed in some cases

**Fix Required:**

- Replace mock data with UUIDs
- Sanitize error messages for production
- Don't expose internal IDs in URLs (use slugs)

**Implementation Priority:** P2

---

### 9. **Timing Attack Vulnerabilities**

**Risk:** Attackers can infer valid usernames/orgs by measuring response times

**Fix Required:**

- Add constant-time comparison for critical operations
- Add random delay to authentication failures
- Return same response time for valid/invalid resources

**Implementation Priority:** P2

---

### 10. **No Request Correlation**

**Risk:** Difficult to track multi-step attacks

**Fix Required:**

- Generate unique request ID for each request
- Include request ID in all logs and error responses
- Use X-Request-ID header

**Implementation Priority:** P2 (Already partially implemented via OpenTelemetry)

---

## Implementation Roadmap

### Phase 1: Critical Fixes (Week 1) - BLOCKER FOR PRODUCTION

- [ ] Implement RBAC authorization middleware
- [ ] Add `requireOrgMembership` check to all routes
- [ ] Add `requireRole` check to write operations
- [ ] Implement rate limiting (Redis)
- [ ] Add CSRF protection
- [ ] Set SameSite=Strict on session cookies

### Phase 2: High Priority (Week 2) - REQUIRED FOR MVP

- [ ] Add input sanitization (DOMPurify)
- [ ] Implement security headers
- [ ] Add comprehensive audit logging
- [ ] Array length validation review
- [ ] Firestore security rules

### Phase 3: Hardening (Week 3) - PRODUCTION READY

- [ ] Timing attack mitigation
- [ ] Replace mock data with production patterns
- [ ] Request correlation improvements
- [ ] Security testing (penetration testing)
- [ ] Security documentation for users

### Phase 4: Advanced (Ongoing)

- [ ] API versioning strategy
- [ ] Request signing for webhooks
- [ ] Intrusion detection system
- [ ] Bug bounty program
- [ ] Regular security audits

---

## Testing Requirements

Before marking security as complete:

1. **Authorization Tests**
   - [ ] User cannot access other orgs' data
   - [ ] Staff cannot perform manager actions
   - [ ] Non-members cannot access org resources

1. **Rate Limiting Tests**
   - [ ] 429 returned after limit exceeded
   - [ ] Retry-After header present
   - [ ] Limits reset after time window

1. **CSRF Tests**
   - [ ] Cross-origin requests blocked
   - [ ] Valid tokens accepted
   - [ ] Invalid tokens rejected

1. **Input Validation Tests**
   - [ ] XSS payloads escaped/rejected
   - [ ] Overlarge arrays rejected
   - [ ] Malformed data rejected

1. **Penetration Testing**
   - [ ] OWASP Top 10 verification
   - [ ] Automated security scanning (Snyk, npm audit)
   - [ ] Manual penetration test by security team

---

## Compliance Considerations

### GDPR (EU Users)

- [ ] Audit logging for data access
- [ ] Data deletion endpoints
- [ ] Consent management
- [ ] Data export functionality

### SOC 2 (Enterprise Customers)

- [ ] Access control policies
- [ ] Audit logging
- [ ] Encryption at rest and in transit
- [ ] Incident response plan

### CCPA (California Users)

- [ ] Data disclosure requirements
- [ ] Opt-out mechanisms
- [ ] Data sale restrictions

---

## Security Contacts

- **Security Lead:** [TBD]
- **Incident Response:** [TBD]
- **Security Email:** <security@yourcompany.com>
- **Bug Bounty:** [TBD]

---

## References

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)

---

**BOTTOM LINE:** The current API is **NOT production-ready** from a security perspective. Authentication works, but authorization, rate limiting, and CSRF protection are missing. These MUST be implemented before any public deployment.

**Recommended Action:** Implement Phase 1 critical fixes immediately (Block 3.3 in roadmap should include this).
