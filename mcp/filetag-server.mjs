#!/usr/bin/env node
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
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

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
          samples.push({ file: path.relative(base, f), first200: buf.slice(0, maxBytes, 200) });
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

// ---------- bootstrap ----------
const transport = new StdioServerTransport();
await server.connect(transport);
