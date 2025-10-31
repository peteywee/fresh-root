#!/usr/bin/env node
// Enhanced MCP stdio server with improved usability, usefulness, and self-learning capabilities
// - filetag.scan: Enhanced with smart defaults and caching
// - filetag.report: Better markdown with insights and recommendations
// - filetag.analyze: New tool for code analysis and patterns
// - filetag.clearCache: Clears caches and learning data

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";

// Simple in-memory cache for self-learning
const cache = new Map();
const learning = { patterns: new Map(), recommendations: [] };

const server = new McpServer({
  name: "filetag",
  version: "0.2.0",
});

// --- helpers ---
const TEXT_EXTS = new Set([
  ".js",
  ".cjs",
  ".mjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".py",
  ".java",
  ".cpp",
  ".c",
  ".go",
  ".rs",
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".css",
  ".scss",
  ".html",
  ".txt",
  ".xml",
  ".sh",
  ".ps1",
]);

async function walk(dir, ignore = []) {
  const out = [];
  const q = [dir];
  while (q.length) {
    const d = q.pop();
    let entries = [];
    try {
      entries = await fs.readdir(d, { withFileTypes: true });
    } catch (err) {
      console.error(`Error reading directory ${d}:`, err);
      continue;
    }
    for (const e of entries) {
      const full = path.join(d, e.name);
      const rel = full.slice(dir.length + 1);
      if (ignore.some((g) => rel.startsWith(g))) continue;
      if (e.isDirectory()) q.push(full);
      else out.push(full);
    }
  }
  return out;
}

function shouldRead(file) {
  const ext = path.extname(file).toLowerCase();
  return TEXT_EXTS.has(ext);
}

function getSmartDefaults(root) {
  // Self-learning: Suggest excludes based on common patterns
  const commonIgnores = ["node_modules", ".git", "dist", "build", ".next", "__pycache__"];
  const learnedIgnores = Array.from(learning.patterns.keys()).filter((p) => p.includes("ignore"));
  return [...commonIgnores, ...learnedIgnores];
}

// --- tool: filetag.scan (enhanced) ---
server.registerTool(
  "filetag.scan",
  {
    title: "Smart workspace scan",
    description:
      "Intelligently scan workspace with smart defaults, caching, and pattern learning. Auto-excludes common dirs, caches results for 5min.",
    inputSchema: {
      root: z.string().optional(),
      include: z.array(z.string()).optional(),
      exclude: z.array(z.string()).optional(),
      deep: z.boolean().optional().default(false), // limit depth for large repos
      cache: z.boolean().optional().default(true),
    },
    outputSchema: {
      totalFiles: z.number(),
      totalBytes: z.number(),
      byExt: z.record(z.string(), z.object({ files: z.number(), bytes: z.number() })),
      samples: z.array(z.object({ file: z.string(), first200: z.string().optional() })),
      insights: z.array(z.string()),
    },
  },
  async ({ root, include = [], exclude = [], deep = false, cache: useCache = true }) => {
    const base =
      root && path.isAbsolute(root) ? root : root ? path.join(process.cwd(), root) : process.cwd();
    const cacheKey = `${base}:${include.join(",")}:${exclude.join(",")}:${deep}`;

    if (useCache && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) {
        // 5min cache
        return {
          content: [{ type: "text", text: JSON.stringify(cached.data, null, 2) }],
          structuredContent: cached.data,
        };
      }
    }

    const smartExclude = [...getSmartDefaults(base), ...exclude];
    let files = (await walk(base, smartExclude)).filter(
      (f) =>
        shouldRead(f) &&
        (include.length === 0 || include.some((p) => f.startsWith(path.join(base, p)))),
    );

    if (!deep && files.length > 1000) {
      files = files.slice(0, 1000); // Limit for usability
    }

    const byExt = Object.create(null);
    let totalBytes = 0;
    const samples = [];
    const insights = [];

    for (const f of files) {
      let stat;
      try {
        stat = await fs.stat(f);
      } catch {
        continue;
      }
      const ext = path.extname(f).toLowerCase() || "<none>";
      byExt[ext] ??= { files: 0, bytes: 0 };
      byExt[ext].files++;
      byExt[ext].bytes += stat.size;
      totalBytes += stat.size;

      if (samples.length < 12) {
        try {
          const buf = await fs.readFile(f, { encoding: "utf8" });
          samples.push({ file: path.relative(base, f), first200: buf.slice(0, 200) });
        } catch {
          samples.push({ file: path.relative(base, f) });
        }
      }
    }

    // Self-learning insights
    const topExt = Object.entries(byExt).sort((a, b) => b[1].files - a[1].files)[0];
    if (topExt) insights.push(`Primary language: ${topExt[0]} (${topExt[1].files} files)`);
    if (totalBytes > 100 * 1024 * 1024)
      insights.push("Large codebase - consider using 'deep: false' for faster scans");
    if (files.length > 500)
      insights.push("Many files - use include/exclude filters for targeted analysis");

    // Learn patterns
    for (const ext of Object.keys(byExt)) {
      learning.patterns.set(ext, (learning.patterns.get(ext) || 0) + 1);
    }

    const payload = {
      totalFiles: files.length,
      totalBytes,
      byExt,
      samples,
      insights,
    };

    if (useCache) {
      cache.set(cacheKey, { data: payload, timestamp: Date.now() });
    }

    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
);

