# FRESH SCHEDULES - GATES
> **Version**: 1.0.0\
> **Status**: CANONICAL\
> **Authority**: Sr Dev / Architecture\
> **Binding**: YES - Gates are enforced by pipelines

This document defines gate configurations that don't interfere with each other.

---

## GATE OVERVIEW
| Gate            | Purpose              | Blocking    | Can Run Parallel |
| --------------- | -------------------- | ----------- | ---------------- |
| **STATIC**      | Syntax, types, style | Yes         | Within itself    |
| **CORRECTNESS** | Tests pass           | Yes         | No               |
| **SAFETY**      | Security, patterns   | Yes         | Within itself    |
| **PERF**        | Performance budget   | Conditional | No               |
| **AI**          | Advisory checks      | No          | Yes              |

---

## GATE: STATIC
### Purpose
Validate code compiles, passes lint, and follows formatting.

### Configuration
```json
{
  "gate": "STATIC",
  "blocking": true,
  "timeout": 120000,
  "parallel": true,
  "checks": [
    {
      "name": "TypeScript",
      "command": "pnpm typecheck",
      "fixCommand": null,
      "blocking": true
    },
    {
      "name": "ESLint",
      "command": "pnpm lint:check",
      "fixCommand": "pnpm lint --fix",
      "blocking": true
    },
    {
      "name": "Prettier",
      "command": "pnpm format:check",
      "fixCommand": "pnpm format",
      "blocking": true
    }
  ]
}
```

### Related Configs
#### tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### .eslintrc.js
```javascript
module.exports = {
  extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
};
```

#### .prettierrc
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Non-Interference
- TypeScript, ESLint, Prettier run in parallel (no file conflicts)
- ESLint and Prettier are configured to not conflict:
  - Prettier handles formatting
  - ESLint handles logic/patterns
  - `eslint-config-prettier` disables conflicting rules

---

## GATE: CORRECTNESS
### Purpose
Validate tests pass and behavior is correct.

### Configuration
```json
{
  "gate": "CORRECTNESS",
  "blocking": true,
  "timeout": 180000,
  "parallel": false,
  "checks": [
    {
      "name": "Unit Tests",
      "command": "pnpm test:unit",
      "fixCommand": null,
      "blocking": true,
      "coverage": {
        "minimum": 80,
        "failOnDecrease": true
      }
    },
    {
      "name": "Rules Tests",
      "command": "pnpm test:rules",
      "fixCommand": null,
      "blocking": true
    },
    {
      "name": "E2E Tests",
      "command": "pnpm test:e2e",
      "fixCommand": null,
      "blocking": true,
      "condition": "pipeline.variant === 'HEAVY'"
    }
  ]
}
```

### Related Configs
#### vitest.config.ts (Unit)
```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["**/e2e/**", "**/rules/**"],
    coverage: {
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 80,
        branches: 70,
        functions: 80,
        statements: 80,
      },
    },
  },
});
```

#### vitest.config.rules.ts (Rules)
```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/rules/**/*.spec.ts"],
    setupFiles: ["tests/rules/setup.ts"],
    testTimeout: 30000,
  },
});
```

#### playwright.config.ts (E2E)
```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
});
```

### Non-Interference
- Tests run sequentially (not parallel) to avoid:
  - Firebase emulator conflicts
  - Port collisions
  - Race conditions in setup/teardown
- Each test type has separate config file
- Separate include patterns prevent overlap

---

## GATE: SAFETY
### Purpose
Validate security patterns, secrets, and dependencies.

