// [P0][BACKUP][API] Firestore backup endpoint
import { GoogleAuth } from "google-auth-library";
import { NextRequest } from "next/server";
import { z } from "zod";

import { withSecurity } from "../../_shared/middleware";
import { badRequest, serverError, ok } from "../../_shared/validation";

// Schema for backup request
const BackupSchema = z.object({
  collections: z.string().optional(),
});

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

export const POST = withSecurity(async (req: NextRequest) => {
  try {
    // Validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const result = BackupSchema.safeParse(body);
    if (!result.success) {
      return badRequest("Validation failed", result.error.issues);
    }

    const configuredToken = process.env.BACKUP_CRON_TOKEN;
    if (!configuredToken) {
      return serverError("Server not configured (BACKUP_CRON_TOKEN)");
    }

    const headerToken = req.headers.get(HEADER_NAME);
    if (!headerToken || headerToken !== configuredToken) {
      return badRequest("Invalid or missing backup token", null, "FORBIDDEN");
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const bucket = process.env.BACKUP_BUCKET;

    if (!projectId || !bucket) {
      return badRequest("Missing FIREBASE_PROJECT_ID or BACKUP_BUCKET");
    }

    const collectionsParam = req.nextUrl.searchParams.get("collections");
    const collections = collectionsParam
      ? collectionsParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    const opResult = await exportFirestore(projectId, bucket, collections);

    return ok({ success: true, operation: opResult });
  } catch (error) {
    return serverError(error instanceof Error ? error.message : "Backup failed");
  }
});

export const runtime = "nodejs"; // Ensure Node runtime (not edge)
