# Section 3: Firebase Standards (5 Standards)

## 19. 📄 FIREBASE_ENV_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** Infrastructure / Process  
**Purpose:** To define a strict separation of environments, ensuring that production, staging, and development workloads are completely isolated and managed predictably.

### Principles

1. **Total Isolation:** Each environment MUST correspond to a separate Firebase project. There is no sharing of databases, authentication, or storage.
2. **Production is Sacred:** The production Firebase project (`fresh-schedules-prod`) is managed exclusively through automated CI/CD deployments from the `main` branch.
3. **Naming Convention:** Firebase project IDs MUST follow the pattern `fresh-schedules-[environment]`.
4. **Configuration as Code:** Environment-specific configuration MUST be managed through `.env` files and Google Secret Manager, not hardcoded.

### Environment Definitions

| Environment     | Firebase Project ID       | Purpose                               | Deployed From    | Data Policy             |
| --------------- | ------------------------- | ------------------------------------- | ---------------- | ----------------------- |
| **Production**  | `fresh-schedules-prod`    | Live customer data. Maximum security. | `main` branch    | Strictly PII, protected |
| **Staging**     | `fresh-schedules-staging` | Pre-production validation.            | `develop` branch | Anonymized or seeded    |
| **Development** | `firebase-emulator`       | Local developer machines.             | Local            | Fake, ephemeral data    |

The Firebase Emulator Suite is the mandatory standard for all local development.

### The `.firebaserc` Standard

The `.firebaserc` file in the repository root MUST contain the project aliases:

```json
{
  "projects": {
    "production": "fresh-schedules-prod",
    "staging": "fresh-schedules-staging"
  }
}
```

Deployment scripts MUST use these aliases (e.g., `firebase deploy --project staging`).

---

## 20. 📄 FIREBASE_RULES_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** 01 (Rules)  
**Purpose:** To define the structure, helpers, and security principles for our `firestore.rules` and `storage.rules` files, making them readable, maintainable, and secure.

### The Prime Directives of Firestore Rules

