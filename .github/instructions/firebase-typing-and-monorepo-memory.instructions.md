---
description: 'Key learnings from Firebase SDK v12 typing strategy and monorepo dependency resolution'
applyTo: 'apps/web/app/api/**/*.ts,apps/web/lib/**/*.ts,packages/*/**/*.ts'
---

# Firebase & Monorepo Dependency Management Memory

Core patterns for maintaining a TypeScript monorepo with Firebase as a primary data layer.

## Firebase SDK v12 Type Safety Pattern

Firebase SDK v12 client and admin SDKs intentionally return `any`-typed values from core APIs (`snap.data()`, `getFirestore()`, `query.getDocs()`, etc.). This is a **documented limitation of the SDK**, not a bug.

**Best pattern**: Use **pragmatic suppression + strategic wrappers**, not fight the SDK design:

1. **Suppress no-unsafe-* ESLint rules** for Firebase-heavy code directories:

   ```javascript
   // In eslint.config.mjs for Firebase directories (app/api/**, src/lib/**)
   {
     files: ['app/api/**/*.ts', 'src/lib/**/*.ts', 'lib/**/*.ts'],
     rules: {
       '@typescript-eslint/no-unsafe-assignment': 'off',
       '@typescript-eslint/no-unsafe-member-access': 'off',
       '@typescript-eslint/no-unsafe-call': 'off',
       '@typescript-eslint/no-unsafe-argument': 'off',
       '@typescript-eslint/no-unsafe-return': 'off',
     },
   }
   ```

2. **Use type assertions** on Firebase results with confidence:

   ```typescript
   const snap = await getDoc(docRef);
   const data = snap.data() as UserData;  // Safe - Firebase guarantees structure
   ```

3. **Create type-safe wrapper functions** for complex operations (optional enhancement):

   ```typescript
   export async function getDocWithType<T>(
     db: Firestore,
     ref: DocumentReference
   ): Promise<T | null> {
     const snap = await getDoc(ref);
     return snap.exists() ? (snap.data() as T) : null;
   }
   ```

**Avoid**: Sprinkling `@ts-ignore`, using `//@ts-nocheck`, or adding type guards everywhere. Centralizing the suppression is cleaner.

## Monorepo React Peer Dependency Resolution

When using React in multiple packages, **pnpm may resolve multiple React versions** if peerDependencies are not explicitly set.

**Critical pattern**: Add explicit React peerDependencies to every package that uses React:

```json
// packages/api-framework/package.json
{
  "peerDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

Then pin React in the root package.json:

```json
// Root package.json
{
  "devDependencies": {
    "react": "18.3.26",
    "react-dom": "18.3.26"
  },
  "pnpm": {
    "overrides": {
      "react": "18.3.26",
      "react-dom": "18.3.26"
    }
  }
}
```

**Why**: pnpm creates **multiple dependency trees** unless explicitly constrained. This causes two copies of React in `node_modules`, leading to React Hook failures and type mismatches.

## TypeScript no-unused-vars & require-await Patterns

### no-unused-vars (Prefix with Underscore)

ESLint detects legitimate unused parameters in callbacks and route handlers. **Prefix with underscore** instead of removing:

```typescript
// ❌ Avoid: Removing parameter may break Next.js route semantics
export async function POST(request: Request) { ... }

// ✅ Correct: Prefix unused params with underscore
export async function POST(_request: Request) { ... }
```

**Why**: Next.js API routes require specific parameter names (`request`, `response`, `{ params }`, etc.). Renaming breaks the framework.

### require-await (Remove async or Add Await)

ESLint catches async functions with no actual `await` statements. Two valid patterns:

```typescript
// Pattern 1: Remove async (function is synchronous)
export function GET() {
  return Response.json({ data: 'value' });  // No async needed
}

// Pattern 2: Keep async if wrapping async calls (even if not directly awaiting)
export async function POST(request: Request) {
  return handleAsync(request);  // Implicitly awaits via return
}
```

## ESLint Configuration File Patterns

Use **file pattern rules** in flat config for package-specific suppressions:

```javascript
// eslint.config.mjs
{
  files: ['app/api/**/*.ts', 'src/lib/**/*.ts'],
  rules: {
    'rule-name': 'off',  // Suppress for these files only
  },
}
```

**Avoid**: Global suppressions that hide issues in non-Firebase code.

## Dependency Removal Gotchas

Root `package.json` should **only list workspace packages in `pnpm-workspace.yaml`**, not in `dependencies`:

```json
// ❌ Root package.json - WRONG
{
  "dependencies": {
    "@fresh-schedules/types": "0.1.0"  // Local workspace package - causes npm 404
  }
}

// ✅ Correct - Use pnpm-workspace.yaml instead
// pnpm-workspace.yaml lists: packages/types, packages/config, etc.
```

**Why**: npm registry doesn't have local workspace packages. pnpm reads `pnpm-workspace.yaml` to resolve them correctly.
