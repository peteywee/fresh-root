# Fresh Schedules - Dependency Graph

## Overview

This document visualizes the dependency architecture of the Fresh Schedules monorepo.

## Layer-Based Dependency Graph

```mermaid
graph TD
    subgraph External["🔷 External Dependencies"]
        Firebase["firebase-admin<br/>(firestore, auth)"]
        Next["next/server"]
        Zod["zod"]
        React["react"]
        TS["TypeScript"]
    end

    subgraph Shared["📦 Shared Infrastructure Packages"]
        Types["@fresh-schedules/types<br/>Zod Schemas"]
        Framework["@fresh-schedules/api-framework<br/>SDK Factory"]
        Config["@fresh-schedules/config<br/>Environment"]
        UI["@fresh-schedules/ui<br/>Components"]
    end

    subgraph Routes["🛣️ API Routes (25+)"]
        Schedules["Schedules API<br/>schedules/route.ts<br/>schedules/[id]/route.ts"]
        Shifts["Shifts API<br/>shifts/route.ts<br/>shifts/[id]/route.ts"]
        Positions["Positions API<br/>positions/route.ts<br/>positions/[id]/route.ts"]
        Organizations["Organizations API<br/>organizations/route.ts<br/>organizations/[id]/route.ts"]
        Venues["Venues API<br/>venues/route.ts"]
        Zones["Zones API<br/>zones/route.ts"]
        Session["Session API<br/>session/route.ts<br/>session/bootstrap/route.ts"]
        Onboarding["Onboarding API<br/>create-network-org/route.ts<br/>activate-network/route.ts"]
        Batch["Batch API<br/>batch/route.ts"]
        Publish["Publish API<br/>publish/route.ts"]
    end

    subgraph Data["🔒 Data & Security Layer"]
        Firestore["Firestore Collections<br/>orgs/{orgId}/schedules<br/>orgs/{orgId}/shifts<br/>orgs/{orgId}/positions<br/>orgs/{orgId}/venues"]
        Rules["firestore.rules<br/>Security Rules<br/>RBAC Enforcement"]
    end

    %% Dependencies
    Firebase --> Firestore
    Zod --> Types
    Next --> Routes
    React --> UI
    
    Types --> Framework
    Framework --> Routes
    Types --> Routes
    Config --> Routes
    UI --> Routes
    
    Routes --> Firestore
    Routes --> Firebase
    Firestore --> Rules
    Rules -.validates.-> Routes
    
    style External fill:#e1f5ff
    style Shared fill:#f3e5f5
    style Routes fill:#fff3e0
    style Data fill:#e8f5e9
```

## Request Flow - Detailed

```mermaid
sequenceDiagram
    participant Client as Client
    participant Route as API Route
    participant SDK as SDK Factory
    participant Types as Type Validation
    participant Auth as Authentication
    participant Org as Organization Context
    participant Firestore as Firestore
    participant Rules as Security Rules

    Client->>Route: POST /api/shifts {data}
    activate Route
    
    Route->>SDK: createOrgEndpoint({input, config})
    activate SDK
    
    SDK->>Auth: Verify session cookie
    activate Auth
    Auth->>Auth: Check Firebase token
    Auth-->>SDK: ✅ Authenticated
    deactivate Auth
    
    SDK->>Org: Load organization context
    activate Org
    Org->>Firestore: Query memberships
    Firestore-->>Org: Return membership
    Org->>Org: Verify role >= 'manager'
    Org-->>SDK: ✅ Authorized
    deactivate Org
    
    SDK->>Types: Validate input with Zod
    activate Types
    Types->>Types: Parse & validate schema
    Types-->>SDK: ✅ Valid
    deactivate Types
    
    SDK-->>Route: ✅ All checks passed
    deactivate SDK
    
    Route->>Firestore: Write shift to /orgs/{orgId}/schedules/{id}/shifts
    activate Firestore
    
    Firestore->>Rules: Apply security rules
    activate Rules
    Rules->>Rules: isOrgMember(orgId)
    Rules->>Rules: hasAnyRole(['manager', 'admin', 'org_owner'])
    Rules-->>Firestore: ✅ Allow
    deactivate Rules
    
    Firestore->>Firestore: Create document
    Firestore-->>Route: ✅ Success
    deactivate Firestore
    
    Route->>Route: Format response (201 Created)
    Route-->>Client: {id, orgId, startTime, ...}
    deactivate Route
```

## Module Dependency Chain

```mermaid
graph LR
    A["API Route<br/>shifts/route.ts"]
    B["SDK Factory<br/>createOrgEndpoint"]
    C["Type Validation<br/>CreateShiftSchema"]
    D["Firebase Admin<br/>getFirestore"]
    E["Firestore<br/>Collection"]
    F["Security Rules<br/>firestore.rules"]
    
    A -->|imports| B
    A -->|imports| C
    B -->|uses| D
    D -->|queries| E
    E -->|enforced by| F
    
    style A fill:#fff3e0
    style B fill:#f3e5f5
    style C fill:#f3e5f5
    style D fill:#e1f5ff
    style E fill:#e8f5e9
    style F fill:#e8f5e9
```

## Triad of Trust - Entity Example (Shifts)

