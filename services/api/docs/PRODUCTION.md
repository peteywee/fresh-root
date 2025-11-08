# Production Environment Configuration

## Overview

In production, the API security middleware enforces strict controls that differ significantly from development mode.
This document outlines what's required and how it behaves.

---

## Environment Variables (Production)

### Required

```bash
# Node Environment
NODE_ENV=production

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-production-project
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'

# Security: CORS Origins (REQUIRED in production)
# Comma-separated list of allowed frontend origins
CORS_ORIGINS=https://yourapp.com,https://www.yourapp.com

# API Port
PORT=4000
```

### Optional (with production defaults)

```bash
# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000 # 60 seconds (default)
RATE_LIMIT_MAX=300 # 300 requests per IP per window (default)

# Observability: Error Tracking
SENTRY_DSN=https://...@sentry.io/... # Enables error capture, tracing, profiling

# Observability: Distributed Tracing
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://... # OpenTelemetry trace export

# Caching
REDIS_URL=redis://production-redis:6379
```

**Sentry Configuration:**

- When `SENTRY_DSN` is set, the API automatically captures:
  - Unhandled exceptions and rejections
  - HTTP request traces (10% sample rate by default)
  - Performance profiles (10% sample rate)
- Test with `/debug/sentry` endpoint (throws synthetic error)
- Release tagging uses `npm_package_version` from package.json

**OpenTelemetry Configuration:**

- When `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` is set, the API automatically:
  - Instruments Express routes and HTTP requests
  - Exports traces to OTLP endpoint (Jaeger, Tempo, Honeycomb, etc.)
  - Correlates traces with logs via `traceId` and `spanId`
- Supported backends: Jaeger, Grafana Tempo, Honeycomb, Datadog, New Relic, etc.
- Example endpoints:
  - Jaeger: `http://localhost:4318/v1/traces`
  - Grafana Cloud: `https://otlp-gateway-prod-us-central-0.grafana.net/otlp/v1/traces`
  - Honeycomb: `https://api.honeycomb.io/v1/traces`
- Auto-instruments: Express, HTTP, DNS, Net (FS disabled as too noisy)
- Traces include: `http.method`, `http.url`, `http.status_code`, `http.user_agent`, `service.name`,
  `service.version`

---

## Security Controls Active in Production

### 1. CORS Allowlist (Strict)

**Behavior:**

- `CORS_ORIGINS` environment variable is **REQUIRED** in production (app fails to start without it)
- Only origins in the allowlist receive CORS headers
- Requests from non-allowlisted origins are silently rejected (no CORS headers)
- Preflight OPTIONS requests return 204 for allowed origins

**Example:**

```bash
# Allow two frontend domains
CORS_ORIGINS=https://app.example.com,https://www.example.com
```

**Test:**

```bash
# Allowed origin - gets CORS headers
curl -i -H "Origin: https://app.example.com" https://api.example.com/health

# Blocked origin - no CORS headers
curl -i -H "Origin: https://evil.com" https://api.example.com/health
```

### 2. HSTS (HTTP Strict Transport Security)

**Behavior:**

- Enabled **only** in production (`NODE_ENV=production`)
- Forces HTTPS for 180 days
- Includes subdomains

**Header:**

```http
Strict-Transport-Security: max-age=15552000; includeSubDomains
```

### 3. Security Headers (Always Active)

All responses include:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
X-DNS-Prefetch-Control: off
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-site
```

### 4. Body Size Limits

**Behavior:**

- JSON and URL-encoded payloads capped at **1MB**
- Larger payloads rejected with **413 Payload Too Large**

**Test:**

```bash
# >1MB payload returns 413
curl -X POST https://api.example.com/endpoint \
  -H "Content-Type: application/json" \
  -d '{"big":"'$(python3 -c "print('x'*1200000)")'"}'
```

### 5. Rate Limiting (Per IP)

**Behavior:**

- Default: **300 requests per IP per 60 seconds**
- Tracks IP via `X-Forwarded-For` header (first IP) or socket address
- Returns **429 Too Many Requests** when exceeded
- Includes `Retry-After` header (seconds until reset)

**Configuration:**

```bash
RATE_LIMIT_WINDOW_MS=60000  # 1 minute window
RATE_LIMIT_MAX=300          # 300 requests max
```

**Response when limited:**

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45
Content-Type: application/json

{"error":"rate_limited"}
```

---

## Session Cookies & Authentication

### Session Cookie Minting

**Endpoint:** `POST /session`

**Request:**

```json
{
  "idToken": "firebase-id-token-from-client-sdk"
}
```

**Response (Success):**

```http
HTTP/1.1 200 OK
Set-Cookie: session=<encrypted-session-cookie>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=43200

{"ok":true}
```

**Cookie Attributes (Production):**

- `HttpOnly`: JavaScript cannot access (XSS protection)
- `Secure`: HTTPS only
- `SameSite=Lax`: CSRF protection
- `Max-Age=43200`: 12-hour expiry (configurable)

### Session Verification

**Middleware:** `requireSession`

