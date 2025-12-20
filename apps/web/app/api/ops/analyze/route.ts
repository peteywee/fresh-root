// [P1][OPS][API] Repomix codebase analysis endpoint
// Tags: P1, OPS, API, repomix, analysis
import { createAdminEndpoint } from "@fresh-schedules/api-framework";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

interface FileStats {
  totalFiles: number;
  totalLines: number;
  byExtension: Record<string, { files: number; lines: number }>;
}

interface CodebaseAnalysis {
  timestamp: string;
  repository: string;
  stats: FileStats;
  structure: {
    apps: string[];
    packages: string[];
    topLevelFiles: string[];
  };
  health: {
    hasTests: boolean;
    hasCI: boolean;
    hasTypeScript: boolean;
    hasLinting: boolean;
    hasSecurity: boolean;
  };
  metrics: {
    apiRoutes: number;
    components: number;
    schemas: number;
    testFiles: number;
  };
}

async function countLines(filePath: string): Promise<number> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return content.split("\n").length;
  } catch {
    return 0;
  }
}

async function walkDir(
  dir: string,
  baseDir: string,
  stats: FileStats,
  depth = 0
): Promise<void> {
  if (depth > 10) return; // Prevent too deep recursion

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip node_modules, .git, .next, dist, coverage
      if (
        entry.name === "node_modules" ||
        entry.name === ".git" ||
        entry.name === ".next" ||
        entry.name === "dist" ||
        entry.name === "coverage" ||
        entry.name === ".turbo" ||
        entry.name === "pnpm-lock.yaml"
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        await walkDir(fullPath, baseDir, stats, depth + 1);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase() || "(no ext)";

        // Only count code files
        const codeExtensions = [
          ".ts",
          ".tsx",
          ".js",
          ".jsx",
          ".json",
          ".md",
          ".yml",
          ".yaml",
          ".css",
          ".scss",
          ".html",
          ".mjs",
          ".cjs",
        ];

        if (codeExtensions.includes(ext)) {
          const lines = await countLines(fullPath);
          stats.totalFiles++;
          stats.totalLines += lines;

          if (!stats.byExtension[ext]) {
            stats.byExtension[ext] = { files: 0, lines: 0 };
          }
          stats.byExtension[ext].files++;
          stats.byExtension[ext].lines += lines;
        }
      }
    }
  } catch {
    // Directory might not exist or be readable
  }
}

async function countPatternFiles(baseDir: string, pattern: string): Promise<number> {
  let count = 0;

  async function walk(dir: string, depth = 0): Promise<void> {
    if (depth > 10) return;

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (
          entry.name === "node_modules" ||
          entry.name === ".git" ||
          entry.name === ".next"
        ) {
          continue;
        }

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await walk(fullPath, depth + 1);
        } else if (entry.isFile()) {
          if (entry.name.includes(pattern)) {
            count++;
          }
        }
      }
    } catch {
      // Ignore errors
    }
  }

  await walk(baseDir);
  return count;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listDirectories(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

async function listFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isFile()).map((e) => e.name);
  } catch {
    return [];
  }
}

/**
 * GET /api/ops/analyze
 * Deep codebase analysis using file system traversal
 * Returns comprehensive metrics about the codebase structure
 */
export const GET = createAdminEndpoint({
  handler: async ({ request: _request, input: _input, context: _context, params: _params }) => {
    const startTime = Date.now();

    // Determine project root (works in dev and production)
    const projectRoot = process.cwd();

    const stats: FileStats = {
      totalFiles: 0,
      totalLines: 0,
      byExtension: {},
    };

    // Walk the codebase
    await walkDir(projectRoot, projectRoot, stats);

    // Get structure info
    const apps = await listDirectories(path.join(projectRoot, "apps"));
    const packages = await listDirectories(path.join(projectRoot, "packages"));
    const topLevelFiles = await listFiles(projectRoot);

    // Health checks
    const [hasTests, hasCI, hasTypeScript, hasLinting, hasSecurity] = await Promise.all([
      fileExists(path.join(projectRoot, "vitest.config.ts")),
      fileExists(path.join(projectRoot, ".github/workflows/ci.yml")),
      fileExists(path.join(projectRoot, "tsconfig.json")),
      fileExists(path.join(projectRoot, "eslint.config.mjs")),
      fileExists(path.join(projectRoot, ".github/workflows/semgrep.yml")),
    ]);

    // Count specific patterns
    const [apiRoutes, components, schemas, testFiles] = await Promise.all([
      countPatternFiles(path.join(projectRoot, "apps/web/app/api"), "route.ts"),
      countPatternFiles(path.join(projectRoot, "apps/web"), ".tsx"),
      countPatternFiles(path.join(projectRoot, "packages/types/src"), ".ts"),
      countPatternFiles(projectRoot, ".test."),
    ]);

    const analysis: CodebaseAnalysis = {
      timestamp: new Date().toISOString(),
      repository: "fresh-root",
      stats,
      structure: {
        apps,
        packages,
        topLevelFiles: topLevelFiles.filter(
          (f) => !f.startsWith(".") && f !== "node_modules"
        ),
      },
      health: {
        hasTests,
        hasCI,
        hasTypeScript,
        hasLinting,
        hasSecurity,
      },
      metrics: {
        apiRoutes,
        components,
        schemas,
        testFiles,
      },
    };

    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        ...analysis,
        _meta: {
          analysisTimeMs: duration,
          cached: false,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=300", // Cache for 5 minutes
        },
      }
    );
  },
});