// --- tool: filetag.report (enhanced) ---
server.registerTool(
  "filetag.report",
  {
    title: "Smart workspace report",
    description:
      "Generate insightful markdown report with recommendations and self-learned patterns.",
    inputSchema: {
      root: z.string().optional(),
      include: z.array(z.string()).optional(),
      exclude: z.array(z.string()).optional(),
      format: z.enum(["markdown", "json"]).optional().default("markdown"),
    },
    outputSchema: { report: z.string() },
  },
  async (args, { callTool }) => {
    const scan = await callTool("filetag.scan", args);
    const data = typeof scan?.structuredContent === "object" ? scan.structuredContent : undefined;

    if (!data) {
      return {
        content: [{ type: "text", text: "No data available." }],
        structuredContent: { report: "No data available." },
      };
    }

    const lines = [];
    lines.push(`# Smart Workspace Report`);
    lines.push(`- **Files:** ${data.totalFiles}`);
    lines.push(`- **Size:** ${(data.totalBytes / 1024 / 1024).toFixed(2)} MB`);
    lines.push(``);

    // Insights section
    if (data.insights?.length) {
      lines.push(`## Insights`);
      for (const insight of data.insights) {
        lines.push(`- ${insight}`);
      }
      lines.push(``);
    }

    // Recommendations based on learning
    lines.push(`## Recommendations`);
    const recs = [];
    if (data.totalFiles > 1000) recs.push("Consider breaking into smaller modules");
    if (Object.keys(data.byExt).length > 10)
      recs.push("Diverse tech stack - ensure consistent tooling");
    const learned = Array.from(learning.patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    if (learned.length)
      recs.push(
        `Popular extensions: ${learned.map(([ext, count]) => `${ext} (${count}x)`).join(", ")}`,
      );
    if (recs.length === 0) recs.push("Codebase looks well-structured!");
    for (const rec of recs) lines.push(`- ${rec}`);
    lines.push(``);

    lines.push(`## File Types`);
    const entries = Object.entries(data.byExt).sort((a, b) => b[1].files - a[1].files);
    for (const [ext, v] of entries) {
      lines.push(`- \`${ext}\`: ${v.files} files, ${(v.bytes / 1024).toFixed(1)} KB`);
    }

    if (data.samples?.length) {
      lines.push(``);
      lines.push(`## Sample Files`);
      for (const s of data.samples) {
        lines.push(`### ${s.file}`);
        if (s.first200) lines.push(`\`\`\`\n${s.first200}\n\`\`\``);
      }
    }

    const report = lines.join("\n");
    return {
      content: [{ type: "text", text: report }],
      structuredContent: { report },
    };
  },
);

// --- tool: filetag.analyze (new) ---
server.registerTool(
  "filetag.analyze",
  {
    title: "Code analysis",
    description: "Analyze code patterns, dependencies, and quality metrics using learned patterns.",
    inputSchema: {
      root: z.string().optional(),
      focus: z.enum(["deps", "quality", "patterns"]).optional().default("patterns"),
    },
    outputSchema: {
      analysis: z.record(z.string(), z.any()),
      recommendations: z.array(z.string()),
    },
  },
  async ({ root, focus = "patterns" }) => {
    const base =
      root && path.isAbsolute(root) ? root : root ? path.join(process.cwd(), root) : process.cwd();
    const files = (await walk(base, getSmartDefaults(base))).filter(shouldRead);

    const analysis = {};
    const recommendations = [];

    if (focus === "deps") {
      // Simple dependency analysis
      const deps = new Set();
      for (const f of files) {
        try {
          const content = await fs.readFile(f, "utf8");
          const matches = content.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g) || [];
          matches.forEach((m) => {
            const dep = m.match(/from\s+['"]([^'"]+)['"]/);
            if (dep && !dep[1].startsWith(".")) deps.add(dep[1]);
          });
        } catch {}
      }
      analysis.dependencies = Array.from(deps);
      if (deps.size > 20)
        recommendations.push("High dependency count - consider bundling or tree-shaking");
    } else if (focus === "quality") {
      // Basic quality metrics
      let totalLines = 0,
        commentLines = 0,
        emptyLines = 0;
      for (const f of files.slice(0, 100)) {
        // Sample for performance
        try {
          const content = await fs.readFile(f, "utf8");
          const lines = content.split("\n");
          totalLines += lines.length;
          commentLines += lines.filter(
            (l) => l.trim().startsWith("//") || l.trim().startsWith("/*"),
          ).length;
          emptyLines += lines.filter((l) => !l.trim()).length;
        } catch {}
      }
      analysis.quality = {
        totalLines,
        commentRatio: commentLines / totalLines,
        density: (totalLines - emptyLines) / totalLines,
      };
      if (analysis.quality.commentRatio < 0.1)
        recommendations.push("Low comment ratio - add more documentation");
    } else {
      // patterns
      const patterns = {};
      for (const f of files.slice(0, 50)) {
        try {
          const content = await fs.readFile(f, "utf8");
          // Simple pattern detection
          if (content.includes("TODO")) patterns.todos = (patterns.todos || 0) + 1;
          if (content.includes("console.log")) patterns.debugLogs = (patterns.debugLogs || 0) + 1;
          if (content.includes("async")) patterns.asyncUsage = (patterns.asyncUsage || 0) + 1;
        } catch {}
      }
      analysis.patterns = patterns;
      if (patterns.debugLogs > 10)
        recommendations.push("Many debug logs found - clean up for production");
    }

    // Self-learning: Store analysis for future recommendations
    learning.recommendations = [...new Set([...learning.recommendations, ...recommendations])];

    return {
      content: [{ type: "text", text: JSON.stringify({ analysis, recommendations }, null, 2) }],
      structuredContent: { analysis, recommendations },
    };
  },
);

// --- tool: filetag.clearCache ---
server.registerTool(
  "filetag.clearCache",
  {
    title: "Clear caches and learning data",
    description: "Clears scan caches and resets learned patterns for fresh analysis.",
    inputSchema: {},
    outputSchema: {
      cleared: z.boolean(),
      stats: z.object({ cacheSize: z.number(), patternsLearned: z.number() }),
    },
  },
  async () => {
    const stats = { cacheSize: cache.size, patternsLearned: learning.patterns.size };
    cache.clear();
    learning.patterns.clear();
    learning.recommendations = [];
    return {
      content: [{ type: "text", text: JSON.stringify({ cleared: true, stats }, null, 2) }],
      structuredContent: { cleared: true, stats },
    };
  },
);

// --- start stdio transport ---
const transport = new StdioServerTransport();
await server.connect(transport);
