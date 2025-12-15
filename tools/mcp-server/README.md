# Fresh Schedules MCP Server

> Connect Claude directly to your Fresh Schedules repository

## Features

| Tool | Description |
|------|-------------|
| `fs_read_file` | Read any file with optional line range |
| `fs_create_file` | Create new files (auto-creates folders) |
| `fs_update_file` | Update via search/replace or full content |
| `fs_delete_file` | Delete files (requires confirmation) |
| `fs_create_folder` | Create folders up to 5 levels deep |
| `fs_list` | List directory contents as tree |
| `fs_search` | Search code with regex patterns |
| `fs_move` | Move/rename files and folders |
| `fs_get_schema` | Get schema definitions |
| `fs_create_test` | Generate unit/rules/e2e tests |
| `fs_run` | Run typecheck/lint/test/build |
| `fs_update_index` | Update REPO_INDEX.md or _INDEX.md |
| `fs_get_index` | Read current index files |

## Index System

The server maintains two types of indexes:

1. **REPO_INDEX.md** - Main index at repo root
2. **_INDEX.md** - Mini-indexes in subdirectories

Indexes include:
- File tree structure
- File sizes
- Exported symbols (from TypeScript)
- Auto-generated timestamps

## Installation

### 1. Clone and Build

```bash
# In your Fresh Schedules repo
mkdir -p tools/mcp-server
cd tools/mcp-server

# Copy the files (or download)
# Then install and build
npm install
npm run build
```

### 2. Configure Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "fresh-schedules": {
      "command": "node",
      "args": ["/path/to/fresh-schedules/tools/mcp-server/dist/index.js"],
      "env": {
        "FRESH_SCHEDULES_ROOT": "/path/to/fresh-schedules"
      }
    }
  }
}
```

### 3. Configure VS Code (Copilot)

Add to `.vscode/settings.json`:

```json
{
  "github.copilot.chat.mcpServers": {
    "fresh-schedules": {
      "command": "node",
      "args": ["${workspaceFolder}/tools/mcp-server/dist/index.js"],
      "env": {
        "FRESH_SCHEDULES_ROOT": "${workspaceFolder}"
      }
    }
  }
}
```

## Usage Examples

### Read and Search

```
Read the schedule route handler
→ fs_read_file path="apps/web/app/api/schedules/route.ts"

Find all createOrgEndpoint usage
→ fs_search query="createOrgEndpoint"

Get the Schedule schema
→ fs_get_schema name="Schedule"
```

### Create and Organize

```
Create a new API route for time-off requests
→ fs_create_file path="apps/web/app/api/time-off/route.ts" content="..."

Create a features folder with index
→ fs_create_folder path="apps/web/features/time-off" withIndex=true

Generate tests for the new route
→ fs_create_test sourcePath="apps/web/app/api/time-off/route.ts" testType="unit"
```

### Index Management

```
Update the main repo index
→ fs_update_index path="." depth=3

Update just the API folder index
→ fs_update_index path="apps/web/app/api" depth=2

Read the current index
→ fs_get_index path="."
```

### Run Commands

```
Check types
→ fs_run command="typecheck"

Run linting with fixes
→ fs_run command="lint:fix"

Run unit tests
→ fs_run command="test:unit"
```

## Safety Limits

- **Max depth**: 5 levels from repo root
- **Path safety**: Cannot escape repo directory
- **Delete confirmation**: Requires `confirm=true`
- **Character limit**: 50KB max response (truncated if larger)
- **Ignored dirs**: node_modules, dist, .git, .next, coverage

## Development

```bash
# Watch mode
npm run dev

# Test with MCP Inspector
npm run inspect

# Build for production
npm run build
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FRESH_SCHEDULES_ROOT` | `process.cwd()` | Path to repo root |

## License

MIT
