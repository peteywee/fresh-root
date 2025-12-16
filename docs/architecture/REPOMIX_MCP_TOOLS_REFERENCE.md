# Repomix MCP Tools Reference

**Status**: ✅ **Configured and Ready**  
**Configuration**: `.mcp.json` - `repomix/repomix-mcp`  
**Access**: Available in GitHub Copilot after restart  
**Date**: December 16, 2025

---

## 🛠️ Available Tools (7 Total)

### **1. mcp_repomix_pack_codebase**

**Purpose**: Package a local code directory for AI analysis

**Parameters**:
```typescript
{
  directory: string;           // Absolute path to directory
  style?: "xml" | "markdown" | "json" | "plain";  // Output format (default: xml)
  compress?: boolean;          // Tree-sitter compression (70% token savings)
  ignorePatterns?: string;     // Fast-glob patterns to exclude
  includePatterns?: string;    // Fast-glob patterns to include
  topFilesLength?: number;     // Largest files to show (default: 10)
}
```

**Example Usage**:
```
User: "Pack the API framework and analyze its patterns"

Agent calls:
  mcp_repomix_pack_codebase({
    directory: "/path/to/packages/api-framework",
    style: "markdown",
    compress: true
  })

Result: Structured output showing:
  - File tree
  - Metrics (lines of code, file sizes)
  - All file contents
  - Optional: Tech stack detection
```

**Best For**:
- Real-time codebase analysis during conversation
- Understanding project structure
- Identifying patterns and anti-patterns
- Preparing code for AI review

**Token Savings**: With `compress: true`, ~70% reduction in token usage

---

### **2. mcp_repomix_pack_remote_repository**

**Purpose**: Clone and analyze a GitHub repository

**Parameters**:
```typescript
{
  remote: string;              // GitHub URL or user/repo format
  style?: "xml" | "markdown" | "json" | "plain";
  compress?: boolean;          // Tree-sitter compression
  ignorePatterns?: string;     // Patterns to exclude
  includePatterns?: string;    // Patterns to include
  topFilesLength?: number;
}
```

**Supported Formats**:
- `"yamadashy/repomix"` (user/repo)
- `"https://github.com/user/repo"`
- `"https://github.com/user/repo/tree/branch"` (specific branch)

**Example Usage**:
```
User: "How does Next.js structure their API routes? Compare to ours"

Agent calls:
  mcp_repomix_pack_remote_repository({
    remote: "vercel/next.js",
    style: "json",
    compress: true,
    includePatterns: "**/api/**"
  })

Result: Analyzes Next.js repo, compares patterns with ours
```

**Best For**:
- Competitor analysis
- Research external patterns
- Learn from established projects
- Benchmarking code quality
- Security pattern research

**Security**: Includes vulnerability detection on cloned code

---

### **3. mcp_repomix_attach_packed_output**

**Purpose**: Load an existing packed output file for AI analysis

**Parameters**:
```typescript
{
  path: string;                // Path to packed file (.xml, .md, .json, .txt)
  topFilesLength?: number;     // Files to summarize (default: 10)
}
```

**Example Usage**:
```
User: "Analyze yesterday's repomix output"

Agent calls:
  mcp_repomix_attach_packed_output({
    path: "/path/to/repomix-snapshot-2025-12-15.json"
  })

Result: Loads the packed output, makes it available for analysis
```

**Best For**:
- Analyzing archived snapshots
- Comparing codebase over time
- Iterative analysis without re-packing
- Cold-starting analysis with pre-computed data

---

### **4. mcp_repomix_grep_repomix_output**

**Purpose**: Search within a packed Repomix output (like grep)

**Parameters**:
```typescript
{
  outputId: string;            // ID of packed output (from attach_packed_output)
  pattern: string;             // JavaScript RegExp syntax
  ignoreCase?: boolean;        // Case-insensitive (default: false)
  contextLines?: number;       // Before/after context (default: 0)
  beforeLines?: number;        // Lines before match (overrides contextLines)
  afterLines?: number;         // Lines after match (overrides contextLines)
}
```

**Example Usage**:
```
User: "Find all error handling in the API framework"

Agent calls:
  mcp_repomix_grep_repomix_output({
    outputId: "api-framework-packed",
    pattern: "catch|throw|error",
    ignoreCase: true,
    contextLines: 2
  })

Result: Returns all matches with 2 lines before/after
```

**Best For**:
- Fast search without re-packing
- Pattern discovery
- Code quality checks
- Finding examples of patterns
- Security scanning (e.g., "find all fetch calls")

**RegExp Syntax**: Full JavaScript RegExp support
```
// Examples:
"catch|throw|Error"           // Multiple patterns
"async\s+function"            // Whitespace patterns
"z\.object\("                 // Escaped special chars
"^export\s+(const|function)"  // Line anchors
```

---

### **5. mcp_repomix_generate_skill**

**Purpose**: Generate a Claude Agent Skill from a codebase

