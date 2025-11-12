# Firecrawl MCP Setup

This repo includes a ready-to-use configuration to run the Firecrawl MCP server locally for
scraping/searching content via MCP-compatible clients.

## Prerequisites

- Node.js 18+
- A valid Firecrawl API key exported as an environment variable:

```bash
export FIRECRAWL_API_KEY="<your-api-key>"
```

## Quick start

- To run the server directly:

```bash
./scripts/mcp/run-firecrawl-mcp.sh
```

- Or run via pnpm:

```bash
pnpm firecrawl
```

- Or configure your MCP client with the manifest at `mcp/firecrawl.mcp.json`.

  Many MCP clients (e.g., Claude Desktop, VS Code MCP integrations) accept a manifest with a
  `servers` object. Point your client to this file, or copy its entry into your client's global MCP
  config.

- VS Code users: The Firecrawl MCP server is already configured in `.vscode/mcp.json`. VS Code will

  prompt you for your API key when it starts the server.

## Tools exposed

The Firecrawl MCP server provides tools such as:

- firecrawl_scrape
- firecrawl_search
- firecrawl_crawl
- firecrawl_map
- firecrawl_extract
- firecrawl_check_crawl_status

Notes:

- Some clients validate tool schemas using JSON Schema Draft-07. Firecrawl’s tool schemas use Draft
  2020-12 (with `$dynamicRef`). If your client’s validator doesn’t support `$dynamicRef`, you can
  still run the server; the client will call the tools without schema validation, or you can disable
  schema validation in the client.
- If you see schema validation warnings (documented in `docs/mcp.json`), they’re safe to ignore at
  runtime. The tools still function.

## Troubleshooting

- Missing API key: Ensure `FIRECRAWL_API_KEY` is exported in your shell environment.
- Firewall/proxy: If your network blocks outbound requests, set `HTTPS_PROXY` and `NO_PROXY`

  appropriately.

- Version pinning: If you need reproducible behavior, replace the `npx -y firecrawl-mcp`

  call with a pinned version, e.g., `npx -y firecrawl-mcp@x.y.z`.

## Security considerations

- The MCP server makes outbound requests. Do not run it against untrusted targets from sensitive environments.
- Do not commit your API key. Use environment variables or your secrets manager.
