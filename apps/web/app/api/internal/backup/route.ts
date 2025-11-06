// [P1][OPS][BACKUP] Internal endpoint to trigger Firestore export
// Tags: P1, OPS, BACKUP, FIRESTORE
import { GoogleAuth } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";

// Security: protect with static header token set in env and Cloud Scheduler
const HEADER_NAME = "x-backup-token";

async function exportFirestore(projectId: string, bucket: string, collections?: string[]) {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/datastore"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default):exportDocuments`;
  const body = {
    outputUriPrefix: `gs://${bucket}/firestore-backups/${new Date().toISOString().replace(/[:.]/g, "-")}`,
    // Empty or omitted collectionIds means export all collections
    // If provided, export subset
    collectionIds: collections && collections.length > 0 ? collections : undefined,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Export failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const configuredToken = process.env.BACKUP_CRON_TOKEN;
    if (!configuredToken) {
      return NextResponse.json(
        { error: "Server not configured (BACKUP_CRON_TOKEN)" },
        { status: 500 },
      );
    }

    const headerToken = req.headers.get(HEADER_NAME);
    if (!headerToken || headerToken !== configuredToken) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const bucket = process.env.BACKUP_BUCKET;

    if (!projectId || !bucket) {
      return NextResponse.json(
        { error: "Missing FIREBASE_PROJECT_ID or BACKUP_BUCKET" },
        { status: 400 },
      );
    }

    const collectionsParam = req.nextUrl.searchParams.get("collections");
    const collections = collectionsParam
      ? collectionsParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    const result = await exportFirestore(projectId, bucket, collections);

    return NextResponse.json({ success: true, operation: result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export const runtime = "nodejs"; // Ensure Node runtime (not edge)
