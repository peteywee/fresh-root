# Title

MCP Server — Fresh Schedules
Exposes read-only repo tools to assistants via Model Context Protocol.
Tools

repo.search(q, globs?): keyword search

repo.read(path): read file contents

repo.paths(globs?): list matching files

Run
pnpm --filter @packages/mcp-server dev
