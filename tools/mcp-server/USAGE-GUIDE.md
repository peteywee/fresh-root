# MCP Server - Usage Guide

Tips, tricks, and best practices for working with the Fresh Schedules MCP Server.

## Quick Reference

### Essential Commands

```bash
# Start server in development mode (auto-reload)
cd tools/mcp-server && pnpm dev

# Start server in production mode (better performance)
cd tools/mcp-server && pnpm start

# Run tests to verify everything works
cd tools/mcp-server && pnpm test

# Inspect server with MCP Inspector (great for debugging)
cd tools/mcp-server && pnpm inspect
```

## Tool Usage Tips

### 1. `fs_read_file` - Reading Files

**Basic usage:**
```
Read the package.json file
```

**With line ranges (efficient for large files):**
```
Read lines 50-100 of src/index.ts
```

**Best Practices:**
- Use line ranges for large files to save tokens and improve performance
- Great for reviewing specific functions or sections
- Combine with `fs_search` to find exact line numbers first

**Example workflow:**
```
1. "Search for the handleAuth function"
2. "Read lines 150-200 of src/auth.ts" (based on search results)
```

### 2. `fs_create_file` - Creating Files

**Auto-creates parent directories:**
```
Create a new file at apps/web/features/analytics/hooks/useTracking.ts
```

**Best Practices:**
- No need to create directories first - they're created automatically
- Use TypeScript's import paths to ensure files are in the right location
- Always follow the project's file naming conventions

**Common patterns:**
```
Create apps/web/components/ui/Button.tsx       # Component
Create apps/web/app/api/analytics/route.ts    # API route
Create packages/shared/types/analytics.ts     # Shared types
```

### 3. `fs_update_file` - Updating Files

**Search and replace (safest method):**
```
Update src/config.ts: replace "API_URL = 'localhost'" with "API_URL = 'production'"
```

**Full content update (use carefully):**
```
Replace the entire contents of .env.example with [content]
```

**Best Practices:**
- Prefer search/replace over full updates - it's more precise
- Always read the file first to understand context
- Use unique search strings to avoid replacing wrong occurrences
- Verify changes with another read after updating

**Example workflow:**
```
1. "Read src/config.ts"
2. "Update the API timeout from 3000 to 5000 in src/config.ts"
3. "Read src/config.ts" (verify the change)
```

### 4. `fs_delete_file` - Deleting Files

**Requires confirmation:**
```
Delete the old-component.tsx file with confirmation
```

**Best Practices:**
- Always used with caution - deletions are permanent
- Consider moving to a backup location first
- Verify you're deleting the right file with `fs_read_file` first

### 5. `fs_list` - Directory Listings

**Basic listing:**
```
List the contents of apps/web/app
```

**With depth control (important for performance):**
```
List apps/web/app with depth 2
```

**Best Practices:**
- Use lower depth (1-2) for better performance
- Great for understanding project structure
- Combine with `fs_search` for finding specific files

**Depth recommendations:**
- Depth 1: Quick overview of immediate children
- Depth 2: Standard exploration (default)
- Depth 3: Deeper exploration (slower)
- Depth 4-5: Only when necessary (can be slow)

### 6. `fs_search` - Code Search

**Simple search:**
```
Search for "handleSubmit"
```

**Regex patterns:**
```
Search for function definitions: "export (async )?function \w+"
Search for TODO comments: "TODO:|FIXME:"
Search for imports: "import.*from.*zod"
```

**Best Practices:**
- Use regex for powerful searches
- Searches across the entire repository
- Great for finding all usages of a function
- Respects .gitignore (skips node_modules, dist, etc.)

**Common search patterns:**
```
Find all API routes: "export (async )?function (GET|POST|PUT|DELETE)"
Find all React hooks: "use[A-Z]\w+"
Find error handling: "catch|throw new Error"
Find environment variables: "process\.env\.\w+"
```

### 7. `fs_move` - Moving/Renaming

**Rename files:**
```
Move old-name.ts to new-name.ts
```

**Move to different directory:**
```
Move src/utils/helper.ts to src/lib/helper.ts
```

**Best Practices:**
- Verify the file exists first with `fs_list` or `fs_read_file`
- Remember to update imports in other files
- Use `fs_search` to find all import references

