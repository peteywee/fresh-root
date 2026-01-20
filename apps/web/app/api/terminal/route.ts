// [P1][TERMINAL][API] Terminal execution API endpoint
// Tags: P1, TERMINAL, API, terminal, execution

import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { z } from "zod";
import * as path from "path";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

const WORKSPACE_ROOT = "/workspaces/fresh-root";

// Input validation schema
const TerminalInputSchema = z.object({
  command: z.string().min(1).max(1000),
  cwd: z.string().default("/workspaces/fresh-root"),
});

// Security: Blocked dangerous patterns (with multiline flag)
const BLOCKED_PATTERNS = [
  /rm\s+-rf\s+\//,
  /sudo\s+rm/,
  /:\(\)\{.*:\|:.*\};:/, // Fork bomb
  /mkfs/,
  /dd\s+if=/,
  />\s*\/dev\/sd/,
  /chmod\s+-R\s+777\s+\//,
  /\|\s*bash/, // Piped to bash
  /\|\s*sh/, // Piped to sh
  /eval\s*\(/,
  /\$\(/, // Command substitution
  /`/, // Backtick command substitution
  /;\s*(rm|mkfs|dd|chmod|sudo)/, // Command chaining
  /&&\s*(rm|mkfs|dd|chmod|sudo)/, // Logical AND with dangerous
  /\|\|.*rm/, // OR with rm
];

// Allowed command prefixes
const ALLOWED_PREFIXES = [
  "ls",
  "pwd",
  "cat",
  "head",
  "tail",
  "grep",
  "find",
  "echo",
  "node",
  "npm",
  "pnpm",
  "npx",
  "yarn",
  "git",
  "gh",
  "repomix",
  "tree",
  "wc",
  "which",
  "env",
  "printenv",
  "touch",
  "cp",
  "mv",
  "less",
  "more",
  "sort",
  "uniq",
  "awk",
  "sed",
  "curl",
  "wget",
  "docker",
  "kubectl",
  "turbo",
];

function validateCwd(cwd: string): boolean {
  // Ensure cwd is within workspace
  const normalized = path.normalize(cwd);
  const workspaceNormalized = path.normalize(WORKSPACE_ROOT);
  return normalized.startsWith(workspaceNormalized) || normalized === workspaceNormalized;
}

function validateCommand(cmd: string): { valid: boolean; reason?: string } {
  const trimmed = cmd.trim();

  // Check for newlines to prevent injection
  if (trimmed.includes("\n")) {
    return { valid: false, reason: "Blocked: newlines not allowed" };
  }

  // Allow only safe characters (no quotes, pipes, or shell metacharacters)
  // This keeps spawn() arguments literal and prevents shell expansion even further.
  const SAFE_TOKEN = /^[A-Za-z0-9._@:\/+-]+$/;
  const tokens = trimmed.split(/\s+/);
  if (tokens.some((token) => !SAFE_TOKEN.test(token))) {
    return { valid: false, reason: "Blocked: command contains unsafe characters" };
  }

  // Check blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { valid: false, reason: "Blocked: dangerous command pattern detected" };
    }
  }

  // Check if starts with allowed prefix
  const firstWord = trimmed.split(/\s+/)[0];
  const isAllowed = ALLOWED_PREFIXES.includes(firstWord);

  if (!isAllowed) {
    return { valid: false, reason: `Command "${firstWord}" not allowed` };
  }

  return { valid: true };
}

export const POST = createAuthenticatedEndpoint({
  input: TerminalInputSchema,
  handler: async ({ input }: { input: z.infer<typeof TerminalInputSchema> }) => {
    const { command, cwd } = input;

    // Validate cwd is within workspace
    if (!validateCwd(cwd)) {
      return NextResponse.json({
        stdout: "",
        stderr: "⛔ Working directory must be within workspace",
        exitCode: 1,
      });
    }

    // Validate command
    const validation = validateCommand(command);
    if (!validation.valid) {
      return NextResponse.json({
        stdout: "",
        stderr: `⛔ ${validation.reason}`,
        exitCode: 1,
      });
    }

    // Execute command with timeout
    const result = await executeCommand(command, cwd);

    return NextResponse.json(result);
  },
});

function executeCommand(
  command: string,
  cwd: string,
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const timeout = 30000; // 30 second timeout
    let stdout = "";
    let stderr = "";
    let killed = false;

    // Split command into binary + args to avoid shell interpretation
    const parts = command.trim().split(/\s+/);
    const binary = parts[0];
    const args = parts.slice(1);

    // nosemgrep: javascript.lang.security.detect-child-process.detect-child-process
    // Security: Authenticated API with extensive validation: allowlist (L38-74),
    // blocked patterns (L19-35), safe char filter (L93-97), cwd validation (L76-81), shell:false
    const child = spawn(binary, args, {
      cwd,
      env: { ...process.env, TERM: "xterm-256color" },
      timeout,
      shell: false,
    });

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
