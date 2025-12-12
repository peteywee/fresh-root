# Fear.zip Placement Instructions

## Where to Place fear.zip

Place the `fear.zip` file in this directory:
```
/home/runner/work/fresh-root/fresh-root/docs/temp/fear-directives/fear.zip
```

Or use this relative path from repository root:
```
docs/temp/fear-directives/fear.zip
```

## Quick Start After Placement

1. **Extract the archive**:
   ```bash
   cd docs/temp/fear-directives
   ./extract.sh
   ```

2. **Review extracted contents**:
   ```bash
   ls -la extracted/
   ```

3. **Begin integration process**:
   - Open `INTEGRATION_TEMPLATE.md`
   - Fill out one template per directive file
   - Follow the hierarchy mapping in `HIERARCHY_SYSTEM.md`

## Automated Extraction

The `extract.sh` script will:
- ✅ Verify fear.zip exists
- 📦 Extract contents to `extracted/` subdirectory
- 📄 List all extracted files
- 🔍 Analyze markdown and instruction files
- 🏷️ Identify priority metadata
- 📊 Compare with existing instruction files

## Manual Extraction

If you prefer manual extraction:
```bash
cd docs/temp/fear-directives
unzip fear.zip -d extracted/
ls -la extracted/
```

## Expected Structure

We anticipate fear.zip might contain:
- `*.md` - Markdown directive files
- `*.instructions.md` - Instruction files with frontmatter
- Possibly subdirectories for organization
- Metadata files or index files

## What Happens Next

1. **Analysis Phase**: Review all extracted directives
2. **Mapping Phase**: Map each directive to hierarchy using `INTEGRATION_TEMPLATE.md`
3. **Integration Phase**: Move directives to `.github/instructions/`
4. **Validation Phase**: Test and verify integration
5. **Cleanup Phase**: Archive temp directory after success

## Need Help?

Refer to these documentation files:
- `README.md` - Overview and process
- `HIERARCHY_SYSTEM.md` - Detailed hierarchy explanation
- `INTEGRATION_TEMPLATE.md` - Step-by-step integration guide

## Current Status

🟡 **AWAITING**: fear.zip file

📅 **Created**: 2025-12-12
🔄 **Last Check**: Waiting for file

---

Once fear.zip is placed here, update this file's status and proceed with extraction.
