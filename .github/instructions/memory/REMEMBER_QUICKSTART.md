# `/remember` Quick Start
**Unified memory system combining CPMEM metadata + searchable indexed lessons**

## One-Minute Overview
When you learn something:

```
/remember >domain #tag1 #tag2 what you learned and why it matters
```

✅ Lesson created in `memory/indexed/{domain}/{lesson-id}.md` ✅ Full CPMEM metadata captured ✅
Indexed for AI search via INDEX.md ✅ Tagged for cross-domain discovery

## Syntax Cheatsheet
### Basic (Global Scope)
```
/remember >git-workflow #automation use grep -v -E for patterns
```

Creates: `memory/indexed/git-workflow/use-grep-pattern-matching.md`

### Workspace-Specific
```
/remember >testing workspace #pattern #safety use setup/teardown functions
```

Creates: `.github/instructions/memory/indexed/testing/setup-teardown-functions.md`

### With Multiple Tags
```
/remember >typescript #gotcha #critical #types never use any without considering alternatives
```

### Minimal (Auto-Detects Domain)
```
/remember #debugging this technique helped find race conditions
```

AI infers domain and creates metadata automatically.

## Tag Reference
**Type Tags** (what kind of lesson):

- `#pattern` - Best practice / design pattern
- `#gotcha` - Common mistake to avoid
- `#best-practice` - Standard approach
- `#automation` - Script/tool/workflow
- `#trick` - Clever workaround
- `#warning` - Critical issue
- `#workflow` - Process improvement

**Domain Tags** (where it applies):

- `#typescript`, `#javascript`, `#git`, `#testing`, `#performance`, `#security`
- `#monorepo`, `#ci-cd`, `#docker`, `#firebase`, etc.

**Context Tags** (when/how to use):

- `#debugging` - For troubleshooting
- `#refactoring` - During code cleanup
- `#collaboration` - Team workflows
- `#migration` - Upgrades/changes
- `#subtle` - Easy to miss
- `#critical` - High impact

## Output Format
When you use `/remember`, the response shows:

```
[CPMEM]
type: pattern|gotcha|best-practice|...
domain: git-workflow
tags: ["automation", "pattern", "grep"]
priority: 2
classification: NON-TRIVIAL
## created: 2025-12-25

# Lesson: Use grep -v -E for Pattern Matching
**Location**: memory/indexed/git-workflow/grep-pattern-matching.md
**Tags**: #automation #pattern #grep
**Type**: Pattern | **Priority**: 2

**Problem Context**: Chaining multiple `grep -v` pipes becomes unreadable.

**Solution**: Use `grep -v -E 'pattern1|pattern2|pattern3'` for cleaner matching.

**Why**: More maintainable, easier to understand intent, reduces cognitive load.

**Example**:
  grep -v -E '^(node_modules|\.git)' files.txt

**Related**: Link to similar lessons in other domains.
[/CPMEM]
```

## Finding Lessons
All lessons indexed at: `.github/instructions/memory/indexed/INDEX.md`

The index shows:

- Lessons by domain
- Lessons by type (gotchas vs patterns vs best-practices)
- Lessons by tag (cross-domain discovery)
- Statistics (total, coverage, recency)

## Common Workflows
### After Debugging a Tricky Issue
```
/remember >domain #gotcha #debugging #subtle detailed lesson from session
```

### Establishing a New Best Practice
```
/remember >domain #best-practice #pattern clear guidance and examples
```

### Creating Automation
```
/remember >domain #automation #workflow step-by-step for script/tool
```

### Critical Learning
```
/remember >domain #critical #warning what could break and how to prevent
```

## File Organization
```
.github/instructions/memory/indexed/
├── INDEX.md                      ← Master searchable index
├── typescript/
│   ├── nullable-vs-optional.md
│   ├── generic-constraints.md
│   └── ...
├── git-workflow/
│   ├── grep-pattern-matching.md
│   ├── pre-commit-hooks.md
│   └── ...
├── testing/
│   ├── setup-teardown.md
│   └── ...
└── ...
```

Global memories use same structure under: `~/.config/Code/User/prompts/memory/indexed/`

## Next Steps
1. **Use `/remember`** to capture today's learnings
2. **Check INDEX.md** to see what's already documented
3. **Link related lessons** when creating new ones
4. **Review periodically** - memories grow smarter over time

---

**Enhanced from original `/remember` prompt** combining CPMEM metadata + indexed, searchable
architecture for institutional memory.
