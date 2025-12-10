---
applyTo: "**/*.{ts,tsx,js,jsx}"
description: "Code quality standards for TypeScript/JavaScript: style, patterns, performance, commenting."
priority: 2
---

# Code Quality Standards

## TypeScript 5.x / ES2022 Standards

### Strict Mode Required

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Type Inference

- Prefer inference over explicit types where clear
- Explicit types for function parameters and return types
- Use `z.infer<typeof Schema>` for Zod schemas (never duplicate)
- No `any` — use `unknown` with type guards

### ES2022 Features

- Use `Array.at()` for negative indexing
- Use `Object.hasOwn()` instead of `hasOwnProperty`
- Use private fields (`#field`) for encapsulation
- Use `?.` optional chaining, `??` nullish coalescing

---

## Object Calisthenics (Business Domain Code)

### 1. One Level of Indentation per Method

```typescript
// ❌ Bad
function process(users: User[]) {
  for (const user of users) {
    if (user.isActive) {
      // nested logic
    }
  }
}

// ✅ Good
function process(users: User[]) {
  const activeUsers = users.filter(u => u.isActive);
  activeUsers.forEach(processUser);
}
```

### 2. Don't Use ELSE

```typescript
// ❌ Bad
function process(order: Order) {
  if (order.isValid) {
    return processOrder(order);
  } else {
    return handleInvalid(order);
  }
}

// ✅ Good (early return)
function process(order: Order) {
  if (!order.isValid) return handleInvalid(order);
  return processOrder(order);
}
```

### 3. Wrap Primitives in Domain Objects

```typescript
// ❌ Bad
function createUser(name: string, age: number) {}

// ✅ Good
function createUser(name: UserName, age: Age) {}

class Age {
  constructor(private readonly value: number) {
    if (value < 0) throw new Error("Age cannot be negative");
  }
}
```

### 4. First Class Collections

```typescript
// ❌ Bad
class Group {
  users: User[];
  getActiveCount() {
    return this.users.filter(u => u.isActive).length;
  }
}

// ✅ Good
class Group {
  private userCollection: UserCollection;
  getActiveCount() {
    return this.userCollection.countActive();
  }
}
```

### 5. One Dot Per Line

```typescript
// ❌ Bad
const email = order.user.getEmail().toUpperCase().trim();

// ✅ Good
const user = order.user;
const email = user.getEmail();
const normalizedEmail = email.toUpperCase().trim();
```

### 6. Don't Abbreviate

```typescript
// ❌ Bad
const usrMgr = new UserManager();
const cfg = loadConfig();

// ✅ Good
const userManager = new UserManager();
const configuration = loadConfig();
```

### 7. Keep Entities Small

- Maximum 10 methods per class
- Maximum 50 lines per class
- Maximum 10 classes per namespace
- Each class has single responsibility

---

## Self-Explanatory Code

### Comment ONLY When Necessary

**✅ Comment for:**
- WHY (reasoning, not WHAT)
- Complex business logic
- Non-obvious algorithms
- Regex patterns

**❌ Don't comment:**
- Obvious code
- What the code does (it should be clear)
- Redundant information

```typescript
// ❌ Bad
let counter = 0; // Initialize counter to zero
counter++; // Increment counter by one

// ✅ Good
// Progressive tax brackets: 10% up to 10k, 20% above
const tax = calculateProgressiveTax(income, [0.1, 0.2], [10000]);
```

### Naming Conventions

- Variables/Functions: `camelCase`
- Classes/Types/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: `kebab-case.ts` or `PascalCase.tsx` for components
- Boolean: prefix with `is`, `has`, `can`, `should`

---

## Performance Best Practices

### Avoid N+1 Queries

```typescript
// ❌ Bad
for (const user of users) {
  const orders = await db.collection('orders').where('userId', '==', user.id).get();
}

// ✅ Good
const userIds = users.map(u => u.id);
const orders = await db.collection('orders').where('userId', 'in', userIds).get();
```

### Efficient Data Structures

- Use `Map` for key-value with non-string keys
- Use `Set` for unique collections
- Use appropriate data structure for access pattern

### Avoid Premature Optimization

- Measure first, optimize second
- Profile before assuming bottleneck
- Simple algorithms often faster in practice

### Memory Management

- Avoid creating unnecessary objects in loops
- Use generators for large datasets
- Clean up subscriptions and event listeners

---

## Code Organization

### Import Order

```typescript
// 1. External/builtin
import { z } from "zod";
import { NextRequest } from "next/server";

// 2. Internal packages (@fresh-schedules/*)
import { Schema } from "@fresh-schedules/types";

// 3. Relative imports
import { helper } from "./utils";
```

### Function Organization

1. Public API functions first
2. Helper functions below
3. Types/interfaces at top or bottom (consistent)

### File Size

- Prefer smaller, focused files
- Split when file exceeds ~300 lines
- One concept per file

---

## Error Handling

### Always Catch and Handle

```typescript
// ❌ Bad
try {
  await riskyOperation();
} catch (err) {
  // Silent failure
}

// ✅ Good
try {
  await riskyOperation();
} catch (err) {
  const message = err instanceof Error ? err.message : "Unknown error";
  console.error("Operation failed", { error: message, context: { userId } });
  throw new OperationError("Failed to complete operation", { cause: err });
}
```

### Structured Errors

```typescript
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
```

---

## Formatting (Prettier Config)

```javascript
{
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  printWidth: 100,
  trailingComma: "all"
}
```

Run before commit: `pnpm format`

---

**Last Updated**: December 8, 2025
