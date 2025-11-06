# Security Architecture

## Overview

Fresh Schedules v13 uses a **session-cookie authentication** pattern with Firebase Admin SDK and **optional MFA (Multi-Factor Authentication)** for privileged operations.

## Authentication Flow

### 1. Client Login (Frontend)

```typescript
// User signs in with Firebase Client SDK (Google OAuth or Email Link)
const credential = await signInWithPopup(auth, googleProvider);
const idToken = await credential.user.getIdToken();

// Exchange idToken for session cookie
const response = await fetch("/api/session", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ idToken }),
});

// Server sets HttpOnly session cookie
// Cookie name: "session"
// Properties: HttpOnly, Secure (prod), SameSite=lax, 5-day expiry
```

### 2. Session Validation (API Middleware)

All API routes use `requireSession()` middleware:

```typescript
// apps/web/app/api/_shared/middleware.ts
export async function requireSession(req, handler) {
  const sessionCookie = req.cookies.get("session")?.value;
  if (!sessionCookie) return 401;

  const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
  req.user = { uid: decodedClaims.uid, email: decodedClaims.email, customClaims: decodedClaims };

  return await handler(req);
}
```

### 3. Logout (Clear Session)

```typescript
// DELETE /api/session
// Clears session cookie by setting maxAge=0
await fetch("/api/session", { method: "DELETE" });
```

## Multi-Factor Authentication (MFA)

### Setup Flow

1. **Generate TOTP Secret**

```typescript
POST / api / auth / mfa / setup;
// Requires: valid session cookie
// Returns: { secret, qrCode, otpauthUrl }
```

1. User scans QR code with authenticator app (Google Authenticator, Authy, etc.)

1. **Verify TOTP Token**

```typescript
POST / api / auth / mfa / verify;
Body: {
  (secret, token);
}
// Sets custom claim: mfa: true
```

### Enforcement

Privileged operations use `require2FAForManagers()` middleware:

```typescript
// Checks for mfa=true in custom claims
export async function require2FAForManagers(req, handler) {
  const hasMFA = req.user?.customClaims?.mfa === true;
  if (!hasMFA) return 403; // Forbidden

  return await handler(req);
}
```

**Example:** Creating organizations requires 2FA:

```typescript
// POST /api/organizations
export async function POST(req) {
  return require2FAForManagers(req, async (authReq) => {
    // Only users with MFA enabled can create orgs
    const org = await createOrganization({ ownerId: authReq.user.uid });
    return NextResponse.json(org);
  });
}
```

## Firestore Rules Integration

Security rules enforce MFA at the data layer:

```javascript
// firestore.rules
function hasAnyRole(roles) {
  return request.auth.token.roles.hasAny(roles);
}

function isManager() {
  return hasAnyRole(['org_owner','admin','manager']);
}

// Orgs: write requires manager role (which implies MFA via API middleware)
match /orgs/{orgId} {
  allow update, delete: if isManager();
}
```

**Note:** MFA enforcement happens at the **API layer** (middleware checks custom claim). Rules check roles, and the API only grants manager roles to MFA-verified users.

## Security Properties

- **HttpOnly cookies:** Protects against XSS attacks
- **Secure flag (prod):** Enforces HTTPS
- **SameSite=lax:** Mitigates CSRF attacks
- **5-day session expiry:** Balances UX and security
- **TOTP-based MFA:** Industry-standard 2FA (RFC 6238)
- **Server-side validation:** All auth checks happen server-side
- **No client-side tokens:** ID tokens never stored in localStorage

## Rate Limiting

API routes include rate limiting middleware:

```typescript
// 100 requests per 15-minute window per IP
rateLimit({ maxRequests: 100, windowMs: 15 * 60 * 1000 });
```

## Endpoints Summary

| Endpoint               | Method   | Auth          | Purpose                            |
| ---------------------- | -------- | ------------- | ---------------------------------- |
| `/api/session`         | POST     | None          | Create session cookie from idToken |
| `/api/session`         | DELETE   | None          | Clear session cookie (logout)      |
| `/api/auth/mfa/setup`  | POST     | Session       | Generate TOTP secret + QR code     |
| `/api/auth/mfa/verify` | POST     | Session       | Verify TOTP and set mfa claim      |
| `/api/items`           | GET/POST | Session       | Example protected endpoint         |
| `/api/organizations`   | POST     | Session + 2FA | Privileged operation               |

## Testing

- **Unit tests:** `apps/web/src/__tests__/api-security.spec.ts` (17 test cases)
- **Rules tests:** `tests/rules/firestore.spec.ts` (role-based access)
- **Coverage:** 401 (no session), 401 (invalid session), 403 (no MFA), 200 (success)

## References

- Firebase Admin SDK: [Session Cookies](https://firebase.google.com/docs/auth/admin/manage-cookies)
- TOTP Spec: [RFC 6238](https://tools.ietf.org/html/rfc6238)
- OWASP: [Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
