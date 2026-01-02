# MCP Tooling Strategy: Always-On vs. On-Demand
**Date**: December 16, 2025\
**Status**: Planning Phase\
**Author**: Development Team\
**Priority**: P1 (Agent Productivity)

---

## Executive Summary
We have **4 MCP servers configured** with **25+ total tools** available. The challenge: ensuring
agents automatically access the **right tools at the right time** without manual intervention.

**Current Problem**:

- Chrome DevTools requires manual input prompts (browser URL, headless mode, isolation)
- Firebase requires Firebase CLI initialization per project
- Repomix requires conscious activation
- GitHub MCP has no initialization overhead ✅

**Desired State**:

- 80%+ of tools "just work" without prompts
- Agent automatically selects best tools for task
- Zero manual configuration during analysis
- Clear tool availability visibility

---

## Current MCP Server Status
### **1. GitHub MCP** ✅ ALWAYS-ON (CRITICAL)
**Status**: HTTP server, always available\
**Initialization**: None required\
**Tools Available**: 25+

```json
{
  "type": "http",
  "url": "https://api.githubcopilot.com/mcp/",
  "version": "0.13.0"
}
```

**Tools**:

- Repository operations (search, list, read)
- Pull request management (create, list, review)
- Issue tracking (search, create, comment)
- Code search
- User/org queries
- Commit operations
- Release management

**Why Always-On**:

- No initialization required
- Highest utility (repo context, PR management, issue tracking)
- Zero latency (HTTP)
- Critical for dev workflow

**Tool Frequency** (estimated):

- 🔴 HIGH: `search_*`, `list_pull_requests`, `create_pull_request`
- 🟡 MEDIUM: `get_issues`, `create_issue`, `comment_on_pr`
- 🟢 LOW: `list_releases`, `get_commits`

---

### **2. Firebase** 🟡 SEMI-ALWAYS-ON (FREQUENTLY NEEDED)
**Status**: stdio, requires initialization\
**Initialization**: `firebase login`, project context\
**Tools Available**: 15+

```json
{
  "type": "stdio",
  "command": "npx",
  "args": ["firebase@12.4.0"],
  "env": {},
  "cwd": "${workspaceFolder}"
}
```

**Tools**:

- Firestore database operations (read, write, delete)
- Authentication operations
- Deployment (rules, functions, hosting)
- Emulator control
- Configuration management

**Why Semi-Always-On**:

- Database operations are critical for our system
- Most API routes depend on Firebase
- Project context pre-initialized (firebase.json exists)

**Tool Frequency** (estimated):

- 🔴 HIGH: Firestore CRUD, rules deployment, emulator start
- 🟡 MEDIUM: Auth operations, config read
- 🟢 LOW: Hosting deployment (rare during dev)

**Optimization Needed**:

- Pre-initialize Firebase context on startup
- Cache Firebase state (project ID, auth status)
- Reduce initialization prompts

---

### **3. Repomix** 🟢 ON-DEMAND BUT CRITICAL (NEW)
**Status**: stdio, zero prompts\
**Initialization**: None required\
**Tools Available**: 7

```json
{
  "type": "stdio",
  "command": "npx",
  "args": ["@repomix/mcp-server@latest"],
  "cwd": "${workspaceFolder}"
}
```

**Tools**:

1. `mcp_repomix_pack_codebase` — Local analysis (compression 70%)
2. `mcp_repomix_pack_remote_repository` — External repo research
3. `mcp_repomix_attach_packed_output` — Reuse previous analysis
4. `mcp_repomix_grep_repomix_output` — Pattern search
5. `mcp_repomix_generate_skill` — Team knowledge sharing
6. `mcp_repomix_file_system_read_file` — Safe file access
7. `mcp_repomix_file_system_read_directory` — Safe directory listing

**Why ON-DEMAND (Not Always-On)**:

- Code analysis isn't needed for every task
- Packing takes 1-2 seconds (acceptable latency)
- Agent can decide when to use intelligently
- Zero initialization overhead (good candidate for auto-activation)

**Tool Frequency** (estimated):

