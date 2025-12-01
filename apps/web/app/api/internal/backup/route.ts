// [P0][BACKUP][API] Firestore backup endpoint
import { GoogleAuth } from "google-auth-library";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublicEndpoint } from "@fresh-schedules/api-framework";

const BackupSchema = z.object({
  collections: z.string().optional(),
});

const HEADER_NAME = "x-backup-token";

async function exportFirestore(projectId: string, bucket: string, collections?: string[]) {
  const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/datastore"] });
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default):exportDocuments`;
  const body = {
    outputUriPrefix: `gs://${bucket}/firestore-backups/${new Date().toISOString().replace(/[:.]/g, "-")}`,
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

export const POST = createPublicEndpoint({
  input: BackupSchema,
  handler: async ({ request, input }) => {
    try {
      const configuredToken = process.env.BACKUP_CRON_TOKEN;
      if (!configuredToken) {
        return NextResponse.json({ error: "Server not configured (BACKUP_CRON_TOKEN)" }, { status: 500 });
      }

      const headerToken = request.headers.get(HEADER_NAME);
      if (!headerToken || headerToken !== configuredToken) {
        return NextResponse.json({ error: "Invalid or missing backup token" }, { status: 403 });
      }

      const projectId = process.env.FIREBASE_PROJECT_ID;
      const bucket = process.env.BACKUP_BUCKET;

      if (!projectId || !bucket) {
        return NextResponse.json({ error: "Missing FIREBASE_PROJECT_ID or BACKUP_BUCKET" }, { status: 400 });
      }

      const collectionsParam = input.collections;
      const collections = collectionsParam
        ? collectionsParam.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;

      const opResult = await exportFirestore(projectId, bucket, collections);

      return NextResponse.json({ success: true, operation: opResult }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Backup failed" }, { status: 500 });
    }
  },
});

export const runtime = "nodejs";
