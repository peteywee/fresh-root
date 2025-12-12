# @fresh-schedules/repomix

Repomix CLI and library integration for the Fresh Schedules codebase.

Repomix packages entire codebases into a single file for AI analysis, making it easier to analyze and understand large projects.

## Installation

```bash
pnpm add --filter @fresh-schedules/repomix repomix
pnpm install
```

## CLI Usage

```bash
# Pack a local directory
pnpm repomix /path/to/code

# Pack with markdown output
pnpm repomix /path/to/code --style markdown

# Pack a GitHub repository
pnpm repomix user/repo --compress

# Pack with specific patterns
pnpm repomix /path/to/code --include "src/**" --ignore "node_modules/**"
```

### Options

- `--style <format>` - Output format: `xml` (default), `markdown`, `json`, `plain`
- `--ignore <patterns>` - Patterns to ignore (comma-separated)
- `--include <patterns>` - Patterns to include (comma-separated)
- `--compress` - Enable Tree-sitter compression
- `-v, --version` - Show version
- `-h, --help` - Show help

## Library Usage

Use repomix programmatically in your code:

```typescript
import { packLocalDirectory, packRemoteRepository } from '@fresh-schedules/repomix';

// Pack a local directory
const output = await packLocalDirectory('/path/to/code', {
  style: 'markdown',
  includePatterns: 'src/**',
  compress: false,
});

// Pack a GitHub repository
const repoOutput = await packRemoteRepository('user/repo', {
  style: 'xml',
  compress: true,
});

// Get version info
import { getVersion } from '@fresh-schedules/repomix';
const version = await getVersion();
console.log(`Package version: ${version}`);
```

## Common Use Cases

### Analyze Fresh Schedules codebase for AI

```bash
pnpm repomix . --style markdown --ignore "node_modules/**,dist/**,.next/**"
```

### Generate compact representation

```bash
pnpm repomix /path/to/code --style json --compress
```

### Extract specific domain

```bash
pnpm repomix . --include "apps/web/app/api/**" --style markdown
```

## Related

- [Repomix GitHub](https://github.com/yamadashy/repomix)
- [Repomix Documentation](https://repomix.com)

## Scripts

- `pnpm build` - Build the package
- `pnpm typecheck` - Type check
- `pnpm clean` - Clean build artifacts