- 🔴 HIGH: `pack_codebase`, `pack_remote_repository` (analysis-heavy tasks)
- 🟡 MEDIUM: `grep_repomix_output`, `generate_skill`
- 🟢 LOW: File system operations (better handled by local tools)

**Opportunity**: Should be auto-activated on task start (no cost to availability)

---

### **4. Chrome DevTools** 🔴 PROBLEMATIC (LOW PRIORITY)
**Status**: stdio, requires input prompts (3 prompts per start)\
**Initialization**: Browser URL, headless mode, isolation settings\
**Tools Available**: 8+

```json
{
  "type": "stdio",
  "command": "npx",
  "args": ["chrome-devtools-mcp@0.0.1-seed", ...inputs],
  "gallery": "..."
}
```

**Tools**:

- Browser automation
- Screenshot capture
- DOM inspection
- Performance profiling

**Why LOW PRIORITY**:

- Requires 3 input prompts (friction)
- E2E testing is still mostly Playwright-driven
- Browser automation handled by Playwright in tests
- Low frequency in dev workflow (mostly QA/testing)

**Issues**:

- ❌ Prompts block agent execution
- ❌ Not suitable for auto-activation
- ❌ Requires specific browser setup

**Recommendation**: Keep available, but mark as "on-demand with prompts"

---

## Tool Selection Hierarchy
**Agent should auto-select tools in this order**:

```
┌─────────────────────────────────────────────────────────────┐
│ TASK COMES IN (e.g., "Analyze API route patterns")          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                ┌──────────▼──────────┐
                │ Is it code analysis?│
                └──────┬──────────┬───┘
                       │          │
                    YES│          │NO
                       │          │
         ┌─────────────▼─┐   ┌──▼──────────────┐
         │ Activate      │   │ Is it repo work?│
         │ Repomix MCP   │   └──┬──────────┬────┘
         │ Auto-pack     │      │          │
         └───────────────┘   YES│          │NO
                               │          │
                    ┌──────────▼──┐   ┌──▼──────────────┐
                    │ Activate    │   │ Is it database?│
                    │ GitHub MCP  │   └──┬──────┬───────┘
                    │ Search/list │      │      │
                    │ operations  │   YES│      │NO
                    └─────────────┘      │      │
                              ┌──────────▼──┐   │
                              │ Activate    │   │
                              │ Firebase MCP│   │
                              │ Query/write │   │
                              └─────────────┘   │
                                                │
                                  ┌─────────────▼──┐
                                  │ Use local tools│
                                  │ (read_file,    │
                                  │  grep_search)  │
                                  └────────────────┘
```

---

## Recommendation: MCP Configuration Tiers
### **TIER 1: Always-On (Startup)**
These should initialize automatically when VS Code opens:

1. **GitHub MCP** ✅ Already always-on
2. **Repomix MCP** (no init cost) → **Make always-on**
3. **Firebase** (zero prompts) → **Pre-initialize context**

**Implementation**:

```json
{
  "servers": {
    "github/github-mcp-server": {
      "type": "http",
      "autoConnect": true, // Always initialize
      "priority": 1
    },
    "repomix/repomix-mcp": {
      "type": "stdio",
      "autoConnect": true, // Always initialize (zero cost)
      "priority": 2
    },
    "firebase": {
      "type": "stdio",
      "autoConnect": true, // Pre-init context
      "priority": 3,
      "preInit": "firebase emulators:start" // If in dev mode
    }
  }
}
```

**Expected Startup Time**: <500ms for Tier 1 tools

---

### **TIER 2: On-Demand with Auto-Activation**
These activate when agent detects specific keywords:

1. **Chrome DevTools** → Activate only if user asks for screenshot/browser task

**Implementation**:

```json
{
  "servers": {
    "chromedevtools/chrome-devtools-mcp": {
      "type": "stdio",
      "autoConnect": false,
      "autoActivateOn": ["screenshot", "browser", "E2E", "automation"],
      "priority": 4
    }
  }
}
```

**Behavior**:

- Agent detects "screenshot" in request
- Auto-activates Chrome DevTools
- Prompts for settings if needed
- Remembers settings for session

---

### **TIER 3: Manual (Full Setup)**
These require explicit user action (leave as-is):

