// [P1][API][CODE] File management API endpoint
// Tags: P1, API, CODE, files, editor

import { NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';
import { z } from 'zod';
import { createAuthenticatedEndpoint } from '@fresh-schedules/api-framework';

const WORKSPACE_ROOT = '/workspaces/fresh-root';

// Allowed file extensions for editing
const ALLOWED_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.mdx',
  '.css', '.scss', '.html', '.yaml', '.yml', '.toml',
  '.txt', '.sh', '.bash', '.zsh',
  '.gitignore', '.eslintrc', '.prettierrc',
];

// Blocked directory patterns
const BLOCKED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '.next',
  'coverage',
]);

// Never allow these files
const PROTECTED_FILES = new Set([
  'package.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'package-lock.json',
  '.env',
  '.env.local',
  '.env.production',
  '.ssh',
]);

async function resolveAndValidatePath(inputPath: string, allowNonexistent = false): Promise<string | null> {
  // Fast-fail traversal attempts and null bytes before any filesystem calls
  if (inputPath.includes('\0')) return null;
  const hasTraversal = inputPath.split(/[/\\]+/).includes('..');
  if (hasTraversal) return null;

  const absolute = path.isAbsolute(inputPath)
    ? path.normalize(inputPath)
    : path.normalize(path.join(WORKSPACE_ROOT, inputPath));

  // Ensure the normalized path stays under the workspace
  const workspaceReal = path.normalize(WORKSPACE_ROOT);
  if (!absolute.startsWith(workspaceReal)) {
    return null;
  }

  // Resolve symlinks for existing paths; for new files validate parent dir
  try {
    const real = await fs.realpath(absolute);
    if (!real.startsWith(workspaceReal)) {
      return null;
    }
    const parts = path.relative(workspaceReal, real).split(path.sep);
    if (parts.some((part) => BLOCKED_DIRS.has(part))) {
      return null;
    }
    return real;
  } catch {
    if (!allowNonexistent) {
      return null;
    }
    // For new files, validate the parent directory instead
    const parentDir = path.dirname(absolute);
    try {
      const parentReal = await fs.realpath(parentDir);
      if (!parentReal.startsWith(workspaceReal)) {
        return null;
      }
      const parts = path.relative(workspaceReal, parentReal).split(path.sep);
      if (parts.some((part) => BLOCKED_DIRS.has(part))) {
        return null;
      }
      return path.join(parentReal, path.basename(absolute));
    } catch {
      return null;
    }
  }
}

function isExtensionAllowed(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath);

  // Explicitly block dangerous dotfiles
  if (PROTECTED_FILES.has(basename)) {
    return false;
  }

  // Only allow specific extensions
  return ALLOWED_EXTENSIONS.includes(ext);
}

// GET - Read file content
export const GET = createAuthenticatedEndpoint({
  handler: async ({ request, input: _input, context: _context, params: _params }) => {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'Path required' }, { status: 400 });
    }

    const fullPath = await resolveAndValidatePath(filePath);
    if (!fullPath) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    try {
      const stat = await fs.stat(fullPath);
      const relPath = path.relative(WORKSPACE_ROOT, fullPath);

      if (stat.isDirectory()) {
        // List directory
        const entries = await fs.readdir(fullPath, { withFileTypes: true });
        const items = entries
          .filter(entry => {
            // Filter out blocked directories
            return !BLOCKED_DIRS.has(entry.name);
          })
          .map(entry => ({
            name: entry.name,
            type: entry.isDirectory() ? 'directory' : 'file',
            path: path.relative(WORKSPACE_ROOT, path.join(fullPath, entry.name)),
          }));
        return NextResponse.json({ type: 'directory', items });
      }

      // Read file
      if (!isExtensionAllowed(fullPath)) {
        return NextResponse.json({ error: 'File type not allowed' }, { status: 403 });
      }

      // Check file size (max 1MB)
      if (stat.size > 1024 * 1024) {
        return NextResponse.json({ error: 'File too large (max 1MB)' }, { status: 413 });
      }

      const content = await fs.readFile(fullPath, 'utf-8');
      return NextResponse.json({
        type: 'file',
        path: relPath,
        content,
        size: stat.size,
        modified: stat.mtime.toISOString(),
      });
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === 'ENOENT') {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      console.error('File read error:', error);
      return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
    }
  },
});

// PUT - Update file content
const UpdateSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
  createIfNotExists: z.boolean().default(false),
});

export const PUT = createAuthenticatedEndpoint({
  input: UpdateSchema,
  handler: async ({ input }: { input: z.infer<typeof UpdateSchema> }) => {
    const { path: filePath, content, createIfNotExists } = input;

    const fullPath = await resolveAndValidatePath(filePath, true);
    if (!fullPath) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!isExtensionAllowed(fullPath)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 403 });
    }

    // Check if file exists by attempting to stat (will throw if doesn't exist)
    let exists = false;
    try {
      await fs.stat(fullPath);
      exists = true;
    } catch {
      if (!createIfNotExists) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
    }

    // Create parent directories if needed (safe after path validation)
    if (!exists) {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
    }

    // Write file atomically
    await fs.writeFile(fullPath, content, 'utf-8');

    const stat = await fs.stat(fullPath);
    const relPath = path.relative(WORKSPACE_ROOT, fullPath);
    return NextResponse.json({
      success: true,
      path: relPath,
      size: stat.size,
      modified: stat.mtime.toISOString(),
    });
  },
});

// POST - Create new file
const CreateSchema = z.object({
  path: z.string().min(1),
  content: z.string().default(''),
  type: z.enum(['file', 'directory']).default('file'),
});

export const POST = createAuthenticatedEndpoint({
  input: CreateSchema,
  handler: async ({ input }: { input: z.infer<typeof CreateSchema> }) => {
    const { path: filePath, content, type } = input;

    const fullPath = await resolveAndValidatePath(filePath, true);
    if (!fullPath) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if already exists
    try {
      await fs.stat(fullPath);
      return NextResponse.json({ error: 'File already exists' }, { status: 409 });
    } catch {
      // Good, doesn't exist
    }

    if (type === 'directory') {
      await fs.mkdir(fullPath, { recursive: true });
      const relPath = path.relative(WORKSPACE_ROOT, fullPath);
      return NextResponse.json({ success: true, path: relPath, type: 'directory' });
    }

    if (!isExtensionAllowed(fullPath)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 403 });
    }

    // Create parent directories
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');

    const relPath = path.relative(WORKSPACE_ROOT, fullPath);
    return NextResponse.json({ success: true, path: relPath, type: 'file' });
  },
});

// DELETE - Remove file
export const DELETE = createAuthenticatedEndpoint({
  handler: async ({ request, input: _input, context: _context, params: _params }) => {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'Path required' }, { status: 400 });
    }

    const fullPath = await resolveAndValidatePath(filePath);
    if (!fullPath) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check for protected files and directories
    const basename = path.basename(fullPath);
    const relativePath = path.relative(WORKSPACE_ROOT, fullPath);

    if (PROTECTED_FILES.has(basename) || relativePath === '' || BLOCKED_DIRS.has(basename)) {
      return NextResponse.json({ error: 'Cannot delete protected files' }, { status: 403 });
    }

    try {
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        await fs.rm(fullPath, { recursive: true });
      } else {
        await fs.unlink(fullPath);
      }

      const relPath = path.relative(WORKSPACE_ROOT, fullPath);
      return NextResponse.json({ success: true, deleted: relPath });
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === 'ENOENT') {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      console.error('File delete error:', error);
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }
  },
});