### Configuration
```json
{
  "gate": "SAFETY",
  "blocking": true,
  "timeout": 120000,
  "parallel": true,
  "checks": [
    {
      "name": "Pattern Validation",
      "command": "node scripts/validate-patterns.mjs",
      "fixCommand": null,
      "blocking": true,
      "threshold": {
        "score": 90,
        "criticalViolations": 0
      }
    },
    {
      "name": "Secret Scan",
      "command": "git secrets --scan || true",
      "fixCommand": null,
      "blocking": true
    },
    {
      "name": "Dependency Audit",
      "command": "pnpm audit --audit-level=high",
      "fixCommand": "pnpm audit --fix",
      "blocking": false,
      "warnLevel": "moderate",
      "blockLevel": "critical"
    },
    {
      "name": "License Check",
      "command": "pnpm licenses list --json | node scripts/check-licenses.mjs",
      "fixCommand": null,
      "blocking": false
    }
  ]
}
```

### Related Configs
#### Pattern Validator (validate-patterns.mjs)
```javascript
const patterns = [
  {
    id: "API_001",
    name: "API Route Security",
    severity: "CRITICAL",
    pattern: /createOrgEndpoint|createNetworkEndpoint/,
    files: ["apps/web/app/api/**/*.ts"],
    message: "API routes must use createOrgEndpoint or createNetworkEndpoint",
  },
  {
    id: "SEC_001",
    name: "Firebase Auth",
    severity: "CRITICAL",
    pattern: /getAuth\(\)|useAuth\(\)/,
    files: ["**/*.ts", "**/*.tsx"],
    exclude: ["**/test/**"],
    message: "Use Firebase Auth for authentication",
  },
  // ... more patterns
];

export default patterns;
```

#### .gitsecrets
```
# AWS
[a-zA-Z0-9/+=]{40}

# Firebase
AIza[0-9A-Za-z-_]{35}

# Generic API keys
api[_-]?key[_-]?=.{20,}
secret[_-]?key[_-]?=.{20,}
```

### Non-Interference
- Pattern validation, secret scan, and audit run in parallel
- No file modifications during safety checks
- Each check reads independently

---

## GATE: PERF
### Purpose
Validate performance budgets and bundle size.

### Configuration
```json
{
  "gate": "PERF",
  "blocking": false,
  "timeout": 180000,
  "parallel": false,
  "checks": [
    {
      "name": "Build",
      "command": "pnpm build",
      "fixCommand": null,
      "blocking": true
    },
    {
      "name": "Bundle Analysis",
      "command": "pnpm analyze:bundle",
      "fixCommand": null,
      "blocking": false,
      "threshold": {
        "maxIncrease": 10,
        "unit": "percent"
      }
    },
    {
      "name": "Lighthouse CI",
      "command": "pnpm lhci autorun",
      "fixCommand": null,
      "blocking": false,
      "condition": "ci.environment === 'production'"
    }
  ]
}
```

### Related Configs
#### next.config.mjs (Bundle Analysis)
```javascript
import withBundleAnalyzer from "@next/bundle-analyzer";

const config = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})({
  // ... other config
});

export default config;
```

#### lighthouserc.json
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.8 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["warn", { "minScore": 0.8 }]
      }
    }
  }
}
```

### Non-Interference
- Build must complete before analysis
- Sequential execution prevents resource conflicts
- Only blocks if threshold exceeded

---

## GATE: AI
### Purpose
Advisory checks for context validation and quality.

### Configuration
```json
{
  "gate": "AI",
  "blocking": false,
  "timeout": 60000,
  "parallel": true,
  "checks": [
    {
      "name": "Context Validation",
      "command": "internal",
      "blocking": false
    },
    {
      "name": "Hallucination Check",
      "command": "internal",
      "blocking": false
    }
  ]
}
```

### Behavior
- Never blocks pipeline
- Provides advisory feedback
- Run by agents, not CI

---

## FIX COMMAND BEHAVIOR
### Why Fix Sometimes Breaks
The SDK and gates have fix commands, but they can fail because:

1. **Conflicting Fixes**: ESLint and Prettier both try to modify same file
   - **Solution**: Run Prettier last, or use `eslint --fix && prettier --write`

1. **Type Errors After Fix**: Auto-fix changes code but breaks types
   - **Solution**: Re-run typecheck after fix

1. **Partial Fixes**: Some violations require manual intervention
   - **Solution**: Fix reports what's auto-fixable vs manual

1. **Race Conditions**: Parallel fixes modify same file
   - **Solution**: Run fixes sequentially

### Correct Fix Order
```bash
# 1. Format first (Prettier)
pnpm format

