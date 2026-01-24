// [P1][TERMINAL][API] Terminal execution API endpoint
// Tags: P1, TERMINAL, API, terminal, execution

import { NextResponse } from "next/server";
import { z } from "zod";
import * as path from "path";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

const WORKSPACE_ROOT = "/workspaces/fresh-root";

// Input validation schema
const TerminalInputSchema = z.object({
  cwd: z.string().default(WORKSPACE_ROOT),
});

function validateCwd(cwd: string): boolean {
  // Ensure cwd is within workspace
  const normalized = path.normalize(cwd);
  const workspaceNormalized = path.normalize(WORKSPACE_ROOT);
  return normalized.startsWith(workspaceNormalized) || normalized === workspaceNormalized;
}

export const POST = createAuthenticatedEndpoint({
  input: TerminalInputSchema,
  handler: async ({ input }: { input: z.infer<typeof TerminalInputSchema> }) => {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_TERMINAL_API !== "true") {
      return NextResponse.json({
        stdout: "",
        stderr: "⛔ Terminal API is disabled in production",
        exitCode: 1,
      }, { status: 403 });
    }

    const { cwd } = input;

    // Validate cwd is within workspace
    if (!validateCwd(cwd)) {
      return NextResponse.json({
        stdout: "",
        stderr: "⛔ Working directory must be within workspace",
        exitCode: 1,
      });
    }

    return NextResponse.json({
      stdout: "",
      stderr: "⛔ Terminal execution is disabled in this environment",
      exitCode: 1,
    }, { status: 501 });
  },
});
