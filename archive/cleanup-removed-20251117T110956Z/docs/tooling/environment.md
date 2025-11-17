# Environment Variables

Comprehensive guide to environment variables for Fresh Schedules.

## Overview

Fresh Schedules uses environment variables for configuration across different deployment environments (development, test, production). All environment variables are validated using Zod schemas at startup with fail-fast behavior.

## Configuration Files

- **`apps/web/.env.example`** - Template with all available variables
- **`apps/web/.env.local`** - Local development config (not in git)
- **`apps/web/.env.production`** - Production config (deployed separately)
- **`apps/web/src/lib/env.ts`** - Client-side env validation (NEXT_PUBLIC\_ only)
- **`apps/web/src/lib/env.server.ts`** - Server-side env validation

## Quick Start

1. **Copy the example file**:

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

1. **Fill in required values** (see Required Variables below)
1. **Start the development server**:

   ```bash
   pnpm dev
   ```

The app will fail fast with clear error messages if any required variables are missing or invalid.

## Required Variables

### Production (Minimum Required)

These variables **must** be set in production:

| Variable                              | Description                        | Example                            |
| ------------------------------------- | ---------------------------------- | ---------------------------------- |
| `NODE_ENV`                            | Runtime environment                | `production`                       |
| `NEXT_PUBLIC_FIREBASE_API_KEY`        | Firebase API key (public)          | `AIzaSyD...`                       |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`    | Firebase auth domain               | `myapp.firebaseapp.com`            |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`     | Firebase project ID                | `my-project-123`                   |
| `FIREBASE_PROJECT_ID`                 | Firebase project ID (server)       | `my-project-123`                   |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Service account JSON (as string)   | `{"type":"service_account",...}`   |
| `SESSION_SECRET`                      | Secret for session cookies (≥32ch) | `openssl rand -base64 32`          |
| `CORS_ORIGINS`                        | Comma-separated allowed origins    | `https://myapp.com,https://www...` |

### Development (Minimum Required)

For local development, you need at minimum:

| Variable                           | Description         | Example          |
| ---------------------------------- | ------------------- | ---------------- |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`  | Firebase project ID | `demo-fresh`     |
| `NEXT_PUBLIC_FIREBASE_API_KEY`     | Firebase API key    | (from Firebase)  |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth       | `demo-fresh....` |
| `SESSION_SECRET`                   | Session secret      | Any 32+ chars    |

## Variable Reference

### Core Runtime

#### `NODE_ENV`

- **Type**: `"development"` \| `"test"` \| `"production"`
- **Default**: `"development"`
- **Description**: Application runtime environment
- **Required**: No (has default)

#### `PORT`

- **Type**: `string` (number)
- **Default**: `"3000"`
- **Description**: Port for Next.js dev server
- **Required**: No (has default)

### Firebase Client (Browser)

These variables are prefixed with `NEXT_PUBLIC_` and are exposed to the browser bundle.

#### `NEXT_PUBLIC_FIREBASE_API_KEY`

- **Type**: `string`
- **Required**: Yes
- **Description**: Firebase web API key (safe to expose publicly)
- **Example**: `AIzaSyD_Abc123...`

#### `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`

- **Type**: `string`
- **Required**: Yes
- **Description**: Firebase authentication domain
- **Example**: `my-app.firebaseapp.com`

#### `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

- **Type**: `string`
- **Required**: Yes
- **Description**: Firebase project identifier
- **Example**: `my-project-123`

#### `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`

- **Type**: `string`
- **Required**: No
- **Description**: Firebase Cloud Storage bucket
- **Example**: `my-project.appspot.com`

#### `NEXT_PUBLIC_FIREBASE_APP_ID`

- **Type**: `string`
- **Required**: No (but recommended)
- **Description**: Firebase app identifier
- **Example**: `1:123456789:web:abc123`

#### `NEXT_PUBLIC_USE_EMULATORS`

- **Type**: `"true"` \| `"false"`
- **Default**: `"false"`
- **Description**: Connect to Firebase emulators instead of production
- **Usage**: Set to `"true"` for local development with emulators

#### `NEXT_PUBLIC_SENTRY_DSN`

- **Type**: `string`
- **Required**: No
- **Description**: Public Sentry DSN for client-side error tracking
- **Example**: `https://abc123@o123.ingest.sentry.io/456`

### Firebase Admin (Server)

#### `FIREBASE_PROJECT_ID`

