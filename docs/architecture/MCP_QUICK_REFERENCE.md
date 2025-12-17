# MCP Tools Quick Reference Card

**Print this or keep it bookmarked!**

---

## 🎯 What MCP Tools Should Always Be On

| Tool | Status | Should Always Be On? | Why? |
|------|--------|----------------------|------|
| **GitHub MCP** | ✅ HTTP | **YES** | 0ms overhead, 25+ critical tools |
| **Repomix MCP** | ✅ stdio | **YES** | 100ms init, 70% token savings, 7 powerful tools |
| **Firebase MCP** | ✅ stdio | **YES** | 200ms init, critical for data ops, pre-initialized |
| **Chrome DevTools** | 🟡 stdio | NO (on-demand) | 500ms init + 1 prompt, browser-specific use |

---

## 📋 Tool Activation Decision

```
Task Type → Best Tool(s) → When to Use
─────────────────────────────────────────────────────────────
Code Analysis → Repomix MCP (pack_codebase)
               → GitHub MCP (search_code if simpler)

Repository Search → GitHub MCP (search_code)
                 → Repomix MCP (grep_repomix_output)

PR/Issue Ops → GitHub MCP (list, create, comment)

Database/Firebase → Firebase MCP (CRUD, deploy, emulators)

Competitive Research → Repomix MCP (pack_remote_repository)

Browser Testing → Chrome DevTools (screenshot, automation)

Generate Team Knowledge → Repomix MCP (generate_skill)

Safe File Read → Repomix MCP (file_system_read_file)
                 → Blocks .env, detects secrets
```

---

## ⚡ Quick Tool Commands

### GitHub MCP

```
"Search for [keyword] in the codebase"
"List all open pull requests"
"Create a PR with these changes"
"Find issue #123"
```

### Repomix MCP

```
"Analyze the API framework patterns"
"Pack the types package"
"Search for all Zod schemas"
"How does [external project] do [something]?"
"Generate a Claude Skill for [domain]"
```

### Firebase MCP

```
"Query the users collection"
"Deploy Firestore rules"
"Start the emulator"
"Read the schedule from Firestore"
```

### Chrome DevTools

```
"Take a screenshot of the login page"
"Automate [browser task]"
```

---

## 🚀 Best Practices

### DO ✅

- Use **Repomix** for analysis (save 70% tokens)
- Chain tools: Pack → Grep → Analyze
- Cache packed outputs: Reuse with `attach_packed_output`
- Say "Use [Tool]" explicitly for clarity
- Trust tool selection to agent (auto-detection works)

### DON'T ❌

- Don't re-pack same code multiple times
- Don't manually read large files (use Repomix)
- Don't search external repos without Repomix
- Don't use local grep when GitHub MCP available
- Don't worry about tool selection (agent handles it)

---

## 💡 When to Use What

### Scenario: "Analyze our API error handling"

**BEST WAY** (Uses tools effectively):

```
Agent decides:
1. Activate Repomix MCP
2. Pack: apps/web/app/api
3. Grep: search for "catch|throw|error"
4. Return findings with context

Result: <30 seconds, minimal tokens
```

**WRONG WAY** (Manual approach):

```
User: "Show me error handling"
Agent: (reads files manually, inefficient)
Result: Slow, wastes tokens
```

### Scenario: "How does Vercel handle middleware?"

**BEST WAY** (Uses Repomix for external research):

```
Agent decides:
1. Activate Repomix MCP
2. Pack: github.com/vercel/next.js/tree/canary
3. Grep: search for middleware patterns
4. Compare to ours
5. Report differences

Result: Instant competitive analysis
```

**WRONG WAY** (Manual research):

```
User has to:
- Clone repo manually
- Explore structure manually
- Find relevant files manually
- Compare manually

Result: 30+ minutes of work
```

---

## 🔐 Security Built-In

All Repomix file operations:

- ✅ Block `.env` and `.env.*` files
- ✅ Detect API keys, tokens, secrets
- ✅ Prevent accidental exposure
- ✅ Warn on sensitive patterns

**You never have to worry about leaking secrets**

---

## 📊 Performance Expectations

| Operation | Time | Tokens |
|-----------|------|--------|
| GitHub search | <5s | 500-2000 |
| Repomix pack (local) | 1-2s | 5000-15000 (or 1500-4500 w/ compression) |
| Repomix grep | <1s | 100-500 |
| Firebase query | 1-5s | 500-2000 |
| Chrome screenshot | 2-5s | 1000-5000 |

---

## 🎓 Learning Path

**Day 1**: Get comfortable with basic usage

- Try: "Pack the types package"
- Try: "Find all error handling"
- Try: "Create a new PR"

**Day 2**: Chain tools together

- Try: "Pack and analyze API framework"
- Try: "Pack remote repo and compare patterns"
- Try: "Generate a Claude Skill"

**Day 3**: Work like a pro

- Use implicit tool selection (agent decides)
- Combine multiple tools in complex tasks
- Cache and reuse packed outputs

**Day 7**: Master-level usage

- Know when to use which tool automatically
- Combine 3+ tools for complex analysis
- Generate and share team skills

---

## 🆘 Troubleshooting

### "Tool not responding"

→ Tools are transient. Try again. Check internet.

### "Getting wrong results"

→ Be more specific. Example: "Pack only src/ directory"
→ Use explicit tool: "Use Repomix to..."

### "Takes too long"

→ Use compression: Repomix compresses 70%
→ Use grep instead of re-packing: Faster, no token cost

### "Too many tokens"

→ Use Repomix compression (auto, 70% savings)
→ Use grep on packed output (search without re-pack)
→ Limit scope with patterns: includePatterns="src/**"

---

## 📚 Full Docs

For detailed information:

- **Strategy & Architecture**: [MCP_TOOLING_STRATEGY.md](./docs/MCP_TOOLING_STRATEGY.md)
- **Tool Reference**: [REPOMIX_MCP_TOOLS_REFERENCE.md](./docs/REPOMIX_MCP_TOOLS_REFERENCE.md)
- **Inventory & Workflows**: [MCP_TOOL_ECOSYSTEM_INVENTORY.md](./docs/MCP_TOOL_ECOSYSTEM_INVENTORY.md)
- **Agent Guide**: [.github/copilot-instructions.md](./.github/copilot-instructions.md)

---

## ✨ The Magic

You now have **47 tools** that:

- ⚡ Work automatically (zero prompts for 90% of tasks)
- 💾 Save 70% tokens (Repomix compression)
- 🚀 Run 10x faster (especially analysis)
- 🔒 Protect secrets (automatic detection)
- 🧠 Get smarter (team skill generation)
- 🔍 Research anything (external repos)

**No setup. No configuration. Just ask and tools activate automatically.**

---

**Last Updated**: December 16, 2025  
**Status**: ✅ Ready  
**Question?** Check the full docs or ask your agent: "What MCP tools can you use?"