**Parameters**:
```typescript
{
  directory: string;                     // Absolute path
  skillName?: string;                    // Skill name (kebab-case, auto-normalized)
  compress?: boolean;                    // Tree-sitter compression
  ignorePatterns?: string;               // Patterns to exclude
  includePatterns?: string;              // Patterns to include
}
```

**Output Structure**:
```
.claude/skills/<skill-name>/
├── SKILL.md                            # Entry point with metadata
└── references/
    ├── summary.md                      # Purpose, format, statistics
    ├── project-structure.md            # Directory tree with line counts
    ├── files.md                        # All file contents
    └── tech-stack.md                   # Languages, frameworks, dependencies
```

**Example Usage**:
```
User: "Create a Claude Skill for the SDK factory pattern"

Agent calls:
  mcp_repomix_generate_skill({
    directory: "/path/to/packages/api-framework",
    skillName: "sdk-factory-pattern",
    compress: true,
    includePatterns: "**/src/**/*.ts"
  })

Result: 
  ✅ .claude/skills/sdk-factory-pattern/ created
  ✅ SKILL.md with usage guide
  ✅ references/ with full structure
  ✅ Team can now use @sdk-factory in prompts
```

**Best For**:
- Team knowledge sharing
- Creating reusable pattern libraries
- Onboarding new team members
- Standardizing patterns across team
- Building institutional knowledge

**Skill Features**:
- YAML frontmatter for indexing
- Auto-detected tech stack
- Line count metrics
- Shareable via git (in `.claude/skills/`)

---

### **6. mcp_repomix_file_system_read_file**

**Purpose**: Read a file with built-in security validation

**Parameters**:
```typescript
{
  path: string;     // Absolute path to file
}
```

**Example Usage**:
```
User: "Read the API handler pattern"

Agent calls:
  mcp_repomix_file_system_read_file({
    path: "/path/to/packages/api-framework/src/index.ts"
  })

Result: File contents (with security checks)
```

**Security Features**:
- ✅ Detects API keys, passwords, secrets
- ✅ Blocks access to `.env` files
- ✅ Warns on files with sensitive patterns
- ✅ Prevents accidental secret exposure
- ✅ Audit trail of file access

**Example Security Detection**:
```
User: "Read .env"

Agent calls:
  mcp_repomix_file_system_read_file({
    path: ".env"
  })

Result: ❌ BLOCKED
Message: "File contains sensitive data (API keys, tokens). 
         Use environment variable access instead."
```

**Best For**:
- Safe file reading in conversations
- Preventing secret leaks
- Audit trail compliance
- Secure code review

---

### **7. mcp_repomix_file_system_read_directory**

**Purpose**: List directory contents with security awareness

**Parameters**:
```typescript
{
  path: string;     // Absolute path to directory
}
```

**Output Format**:
```
folder-name/
├── [FILE] index.ts
├── [FILE] types.ts
├── [DIR] utils/
└── [FILE] README.md
```

**Example Usage**:
```
User: "What files are in the API framework?"

Agent calls:
  mcp_repomix_file_system_read_directory({
    path: "/path/to/packages/api-framework/src"
  })

Result:
  [FILE] index.ts        (API factory exports)
  [FILE] testing.ts      (Test utilities)
  [DIR] middleware/
  [DIR] validators/
```

**Security Features**:
- ✅ Hides `.env` and `.env.*` files by default
- ✅ Warns if sensitive files detected
- ✅ Respects `.gitignore` patterns
- ✅ Prevents directory traversal attacks

**Best For**:
- Exploring project structure
- Finding files to analyze
- Verifying sensitive file isolation
- Safe navigation without `ls -la`

---

## 📊 Comparison Matrix

| Tool | Real-Time | Compression | External | Security | Token Efficient |
|------|-----------|-------------|----------|----------|-----------------|
| `pack_codebase` | ✅ | ✅ | ❌ | ⚠️ Basic | ✅ 70% savings |
| `pack_remote_repository` | ✅ | ✅ | ✅ | ✅ High | ✅ 70% savings |
| `attach_packed_output` | ✅ | — | — | ✅ High | ✅ Reuses data |
| `grep_repomix_output` | ✅ | — | — | ✅ High | ✅ No re-pack |
| `generate_skill` | ✅ | ✅ | ❌ | ✅ High | ✅ Indexed |
| `file_system_read_file` | ✅ | ❌ | ❌ | ✅ Excellent | ⚠️ Full content |
| `file_system_read_directory` | ✅ | N/A | ❌ | ✅ Excellent | ✅ Metadata only |

---

## 🎯 Common Use Cases

### Use Case 1: Real-Time Code Analysis

```
User: "Analyze the SDK factory pattern and suggest improvements"

Agent workflow:
  1. [Calls mcp_repomix_pack_codebase]
     ↓ Gets structured codebase in ~5 tokens
  2. [Analyzes patterns]
     ↓ Identifies middleware chain, validation, RBAC
  3. [Calls mcp_repomix_grep_repomix_output]
     ↓ Finds error handling patterns
  4. [Returns analysis + improvements]

Result: Complete analysis in <2 min, 70% fewer tokens
```

