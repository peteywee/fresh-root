---

title: "L3 — API Endpoints & Contracts"
description: "Catalog of API routes and contracts in Fresh Schedules."
keywords:
	- api
	- endpoints
	- contracts
category: "report"
status: "active"
audience:
	- developers
	- architects
createdAt: "2026-01-31T07:19:00Z"
lastUpdated: "2026-01-31T07:19:00Z"

---

# L3 — API Endpoints & Contracts

This file catalogs all API routes in the Fresh Schedules system. All routes use the SDK Factory
pattern (`createPublicEndpoint`, `createAuthenticatedEndpoint`, `createOrgEndpoint`) for consistent
security, validation, and rate limiting.

---

## 1. Core API Routes

### Health & Monitoring

| Endpoint       | Methods | Factory Type  | Description                    |
| -------------- | ------- | ------------- | ------------------------------ |
| `/api/health`  | GET     | Public        | Health check with dependencies |
| `/api/healthz` | GET     | Public        | Lightweight liveness probe     |
| `/api/metrics` | GET     | Authenticated | Application metrics endpoint   |

### Authentication & Session

| Endpoint                 | Methods   | Factory Type  | Description                     |
| ------------------------ | --------- | ------------- | ------------------------------- |
| `/api/session`           | GET, POST | Authenticated | Session management              |
| `/api/session/bootstrap` | POST      | Authenticated | Session initialization          |
| `/api/auth/mfa/setup`    | POST      | Authenticated | MFA TOTP secret & QR generation |
| `/api/auth/mfa/verify`   | POST      | Authenticated | MFA TOTP verification           |

### Organizations

| Endpoint                                     | Methods         | Factory Type | Description               |
| -------------------------------------------- | --------------- | ------------ | ------------------------- |
| `/api/organizations`                         | GET, POST       | Org          | List/create organizations |
| `/api/organizations/[id]`                    | GET, PATCH, DEL | Org          | Org CRUD by ID            |
| `/api/organizations/[id]/members`            | GET, POST       | Org          | List/add org members      |
| `/api/organizations/[id]/members/[memberId]` | GET, PATCH, DEL | Org          | Member CRUD               |

### Scheduling

| Endpoint              | Methods         | Factory Type | Description           |
| --------------------- | --------------- | ------------ | --------------------- |
| `/api/schedules`      | GET, POST       | Org          | List/create schedules |
| `/api/schedules/[id]` | GET, PATCH, DEL | Org          | Schedule CRUD by ID   |
| `/api/shifts`         | GET, POST       | Org          | List/create shifts    |
| `/api/shifts/[id]`    | GET, PATCH, DEL | Org          | Shift CRUD by ID      |
| `/api/positions`      | GET, POST       | Org          | List/create positions |
| `/api/positions/[id]` | GET, PATCH, DEL | Org          | Position CRUD by ID   |

### Venues & Zones

| Endpoint      | Methods         | Factory Type | Description        |
| ------------- | --------------- | ------------ | ------------------ |
| `/api/venues` | GET, POST       | Org          | List/create venues |
| `/api/zones`  | GET, PATCH, DEL | Org          | Zone CRUD          |

### Attendance

| Endpoint          | Methods   | Factory Type  | Description                   |
| ----------------- | --------- | ------------- | ----------------------------- |
| `/api/attendance` | GET, POST | Authenticated | Attendance records management |

### Onboarding Flow

| Endpoint                              | Methods | Factory Type  | Description                      |
| ------------------------------------- | ------- | ------------- | -------------------------------- |
| `/api/onboarding/verify-eligibility`  | GET     | Authenticated | Check user eligibility           |
| `/api/onboarding/admin-form`          | POST    | Authenticated | Submit admin responsibility form |
| `/api/onboarding/profile`             | POST    | Authenticated | Create/update user profile       |
| `/api/onboarding/create-network-org`  | POST    | Authenticated | Create network organization      |
| `/api/onboarding/create-network-corp` | POST    | Authenticated | Create network corporate entity  |
| `/api/onboarding/activate-network`    | POST    | Authenticated | Activate network                 |
| `/api/onboarding/join-with-token`     | POST    | Authenticated | Join org via invite token        |

### Utilities

| Endpoint           | Methods   | Factory Type | Description        |
| ------------------ | --------- | ------------ | ------------------ |
| `/api/batch`       | POST      | Org          | Batch operations   |
| `/api/items`       | GET, POST | Org          | Generic items CRUD |
| `/api/widgets`     | GET, POST | Org          | Widgets management |
| `/api/join-tokens` | GET, POST | Org          | Manage join tokens |
| `/api/publish`     | POST      | Org          | Publish schedules  |

### Internal/Admin

| Endpoint               | Methods | Factory Type  | Description               |
| ---------------------- | ------- | ------------- | ------------------------- |
| `/api/internal/backup` | POST    | Authenticated | Trigger backup operations |
| `/api/users/profile`   | GET     | Authenticated | User profile management   |

---

## 2. SDK Factory Types

All routes use one of these factory types:

```typescript
createPublicEndpoint; // No auth required
createAuthenticatedEndpoint; // Auth required, no org context
createOrgEndpoint; // Auth + org membership required
createAdminEndpoint; // Auth + admin/owner role required
```

---

## 3. Shared Middleware

Located in `apps/web/app/api/_shared/`:

| File                       | Purpose                                 |
| -------------------------- | --------------------------------------- |
| `middleware.ts`            | Core request middleware (logging, auth) |
| `rate-limit-middleware.ts` | Rate limiting implementation            |
| `security.ts`              | Security headers, CSRF protection       |
| `validation.ts`            | Zod validation helpers                  |
| `response.ts`              | Standardized response builders          |
| `logging.ts`               | Structured logging                      |
| `otel.ts`, `otel-init.ts`  | OpenTelemetry instrumentation           |

---

## 4. Input Validation

All POST/PUT/PATCH routes use Zod schemas from `@fresh-schedules/types`:

- `CreateScheduleSchema`, `UpdateScheduleSchema`
- `CreateShiftSchema`, `UpdateShiftSchema`
- `CreatePositionSchema`, `UpdatePositionSchema`
- `CreateAttendanceRecordSchema`
- `AdminResponsibilityFormSchema`
- `CreateBatchSchema`

---

## 5. Rate Limiting

Default limits applied via SDK factory:

| Operation Type   | Limit       |
| ---------------- | ----------- |
| Read operations  | 100 req/min |
| Write operations | 50 req/min  |
| Sensitive (auth) | 10 req/min  |

---

**Total API Routes**: 54 files\
**Last Generated**: December 2025
