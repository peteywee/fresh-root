#!/usr/bin/env node
// [P2][APP][CODE] Filetag Server
// Tags: P2, APP, CODE
// filetag MCP server (stdio) with caching, self-learning, and code analysis.
// Tools:
//   - filetag.scan       : Smart scan (auto-excludes, cache, sampling, insights)
//   - filetag.report     : Rich markdown/JSON report with recommendations
//   - filetag.analyze    : Dependencies + quality metrics + improvement tips
//   - filetag.clearCache : Clears in-memory cache and learned state
//
// Env (via .env):
//   FILETAG_DEFAULT_EXCLUDES=node_modules,.git,dist,build,.next,.turbo,coverage,.cache
//   FILETAG_CACHE_TTL_SEC=300
//   FILETAG_MAX_FILES=5000
//   FILETAG_STATE_FILE=mcp/.filetag-state.json
//
// Dependencies: @modelcontextprotocol/sdk, zod

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
// ---------- JSON Schema Draft 2020-12 Validator (Ajv) ----------
const ajv = new Ajv2020({ strict: false, allErrors: true, $data: true, allowUnionTypes: true });
addFormats(ajv);

const server = new McpServer({ name: "filetag", version: "0.2.0" });

// ---------- Env & constants ----------
const CWD = process.cwd();

function env(name, fallback) {
  const v = process.env[name];
  return v == null || v === "" ? fallback : v;
}

