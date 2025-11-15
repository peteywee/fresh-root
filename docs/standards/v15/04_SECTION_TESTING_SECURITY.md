# Section 4: Testing, Security & Telemetry Standards (5 Standards)

## 24. 📄 TESTING_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** Process / ALL  
**Purpose:** To define the types of tests required for the project, where they live, and the quality gates they enforce, ensuring code is reliable and regressions are caught early.

### Principles

1. **The Testing Pyramid:** We write many fast unit tests, a moderate number of integration tests, and a few comprehensive end-to-end tests.
2. **Tests Live with Code:** Test files must be co-located with the source code they are testing.
3. **CI is the Gatekeeper:** All tests MUST be executed in the CI pipeline on every pull request. A failing test is a hard block.

### Test Types and Requirements

#### A. Unit Tests (`*.spec.ts` or `*.test.ts`)

- **Scope:** Tests a single function, module, or component in complete isolation.
- **Tools:** `vitest` or `jest` with `React Testing Library`.
- **Location:** Co-located with the source file (e.g., `utils/format-date.ts` and `utils/format-date.spec.ts`).
- **Requirement:** All new business logic MUST be accompanied by unit tests.
- **Code Coverage:** The overall unit test suite MUST maintain a minimum of **80% line coverage**. A PR that lowers coverage below this threshold will fail the CI check.

#### B. Integration Tests (`*-integration.spec.ts`)

- **Scope:** Tests the interaction between several modules. The most critical integration test is a headless test of Firestore rules.
- **Tools:** Firebase Emulator Suite (`@firebase/rules-unit-testing`).
- **Location:** In a dedicated `__tests__/` directory at the package or app level.
- **Requirement:** Any change to `firestore.rules` MUST be accompanied by integration tests that verify the change.

#### C. End-to-End (E2E) Tests (`*.e2e.spec.ts`)

- **Scope:** Tests a full user journey in a browser-like environment.
- **Tools:** `Playwright`.
- **Location:** In the `apps/web/tests/e2e/` directory.
- **Requirement:** The critical user journeys MUST be covered by E2E tests, at minimum including:
  1. The full "Org-Centric Network Creation" onboarding wizard.
  2. User Sign-in (with MFA for admins) and Sign-out.
  3. Creating, updating, and deleting a shift on the schedule.

---

## 25. 📄 SECURITY_HARDENING_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** Process / ALL  
**Purpose:** To provide an actionable checklist of proactive security measures to harden the application against common web vulnerabilities.

### Principles

1. **Trust Nothing:** Treat all external input as untrusted until validated.
2. **Reduce Attack Surface:** Expose the minimum necessary surface area in APIs and database rules.
3. **Secure Dependencies:** Vulnerabilities in dependencies are vulnerabilities in our application.

### The Hardening Checklist

- **`[Dependencies]` Dependency Scanning:** The CI pipeline MUST include a job that runs `pnpm audit --prod`. High or Critical severity vulnerabilities MUST fail the build.
- **`[Input]` Cross-Site Scripting (XSS) Prevention:** The use of `dangerouslySetInnerHTML` is forbidden. All user-generated content must be rendered as text within JSX or properly sanitized if HTML is required.
- **`[Input]` Universal Input Validation:** Every piece of external data entering the system MUST be validated by a Zod schema upon arrival.
- **`[Session]` Secure Cookie Attributes:** All session cookies MUST be set with `HttpOnly`, `Secure`, and `SameSite=Lax` or `Strict`.
- **`[API]` Rate Limiting:** All sensitive API endpoints (authentication, resource creation) MUST be rate-limited.
- **`[Headers]` Security Headers:** The application MUST serve responses with modern security headers, including a strict `Content-Security-Policy` (CSP), `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security`.

---

## 26. 📄 TELEMETRY_LOGGING_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** 02 (API) & Serverless  
**Purpose:** To establish a consistent, structured, and actionable logging standard, enabling effective debugging, monitoring, and observability.

### Principles

