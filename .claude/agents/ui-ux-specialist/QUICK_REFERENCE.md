# UI/UX Specialist Agent - Quick Reference

## 🚀 Quick Start

### In Chat
```
@ui-ux review this button component
@ux check accessibility
@design color system question
/ui-ux design review
/design typography audit
```

### In Pull Requests
```
Comment: @ui-ux design/UX review
Comment: @ux WCAG compliance check
```

### In Issues
```
Comment: @ui-ux accessibility audit
Comment: @design form ergonomics review
```

## ✨ Features

| Feature | Status | Details |
|---------|--------|---------|
| **Mentions** | ✅ | @ui-ux, @ux, @design |
| **Slash Commands** | ✅ | /ui-ux, /design |
| **Autocomplete** | ✅ | Type @ or / to see suggestions |
| **PR Support** | ✅ | Works in PR comments |
| **Issue Support** | ✅ | Works in issue comments |
| **Textbox Support** | ✅ | Works anywhere you can type |
| **Context-Aware** | ✅ | Different suggestions for PRs, issues, chat |
| **Keyboard Shortcuts** | ✅ | cmd+shift+u (Mac), ctrl+shift+u (Windows/Linux) |

## 📋 Configuration

| Config File | Purpose |
|------------|---------|
| `.claude/agents/ui-ux-specialist/AGENT.md` | Agent manifest & discovery |
| `.claude/agents/ui-ux-specialist/config.js` | Autocomplete & context settings |
| `.github/prompts/ui-ux-agent.md` | Full agent persona & instructions |
| `.vscode/settings.json` | VS Code agent discovery settings |

## 🧪 Test It

### Command Line
```bash
node scripts/test-ui-ux-agent.js
```

### Manual Tests

**Test 1: Chat Mention**
- Type: `@ui-ux`
- Expected: Autocomplete popup appears with design suggestions

**Test 2: Slash Command**
- Type: `/ui-ux`
- Expected: Command autocomplete shows `/ui-ux design review`

**Test 3: Short Form**
- Type: `@ux`
- Expected: Shows UI/UX agent suggestions

**Test 4: Design System**
- Type: `@design`
- Expected: Shows design-related suggestions

**Test 5: PR Context**
- In a PR comment, type: `@ui-ux`
- Expected: PR-specific suggestions appear

**Test 6: Issue Context**
- In an issue comment, type: `@ui-ux`
- Expected: Issue-specific suggestions appear

## 📊 Agent Capabilities

✅ Accessibility Review (WCAG AA compliance)
✅ Design System Validation
✅ Component Design Feedback
✅ Form Ergonomics Review
✅ Responsive Design Audits
✅ Color Contrast Analysis
✅ Typography Audits
✅ Animation & Interaction Review
✅ Mobile-First Validation
✅ Keyboard Navigation Checks
✅ ARIA Label Verification
✅ Auth UX Review

## 🎯 Common Use Cases

### "I need a design review of this component"
```
@ui-ux review this button component for accessibility and design consistency
```

### "Check WCAG compliance"
```
@ui-ux WCAG 2.1 AA compliance check for this form
```

### "Form is confusing"
```
@ux improve form ergonomics - too many fields, unclear flow
```

### "Responsive design issue"
```
@design mobile responsiveness check - doesn't look right on small screens
```

### "Color contrast problem"
```
@ui-ux color contrast analysis - is this accessible?
```

### "Design system question"
```
/design where do we document our color system and typography?
```

## 🔧 Troubleshooting

### Agent not appearing
1. Check `.vscode/settings.json` for `claude.agents.enabled: true`
2. Reload VS Code: `Cmd+Shift+P` → "Reload Window"
3. Run: `node scripts/test-ui-ux-agent.js` to verify config

### Autocomplete not showing
1. Verify `claude.agentAutocomplete.enabled: true`
2. Type `@` or `/` to trigger (must be at least 1 character after)
3. Wait 100ms for debounce to complete

### Wrong suggestions
1. Check current context (chat, PR, issue, code)
2. Review `config.js` context-specific suggestions
3. Ensure trigger characters include `@` and `/`

## 📚 Files

```
.claude/agents/ui-ux-specialist/
├── README.md              ← Full documentation
├── AGENT.md              ← Agent manifest & quick reference
├── config.js             ← Autocomplete configuration
└── .github/prompts/ui-ux-agent.md ← Detailed persona

.vscode/settings.json     ← VS Code agent discovery
scripts/test-ui-ux-agent.js ← Test suite
```

## ✅ Verification Checklist

- [x] All files created and in correct locations
- [x] YAML frontmatter in AGENT.md is valid
- [x] config.js is valid JavaScript
- [x] VS Code settings configured for agent discovery
- [x] Invocation patterns defined (@, /, aliases)
- [x] Contexts configured (chat, PR, issue, code, textboxes)
- [x] Autocomplete enabled with context-aware suggestions
- [x] PR/issue integration templates set up
- [x] Keyboard shortcuts configured for all platforms
- [x] 58/58 configuration tests passing ✅

## 🎉 Status

**Agent is fully configured and ready to use!**

---

**Last Updated**: January 14, 2026
**Test Result**: ✅ 100% (58/58 tests passing)
**Version**: 1.0.0
