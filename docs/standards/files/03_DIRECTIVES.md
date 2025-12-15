# FRESH SCHEDULES - DIRECTIVES

> **Version**: 1.0.0  
> **Status**: MANDATORY  
> **Authority**: Sr Dev / Architecture  
> **Binding**: YES - Violations block merge

This document defines mandatory requirements. These are not suggestions.

---

## DIRECTIVE 01: SECURITY

**Scope**: All code that handles auth, data access, or secrets.

### D01.1 API Route Requirements

**MUST**:
- Use `createOrgEndpoint()` for org-scoped routes
- Use `createNetworkEndpoint()` for network-scoped routes
- Validate all inputs with Zod schemas
- Return consistent response format

**MUST NOT**:
- Query Firestore without `orgId` in path or filter
- Expose internal error details to client
- Trust client-provided user/org IDs without verification

```typescript
// ✅ CORRECT
export const GET = createOrgEndpoint({
  roles: ['scheduler', 'manager', 'admin'],
  handler: async ({ context }) => {
    const schedules = await getSchedules(context.orgId);
    return { success: true, data: schedules };
  }
});

// ❌ WRONG - No auth, no org scoping
export async function GET(req: Request) {
  const schedules = await db.collection('schedules').get();
  return Response.json(schedules);
}
```

### D01.2 Firestore Rules Requirements

**MUST**:
- Include `sameOrg()` check for all org-scoped collections
- Include `isNetworkMember()` for network data
- Use `hasRole()` for role-based access
- Test all rules with `@firebase/rules-unit-testing`

**MUST NOT**:
- Use `allow read, write: if true`
- Skip auth check for any non-public data
- Allow cross-org data access

```javascript
// ✅ CORRECT
match /organizations/{orgId}/schedules/{scheduleId} {
  allow read: if sameOrg(orgId);
  allow write: if sameOrg(orgId) && hasRole(orgId, ['scheduler', 'manager', 'admin']);
}

// ❌ WRONG - No org check
match /schedules/{scheduleId} {
  allow read, write: if request.auth != null;
}
```

### D01.3 Secret Management

**MUST**:
- Store secrets in environment variables
- Use `process.env.VARIABLE` server-side only
- Prefix client-safe env vars with `NEXT_PUBLIC_`

**MUST NOT**:
- Commit `.env.local` or any file with secrets
- Include API keys in client-side code
- Log secrets at any log level

---

## DIRECTIVE 02: TYPE SAFETY

**Scope**: All TypeScript code.

### D02.1 No Any

**MUST**:
- Provide explicit types for all function parameters
- Use `unknown` with type guards when type is truly unknown
- Use Zod inference for schema-derived types

**MUST NOT**:
- Use `any` type anywhere
- Use `// @ts-ignore` without approval comment
- Suppress TypeScript errors with `as` casts on `any`

```typescript
// ✅ CORRECT
function processData(input: unknown): ProcessedData {
  const validated = DataSchema.parse(input);
  return transform(validated);
}

// ❌ WRONG
function processData(input: any): any {
  return input.data; // Type-unsafe
}
```

### D02.2 Schema-Derived Types

**MUST**:
- Define types using `z.infer<typeof Schema>`
- Keep schema and type in same file
- Export both schema and inferred type

```typescript
// ✅ CORRECT
export const ScheduleSchema = z.object({
  id: z.string(),
  name: z.string(),
  startDate: z.string().datetime(),
});
export type Schedule = z.infer<typeof ScheduleSchema>;

// ❌ WRONG - Duplicate definition
export interface Schedule {
  id: string;
  name: string;
  startDate: string;
}
export const ScheduleSchema = z.object({...}); // Not connected
```

### D02.3 Generic Preservation

**MUST**:
- Preserve generic type parameters through wrapper functions
- Use `T extends ZodTypeAny` for schema parameters
- Return inferred types, not `unknown`

```typescript
// ✅ CORRECT
function validate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data);
}

// ❌ WRONG - Loses type info
function validate(schema: z.ZodType<unknown>, data: unknown): unknown {
  return schema.parse(data);
}
```

---

## DIRECTIVE 03: BRANCH MANAGEMENT

**Scope**: All git operations.

### D03.1 Branch Naming

**MUST** follow pattern: `{type}/{ticket}-{description}`

| Type | Purpose | Example |
|------|---------|---------|
| `feature` | New functionality | `feature/FS-123-add-time-off` |
| `fix` | Bug fixes | `fix/FS-456-schedule-calc` |
| `refactor` | Code improvement | `refactor/FS-789-cleanup-hooks` |
| `chore` | Maintenance | `chore/update-deps` |
| `hotfix` | Emergency fix | `hotfix/FS-999-auth-bypass` |

### D03.2 Commit Messages

**MUST** follow Conventional Commits:

```
type(scope): description

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`

