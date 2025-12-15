# MCP Server Setup for Chromebook

This guide helps you configure the Fresh MCP Server on a Chromebook (Linux/Crostini environment).

## Configuration for Claude Desktop

Since you're on a Chromebook, the config file location may differ from standard Linux:

### Config File Location

Create or edit the Claude Desktop config file at one of these locations:
- `~/.config/Claude/claude_desktop_config.json` (most Linux)
- `~/.var/app/com.anthropic.Claude/config/Claude/claude_desktop_config.json` (Flatpak)

### Configuration

```json
{
  "mcpServers": {
    "fresh-schedules": {
      "command": "node",
      "args": ["/home/patrick/peteywee/fresh-root/tools/mcp-server/dist/index.js"],
      "env": {
        "FRESH_SCHEDULES_ROOT": "/home/patrick/peteywee/fresh-root"
      }
    }
  }
}
```

## VS Code Configuration

If you're using VS Code with GitHub Copilot, add this to [.vscode/settings.json](.vscode/settings.json):

```json
{
  "github.copilot.chat.experimental.mcpServers": {
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

## Quick Start Scripts

### Start the MCP Server (Development Mode)
```bash
cd /home/patrick/peteywee/fresh-root/tools/mcp-server
pnpm dev
```

### Start the MCP Server (Production Mode)
```bash
cd /home/patrick/peteywee/fresh-root/tools/mcp-server
pnpm start
```

### Test the Server
```bash
cd /home/patrick/peteywee/fresh-root/tools/mcp-server
pnpm test
```

### Inspect the Server (MCP Inspector)
```bash
cd /home/patrick/peteywee/fresh-root/tools/mcp-server
pnpm inspect
```

## Chromebook-Specific Optimizations

### 1. Resource Management
Chromebooks have limited resources. The MCP server is lightweight but consider:
- Close unused tabs when running the server
- Use production mode (`pnpm start`) instead of dev mode for better performance

### 2. Startup Script (Optional)
Create a startup script to launch the MCP server automatically:

```bash
#!/bin/bash
# Save as ~/start-mcp-server.sh
cd /home/patrick/peteywee/fresh-root/tools/mcp-server
node dist/index.js
```

Make it executable:
```bash
chmod +x ~/start-mcp-server.sh
```

### 3. Systemd Service (Advanced)
For automatic startup, create a systemd user service:

Create `~/.config/systemd/user/fresh-mcp-server.service`:
```ini
[Unit]
Description=Fresh MCP Server
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/patrick/peteywee/fresh-root/tools/mcp-server
ExecStart=/usr/bin/node /home/patrick/peteywee/fresh-root/tools/mcp-server/dist/index.js
Environment="FRESH_SCHEDULES_ROOT=/home/patrick/peteywee/fresh-root"
Restart=on-failure
RestartSec=10

[Install]
WantedBy=default.target
```

Enable and start:
```bash
systemctl --user enable fresh-mcp-server
systemctl --user start fresh-mcp-server
```

## Troubleshooting

### Server won't start
```bash
# Check Node.js is installed
node --version

# Ensure dependencies are installed
cd /home/patrick/peteywee/fresh-root/tools/mcp-server
pnpm install

# Rebuild if needed
pnpm build
```

### Permission issues
```bash
# Ensure files are readable
chmod -R u+r /home/patrick/peteywee/fresh-root/tools/mcp-server
```

### Performance issues
- Use production mode: `pnpm start`
- Limit directory depth when using `fs_list` tool
- Close other resource-intensive applications

## Available Tools

Once configured, you'll have access to these MCP tools in Claude:

- `fs_read_file` - Read files with optional line ranges
- `fs_create_file` - Create new files
- `fs_update_file` - Update files via search/replace
- `fs_delete_file` - Delete files (with confirmation)
- `fs_create_folder` - Create directories
- `fs_list` - List directory contents as tree
- `fs_search` - Search code with regex
- `fs_move` - Move/rename files and folders
- `fs_get_schema` - Get schema definitions
- `fs_create_test` - Generate tests
- `fs_run` - Run typecheck/lint/test/build
- `fs_update_index` - Update repository indexes
- `fs_get_index` - Read index files

## Next Steps

1. Restart Claude Desktop after updating the config
2. Check that the MCP server appears in Claude's tools list
3. Try a simple command like "Read the package.json file"
4. Start using the MCP tools to interact with your repository!

## Support

If you encounter issues:
1. Check the server logs in the terminal
2. Verify the paths in the configuration match your system
3. Ensure Node.js version is >= 18
4. Make sure the server builds without errors
