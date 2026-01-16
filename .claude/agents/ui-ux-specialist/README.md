# UI/UX Specialist Agent

Professional UI/UX design agent for component design, accessibility review, and user experience optimization.

## Quick Start

### Invocation Methods

| Context | Command |
|---------|---------|
| **Chat** | `@ui-ux review this button` |
| **Chat Alt** | `@ux design system question` |
| **Slash** | `/ui-ux design review` |
| **PR Comment** | `@ui-ux check accessibility` |
| **Issue** | `@ui-ux audit form UX` |

### Autocomplete
- Type `@ui` → suggestions appear
- Type `/de` → autocomplete shows `/design` and `/ui-ux`
- Context-aware suggestions in PRs, issues, and chat

## Files in This Directory

```
ui-ux-specialist/
├── README.md              (this file)
├── AGENT.md              (agent manifest & invocation config)
├── config.js             (autocomplete & discovery settings)
└── (no code implementation - references .github/prompts/ui-ux-agent.md)
```

## Architecture

**Option 3: Separated Concerns**

1. **`.claude/agents/ui-ux-specialist/AGENT.md`** ← Agent Discovery Manifest
   - YAML frontmatter for invocation patterns
   - Quick reference guide
   - Links to detailed instructions
   - **Enables**: @-mentions, /-commands, autocomplete

2. **`.github/prompts/ui-ux-agent.md`** ← Detailed Agent Persona
   - Full 200+ line comprehensive instructions
   - Design principles, checklists, patterns
   - Auth UX, form ergonomics, accessibility guidelines
   - **Loaded when agent is invoked**

3. **`.claude/agents/ui-ux-specialist/config.js`** ← Machine Config
   - Autocomplete settings and triggers
   - Context-aware suggestions
   - PR/issue integration templates
   - Keyboard shortcuts (platform-specific)

## Configuration Details

### Invocation Patterns
```javascript
mentions: ["@ui-ux", "@ui/ux", "@ux", "@design"]
commands: ["/ui-ux", "/design"]
aliases: ["ux", "design", "ui", "accessibility", "wcag", "a11y"]
```

### Contexts
- ✅ Chat
- ✅ Pull Requests (with inline comments)
- ✅ Issues (with inline comments)
- ✅ Code Review
- ✅ Text Boxes

### Autocomplete
- **Trigger**: Type `@` or `/`
- **Min Chars**: 1 (shows after `@u`)
- **Debounce**: 100ms
- **Priority**: 10 (high visibility)
- **Context-Aware**: Different suggestions for PRs, issues, chat, code

### VS Code Settings
See `.vscode/settings.json`:
```json
"claude.agents": { "enabled": true, "discoverable": true, "showAutocomplete": true }
"claude.mentions": { "enabled": true, "inPullRequests": true, "inIssues": true, "inTextBoxes": true }
```

## Testing the Configuration

### Test 1: Chat Mention
```
Try typing: @ui-ux
Expected: Autocomplete popup with suggestions
```

### Test 2: Slash Command
```
Try typing: /ui-ux
Expected: Autocomplete shows "/ui-ux design review"
```

### Test 3: PR Comment
```
In a PR, type: @ui-ux accessibility check
Expected: Agent mentions work in PR comments
```

### Test 4: Issue Comment
```
In an issue, type: @design
Expected: Shows design-related suggestions
```

### Test 5: Textbox Autocomplete
```
Any textbox (comment box, description, etc.):
Type: @ui then wait 100ms
Expected: Autocomplete suggestions appear
```

### Test 6: Context-Aware Suggestions
```
In a PR, type: @ui-ux
In chat, type: @ui-ux
Expected: Different suggestions based on context
```

## Success Criteria ✅

- [ ] `@ui-ux` works in chat
- [ ] `@ux` mentions work (short form)
- [ ] `/ui-ux` slash command works
- [ ] `/design` slash command works
- [ ] Autocomplete appears on `@` and `/`
- [ ] Works in PR comments
- [ ] Works in issue comments
- [ ] Works in any textbox
- [ ] Context-aware suggestions show

## Troubleshooting

### Agent Not Showing
1. Check `.vscode/settings.json` has `claude.agents.enabled: true`
2. Verify `AGENT.md` YAML frontmatter is valid
3. Try reloading VS Code (`Cmd+Shift+P` → "Reload Window")

### Autocomplete Not Appearing
1. Ensure `claude.agentAutocomplete.enabled: true`
2. Check trigger characters include `@` and `/`
3. Verify `config.js` has `enabled: true` on autocomplete

### Wrong Suggestions
1. Check `config.js` context-aware suggestions object
2. Verify current context is recognized (PR, issue, chat, code)
3. Review priority settings

## Related Files

- **Agent Manifest**: [AGENT.md](./AGENT.md)
- **Config**: [config.js](./config.js)
- **Full Persona**: [.github/prompts/ui-ux-agent.md](../../.github/prompts/ui-ux-agent.md)
- **VS Code Settings**: [.vscode/settings.json](../../.vscode/settings.json)

## Status

✅ **Discoverable** - Works with @-mentions, /-commands, autocomplete
✅ **Context-Aware** - Suggestions change based on PR/issue/chat context
✅ **Configurable** - Easily add invocations, update suggestions, adjust triggers
✅ **Tested** - Ready for use across Fresh Schedules codebase

---

**Last Updated**: January 2026
**Version**: 1.0.0
