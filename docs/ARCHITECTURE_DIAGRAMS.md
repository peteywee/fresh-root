# Fresh Root - Architecture Diagrams

## System Overview

\`\`\`mermaid
graph TB
subgraph "Client Layer"
PWA[Next.js `PWA<br/>`React 18 + TypeScript]
SW[Service `Worker<br/>`Offline Support]
end

```text
subgraph "API Layer"
API[Next.js API Routes<br/>REST + Validation]
MW[Middleware<br/>Auth + RBAC]
end

subgraph "Firebase Backend"
AUTH[Firebase Auth<br/>Identity]
FS[Firestore<br/>NoSQL Database]
ST[Storage<br/>File Storage]
FN[Functions<br/>Backend Logic]
end

subgraph "Security"
FSR[Firestore Rules<br/>RBAC Engine]
STR[Storage Rules<br/>Path-based ACL]
end

subgraph "CI/CD"
GHA[GitHub Actions<br/>CI Pipeline]
CODEQL[CodeQL<br/>Security Scan]
ESLINT[ESLint Agent<br/>Auto-fix]
end

PWA -->|HTTPS| API
PWA <-->|Cache| SW
API -->|Validate| MW
MW -->|Query| AUTH
MW -->|Read/Write| FS
MW -->|Upload| ST
FS -->|Enforce| FSR
ST -->|Enforce| STR

GHA -->|Deploy| API
CODEQL -->|Scan| PWA
ESLINT -->|Fix| PWA

style PWA fill:#4CAF50
style API fill:#2196F3
style FS fill:#FF9800
style FSR fill:#F44336
style GHA fill:#9C27B0
```

\`\`\`

## Monorepo Structure

\`\`\`mermaid
graph LR
ROOT[fresh-`root<br/>`pnpm workspace]

```text
subgraph "Applications"
WEB[apps/web<br/>Next.js PWA]
end

subgraph "Packages"
TYPES[packages/types<br/>Shared Types]
UI[packages/ui<br/>Components]
RULES[packages/rules-tests<br/>Security Tests]
CONFIG[packages/config<br/>Shared Config]
MCP[packages/mcp-server<br/>Dev Tools]
end

subgraph "Services"
APISERV[services/api<br/>Dockerized API]
end

subgraph "Infrastructure"
SCRIPTS[scripts/<br/>Automation]
TESTS[tests/<br/>E2E + Rules]
CI[.github/workflows<br/>CI/CD]
end

ROOT --> WEB
ROOT --> TYPES
ROOT --> UI
ROOT --> RULES
ROOT --> CONFIG
ROOT --> MCP
ROOT --> APISERV
ROOT --> SCRIPTS
ROOT --> TESTS
ROOT --> CI

WEB -.->|uses| TYPES
WEB -.->|uses| UI
UI -.->|uses| TYPES
APISERV -.->|uses| TYPES
RULES -.->|tests| WEB

style ROOT fill:#673AB7
style WEB fill:#4CAF50
style TYPES fill:#FF9800
style CI fill:#2196F3
```

\`\`\`

## Data Flow - Schedule Creation

\`\`\`mermaid
sequenceDiagram
participant U as User (Browser)
participant C as Client (React)
participant API as API Route
participant MW as Middleware
participant FS as Firestore
participant FSR as Firestore Rules

```text
U->>C: Create Schedule Form
C->>C: Validate Input (Zod)
C->>API: POST /api/schedules
API->>MW: Authenticate Request
MW->>MW: Check JWT Token

alt Not Authenticated
MW-->>API: 401 Unauthorized
API-->>C: Error Response
C-->>U: Show Login
else Authenticated
MW->>API: User Context
API->>API: Validate with Zod
API->>FS: Create Document
FS->>FSR: Check Rules

alt Has Permission
FSR-->>FS: Allow Write
FS-->>API: Success + Doc ID
API-->>C: 201 Created
C->>C: Update Cache (React Query)
C-->>U: Show Success
else No Permission
FSR-->>FS: Deny Write
FS-->>API: PERMISSION_DENIED
API-->>C: 403 Forbidden
C-->>U: Show Error
end
end
```

\`\`\`

## CI/CD Pipeline Flow

\`\`\`mermaid
flowchart TD
START([Push/PR Event]) --> CHECKOUT[Checkout Code]
CHECKOUT --> PNPM[Setup pnpm 9.1.0]
PNPM --> INSTALL[Install `Dependencies<br/>`frozen-lockfile]

```text
INSTALL --> PARALLEL{Run in Parallel}

