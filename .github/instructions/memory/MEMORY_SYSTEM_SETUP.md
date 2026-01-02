# Memory System: CPMEM + Indexed Integration

**Complete workflow for unified lesson capture, CPMEM metadata, and AI-discoverable memory.**

## What You've Set Up

### 1. **Enhanced `/remember` Prompt**

- **File**:
  [.github/prompts/remember-enhanced.prompt.md](.github/prompts/remember-enhanced.prompt.md)
- **Purpose**: Transforms lessons into CPMEM-enriched memory files with rich metadata
- **Syntax**: `/remember [>domain [scope]] [#tags] lesson content`

### 2. **Indexed Folder Structure**

- **Location**: `.github/instructions/memory/indexed/{domain}/`
- **File pattern**: `memory/indexed/{domain}/{lesson-id}.md`
- **Each file includes**:
  - CPMEM metadata frontmatter
  - Type/priority/tags for AI search
  - Structured lesson content (Problem → Solution → Why → Example)
  - Cross-domain linking

### 3. **Master Index**

- **File**:
  [.github/instructions/memory/indexed/INDEX.md](.github/instructions/memory/indexed/INDEX.md)
- **Purpose**: Searchable registry of all lessons
- **Shows**:
  - Lessons by domain
  - Lessons by type (pattern/gotcha/best-practice/automation/warning)
  - Lessons by tag
  - Statistics and coverage
- **Auto-updated** when you use `/remember`

### 4. **Quick Start Guide**

- **File**:
  [.github/instructions/memory/REMEMBER_QUICKSTART.md](.github/instructions/memory/REMEMBER_QUICKSTART.md)
- **For**: Quick syntax reference, examples, workflows
- **Share this** with teammates

## How It Works

### Creating a Memory

```bash
/remember >git-workflow #automation #pattern use grep -v -E for cleaner regex patterns
```

**What happens**:

1. ✅ AI parses: domain=`git-workflow`, tags=`[automation, pattern]`, scope=`global` (default)
2. ✅ Analyzes lesson and generates: type=`pattern`, priority=`2`, CPMEM classification
3. ✅ Creates lesson-id: `use-grep-pattern-matching`
4. ✅ Writes full file to: `memory/indexed/git-workflow/use-grep-pattern-matching.md`
5. ✅ **Includes frontmatter**:

   ```yaml
   ---
   type: pattern
   domain: git-workflow
   tags: ["automation", "pattern", "grep"]
   priority: 2
   classification: NON-TRIVIAL
   created: 2025-12-25
   applyTo: [".husky/**", "scripts/**"]
   relatedDomains: ["code-quality", "automation"]
   ---
   ```

6. ✅ Updates INDEX.md with new entry
7. ✅ **Response formatted as**: CPMEM header + lesson content + tags + file path

### AI Searching Memories

When building prompts or solving problems, AI can:

- Search INDEX.md by domain: Find all git-workflow lessons
- Search INDEX.md by type: Find all gotchas (mistakes to avoid)
- Search INDEX.md by tag: Find #automation lessons across all domains
- Read relevant `.md` files with full context and cross-links
- Recommend related lessons based on metadata

### Workspace vs Global

**Global** (default): `~/.config/Code/User/prompts/memory/indexed/`

- Applies to ALL projects
- Use for: general learnings, cross-project patterns

**Workspace**: `.github/instructions/memory/indexed/` ← Current location

- Applies only to this project
- Use for: Fresh-Schedules-specific patterns, optimizations, architecture decisions

```bash
/remember >testing global #pattern use factory functions for test fixtures
/remember >testing workspace #pattern use firebase emulator setup before each test
```

## CPMEM Integration

Every memory file captures CPMEM metadata:

```yaml
---
description: "Domain responsibility"
tags: ["type-tag", "domain-tag", "context-tag"]
type: "pattern|gotcha|best-practice|automation|workflow|trick|warning"
priority: 1-3 # 1=critical, 2=important, 3=nice-to-know
classification: "TRIVIAL|NON-TRIVIAL" # From CPMEM
relatedDomains: ["domain1", "domain2"]
relatedLessons: ["lesson-id1", "lesson-id2"]
keywords: ["word1", "word2"]
---
```

**Benefits**:

- ✅ Rich metadata for AI search and correlation
- ✅ Type/priority makes impact clear
- ✅ Cross-domain links prevent silos
- ✅ Keywords enable discovery
- ✅ CPMEM classification tracks rigor level