**Example workflow:**
```
1. "Move src/utils/formatDate.ts to src/lib/formatDate.ts"
2. "Search for imports of formatDate"
3. Update all import statements to use new path
```

### 8. `fs_get_schema` - Schema Inspection

**Get TypeScript schema:**
```
Get the User schema definition
Get the Schedule interface
```

**Best Practices:**
- Great for understanding data structures
- Helps write type-safe code
- Use before creating new features that interact with existing types

### 9. `fs_create_test` - Test Generation

**Generate unit tests:**
```
Create unit tests for src/lib/formatDate.ts
```

**Generate integration tests:**
```
Create integration tests for apps/web/app/api/schedules/route.ts
```

**Best Practices:**
- Generate tests early in development
- Review and customize generated tests
- Ensure tests match your project's testing patterns

### 10. `fs_run` - Running Commands

**Type checking:**
```
Run typecheck
```

**Linting:**
```
Run lint
Run lint with fixes
```

**Testing:**
```
Run unit tests
Run all tests
```

**Building:**
```
Run build
```

**Best Practices:**
- Run typecheck before committing
- Use lint:fix to auto-fix issues
- Always run tests before pushing

### 11. `fs_update_index` - Index Management

**Update main repo index:**
```
Update the repository index
```

**Update specific directory:**
```
Update index for apps/web/app/api
```

**Best Practices:**
- Keep indexes updated for better navigation
- Update after adding new features or files
- Use depth 2-3 for balanced detail vs. performance

### 12. `fs_get_index` - Reading Indexes

**Read main index:**
```
Get the repository index
```

**Read directory index:**
```
Get the index for apps/web/features
```

**Best Practices:**
- Use indexes for quick project overview
- Faster than listing with `fs_list` for large directories
- Shows exported symbols from TypeScript files

## Workflow Patterns

### Pattern 1: Adding a New Feature

```
1. "List the current features directory"
2. "Read the existing similar feature for reference"
3. "Create the new feature file at [path]"
4. "Create unit tests for the new feature"
5. "Run typecheck"
6. "Run tests"
7. "Update the repository index"
```

### Pattern 2: Debugging an Issue

```
1. "Search for the error message or function name"
2. "Read the relevant file sections"
3. "Read related test files"
4. "Update the fix"
5. "Run tests to verify"
```

### Pattern 3: Refactoring

```
1. "Search for all usages of the old pattern"
2. "Read files that use the pattern"
3. "Update each file with the new pattern"
4. "Run typecheck and lint"
5. "Run all tests"
6. "Update indexes if file structure changed"
```

### Pattern 4: Exploring Unfamiliar Code

```
1. "Get the repository index" (overview)
2. "List the [feature] directory" (drill down)
3. "Search for [key function/class]" (find implementation)
4. "Read the main implementation file"
5. "Get the schema for key data structures"
6. "Read the tests to understand usage"
```

## Performance Tips

### For Chromebook/Limited Resources

1. **Use specific paths instead of searching everything:**
   ```
   ❌ "Search the entire repo for handleSubmit"
   ✅ "Search in apps/web/app for handleSubmit"
   ```

2. **Limit directory depth:**
   ```
   ❌ "List apps with depth 5"
   ✅ "List apps with depth 2"
   ```

3. **Use line ranges for large files:**
   ```
   ❌ "Read all of dist/bundle.js"
   ✅ "Read lines 1-50 of src/index.ts"
   ```

4. **Use production mode when not actively developing:**
   ```bash
   pnpm start  # Instead of pnpm dev
   ```

## Security Best Practices

### Path Safety

The server automatically:
- Prevents access outside the repository
- Limits depth to 5 levels from repo root
- Blocks access to `.git`, `node_modules`, `.env`, etc.

### Safe Operations

1. **Always confirm before deleting:**
   - The server requires `confirm=true` for deletions

2. **Review changes before running:**
   - Read files before updating
   - Check diffs after updates

3. **Don't commit sensitive data:**
   - Never create `.env` files with real secrets
   - Use `.env.example` with placeholder values

## Advanced Tips

### 1. Combining Multiple Operations

```
"Search for all API routes, then create unit tests for each one"
```

