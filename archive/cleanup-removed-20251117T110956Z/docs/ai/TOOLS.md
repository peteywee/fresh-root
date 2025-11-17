# Title

AI Tools & MCP Integration
Motto: 5 < Live

Allowed Tools

- Static: grep, ripgrep-like search (text only).
- Repo Graph: file tree listing & path resolution.
- Policy: can read firestore.rules, storage.rules.

MCP (Model Context Protocol)

There are two local MCP servers:

1. packages/mcp-server (minimal, read-only)

- Methods:

```text
- repo.search — keyword search across repo (fast, glob aware)
- repo.read — read file by path
- repo.paths — list files with filters
```

- Contract: JSON-RPC over stdio.
- Safety: Read-only; never mutates files; .env\* redacted.

1. mcp/filetag-server.mjs (enhanced, diagnostics + fixer)

- Tools:

```text
- filetag.scan — smart workspace scan with caching
- filetag.report — rich report (markdown/json)
- filetag.analyze — deps + quality metrics
- filetag.clearCache — clear caches/learning
- markdown.fix — identify and fix MD046 (indented code blocks) by converting to fenced blocks
```

markdown.fix

- Purpose: identify indented code blocks in Markdown and convert them to fenced blocks to satisfy MD046.
- Inputs:
- root?: string (base path; default CWD)
- include?: string[] (relative prefixes to include)
- exclude?: string[] (dir names/prefixes to exclude)
- languageHint?: string (fence language; default "text")
- mode?: "common" | "md046-only" (default "common")
- deep?: boolean (scan entire repo, lifting file limit)
- limit?: number (soft file cap; default from env FILETAG_MAX_FILES)
- dryRun?: boolean (default true; set false to write changes)
- Output:
- filesVisited: number
- filesChanged: number
- changes: { file, issues, bytesDelta, detail }[]
- notes: string[]

What “common” mode fixes

- MD046: Indented code blocks -> fenced (existing)
- MD010: Replace hard tabs with spaces (outside fenced code)
- MD009: Remove trailing whitespace
- MD018/MD019: Normalize “# Heading” spacing
- MD022: Ensure blank line before/after headings
- MD030: Ensure single space after list markers
- MD031/MD032: Ensure blank lines around fenced code blocks and lists
- MD040: Add language to fenced code blocks when missing (uses languageHint)

Safety

- markdown.fix runs in dryRun mode by default (no writes). Set dryRun=false to apply fixes.
- No secrets printed; .env\* redacted by read-only server; filetag server auto-excludes heavy dirs.

Usage (assistant-side)

- Prefer MCP for source-of-truth reads before codegen.
- Use markdown.fix to remediate MD046 quickly across docs; start with a dry run to review impact.