# 2. Then lint fix
pnpm lint --fix

# 3. Verify types still pass
pnpm typecheck

# 4. If types fail, manual fix needed
```

### SDK Fix Capabilities
| Issue Type        | Auto-Fix?  | Why Not?            |
| ----------------- | ---------- | ------------------- |
| Formatting        | ✅ Yes     | Prettier handles    |
| Simple lint       | ✅ Yes     | ESLint --fix        |
| Missing semicolon | ✅ Yes     | Formatter           |
| Implicit any      | ⚠️ Partial | Needs type info     |
| Module resolution | ❌ No      | Config change       |
| Pattern violation | ⚠️ Partial | Depends on pattern  |
| Type mismatch     | ❌ No      | Needs understanding |

### Documenting Fix Limitations
```typescript
interface PatternDefinition {
  id: string;
  severity: "CRITICAL" | "ERROR" | "WARNING";
  autoFixable: boolean;
  fixCommand?: string;
  manualFixGuide?: string; // Link to docs
  whyNotAutoFixable?: string; // Explanation
}
```

---

## GATE ORDERING
### Execution Sequence
```
STATIC (parallel internally)
   │
   ├── TypeScript ──┬──→ Result
   ├── ESLint ──────┼──→ Result
   └── Prettier ────┴──→ Result
   │
   │ ALL PASS?
   ↓
CORRECTNESS (sequential)
   │
   ├── Unit Tests ──→ Result
   ├── Rules Tests ──→ Result
   └── E2E Tests ───→ Result (if HEAVY)
   │
   │ ALL PASS?
   ↓
SAFETY (parallel internally)
   │
   ├── Patterns ────┬──→ Result
   ├── Secrets ─────┼──→ Result
   └── Audit ───────┴──→ Result
   │
   │ ALL PASS?
   ↓
PERF (sequential, conditional)
   │
   └── Build + Analyze ──→ Result
   │
   │ PASS OR WARN
   ↓
AI (advisory, parallel)
   │
   └── Checks ──→ Advisory
```

### Why This Order
1. **STATIC First**: Fastest feedback, catches obvious issues
2. **CORRECTNESS After STATIC**: No point testing broken code
3. **SAFETY After CORRECTNESS**: Security on working code
4. **PERF Conditional**: Only when thorough validation needed
5. **AI Last**: Advisory doesn't block, provides enhancement

---

## AVOIDING CONFLICTS
### Config File Separation
```
.eslintrc.js         # Lint rules only
.prettierrc          # Format rules only
tsconfig.json        # Type checking
vitest.config.ts     # Unit tests
vitest.config.rules.ts # Rules tests (separate!)
playwright.config.ts # E2E tests (separate!)
```

### Package.json Scripts
```json
{
  "scripts": {
    "lint:check": "eslint . --ext .ts,.tsx",
    "lint": "eslint . --ext .ts,.tsx --fix",
    "format:check": "prettier --check .",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "test:unit": "vitest run",
    "test:rules": "vitest run -c vitest.config.rules.ts",
    "test:e2e": "playwright test",
    "validate:patterns": "node scripts/validate-patterns.mjs"
  }
}
```

### Preventing Overlap
| Tool A            | Tool B     | Conflict?    | Resolution                |
| ----------------- | ---------- | ------------ | ------------------------- |
| ESLint            | Prettier   | Format rules | eslint-config-prettier    |
| Vitest            | Playwright | Test files   | Separate include patterns |
| TypeScript        | ESLint     | Type rules   | @typescript-eslint        |
| Pattern Validator | ESLint     | Custom rules | Different domains         |

---

**END OF GATES**

Next document: [12\_DOCUMENTATION.md](./12_DOCUMENTATION.md)
