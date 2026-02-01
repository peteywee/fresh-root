---

title: "TypeScript Module Code Template"
description: "Template for TypeScript module organization and exports"
keywords:
- template
- typescript
- module
- code
- patterns
category: "template"
status: "active"
audience:
- developers
related-docs:
- CODE\_ZOD\_SCHEMA.md
- ../standards/CODING\_RULES\_AND\_PATTERNS.md

createdAt: "2026-01-31T12:00:00Z"
lastUpdated: "2026-01-31T12:00:00Z"

---

# Template: CODE_TS_MODULE

```ts
/**
 * ${Name} module
 * Owner: ${Owner}
 * Purpose: ${Description}
 * Created: ${Created}
 */
import { z } from "zod";

/** Error shape */
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export const ${Name}Input = z.object({
  // TODO: fields
});

export type ${Name}Input = z.infer<typeof ${Name}Input>;

export async function ${Name}UseCase(input: ${Name}Input): Promise<Result<void>> {
  try {
    ${Name}Input.parse(input);
    // TODO: implement
    return { ok: true, value: undefined as void };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Unknown error" };
  }
}
```
