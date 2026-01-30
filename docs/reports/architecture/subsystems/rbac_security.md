# L2 — RBAC / Security / Access Control
> **Status:** ✅ Documented from actual codebase analysis **Last Updated:** 2025-12-17 **Coverage:**
> 6 role types, 44 protected endpoints

## 1. Role in the System
The RBAC (Role-Based Access Control) subsystem defines the authorization model for the entire
platform. It enforces who can access what resources based on organizational membership and assigned
roles.

**Core Responsibilities:**

- Define role hierarchy (`org_owner` → `admin` → `manager`/`scheduler` → `corporate` → `staff`)
- Enforce permissions on API endpoints via SDK factory
- Manage organization membership and context
- Support multi-tenancy through network scoping

## 2. Implementation Analysis
### 2.1 Role Hierarchy
From `packages/types/src/rbac.ts`:

```typescript
export const OrgRole = z.enum([
  "org_owner", // Full control over organization
  "admin", // Administrative access
  "manager", // Manage schedules and staff
  "scheduler", // Create/edit schedules (manager-equivalent)
  "corporate", // Corporate network access
  "staff", // View-only/limited access
]);
```

**Permission Levels (Inferred from usage):**

```
org_owner  > admin  > manager  = scheduler  > corporate > staff
  100       80        60          60           20        10
```

### 2.2 Context Loading
All protected endpoints receive:

```typescript
interface RequestContext {
  auth: {
    userId: string;
    email: string;
    emailVerified: boolean;
    customClaims: Record<string, unknown>;
  };
  org: {
    orgId: string;
    role: OrgRole; // User's role in this org
    membershipId: string; // Membership document ID
  } | null;
}
```

### 2.3 Enforcement Mechanisms
**API Level (SDK Factory):**

```typescript
export const POST = createOrgEndpoint({
  roles: ["admin", "manager"], // ✅ Enforced automatically
  handler: async ({ context }) => {
    // context.org.role is guaranteed to be "admin" or "manager"
  },
});
```

**Test Level (from integration.test.ts):**

```typescript
it("should require manager role or higher", () => {
  const roleHierarchy: Record<string, number> = {
    org_owner: 100,
    admin: 80,
    manager: 60,
    scheduler: 60,
    corporate: 20,
    staff: 10,
  };

  userRoles.forEach((role) => {
    const hasPermission = roleHierarchy[role]! >= roleHierarchy[requiredRole]!;
    // Test passes only if role meets minimum level
  });
});
```

## 3. Critical Findings
### 🔴 CRITICAL-01: Role Hierarchy Not Enforced in Code
**Location:** `packages/api-framework/src/index.ts` **Issue:** SDK factory uses exact match, not
hierarchical check

```typescript
// ❌ CURRENT: Exact role match only
if (config.roles && config.roles.length > 0) {
  if (!config.roles.includes(context.org.role)) {
    return forbidden("Insufficient permissions");
  }
}

// This means: roles: ["manager"] does NOT allow "admin" or "org_owner"!
```

**Expected Behavior:**

```typescript
// ✅ SHOULD BE: Hierarchical permission check
const roleHierarchy = { org_owner: 100, admin: 80, manager: 60, ... };

function hasPermission(userRole: OrgRole, allowedRoles: OrgRole[]): boolean {
  const minRequired = Math.min(...allowedRoles.map(r => roleHierarchy[r]));
  return roleHierarchy[userRole] >= minRequired;
}
```

**Impact:**

- ❌ Admins can't perform manager actions
- ❌ Org owners can't perform admin actions
- ❌ Every endpoint must explicitly list ALL higher roles

**Example from actual code:**

```typescript
// File: organizations/[id]/members/route.ts
// ❌ Must list both roles explicitly
export const POST = createOrgEndpoint({
  roles: ["admin", "manager"],  // Can't just say ["manager"]
  handler: async ({ context }) => { ... }
});
```

### 🟡 HIGH-01: No Permission Auditing
**Location:** All endpoints **Issue:** No logging of authorization checks or denials

```typescript
// When a user is denied access, no audit trail:
if (!config.roles.includes(context.org.role)) {
  return forbidden("Insufficient permissions");
  // ❌ No log of: who tried, what they tried, which org
}
```

**Recommendation:**

```typescript
if (!hasPermission(context.org.role, config.roles)) {
  await logSecurityEvent({
    event: "AUTHORIZATION_DENIED",
    userId: context.auth.userId,
    orgId: context.org.orgId,
    attemptedRole: context.org.role,
    requiredRoles: config.roles,
    endpoint: request.url,
    timestamp: Date.now(),
  });
  return forbidden("Insufficient permissions");
}
```

### 🟡 HIGH-02: Missing Resource-Level Permissions
**Location:** All CRUD endpoints **Issue:** Only org-level RBAC, no resource ownership checks

```typescript
// File: schedules/[id]/route.ts
export const DELETE = createOrgEndpoint({
  roles: ["manager"],
  handler: async ({ params, context }) => {
    const scheduleId = params.id;

    // ❌ MISSING: Check if schedule belongs to user's org
    // ❌ MISSING: Check if user created this schedule
    // ❌ MISSING: Check if schedule is locked/published

    await deleteSchedule(scheduleId); // Deletes ANY schedule!
  },
});
```

**Recommendation:**

