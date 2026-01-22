---

applyTo: "\*\*/\*.md"

## description: "Project memory for Markdown docs formatting, linting, and auto-fix workflows."

# Markdown Docs Memory

Keep Markdown documents lint-clean and diff-friendly by standardizing fenced code languages and
table formatting.

## Always specify fenced code languages (MD040)

When adding fenced code blocks, always include a language:

- Use `text` for ASCII diagrams and plain text blocks.
- Use `bash` for shell commands.
- Use `typescript` for TS examples.
- Use `json` for JSON.

Examples:

```text
┌───────────┐
│ Diagram   │
└───────────┘
```

```bash
pnpm fix:all
```

## Use compact table separators (MD060)

Prefer compact, consistent separators:

```text
| Col A | Col B |
| --- | --- |
| a | b |
```

Guidelines:

- Keep a single space inside cells.
- Use `| --- |` separator cells (avoid `|---|` and avoid alignment padding).

## Preferred auto-fix workflow

When docs lint warnings show up (especially `MD040` / `MD060`), run the repo’s formatter/fixer
pipeline:

```bash
pnpm --filter @fresh-root/markdown-fixer fix
pnpm format
```

Or run the full convenience script:

```bash
pnpm fix:all
```