1. **Default Deny:** The root of the rules file MUST be `allow read, write: if false;`.
2. **Tenancy is Paramount:** Every rule for tenant-scoped data MUST validate the request against the `networkId` in the user's auth token.
3. **DRY (Don't Repeat Yourself):** Complex conditions MUST be encapsulated in helper functions.

### Standard Structure & Helper Functions

The `firestore.rules` file MUST be structured with helper functions at the top.

#### Required Helper Functions

- `isAuthenticated()`: Checks `request.auth != null`.
- `isNetworkMember(networkId)`: Checks `request.auth.token.networkId == networkId`. **This is the core tenancy check.**
- `getMembership(networkId)`: Gets the user's membership doc from `/networks/{networkId}/memberships/{request.auth.uid}`.
- `hasRole(networkId, allowedRoles)`: Uses `getMembership` to check if the user's role is in the `allowedRoles` list.
- `isIncomingDataValid(schema)`: Validates `request.resource.data` against a simplified schema map.

#### Standard Rule Block

```firestore
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // --- Helper Functions --- //
    // ... all required helpers ...

    // --- Rules --- //
    match /networks/{networkId} {
      allow read: if isNetworkMember(networkId);
      allow create, update, delete: if false; // Backend only

      match /orgs/{orgId} {
        allow write: if isNetworkMember(networkId) && hasRole(networkId, ['network_owner', 'org_admin']);
      }
    }
  }
}
```

---

## 21. 📄 FIREBASE_FUNCTIONS_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** 02 (API) / Serverless  
**Purpose:** To define standards for writing secure, efficient, and maintainable Cloud Functions for background jobs and event-driven logic.

### Principles

1. **API Routes First:** Use Next.js API Routes for all client-callable synchronous endpoints. Use Cloud Functions primarily for background jobs, Firestore triggers, and scheduled tasks.
2. **Idempotency:** Functions triggered by events (e.g., Firestore `onWrite`) MUST be idempotent to handle "at-least-once" delivery.
3. **Regionality and Memory:** Functions must specify a region (`us-central1`) and an explicit memory allocation.

### The Rules

- **Location:** Source code MUST reside in a `/functions` directory at the project root.
- **Handler Signature:** Use `onCall` for callable functions, `onDocumentWritten` for Firestore triggers, and `onSchedule` for cron jobs.
- **Tenancy Enforcement:**
  - Event-driven functions operating with admin privileges MUST extract `networkId` from the event data's document path (`params.networkId`) and use it in all subsequent operations.
  - A function operating on `/networks/A/...` must NEVER touch data in `/networks/B/...`.
- **Secrets Management:** Use `defineSecret` to access secrets from Google Secret Manager. Do not use environment variables for secrets.
- **Logging:** Use structured JSON logging.

---

## 22. 📄 FIREBASE_SECURITY_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** ALL  
**Purpose:** To provide a consolidated checklist of security best practices across all Firebase services.

### Principles

1. **Defense in Depth:** We rely on multiple security layers (App Check, Auth, Rules, API validation).
2. **Principle of Least Privilege:** Firebase IAM roles, API keys, and Firestore rules must grant only minimum necessary permissions.
3. **Audit and Monitor:** Security is a continuous process.

### The Security Checklist

- **`[Authentication]` Custom Claims:** User roles (`org_admin`) and active tenant (`networkId`) MUST be set as custom claims on the user's Firebase Auth token during sign-in. This is the source of truth for all security decisions.
- **`[Authentication]` MFA for Admins:** The sign-in logic must enforce MFA for all `network_owner` and `platform_super_admin` roles.
- **`[Firestore]` Rules are Mandatory:** No database should ever be deployed with permissive rules.
- **`[Firestore]` Lock Down Compliance Docs:** The `networks/{networkId}/compliance` subcollection MUST have the most restrictive rules, allowing read only by `network_owner` and `platform_super_admin`, and being immutable from the client.
- **`[App Check]` App Check is Enabled:** App Check MUST be enabled and enforced for all services.
- **`[API Keys]` API Key Restriction:** All Firebase API keys MUST be restricted to specific domains or apps.
- **`[IAM]` Least Privilege:** Developers should not have "Owner" or "Editor" IAM roles on the production project. Access is granted via specific roles. Deployments are handled by a dedicated CI/CD service account.

---

## 23. 📄 FIRESTORE_SCHEMA_PARITY_STANDARD.md

**Project:** Fresh Schedules  
**Layer:** 01 (Rules)  
**Purpose:** To provide a lightweight, maintainable way to enforce schema validation _within_ `firestore.rules`, acting as a safety net and ensuring parity with the official Zod schemas.

### Principles

1. **Redundancy is a Safeguard:** The Zod schema is primary, but a final check in rules prevents rogue clients from writing malformed data.
2. **Simplicity over Completeness:** Firestore rules should check for the most critical aspects: presence of required fields, correct types, and string/collection size limits.
3. **Maintainability:** Schema rules should be easy to update when Zod schemas change.

### The Standard `isIncomingDataValid()` Approach

A helper function in `firestore.rules` MUST be created for each major entity.

```firestore
// firestore.rules

function isIncomingOrgValid() {
  let data = request.resource.data;
  return
    // Required fields are present
    'networkId' in data && 'displayName' in data && 'isIndependent' in data &&
    // Type checks
    data.networkId is string && data.displayName is string && data.isIndependent is bool &&
    // Content checks
    data.displayName.size() > 2 && data.displayName.size() < 100 &&
    // Prevent extra fields
    data.keys().hasOnly(['id', 'networkId', 'displayName', 'legalName', 'isIndependent', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'primaryContactUid', 'notes']);
}

match /networks/{networkId}/orgs/{orgId} {
  allow create: if isNetworkMember(networkId)
                  && hasRole(networkId, ['network_owner'])
                  && isIncomingOrgValid(); // <-- SCHEMA PARITY CHECK
}
```

---

**This completes Section 3: Firebase Standards (5 standards). See the Index for navigation to other sections.**
