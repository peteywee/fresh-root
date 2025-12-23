// [P1][OPS][API] CI build performance metrics endpoint
// Tags: P1, OPS, API, ci, performance, metrics
import { createAdminEndpoint } from "@fresh-schedules/api-framework";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import * as path from "path";
import { getFirestore } from "firebase-admin/firestore";

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
    if (res.status === 404) {
      return "";
    }
    throw new Error(`GitHub fetch failed: ${res.status}`);
  }

  const data = (await res.json()) as { content?: string; encoding?: string };
  if (!data.content || data.encoding !== "base64") {
    throw new Error("GitHub response missing base64 content");
  }

  return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8");
}

function isFsNotFoundError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  if (!("code" in err)) return false;
  return (err as { code?: unknown }).code === "ENOENT";
}

export const GET = createAdminEndpoint({
  handler: async ({ request, input: _input, context: _context, params: _params }) => {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const limit = Math.max(1, Math.min(50, Number(limitParam ?? 10) || 10));

    const projectRoot = process.cwd();
    const logPath = path.join(projectRoot, "docs", "metrics", "build-performance.log");

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_METRICS_OWNER || "peteywee";
    const repo = process.env.GITHUB_METRICS_REPO || "fresh-root";
    const ref = process.env.GITHUB_METRICS_REF || "main";

    let content = "";
    const source: "github" | "file" = token ? "github" : "file";

    try {
      if (token) {
        content = await fetchBuildPerformanceLogFromGitHub({ owner, repo, ref, token });
      } else {
        // Fallback: local file (may be stale until deploy)
        content = await fs.readFile(logPath, "utf-8");
      }
    } catch (err) {
      // Missing log is a normal "no data yet" case.
      if (isFsNotFoundError(err)) {
        content = "";
      } else {
        return NextResponse.json(
          {
            ok: false,
            data: [],
            meta: {
              source,
              limit,
              error: "Failed to load build performance metrics",
            },
          },
          {
            status: 500,
            headers: {
              "Cache-Control": "no-store",
            },
          },
        );
      }
    }

    const entries = parseJsonl(content, limit);

    return NextResponse.json(
      {
        ok: true,
        data: entries,
        meta: {
          source,
          limit,
          total: entries.length,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  },
});

// POST: Write new build performance entry to Firestore
// NOTE: Uses manual validation. Should be refactored to use SDK factory input pattern
// once @fresh-schedules/types exports are working (see RED_TEAM_ANALYSIS.md)
export const POST = createAdminEndpoint({
  handler: async ({ request, input: _input, context: _context, params: _params }) => {
    const db = getFirestore();
    const body = await request.json() as Record<string, unknown>;

    // Validate required fields with type checking
    const requiredFields = [
      "timestamp",
      "repository",
      "ref",
      "sha",
      "runId",
      "runAttempt",
      "installSeconds",
      "buildSeconds",
      "sdkSeconds",
      "totalSeconds",
      "cacheHit",
    ];

    const missing = requiredFields.filter((field) => !(field in body));
    if (missing.length > 0) {
      return NextResponse.json(
        { ok: false, error: `Missing fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    try {
      // Validate timestamp is ISO datetime using Date.parse to avoid weak regex
      const timestamp = String(body.timestamp);
      const parsedTimestamp = Date.parse(timestamp);
      if (!Number.isFinite(parsedTimestamp)) {
        return NextResponse.json(
          { ok: false, error: "timestamp must be ISO datetime format" },
          { status: 400 }
        );
      }

      // Coerce numbers and validate non-negative
      const installSeconds = Number(body.installSeconds);
      const buildSeconds = Number(body.buildSeconds);
      const sdkSeconds = Number(body.sdkSeconds);
      const totalSeconds = Number(body.totalSeconds);

      if (
        installSeconds < 0 ||
        buildSeconds < 0 ||
        sdkSeconds < 0 ||
        totalSeconds < 0 ||
        isNaN(installSeconds) ||
        isNaN(buildSeconds) ||
        isNaN(sdkSeconds) ||
        isNaN(totalSeconds)
      ) {
        return NextResponse.json(
          { ok: false, error: "Duration fields must be non-negative numbers" },
          { status: 400 }
        );
      }

      // Validate SHA is 40 chars (git full hash)
      const sha = String(body.sha);
      if (!/^[a-f0-9]{40}$/.test(sha)) {
        return NextResponse.json(
          { ok: false, error: "sha must be 40-character hex string (git full hash)" },
          { status: 400 }
        );
      }

      const entry = {
        timestamp,
        repository: String(body.repository),
        ref: String(body.ref),
        sha,
        runId: String(body.runId),
        runAttempt: String(body.runAttempt),
        installSeconds,
        buildSeconds,
        sdkSeconds,
        totalSeconds,
        cacheHit: body.cacheHit === "true" || body.cacheHit === true,
        createdAt: Date.now(),
      };

      const docRef = await db
        .collection("_metrics/build-performance/entries")
        .add(entry);

      return NextResponse.json(
        { ok: true, id: docRef.id },
        { status: 201 }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        { ok: false, error: message },
        { status: 500 }
      );
    }
  },
});
