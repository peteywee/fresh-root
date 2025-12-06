/**
 * Cross-platform utilities for Chromebook/Windows/Mac/Linux
 * Replaces unsafe execSync calls
 */

import { exec, ExecException } from "child_process";
import { promisify } from "util";
import * as os from "os";

const execAsync = promisify(exec);

export const platform = {
  isChromebook: os.platform() === "linux" && fs.existsSync("/etc/lsb-release"),
  isWindows: os.platform() === "win32",
  isMac: os.platform() === "darwin",
  isLinux: os.platform() === "linux",
};

interface ExecResult {
  stdout: string;
  stderr: string;
  code: number;
  success: boolean;
}

/**
 * Safe exec with timeout, retry, and cross-platform support
 */
export async function safeExec(
  command: string,
  options: {
    timeout?: number;
    retries?: number;
    ignoreErrors?: boolean;
    cwd?: string;
  } = {},
): Promise<ExecResult> {
  const { timeout = 120000, retries = 0, ignoreErrors = false, cwd = process.cwd() } = options;

  let lastError: (Error & { code?: number }) | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout,
        cwd,
        maxBuffer: 10 * 1024 * 1024, // 10MB
        windowsHide: true,
      });

      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        code: 0,
        success: true,
      };
    } catch (err: any) {
      lastError = err;

      // Don't retry on syntax errors
      if (err.code === 127 || err.message?.includes("not found")) {
        break;
      }

      // Exponential backoff
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  if (ignoreErrors) {
    return {
      stdout: "",
      stderr: lastError?.message || "",
      code: lastError?.code || 1,
      success: false,
    };
  }

  throw lastError;
}

/**
 * Check if command exists (cross-platform)
 */
export async function commandExists(command: string): Promise<boolean> {
  const checkCmd = platform.isWindows ? `where ${command}` : `which ${command}`;

  try {
    await safeExec(checkCmd, { timeout: 5000, ignoreErrors: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get git diff safely (handles missing git)
 */
export async function getGitDiff(): Promise<string[]> {
  const hasGit = await commandExists("git");
  if (!hasGit) return [];

  try {
    const result = await safeExec("git diff --name-only HEAD~1 HEAD", {
      timeout: 10000,
      ignoreErrors: true,
    });
    return result.stdout.split("\n").filter((f) => f.trim().length > 0);
  } catch {
    return [];
  }
}

/**
 * Run tests safely (handles missing pnpm/npm)
 */
export async function runTests(
  testPath: string,
  options: { timeout?: number } = {},
): Promise<ExecResult> {
  const hasPnpm = await commandExists("pnpm");
  const hasNpm = await commandExists("npm");

  if (!hasPnpm && !hasNpm) {
    throw new Error("Neither pnpm nor npm found. Install Node.js first.");
  }

  const packageManager = hasPnpm ? "pnpm" : "npm";
  const command = `${packageManager} vitest run ${testPath}`;

  return safeExec(command, {
    timeout: options.timeout || 300000,
    retries: 2,
    ignoreErrors: true,
  });
}

/**
 * Get memory info (cross-platform)
 */
export function getMemoryInfo(): { total: number; free: number; usage: number } {
  const total = os.totalmem();
  const free = os.freemem();
  const usage = ((total - free) / total) * 100;

  return { total, free, usage };
}

/**
 * Check if system has enough resources
 */
export function checkResources(): { ok: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const mem = getMemoryInfo();

  // Chromebooks typically have 4GB RAM
  if (mem.total < 4 * 1024 * 1024 * 1024) {
    warnings.push("Low memory detected (<4GB). Parallelization may be limited.");
  }

  if (mem.usage > 80) {
    warnings.push(`High memory usage (${mem.usage.toFixed(0)}%). Tests may fail.`);
  }

  return {
    ok: warnings.length === 0,
    warnings,
  };
}

// For CommonJS compatibility
import * as fs from "fs";