const DEFAULT_EXCLUDES = new Set(
  env("FILETAG_DEFAULT_EXCLUDES", "node_modules,.git,dist,build,.next,.turbo,coverage,.cache")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

const CACHE_TTL_MS = Number(env("FILETAG_CACHE_TTL_SEC", "300")) * 1000;
const MAX_FILES_DEFAULT = Number(env("FILETAG_MAX_FILES", "5000"));
const STATE_FILE = path.isAbsolute(env("FILETAG_STATE_FILE", "mcp/.filetag-state.json"))
  ? env("FILETAG_STATE_FILE", "mcp/.filetag-state.json")
  : path.join(CWD, env("FILETAG_STATE_FILE", "mcp/.filetag-state.json"));

const TEXT_EXTS = new Set([
  ".js",
  ".cjs",
  ".mjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".css",
  ".scss",
  ".html",
  ".txt",
  ".sh",
  ".py",
  ".rb",
  ".go",
  ".rs",
  ".java",
  ".kt",
  ".c",
  ".cc",
  ".cpp",
  ".h",
  ".hpp",
]);

// ---------- Markdown helpers (identify & fix) ----------
/**
 * Detect if a line opens or closes a fenced code block.
 * Returns: { opens: boolean, closes: boolean, fence: string|null }
 */
function fenceInfo(line) {
  const m = line.match(/^([> ]*)((```|~~~)([a-zA-Z0-9_+-]*)?)/);
  if (!m) return { opens: false, closes: false, fence: null };
  // If already in a fence, the same marker will close; we treat detection elsewhere
  return { opens: true, closes: false, fence: m[3] };
}

/**
 * Scan a markdown text for MD046-style indented code blocks.
 * Returns array of { start, end } 1-based line numbers in original text.
 */
function findIndentedCodeBlocks(mdText) {
  const lines = mdText.split(/\r?\n/);
  const blocks = [];
  let inFence = null; // "```" or "~~~"
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw;
    // track fenced blocks
    if (!inFence) {
      const fi = fenceInfo(line);
      if (fi.opens) {
        inFence = fi.fence; // track marker (``` or ~~~)
        i++;
        continue;
      }
    } else {
      if (line.trim().startsWith(inFence)) {
        inFence = null;
      }
      i++;
      continue;
    }

    // Skip blockquotes; handling fenced inside quotes is complex
    if (/^>/.test(line)) {
      i++;
      continue;
    }

    // Detect indented code (tab or 4+ spaces) not inside a fence
    if (/^(\t| {4,})/.test(line)) {
      const start = i + 1; // 1-based
      let j = i;
      while (j < lines.length) {
        const l = lines[j];
        if (l.trim() === "") {
          // blank lines are part of block if between indented lines
          j++;
          continue;
        }
        if (/^(\t| {4,})/.test(l)) {
          j++;
          continue;
        }
        break;
      }
      const end = j; // exclusive index => line number j
      blocks.push({ start, end });
      i = j;
      continue;
    }

    i++;
  }
  return blocks;
}

/**
 * Convert indented code blocks to fenced code blocks with a language hint.
 * Returns { text, changes } where changes = number of blocks converted.
 */
function fixMD046(mdText, lang = "text") {
  const lines = mdText.split(/\r?\n/);
  const out = [];
  let inFence = null;
  let i = 0;
  let changes = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw;

    // Track fenced blocks (pass-through)
    if (!inFence) {
      const fi = fenceInfo(line);
      if (fi.opens) {
        inFence = fi.fence;
        out.push(line);
        i++;
        continue;
      }
    } else {
      out.push(line);
      if (line.trim().startsWith(inFence)) inFence = null;
      i++;
      continue;
    }

    // Skip blockquotes; leave as-is
    if (/^>/.test(line)) {
      out.push(line);
      i++;
      continue;
    }

    // Gather indented code block
    if (/^(\t| {4,})/.test(line)) {
      const block = [];
      // accumulate until non-indented (preserve blank lines but strip one indent level)
      while (i < lines.length) {
        const l = lines[i];
        if (l.trim() === "") {
          block.push("");
          i++;
          continue;
        }
        const m = l.match(/^(\t| {4,})(.*)$/);
        if (!m) break;
        block.push(m[2]); // strip one indent level (tab or 4+ spaces => remove matched prefix)
        i++;
      }
      // Trim leading/trailing empty lines inside block
      while (block.length && block[0].trim() === "") block.shift();
      while (block.length && block[block.length - 1].trim() === "") block.pop();

      out.push("```" + (lang ? lang : ""));
      out.push(...block);
      out.push("```");
      changes++;
      continue;
    }

    out.push(line);
    i++;
  }

  return { text: out.join("\n"), changes };
}

/**
 * Apply a set of common markdownlint-style fixes outside fenced code blocks:
 * - MD010: replace hard tabs with spaces
 * - MD009: trim trailing whitespace
 * - MD018/MD019: normalize ATX heading spacing ("# Heading")
 * - MD022: ensure blank line before/after headings
 * - MD030: ensure single space after list markers
 * - MD031/MD032: ensure blank lines around fenced code blocks and lists
 * - MD040: add language to fenced code blocks when missing (uses languageHint)
 * Note: does not modify contents inside fenced code blocks (except adding language on opening line)
 */
function fixMarkdownCommon(mdText, { languageHint = "text", olStyle = "one" } = {}) {
  const lines = mdText.split(/\r?\n/);
  const L = lines.length;
  const out1 = new Array(L);
  const stats = {
    tabsReplaced: 0,
    trailingSpacesRemoved: 0,
    headingsNormalized: 0,
    h1Demoted: 0,
    headingPunctRemoved: 0,
    listMarkerSpaces: 0,
    listsRenumbered: 0,
    ulIndentNormalized: 0,
    fencedLanguageAdded: 0,
    blankLinesInserted: 0,
    inlineHtmlWrapped: 0,
    headingLevelsAdjusted: 0,
    headingDuplicatesRenamed: 0,
    bareUrlsWrapped: 0,
    inlineCodeSpacesTrimmed: 0,
    referenceDefsAdded: 0,
  };

  const isHeadingLine = (s) => /^( {0,3}#{1,6})(\s*)([^#\s].*)?$/.test(s);
  const normalizeHeading = (s) => {
    const m = s.match(/^( {0,3})(#{1,6})(\s*)(.*)$/);
    if (!m) return s;
    const [, lead, hashes, sp, rest] = m;
    const newLine = `${lead}${hashes} ${String(rest || "").trim()}`;
    return newLine;
  };
  const isListItem = (s) => /^( {0,3})([*+-]|\d+[.)])(\s+)(.+)?$/.test(s);
  const fixListMarkerSpace = (s) =>
    s.replace(/^( {0,3})([*+-]|\d+[.)])\s+/, (m, lead, mark) => `${lead}${mark} `);
  const isFenceOpen = (s) => {
    const m = s.match(/^(\s*)(```|~~~)([a-zA-Z0-9_+-]*)\s*$/);
    if (!m) return null;
    return { indent: m[1] || "", fence: m[2], lang: m[3] || "" };
  };
  const isH1 = (s) => /^( {0,3})#(\s+)([^#\s].*)$/.test(s);
  let seenH1 = false;

  // Pass 1: per-line normalization outside fences
  let inFence = null;
  let lastHeadingLevel = 0;
  const seenHeadings = Object.create(null);
  for (let i = 0; i < L; i++) {
    let line = lines[i];
    const open = !inFence && isFenceOpen(line);
    if (open) {
      // add language if missing
      if (!open.lang && languageHint) {
        line = `${open.indent}${open.fence}${languageHint}`;
        stats.fencedLanguageAdded++;
      }
      inFence = open.fence; // enter fence
      out1[i] = line;
      continue;
    }
    if (inFence) {
      // detect closing fence
      if (line.trim().startsWith(inFence)) inFence = null;
      out1[i] = line;
      continue;
    }

    // MD010: tabs -> two spaces (outside fences)
    if (line.includes("\t")) {
      const count = (line.match(/\t/g) || []).length;
      stats.tabsReplaced += count;
      line = line.replace(/\t/g, "  ");
    }

    // MD018/MD019: normalize ATX heading spacing
    if (isHeadingLine(line)) {
      const before = line;
      line = normalizeHeading(line);
      if (line !== before) stats.headingsNormalized++;

      // MD025: single H1 (demote subsequent H1s to H2)
      if (isH1(line)) {
        if (seenH1) {
          line = line.replace(/^( {0,3})#(\s+)/, "$1## $2");
          // re-normalize spacing after demotion to avoid double spaces
          line = normalizeHeading(line);
          stats.h1Demoted++;
        } else {
          seenH1 = true;
        }
      }

      // MD026: no trailing punctuation in headings
      const punctFixed = line.replace(
        /^( {0,3}#{1,6}\s+)(.*?)[\s]*([:;,.!?]+)\s*$/,
        (m, pre, text) => pre + text.trim(),
      );
      if (punctFixed !== line) {
        line = punctFixed;
        stats.headingPunctRemoved++;
      }

      // MD001: heading-increment (no jumps > 1) and MD024 duplicate headings
      const mh = line.match(/^( {0,3})(#{1,6})(\s+)(.*)$/);
      if (mh) {
        const [, lead, hashes, sp, text] = mh;
        const level = hashes.length;
        let desired = level;
        if (lastHeadingLevel && level > lastHeadingLevel + 1) {
          desired = lastHeadingLevel + 1;
        }
        if (desired !== level) {
          line = `${lead}${"#".repeat(desired)} ${text.trim()}`;
          stats.headingLevelsAdjusted++;
        }
        lastHeadingLevel = desired;
        const slug = text.trim().toLowerCase();
        const seen = seenHeadings[slug] || 0;
        if (seen > 0) {
          const renamed = `${text.trim()} (${seen + 1})`;
          line = `${lead}${"#".repeat(desired)} ${renamed}`;
          stats.headingDuplicatesRenamed++;
          seenHeadings[slug] = seen + 1;
        } else {
          seenHeadings[slug] = 1;
        }
      }
    }

    // MD030: ensure single space after list markers
    if (isListItem(line)) {
      const before = line;
      line = fixListMarkerSpace(line);
      if (line !== before) stats.listMarkerSpaces++;
    }

    // MD009: trim trailing whitespace
    if (/[ \t]+$/.test(line)) {
      line = line.replace(/[ \t]+$/, "");
      stats.trailingSpacesRemoved++;
    }

    // MD033: wrap inline pseudo-HTML code with backticks and escape standalone HTML elements
    {
      let changed = false;
      // Pattern 1: Text followed by angle brackets like Foo<Bar>
      line = line.replace(/([A-Za-z0-9_.$]+)\s*(<[^>\n]+>)/g, (m, before, tag) => {
        if (m.indexOf("`") >= 0) return m; // already has backticks
        changed = true;
        return `\`${before}${tag}\``;
      });
      // Pattern 2: Standalone HTML-like elements <Element> not in links/code
      if (line.indexOf("`") === -1 && line.indexOf("](") === -1) {
        line = line.replace(/<([A-Za-z][A-Za-z0-9_.-]*)>/g, (m) => {
          changed = true;
          return `\`${m}\``;
        });
      }
      if (changed) stats.inlineHtmlWrapped++;
    }

    // MD038: trim spaces inside inline code spans - handle all occurrences
    if (line.includes("`")) {
      let changed = 0;
      // Match all code spans, handling multiple on same line
      line = line.replace(/`([^`]+)`/g, (m, inner) => {
        const trimmed = inner.trim();
        if (trimmed !== inner) changed++;
        return `\`${trimmed}\``;
      });
      stats.inlineCodeSpacesTrimmed += changed;
    }

    // MD034: wrap bare URLs in angle brackets (avoid links/images/code)
    if (!/\]\(https?:\/\//.test(line) && !line.trim().startsWith("![")) {
      const urlRe = /https?:\/\/[^\s<>()]+/g;
      const matches = [];
      let m;
      while ((m = urlRe.exec(line)) !== null) {
        matches.push({ start: m.index, end: m.index + m[0].length, url: m[0] });
      }
      if (matches.length > 0) {
        let rebuilt = "";
        let offset = 0;
        let wrapped = 0;
        for (const match of matches) {
          const prev = match.start > 0 ? line[match.start - 1] : "";
          const next = match.end < line.length ? line[match.end] : "";
          // skip if already in <...> or part of markdown link
          const alreadyWrapped = prev === "<" || next === ">";
          const partOfLink = prev === "(" || prev === "[";
          const inCode = line.slice(0, match.start).split("`").length % 2 === 0 ? false : true;
          if (alreadyWrapped || partOfLink || inCode) {
            rebuilt += line.slice(offset, match.end);
            offset = match.end;
            continue;
          }
          rebuilt += line.slice(offset, match.start) + `<${match.url}>`;
          offset = match.end;
          wrapped++;
        }
        rebuilt += line.slice(offset);
        if (wrapped > 0) {
          line = rebuilt;
          stats.bareUrlsWrapped += wrapped;
        }
      }
    }

    out1[i] = line;
  }

  // Pass 2: insert blank lines around headings, fenced code blocks, and lists
  const out2 = [];
  inFence = null;
  const isListLineIdx = (idx) => isListItem(out1[idx] || "");
  const isBlank = (s) => !s || s.trim() === "";

  for (let i = 0; i < L; i++) {
    const cur = out1[i];
    const trimmed = (cur || "").trim();
    const open = !inFence && isFenceOpen(cur);
    const next = i + 1 < L ? out1[i + 1] : "";
    const prevOut = out2.length ? out2[out2.length - 1] : "";

    if (open) {
      // ensure blank line before fence
      if (!isBlank(prevOut)) {
        out2.push("");
        stats.blankLinesInserted++;
      }
      out2.push(cur);
      inFence = open.fence;
      continue;
    }
    if (inFence) {
      out2.push(cur);
      if (trimmed.startsWith(inFence)) {
        inFence = null;
        // ensure blank line after fence if next is not blank/end
        if (!isBlank(next) && i + 1 < L) {
          out2.push("");
          stats.blankLinesInserted++;
        }
      }
      continue;
    }

    if (isHeadingLine(cur)) {
      if (!isBlank(prevOut)) {
        out2.push("");
        stats.blankLinesInserted++;
      }
      out2.push(cur);
      if (!isBlank(next) && i + 1 < L) {
        out2.push("");
        stats.blankLinesInserted++;
      }
      continue;
    }

    if (isListItem(cur)) {
      // start of a list block
      if (!isBlank(prevOut)) {
        out2.push("");
        stats.blankLinesInserted++;
      }
      // capture contiguous list items and renumber if ordered
      const block = [cur];
      let j = i + 1;
      while (j < L && isListLineIdx(j)) {
        block.push(out1[j]);
        j++;
      }
      const renumbered = block.map((line, idxIn) => {
        const m = line.match(/^( {0,3})(\d+)([.)])(\s+)(.*)$/);
        if (m) {
          const [, lead, , punct, , rest] = m;
          if (olStyle === "one") return `${lead}1${punct} ${rest}`;
          return `${lead}${idxIn + 1}${punct} ${rest}`;
        }
        // Unordered bullets: do not alter indentation to avoid MD005 regressions
        return line;
      });
      if (renumbered.some((l, k) => l !== block[k])) stats.listsRenumbered++;
      out2.push(...renumbered);
      // ensure blank after block if next non-list non-blank exists
      if (j < L && !isBlank(out1[j])) {
        out2.push("");
        stats.blankLinesInserted++;
      }
      i = j - 1;
      continue;
    }

    out2.push(cur);
  }

  // Finalization passes: MD041 (H1 as first line) and MD052 (reference definitions)
  let outText = out2.join("\n");

  // MD041: Ensure first non-blank line is an H1
  {
    const ls = outText.split(/\r?\n/);
    let firstIdx = 0;
    while (firstIdx < ls.length && (ls[firstIdx] || "").trim() === "") firstIdx++;
    const first = ls[firstIdx] || "";
    const isFirstH1 = /^( {0,3})#(\s+)([^#\s].*)$/.test(first);
    if (!isFirstH1) {
      // Check if first line is already a heading at any level
      const firstHeadingMatch = first.match(/^( {0,3})(#{2,6})(\s+)(.*)$/);
      if (firstHeadingMatch) {
        // Promote to H1
        ls[firstIdx] = `${firstHeadingMatch[1]}# ${firstHeadingMatch[4].trim()}`;
        stats.headingsNormalized++;
      } else {
        // Find first heading or use first non-blank line or fallback
        let title = null;
        for (const s of ls) {
          const m = s.match(/^( {0,3})#{1,6}\s+(.*)$/);
          if (m) {
            title = (m[2] || "").trim();
            break;
          }
        }
        if (!title && first.trim()) title = first.trim();
        if (!title) title = "Document";
        const prefix = firstIdx > 0 ? ls.slice(0, firstIdx) : [];
        const suffix = ls.slice(firstIdx);
        ls.splice(firstIdx, 0, `# ${title}`, "");
        stats.headingsNormalized++;
      }
      // Demote subsequent H1s
      let seenFirst = false;
      for (let i = 0; i < ls.length; i++) {
        if (/^( {0,3})#(\s+)([^#\s].*)$/.test(ls[i])) {
          if (!seenFirst) {
            seenFirst = true;
          } else {
            ls[i] = ls[i].replace(/^( {0,3})#(\s+)/, "$1## ");
            stats.h1Demoted++;
          }
        }
      }
      outText = ls.join("\n");
    }
  }

  // MD052: Add missing reference definitions at the end for used labels
  {
    const used = new Set();
    const defined = new Set();
    const ls = outText.split(/\r?\n/);
    for (const s of ls) {
      s.replace(/\[[^\]]+\]\[([^\]]+)\]/g, (m, lab) => {
        used.add(String(lab).toLowerCase());
        return m;
      });
      s.replace(/\[([^\]]+)\]\[\]/g, (m, lab) => {
        used.add(String(lab).toLowerCase());
        return m;
      });
      const def = s.match(/^\s*\[([^\]]+)\]:\s+\S+/);
      if (def) defined.add(String(def[1]).toLowerCase());
    }
    const missing = [...used].filter((u) => !defined.has(u));
    if (missing.length) {
      const arr = outText.split(/\r?\n/);
      if (arr.length && (arr[arr.length - 1] || "").trim() !== "") {
        arr.push("");
        stats.blankLinesInserted++;
      }
      for (const u of missing) {
        arr.push(`[${u}]: #`);
        stats.referenceDefsAdded++;
      }
      outText = arr.join("\n");
    }
  }

  return { text: outText, stats };
}