**Behavior:**

- Reads `session` cookie from request
- Verifies via Firebase Admin `auth.verifySessionCookie()`
- Attaches `userToken` to request with: `{ uid, email, orgId, roles, mfaVerified }`
- Returns **401** if cookie missing or invalid

### MFA Enforcement

**Middleware:** `require2FAForManagers`

**Behavior:**

- Checks if user has role `manager` or `owner`
- If yes, requires `userToken.mfaVerified === true`
- Returns **403** with `{"error":"mfa_required"}` if not verified

---

## Production Deployment Checklist

### Pre-Deploy

- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGINS` with all allowed frontend domains
- [ ] Provide `GOOGLE_APPLICATION_CREDENTIALS_JSON` (service account)
- [ ] Set `FIREBASE_PROJECT_ID`
- [ ] Configure `SENTRY_DSN` for error tracking (optional but recommended)
- [ ] Set up `REDIS_URL` if using caching
- [ ] Review and adjust `RATE_LIMIT_MAX` based on expected traffic

### At Deploy

- [ ] Verify HTTPS is enforced at load balancer/proxy level
- [ ] Ensure `X-Forwarded-For` header is set correctly by proxy (for rate limiting)
- [ ] Test CORS from allowed origins
- [ ] Verify session cookie creation and verification
- [ ] Confirm rate limiting with burst test
- [ ] Check Sentry receives test errors

### Post-Deploy

- [ ] Monitor rate limit 429s (may need to adjust limits)
- [ ] Verify HSTS header present on all responses
- [ ] Check Sentry for unexpected errors
- [ ] Run smoke tests from production frontend

---

## Smoke Test Examples

### 1. Health Check

```bash
curl -i https://api.example.com/health
# Should return 200 with all security headers
```

### 2. CORS Preflight

```bash
curl -i -X OPTIONS https://api.example.com/health \
  -H "Origin: https://app.example.com" \
  -H "Access-Control-Request-Method: GET"
# Should return 204 with ACAO header
```

### 3. Session Flow

```bash
# 1. Get Firebase ID token from client SDK (manual step)
# 2. Exchange for session cookie
curl -i -X POST https://api.example.com/session \
  -H "Content-Type: application/json" \
  -d '{"idToken":"YOUR_FIREBASE_ID_TOKEN"}'
# Should return 200 with Set-Cookie header

# 3. Use session cookie for authenticated request
curl -i https://api.example.com/protected-route \
  -H "Cookie: session=YOUR_SESSION_COOKIE"
# Should return 200 or appropriate response
```

### 4. Rate Limit

```bash
# Burst test (adjust for your limits)
for i in {1..350}; do
  curl -s https://api.example.com/health > /dev/null
done
# Last ~50 should return 429
```

### 5. OpenTelemetry Tracing

```bash
# Make a request and check if traces are exported
curl https://api.example.com/health

# Check your observability backend for traces:
# - Trace should include spans for HTTP request, Express route handler
# - Check for service.name = "fresh-schedules-api"
# - Verify traceId appears in logs for correlation
```

---

## Troubleshooting

### "CORS_ORIGINS required in production"

- **Cause:** `CORS_ORIGINS` env var not set when `NODE_ENV=production`
- **Fix:** Set `CORS_ORIGINS` with comma-separated allowed origins

### Session cookie not set

- **Cause:** Invalid Firebase ID token or Admin SDK misconfigured
- **Fix:** Verify `GOOGLE_APPLICATION_CREDENTIALS_JSON` and `FIREBASE_PROJECT_ID`

### All requests return 429

- **Cause:** Rate limit too low or shared IP (NAT/proxy)
- **Fix:** Increase `RATE_LIMIT_MAX` or implement more sophisticated IP detection

### CORS blocked in browser

- **Cause:** Frontend origin not in `CORS_ORIGINS` allowlist
- **Fix:** Add frontend domain to `CORS_ORIGINS`

### 413 on normal payloads

- **Cause:** Payload exceeds 1MB limit
- **Fix:** Reduce payload size or increase limit in `applySecurity()` (not recommended for production)

---

## Differences from Development

| Feature         | Development            | Production                         |
| --------------- | ---------------------- | ---------------------------------- |
| `CORS_ORIGINS`  | Optional (permissive)  | **Required** (strict allowlist)    |
| HSTS            | Disabled               | **Enabled** (180 days)             |
| Rate Limits     | Defaults (lenient)     | Same defaults but enforced         |
| Session Cookies | `Secure` flag optional | `Secure` **required** (HTTPS only) |
| Error Details   | Verbose stack traces   | Sanitized errors only              |
| Logs            | Debug level            | Info/Warn/Error only               |

---

## Related Files

- `services/api/src/env.ts` - Environment validation
- `services/api/src/mw/security.ts` - Security middleware implementation
- `services/api/src/mw/session.ts` - Session verification and MFA guards
- `services/api/src/index.ts` - Middleware application order
- `docs/PROJECT-BIBLE-v13.md` - Production architecture specification
