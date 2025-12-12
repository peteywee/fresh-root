# Repomix Integration - Complete Reference

**Status**: ✅ Complete and Ready  
**Date**: December 11, 2025

## Overview

Repomix has been successfully integrated into your Fresh Schedules monorepo as both a **CLI tool** and a **library package**. You can now:

- **Use via CLI**: `pnpm repomix <target> [options]`
- **Use as Library**: `import { runDefaultAction } from '@fresh-schedules/repomix'`

## What You Get

### 1. CLI Tool

- Simple command-line interface
- Multiple output formats (xml, markdown, json, plain)
- Compression support for AI analysis
- Pattern filtering (include/exclude)

### 2. Library Package

- TypeScript-first with full type definitions
- ESM-only, modern JavaScript
- Importable as `@fresh-schedules/repomix`
- Zero-configuration setup

### 3. Documentation

- **Comprehensive Guide**: [docs/guides/REPOMIX_INTEGRATION.md](docs/guides/REPOMIX_INTEGRATION.md)
- **Setup Summary**: [REPOMIX_SETUP_COMPLETE.md](REPOMIX_SETUP_COMPLETE.md)
- **Package Docs**: [packages/repomix/README.md](packages/repomix/README.md)
- **Examples**: [scripts/examples/repomix-usage-example.mjs](scripts/examples/repomix-usage-example.mjs)

## Quick Start

### CLI - Get Help

```bash
pnpm repomix --help
```

### CLI - Analyze Directory

```bash
# Markdown output
pnpm repomix . --style markdown --output codebase.md

# Compressed XML for AI
pnpm repomix . --compress --style xml

# Specific package
pnpm repomix packages/api-framework
```

### Library - Programmatic Use

```typescript
import { runDefaultAction } from '@fresh-schedules/repomix';

await runDefaultAction(
  ['packages/types'],
  process.cwd(),
  {
    output: {
      style: 'markdown',
      filePath: './analysis.md'
    }
  }
);
```

## File Structure

```
packages/repomix/          ← New workspace package
├── src/
│   ├── index.ts          ← Library exports
│   └── cli.ts            ← CLI implementation
├── dist/                 ← Built files (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Package Information

| Property | Value |
|----------|-------|
| **Name** | `@fresh-schedules/repomix` |
| **Version** | 0.1.0 |
| **Location** | `packages/repomix/` |
| **Underlying Tool** | repomix v0.2.43 |
| **Build System** | tsup |
| **Language** | TypeScript (ESM) |
| **Node** | >=20.10.0 |

## Available Commands

### Root Level

```bash
pnpm repomix [options]     # Run CLI from any directory
```

### Package Level

```bash
pnpm --filter @fresh-schedules/repomix build     # Build package
pnpm --filter @fresh-schedules/repomix typecheck # Type check
pnpm --filter @fresh-schedules/repomix clean     # Clean dist/
```

## CLI Options Reference

| Option | Description | Default |
|--------|-------------|---------|
| `<path>` | Target directory or repo | Required |
| `--style` | Output format | `xml` |
| `--output` | Output file path | Auto-generated |
| `--compress` | Enable compression | `false` |
| `--ignore` | Patterns to ignore | None |
| `--include` | Patterns to include | None |
| `-h, --help` | Show help | — |
| `-v, --version` | Show version | — |

## Export Reference

```typescript
// Functions
export { runDefaultAction, setLogLevel } from '@fresh-schedules/repomix'
export async function getVersion(): Promise<string>

// Types
export type { RepomixConfig, CliOptions }
```

## Common Use Cases

### 📄 Generate Documentation

```bash
pnpm repomix . --style markdown --output docs/CODEBASE.md
```

### 🤖 Prepare for AI Analysis

```bash
pnpm repomix . --compress --style xml --output ai-input.xml
```

### 🔍 Analyze Package

```bash
pnpm repomix packages/api-framework --style markdown
```

### 🎯 Focused Analysis

```bash
pnpm repomix . --include "src/**" --exclude "**/*.test.ts"
```

### 📦 CI/CD Integration

```bash
pnpm repomix . \
  --style markdown \
  --ignore "node_modules/**,dist/**" \
  --output reports/codebase.md
```

## Documentation Index

| Document | Purpose |
|----------|---------|
| [docs/guides/REPOMIX_INTEGRATION.md](docs/guides/REPOMIX_INTEGRATION.md) | Comprehensive integration guide with examples |
| [REPOMIX_SETUP_COMPLETE.md](REPOMIX_SETUP_COMPLETE.md) | Setup summary and next steps |
| [packages/repomix/README.md](packages/repomix/README.md) | Package-specific documentation |
| [scripts/examples/repomix-usage-example.mjs](scripts/examples/repomix-usage-example.mjs) | Practical usage examples |

## Verification Checklist

- ✅ Package created and built
- ✅ CLI command working
- ✅ Library exports accessible
- ✅ TypeScript types generated
- ✅ Documentation complete
- ✅ No build errors
- ✅ No type errors

## Architecture

```
fresh-root (workspace root)
    ├── package.json
    │   └── scripts.repomix = "node packages/repomix/dist/cli.js"
    │
    └── packages/repomix/
        ├── src/
        │   ├── index.ts (library)
        │   └── cli.ts (CLI)
        ├── dist/ (built output)
        └── package.json
            └── depends on: repomix@0.2.43
```

## Next Steps

1. **Try it**: `pnpm repomix --help`
2. **Analyze**: `pnpm repomix . --style markdown`
3. **Read**: Open [docs/guides/REPOMIX_INTEGRATION.md](docs/guides/REPOMIX_INTEGRATION.md)
4. **Integrate**: Add to CI/CD, scripts, or tools

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CLI not found | Run `pnpm --filter @fresh-schedules/repomix build` |
| Type errors | Ensure importing from `@fresh-schedules/repomix` not dist |
| Build fails | Clean and rebuild: `pnpm --filter @fresh-schedules/repomix clean && build` |

## Support

- **Local**: Check documentation files linked above
- **External**: [repomix GitHub](https://github.com/yamadashy/repomix)
- **Issues**: See [packages/repomix/README.md](packages/repomix/README.md#troubleshooting)

---

**Setup Status**: Complete ✅  
**Last Updated**: December 11, 2025  
**Maintained By**: AI Setup Agent