```mermaid
graph TB
    Entity["🎯 Shift Entity"]
    
    subgraph Schema["1️⃣ Schema"]
        ZodFile["packages/types/src/shifts.ts"]
        ZodCode["export const ShiftSchema = z.object({...})<br/>export type Shift = z.infer<typeof ShiftSchema>"]
    end
    
    subgraph API["2️⃣ API Route"]
        RouteFile["apps/web/app/api/shifts/route.ts"]
        RouteCode["import { CreateShiftSchema } from '@fresh-schedules/types'<br/>export const POST = createOrgEndpoint({<br/>  input: CreateShiftSchema,<br/>  handler: async ({ input, context }) => {...}"]
    end
    
    subgraph Rules["3️⃣ Security Rules"]
        RulesFile["firestore.rules"]
        RulesCode["match /orgs/{orgId}/schedules/{scheduleId}/shifts/{shiftId} {<br/>  allow write: if hasAnyRole(orgId, ['manager', 'admin', 'org_owner'])"]
    end
    
    Entity --> Schema
    Entity --> API
    Entity --> Rules
    
    Schema --> ZodFile
    ZodFile --> ZodCode
    
    API --> RouteFile
    RouteFile --> RouteCode
    
    Rules --> RulesFile
    RulesFile --> RulesCode
    
    ZodCode -.sync.-> RouteCode
    RouteCode -.sync.-> RulesCode
    
    style Entity fill:#ff9800
    style Schema fill:#f3e5f5
    style API fill:#fff3e0
    style Rules fill:#e8f5e9
```

## Package Interdependencies

```mermaid
graph TD
    Web["apps/web"]
    
    subgraph Packages["Shared Packages"]
        Types["packages/types"]
        Framework["packages/api-framework"]
        UI["packages/ui"]
        Config["packages/config"]
    end
    
    subgraph External2["External"]
        FbAdmin["firebase-admin"]
        ZodLib["zod"]
        NextLib["next"]
        ReactLib["react"]
    end
    
    Web -->|imports| Types
    Web -->|imports| Framework
    Web -->|imports| UI
    Web -->|imports| Config
    
    Framework -->|imports| Types
    Framework -->|imports| FbAdmin
    
    Types -->|uses| ZodLib
    UI -->|uses| ReactLib
    Web -->|uses| NextLib
    
    style Web fill:#fff3e0
    style Packages fill:#f3e5f5
    style External2 fill:#e1f5ff
```

## Key Dependency Chains

### 1. Type Safety Chain

```
User Input
    ↓
Zod Schema (types package)
    ↓
SDK Factory validation (api-framework)
    ↓
Handler execution
    ↓
TypeScript types ensure safety
```

### 2. Security Chain

```
HTTP Request
    ↓
Firebase Session Cookie
    ↓
Organization Membership Check
    ↓
Role-Based Authorization
    ↓
Rate Limiting
    ↓
Input Validation
    ↓
Handler Execution
    ↓
Firestore Security Rules
    ↓
Document-level access control
```

### 3. Data Flow Chain

```
API Route Handler
    ↓
getFirestore() from firebase-admin
    ↓
Query: /orgs/{orgId}/collections
    ↓
Firestore Evaluates Rules
    ↓
Document Returned (if authorized)
    ↓
Response to Client
```

## Circular Dependencies Check

✅ **No circular dependencies detected**

Key safeguards:

- `types/` package has no dependencies on other packages
- `api-framework/` only depends on `types/` (one-way)
- `apps/web/` depends on packages but not vice versa
- Clear layering prevents cycles

## Import Rules (Enforced)

✅ **Allowed**

- `apps/web` → `packages/*`
- `packages/api-framework` → `packages/types`
- `packages/ui` → `packages/config`
- Any package → External libraries (zod, firebase, react, etc.)

❌ **Prohibited**

- `packages/types` → Any other package (must be zero-dependency)
- `packages/*` → `apps/web` (circular!)
- Circular dependencies between any packages

## Monorepo Package.json Links

| Package | Purpose | Key Exports |
|---------|---------|------------|
| `packages/types` | Zod schemas | `ShiftSchema`, `CreateShiftSchema`, `Shift` type |
| `packages/api-framework` | SDK Factory | `createOrgEndpoint()`, `createAuthenticatedEndpoint()` |
| `packages/ui` | React components | `Button`, `Modal`, etc. |
| `packages/config` | Configuration | Environment variables, constants |
| `packages/rules-tests` | Test infrastructure | Firestore rules testing utilities |

## Repomix Analysis

To generate detailed dependency reports:

```bash
# Machine-readable JSON report
pnpm repomix . --style json --compress --output docs/dep-graph.json

# Human-readable Markdown report
pnpm repomix . --style markdown --output docs/dep-graph.md

# Full XML for integration
pnpm repomix . --style xml --output docs/dep-graph.xml
```

Reports include:

- Complete import/export chains
- File-level dependencies
- Module relationships
- Potential issues (circular deps, unused imports)
- Metrics (LOC, complexity)

## Architecture Principles

1. **Layered**: External → Shared → Application → Data
2. **Type-Safe**: Zod at boundaries for runtime validation
3. **Org-Scoped**: All data queries include organization context
4. **Synchronized**: Triad of Trust (Schema + API + Rules)
5. **Zero-Dependency Core**: `types/` has no package dependencies
6. **Single Responsibility**: Each package has one clear purpose

---

**Generated**: December 12, 2025  
**Tool**: Repomix  
**Status**: Production-Ready ✅
