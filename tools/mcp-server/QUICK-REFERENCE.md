# MCP Server - Quick Reference Card

Quick lookup for all MCP tools and common commands.

## 🚀 Server Commands

```bash
cd tools/mcp-server

pnpm dev          # Development mode (auto-reload)
pnpm start        # Production mode (faster)
pnpm build        # Compile TypeScript
pnpm test         # Run all tests
pnpm inspect      # MCP Inspector (debugging)
```

## 🛠️ MCP Tools Overview

| Tool | What It Does | Example |
|------|--------------|---------|
| `fs_read_file` | Read file contents | "Read package.json" |
| `fs_create_file` | Create new files | "Create src/utils/helper.ts" |
| `fs_update_file` | Modify existing files | "Update config to use port 3000" |
| `fs_delete_file` | Delete files | "Delete old-component.tsx" |
| `fs_create_folder` | Create directories | "Create src/features/auth" |
| `fs_list` | List directory contents | "List src with depth 2" |
| `fs_search` | Search codebase | "Search for handleSubmit" |
| `fs_move` | Move/rename files | "Move util.ts to lib/util.ts" |
| `fs_get_schema` | Get type definitions | "Get the User schema" |
| `fs_create_test` | Generate tests | "Create tests for auth.ts" |
| `fs_run` | Run commands | "Run typecheck" |
| `fs_update_index` | Update repo index | "Update the index" |
| `fs_get_index` | Read repo index | "Get the index" |

## 📝 Common Patterns

### Reading Files
```
Read package.json
Read lines 50-100 of src/index.ts
Read the authentication configuration
```

### Creating Files
```
Create src/components/Button.tsx with [content]
Create a new API route at app/api/users/route.ts
```

### Updating Files
```
Update src/config.ts: replace "localhost" with "0.0.0.0"
Change the API timeout to 5000 in config.ts
```

### Searching Code
```
Search for "handleSubmit"
Search for TODO comments
Find all API routes
```

### Listing Directories
```
List the components directory
List apps/web with depth 2
Show me the project structure
```

### Running Commands
```
Run typecheck
Run lint
Run tests
Run build
```

## 🎯 Quick Workflows

### Add New Feature
1. List directory structure
2. Read similar existing feature
3. Create new feature files
4. Create tests
5. Run typecheck & tests

### Debug Issue
1. Search for error/function
2. Read relevant files
3. Update fix
4. Run tests to verify

### Refactor Code
1. Search for all usages
2. Read affected files
3. Update each file
4. Run typecheck & lint
5. Run tests

## 💡 Pro Tips

### Performance (Chromebook)
- Use `depth 1-2` for listings (not 3+)
- Use line ranges for large files
- Run `pnpm start` (not `pnpm dev`) for better performance
- Search specific directories when possible

### Safety
- Read before updating
- Verify after changes
- Use `confirm=true` for deletions
- Run tests after modifications

### Efficiency
- Use indexes for quick overviews
- Combine related operations
- Use regex for powerful searches
- Keep the inspector open for debugging

## 🔍 Search Patterns

```regex
Function definitions:     export (async )?function \w+
React hooks:              use[A-Z]\w+
Error handling:           catch|throw new Error
Environment vars:         process\.env\.\w+
TODO comments:            TODO:|FIXME:
Import statements:        import.*from.*packageName
API routes:               export (async )?function (GET|POST|PUT|DELETE)
```

## ⚡ Keyboard Shortcuts (VS Code)

```
Ctrl+Shift+P → Developer: Reload Window
Ctrl+Shift+P → GitHub Copilot Chat
View → Output → GitHub Copilot Chat (check for errors)
```

## 🎨 Example Conversations

**Simple:**
```
You: "Read the main config file"
You: "Search for authentication functions"
You: "List the components folder"
```

**Complex:**
```
You: "Add a new analytics feature to the app"
Claude: Uses fs_list, fs_read_file, fs_create_file, fs_create_test, fs_run

You: "Refactor all Button components to use the new design system"
Claude: Uses fs_search, fs_read_file, fs_update_file, fs_run
```

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| MCP not showing in VS Code | Reload window (`Ctrl+Shift+P`) |
| Server won't start | `pnpm install && pnpm build` |
| Slow performance | Use production mode: `pnpm start` |
| Permission errors | `chmod -R u+r tools/mcp-server` |
| Tests failing | Check `pnpm test` output |

## 📚 Documentation

- **Full Guide**: [USAGE-GUIDE.md](USAGE-GUIDE.md)
- **Setup**: [README-SETUP.md](README-SETUP.md)
- **Chromebook**: [chromebook-setup.md](chromebook-setup.md)
- **Original**: [README.md](README.md)

## 🎓 Learning Path

1. **Start Simple**: Read files, list directories
2. **Create & Update**: Create new files, make changes
3. **Search & Explore**: Find patterns, understand structure
4. **Advanced**: Generate tests, run commands, manage indexes
5. **Expert**: Combine tools, complex refactoring, batch operations

---

**Remember**: Just talk to Claude naturally! The MCP server helps Claude understand and work with your codebase automatically. 🎉