- Custom integrations
- Third-party services
- One-time setup tasks

---

## Tool Availability Matrix
| Tool         | Tier | Status        | Init Time | Prompts | Frequency | Priority |
| ------------ | ---- | ------------- | --------- | ------- | --------- | -------- |
| GitHub MCP   | 1    | ✅ Ready      | 0ms       | 0       | HIGH      | P0       |
| Repomix MCP  | 1    | ✅ Ready      | 100ms     | 0       | MEDIUM    | P1       |
| Firebase MCP | 1    | 🟡 Needs Init | 200ms     | 0       | HIGH      | P1       |
| Chrome Tools | 2    | 🟡 Ready      | 500ms     | 3       | LOW       | P3       |

---

## Implementation Plan
### **PHASE 1: Immediate (Today)**
**Task 1**: Update `.mcp.json` with Tier 1 configuration

```json
{
  "servers": {
    "github/github-mcp-server": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "gallery": "${env:GITHUB_MCP_GALLERY_URL}",
      "version": "0.13.0",
      "tier": "always-on",
      "priority": 1
    },
    "repomix/repomix-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["@repomix/mcp-server@latest"],
      "env": {},
      "cwd": "${workspaceFolder}",
      "tier": "always-on",
      "priority": 2
    },
    "firebase": {
      "type": "stdio",
      "command": "npx",
      "args": ["firebase@12.4.0"],
      "env": {},
      "cwd": "${workspaceFolder}",
      "tier": "always-on",
      "priority": 3
    },
    "chromedevtools/chrome-devtools-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["chrome-devtools-mcp@0.0.1-seed", "--channel", "stable"],
      "tier": "on-demand",
      "priority": 4,
      "note": "Activate only when browser automation needed"
    }
  }
}
```

**Effort**: 30 minutes (edit + test)

---

### **PHASE 2: Smart Agent Integration (This Week)**
Create an MCP availability manifest that agents can query:

**File**: `.mcp-manifest.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-12-16",
  "tiers": {
    "always-on": {
      "description": "Tools that are always available",
      "servers": ["github/github-mcp-server", "repomix/repomix-mcp", "firebase"],
      "readinessCheck": "All tools ready and initialized",
      "avgLatency": "100ms"
    },
    "on-demand": {
      "description": "Tools available with user input",
      "servers": ["chromedevtools/chrome-devtools-mcp"],
      "readinessCheck": "Available but requires prompts",
      "avgLatency": "500ms"
    }
  },
  "toolsByFrequency": {
    "critical": [
      "github:search_code",
      "github:list_pull_requests",
      "repomix:pack_codebase",
      "firebase:firestore_read"
    ],
    "common": ["github:get_issues", "repomix:grep_repomix_output", "firebase:deploy_rules"],
    "specialized": ["chrome:screenshot", "github:list_releases"]
  }
}
```

**Agent Instructions** (add to copilot-instructions.md):

```markdown
## MCP Tool Selection Strategy
When planning a task:

1. **Always-On Tools** (no wait):
   - GitHub MCP: Repository, PR, issue operations
   - Repomix MCP: Code analysis, patterns, external research
   - Firebase MCP: Database, auth, deployment

1. **On-Demand Tools** (user may be prompted):
   - Chrome DevTools: Browser automation, screenshots

1. **Selection Rules**:
   - Code analysis? → Use Repomix (70% token savings)
   - Repo operations? → Use GitHub MCP
   - Database work? → Use Firebase MCP
   - Browser testing? → Use Chrome DevTools
   - Everything else? → Use local tools (read_file, grep_search)
```

**Effort**: 2 hours (create manifest + write instructions)

---

### **PHASE 3: Advanced (Next Week)**
**Auto-Activation Engine**:

Create smart activation that:

- Detects task type from user request
- Pre-activates optimal tool combinations
- Caches tool state (warm starts)
- Monitors tool usage patterns
- Reports tool effectiveness metrics

**Script**: `scripts/mcp-activation-engine.mjs`

