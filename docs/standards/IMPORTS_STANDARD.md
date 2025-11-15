# Imports Standard (v15.0)

- **Project:** Fresh Schedules
- **Layer:** ALL
- **Purpose:** Deterministic, readable imports; safe for autofix; avoid cycles and runtime bloat.

## 1. Five-Group Import Order

Imports MUST be grouped in this order, separated by a blank line:

1. Node built-ins (fs, path, url)
2. External deps (react, zod, next, date-fns, etc.)
3. Internal aliases (@/app/..., @fresh-schedules/..., @/lib/...)
4. Relative imports (./, ../)
5. Side-effect imports (./globals.css), with an explaining comment

Example:

```ts
import fs from "fs";
import path from "path";

import { z } from "zod";
import React from "react";

import { NetworkSchema } from "@fresh-schedules/types";
import { getSession } from "@/app/lib/session";

import { somethingLocal } from "./utils";
import "../styles.css"; // side-effect: global styles
```

## 2. Type-Only Imports

- If a symbol is **only used as a type**, it MUST be imported with `import type`:

```ts
import type { UserRole } from "@fresh-schedules/types";
```

- The refactor agent is allowed to:
  - Scan all symbol usages in a file.
  - Promote imports to `import type` when used only in type positions.

## 3. No Inline Requires

- `require()` is forbidden in new code.
- Legacy `require()` usage must be isolated and flagged for migration.

## 4. Agent Enforcement (Safe Autofix)

The agent MAY autofix:

- Reordering imports into the 5 groups.
- Converting plain imports to `import type` where usage is type-only.
- Removing unused imports.

The agent MUST NOT:

- Introduce/resolve new modules.
- Collapse barrels unless guided by `BARREL_STANDARD`.
