# API Routes Master Reference

This is the consolidated master reference for all API routes in the project.

**Generated on**: November 12, 2025  
**Location**: `apps/web/app/api/**/route.ts`  
**Symlinks**: Each route gets a `.md` file in `docs/api/` that points here

## How to use this file

1. All individual API route documentation files (e.g., `health.md`) are **symlinks** pointing to this file
2. When you need route documentation, the symlink provides the same content
3. To update docs for a route, edit its implementation in `apps/web/app/api/` and the symlink will reflect changes
4. Run `pnpm exec node scripts/ci/auto-symlink-docs.mjs` to auto-generate symlinks for new routes

## Route Categories

### Health & Monitoring

- **GET /api/health** - Simple health check
- **GET /api/healthz** - Liveness probe for load balancers
- **GET /api/metrics** - System metrics and statistics

### Session & Auth

- **GET /api/session** - Get current session
- **POST /api/session/bootstrap** - Initialize user session with profile

### Authentication

- **POST /api/auth/mfa/setup** - Setup multi-factor authentication
- **POST /api/auth/mfa/verify** - Verify MFA token

### Onboarding

- **POST /api/onboarding/verify-eligibility** - Check user eligibility for network creation
- **POST /api/onboarding/admin-form** - Submit admin form with compliance data
- **POST /api/onboarding/create-network-org** - Create network, org, and venue
- **POST /api/onboarding/create-network-corporate** - Create network and corporate entity
- **POST /api/onboarding/join-with-token** - Join existing organization with token
- **POST /api/onboarding/profile** - Capture user profile during onboarding
- **POST /api/onboarding/activate-network** - Activate pending network

### Organizations

- **GET /api/organizations** - List organizations
- **POST /api/organizations** - Create organization
- **GET /api/organizations/:id** - Get organization details
- **PATCH /api/organizations/:id** - Update organization
- **GET /api/organizations/:id/members** - List organization members
- **POST /api/organizations/:id/members** - Add member to organization
- **GET /api/organizations/:id/members/:memberId** - Get member details
- **PATCH /api/organizations/:id/members/:memberId** - Update member
- **DELETE /api/organizations/:id/members/:memberId** - Remove member

### Schedules

- **GET /api/schedules** - List schedules
- **POST /api/schedules** - Create schedule
- **GET /api/schedules/:id** - Get schedule details
- **PATCH /api/schedules/:id** - Update schedule
- **POST /api/publish** - Publish schedule

### Shifts

- **GET /api/shifts** - List shifts
- **POST /api/shifts** - Create shift
- **GET /api/shifts/:id** - Get shift details
- **PATCH /api/shifts/:id** - Update shift

### Positions

- **GET /api/positions** - List positions
- **POST /api/positions** - Create position
- **GET /api/positions/:id** - Get position details
- **PATCH /api/positions/:id** - Update position

### Venues

- **GET /api/venues** - List venues
- **POST /api/venues** - Create venue

### Zones

- **GET /api/zones** - List zones
- **POST /api/zones** - Create zone

### Attendance

- **POST /api/attendance** - Record attendance (check-in/out)

### Utilities

- **GET /api/join-tokens** - List join tokens
- **POST /api/items** - Create item
- **POST /api/internal/backup** - Backup system data

### User Profile

- **GET /api/users/profile** - Get user profile

---

## Guidelines for API Routes

1. **Always export a handler function** (GET, POST, PATCH, DELETE, etc.)
2. **Validate input with Zod** - use centralized schemas from `apps/web/app/api/_shared/validation.ts`
3. **Use security middleware** - apply `withSecurity()` for authentication
4. **Document endpoints with JSDoc** - include purpose, parameters, and error codes
5. **Return canonical error responses** - follow `ErrorResponseSchema` format
6. **Include request logging** - use `withRequestLogging()` for audit trails

---

See `.github/workflows/doc-parity.yml` for automated validation of API documentation.