- **Type**: `string`
- **Required**: Yes (server-side)
- **Description**: Firebase project ID for admin SDK
- **Note**: Should match `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

#### `GOOGLE_APPLICATION_CREDENTIALS`

- **Type**: `string` (file path)
- **Required**: Yes in production (option 1)
- **Description**: Path to service account JSON file
- **Example**: `/etc/secrets/serviceAccountKey.json`
- **Note**: Either this OR `GOOGLE_APPLICATION_CREDENTIALS_JSON` required

#### `GOOGLE_APPLICATION_CREDENTIALS_JSON`

- **Type**: `string` (JSON as string)
- **Required**: Yes in production (option 2)
- **Description**: Service account JSON as string (preferred for cloud deployments)
- **Example**: `'{"type":"service_account","project_id":"...",...}'`
- **Note**: Automatically validated as valid JSON

### Session & Security

#### `SESSION_SECRET`

- **Type**: `string` (≥32 characters)
- **Required**: Yes in production
- **Description**: Secret key for signing session cookies
- **Generate**:

  ```bash
  openssl rand -base64 32
  ```

- **Security**: Must be kept secret and changed if compromised

#### `SESSION_COOKIE_MAX_AGE`

- **Type**: `string` (number, milliseconds)
- **Default**: `"604800000"` (7 days)
- **Description**: Session cookie lifetime in milliseconds
- **Example**: `"2592000000"` for 30 days

### CORS & Rate Limiting

#### `CORS_ORIGINS`

- **Type**: `string` (comma-separated)
- **Required**: Yes in production
- **Description**: Allowed origins for CORS requests
- **Example**: `https://myapp.com,https://www.myapp.com,https://admin.myapp.com`

#### `RATE_LIMIT_WINDOW_MS`

- **Type**: `string` (number, milliseconds)
- **Default**: `"60000"` (1 minute)
- **Description**: Time window for rate limiting

#### `RATE_LIMIT_MAX`

- **Type**: `string` (number)
- **Default**: `"100"`
- **Description**: Maximum requests per window per IP

### Backup & Cron

#### `BACKUP_CRON_TOKEN`

- **Type**: `string`
- **Required**: Recommended in production
- **Description**: Secret token for authenticating backup cron jobs
- **Generate**:

  ```bash
  openssl rand -hex 32
  ```

- **Usage**: Passed as `Authorization: Bearer <token>` header to `/api/internal/backup`

#### `FIRESTORE_BACKUP_BUCKET`

- **Type**: `string` (GCS URI)
- **Required**: No (defaults in code)
- **Description**: Google Cloud Storage bucket for Firestore exports
- **Example**: `gs://my-backups-bucket`

### Cache & Storage

#### `REDIS_URL`

- **Type**: `string` (connection URL)
- **Required**: No (but recommended for production)
- **Description**: Redis connection URL for caching
- **Example**: `redis://localhost:6379` or `redis://:password@host:port/db`

### Observability - Sentry

#### `SENTRY_DSN`

- **Type**: `string` (DSN URL)
- **Required**: No (but recommended)
- **Description**: Sentry DSN for server-side error tracking
- **Example**: `https://abc123@o123.ingest.sentry.io/456`

#### `SENTRY_ORG`

- **Type**: `string`
- **Required**: No (for source maps upload)
- **Description**: Sentry organization slug
- **Usage**: Used during build for uploading source maps

#### `SENTRY_PROJECT`

- **Type**: `string`
- **Required**: No (for source maps upload)
- **Description**: Sentry project slug
- **Usage**: Used during build for uploading source maps

#### `SENTRY_AUTH_TOKEN`

- **Type**: `string`
- **Required**: No (for source maps upload)
- **Description**: Sentry authentication token
- **Usage**: Used during build for uploading source maps
- **Security**: Keep secret, only needed in CI/CD

### Observability - OpenTelemetry

#### `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`

- **Type**: `string` (URL)
- **Required**: No
- **Description**: OTLP endpoint for distributed tracing
- **Example**: `http://localhost:4318/v1/traces` (Jaeger), `https://api.honeycomb.io/v1/traces` (Honeycomb)

#### `OTEL_EXPORTER_OTLP_HEADERS`

- **Type**: `string` (comma-separated key=value)
- **Required**: No
- **Description**: Headers for OTLP exporter (e.g., API keys)
- **Example**: `x-api-key=your-key,x-team-id=your-team`

#### `OTEL_SERVICE_NAME`

- **Type**: `string`
- **Default**: `"fresh-schedules-web"`
- **Description**: Service name for distributed tracing

#### `OTEL_DEBUG`

- **Type**: `"1"` \| `"0"`
- **Default**: `"0"`
- **Description**: Enable verbose OpenTelemetry debug logging
- **Usage**: Set to `"1"` to debug tracing issues

### Development & Testing

#### `BYPASS_ONBOARDING_GUARD`

- **Type**: `"true"` \| `"false"`
- **Default**: `"false"`
- **Description**: Skip onboarding checks in development
- **Warning**: **MUST BE REMOVED** in production

## Environment Setup by Scenario

### Local Development

```bash
# apps/web/.env.local
NODE_ENV=development
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-fresh
NEXT_PUBLIC_FIREBASE_API_KEY=your-dev-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-fresh.firebaseapp.com
SESSION_SECRET=dev-secret-at-least-32-characters-long
BYPASS_ONBOARDING_GUARD=true
```

### Local Development with Emulators