## Example: Complete Workflow

### Day 1: Learn a lesson

```
/remember >typescript workspace #gotcha #subtle check strict null checks - undefined optional is not nullable
```

Created: `memory/indexed/typescript/undefined-vs-nullable.md`

- Type: gotcha
- Priority: 2 (important)
- Tags: gotcha, subtle, typescript
- Classification: NON-TRIVIAL
- INDEX updated automatically

### Day 2: Related lesson

```
/remember >typescript workspace #pattern #best-practice use optional chaining ?. with type guards for safe access
```

Created: `memory/indexed/typescript/optional-chaining-pattern.md`

- Links to: `undefined-vs-nullable` (in relatedLessons)
- Complements: the gotcha with solution pattern

### Day 3: Cross-domain learning

```
/remember >testing workspace #pattern #typescript use generics for type-safe test fixtures
```

Created: `memory/indexed/testing/generic-test-fixtures.md`

- Tags: typescript, testing, pattern (connects both domains)
- INDEX groups by both domains

### Week 1: Review & Share

```
Check: .github/instructions/memory/indexed/INDEX.md
- Shows 3 typescript lessons
- Shows 1 testing lesson with typescript tag
- Suggests what else to document
```

## Directory Structure

```
.github/
├── instructions/
│   ├── memory/
│   │   ├── REMEMBER_QUICKSTART.md        ← Quick reference
│   │   ├── MEMORY_SYSTEM_SETUP.md        ← This file
│   │   └── indexed/
│   │       ├── INDEX.md                   ← Master index
│   │       ├── typescript/
│   │       │   ├── undefined-vs-nullable.md
│   │       │   └── optional-chaining-pattern.md
│   │       ├── testing/
│   │       │   └── generic-test-fixtures.md
│   │       ├── git-workflow/
│   │       │   └── grep-pattern-matching.md
│   │       └── ... (other domains)
│   ├── 01_MASTER_AGENT_DIRECTIVE.instructions.md
│   ├── (other existing instruction files)
│   └── INDEX.md
└── prompts/
    ├── remember-enhanced.prompt.md      ← Enhanced prompt
    └── remember.prompt.md               ← Original (can keep or replace)
```

## Next Actions

1. **Update VS Code Settings** (if needed):
   - Ensure `/remember` command routes to `remember-enhanced.prompt.md`
   - Or test: Open command palette → `/remember test #tag lesson`

2. **Review & Clean Up**:
   - Migrate valuable lessons from old `/remember` responses
   - Use: `/remember >domain workspace #tag lesson` to capture them

3. **Share with Team**:
   - Share REMEMBER_QUICKSTART.md with teammates
   - Encourage domain-specific memory capture
   - Link to INDEX.md in team documentation

4. **Monitor Growth**:
   - Check INDEX.md regularly
   - Identify gaps in domain coverage
   - Notice emerging patterns in tags/priorities

## Key Benefits

| Feature                | Benefit                                                     |
| ---------------------- | ----------------------------------------------------------- |
| **CPMEM Metadata**     | Rich classification enables smart filtering and correlation |
| **Multiple Tags**      | Cross-domain discoverability without silos                  |
| **Indexed Structure**  | AI can search and reference memories efficiently            |
| **Priority Levels**    | Distinguishes critical learning from nice-to-knows          |
| **Related Links**      | Prevents duplicate knowledge, enables pattern discovery     |
| **Workspace + Global** | Mix of project-specific and cross-project knowledge         |
| **Type Categories**    | Gotchas separate from patterns separate from best-practices |

## Tags Quick Reference

**Always include 2-3 tags minimum** for best AI discoverability:

**Type Tags** (pick one):

- `#pattern` - Solution to implement
- `#gotcha` - Mistake to avoid
- `#best-practice` - Standard approach
- `#automation` - Tool/script
- `#workflow` - Process
- `#trick` - Clever workaround
- `#warning` - Critical issue

**Domain Tags** (pick one or more):

- `#typescript`, `#javascript`, `#git`, `#testing`, `#performance`, etc.

**Context Tags** (pick as needed):

- `#debugging`, `#refactoring`, `#scaling`, `#collaboration`, `#migration`, `#subtle`, `#critical`,
  `#cross-domain`

---

**System ready to use.** Start with `/remember` to build your indexed knowledge base!
