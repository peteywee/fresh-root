---

title: "Zod Schema Code Template"
description: "Template for Zod schema definitions with validation patterns"
keywords:
- template
- zod
- schema
- validation
- typescript
category: "template"
status: "active"
audience:
- developers
related-docs:
- CODE\_FIRESTORE\_RULES.md
- ../standards/CODING\_RULES\_AND\_PATTERNS.md

createdAt: "2026-01-31T12:00:00Z"
lastUpdated: "2026-01-31T12:00:00Z"

---

# Template: CODE_ZOD_SCHEMA

```ts
/**
 * ${Name} domain schema
 * Owner: ${Owner}
 * Description: ${Description}
 */
import { z } from "zod";

export const ${Name}Id = z.string().min(1);

export const ${Name}Schema = z.object({
  id: ${Name}Id,
  createdAt: z.string(),
  updatedAt: z.string(),
  // add domain fields here
});

export type ${Name} = z.infer<typeof ${Name}Schema>;

/** Index export pattern (place in src/index.ts) */
// export * from "./${FileBasename}";
```
