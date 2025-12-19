# ERROR PATTERN: Markdown Fences Missing Language + Table Column Style

**Status**: ACTIVE SAFEGUARD  
**Detection Date**: December 19, 2025  
**Severity**: P2 (Docs quality)  
**Primary Rules**: `MD040` (fenced code language), `MD060` (table column style)

---

## Problem Definition

Two recurring markdownlint issues degrade doc quality and create noisy CI/editor warnings:

1. **`MD040`**: Fenced code blocks without a language specifier
   - Example: a plain fence like ``` without `bash` / `typescript` / `text`
   - Impact: inconsistent rendering, missing syntax highlighting, lint noise

2. **`MD060`**: Tables with inconsistent spacing/padding around pipes and separators
   - Example: separators like `|-----|` instead of `| --- |`
   - Impact: hard-to-read diffs and inconsistent table formatting

---

## Required Fix Pattern

### ✅ Code fences must always declare a language

Use these conventions:

- **ASCII diagrams / plain text blocks**: `text`
- **Shell commands**: `bash`
- **TypeScript**: `typescript`
- **JSON**: `json`

**Correct examples**:

```text
┌───────────┐
│ Diagram   │
└───────────┘
```

```bash
pnpm fix:all
```

```typescript
type Example = { ok: true };
```

```json
{ "ok": true }
```

---

### ✅ Tables must use consistent, compact separators

Prefer the “compact” style:

```text
| Col A | Col B |
| --- | --- |
| a | b |
```

Rules of thumb:

- Always include a single space padding around cell contents.
- Use separator rows like `| --- |` (not `|---|` and not padded to align columns).

---

## Detection & Prevention

### Editor / CI detection

- Markdownlint will flag these as `MD040` / `MD060`.
- Repo config: `.markdownlint.json` enables `MD040`.

### Preferred auto-fix in this repo

Run the markdown fixer (or the full fixer pipeline):

```bash
pnpm --filter @fresh-root/markdown-fixer fix
# or
pnpm fix:all
```

---

## Validation Gates (Before Commit)

```bash
pnpm --filter @fresh-root/markdown-fixer fix
pnpm format
```

If you want a direct markdownlint run (ad-hoc):

```bash
pnpm exec markdownlint-cli2 "**/*.md"
```

---

## Red Team Veto Triggers (Docs)

🚫 Block merging if:

- New fenced code blocks are added without a language.
- New tables are added with non-compact separator formatting.