```
✅ feat(schedules): add bulk shift creation
✅ fix(auth): resolve token refresh race condition
✅ refactor(api): migrate to createOrgEndpoint

❌ fixed bug
❌ WIP
❌ stuff
```

### D03.3 Merge Rules

**MUST**:
- Rebase on target before opening PR
- Squash commits when merging to `dev`
- Never force-push to `main` or `dev`

**MUST NOT**:
- Merge directly to `main` (must go through `dev`)
- Merge with failing gates
- Merge without required approvals

---

## DIRECTIVE 04: TESTING

**Scope**: All production code.

### D04.1 Test Requirements

| Code Type | Required Tests |
|-----------|----------------|
| API Route | Unit test for handler logic |
| Firestore Rules | Rules test for each permission path |
| Business Logic | Unit tests with edge cases |
| Components | Storybook stories (visual tests optional) |

### D04.2 Test Naming

```typescript
// Pattern: describe what, context, expected
describe('ScheduleService', () => {
  describe('calculateHours', () => {
    it('returns 0 for schedule with no shifts', () => {...});
    it('sums hours across multiple shifts', () => {...});
    it('excludes cancelled shifts', () => {...});
  });
});
```

### D04.3 Rules Testing

**MUST** test these scenarios for every collection:
- Authenticated user with correct role → Allow
- Authenticated user without role → Deny
- Authenticated user from different org → Deny
- Unauthenticated user → Deny

---

## DIRECTIVE 05: API DESIGN

**Scope**: All API routes.

### D05.1 Response Format

**ALL** responses MUST use:

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: { code: string, message: string, details?: object } }

// List with pagination
{ success: true, data: T[], pagination: { total, page, pageSize, hasMore } }
```

### D05.2 HTTP Methods

| Method | Purpose | Idempotent |
|--------|---------|------------|
| GET | Read data | Yes |
| POST | Create resource | No |
| PUT | Full update | Yes |
| PATCH | Partial update | Yes |
| DELETE | Remove resource | Yes |

### D05.3 Status Codes

| Code | When to Use |
|------|-------------|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST (created) |
| 204 | Successful DELETE (no content) |
| 400 | Invalid input (validation failed) |
| 401 | Not authenticated |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate) |
| 500 | Server error (log it!) |

---

## DIRECTIVE 06: CODE ORGANIZATION

**Scope**: File and folder structure.

### D06.1 Import Order

```typescript
// 1. Node built-ins
import { readFile } from 'fs';

// 2. External packages
import { z } from 'zod';
import { NextResponse } from 'next/server';

// 3. Internal packages (@fresh-schedules/*)
import { ScheduleSchema } from '@fresh-schedules/types';

// 4. Relative imports (parent first, then siblings, then children)
import { config } from '../config';
import { helper } from './helper';
```

### D06.2 File Naming

| Type | Convention | Example |
|------|------------|---------|
| Component | PascalCase | `ScheduleCard.tsx` |
| Hook | camelCase with `use` | `useSchedule.ts` |
| Utility | kebab-case | `date-utils.ts` |
| Schema | kebab-case | `schedule.ts` |
| Test | `*.test.ts` or `*.spec.ts` | `schedule.test.ts` |
| Config | `*.config.*` | `tailwind.config.ts` |

### D06.3 Export Rules

**MUST**:
- Use named exports for utilities, hooks, components
- Use default export only for page routes (Next.js requirement)
- Re-export from index files for packages

```typescript
// ✅ Named exports
export function formatDate() {...}
export const DatePicker = () => {...};

// ✅ Default only for pages
export default function SchedulePage() {...}
```

---

## DIRECTIVE 07: PERFORMANCE

**Scope**: User-facing code.

### D07.1 Bundle Size

**MUST**:
- Keep page bundles under 250KB gzipped
- Use dynamic imports for heavy components
- Tree-shake unused code

### D07.2 Data Fetching

**MUST**:
- Use React Query for server state
- Implement proper loading/error states
- Cache appropriately (staleTime, cacheTime)

### D07.3 Rendering

**MUST**:
- Memoize expensive computations
- Use proper React keys (not index)
- Avoid unnecessary re-renders

---

## DIRECTIVE 08: ERROR HANDLING

**Scope**: All code paths.

### D08.1 Never Swallow Errors

```typescript
// ✅ CORRECT - Log and re-throw or handle
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', { error });
  throw new AppError('OPERATION_FAILED', 'Something went wrong');
}

// ❌ WRONG - Silent failure
try {
  await riskyOperation();
} catch {
  // Error disappears
}
```

### D08.2 Error Boundaries

**MUST** wrap major UI sections with error boundaries to prevent full-page crashes.

### D08.3 User-Facing Errors

**MUST** show user-friendly messages; **MUST NOT** expose stack traces or internal details.

---

**END OF DIRECTIVES**

Next document: [04_INSTRUCTIONS.md](./04_INSTRUCTIONS.md)
