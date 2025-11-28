// Auto-tagging script (invoked via `node scripts/tag-files.mjs`)
/**
 * Auto-tag source files with [PRIORITY][AREA][COMPONENT] headers
 * Based on docs/TAGGING_SYSTEM.md conventions
 *
 * Usage:
 *   node scripts/tag-files.mjs [--dry-run] [--path <dir>]
 */

import fs from "node:fs/promises";
import path from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");
const TARGET_PATH = process.argv.includes("--path")
  ? process.argv[process.argv.indexOf("--path") + 1]
  : ".";

// Infer priority from path patterns
function inferPriority(filePath, content) {
  const lower = filePath.toLowerCase();
  const hasAuth = /auth|session|token|mfa/i.test(filePath) || /firebase|admin/i.test(content);
  const hasSecurity = /security|rbac|cors|rate|encrypt/i.test(filePath);
  const hasReliability = /otel|sentry|log|monitor|observ/i.test(filePath);
  const hasValidation = /validation|schema|zod/i.test(filePath);
  const isTest = /test|spec/i.test(filePath);

  if (hasAuth || hasSecurity) return "P0";
  if (hasReliability || hasValidation) return "P1";
  if (isTest) return "P1";
  if (/api|route/i.test(filePath)) return "P1";
  if (/component|ui|page/i.test(filePath)) return "P2";
  return "P2";
}

// Infer area from path and content
function inferArea(filePath, content) {
  const lower = filePath.toLowerCase();
  if (/auth|session|mfa|token/i.test(filePath)) return "AUTH";
  if (/rbac|permission|role/i.test(filePath)) return "RBAC";
  if (/security|cors|rate|header/i.test(filePath)) return "SECURITY";
  if (/otel|sentry|log|monitor/i.test(filePath)) return "OBSERVABILITY";
  if (/validation|schema|zod/i.test(filePath)) return "INTEGRITY";
  if (/firebase|admin/i.test(filePath)) return "FIREBASE";
  if (/test|spec/i.test(filePath)) return "TEST";
  if (/api|route/i.test(filePath)) return "API";
  if (/middleware|mw/i.test(filePath)) return "API";
  if (/component|ui/i.test(filePath)) return "UI";
  return "APP";
}

// Infer component tags from path and imports
function inferComponents(filePath, content) {
  const components = [];
  const lower = filePath.toLowerCase();

  if (/env|config/i.test(filePath)) components.push("ENV");
  if (/middleware|mw/i.test(filePath)) components.push("MIDDLEWARE");
  if (/log/i.test(filePath)) components.push("LOGGING");
  if (/sentry/i.test(filePath)) components.push("SENTRY");
  if (/otel|telemetry/i.test(filePath)) components.push("OTEL");
  if (/session/i.test(filePath)) components.push("SESSION");
  if (/mfa|2fa/i.test(filePath)) components.push("MFA");
  if (/cors/i.test(filePath)) components.push("CORS");
  if (/rate.*limit/i.test(filePath)) components.push("RATE_LIMIT");
  if (/validation|schema/i.test(filePath)) components.push("VALIDATION");
  if (/firebase/i.test(filePath)) components.push("FIREBASE");
  if (/test|spec/i.test(filePath)) components.push("TEST");

  return components.length ? components : ["CODE"];
}

// Generate description from filename and path
function inferDescription(filePath) {
  const base = path.basename(filePath, path.extname(filePath));
  const parts = base.split(/[-._]/);
  const humanized = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");

  if (/route\.(ts|js)/.test(filePath)) return `${humanized} API route handler`;
  if (/page\.(tsx|jsx)/.test(filePath)) return `${humanized} page component`;
  if (/middleware|mw/.test(filePath)) return `${humanized} middleware`;
  if (/test|spec/.test(filePath)) return `${humanized} tests`;
  if (/\.d\.ts$/.test(filePath)) return `${humanized} type definitions`;

  return humanized;
}

// Check if file already has tags
function splitShebang(content) {
  if (content.startsWith("#!")) {
    const nl = content.indexOf("\n");
    if (nl !== -1) {
      return { shebang: content.slice(0, nl + 1), body: content.slice(nl + 1) };
    }
    return { shebang: content, body: "" };
  }
  return { shebang: "", body: content };
}

// Check if file already has tags (after an optional shebang)
function hasTag(content, filePath) {
  const { body } = splitShebang(content);
  const prefix = getCommentPrefix(filePath) === "#" ? "#" : "//";
  const re = new RegExp(`^${prefix}\\s*\\[P[0-3]\\]`);
  return re.test(body);
}

// Build tag header
function buildTagHeader(filePath, content) {
  const priority = inferPriority(filePath, content);
  const area = inferArea(filePath, content);
  const components = inferComponents(filePath, content);
  const description = inferDescription(filePath);

  const comment = getCommentPrefix(filePath);
  const line1 = `${comment} [${priority}][${area}][${components[0] || "CODE"}] ${description}`;
  const allTags = [priority, area, ...components].join(", ");
  const line2 = `${comment} Tags: ${allTags}`;

  return `${line1}\n${line2}\n`;
}

// Determine comment prefix based on file type
function getCommentPrefix(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".sh" || ext === ".py") return "#";
  return "//"; // default for JS/TS
}

// Walk directory recursively
async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    // Skip this script itself to avoid breaking the shebang/headers
    if (fullPath.endsWith(path.normalize("scripts/tag-files.mjs"))) continue;
    if (entry.isDirectory()) {
      if (
        ["node_modules", ".next", "dist", "build", "coverage", ".turbo", ".git"].includes(
          entry.name,
        )
      )
        continue;
      yield* walk(fullPath);
    } else if (/\.(ts|tsx|js|jsx|mjs|cjs|mts|cts|sh|py)$/.test(entry.name)) {
      yield fullPath;
    }
  }
}

// Main
async function main() {
  let tagged = 0;
  let skipped = 0;
  let errors = 0;
  let fixedShebang = 0;

  console.log(`Scanning files in: ${TARGET_PATH}`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "WRITE"}\n`);

  for await (const filePath of walk(TARGET_PATH)) {
    try {
      let content = await fs.readFile(filePath, "utf8");

      // Repair: ensure any shebang line is at the very top
      const shebangMatch = content.match(/^#!.*$/m);
      if (shebangMatch && shebangMatch.index !== 0) {
        const shebangLine = shebangMatch[0];
        const before = content.slice(0, shebangMatch.index);
        const after = content.slice(shebangMatch.index + shebangLine.length);
        const afterTrimmed = after.startsWith("\n") ? after.slice(1) : after;
        content = `${shebangLine}\n${before}${afterTrimmed}`;
        fixedShebang++;
      }

      if (hasTag(content, filePath)) {
        // Already tagged; write back if we only repaired shebang
        if (fixedShebang && !DRY_RUN) {
          await fs.writeFile(filePath, content, "utf8");
        }
        skipped++;
        continue;
      }

      const { shebang, body } = splitShebang(content);
      const tagHeader = buildTagHeader(filePath, content);
      const newContent = `${shebang}${tagHeader}${body}`;

      console.log(`[TAG] ${filePath}`);
      console.log(`      ${tagHeader.split("\n")[0]}`);

      if (!DRY_RUN) {
        await fs.writeFile(filePath, newContent, "utf8");
      }

      tagged++;
    } catch (err) {
      console.error(`[ERROR] ${filePath}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Tagged: ${tagged}`);
  console.log(`Skipped (already tagged): ${skipped}`);
  if (fixedShebang) console.log(`Shebangs fixed: ${fixedShebang}`);
  console.log(`Errors: ${errors}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
