#!/usr/bin/env node
// [P1][DEV][AUTOMATION] File watcher - auto-tag new files in real-time
// Tags: P1, DEV, AUTOMATION, TAGGING
/**
 * @fileoverview
 * Watches for new file creation and automatically applies headers/prefixes
 * based on file type. Runs in background during development.
 *
 * Usage: `node scripts/watch-and-tag.mjs` or `pnpm watch:tags`
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// Directories to watch
const watchDirs = ["apps/web/app", "apps/web/src", "packages/types/src", "functions/src"];

// File extensions that need tagging
const targetExtensions = [".ts", ".tsx", ".js", ".mjs", ".md"];

const seenFiles = new Set();

console.log("🔍 Watching for new files to auto-tag...\n");

/**
 * Tag a single file
 */
function tagFile(filePath) {
  if (seenFiles.has(filePath)) return;
  seenFiles.add(filePath);

  // Skip node_modules, .next, dist, etc
  if (
    filePath.includes("node_modules") ||
    filePath.includes(".next") ||
    filePath.includes("dist") ||
    filePath.includes("build") ||
    filePath.includes(".turbo")
  ) {
    return;
  }

  const ext = path.extname(filePath);
  if (!targetExtensions.includes(ext)) return;

  // Run tagging script. Capture spawn errors to avoid uncaught exceptions
    try {
    const env = { ...process.env };
    if (!env.NODE_OPTIONS) env.NODE_OPTIONS = "--max-old-space-size=1024"; // tagging is small
    const tagProc = spawn("node", ["scripts/tag-files.mjs", "--path", filePath], {
      cwd: rootDir,
      stdio: "inherit",
      env,
    });
    tagProc.on("error", (err) => {
      console.error(`Failed to spawn tag process for ${filePath}:`, err.message || err);
    });
  } catch (err) {
    console.error(`Exception while attempting to tag ${filePath}:`, err.message || err);
  }

  console.log(`✅ Tagged: ${filePath}`);
}

/**
 * Watch directory recursively
 */
function watchDirectory(dir) {
  const fullPath = path.join(rootDir, dir);

  try {
    fs.watch(fullPath, { recursive: true }, (eventType, filename) => {
      if (filename && eventType === "rename") {
        const filePath = path.join(fullPath, filename);
        try {
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            tagFile(filePath);
          }
        } catch (e) {
          // File might have been deleted
        }
      }
    });
    console.log(`👀 Watching: ${dir}/`);
  } catch (e) {
    console.warn(`⚠️  Could not watch ${dir}:`, e.message);
  }
}

// Start watching
watchDirs.forEach(watchDirectory);

console.log("\nPress Ctrl+C to stop watching.\n");