PARALLEL --> LINT[ESLint Check<br/>Non-blocking]
PARALLEL --> TYPE[TypeScript Check<br/>Blocking]
PARALLEL --> CODEQL[CodeQL Scan<br/>Security]

LINT --> LINT_RESULT{Has Errors?}
LINT_RESULT -->|Yes| AUTO_FIX[ESLint Agent<br/>Auto-fix & Commit]
LINT_RESULT -->|No| CONTINUE
AUTO_FIX --> CONTINUE[Continue Pipeline]

TYPE --> TYPE_RESULT{Pass?}
TYPE_RESULT -->|No| FAIL[❌ Fail CI]
TYPE_RESULT -->|Yes| CONTINUE

CONTINUE --> EMULATORS[Start Firebase Emulators]
EMULATORS --> RULES_TESTS[Rules Tests<br/>Firestore + Storage]

RULES_TESTS --> RULES_RESULT{Pass?}
RULES_RESULT -->|No| FAIL
RULES_RESULT -->|Yes| API_TESTS[API Unit Tests]

API_TESTS --> API_RESULT{Pass?}
API_RESULT -->|No| FAIL
API_RESULT -->|Yes| BUILD[Docker Build<br/>API Service]

BUILD --> BUILD_RESULT{Success?}
BUILD_RESULT -->|No| FAIL
BUILD_RESULT -->|Yes| SUCCESS[✅ Pass CI]

CODEQL --> SARIF[Upload SARIF Results]
SARIF --> SECURITY[Security Tab]

SUCCESS --> MERGE_CHECK{PR to main?}
MERGE_CHECK -->|Yes| PATH_GUARD[Path Guard Check]
MERGE_CHECK -->|No| DONE([Done])

PATH_GUARD --> PATH_RESULT{Allowed Paths?}
PATH_RESULT -->|No| FAIL
PATH_RESULT -->|Yes| DONE

style START fill:#4CAF50
style SUCCESS fill:#4CAF50
style FAIL fill:#F44336
style PARALLEL fill:#FF9800
style CODEQL fill:#9C27B0
```

\`\`\`

## Authentication & Authorization Flow

\`\`\`mermaid
flowchart TD
START([User Access App]) --> CHECK_SESSION{`Session<br/>`Valid?}

```text
CHECK_SESSION -->|No| LOGIN[Show Login Page]
CHECK_SESSION -->|Yes| GET_TOKEN[Get Firebase Token]

LOGIN --> AUTH_METHOD{Auth Method?}
AUTH_METHOD -->|Email/Password| EMAIL_AUTH[Firebase Auth<br/>Email/Password]
AUTH_METHOD -->|Google| GOOGLE_AUTH[Firebase Auth<br/>Google OAuth]
AUTH_METHOD -->|Anonymous| ANON_AUTH[Firebase Auth<br/>Anonymous]

EMAIL_AUTH --> SET_TOKEN[Get ID Token]
GOOGLE_AUTH --> SET_TOKEN
ANON_AUTH --> SET_TOKEN

SET_TOKEN --> CUSTOM_CLAIMS[Backend Sets<br/>Custom Claims]
CUSTOM_CLAIMS --> TOKEN_DATA[Token Data:<br/>orgId + roles]

GET_TOKEN --> TOKEN_DATA
TOKEN_DATA --> MIDDLEWARE[Next.js Middleware<br/>Verify Token]

MIDDLEWARE --> VERIFY{Token<br/>Valid?}
VERIFY -->|No| LOGIN
VERIFY -->|Yes| CHECK_ROUTE{Protected<br/>Route?}

CHECK_ROUTE -->|No| ALLOW_PUBLIC[Allow Access]
CHECK_ROUTE -->|Yes| CHECK_ROLE{Has Required<br/>Role?}

CHECK_ROLE -->|No| FORBIDDEN[403 Forbidden]
CHECK_ROLE -->|Yes| CHECK_ORG{Correct<br/>Org?}

CHECK_ORG -->|No| FORBIDDEN
CHECK_ORG -->|Yes| ALLOW_ACCESS[Allow Access]

ALLOW_ACCESS --> API_CALL[API Request]
API_CALL --> FIRESTORE[Firestore Query]

FIRESTORE --> RULES[Security Rules<br/>Evaluation]
RULES --> RULES_CHECK{Rules<br/>Pass?}