```typescript
// ✅ Add resource ownership validation
const schedule = await getSchedule(scheduleId);

if (schedule.orgId !== context.org.orgId) {
  return forbidden("Schedule belongs to different organization");
}

if (schedule.status === "published" && context.org.role !== "admin") {
  return forbidden("Only admins can delete published schedules");
}
```

### 🟢 MEDIUM-01: Membership Claims vs Actual Membership
**Location:** `packages/types/src/rbac.ts` **Issue:** Two competing membership models

```typescript
// Model 1: MembershipClaims (legacy?)
export const MembershipClaimsSchema = z.object({
  orgId: z.string(),
  userId: z.string(),
  roles: z.array(OrgRole), // ❌ Array of roles (can have multiple)
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Model 2: OrgContext (current)
interface OrgContext {
  orgId: string;
  role: OrgRole; // ✅ Single role
  membershipId: string;
}
```

**Question:** Can users have multiple roles? If yes, how is precedence determined?

## 4. Architectural Patterns
### ✅ Good Pattern: Declarative Authorization
```typescript
// Authorization is configuration, not code
export const POST = createOrgEndpoint({
  roles: ["admin"], // ✅ Clear, declarative
  handler: async ({ context }) => {
    // No manual auth checks needed
  },
});
```

### ❌ Anti-Pattern: Commented-Out Role Checks
```typescript
// From Standard_API_Route.md:
// import { requireSession, requireRole } from "@/src/lib/api";
// const session = await requireSession(req);
// await requireRole(session, ["manager"]);

// ❌ Old pattern still in documentation/templates
```

### ✅ Good Pattern: Type-Safe Roles
```typescript
// Zod enum ensures only valid roles
export const OrgRole = z.enum(["org_owner", "admin", "manager", "scheduler", "corporate", "staff"]);

// TypeScript enforces at compile time
function assignRole(role: OrgRole) {} // ✅ Only accepts valid roles
assignRole("superuser"); // ❌ Compile error
```

## 5. Role Definitions & Use Cases
| Role        | Permissions                     | Typical Use Case           |
| ----------- | ------------------------------- | -------------------------- |
| `org_owner` | Full control                    | Organization founder/CEO   |
| `admin`     | Manage settings, users, billing | IT admin, HR manager       |
| `manager`   | Create schedules, assign shifts | Department head, team lead |
| `scheduler` | Edit schedules                  | Scheduling coordinator     |
| `corporate` | View across organizations       | Corporate oversight        |
| `staff`     | View own schedule               | Front-line employees       |

## 6. Org Context Loading Flow
```
1. Extract auth token from request
   ↓
1. Verify Firebase ID token → AuthContext
   ↓
1. Query Firestore memberships collection
   WHERE userId == AuthContext.userId
   ↓
1. Load user's membership in target org
   ↓
1. Build OrgContext { orgId, role, membershipId }
   ↓
1. Pass to handler via context parameter
```

**Performance Note:** This is 2 external calls per request (Firebase + Firestore). Should be cached.

## 7. Security Invariants
### ✅ Enforced
1. **All org endpoints require authentication** - `createOrgEndpoint` enforces this
2. **Org membership required** - Can't access org resources without membership
3. **Type-safe roles** - Invalid roles rejected at compile time

### ⚠️ Missing
1. **Hierarchical permissions** - Admins can't do manager actions
2. **Resource ownership checks** - Can operate on any resource in org
3. **Audit logging** - No trail of security events
4. **Permission caching** - Every request queries Firestore
5. **Multi-org user support** - Unclear how users switch orgs

## 8. Recommendations
| Priority | Action                                   | Effort   | Impact                                  |
| -------- | ---------------------------------------- | -------- | --------------------------------------- |
| 🔴 P0    | Implement hierarchical permission checks | 1-2 days | Critical - Fixes broken permissions     |
| 🔴 P0    | Add resource ownership validation        | 2-3 days | Critical - Prevents unauthorized access |
| 🟡 P1    | Implement security audit logging         | 1-2 days | High - Compliance requirement           |
| 🟡 P1    | Add permission caching (Redis)           | 1 day    | High - Performance                      |
| 🟢 P2    | Document role permission matrix          | 1 day    | Medium - Clarity                        |
| 🟢 P2    | Add integration tests for RBAC           | 2 days   | Medium - Test coverage                  |
| 🟢 P3    | Support multi-org users                  | 3-4 days | Low - Future feature                    |

**Total Estimated Effort:** ~11-15 days

## 9. Related Subsystems
- **API Framework** - Enforces RBAC via `createOrgEndpoint`
- **Organizations** - Defines org structure
- **Memberships** - Stores user→org→role mappings
- **Authentication** - Provides user identity (Firebase Auth)

## 10. Open Questions
1. **Can users have multiple roles in same org?**
   - Current code suggests single role, but `MembershipClaimsSchema` has `roles: z.array()`

1. **How do corporate users access multiple orgs?**
   - Is there a network-level permission system?

1. **Who can change user roles?**
   - Only `org_owner`? Or `admin` too?

1. **Is there role inheritance across org hierarchy?**
   - If Network → Org, do network admins have org access?

## 11. Next Steps
1. Fix hierarchical permission logic in SDK factory
2. Add resource ownership checks to all CRUD endpoints
3. Implement security audit logging
4. Document complete permission matrix
5. Add comprehensive RBAC integration tests
