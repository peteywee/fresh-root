AI Tools & MCP Integration
Motto: 5 < Live
Allowed Tools

Static: grep, ripgrep-like search (text only).

Repo Graph: file tree listing & path resolution.

Policy: can read firestore.rules, storage.rules.

MCP (Model Context Protocol)

Local MCP server in packages/mcp-server.

Exposes:

repo.search — keyword search across repo (fast, glob aware)

repo.read — read file by path

repo.paths — list files with filters

Contract: JSON-RPC over stdio.

Safety

Read-only; never mutates files.

No secrets printed; redact .env\*.

Usage (assistant-side)

Prefer MCP for source-of-truth reads before codegen.
