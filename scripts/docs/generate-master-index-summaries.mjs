// [P2][DOCS][AUTOGEN] Generate one-line summaries for docs/MASTER_DOCS_INDEX.md.
// Tags: DOCS, AUTOGEN, SCRIPTS

// Workaround: some editors/configs run the TypeScript ESLint parser over JS files
// and fail when multiple tsconfig roots are detected. Disable ESLint parsing for
// this simple script so it isn't blocked by project-level parser settings.
/* eslint-disable */
// @ts-nocheck

import fs from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const MASTER = path.join(ROOT, "docs", "MASTER_DOCS_INDEX.md");
const OUT = path.join(ROOT, "docs", "MASTER_DOCS_INDEX_SUMMARIES.md");

// Heuristic to extract a one-line summary from a markdown file
function extractSummary(text) {
  if (!text) return "(empty)";
  const lines = text.split(/\r?\n/).map((l) => l.trim());

  // Skip optional frontmatter
  let i = 0;
  if (lines[i] === "---") {
    i++;
    while (i < lines.length && lines[i] !== "---") i++;
    i++; // skip trailing ---
  }

  // find first H2/H3 or first paragraph
  for (; i < lines.length; i++) {
    const l = lines[i];
    if (!l) continue;
    if (l.startsWith("## ") || l.startsWith("### ") || l.startsWith("# ")) {
      // prefer the header text following the hashes
      return l.replace(/^#+\s*/, "").replace(/\s+$/, "");
    }
    if (!l.startsWith("#") && !l.startsWith("```")) {
      // take this line as summary candidate
      const para = [l];
      // continue to append until blank
      for (let j = i + 1; j < lines.length && lines[j]; j++) {
        para.push(lines[j]);
        if (para.join(" ").length > 180) break;
      }
      const s = para.join(" ");
      return s.length > 180 ? s.slice(0, 177).trim() + "..." : s;
    }
  }
  // fallback is the first non-empty line
  for (const l of lines) if (l) return l;
  return "(no summary)";
}

(async function main() {
  try {
    const master = await fs.readFile(MASTER, "utf8");

    // find backtick-wrapped paths `docs/...`
    const regex = /`([^`]+)`/g;
    const seen = new Map();
    let m;
    while ((m = regex.exec(master))) {
      const candidate = m[1].trim();
      // only keep docs paths
      const normalized = candidate.startsWith("docs/") ? candidate : "docs/" + candidate;
      seen.set(normalized, null);
    }

    // Also extract lines like - `ARCH` => path paragraphs; fallback to lists
    // if none found, attempt to parse by Markdown link: [text](path)
    if (seen.size === 0) {
      const linkRegex = /\[(?:[^\]]+)\]\(([^)]+)\)/g;
      while ((m = linkRegex.exec(master))) {
        const candidate = m[1];
        const normalized = candidate.startsWith("docs/") ? candidate : "docs/" + candidate;
        seen.set(normalized, null);
      }
    }

    if (seen.size === 0) {
      console.warn("No docs links found in MASTER_DOCS_INDEX.md. Nothing to do.");
      return;
    }

    for (const p of seen.keys()) {
      const filePath = path.join(ROOT, p);
      try {
        const content = await fs.readFile(filePath, "utf8");
        const summary = extractSummary(content);
        seen.set(p, summary);
      } catch (err) {
        if (err.code === "ENOENT") {
          // if symlink under fresh-root-main exists, try that
          const alt = path.join(ROOT, "fresh-root-main", p);
          try {
            const content = await fs.readFile(alt, "utf8");
            seen.set(p, extractSummary(content));
            continue;
          } catch (e2) {
            seen.set(p, "(missing file)");
            continue;
          }
        }
        seen.set(p, `(error: ${err.message})`);
      }
    }

    // Build a simple output
    const lines = [];
    lines.push("# Master Docs Index — One-line summaries");
    lines.push("");
    lines.push("Generated: " + new Date().toISOString());
    lines.push("");

    for (const [p, summary] of seen) {
      // Use simple concatenation to avoid escaping backticks in template literals
      lines.push("- `" + p + "` — " + summary);
    }

    await fs.writeFile(OUT, lines.join("\n") + "\n", "utf8");
    console.log("Wrote", OUT);
  } catch (err) {
    console.error("Failed:", err);
    process.exit(1);
  }
})();
