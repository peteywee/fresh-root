// [P1][API][CODE] Terminal execution API endpoint
// Tags: P1, API, CODE, terminal, execution

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { z } from 'zod';
import * as path from 'path';

const WORKSPACE_ROOT = '/workspaces/fresh-root';

// Input validation schema
const TerminalInputSchema = z.object({
  command: z.string().min(1).max(1000),
  cwd: z.string().default('/workspaces/fresh-root'),
});

// Security: Blocked dangerous patterns (with multiline flag)
const BLOCKED_PATTERNS = [
  /rm\s+-rf\s+\//,
  /sudo\s+rm/,
  /:\(\)\{.*:\|:.*\};:/,  // Fork bomb
  /mkfs/,
  /dd\s+if=/,
  />\s*\/dev\/sd/,
  /chmod\s+-R\s+777\s+\//,
  /\|\s*bash/,  // Piped to bash
  /\|\s*sh/,  // Piped to sh
  /eval\s*\(/,
  /\$\(/,  // Command substitution
  /`/,  // Backtick command substitution
  /;\s*(rm|mkfs|dd|chmod|sudo)/,  // Command chaining
  /&&\s*(rm|mkfs|dd|chmod|sudo)/,  // Logical AND with dangerous
  /\|\|.*rm/,  // OR with rm
];

// Allowed command prefixes
const ALLOWED_PREFIXES = [
  'ls', 'pwd', 'cat', 'head', 'tail', 'grep', 'find', 'echo',
  'node', 'npm', 'pnpm', 'npx', 'yarn',
  'git', 'gh',
  'repomix',
  'tree', 'wc', 'which', 'env', 'printenv',
  'touch', 'cp', 'mv',
  'less', 'more', 'sort', 'uniq', 'awk', 'sed',
  'curl', 'wget',
  'docker', 'kubectl',
  'turbo',
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
  if (trimmed.includes('\n')) {
    return { valid: false, reason: 'Blocked: newlines not allowed' };
  }

  // Check blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { valid: false, reason: 'Blocked: dangerous command pattern detected' };
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = TerminalInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { stdout: '', stderr: 'Invalid input', exitCode: 1 },
        { status: 400 }
      );
    }

    const { command, cwd } = parsed.data;

    // Validate cwd is within workspace
    if (!validateCwd(cwd)) {
      return NextResponse.json({
        stdout: '',
        stderr: '⛔ Working directory must be within workspace',
        exitCode: 1,
      });
    }

    // Validate command
    const validation = validateCommand(command);
    if (!validation.valid) {
      return NextResponse.json({
        stdout: '',
        stderr: `⛔ ${validation.reason}`,
        exitCode: 1,
      });
    }

    // Execute command with timeout
    const result = await executeCommand(command, cwd);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Terminal API error:', error);
    return NextResponse.json(
      { stdout: '', stderr: 'Internal server error', exitCode: 1 },
      { status: 500 }
    );
  }
}

function executeCommand(
  command: string,
  cwd: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const timeout = 30000; // 30 second timeout
    let stdout = '';
    let stderr = '';
    let killed = false;
    
    // Use bash to execute the command
    const child = spawn('bash', ['-c', command], {
      cwd,
      env: { ...process.env, TERM: 'xterm-256color' },
      timeout,
    });
    
    const timer = setTimeout(() => {
      killed = true;
      child.kill('SIGTERM');
    }, timeout);
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
      // Limit output size
      if (stdout.length > 100000) {
        stdout = stdout.slice(0, 100000) + '\n... (output truncated)';
        child.kill('SIGTERM');
      }
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout: stdout.trim(),
        stderr: killed ? 'Command timed out after 30 seconds' : stderr.trim(),
        exitCode: code ?? 1,
      });
    });
    
    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        stdout: '',
        stderr: err.message,
        exitCode: 1,
      });
    });
  });
}
