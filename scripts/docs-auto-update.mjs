#!/usr/bin/env node

/**
 * [P0][CI][AUTOMATION] Docs Auto-Update with Latest-Only Retention
 * Tags: P0, CI, AUTOMATION, DOCS
 *
 * Manages dated documentation files in docs/dev/ directory.
 * - Keeps only the latest version of each dated doc
 * - Auto-updates files with current date
 * - Cleans up old versions
 *
 * Usage:
 *   node scripts/docs-auto-update.mjs [--dry-run] [--verbose]
 */

import fs from "fs";
import path from "path";
import { globby } from "globby";

const DOCS_DEV_DIR = "docs/dev";
const DATE_PATTERN = /^(.+?)_(\d{4}-\d{2}-\d{2})(\..+)$/;

/**
 * Parse a dated filename into components
 */
function parseDatedFilename(filename) {
  const match = filename.match(DATE_PATTERN);
  if (!match) return null;
  return {
    baseName: match[1],
    date: match[2],
    extension: match[3],
    fullName: filename,
  };
}

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Find all dated files and group by base name
 */
async function findDatedFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`📁 Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
    return new Map();
  }

  const files = await globby(`${dir}/*_????-??-??.*`);
  const groups = new Map();

  for (const filePath of files) {
    const filename = path.basename(filePath);
    const parsed = parseDatedFilename(filename);

    if (parsed) {
      const key = `${parsed.baseName}${parsed.extension}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push({
        ...parsed,
        filePath,
      });
    }
  }

  // Sort each group by date (newest first)
  for (const [key, files] of groups) {
    files.sort((a, b) => b.date.localeCompare(a.date));
    groups.set(key, files);
  }

  return groups;
}

/**
 * Clean up old versions, keeping only the latest
 */
async function cleanupOldVersions(groups, options = {}) {
  const { dryRun = false, verbose = false } = options;
  const deleted = [];

  for (const [key, files] of groups) {
    if (files.length <= 1) continue;

    // Keep the first (newest), delete the rest
    const toDelete = files.slice(1);

    for (const file of toDelete) {
      if (verbose) {
        console.log(`🗑️  Deleting old version: ${file.filePath}`);
      }

      if (!dryRun) {
        fs.unlinkSync(file.filePath);
      }
      deleted.push(file.filePath);
    }
  }

  return deleted;
}

<<<<<<< HEAD

=======
/**
 * Update a file to current date (creates new dated version)
 */
function updateToCurrentDate(filePath, options = {}) {
  const { dryRun = false, verbose = false } = options;
  const currentDate = getCurrentDate();
  const dir = path.dirname(filePath);
  const filename = path.basename(filePath);
  const parsed = parseDatedFilename(filename);

  if (!parsed) {
    // Not a dated file, add date
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    const newFilename = `${base}_${currentDate}${ext}`;
    const newPath = path.join(dir, newFilename);

    if (verbose) {
      console.log(`📝 Creating dated version: ${newPath}`);
    }

    if (!dryRun) {
      fs.renameSync(filePath, newPath);
    }

    return newPath;
  }

  // Already dated, update date if different
  if (parsed.date === currentDate) {
    if (verbose) {
      console.log(`✓ Already current: ${filePath}`);
    }
    return filePath;
  }

  const newFilename = `${parsed.baseName}_${currentDate}${parsed.extension}`;
  const newPath = path.join(dir, newFilename);

  if (verbose) {
    console.log(`📝 Updating date: ${filePath} → ${newFilename}`);
  }

  if (!dryRun) {
    fs.renameSync(filePath, newPath);
  }

  return newPath;
}
>>>>>>> 1eb7759 (feat(redteam): add security assessment planning and schema updates)

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const verbose = args.includes("--verbose");

  console.log("═".repeat(60));
  console.log("📚 DOCS AUTO-UPDATE (Latest-Only Retention)");
  console.log("═".repeat(60));

  if (dryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be made\n");
  }

  // Find all dated files
  const groups = await findDatedFiles(DOCS_DEV_DIR);

  console.log(`\n📁 Found ${groups.size} document groups in ${DOCS_DEV_DIR}/\n`);

  if (verbose) {
    for (const [key, files] of groups) {
      console.log(`  ${key}:`);
      for (const file of files) {
        const isLatest = file === files[0];
        console.log(`    ${isLatest ? "✓" : "✗"} ${file.date} ${isLatest ? "(keep)" : "(delete)"}`);
      }
    }
    console.log("");
  }

  // Clean up old versions
  const deleted = await cleanupOldVersions(groups, { dryRun, verbose });

  console.log("\n📊 Summary:");
  console.log(`  Document groups: ${groups.size}`);
  console.log(`  Deleted old versions: ${deleted.length}`);
  console.log(`  Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);

  if (deleted.length > 0) {
    console.log("\n🗑️  Deleted files:");
    for (const file of deleted) {
      console.log(`    - ${file}`);
    }
  }

  console.log("\n✅ Done");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
