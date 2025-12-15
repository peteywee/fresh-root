# MCP Server - Advanced Topics

## Slash Commands & Custom Workflows

### Creating Custom Slash Commands for MCP

You can create custom slash commands that leverage the MCP server. Here's how:

#### 1. Create a `.claude/commands` directory:
```bash
mkdir -p .claude/commands
```

#### 2. Create custom command files:

**`.claude/commands/analyze.md`** - Analyze code structure
```markdown
Use the MCP server to analyze the current project:
1. Get the repository index
2. List the main source directories
3. Search for TODO and FIXME comments
4. Provide a summary of the codebase structure
```

**`.claude/commands/test-feature.md`** - Test a new feature
```markdown
Use the MCP server to test the feature I'm working on:
1. Search for files related to this feature
2. Read the main implementation files
3. Check if tests exist
4. Run the tests
5. Run typecheck
6. Summarize any issues found
```

**`.claude/commands/refactor.md`** - Refactoring workflow
```markdown
Help me refactor code using the MCP server:
1. Ask me what to refactor
2. Search for all occurrences
3. Read the relevant files
4. Suggest the refactoring approach
5. Update the files
6. Run tests and typecheck
7. Update the repository index
```

**`.claude/commands/new-feature.md`** - Add new feature
```markdown
Guide me through adding a new feature:
1. Ask me what feature to add
2. List similar existing features
3. Read relevant existing code
4. Create the new feature files
5. Generate tests
6. Run typecheck and tests
7. Update the repository index
```

#### 3. Use the commands:
```
/analyze          - Analyze the codebase
/test-feature     - Test current feature
/refactor         - Start refactoring workflow
/new-feature      - Add new feature workflow
```

### Pre-built MCP Commands

Here are some useful command templates you can save:

**Quick Health Check:**
```bash
# .claude/commands/health.md
Run a health check on the project:
1. Run typecheck
2. Run lint
3. Run tests
4. Report any issues found
```

**Code Review:**
```bash
# .claude/commands/review.md
Review my recent changes:
1. Search for recently modified files
2. Read each modified file
3. Check for potential issues
4. Suggest improvements
```

## Running Modes

### Development Mode (`pnpm dev`)
- **Auto-reload**: Watches for file changes and reloads automatically
- **Best for**: Active development and debugging
- **Resource usage**: Higher (file watcher + process)

```bash
cd tools/mcp-server
pnpm dev
```

**Pros:**
- Changes reload automatically
- Great for development
- Instant feedback

**Cons:**
- Uses more resources (file watcher)
- Higher memory usage on Chromebook

### Development Without Watch

If you want dev mode without auto-reload (lighter on resources):

```bash
cd tools/mcp-server
tsx src/index.ts
```

Or create a custom script in `package.json`:
```json
{
  "scripts": {
    "dev:no-watch": "tsx src/index.ts",
    "dev:gpt-no-watch": "tsx src/gpt-server.ts"
  }
}
```

Then run:
```bash
pnpm dev:no-watch
```

### Production Mode (`pnpm start`)
- **No watch**: Runs compiled code without watching
- **Best for**: Production use, Chromebook performance
- **Resource usage**: Lower (just the server process)

```bash
cd tools/mcp-server
pnpm start
```

**Pros:**
- Better performance
- Lower resource usage
- Faster startup

**Cons:**
- Need to rebuild after code changes
- No auto-reload

### Recommended for Chromebook

**During active development:**
```bash
# Terminal 1: Watch and rebuild on changes
pnpm build --watch

# Terminal 2: Run without watch
pnpm dev:no-watch
```

**For daily use:**
```bash
pnpm start  # Production mode - best performance
```

## Rate Limits & Performance

### MCP Server Rate Limits

The MCP server itself has **NO rate limits**. However, there are practical limits:

#### File Operation Limits

```javascript
// Built-in safety limits
MAX_DEPTH: 5 levels from repo root
MAX_FILE_SIZE: 50KB per response (truncated if larger)
MAX_RESPONSE: 50KB total (prevents memory issues)
```

#### Directory Ignore Rules

Automatically ignores:
```
node_modules/
dist/
.git/
.next/
coverage/
.turbo/
*.lock files
```

### GitHub Copilot Rate Limits

**Important:** GitHub Copilot itself has rate limits:

1. **Requests per hour**: ~120-180 requests (varies by plan)
2. **Tokens per request**: Limited by OpenAI's context window
3. **Concurrent requests**: Usually 1-2 at a time

#### Strategies to Avoid Rate Limits

**1. Batch operations efficiently:**
```
❌ Bad: Make 50 separate read requests
✅ Good: "Read these 5 key files: [list]"
```

**2. Use indexes instead of listings:**
```
❌ Bad: Repeatedly list directories
✅ Good: Get the index once, use it for reference
```

