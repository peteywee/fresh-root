# markdown-fixer

Small, focused tool to fix recurring Markdown issues across the monorepo.

Features
- Heading normalization (single space after #, setext -> ATX conversion)
- Remove trailing whitespace
- Collapse multiple blank lines
- Normalize ordered lists to sequential numbers
- Normalize code fences

Usage

- Dry run:

```bash
pnpm --filter @fresh-root/markdown-fixer dev ./docs
```

- Fix in place:

```bash
pnpm --filter @fresh-root/markdown-fixer fix ./docs
```

API

```ts
import { fixFiles } from '@fresh-root/markdown-fixer';
const { content, changed } = await fixFiles(markdownText);
```

Integrate into repository
- Add to any CI step or run locally using `pnpm -w --filter @fresh-root/markdown-fixer fix ./docs`.

Contributing
- Add tests in `test/` to cover new rules
- Add new fix rules to `src/fixer.ts` with clear, tested heuristics
