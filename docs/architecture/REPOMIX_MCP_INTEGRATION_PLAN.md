---
title: "Repomix MCP Integration Plan"
description: "Implementation plan for Repomix Model Context Protocol integration and tool setup"
keywords:
  - repomix
  - mcp
  - integration
  - plan
  - implementation
category: "architecture"
status: "active"
audience:
  - developers
  - architects
related-docs:
  - MCP_TOOLING_STRATEGY.md
  - REPOMIX_MCP_TOOLS_REFERENCE.md
---

# Repomix MCP Integration Plan

**Status**: 🔴 **NOT IMPLEMENTED**\
**Priority**: P1 (High Value, Low Effort)\
**Estimated Effort**: 2-3 hours\
**ROI**: High (unlocks 30% untapped potential)

---

## Current State Assessment

### ✅ What We Have

- Repomix as npm package (`repomix@1.10.0`)
- CLI usage via `pnpm repomix`
- CI/CD automation (`.github/workflows/repomix-ci.yml`)
- Programmatic usage examples
- 95% effectiveness on existing features

### ❌ What We're Missing

- **Repomix MCP Server** not configured in `.mcp.json`
- **AI Agent Tools** not accessible (`mcp_repomix_*`)
- **Claude Agent Skills** generation not automated
- **Smart search** within packed outputs unused
- **Real-time codebase analysis** unavailable to AI

---

## Gap Analysis: Repomix MCP Tools

### Category 1: Code Analysis (5 Tools) ❌ UNUSED

| Tool                                 | Purpose                    | Current Usage      | Missed Opportunity                          |
| ------------------------------------ | -------------------------- | ------------------ | ------------------------------------------- |
| `mcp_repomix_pack_codebase`          | Package local dirs for AI  | ❌ Manual CLI only | Real-time AI analysis during chat           |
| `mcp_repomix_pack_remote_repository` | Analyze external repos     | ❌ Not available   | Compare with competitors, research patterns |
| `mcp_repomix_attach_packed_output`   | Load existing packed files | ❌ Not available   | Iterative analysis without re-packing       |
| `mcp_repomix_grep_repomix_output`    | Search within outputs      | ❌ Not available   | Fast lookup without full re-read            |
| `mcp_repomix_generate_skill`         | Create Claude Skills       | ❌ Not available   | Auto-generate team-shared skills            |

### Category 2: File System (2 Tools) ❌ UNUSED

| Tool                                     | Purpose                       | Current Usage                | Missed Opportunity                |
| ---------------------------------------- | ----------------------------- | ---------------------------- | --------------------------------- |
| `mcp_repomix_file_system_read_directory` | List dirs with security       | ❌ Using `list_dir` instead  | Built-in sensitive file detection |
| `mcp_repomix_file_system_read_file`      | Read with security validation | ❌ Using `read_file` instead | Auto-detect secrets/API keys      |

### Impact Assessment

**Without Repomix MCP**:

- AI agents use generic `read_file` + `list_dir` (no security validation)
- No real-time codebase packing during conversation
- Cannot analyze external GitHub repos on-demand
- Cannot generate Claude Agent Skills automatically
- No grep functionality within packed outputs

**With Repomix MCP**:

- AI agents get security-validated file access
- Real-time analysis: "Pack the API framework and analyze its patterns"
- Research competitors: "Analyze github.com/competitor/repo and compare patterns"
- Auto-generate skills: "Create a skill for the SDK factory pattern"
- Fast search: "Find all error handling in the packed output"

---

## Implementation Plan

### Phase 1: Add Repomix MCP Server (30 min)

**Step 1: Update `.mcp.json`**

Add Repomix MCP server configuration:

```json
{
  "servers": {
    "github/github-mcp-server": { ... },
    "chromedevtools/chrome-devtools-mcp": { ... },
    "firebase": { ... },

    "repomix/repomix-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "@repomix/mcp-server@latest"
      ],
      "env": {},
      "cwd": "${workspaceFolder}",
      "description": "Repomix MCP Server for code analysis and packaging"
    }
  }
}
```

**Step 2: Install Repomix MCP Server**

```bash
# Add to devDependencies
pnpm add -D @repomix/mcp-server@latest

# OR use npx (no install needed)
# The npx approach auto-updates
```

**Step 3: Test MCP Connection**

```bash
# Restart GitHub Copilot
# In chat: "List available Repomix MCP tools"
# Should see: mcp_repomix_pack_codebase, mcp_repomix_grep_repomix_output, etc.
```