RULES_CHECK -->|No| DENY[PERMISSION_DENIED]
RULES_CHECK -->|Yes| DATA[Return Data]

style START fill:#4CAF50
style ALLOW_ACCESS fill:#4CAF50
style DATA fill:#4CAF50
style FORBIDDEN fill:#F44336
style DENY fill:#F44336
```

\`\`\`

## Firestore Data Model

\`\`\`mermaid
erDiagram
USERS ||--o{ MEMBERSHIPS : "belongs to"
ORGS ||--o{ MEMBERSHIPS : "has"
ORGS ||--o{ SCHEDULES : "owns"
ORGS ||--o{ MESSAGES : "contains"
ORGS ||--o{ JOIN_TOKENS : "creates"
USERS ||--o{ SCHEDULES : "creates"
USERS ||--o{ MESSAGES : "sends"

```text
USERS {
string uid PK
string email
string displayName
string photoURL
timestamp createdAt
timestamp updatedAt
}

ORGS {
string orgId PK
string name
string ownerId FK
map members
object settings
timestamp createdAt
}

MEMBERSHIPS {
string membershipId PK
string userId FK
string orgId FK
string role
timestamp joinedAt
string invitedBy
}

SCHEDULES {
string scheduleId PK
string orgId FK
string name
string createdBy FK
timestamp startDate
timestamp endDate
array shifts
boolean published
}

MESSAGES {
string messageId PK
string orgId FK
string senderId FK
string content
timestamp timestamp
array readBy
}

JOIN_TOKENS {
string tokenId PK
string orgId FK
string token
string role
timestamp expiresAt
string createdBy FK
string usedBy
}
```

\`\`\`

## Deployment Architecture

\`\`\`mermaid
graph TB
subgraph "Developer"
DEV[Developer Machine]
GIT[Git Push]
end

```text
subgraph "GitHub"
REPO[GitHub Repository]
ACTIONS[GitHub Actions]
PACKAGES[GitHub Packages<br/>Docker Registry]
end

subgraph "Firebase"
HOSTING[Firebase Hosting<br/>CDN]
AUTH[Firebase Auth]
FIRESTORE[Firestore]
STORAGE[Storage]
FUNCTIONS[Cloud Functions]
end

subgraph "Cloud Run / Vercel"
API1[API Instance 1]
API2[API Instance 2]
LB[Load Balancer]
end

subgraph "Monitoring"
SENTRY[Sentry<br/>Error Tracking]
ANALYTICS[Firebase Analytics]
end

DEV -->|commit & push| GIT
GIT --> REPO
REPO -->|webhook| ACTIONS
ACTIONS -->|build| PACKAGES
ACTIONS -->|deploy| HOSTING
ACTIONS -->|deploy| FUNCTIONS

PACKAGES -->|pull image| API1
PACKAGES -->|pull image| API2

LB -->|route| API1
LB -->|route| API2

HOSTING -->|serves| PWA[PWA Client]
PWA -->|auth| AUTH
PWA -->|api calls| LB
PWA -->|queries| FIRESTORE
PWA -->|uploads| STORAGE

API1 -->|admin sdk| FIRESTORE
API2 -->|admin sdk| FIRESTORE

PWA -->|errors| SENTRY
API1 -->|errors| SENTRY
API2 -->|errors| SENTRY

PWA -->|events| ANALYTICS

style DEV fill:#4CAF50
style ACTIONS fill:#2196F3
style HOSTING fill:#FF9800
style SENTRY fill:#F44336
```

\`\`\`

## Testing Strategy Pyramid

\`\`\`mermaid
graph TB
subgraph "Testing Pyramid"
E2E[E2E `Tests<br/>``Playwright<br/>`5 tests]
INT[Integration `Tests<br/>`Rules `Tests<br/>`20+ tests]
UNIT[Unit `Tests<br/>``Vitest<br/>`100+ tests]
end

```text
subgraph "Test Environments"
PROD[Production<br/>Real Firebase]
STAGE[Staging<br/>Real Firebase]
LOCAL[Local Dev<br/>Firebase Emulators]
end

UNIT -.->|run on| LOCAL
INT -.->|run on| LOCAL
E2E -.->|run on| LOCAL
E2E -.->|run on| STAGE

CI[CI Pipeline] -->|runs| UNIT
CI -->|runs| INT
CI -->|runs| E2E

style E2E fill:#F44336
style INT fill:#FF9800
style UNIT fill:#4CAF50
style CI fill:#2196F3
```

\`\`\`