**3. Use line ranges:**
```
❌ Bad: Read entire 2000-line file
✅ Good: "Read lines 100-150 of large-file.ts"
```

**4. Search before reading:**
```
❌ Bad: Read all files to find a function
✅ Good: Search for the function, then read the specific file
```

**5. Combine related operations:**
```
❌ Bad: Three separate tool calls for read, update, verify
✅ Good: "Read config.ts, update the port to 3000, and verify"
```

### Claude Desktop Rate Limits

Claude Desktop (via Anthropic API) has different limits:

1. **Messages per day**: Depends on your plan (Free/Pro/Team)
2. **Tokens per request**: Much higher than Copilot
3. **Rate per minute**: 50-1000 requests/min (plan dependent)

**Pro tip:** Claude Desktop is more generous with MCP tools than GitHub Copilot.

### Optimizing for Rate Limits

#### Smart Caching Strategy

```bash
# 1. Get index at start of session (cache in context)
"Get the repository index"

# 2. Use index for navigation (no additional API calls)
"Based on the index, where is the auth logic?"

# 3. Read only what you need
"Read the auth.ts file, lines 50-100"
```

#### Grouping Operations

Instead of:
```
1. "Read file A"
2. "Read file B"
3. "Read file C"
4. "Update file A"
5. "Update file B"
```

Do this:
```
"Read files A, B, and C, then update A and B with [changes]"
```

### Performance Monitoring

Track your MCP server performance:

```bash
# Development mode with logging
DEBUG=mcp:* pnpm dev

# Check memory usage
ps aux | grep node

# Monitor file operations
pnpm inspect  # Opens MCP Inspector with real-time monitoring
```

### Chromebook-Specific Optimizations

**Memory-conscious operations:**
```bash
# Set memory limit for Node.js
NODE_OPTIONS="--max-old-space-size=512" pnpm start

# Use production mode
pnpm start  # Instead of pnpm dev
```

**Limit depth and scope:**
```
❌ "List the entire project with depth 5"
✅ "List src/components with depth 2"
```

**Close unused applications:**
- Close Chrome tabs when using MCP tools
- Stop other Node processes
- Use VSCode's "low power mode" if available

## MCP Inspector for Debugging

The MCP Inspector is invaluable for monitoring:

```bash
cd tools/mcp-server
pnpm inspect
```

**What you can see:**
- Real-time tool calls
- Request/response payloads
- Performance metrics
- Error messages
- Resource usage

**Use it to:**
1. Debug tool behavior
2. See exact API calls
3. Monitor rate of requests
4. Identify slow operations
5. Test tools interactively

## Custom Server Modes

You can create custom modes in `package.json`:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "dev:no-watch": "tsx src/index.ts",
    "dev:debug": "NODE_OPTIONS='--inspect' tsx src/index.ts",
    "dev:verbose": "DEBUG=* tsx watch src/index.ts",
    "start": "node dist/index.js",
    "start:gpt": "node dist/gpt-server.ts",
    "start:low-mem": "NODE_OPTIONS='--max-old-space-size=384' node dist/index.js"
  }
}
```

## Environment Variables

Customize behavior with environment variables:

```bash
# Custom repo root
FRESH_SCHEDULES_ROOT=/path/to/repo pnpm start

# Memory limit
NODE_OPTIONS="--max-old-space-size=512" pnpm start

# Debug mode
DEBUG=mcp:* pnpm dev

# Port for GPT server
PORT=3001 pnpm start:gpt
```

## Best Practices Summary

### For Slash Commands:
- Create workflows in `.claude/commands/`
- Make them reusable and specific
- Combine multiple MCP tools in one command

### For Running Modes:
- **Active dev**: `pnpm dev` or `pnpm dev:no-watch`
- **Chromebook**: `pnpm start` (production mode)
- **Debugging**: `pnpm inspect` or `pnpm dev:debug`

### For Rate Limits:
- Batch operations when possible
- Use indexes for navigation
- Read with line ranges
- Search before reading
- Monitor with MCP Inspector
- Use Claude Desktop for heavy usage

## Troubleshooting

### Out of Memory
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=768" pnpm start
```

### Rate Limit Hit
```bash
# Wait a few minutes
# Or switch to Claude Desktop
# Or batch your operations more efficiently
```

### Server Unresponsive
```bash
# Restart in production mode
pnpm build
pnpm start
```

### Slow Performance
```bash
# Use production mode
pnpm start

# Reduce scope
# Use depth 1-2
# Use line ranges
```

---

**Pro Tips:**
1. Use `pnpm start` on Chromebook for best performance
2. Create custom slash commands for common workflows
3. Batch MCP tool calls to avoid rate limits
4. Use the MCP Inspector to monitor and debug
5. Switch to Claude Desktop for heavy MCP usage

🚀 Happy optimizing!