1. **Logs are Structured Data:** All logs MUST be emitted as JSON.
2. **Logs Must Be Actionable:** Logs must contain correlation IDs, tenancy info, and actor context.
3. **Never Log Raw PII:** Passwords, API keys, and Tax IDs MUST NEVER appear in logs. Use masking.

### The Standard Log Format (JSON)

Every log entry MUST conform to this base structure:

```json
{
  "timestamp": "2025-11-20T10:00:00.123Z",
  "severity": "INFO",
  "message": "User successfully created organization.",
  "context": {
    "project": "FreshSchedules",
    "source": "ApiRoute:POST /api/orgs",
    "requestId": "uuid-for-this-request",
    "tenancy": {
      "networkId": "net_abc123"
    },
    "actor": {
      "uid": "user_xyz789",
      "role": "network_owner"
    },
    "metadata": {
      "newOrgId": "org_def456"
    }
  }
}
```

**PII Masking:** Use a utility function, `mask(value)`, for sensitive identifiers (e.g., `"taxId": "********1234"`).

---

## 27. 📄 AUDIT_TRAIL_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** 02 (API) & Serverless  
**Purpose:** To ensure that all critical, state-changing actions within the system are recorded in an immutable audit trail for security and compliance.

### Principles

1. **Immutability:** Audit trail entries can be created, but Firestore rules MUST prevent updates and deletes.
2. **Clarity (The 5 Ws):** An audit entry must log: Who, What, When, Where, and From Where (IP).
3. **Asynchronous:** Writing to the audit trail must not block the primary user request.

### Critical Actions to Audit

- **Authentication:** Login success/failure, password change, MFA enrollment.
- **Lifecycle:** `Network created`, `Network status changed`, `Plan changed`.
- **Membership:** `User invited`, `User removed`, `User role changed`.
- **Security:** `API key created`, `Data export requested`.

### The Audit Entry Schema & Rules

**Path:** `networks/{networkId}/audit_trail/{eventId}`

**Rules:** `allow read: if hasRole(networkId, ['network_owner']); allow create: if isBackendService(); allow update, delete: if false;`

```json
{
  "id": "...",
  "timestamp": "...",
  "actor": {
    "uid": "...",
    "role": "...",
    "ipAddress": "..."
  },
  "action": "USER_ROLE_CHANGED",
  "target": {
    "type": "USER",
    "id": "..."
  },
  "details": {
    "before": {
      "role": "staff"
    },
    "after": {
      "role": "org_admin"
    }
  }
}
```

---

## 28. 📄 INPUT_VALIDATION_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** 02 (API), Serverless  
**Purpose:** To enforce a "zero trust" policy for all data entering the system, ensuring every piece of external input is rigorously validated before use.

### Principles

1. **Validate on Entry:** Data must be validated at the system's boundary (API route or Function handler). Once validated, it can be trusted internally for that request's lifecycle.
2. **Deny by Default:** If validation fails, the request must be rejected immediately with a `400` or `422` status code.
3. **Specificity is Key:** Use specific Zod validators (`.email()`, `.uuid()`) instead of generic `z.string()`.

### Sources of Input That MUST Be Validated

- API Request Body (`request.json()`)
- API URL Search Parameters (`request.nextUrl.searchParams`)
- API Dynamic Route Parameters (e.g., `[orgId]`)
- API Request Headers
- Cloud Function `onCall` data
- Webhook payloads from third parties

### The Standard Validation Pattern (API Route)

```typescript
import { CreateOrgSchema } from "@/packages/types/src/org-schema";

export const POST = withApiAuth({
  requiredRole: "network_owner",
  handler: async ({ req, session }) => {
    // 1. Validation is the VERY FIRST step.
    const validationResult = CreateOrgSchema.safeParse(await req.json());

    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    // 2. Now, use the validated data.
    const validatedData = validationResult.data;

    // ... proceed with business logic using validatedData ...
  },
});
```

---

**This completes Section 4: Testing, Security & Telemetry Standards (5 standards). See the Index for navigation to other sections.**