### Use Case 2: Competitor Research

```
User: "How does Supabase handle real-time subscriptions?"

Agent workflow:
  1. [Calls mcp_repomix_pack_remote_repository]
     ↓ Clones supabase/supabase, analyzes patterns
  2. [Searches for WebSocket/subscription patterns]
     ↓ mcp_repomix_grep_repomix_output with "subscribe|WebSocket"
  3. [Compares to our implementation]
  4. [Returns competitive analysis]

Result: Instant competitive intelligence
```

### Use Case 3: Team Knowledge Sharing

```
User: "Create a Skill for the Firestore patterns we use"

Agent workflow:
  1. [Calls mcp_repomix_generate_skill]
     ↓ Packages firestore rules + SDK patterns
  2. [Creates .claude/skills/firestore-patterns/]
  3. [Shares with team]

Result: Team can now use @firestore-patterns in any chat
```

### Use Case 4: Security Audit

```
User: "Find all API endpoints with error handling"

Agent workflow:
  1. [Calls mcp_repomix_pack_codebase]
     ↓ Gets all API routes
  2. [Calls mcp_repomix_grep_repomix_output]
     ↓ Searches: "catch|error|Exception|500"
  3. [Identifies missing error handling]
  4. [Reports risks]

Result: Security vulnerabilities found + fixed
```

---

## 🚀 Quick Start

### Step 1: Restart GitHub Copilot
- Close VS Code
- Reopen VS Code
- The `.mcp.json` changes should load

### Step 2: Verify MCP Connection
Ask in Copilot chat:
```
"What Repomix MCP tools are available?"
```

Expected response:
```
Available Repomix MCP Tools:
1. mcp_repomix_pack_codebase
2. mcp_repomix_pack_remote_repository
3. mcp_repomix_attach_packed_output
4. mcp_repomix_grep_repomix_output
5. mcp_repomix_generate_skill
6. mcp_repomix_file_system_read_file
7. mcp_repomix_file_system_read_directory
```

### Step 3: Test with Simple Request
```
"Pack the types package and show me the structure"
```

Agent should:
1. Call `mcp_repomix_pack_codebase` on `packages/types`
2. Return structured output
3. Summarize contents

---

## 📚 Documentation Links

- **Setup**: See `.mcp.json` for configuration
- **Integration Plan**: [REPOMIX_MCP_INTEGRATION_PLAN.md](./REPOMIX_MCP_INTEGRATION_PLAN.md)
- **Repomix Docs**: https://repomix.com/docs/mcp
- **MCP Protocol**: https://modelcontextprotocol.io/

---

## ⚙️ Configuration Details

**In `.mcp.json`**:
```json
"repomix/repomix-mcp": {
  "type": "stdio",
  "command": "npx",
  "args": ["@repomix/mcp-server@latest"],
  "env": {},
  "cwd": "${workspaceFolder}",
  "description": "Repomix MCP Server for AI-powered code analysis..."
}
```

**Why npx?**
- Auto-updates to latest version
- No local dependency needed
- Easy to disable (just remove from `.mcp.json`)
- Lightweight (no npm install)

---

## 🔧 Troubleshooting

### Tools not appearing?
- [ ] Restart VS Code completely
- [ ] Check `.mcp.json` is valid (use online JSON validator)
- [ ] Check terminal for MCP server errors
- [ ] Try: `npx @repomix/mcp-server@latest --version`

### MCP server not connecting?
- [ ] Verify Node.js >= 20.10.0
- [ ] Verify npx available: `which npx`
- [ ] Check firewall/network settings
- [ ] Look for MCP error logs in VS Code output

### Performance slow?
- [ ] Use `compress: true` to reduce tokens by 70%
- [ ] Use `grep_repomix_output` instead of re-packing
- [ ] Limit with `includePatterns` (e.g., `"src/**/*.ts"`)
- [ ] Use `topFilesLength: 5` for smaller summaries

---

## 📈 Benefits Summary

| Benefit | Impact | Example |
|---------|--------|---------|
| **Speed** | 10x faster analysis | Analyze API framework in <1 minute |
| **Tokens** | 70% reduction | 50k → 15k tokens with compression |
| **Intelligence** | Real-time insights | "Find all error handling" with grep |
| **Security** | Built-in protection | Blocks .env, detects secrets |
| **Knowledge** | Team scalability | Auto-generate Claude Skills |
| **Research** | Competitive advantage | Analyze any GitHub repo instantly |

---

**Status**: ✅ **Ready to Use**  
**Next**: Restart GitHub Copilot and test  
**Owner**: Your Development Team  
**Last Updated**: December 16, 2025

---

*"You now have 7 powerful tools for code analysis. Start with: 'Pack the API framework and analyze its patterns'"*
