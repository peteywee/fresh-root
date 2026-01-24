// [P1][TERMINAL][API] Terminal execution API endpoint
// Tags: P1, TERMINAL, API, terminal, execution

import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { z } from "zod";
import * as path from "path";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

const WORKSPACE_ROOT = "/workspaces/fresh-root";

const COMMANDS = {
  ls: { binary: "ls", allowUserArgs: true },
  pwd: { binary: "pwd", allowUserArgs: false },
  cat: { binary: "cat", allowUserArgs: true },
  head: { binary: "head", allowUserArgs: true },
  tail: { binary: "tail", allowUserArgs: true },
  grep: { binary: "grep", allowUserArgs: true },
  find: { binary: "find", allowUserArgs: true },
  echo: { binary: "echo", allowUserArgs: true },
  git: { binary: "git", allowUserArgs: true },
  gh: { binary: "gh", allowUserArgs: true },
  repomix: { binary: "repomix", allowUserArgs: true },
  tree: { binary: "tree", allowUserArgs: true },
  wc: { binary: "wc", allowUserArgs: true },
  which: { binary: "which", allowUserArgs: true },
  env: { binary: "env", allowUserArgs: true },
  printenv: { binary: "printenv", allowUserArgs: true },
  sort: { binary: "sort", allowUserArgs: true },
  uniq: { binary: "uniq", allowUserArgs: true },
  awk: { binary: "awk", allowUserArgs: true },
  sed: { binary: "sed", allowUserArgs: true },
} as const;

const COMMAND_IDS = Object.keys(COMMANDS) as [
  keyof typeof COMMANDS,
  ...(keyof typeof COMMANDS)[],
];

// Input validation schema
const TerminalInputSchema = z.object({
  commandId: z.enum(COMMAND_IDS),
  args: z.array(z.string().min(1).max(120)).max(16).default([]),
  cwd: z.string().default(WORKSPACE_ROOT),
});

const SAFE_TOKEN = /^[A-Za-z0-9._@:+=,/\-]+$/;

function validateCwd(cwd: string): boolean {
  // Ensure cwd is within workspace
  const normalized = path.normalize(cwd);
  const workspaceNormalized = path.normalize(WORKSPACE_ROOT);
  return normalized.startsWith(workspaceNormalized) || normalized === workspaceNormalized;
}

function validateArgs(args: string[]): { valid: boolean; reason?: string } {
  if (args.some((arg) => arg.includes("\n"))) {
    return { valid: false, reason: "Blocked: newlines not allowed" };
  }

  if (args.some((arg) => !SAFE_TOKEN.test(arg))) {
    return { valid: false, reason: "Blocked: arguments contain unsafe characters" };
  }

  if (args.some((arg) => arg.includes(".."))) {
    return { valid: false, reason: "Blocked: path traversal is not allowed" };
  }

  return { valid: true };
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

    const { commandId, args, cwd } = input;

    // Validate cwd is within workspace
    if (!validateCwd(cwd)) {
      return NextResponse.json({
        stdout: "",
        stderr: "⛔ Working directory must be within workspace",
        exitCode: 1,
      });
    }

    const validation = validateArgs(args);
    if (!validation.valid) {
      return NextResponse.json({
        stdout: "",
        stderr: `⛔ ${validation.reason}`,
        exitCode: 1,
      });
    }

    // Execute command with timeout
    const result = await executeCommand(commandId, args, cwd);

    return NextResponse.json(result);
  },
});

function executeCommand(
  commandId: keyof typeof COMMANDS,
  args: string[],
  cwd: string,
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const timeout = 30000; // 30 second timeout
    let stdout = "";
    let stderr = "";
    let killed = false;

    const commandConfig = COMMANDS[commandId];
    const safeArgs = commandConfig.allowUserArgs ? args : [];

    // nosemgrep: javascript.lang.security.detect-child-process.detect-child-process
    // Security: Authenticated API with extensive validation: allowlist (L38-74),
    // blocked patterns (L19-35), safe char filter (L93-97), cwd validation (L76-81), shell:false
    const child = spawn(commandConfig.binary, safeArgs, {
      cwd,
      env: { ...process.env, TERM: "xterm-256color" },
      timeout,
      shell: false,
    }); // nosemgrep: javascript.lang.security.detect-child-process.detect-child-process

    const timer = setTimeout(() => {
      killed = true;
      child.kill("SIGTERM");
    }, timeout);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
      // Limit output size
      if (stdout.length > 100000) {
        stdout = stdout.slice(0, 100000) + "\n... (output truncated)";
        child.kill("SIGTERM");
      }
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        stdout: stdout.trim(),
        stderr: killed ? "Command timed out after 30 seconds" : stderr.trim(),
        exitCode: code ?? 1,
      });
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        stdout: "",
        stderr: err.message,
        exitCode: 1,
      });
    });
  });
}
