// [P2][APP][CODE] Widgets
// Tags: P2, APP, CODE
# Template: CODE_ZOD_SCHEMA

```ts
/**
 * Widget domain schema
 * Owner: platform
 * Description: Domain entity
 */
import { z } from "zod";

export const WidgetId = z.string().min(1);

export const WidgetSchema = z.object({
  id: WidgetId,
  createdAt: z.string(),
  updatedAt: z.string(),
  // add domain fields here
});

export type Widget = z.infer<typeof WidgetSchema>;

/** Index export pattern (place in src/index.ts) */
// export * from "./widgets";
```