### Phase 2: Update Documentation (30 min)

**Files to Update**:

1. `.github/copilot-instructions.md` - Add Repomix MCP tools section
2. `docs/architecture/AI_AGENT_GUIDE.md` - Document MCP usage
3. `.github/instructions/INDEX.md` - Reference MCP tools
4. `FUTURE_PROOF_SYSTEM_DESIGN.md` - Add MCP evolution strategy

**Template Addition**:

```markdown
### Repomix MCP Tools

When analyzing code structure or external repositories:

- **Pack codebase**: `mcp_repomix_pack_codebase`
  - Package a local directory for AI analysis
  - Supports XML, Markdown, JSON, Plain text formats
  - Optional Tree-sitter compression (70% token reduction)

- **Analyze external repo**: `mcp_repomix_pack_remote_repository`
  - Clone and analyze any GitHub repo
  - Security scanning included
  - Useful for competitor analysis, pattern research

- **Search packed output**: `mcp_repomix_grep_repomix_output`
  - Grep-like search within packed outputs
  - JavaScript RegExp support
  - Context lines (before/after matches)

- **Generate skills**: `mcp_repomix_generate_skill`
  - Create Claude Agent Skills from codebases
  - Team-shared in `.claude/skills/`
  - Auto-generated SKILL.md + references/

**Example Usage**:
```

User: "Analyze the API framework patterns" Agent: \[Calls mcp_repomix_pack_codebase on
packages/api-framework] Agent: \[Analyzes packed output, identifies patterns] Agent: "Found 3 core
patterns: middleware pipeline, Zod validation, role-based auth"

```

```

### Phase 3: Create Usage Examples (1 hour)

**File**: `scripts/examples/repomix-mcp-usage.mjs`

```javascript
# !/usr/bin/env node
/**
 * Repomix MCP Usage Examples
 *
 * Demonstrates how AI agents can use Repomix MCP tools
 * for real-time code analysis during conversation
 */

// Example 1: Pack API Framework
console.log("Example 1: Pack API Framework for Analysis");
console.log("AI Agent would call:");
console.log("  mcp_repomix_pack_codebase({");
console.log('    directory: "packages/api-framework",');
console.log('    style: "markdown",');
console.log("    compress: true");
console.log("  })");

// Example 2: Analyze External Repo
console.log("\nExample 2: Analyze Competitor Patterns");
console.log("AI Agent would call:");
console.log("  mcp_repomix_pack_remote_repository({");
console.log('    repository: "https://github.com/competitor/repo",');
console.log('    style: "json"');
console.log("  })");

// Example 3: Generate Skill
console.log("\nExample 3: Auto-Generate Claude Skill");
console.log("AI Agent would call:");
console.log("  mcp_repomix_generate_skill({");
console.log('    directory: "packages/api-framework",');
console.log('    skillName: "sdk-factory-pattern",');
console.log("    compress: true");
console.log("  })");
console.log("Result: .claude/skills/sdk-factory-pattern/ created");
```

### Phase 4: Integration Testing (30 min)

**Test Scenarios**:

1. **Test 1: Pack Local Codebase**

   ```
   User: "Pack the types package and show me all Zod schemas"
   Expected: Agent calls mcp_repomix_pack_codebase, then greps for "z.object"
   ```

1. **Test 2: Analyze External Repo**

   ```
   User: "How does Next.js handle API routes? Analyze their repo"
   Expected: Agent calls mcp_repomix_pack_remote_repository on vercel/next.js
   ```

1. **Test 3: Generate Skill**

   ```
   User: "Create a Claude Skill for our SDK factory pattern"
   Expected: Agent calls mcp_repomix_generate_skill on packages/api-framework
   ```

1. **Test 4: Security Validation**

   ```
   User: "Read .env file"
   Expected: mcp_repomix_file_system_read_file detects secrets, blocks or warns
   ```

---

## Benefits of Full Repomix MCP Integration

### 1. **Real-Time Code Analysis** (Game Changer)

**Before**:

```
User: "Analyze our API patterns"
Agent: "I'll read the files..." [calls read_file 20+ times]
Agent: [Token limit hit, incomplete analysis]
```

**After**:

```
User: "Analyze our API patterns"
Agent: [Calls mcp_repomix_pack_codebase with compression]
Agent: [Gets compressed, structured output in 1 call]
Agent: "Found 3 patterns: middleware pipeline, Zod validation, RBAC..."
```

**Impact**: 10x faster analysis, 70% fewer tokens

