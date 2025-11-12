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
