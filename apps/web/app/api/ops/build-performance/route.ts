// [P1][OPS][API] CI build performance metrics endpoint
// Tags: P1, OPS, API, ci, performance, metrics
import { createAdminEndpoint } from "@fresh-schedules/api-framework";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

interface BuildPerformanceEntry {
  timestamp: string;
  repository: string;
  ref: string;
  sha: string;
  runId: string;
  runAttempt: string;
  installSeconds: number;
  buildSeconds: number;
  sdkSeconds: number;
  totalSeconds: number;
  cacheHit: string;
}

function safeParseJsonLine(line: string): BuildPerformanceEntry | null {
  try {
    const parsed = JSON.parse(line) as BuildPerformanceEntry;

    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.timestamp !== "string") return null;

    return parsed;
  } catch {
    return null;
  }
}

function parseJsonl(content: string, limit: number): BuildPerformanceEntry[] {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return lines
    .map(safeParseJsonLine)
    .filter((e): e is BuildPerformanceEntry => e !== null)
    .slice(-limit)
    .reverse();
}

async function fetchBuildPerformanceLogFromGitHub(params: {
  owner: string;
  repo: string;
  ref: string;
  token: string;
}): Promise<string> {
  const url = new URL(
    `https://api.github.com/repos/${params.owner}/${params.repo}/contents/docs/metrics/build-performance.log`,
  );
  url.searchParams.set("ref", params.ref);

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${params.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`GitHub fetch failed: ${res.status}`);
  }

  const data = (await res.json()) as { content?: string; encoding?: string };
  if (!data.content || data.encoding !== "base64") {
    throw new Error("GitHub response missing base64 content");
  }

  return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8");
}

export const GET = createAdminEndpoint({
  handler: async ({ request, input: _input, context, params: _params }) => {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const limit = Math.max(1, Math.min(50, Number(limitParam ?? 10) || 10));

    const projectRoot = process.cwd();
    const logPath = path.join(projectRoot, "docs", "metrics", "build-performance.log");

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_METRICS_OWNER || "peteywee";
    const repo = process.env.GITHUB_METRICS_REPO || "fresh-root";
    const ref = process.env.GITHUB_METRICS_REF || "main";

    try {
      let content: string;
      let source: "github" | "file";

      if (token) {
        content = await fetchBuildPerformanceLogFromGitHub({ owner, repo, ref, token });
        source = "github";
      } else {
        // Fallback: local file (may be stale until deploy)
        content = await fs.readFile(logPath, "utf-8");
        source = "file";
      }

      const entries = parseJsonl(content, limit);

      return NextResponse.json(
        {
          ok: true,
          source,
          path: "docs/metrics/build-performance.log",
          orgId: context.org?.orgId,
          entries,
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";

      return NextResponse.json(
        {
          ok: false,
          source: token ? "github" : "file",
          path: "docs/metrics/build-performance.log",
          orgId: context.org?.orgId,
          entries: [],
          error: message,
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }
  },
});