// ---------- Memory cache (per-proc) ----------
/** @type {Map<string, {expires:number, payload:any}>} */
const memCache = new Map();

// ---------- Learning state ----------
/**
 * Structure:
 * {
 *   extCounts: { ".ts": 123, ".js": 87, ... },
 *   ignoreHints: { "node_modules": 8, ".next": 5, ... },
 *   lastUpdated: ISO string
 * }
 */
async function loadState() {
  try {
    const buf = await fs.readFile(STATE_FILE, "utf8");
    return JSON.parse(buf);
  } catch {
    return { extCounts: {}, ignoreHints: {}, lastUpdated: new Date().toISOString() };
  }
}
async function saveState(state) {
  try {
    await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch {
    /* ignore */
  }
}
async function recordLearning(summary) {
  const state = await loadState();
  // Update extCounts
  for (const [ext, v] of Object.entries(summary.byExt || {})) {
    state.extCounts[ext] = (state.extCounts[ext] || 0) + (v.files || 0);
  }
  // Update ignore hints for heavy dirs observed in excludes or base
  const candidates = [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    ".turbo",
    "coverage",
    ".cache",
  ];
  for (const d of candidates) state.ignoreHints[d] = (state.ignoreHints[d] || 0) + 1;

  state.lastUpdated = new Date().toISOString();
  await saveState(state);
  return state;
}

// ---------- FS helpers ----------
async function readdirSafe(dir) {
  try {
    return await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}
async function statSafe(p) {
  try {
    return await fs.stat(p);
  } catch {
    return null;
  }
}

function shouldRead(file) {
  const ext = path.extname(file).toLowerCase();
  return TEXT_EXTS.has(ext);
}

function startsWithAny(relPath, prefixes) {
  if (!prefixes?.length) return true;
  return prefixes.some((p) => relPath.startsWith(p));
}

// Walk directory with auto-excludes and early stop unless deep=true
async function walk(baseDir, { excludeDirs, include, deep, hardLimit }) {
  const out = [];
  const stack = [baseDir];
  const baseLen = baseDir.length + 1;

  while (stack.length) {
    const d = stack.pop();
    const entries = await readdirSafe(d);
    for (const e of entries) {
      const full = path.join(d, e.name);
      const rel = full.slice(baseLen);
      // Skip excluded roots immediately
      if (e.isDirectory()) {
        if (
          excludeDirs.has(e.name) ||
          [...excludeDirs].some((ex) => rel.startsWith(ex + path.sep))
        ) {
          continue;
        }
        stack.push(full);
      } else {
        if (!startsWithAny(rel, include)) continue;
        out.push(full);
        if (!deep && out.length >= hardLimit) return out;
      }
    }
  }
  return out;
}

// ---------- Tool: filetag.scan ----------
server.registerTool(
  "filetag.scan",
  {
    title: "Smart Workspace Scan",
    description:
      "Walk the workspace with smart defaults, 5-min cache, sampling, and insights. Set deep=true to lift file limit.",
    inputSchema: {
      root: z.string().optional(), // base path; default CWD
      include: z.array(z.string()).optional(), // relative prefixes
      exclude: z.array(z.string()).optional(), // extra relative prefixes or dir names
      maxBytes: z.number().int().positive().optional().default(200_000),
      deep: z.boolean().optional().default(false),
      limit: z.number().int().positive().optional().default(MAX_FILES_DEFAULT),
    },
    outputSchema: {
      totalFiles: z.number(),
      totalBytes: z.number(),
      byExt: z.record(z.string(), z.object({ files: z.number(), bytes: z.number() })),
      samples: z.array(z.object({ file: z.string(), first200: z.string().optional() })),
      usedExcludes: z.array(z.string()),
      usedInclude: z.array(z.string()).optional(),
      cache: z.object({ hit: z.boolean(), ttlMs: z.number() }),
      notes: z.array(z.string()),
    },
  },
  async ({
    root,
    include = [],
    exclude = [],
    maxBytes = 200_000,
    deep = false,
    limit = MAX_FILES_DEFAULT,
  }) => {
    const base = root && path.isAbsolute(root) ? root : root ? path.join(CWD, root) : CWD;

    // unify excludes (auto + user)
    const excludeDirs = new Set([...DEFAULT_EXCLUDES, ...exclude]);

    const cacheKey = JSON.stringify({
      tool: "scan",
      base,
      include,
      exclude: [...excludeDirs].sort(),
      maxBytes,
      deep,
      limit,
    });
    const cached = memCache.get(cacheKey);
    const now = Date.now();
    if (cached && cached.expires > now) {
      // Return cached payload (must be pure JSON)
      return {
        content: [{ type: "text", text: JSON.stringify(cached.payload, null, 2) }],
        structuredContent: cached.payload,
      };
    }

    const files = await walk(base, { excludeDirs, include, deep, hardLimit: limit });

    const byExt = Object.create(null);
    let totalBytes = 0;
    const samples = [];
    const notes = [];

    for (const f of files) {
      const st = await statSafe(f);
      if (!st || !st.isFile()) continue;
      const ext = path.extname(f).toLowerCase() || "<none>";
      byExt[ext] ??= { files: 0, bytes: 0 };
      byExt[ext].files++;
      byExt[ext].bytes += st.size;
      totalBytes += st.size;

      if (shouldRead(f) && samples.length < 12) {
        try {
          const buf = await fs.readFile(f, "utf8");
          // keep up to `maxBytes`, but for reporting keep a short snippet (first 200 chars)
          samples.push({
            file: path.relative(base, f),
            first200: buf.slice(0, Math.min(maxBytes, 200)),
          });
        } catch {
          samples.push({ file: path.relative(base, f) });
        }
      }
    }

    if (!deep && files.length >= limit) {
      notes.push(`Hit soft file limit (${limit}). Re-run with deep:true to scan entire repo.`);
    }
    if (totalBytes > 200 * 1024 * 1024) {
      notes.push(
        `Large workspace (~${Math.round(totalBytes / (1024 * 1024))} MB). Keep heavy outputs out of scans or raise excludes.`,
      );
    }

    const payload = {
      totalFiles: Object.values(byExt).reduce((a, v) => a + v.files, 0),
      totalBytes,
      byExt,
      samples,
      usedExcludes: [...excludeDirs],
      usedInclude: include.length ? include : undefined,
      cache: { hit: false, ttlMs: CACHE_TTL_MS },
      notes,
    };

    // learning & cache
    await recordLearning(payload);
    memCache.set(cacheKey, { expires: now + CACHE_TTL_MS, payload });

    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
);

// ---------- Tool: filetag.report ----------
server.registerTool(
  "filetag.report",
  {
    title: "Smart Workspace Report",
    description:
      "Produce a rich report with insights and recommendations. format: 'md' (default) or 'json'.",
    inputSchema: {
      root: z.string().optional(),
      include: z.array(z.string()).optional(),
      exclude: z.array(z.string()).optional(),
      format: z.enum(["md", "json"]).optional().default("md"),
    },
    outputSchema: { markdown: z.string().optional() },
  },
  async (args, { callTool }) => {
    const scan = await callTool("filetag.scan", { ...args });
    const data = scan?.structuredContent || {};
    const state = await loadState();

    // derive primary languages by ext
    const langByExt = {
      ".ts": "TypeScript",
      ".tsx": "TypeScript/React",
      ".js": "JavaScript",
      ".jsx": "JavaScript/React",
      ".py": "Python",
      ".rb": "Ruby",
      ".go": "Go",
      ".rs": "Rust",
      ".java": "Java",
      ".kt": "Kotlin",
      ".c": "C",
      ".cc": "C++",
      ".cpp": "C++",
      ".md": "Markdown",
      ".json": "JSON",
      ".yml": "YAML",
      ".yaml": "YAML",
      ".css": "CSS",
      ".scss": "SCSS",
      ".html": "HTML",
      ".sh": "Shell",
    };
    const topExt = Object.entries(data.byExt || {})
      .sort((a, b) => b[1].files - a[1].files)
      .slice(0, 5);
    const primaryLangs = topExt.map(([ext]) => langByExt[ext] || ext);

    // suggestions
    const recs = [];
    if (data.totalFiles > 7000 && !args.deep)
      recs.push(
        "Large repo: use `deep:true` for full coverage or add more excludes to speed scans.",
      );
    if ((data.usedExcludes || []).indexOf("node_modules") === -1)
      recs.push("Add `node_modules` to excludes to avoid slow scans.");
    if (data.byExt?.[".md"]?.files > 200)
      recs.push(
        'Lots of docs: consider a docs-only filter (`include: ["docs/"]`) when you only need content scans.',
      );
    if (data.byExt?.[".ts"]?.files && !data.byExt?.[".tsx"]?.files)
      recs.push("TypeScript heavy: ensure strict TS settings and fast TS incremental builds.");
    if (Object.keys(state.extCounts || {}).length > 0)
      recs.push("Leveraging learned patterns from prior scans for better defaults.");

    if ((args.format || "md") === "json") {
      const payload = {
        summary: {
          files: data.totalFiles,
          bytes: data.totalBytes,
          primaryLanguages: primaryLangs,
        },
        excludes: data.usedExcludes,
        insights: recs,
        learned: {
          topExtensions: Object.entries(state.extCounts || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10),
        },
      };
      return {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        structuredContent: payload,
      };
    }

    const lines = [];
    lines.push(`# Workspace Report`);
    lines.push(`- **Files:** ${data.totalFiles}`);
    lines.push(`- **Bytes:** ${data.totalBytes}`);
    if (primaryLangs.length)
      lines.push(`- **Primary languages (by ext freq):** ${primaryLangs.join(", ")}`);
    lines.push(`- **Excludes in effect:** ${(data.usedExcludes || []).join(", ") || "(none)"}`);
    lines.push(``);
    lines.push(`## By Extension`);
    for (const [ext, v] of topExt) {
      lines.push(`- \`${ext}\`: ${v.files} files, ${v.bytes} bytes`);
    }
    lines.push(``);
    lines.push(`## Recommendations`);
    if (recs.length) {
      for (const r of recs) lines.push(`- ${r}`);
    } else {
      lines.push(`- No immediate issues detected.`);
    }
    lines.push(``);
    lines.push(
      `> Learned patterns ext sample: ${
        Object.keys(state.extCounts || {})
          .slice(0, 5)
          .join(", ") || "(none yet)"
      } (updated ${state.lastUpdated || "n/a"})`,
    );

    const md = lines.join("\n");
    return { content: [{ type: "text", text: md }], structuredContent: { markdown: md } };
  },
);

// ---------- Tool: filetag.analyze ----------
server.registerTool(
  "filetag.analyze",
  {
    title: "Code Analysis & Quality Metrics",
    description:
      "Analyze dependencies, comment ratio, TODOs, debug logs, async usage; returns recommendations.",
    inputSchema: {
      root: z.string().optional(),
      include: z.array(z.string()).optional(),
      exclude: z.array(z.string()).optional(),
      deep: z.boolean().optional().default(false),
      limit: z.number().int().positive().optional().default(MAX_FILES_DEFAULT),
    },
    outputSchema: {
      dependencies: z.object({
        packages: z.array(
          z.object({ name: z.string(), version: z.string().optional(), dev: z.boolean() }),
        ),
      }),
      quality: z.object({
        filesAnalyzed: z.number(),
        lines: z.number(),
        commentLines: z.number(),
        commentRatio: z.number(),
        todos: z.number(),
        debugLogs: z.number(),
        asyncTokens: z.object({ async: z.number(), await: z.number() }),
      }),
      recommendations: z.array(z.string()),
    },
  },
  async ({ root, include = [], exclude = [], deep = false, limit = MAX_FILES_DEFAULT }) => {
    const base = root && path.isAbsolute(root) ? root : root ? path.join(CWD, root) : CWD;
    const excludeDirs = new Set([...DEFAULT_EXCLUDES, ...exclude]);

    // read package.json if present
    const depsOut = { packages: [] };
    try {
      const pkgBuf = await fs.readFile(path.join(base, "package.json"), "utf8");
      const pkg = JSON.parse(pkgBuf);
      for (const [k, v] of Object.entries(pkg.dependencies || {}))
        depsOut.packages.push({ name: k, version: String(v), dev: false });
      for (const [k, v] of Object.entries(pkg.devDependencies || {}))
        depsOut.packages.push({ name: k, version: String(v), dev: true });
    } catch {
      /* ignore */
    }

    const files = await walk(base, { excludeDirs, include, deep, hardLimit: limit });

    const commentStarts = ["//", "#", "<!--", "/*"];
    const commentEnds = {
      "/*": "*/",
      "<!--": "-->",
    };

    let filesAnalyzed = 0;
    let lines = 0,
      commentLines = 0,
      todos = 0,
      debugLogs = 0,
      asyncCount = 0,
      awaitCount = 0;

    for (const f of files) {
      if (!shouldRead(f)) continue;
      let buf;
      try {
        buf = await fs.readFile(f, "utf8");
      } catch {
        continue;
      }
      filesAnalyzed++;
      const ls = buf.split(/\r?\n/);

      let inBlock = null;
      for (const rawLine of ls) {
        const line = rawLine.trim();
        lines++;

        // block comment handling
        if (inBlock) {
          commentLines++;
          if (line.includes(inBlock.end)) inBlock = null;
          continue;
        }

        // single-line comment or block open
        const start = commentStarts.find((s) => line.startsWith(s));
        if (start === "/*" || start === "<!--") {
          commentLines++;
          inBlock = { start, end: commentEnds[start] };
        } else if (start) {
          commentLines++;
        }

        // markers
        if (/TODO|FIXME|XXX/i.test(line)) todos++;
        if (/\bconsole\.log\b|\bdebugger\b/i.test(line)) debugLogs++;
        if (/\basync\s+function|\basync\s*\(/.test(line))
          asyncCount += (line.match(/\basync\b/g) || []).length;
        if (/\bawait\b/.test(line)) awaitCount += (line.match(/\bawait\b/g) || []).length;
      }
    }

    const commentRatio = lines ? commentLines / lines : 0;

    const recs = [];
    if (commentRatio < 0.05)
      recs.push("Low documentation density (<5%). Add module and function docblocks.");
    if (todos > 50)
      recs.push("High TODO/FIXME count. Triaging tech debt will improve maintainability.");
    if (debugLogs > 0)
      recs.push("Debug logs present. Gate behind env flags or remove before release.");
    if (asyncCount + awaitCount > 200)
      recs.push(
        "Heavy async usage. Ensure proper error handling with try/catch and p-retry where appropriate.",
      );
    if (!depsOut.packages.length)
      recs.push("No dependencies detected (or missing package.json). If intentional, ignore.");

    const out = {
      dependencies: depsOut,
      quality: {
        filesAnalyzed,
        lines,
        commentLines,
        commentRatio: Number(commentRatio.toFixed(4)),
        todos,
        debugLogs,
        asyncTokens: { async: asyncCount, await: awaitCount },
      },
      recommendations: recs,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(out, null, 2) }],
      structuredContent: out,
    };
  },
);

// ---------- Tool: filetag.clearCache ----------
server.registerTool(
  "filetag.clearCache",
  {
    title: "Clear caches & learning",
    description:
      "Clears in-memory scan cache. With fullReset=true also wipes learned patterns file.",
    inputSchema: {
      fullReset: z.boolean().optional().default(false),
    },
    outputSchema: {
      ok: z.boolean(),
      clearedEntries: z.number(),
      stateFileRemoved: z.boolean(),
    },
  },
  async ({ fullReset = false }) => {
    const clearedEntries = memCache.size;
    memCache.clear();
    let stateFileRemoved = false;

    if (fullReset) {
      try {
        await fs.rm(STATE_FILE, { force: true });
        stateFileRemoved = true;
      } catch {
        /* ignore */
      }
    }

    const payload = { ok: true, clearedEntries, stateFileRemoved };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
);

// ---------- Tool: markdown.fix (identify & fix) ----------
server.registerTool(
  "markdown.fix",
  {
    title: "Fix Markdown style issues (MD046: fenced code blocks)",
    description:
      "Scans Markdown files for indented code blocks and converts them to fenced code blocks. Optional dry run.",
    inputSchema: {
      root: z.string().optional(),
      include: z.array(z.string()).optional(),
      exclude: z.array(z.string()).optional(),
      languageHint: z.string().optional().default("text"),
      mode: z.enum(["md046-only", "common"]).optional().default("common"),
      olStyle: z.enum(["one", "ordered"]).optional().default("one"),
      deep: z.boolean().optional().default(false),
      limit: z.number().int().positive().optional().default(MAX_FILES_DEFAULT),
      dryRun: z.boolean().optional().default(true),
    },
    outputSchema: {
      filesVisited: z.number(),
      filesChanged: z.number(),
      changes: z.array(
        z.object({
          file: z.string(),
          issues: z.number(),
          bytesDelta: z.number(),
          detail: z.any().optional(),
        }),
      ),
      notes: z.array(z.string()).optional(),
    },
  },
  async ({
    root,
    include = [],
    exclude = [],
    languageHint = "text",
    olStyle = "one",
    deep = false,
    limit = MAX_FILES_DEFAULT,
    dryRun = true,
    mode = "common",
  }) => {
    const base = root && path.isAbsolute(root) ? root : root ? path.join(CWD, root) : CWD;
    const excludeDirs = new Set([...DEFAULT_EXCLUDES, ...exclude]);
    const files = await walk(base, { excludeDirs, include, deep, hardLimit: limit });
    const mdFiles = files.filter((f) => f.toLowerCase().endsWith(".md"));

    let filesVisited = 0;
    let filesChanged = 0;
    const changes = [];
    for (const f of mdFiles) {
      filesVisited++;
      let buf;
      try {
        buf = await fs.readFile(f, "utf8");
      } catch {
        continue;
      }
      let totalIssues = 0;
      let nextText = buf;
      let detail = {};
      // Always run MD046 conversion first (it tends to reduce noise for other passes)
      const md046 = fixMD046(nextText, languageHint);
      nextText = md046.text;
      totalIssues += md046.changes;
      detail.md046 = md046.changes;

      if (mode === "common") {
        const common = fixMarkdownCommon(nextText, { languageHint, olStyle });
        nextText = common.text;
        detail.common = common.stats;
        // approximate issue count as sum of stats fields
        totalIssues +=
          (common.stats.tabsReplaced || 0) +
          (common.stats.trailingSpacesRemoved || 0) +
          (common.stats.headingsNormalized || 0) +
          (common.stats.listMarkerSpaces || 0) +
          (common.stats.fencedLanguageAdded || 0) +
          (common.stats.blankLinesInserted || 0);
      }

      if (totalIssues > 0 && nextText !== buf) {
        if (!dryRun) {
          await fs.writeFile(f, nextText, "utf8");
        }
        filesChanged++;
        changes.push({
          file: path.relative(base, f),
          issues: totalIssues,
          bytesDelta: nextText.length - buf.length,
          detail,
        });
      }
    }

    const payload = {
      filesVisited,
      filesChanged,
      changes,
      notes: dryRun ? ["Dry run: no files written"] : [],
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
);

// ---------- bootstrap ----------
// Optional CLI mode to run tools without an MCP client
if (process.env.FILETAG_CLI === "markdown.fix") {
  const root = process.env.FILETAG_ROOT || undefined;
  const include = (process.env.FILETAG_INCLUDE || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const exclude = (process.env.FILETAG_EXCLUDE || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const languageHint = process.env.FILETAG_LANGUAGE || "text";
  const olStyle = process.env.FILETAG_OL_STYLE === "ordered" ? "ordered" : "one";
  const deep = process.env.FILETAG_DEEP === "true";
  const dryRun = process.env.FILETAG_DRYRUN !== "false"; // default true
  const limit = Number(process.env.FILETAG_LIMIT || MAX_FILES_DEFAULT);
  const mode = process.env.FILETAG_MODE === "md046-only" ? "md046-only" : "common";

  (async () => {
    try {
      const base = root && path.isAbsolute(root) ? root : root ? path.join(CWD, root) : CWD;
      const excludeDirs = new Set([...DEFAULT_EXCLUDES, ...exclude]);
      const files = await walk(base, { excludeDirs, include, deep, hardLimit: limit });
      const mdFiles = files.filter((f) => f.toLowerCase().endsWith(".md"));

      let filesVisited = 0;
      let filesChanged = 0;
      const changes = [];

      for (const f of mdFiles) {
        filesVisited++;
        let buf;
        try {
          buf = await fs.readFile(f, "utf8");
        } catch {
          continue;
        }
        let totalIssues = 0;
        let nextText = buf;
        let detail = {};

        const md046 = fixMD046(nextText, languageHint);
        nextText = md046.text;
        totalIssues += md046.changes;
        detail.md046 = md046.changes;

        if (mode === "common") {
          const common = fixMarkdownCommon(nextText, { languageHint, olStyle });
          nextText = common.text;
          detail.common = common.stats;
          totalIssues +=
            (common.stats.tabsReplaced || 0) +
            (common.stats.trailingSpacesRemoved || 0) +
            (common.stats.headingsNormalized || 0) +
            (common.stats.listMarkerSpaces || 0) +
            (common.stats.fencedLanguageAdded || 0) +
            (common.stats.blankLinesInserted || 0);
        }

        if (totalIssues > 0 && nextText !== buf) {
          if (!dryRun) await fs.writeFile(f, nextText, "utf8");
          filesChanged++;
          changes.push({
            file: path.relative(base, f),
            issues: totalIssues,
            bytesDelta: nextText.length - buf.length,
            detail,
          });
        }
      }

      // Sort by most issues
      changes.sort((a, b) => b.issues - a.issues);
      const payload = {
        filesVisited,
        filesChanged,
        changes,
        notes: dryRun ? ["Dry run: no files written"] : [],
      };

      // Human summary (top 10)
      console.error("markdown.fix summary (mode=" + mode + ", dryRun=" + dryRun + ")");
      for (const c of changes.slice(0, 10)) {
        console.error(` - ${c.file}: ${c.issues} issues (Δ ${c.bytesDelta})`);
      }

      process.stdout.write(JSON.stringify(payload, null, 2));
      process.exit(0);
    } catch (e) {
      console.error("markdown.fix CLI error:", e && e.stack ? e.stack : e);
      process.exit(1);
    }
  })();
} else {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