```bash
# apps/web/.env.local
NODE_ENV=development
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-fresh
NEXT_PUBLIC_FIREBASE_API_KEY=fake-api-key-for-emulators
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-fresh.firebaseapp.com
NEXT_PUBLIC_USE_EMULATORS=true
SESSION_SECRET=dev-secret-at-least-32-characters-long
BYPASS_ONBOARDING_GUARD=true
```

Then start emulators:

```bash
firebase emulators:start
```

### Production

```bash
# Deployed via CI/CD secrets or environment config
NODE_ENV=production
NEXT_PUBLIC_FIREBASE_PROJECT_ID=my-prod-project
NEXT_PUBLIC_FIREBASE_API_KEY=prod-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=my-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=my-app.appspot.com
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
FIREBASE_PROJECT_ID=my-prod-project
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'
SESSION_SECRET=generated-with-openssl-rand-base64-32
CORS_ORIGINS=https://myapp.com,https://www.myapp.com
BACKUP_CRON_TOKEN=generated-with-openssl-rand-hex-32
REDIS_URL=redis://:password@redis-host:6379
SENTRY_DSN=https://your-sentry-dsn
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://api.honeycomb.io/v1/traces
OTEL_EXPORTER_OTLP_HEADERS=x-honeycomb-team=your-key
```

## Validation & Error Handling

### Fail-Fast Behavior

The app validates all environment variables at startup (in `instrumentation.ts`). If validation fails:

1. **Clear error messages** are logged to console
1. **The app exits immediately** with non-zero status
1. **Specific issues** are listed (missing variables, invalid formats, etc.)

Example error output:

```text
[env.server] Environment validation failed:
  - SESSION_SECRET: String must contain at least 32 character(s)
  - CORS_ORIGINS: Required in production
  - GOOGLE_APPLICATION_CREDENTIALS_JSON: must be valid JSON
```

### Production-Specific Validations

Additional checks enforced in production:

- `GOOGLE_APPLICATION_CREDENTIALS` or `GOOGLE_APPLICATION_CREDENTIALS_JSON` required
- `SESSION_SECRET` must be at least 32 characters
- `CORS_ORIGINS` must be configured
- `BACKUP_CRON_TOKEN` warning if missing

### Type Safety

All environment variables are validated with Zod and exported as TypeScript types:

```typescript
import { loadServerEnv } from "@/lib/env.server";
import { webEnv } from "@/lib/env";

// Server-side usage
const serverEnv = loadServerEnv();
console.log(serverEnv.SESSION_SECRET); // Type-safe, validated

// Client-side usage
console.log(webEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID); // Type-safe
```

## Security Best Practices

1. **Never commit** `.env.local` or `.env.production` to version control
1. **Use secrets management** in production (GitHub Secrets, Vercel Environment Variables, etc.)
1. **Rotate secrets regularly**, especially `SESSION_SECRET` and `BACKUP_CRON_TOKEN`
1. **Generate strong secrets** using cryptographically secure methods (openssl, crypto libraries)
1. **Limit access** to environment variables in CI/CD and cloud platforms
1. **Audit variable usage** before adding new public variables (`NEXT_PUBLIC_*`)

## Troubleshooting

### App Won't Start - Missing Environment Variables

**Error**: `Environment validation failed: NEXT_PUBLIC_FIREBASE_API_KEY: Required`

**Solution**: Copy `.env.example` to `.env.local` and fill in required values:

```bash
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your values
```

### Invalid SESSION_SECRET

**Error**: `SESSION_SECRET must be at least 32 characters`

**Solution**: Generate a secure secret:

```bash
openssl rand -base64 32
```

### Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON

**Error**: `GOOGLE_APPLICATION_CREDENTIALS_JSON must be valid JSON`

**Solution**: Ensure the entire JSON is properly escaped as a single-line string:

```bash
# From file
export GOOGLE_APPLICATION_CREDENTIALS_JSON=$(cat serviceAccountKey.json | jq -c .)

# In .env.local (single line, single quotes)
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account","project_id":"...",...}'
```

### CORS Errors in Production

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**: Set `CORS_ORIGINS` with your allowed domains:

```bash
CORS_ORIGINS=https://myapp.com,https://www.myapp.com
```

### Redis Connection Issues

**Error**: `ECONNREFUSED` when connecting to Redis

**Solution**:

- Ensure Redis is running: `redis-cli ping` should return `PONG`
- Check `REDIS_URL` format: `redis://[username]:[password]@[host]:[port]/[db]`
- For local dev: `REDIS_URL=redis://localhost:6379`

## References

- Next.js Environment Variables: <https://nextjs.org/docs/app/building-your-application/configuring/environment-variables>
- Firebase Admin SDK Setup: <https://firebase.google.com/docs/admin/setup>
- Zod Documentation: <https://zod.dev>
- OpenTelemetry Configuration: <https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/>

## See Also

- [SETUP.md](./SETUP.md) - Initial project setup
- [security.md](./security.md) - Security architecture and auth flow
- [RUNBOOKS/](./RUNBOOKS/) - Operational runbooks including backup procedures
