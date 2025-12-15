# MCP Server - Commands Reference

Quick reference for all available npm scripts and slash commands.

## NPM Scripts

### Building

```bash
pnpm build              # Compile TypeScript to dist/
pnpm build:watch        # Watch mode - rebuild on changes
```

### Production Mode (Best for Chromebook)

```bash
pnpm start              # Run compiled server (recommended)
pnpm start:gpt          # Run GPT API server (Express)
pnpm start:low-mem      # Run with 384MB memory limit
```

### Development Mode

```bash
# With auto-reload (watch mode)
pnpm dev                # Standard MCP server
pnpm dev:gpt            # GPT API server

# Without auto-reload (lighter on resources)
pnpm dev:no-watch       # Standard MCP server
pnpm dev:gpt-no-watch   # GPT API server

# Debug mode
pnpm dev:debug          # Run with Node.js debugger
```

### Testing & Inspection

```bash
pnpm test               # Run all tests
pnpm test:tools         # Test individual tools
pnpm inspect            # Launch MCP Inspector (debugging)
```

## Recommended Workflows

### For Active Development
```bash
# Terminal 1: Auto-rebuild on changes
pnpm build:watch

# Terminal 2: Run without watch (saves resources)
pnpm dev:no-watch
```

### For Daily Use on Chromebook
```bash
pnpm start              # Best performance, lowest memory
```

### For Testing Changes
```bash
pnpm build              # Compile changes
pnpm test               # Run tests
pnpm start              # Start server
```

### For Debugging
```bash
pnpm inspect            # Visual inspector
# or
pnpm dev:debug          # Node.js debugger
```

## Slash Commands

You can now use these custom slash commands in Claude:

### `/mcp-analyze`
Analyzes your entire project:
- Repository structure
- TODO/FIXME items
- Type errors
- Lint issues
- Health recommendations

**Usage:**
```
/mcp-analyze
```

### `/mcp-health`
Quick health check:
- Runs typecheck
- Runs lint
- Runs tests
- Reports issues
- Provides health score

**Usage:**
```
/mcp-health
```

### `/mcp-new-feature`
Guided feature creation:
- Asks what feature to add
- Shows similar examples
- Creates necessary files
- Generates tests
- Verifies compilation
- Updates index

**Usage:**
```
/mcp-new-feature
```

## Creating Your Own Slash Commands

Create files in `.claude/commands/`:

```bash
# Create a new slash command
echo "Your prompt here" > .claude/commands/my-command.md
```

**Example:** `.claude/commands/review-pr.md`
```markdown
Review the current pull request:
1. Search for recently modified files
2. Read each modified file
3. Check for potential issues
4. Run typecheck and lint
5. Provide a code review summary
```

**Use it:**
```
/review-pr
```

## Environment Variables

Customize server behavior:

```bash
# Custom repository root
FRESH_SCHEDULES_ROOT=/path/to/repo pnpm start

# Memory limit
NODE_OPTIONS="--max-old-space-size=512" pnpm start

# Debug logging
DEBUG=mcp:* pnpm dev

# GPT server port
PORT=3001 pnpm start:gpt
```

## Performance Comparison

| Command | Watch | Memory | CPU | Best For |
|---------|-------|--------|-----|----------|
| `pnpm start` | ❌ | Low | Low | Daily use, Chromebook |
| `pnpm start:low-mem` | ❌ | Very Low | Low | Limited resources |
| `pnpm dev` | ✅ | High | Medium | Active development |
| `pnpm dev:no-watch` | ❌ | Medium | Low | Dev without auto-reload |
| `pnpm build:watch` | ✅ | Medium | Medium | Continuous compilation |

## Memory Usage Guide

### Chromebook Optimization

```bash
# Lowest memory (384MB)
pnpm start:low-mem

# Low memory (default Node.js)
pnpm start

# Medium memory (dev mode)
pnpm dev:no-watch

# Higher memory (watch mode)
pnpm dev
```

### Custom Memory Limits

```bash
# 256MB limit
NODE_OPTIONS="--max-old-space-size=256" pnpm start

# 512MB limit
NODE_OPTIONS="--max-old-space-size=512" pnpm start

# 768MB limit
NODE_OPTIONS="--max-old-space-size=768" pnpm start
```

## Quick Reference Card

### Development Workflow
```bash
cd tools/mcp-server

# Option 1: Watch mode (auto-reload)
pnpm dev

# Option 2: No watch (lighter)
pnpm dev:no-watch

# Option 3: Separate terminals (recommended)
pnpm build:watch        # Terminal 1
pnpm dev:no-watch       # Terminal 2
```

### Production Workflow
```bash
cd tools/mcp-server
pnpm build
pnpm start
```

### Testing Workflow
```bash
cd tools/mcp-server
pnpm test               # Run tests
pnpm inspect            # Debug with inspector
```

### Chromebook Workflow
```bash
# Best performance for Chromebook
cd tools/mcp-server
pnpm build
pnpm start:low-mem
```

## Troubleshooting Commands

```bash
# Rebuild everything
pnpm clean && pnpm install && pnpm build

# Check for errors
pnpm test

# Inspect the server
pnpm inspect

# Debug mode
pnpm dev:debug
```

## Rate Limit Considerations

**No rate limits on the MCP server itself**, but be aware of:

### GitHub Copilot Limits
- ~120-180 requests/hour
- Batch operations when possible
- Use line ranges for large files

### Claude Desktop Limits
- Depends on plan (Free/Pro/Team)
- More generous than Copilot
- Better for heavy MCP usage

### Best Practices to Avoid Limits
1. Batch related operations
2. Use indexes for navigation
3. Read with line ranges
4. Search before reading
5. Use `pnpm inspect` to monitor requests

## Command Aliases (Optional)

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# MCP server shortcuts
alias mcp-start='cd /home/patrick/peteywee/fresh-root/tools/mcp-server && pnpm start'
alias mcp-dev='cd /home/patrick/peteywee/fresh-root/tools/mcp-server && pnpm dev:no-watch'
alias mcp-build='cd /home/patrick/peteywee/fresh-root/tools/mcp-server && pnpm build'
alias mcp-test='cd /home/patrick/peteywee/fresh-root/tools/mcp-server && pnpm test'
alias mcp-inspect='cd /home/patrick/peteywee/fresh-root/tools/mcp-server && pnpm inspect'
```

Then use:
```bash
mcp-start       # Start the server
mcp-dev         # Development mode
mcp-build       # Build the server
mcp-test        # Run tests
mcp-inspect     # Launch inspector
```

---

**Quick Tips:**
- 💡 Use `pnpm start` for daily use on Chromebook
- 💡 Use `pnpm dev:no-watch` during development to save resources
- 💡 Use `pnpm inspect` to debug and monitor
- 💡 Create custom slash commands for your workflows
- 💡 Batch MCP operations to avoid rate limits

📚 **More Info:**
- Full usage guide: [USAGE-GUIDE.md](USAGE-GUIDE.md)
- Advanced topics: [ADVANCED-TOPICS.md](ADVANCED-TOPICS.md)
- Quick reference: [QUICK-REFERENCE.md](QUICK-REFERENCE.md)