```typescript
// Pseudo-code
const MCPActivationEngine = {
  taskAnalysis: {
    "code analysis" → ["repomix"],
    "repo work" → ["github"],
    "database ops" → ["firebase"],
    "ci/cd work" → ["github", "firebase"],
    "e2e testing" → ["chrome"],
  },

  preActivate: async (task) => {
    const toolsNeeded = MCPActivationEngine.taskAnalysis[task.type];
    for (const tool of toolsNeeded) {
      await mcp.activate(tool);
    }
  },

  reportMetrics: {
    toolUsageByTask: {...},
    avgActivationTime: 0,
    mostUsedTools: ["github:search_code", "repomix:pack_codebase"],
  }
}
```

**Effort**: 4-6 hours (implementation + testing)

---

## Best Practices for Agent Tool Access
### **Rule 1: Explicit Tool Requests**
Agent should request specific tools when possible:

```
❌ WRONG: "Analyze this code"
          (agent guesses which tool)

✅ RIGHT: "Use Repomix to analyze API framework patterns"
          (clear intent, direct tool selection)
```

### **Rule 2: Tool Chaining**
Combine tools for better results:

```
User: "How does Next.js handle API routes?"

Agent:
  1. Use Repomix to pack next.js repo
  2. Grep for /api/ patterns
  3. Compare to our implementation
  4. Report differences
```

### **Rule 3: Caching Results**
Reuse packed outputs to save tokens:

```
First request: "Pack the types package"
  → mcp_repomix_pack_codebase → creates output

Second request: "Find all Zod schemas"
  → mcp_repomix_attach_packed_output (reuse)
  → mcp_repomix_grep_repomix_output (search)
  → 80% faster, 0 token overhead
```

### **Rule 4: Fallback Strategy**
If MCP tool unavailable, fall back gracefully:

```
Try MCP tool → If fails → Fall back to local tool

Example:
  Try: mcp_repomix_pack_codebase
  Fail: Server not responding
  Fall back: read_file + grep_search (local)
```

---

## Tool Redundancy Matrix
Some tasks have multiple tool options:

| Task             | Best Tool           | Fallback 1          | Fallback 2      |
| ---------------- | ------------------- | ------------------- | --------------- |
| Search code      | GitHub MCP          | Local grep\_search   | —               |
| Analyze patterns | Repomix MCP         | read\_file + grep    | —               |
| Create PR        | GitHub MCP          | Manual git          | —               |
| Deploy rules     | Firebase MCP        | Manual firebase CLI | —               |
| Read file safely | Repomix file\_system | read\_file           | —               |
| Repo research    | Repomix pack\_remote | GitHub MCP search   | Manual research |

---

## Success Metrics
**By end of PHASE 2, we should achieve**:

- ✅ 95%+ of tasks use always-on tools without prompts
- ✅ <100ms average tool activation time (Tier 1)
- ✅ <5 second full tool initialization (all tiers)
- ✅ 0 agent failures due to tool unavailability
- ✅ Clear agent visibility into available tools
- ✅ Automatic tool selection for 80% of tasks

**Measurement**:

```bash
# Add logging to .mcp.json activation
# Track metrics in scripts/mcp-metrics.json
pnpm report:mcp-metrics
```

---

## Summary: Always-On vs. On-Demand
**TIER 1 (Always-On, no waiting)**:

1. ✅ GitHub MCP — Repo/PR/issue operations
2. ✅ Repomix MCP — Code analysis (zero init cost)
3. ✅ Firebase MCP — Database operations

**TIER 2 (On-Demand, auto-activate on need)**:

1. 🟡 Chrome DevTools — Browser automation

**Key Strategy**:

- **Make Repomix always-on** (zero cost, high value)
- **Pre-init Firebase context** (eliminate prompts)
- **Keep Chrome tools on-demand** (complex setup)
- **Agent selects tools automatically** based on task type

**Implementation**:

1. Phase 1 (Today): Update .mcp.json with tier annotations
2. Phase 2 (This week): Create MCP manifest + agent instructions
3. Phase 3 (Next week): Build auto-activation engine

---

**Status**: Ready for Phase 1 implementation\
**Owner**: Development Team\
**Next Step**: Update `.mcp.json` with tier configuration\
**Estimated Time**: 30 minutes (Phase 1)
