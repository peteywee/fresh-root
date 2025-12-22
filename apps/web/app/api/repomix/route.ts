// [P1][API][CODE] Repomix analysis API endpoint
// Tags: P1, API, CODE, repomix, analysis

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

const WORKSPACE_ROOT = '/workspaces/fresh-root';

// Input validation schema
const RepomixInputSchema = z.object({
  directory: z.string().default('/workspaces/fresh-root'),
  output: z.enum(['xml', 'markdown', 'json', 'plain']).default('xml'),
  compress: z.boolean().default(false),
  include: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
  topFilesLength: z.number().min(1).max(50).default(10),
});

async function validateDirectory(dir: string): Promise<boolean> {
  try {
    // Resolve to real path to prevent symlink attacks
    const realPath = await fs.realpath(dir);
    const normalized = path.normalize(realPath);
    const workspaceReal = path.normalize(WORKSPACE_ROOT);

    // Must be within workspace
    return normalized.startsWith(workspaceReal);
  } catch {
    // Path doesn't exist or can't be accessed
    return false;
  }
}

function validateGlobPattern(pattern: string): boolean {
  // Prevent glob patterns from accessing parent directories
  return !pattern.includes('..') && !pattern.includes('..\\');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RepomixInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input: ' + parsed.error.message },
        { status: 400 }
      );
    }

    const config = parsed.data;

    // Validate directory is within workspace
    const isValidDir = await validateDirectory(config.directory);
    if (!isValidDir) {
      return NextResponse.json(
        { success: false, error: 'Directory must be within workspace' },
        { status: 400 }
      );
    }

    // Validate glob patterns don't escape workspace
    if (config.include?.some(pattern => !validateGlobPattern(pattern))) {
      return NextResponse.json(
        { success: false, error: 'Invalid include pattern' },
        { status: 400 }
      );
    }

    if (config.exclude?.some(pattern => !validateGlobPattern(pattern))) {
      return NextResponse.json(
        { success: false, error: 'Invalid exclude pattern' },
        { status: 400 }
      );
    }

    // Build repomix command
    const args = ['pack', config.directory];
    args.push('--style', config.output);

    if (config.compress) {
      args.push('--compress');
    }

    if (config.include?.length) {
      args.push('--include', config.include.join(','));
    }

    if (config.exclude?.length) {
      args.push('--ignore', config.exclude.join(','));
    }

    args.push('--top-files-len', String(config.topFilesLength));

    // Generate output filename with secure random timestamp
    const timestamp = Date.now();
    const outputExt = config.output === 'markdown' ? 'md' : config.output === 'plain' ? 'txt' : config.output;
    const outputFile = path.join('/tmp', `repomix-output-${timestamp}.${outputExt}`);
    args.push('--output', outputFile);

    // Execute repomix
    const result = await executeRepomix(args);

    if (result.exitCode !== 0) {
      return NextResponse.json({
        success: false,
        error: result.stderr || 'Repomix failed',
        stdout: result.stdout,
      });
    }

    // Parse stats from output
    const stats = parseRepomixOutput(result.stdout);

    // Check if output file exists and verify it's in /tmp with expected prefix
    let outputExists = false;
    try {
      const realOutputPath = await fs.realpath(outputFile);
      // Verify the real path is still in /tmp and matches expected pattern
      if (realOutputPath.startsWith('/tmp/repomix-output-')) {
        await fs.access(outputFile);
        outputExists = true;
      }
    } catch {
      // File doesn't exist or is not accessible
    }

    return NextResponse.json({
      success: true,
      outputPath: outputExists ? outputFile : undefined,
      stats,
      stdout: result.stdout,
    });
  } catch (error) {
    console.error('Repomix API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve repomix output file
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('file');

  if (!filePath || !filePath.startsWith('/tmp/repomix-output-')) {
    return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
  }

  try {
    // Verify the real path to prevent symlink attacks
    const realPath = await fs.realpath(filePath);
    if (!realPath.startsWith('/tmp/repomix-output-')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    const content = await fs.readFile(realPath, 'utf-8');
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${path.basename(realPath)}"`,
      },
    });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
}

function executeRepomix(
  args: string[]
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const timeout = 120000; // 2 minute timeout for large repos
    let stdout = '';
    let stderr = '';
    
    // Try npx repomix first
    const child = spawn('npx', ['repomix', ...args], {
      cwd: '/workspaces/fresh-root',
      env: process.env,
      timeout,
    });
    
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      stderr += '\nCommand timed out after 2 minutes';
    }, timeout);
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
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

function parseRepomixOutput(stdout: string): {
  totalFiles: number;
  totalLines: number;
  languages: Record<string, number>;
} {
  const stats = {
    totalFiles: 0,
    totalLines: 0,
    languages: {} as Record<string, number>,
  };
  
  // Parse file count
  const filesMatch = stdout.match(/(\d+)\s*files?/i);
  if (filesMatch) {
    stats.totalFiles = parseInt(filesMatch[1], 10);
  }
  
  // Parse line count
  const linesMatch = stdout.match(/(\d+(?:,\d+)*)\s*lines?/i);
  if (linesMatch) {
    stats.totalLines = parseInt(linesMatch[1].replace(/,/g, ''), 10);
  }
  
  return stats;
}