### 2. Using Indexes Efficiently

```
1. Update index when starting work
2. Use index to understand project structure
3. Update index before finishing (documents your changes)
```

### 3. Batch Operations

```
"Create these three files:
1. components/Button.tsx
2. components/Input.tsx
3. components/Form.tsx"
```

### 4. Pattern-Based Updates

```
"Find all files that import 'oldUtil' and update them to import 'newUtil'"
```

## Common Pitfalls to Avoid

### ❌ Don't Do This

1. **Updating without reading first**
   ```
   ❌ "Update config.ts to change the port"
   ✅ "Read config.ts" → then update with context
   ```

2. **Deleting without verification**
   ```
   ❌ "Delete all test files"
   ✅ "List test directory" → selectively delete
   ```

3. **Deep listings on large directories**
   ```
   ❌ "List node_modules with depth 5"
   ✅ "List src with depth 2"
   ```

4. **Vague search patterns**
   ```
   ❌ "Search for 'test'"
   ✅ "Search for 'describe\\(' to find test suites"
   ```

## MCP Inspector Usage

The MCP Inspector is a powerful debugging tool:

```bash
cd tools/mcp-server
pnpm inspect
```

**Use it to:**
- Test tools interactively
- Debug tool behavior
- See exact request/response format
- Verify the server is working correctly

**Pro tip:** Keep the inspector open in a separate terminal while developing to quickly test changes.

## Troubleshooting Common Issues

### Server won't start
```bash
cd tools/mcp-server
pnpm install
pnpm build
pnpm start
```

### Tools not appearing in VS Code
1. Reload VS Code window
2. Check Output panel → GitHub Copilot Chat
3. Verify configuration in .vscode/settings.json

### Slow performance
1. Reduce directory depth in listings
2. Use more specific search patterns
3. Use line ranges when reading files
4. Switch to production mode: `pnpm start`

### Permission errors
```bash
chmod -R u+r /home/patrick/peteywee/fresh-root
```

## Examples from Real Workflows

### Example 1: Adding Authentication

```
You: "I need to add authentication to the app"
Claude: "Let me help you add authentication. First, let me understand the current structure."

1. Get repository index
2. List apps/web/app/api to see existing routes
3. Search for existing auth patterns
4. Create apps/web/app/api/auth/login/route.ts
5. Create apps/web/app/api/auth/logout/route.ts
6. Create apps/web/lib/auth.ts with helper functions
7. Create tests for auth routes
8. Run typecheck
9. Update repository index
```

### Example 2: Fixing a Bug

```
You: "The date formatting is showing the wrong timezone"
Claude: "Let me investigate the date formatting issue."

1. Search for "formatDate|toLocaleDateString"
2. Read the date utility file
3. Read the component using date formatting
4. Update the utility with timezone-aware formatting
5. Update tests for the utility
6. Run tests to verify fix
```

### Example 3: Refactoring Components

```
You: "Move all Button components to a shared UI library"
Claude: "I'll help refactor the Button components."

1. Search for "Button\.tsx"
2. Read each Button component
3. Create packages/ui/components/Button.tsx with unified component
4. Search for all Button imports
5. Update imports in all files
6. Delete old Button components
7. Run typecheck
8. Run tests
9. Update indexes
```

## Best Practices Summary

✅ **DO:**
- Read files before updating them
- Use specific paths when possible
- Limit directory depth (1-3)
- Use line ranges for large files
- Run typecheck and tests after changes
- Update indexes when adding features
- Use search to find files and patterns
- Verify changes after making them

❌ **DON'T:**
- Update files without reading them first
- Use deep directory listings (>3)
- Search with overly broad patterns
- Delete files without verification
- Forget to run tests after changes
- Commit without type checking

## Getting Help

- **Setup Issues**: See [README-SETUP.md](README-SETUP.md)
- **Chromebook Specific**: See [chromebook-setup.md](chromebook-setup.md)
- **API Documentation**: See [openapi.yaml](openapi.yaml)
- **Tool Tests**: Run `pnpm test` to see examples

---

**Pro Tip:** The MCP server is designed to help Claude understand and work with your codebase more effectively. Use it naturally in conversation, and Claude will choose the right tools for the task! 🚀