### 2. **Competitor Research** (Strategic Advantage)

**Before**:

```
User: "How does competitor X handle auth?"
Agent: "I can't access external repos"
```

**After**:

```
User: "How does Next.js handle auth? Compare to ours"
Agent: [Calls mcp_repomix_pack_remote_repository on vercel/next.js]
Agent: [Compares patterns]
Agent: "Next.js uses middleware chains similar to our SDK factory..."
```

**Impact**: Research external patterns without manual cloning

### 3. **Auto-Generated Skills** (Team Scalability)

**Before**:

```
User: "Document the SDK factory pattern for the team"
Agent: "I'll create a markdown doc..." [writes manually]
```

**After**:

```
User: "Generate a Claude Skill for SDK factory"
Agent: [Calls mcp_repomix_generate_skill]
Agent: "Created .claude/skills/sdk-factory-pattern/"
Agent: "Team can now use '@sdk-factory' in their prompts"
```

**Impact**: Team-shared, versioned knowledge

### 4. **Security by Default** (Risk Reduction)

**Before**:

```
Agent: [Calls read_file(".env")]
Agent: [Reads secrets, potentially leaks in response]
```

**After**:

```
Agent: [Calls mcp_repomix_file_system_read_file(".env")]
MCP: [Detects sensitive data]
MCP: [Blocks or warns: "File contains API keys"]
Agent: "Cannot read .env - contains secrets"
```

**Impact**: Built-in secret detection

### 5. **Fast Search Within Packed Outputs** (Efficiency)

**Before**:

```
User: "Find all error handling in API routes"
Agent: [Re-packs entire codebase]
Agent: [Searches through 50k tokens]
```

**After**:

```
User: "Find all error handling in the packed output"
Agent: [Calls mcp_repomix_grep_repomix_output]
Agent: [Returns only matching sections with context]
```

**Impact**: No re-packing, instant results

---

## Success Metrics

### Immediate (Week 1)

- ✅ MCP server configured in `.mcp.json`
- ✅ All 7 Repomix MCP tools accessible
- ✅ Documentation updated
- ✅ Example scripts created

### Short-Term (Month 1)

- ✅ 10+ AI conversations using Repomix MCP tools
- ✅ 3+ Claude Skills auto-generated
- ✅ 1+ external repo analysis completed
- ✅ Security validation preventing secret leaks

### Long-Term (Quarter 1)

- ✅ Team adoption: 80%+ engineers know about MCP tools
- ✅ Skill library: 10+ team-shared skills in `.claude/skills/`
- ✅ Competitor research: Regular pattern analysis
- ✅ Zero secret leaks via file read tools

---

## Risk Assessment

### Low Risk

- MCP server is isolated (stdio, not network)
- No production dependencies (devDependency only)
- Can disable anytime by removing from `.mcp.json`
- Falls back gracefully if MCP unavailable

### Mitigation

- Test in dev environment first
- Document rollback procedure
- Add to `.mcp.json.example` for opt-in
- Include in onboarding docs

---

## Next Steps

1. **Immediate** (Today):
   - \[ ] Update `.mcp.json` with Repomix MCP server config
   - \[ ] Test MCP connection in Copilot chat
   - \[ ] Document available tools in copilot-instructions.md

1. **This Week**:
   - \[ ] Create usage examples (`scripts/examples/repomix-mcp-usage.mjs`)
   - \[ ] Update AI_AGENT_GUIDE.md with MCP section
   - \[ ] Test all 7 MCP tools

1. **This Month**:
   - \[ ] Generate first Claude Skill (SDK factory pattern)
   - \[ ] Analyze 1 external repo (Next.js or similar)
   - \[ ] Share MCP tools guide with team
   - \[ ] Add to onboarding checklist

---

## Related Documents

- [Repomix Effectiveness Assessment](../archive/repomix/REPOMIX_EFFECTIVENESS_FINAL_ASSESSMENT.md) -
  Current 95% implementation
- [FUTURE_PROOF_SYSTEM_DESIGN.md](./FUTURE_PROOF_SYSTEM_DESIGN.md) - Long-term strategy
- [AI_AGENT_GUIDE.md](./AI_AGENT_GUIDE.md) - Agent onboarding
- `.mcp.json` - MCP server configuration

---

**Status**: 📋 **Ready for Implementation**\
**Owner**: Architecture Team\
**Timeline**: 2-3 hours total effort\
**Next Review**: After Phase 1 complete

_"We've built 70% of the capability. Let's unlock the other 30%."_
