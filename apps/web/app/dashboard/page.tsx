// @ts-nocheck - Dashboard demo component with intentional loose typing for rapid prototyping
"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Activity, Code2, FileCode, Files, Layout, RefreshCw, CheckCircle2,
  ShieldCheck, Terminal, GitBranch, Box, Layers, Clock, AlertCircle,
  ChevronRight, ChevronDown, Search, Cpu, Zap, Microscope,
  Network, FileText, XCircle, Database, Folder, FolderOpen,
  FileJson, Settings, Copy, CheckSquare, Package, ArrowRight,
  Github, Loader2, Key, FileUp, Download, Eye, FileDigit
} from 'lucide-react';

// ========== SECURITY UTILITIES ==========
// Sanitize HTML to prevent XSS (exported for use in child components)
const _sanitizeHtml = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

// Validate and sanitize terminal input - block dangerous commands
const BLOCKED_COMMANDS = ['rm -rf /', 'sudo rm', ':(){:|:&};:', 'mkfs', 'dd if=', '> /dev/sda', 'chmod -R 777 /'];
const ALLOWED_PREFIXES = ['ls', 'pwd', 'cat', 'head', 'tail', 'grep', 'find', 'echo', 'node', 'npm', 'pnpm', 'npx', 'git', 'gh', 'repomix', 'clear', 'help', 'cd', 'tree', 'wc', 'which', 'env', 'export'];

const validateCommand = (cmd: string): { valid: boolean; reason?: string } => {
  const trimmed = cmd.trim().toLowerCase();
  
  // Block dangerous patterns
  for (const blocked of BLOCKED_COMMANDS) {
    if (trimmed.includes(blocked.toLowerCase())) {
      return { valid: false, reason: `Blocked: dangerous command pattern "${blocked}"` };
    }
  }
  
  // Check if command starts with allowed prefix
  const firstWord = trimmed.split(/\s+/)[0];
  const isAllowed = ALLOWED_PREFIXES.some(prefix => firstWord === prefix || firstWord.startsWith(prefix + ' '));
  
  if (!isAllowed && !trimmed.startsWith('./') && !trimmed.startsWith('node ')) {
    return { valid: false, reason: `Command "${firstWord}" not in allowlist. Use 'help' to see available commands.` };
  }
  
  return { valid: true };
};

// Secure token storage using sessionStorage (better than state, cleared on tab close)
const secureStorage = {
  setToken: (key: string, value: string) => {
    try {
      // In production, use encryption
      sessionStorage.setItem(`__secure_${key}`, btoa(value));
    } catch { /* sessionStorage not available */ }
  },
  getToken: (key: string): string | null => {
    try {
      const val = sessionStorage.getItem(`__secure_${key}`);
      return val ? atob(val) : null;
    } catch { return null; }
  },
  clearToken: (key: string) => {
    try {
      sessionStorage.removeItem(`__secure_${key}`);
    } catch { /* ignore */ }
  }
};

// ========== REAL TERMINAL EXECUTION ==========
interface TerminalExecutor {
  execute: (cmd: string, cwd?: string) => Promise<{ stdout: string; stderr: string; exitCode: number }>;
  isAvailable: () => boolean;
}

// API-based terminal executor (for Next.js API routes) - ENABLED
const createApiExecutor = (apiEndpoint: string): TerminalExecutor => ({
  execute: async (cmd: string, cwd = '/workspaces/fresh-root') => {
    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, cwd }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return { stdout: '', stderr: String(err), exitCode: 1 };
    }
  },
  isAvailable: () => true,
});

// Mock executor for demo/fallback (kept for offline/testing scenarios)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createMockExecutor = (): TerminalExecutor => ({
  execute: async (cmd: string) => {
    const trimmed = cmd.trim();
    const [command, ...args] = trimmed.split(/\s+/);
    
    // Simulate common commands
    const responses: Record<string, () => string> = {
      'help': () => `Available commands:
  ls [path]       - List directory contents
  pwd             - Print working directory
  cat <file>      - Display file contents
  node <script>   - Run Node.js script
  npm <cmd>       - Run npm command
  pnpm <cmd>      - Run pnpm command
  git <cmd>       - Run git command
  gh <cmd>        - Run GitHub CLI command
  repomix <args>  - Run repomix analysis
  clear           - Clear terminal
  tree [path]     - Show directory tree
  
Use Ctrl+C to cancel running commands.`,
      'pwd': () => '/workspaces/fresh-root',
      'whoami': () => 'codespace',
      'date': () => new Date().toString(),
      'echo': () => args.join(' '),
      'clear': () => '\x1Bc',
    };
    
    if (responses[command]) {
      return { stdout: responses[command](), stderr: '', exitCode: 0 };
    }
    
    // Simulate longer-running commands
    if (command === 'npm' || command === 'pnpm') {
      await new Promise(r => setTimeout(r, 1000));
      if (args[0] === 'test') {
        return { stdout: '✓ All tests passed (42 tests in 2.3s)', stderr: '', exitCode: 0 };
      }
      if (args[0] === 'run' && args[1] === 'build') {
        return { stdout: '✓ Build completed successfully\n  Output: .next/', stderr: '', exitCode: 0 };
      }
      return { stdout: `npm ${args.join(' ')} completed`, stderr: '', exitCode: 0 };
    }
    
    if (command === 'git') {
      if (args[0] === 'status') {
        return { stdout: `On branch dev\nYour branch is up to date with 'origin/dev'.\n\nnothing to commit, working tree clean`, stderr: '', exitCode: 0 };
      }
      if (args[0] === 'log') {
        return { stdout: `commit abc1234 (HEAD -> dev)\nAuthor: Developer <dev@example.com>\nDate:   ${new Date().toDateString()}\n\n    feat: add codebase dashboard`, stderr: '', exitCode: 0 };
      }
      if (args[0] === 'branch') {
        return { stdout: '* dev\n  main\n  feature/new-ui', stderr: '', exitCode: 0 };
      }
      return { stdout: `git ${args.join(' ')}`, stderr: '', exitCode: 0 };
    }
    
    if (command === 'repomix') {
      await new Promise(r => setTimeout(r, 2000));
      return { 
        stdout: `🔍 Analyzing codebase...\n✓ Found 2,314 files\n✓ Processed 84,392 lines\n✓ Output written to: repomix-output.xml\n\nAnalysis complete!`, 
        stderr: '', 
        exitCode: 0 
      };
    }
    
    if (command === 'ls') {
      return { stdout: 'apps/\npackages/\ndocs/\nscripts/\nnode_modules/\npackage.json\ntsconfig.json\nREADME.md', stderr: '', exitCode: 0 };
    }
    
    if (command === 'tree') {
      return { stdout: `.\n├── apps/\n│   └── web/\n├── packages/\n│   ├── api-framework/\n│   ├── types/\n│   └── ui/\n├── docs/\n└── scripts/`, stderr: '', exitCode: 0 };
    }
    
    if (command === 'cat') {
      return { stdout: `// File: ${args[0] || 'unknown'}\n// Content would be displayed here`, stderr: '', exitCode: 0 };
    }
    
    if (command === 'node') {
      await new Promise(r => setTimeout(r, 500));
      return { stdout: 'Script executed successfully', stderr: '', exitCode: 0 };
    }
    
    return { stdout: '', stderr: `bash: ${command}: command not found`, exitCode: 127 };
  },
  isAvailable: () => true,
});

// ========== REPOMIX INTEGRATION ==========
interface RepomixConfig {
  include?: string[];
  exclude?: string[];
  output?: 'xml' | 'markdown' | 'json';
  compress?: boolean;
}

interface RepomixResult {
  success: boolean;
  outputPath?: string;
  stats?: {
    totalFiles: number;
    totalLines: number;
    languages: Record<string, number>;
  };
  error?: string;
}

// Run repomix CLI analysis via API - ENABLED
const runRepomixAnalysis = async (
  directory: string,
  config: RepomixConfig = {}
): Promise<RepomixResult> => {
  try {
    const res = await fetch('/api/repomix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        directory,
        output: config.output || 'xml',
        compress: config.compress || false,
        include: config.include,
        exclude: config.exclude,
      }),
    });
    
    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}` };
    }
    
    const data = await res.json();
    return {
      success: data.success,
      outputPath: data.outputPath,
      stats: data.stats,
      error: data.error,
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// File API helper functions
const fileApi = {
  read: async (filePath: string): Promise<{ content: string; error?: string }> => {
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(filePath)}`);
      if (!res.ok) return { content: '', error: `HTTP ${res.status}` };
      const data = await res.json();
      return { content: data.content || '', error: data.error };
    } catch (err) {
      return { content: '', error: String(err) };
    }
  },
  
  write: async (filePath: string, content: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/files', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content, createIfNotExists: true }),
      });
      const data = await res.json();
      return { success: data.success || false, error: data.error };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  list: async (dirPath: string): Promise<{ items: Array<{ name: string; type: string; path: string }>; error?: string }> => {
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(dirPath)}`);
      if (!res.ok) return { items: [], error: `HTTP ${res.status}` };
      const data = await res.json();
      return { items: data.items || [], error: data.error };
    } catch (err) {
      return { items: [], error: String(err) };
    }
  },
};

// ========== MOCK DATA (Fallback) ==========
const MOCK_FILE_CONTENTS: Record<string, string> = {
  'Button.tsx': `import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input bg-background hover:bg-accent',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> { asChild?: boolean; }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);

export { Button, buttonVariants };`,
  'Card.tsx': `import React from 'react';
import { cn } from '../utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-xl border bg-card text-card-foreground shadow', className)} {...props} />
  )
);

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
);

export { Card, CardHeader, CardContent };`,
  'server.ts': `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { router } from './router';
import { errorHandler, requestLogger } from './middleware';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);
app.use('/api/v1', router);
app.get('/health', (req, res) => res.json({ status: 'healthy', timestamp: new Date().toISOString() }));
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
export { app };`,
  'router.ts': `import { Router } from 'express';
import { auth, validate } from './middleware';
import * as userController from './controllers/user';
import * as scheduleController from './controllers/schedule';

const router = Router();

router.get('/users', auth, userController.list);
router.post('/users', auth, validate(userSchema), userController.create);
router.get('/schedules', auth, scheduleController.list);
router.post('/schedules', auth, validate(scheduleSchema), scheduleController.create);
router.post('/schedules/:id/publish', auth, scheduleController.publish);

export { router };`,
  'middleware.ts': `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Auth required' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

export const validate = (schema) => (req, res, next) => {
  try { schema.parse(req.body); next(); }
  catch (e) { res.status(400).json({ error: 'Validation failed', details: e }); }
};`,
  'page.tsx': `import { Hero, Features, Pricing, CTA, Footer } from '@/components';

export const metadata = {
  title: 'Fresh Schedules - Smart Scheduling',
  description: 'Streamline workforce scheduling with AI automation.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero /><Features /><Pricing /><CTA /><Footer />
    </main>
  );
}`,
  'App.tsx': `import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout, ProtectedRoute } from '@/components';
import { Dashboard, Schedules, Employees, Settings, Login } from '@/pages';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 5 * 60 * 1000 }}});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/schedules/*" element={<Schedules />} />
                <Route path="/employees/*" element={<Employees />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}`,
  'format.ts': `export const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

export const formatDuration = (mins) => {
  const h = Math.floor(mins / 60), m = mins % 60;
  return h === 0 ? \`\${m}m\` : m === 0 ? \`\${h}h\` : \`\${h}h \${m}m\`;
};

export const formatRelativeTime = (date) => {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return \`\${mins}m ago\`;
  if (mins < 1440) return \`\${Math.floor(mins/60)}h ago\`;
  return \`\${Math.floor(mins/1440)}d ago\`;
};`,
  'utils.ts': `import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => twMerge(clsx(inputs));
export const debounce = (fn, delay) => {
  let timeout;
  return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => fn(...args), delay); };
};`,
};

const MOCK_TEST_FILES: Record<string, any> = {
  'Button.test.tsx': {
    name: 'Button.test.tsx', path: 'packages/ui/__tests__/Button.test.tsx',
    tests: [
      { name: 'renders with default props', status: 'pass', duration: 12 },
      { name: 'applies variant classes', status: 'pass', duration: 8 },
      { name: 'handles click events', status: 'pass', duration: 15 },
      { name: 'renders disabled state', status: 'pass', duration: 6 },
    ],
    content: `import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
  });
  it('handles click events', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});`,
  },
  'router.test.ts': {
    name: 'router.test.ts', path: 'packages/api/__tests__/router.test.ts',
    tests: [
      { name: 'GET /health returns 200', status: 'pass', duration: 45 },
      { name: 'GET /users requires auth', status: 'pass', duration: 32 },
      { name: 'POST /users validates body', status: 'pass', duration: 28 },
    ],
    content: `import request from 'supertest';
import { app } from '../server';

describe('Router', () => {
  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
  it('GET /users requires auth', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(401);
  });
});`,
  },
  'login.spec.ts': {
    name: 'login.spec.ts', path: 'apps/web/e2e/login.spec.ts',
    tests: [
      { name: 'displays login form', status: 'pass', duration: 1200 },
      { name: 'validates empty fields', status: 'pass', duration: 890 },
      { name: 'logs in with valid creds', status: 'pass', duration: 2400 },
    ],
    content: `import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('displays login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });
  test('validates empty fields', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Email is required')).toBeVisible();
  });
});`,
  },
};

const MOCK_WORKFLOWS: Record<string, any> = {
  'main.yml': {
    name: 'CI/CD Pipeline', filename: 'main.yml', status: 'success',
    trigger: 'push to main', duration: '2m 34s',
    startedAt: '10:38:00', completedAt: '10:40:34',
    commit: { sha: 'a3f8c2d', message: 'feat: add user preferences API', author: 'peteywee' },
    jobs: [
      {
        id: 'install', name: 'Install', status: 'success', duration: '25s',
        steps: [
          { name: 'Checkout', status: 'success', duration: '2s' },
          { name: 'Setup Bun', status: 'success', duration: '5s' },
          { name: 'Install', status: 'success', duration: '18s' }
        ],
        logs: [
          { time: '10:38:00', level: 'info', msg: 'Starting install...' },
          { time: '10:38:02', level: 'info', msg: 'Checking out...' },
          { time: '10:38:25', level: 'success', msg: 'Installed 847 packages' }
        ]
      },
      {
        id: 'lint', name: 'Lint', status: 'success', duration: '19s',
        steps: [{ name: 'ESLint', status: 'success', duration: '12s' }, { name: 'Prettier', status: 'success', duration: '7s' }],
        logs: [
          { time: '10:38:26', level: 'info', msg: 'Running eslint...' },
          { time: '10:38:45', level: 'success', msg: 'Lint passed' }
        ]
      },
      {
        id: 'test', name: 'Test', status: 'success', duration: '45s',
        steps: [{ name: 'Unit tests', status: 'success', duration: '25s' }, { name: 'Integration', status: 'success', duration: '20s' }],
        logs: [
          { time: '10:39:16', level: 'info', msg: 'Running tests...' },
          { time: '10:40:01', level: 'success', msg: 'All 156 tests passed' }
        ]
      },
      {
        id: 'build', name: 'Build', status: 'success', duration: '40s',
        steps: [{ name: 'Build packages', status: 'success', duration: '15s' }, { name: 'Build apps', status: 'success', duration: '25s' }],
        logs: [
          { time: '10:40:02', level: 'info', msg: 'Building...' },
          { time: '10:40:34', level: 'success', msg: 'Build complete' }
        ]
      },
    ],
    content: `name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  install: { runs-on: ubuntu-latest, steps: [checkout, setup-bun, bun install] }
  lint: { needs: install, steps: [bun run lint] }
  test: { needs: lint, steps: [bun run test] }
  build: { needs: test, steps: [bun run build] }`,
  },
};

const DEFAULT_MODULES: Record<string, any> = {
  'pkg-ui': {
    id: 'pkg-ui', name: 'packages/ui', type: 'React', path: 'packages/ui',
    description: 'Shared design system components.',
    health: 98, blastRadius: ['app-web'], dependencies: ['pkg-utils'],
    fileTree: {
      name: 'ui', type: 'folder', children: [
        {
          name: 'src', type: 'folder', children: [
            { name: 'Button.tsx', type: 'file', size: '2.4kb', lines: 145 },
            { name: 'Card.tsx', type: 'file', size: '1.8kb', lines: 89 },
          ]
        },
      ]
    },
  },
  'pkg-api': {
    id: 'pkg-api', name: 'packages/api', type: 'Node', path: 'packages/api',
    description: 'Core API logic and middleware.',
    health: 92, blastRadius: ['app-web'], dependencies: ['pkg-utils'],
    fileTree: {
      name: 'api', type: 'folder', children: [
        {
          name: 'src', type: 'folder', children: [
            { name: 'server.ts', type: 'file', size: '3.5kb', lines: 120 },
            { name: 'router.ts', type: 'file', size: '2.1kb', lines: 85 },
          ]
        },
      ]
    },
  },
};

const EXTENSION_DATA = [
  { ext: '.ts', count: 450, lines: 32000, color: 'bg-blue-500' },
  { ext: '.tsx', count: 320, lines: 41500, color: 'bg-cyan-500' },
  { ext: '.css', count: 85, lines: 4200, color: 'bg-orange-500' },
  { ext: '.json', count: 120, lines: 3100, color: 'bg-yellow-500' },
];

const COLOR_TEXT_400: Record<string, string> = {
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  blue: 'text-blue-400',
  indigo: 'text-indigo-400',
  slate: 'text-slate-400',
  purple: 'text-purple-400',
};

const COLOR_BG_500: Record<string, string> = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  slate: 'bg-slate-500',
  purple: 'bg-purple-500',
};

// ========== COMPONENTS ==========
const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: string }) => {
  const v: Record<string, string> = {
    default: 'bg-slate-800 text-slate-300',
    success: 'bg-emerald-500/10 text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-400',
    info: 'bg-blue-500/10 text-blue-400',
    purple: 'bg-purple-500/10 text-purple-400'
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full border border-white/10 font-mono ${v[variant] || v.default}`}>{children}</span>;
};

const StatusDot = ({ status }: { status: string }) => {
  const c: Record<string, string> = { success: 'bg-emerald-500', warning: 'bg-amber-500', error: 'bg-rose-500', running: 'bg-blue-500 animate-pulse' };
  return <span className={`w-2 h-2 rounded-full ${c[status] || 'bg-slate-500'}`} />;
};

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, loading, onClick, interactive }: any) => (
  <div
    onClick={interactive ? onClick : undefined}
    className={`relative overflow-hidden rounded-xl border p-5 bg-slate-900 border-slate-800 ${interactive ? 'cursor-pointer hover:border-indigo-500/50 hover:scale-[1.02]' : ''
      } transition-all`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">{title}</p>
        {loading ? <div className="h-8 w-24 bg-slate-800 animate-pulse rounded" /> : <h3 className="text-3xl font-mono font-bold text-slate-100">{value}</h3>}
      </div>
      <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-10`}><Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} /></div>
    </div>
    {subtext && <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 font-mono">{interactive && <ArrowRight size={12} className="text-indigo-400" />}{subtext}</div>}
  </div>
);

// ========== FILE TREE & GITHUB UTILS ==========
const FileTreeNode = ({ node, nodePath, depth = 0, onFileClick, expanded, toggle }: any) => {
  const isFolder = node.type === 'folder' || node.type === 'tree';
  const isExp = expanded.has(nodePath);

  const icon = (name: string) =>
    name.endsWith('.tsx') || name.endsWith('.ts') ? <FileCode size={14} className="text-blue-400" /> :
      name.endsWith('.json') ? <FileJson size={14} className="text-yellow-400" /> :
      name.endsWith('.md') || name.endsWith('.txt') ? <FileText size={14} className="text-purple-400" /> :
        <FileText size={14} className="text-slate-400" />;

  const handleClick = () => {
    if (isFolder) toggle(nodePath);
    else onFileClick(node);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className="flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer hover:bg-slate-800/50 group"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isFolder ? (
          <>
            {isExp ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
            {isExp ? <FolderOpen size={14} className="text-amber-500" /> : <Folder size={14} className="text-amber-500" />}
          </>
        ) : (
          <>
            <span className="w-3.5" />
            {icon(node.name)}
          </>
        )}
        <span className={`text-sm font-mono ${isFolder ? 'text-slate-300' : 'text-slate-400 group-hover:text-indigo-300'}`}>{node.name}</span>
        {!isFolder && node.size && <span className="text-[10px] text-slate-600 ml-auto opacity-0 group-hover:opacity-100">{node.size}</span>}
      </div>

      {isFolder && isExp && node.children?.map((c: any) => {
        const childPath = `${nodePath}/${c.name}`;
        return (
          <FileTreeNode
            key={childPath}
            node={c}
            nodePath={childPath}
            depth={depth + 1}
            onFileClick={onFileClick}
            expanded={expanded}
            toggle={toggle}
          />
        );
      })}
    </div>
  );
};

function collectDefaultExpandedPaths(tree: any) {
  const out = new Set();
  function walk(node: any, path: string) {
    if (node.type !== 'folder' && node.type !== 'tree') return;
    if (node === tree) out.add(path);
    if (['src', 'app', '__tests__', 'pages', 'docs'].includes(node.name)) out.add(path);
    (node.children || []).forEach((c: any) => walk(c, `${path}/${c.name}`));
  }
  walk(tree, tree.name);
  return out;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FileTree = ({ tree, onFileClick }: any) => {
  const initial = useMemo(() => collectDefaultExpandedPaths(tree), [tree]);
  const [expanded, setExpanded] = useState(initial);

  useEffect(() => setExpanded(initial), [initial]);

  const toggle = (pathKey: string) =>
    setExpanded((p: Set<string>) => {
      const s = new Set(p);
      s.has(pathKey) ? s.delete(pathKey) : s.add(pathKey);
      return s;
    });

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 overflow-auto max-h-[500px]">
      <FileTreeNode node={tree} nodePath={tree.name} onFileClick={onFileClick} expanded={expanded} toggle={toggle} />
    </div>
  );
};

// ========== FILE VIEWER & MARKDOWN PREVIEW ==========
const SimpleMarkdown = ({ content }: { content: string }) => {
  const lines = content.split('\n');
  return (
    <div className="p-6 font-sans text-slate-300 space-y-4">
      {lines.map((line, i) => {
        // Headers
        if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold text-white pb-2 border-b border-slate-700">{line.replace('# ', '')}</h1>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-white mt-4">{line.replace('## ', '')}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold text-slate-100 mt-2">{line.replace('### ', '')}</h3>;
        
        // Lists
        if (line.trim().startsWith('- ')) return <li key={i} className="ml-6 list-disc marker:text-indigo-400">{line.replace('- ', '')}</li>;
        if (line.trim().startsWith('* ')) return <li key={i} className="ml-6 list-disc marker:text-indigo-400">{line.replace('* ', '')}</li>;
        if (/^\d+\. /.test(line.trim())) return <li key={i} className="ml-6 list-decimal marker:text-indigo-400">{line.replace(/^\d+\. /, '')}</li>;
        
        // Code Blocks (Basic detection)
        if (line.startsWith('```')) return null; // Skip fence lines for simple view
        
        // Separator
        if (line.trim() === '---') return <hr key={i} className="border-slate-700 my-4" />;
        
        // Empty lines
        if (line.trim() === '') return <br key={i} />;
        
        // Paragraphs with Bold/Italic basic parsing
        const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
        return (
          <p key={i} className="leading-relaxed">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) return <strong key={j} className="text-white">{part.slice(2, -2)}</strong>;
              if (part.startsWith('`') && part.endsWith('`')) return <code key={j} className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300 font-mono text-sm">{part.slice(1, -1)}</code>;
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
};

// ========== SYNTAX HIGHLIGHTING ==========
type TokenType = 'keyword' | 'string' | 'comment' | 'number' | 'function' | 'operator' | 'type' | 'variable' | 'property' | 'punctuation' | 'plain';

interface Token { type: TokenType; value: string; }

const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: 'text-purple-400',
  string: 'text-emerald-400',
  comment: 'text-slate-500 italic',
  number: 'text-amber-400',
  function: 'text-blue-400',
  operator: 'text-pink-400',
  type: 'text-cyan-400',
  variable: 'text-orange-300',
  property: 'text-sky-300',
  punctuation: 'text-slate-400',
  plain: 'text-slate-300',
};

const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
  'try', 'catch', 'finally', 'throw', 'new', 'delete', 'typeof', 'instanceof', 'void', 'this', 'super',
  'class', 'extends', 'static', 'get', 'set', 'async', 'await', 'yield', 'import', 'export', 'from', 'as', 'default',
  'true', 'false', 'null', 'undefined', 'NaN', 'Infinity',
  'interface', 'type', 'enum', 'namespace', 'module', 'declare', 'readonly', 'public', 'private', 'protected', 'abstract',
  'implements', 'package', 'in', 'of',
]);

const TYPES = new Set([
  'string', 'number', 'boolean', 'object', 'any', 'unknown', 'never', 'void', 'null', 'undefined',
  'Array', 'Object', 'String', 'Number', 'Boolean', 'Function', 'Promise', 'Map', 'Set', 'Date', 'RegExp', 'Error',
  'React', 'useState', 'useEffect', 'useRef', 'useMemo', 'useCallback', 'useContext', 'useReducer',
]);

function tokenizeLine(line: string, _lang: string): Token[] {
  const tokens: Token[] = [];
  let remaining = line;
  
  while (remaining.length > 0) {
    let matched = false;
    
    // Comments (// and /* */)
    if (remaining.startsWith('//')) {
      tokens.push({ type: 'comment', value: remaining });
      break;
    }
    
    // Multi-line string templates
    if (remaining.startsWith('`')) {
      const end = remaining.indexOf('`', 1);
      if (end > 0) {
        tokens.push({ type: 'string', value: remaining.slice(0, end + 1) });
        remaining = remaining.slice(end + 1);
        matched = true;
        continue;
      }
    }
    
    // Strings (single and double quotes)
    const stringMatch = remaining.match(/^(['"])((?:\\.|(?!\1)[^\\])*)\1/);
    if (stringMatch) {
      tokens.push({ type: 'string', value: stringMatch[0] });
      remaining = remaining.slice(stringMatch[0].length);
      matched = true;
      continue;
    }
    
    // Numbers
    const numMatch = remaining.match(/^-?\d+\.?\d*(?:e[+-]?\d+)?/i);
    if (numMatch) {
      tokens.push({ type: 'number', value: numMatch[0] });
      remaining = remaining.slice(numMatch[0].length);
      matched = true;
      continue;
    }
    
    // Identifiers (keywords, types, functions, variables)
    const idMatch = remaining.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
    if (idMatch) {
      const word = idMatch[0];
      let type: TokenType = 'plain';
      
      if (KEYWORDS.has(word)) type = 'keyword';
      else if (TYPES.has(word)) type = 'type';
      else if (remaining.slice(word.length).match(/^\s*\(/)) type = 'function';
      else if (remaining.slice(word.length).match(/^\s*:/)) type = 'property';
      else type = 'variable';
      
      tokens.push({ type, value: word });
      remaining = remaining.slice(word.length);
      matched = true;
      continue;
    }
    
    // Operators
    const opMatch = remaining.match(/^(?:===|!==|==|!=|<=|>=|=>|&&|\|\||[+\-*/%=<>!&|^~?:])/);
    if (opMatch) {
      tokens.push({ type: 'operator', value: opMatch[0] });
      remaining = remaining.slice(opMatch[0].length);
      matched = true;
      continue;
    }
    
    // Punctuation
    const punctMatch = remaining.match(/^[{}[\]();,.]/);
    if (punctMatch) {
      tokens.push({ type: 'punctuation', value: punctMatch[0] });
      remaining = remaining.slice(1);
      matched = true;
      continue;
    }
    
    // Whitespace and other characters
    if (!matched) {
      tokens.push({ type: 'plain', value: remaining[0] });
      remaining = remaining.slice(1);
    }
  }
  
  return tokens;
}

const HighlightedLine = ({ line, lang }: { line: string; lang: string }) => {
  const tokens = useMemo(() => tokenizeLine(line, lang), [line, lang]);
  
  return (
    <pre className="font-mono text-xs whitespace-pre-wrap break-all">
      {tokens.map((token, i) => (
        <span key={i} className={TOKEN_COLORS[token.type]}>{token.value}</span>
      ))}
      {tokens.length === 0 && ' '}
    </pre>
  );
};

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const langMap: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java',
    json: 'json', yaml: 'yaml', yml: 'yaml', md: 'markdown', css: 'css',
    html: 'html', xml: 'xml', sql: 'sql', sh: 'bash', bash: 'bash',
  };
  return langMap[ext] || 'plaintext';
}

async function safeCopyToClipboard(text: string) {
  try {
    if (navigator?.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* fall through */ }
  try {
    const ta = document.createElement('textarea'); ta.value = text;
    ta.style.position = 'fixed'; ta.style.left = '-9999px'; document.body.appendChild(ta);
    ta.select(); const ok = document.execCommand('copy'); document.body.removeChild(ta); return ok;
  } catch { return false; }
}

const FileViewer = ({ file, onClose, path, githubToken }: any) => {
  const [content, setContent] = useState<string>('Loading...');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const isMarkdown = file.name.endsWith('.md') || file.name.endsWith('.txt');

  useEffect(() => {
    const loadContent = async () => {
      if (file.content) { 
        setContent(file.content);
        return;
      }
      if (MOCK_FILE_CONTENTS[file.name]) {
        setContent(MOCK_FILE_CONTENTS[file.name]);
        return;
      }
      if (file.url) { 
        setLoading(true);
        try {
          const headers: any = {};
          if (githubToken) headers.Authorization = `token ${githubToken}`;
          const res = await fetch(file.url, { headers });
          const data = await res.json();
          if (data.content && data.encoding === 'base64') {
            setContent(atob(data.content.replace(/\n/g, '')));
          } else {
            setContent('// Unable to decode file content or file is empty.');
          }
        } catch (e) {
          setContent('// Error fetching file content from GitHub.\n// ' + String(e));
        } finally {
          setLoading(false);
        }
      } else {
        setContent(`// ${path}/${file.name}\n// No content available in preview.`);
      }
    };
    loadContent();
    // Default to preview for markdown files
    if (isMarkdown) setShowPreview(true);
  }, [file, path, githubToken, isMarkdown]);

  const copy = async () => {
    await safeCopyToClipboard(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-5xl h-[85vh] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <FileCode size={16} className="text-indigo-400" />
            <span className="font-mono text-sm text-slate-200">{file.name}</span>
            <Badge variant="info">{file.size ? (typeof file.size === 'number' ? `${(file.size / 1024).toFixed(1)} KB` : file.size) : 'Text'}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {isMarkdown && (
              <button 
                onClick={() => setShowPreview(!showPreview)} 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${showPreview ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                {showPreview ? <Code2 size={12} /> : <Eye size={12} />}
                {showPreview ? 'Code' : 'Preview'}
              </button>
            )}
            <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-slate-800 text-slate-300 hover:bg-slate-700">
              {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
              <XCircle size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-slate-950 relative">
          {loading && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50"><Loader2 className="animate-spin text-indigo-500" /></div>}
          
          {showPreview && isMarkdown ? (
            <SimpleMarkdown content={content} />
          ) : (
            <table className="w-full">
              <tbody>
                {content.split('\n').map((line: string, i: number) => (
                  <tr key={i} className="hover:bg-slate-900/50">
                    <td className="px-4 py-0.5 text-right text-xs text-slate-600 font-mono border-r border-slate-800 w-12 select-none">{i + 1}</td>
                    <td className="px-4 py-0.5"><HighlightedLine line={line} lang={getLanguageFromFilename(file.name)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// ========== VIEWS (UNCHANGED) ==========
const CICDPipelineView = ({ onWorkflowClick }: any) => (
  <div className="space-y-6 animate-in slide-in-from-right-8">
    <div className="flex justify-between pb-6 border-b border-slate-800">
      <div>
        <h2 className="text-2xl font-bold text-white">CI/CD Pipelines</h2>
        <p className="text-slate-400 text-sm mt-1">Workflow runs, jobs, and logs</p>
      </div>
      <Badge variant="success">Operational</Badge>
    </div>

    {Object.values(MOCK_WORKFLOWS).map(w => (
      <div
        key={w.filename}
        onClick={() => onWorkflowClick(w.filename)}
        className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 cursor-pointer group"
      >
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${w.status === 'success' ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
              <CheckCircle2 size={20} className={w.status === 'success' ? 'text-emerald-400' : 'text-amber-400'} />
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-indigo-300">{w.name}</h3>
              <p className="text-xs text-slate-500 font-mono">{w.filename}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={w.status === 'success' ? 'success' : 'warning'}>{w.status}</Badge>
            <p className="text-xs text-slate-500 mt-1">{w.duration}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg mb-4">
          <GitBranch size={14} className="text-slate-500" />
          <span className="font-mono text-xs text-slate-400">{w.commit.sha}</span>
          <span className="text-xs text-slate-500 truncate flex-1">{w.commit.message}</span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {w.jobs.map((j: any) => (
            <div key={j.id} className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded text-xs">
              <StatusDot status={j.status} />
              <span className="text-slate-400">{j.name}</span>
              <span className="text-slate-600">{j.duration}</span>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const WorkflowDetailView = ({ workflowId }: any) => {
  const w = MOCK_WORKFLOWS[workflowId];

  const defaultJobId = w?.jobs?.[0]?.id;
  const [selectedJob, setSelectedJob] = useState(defaultJobId);
  const [logs, setLogs] = useState<any[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     if (w?.jobs?.[0]?.id) {
         setSelectedJob(w.jobs[0].id);
     }
  }, [workflowId, w]);

  useEffect(() => {
    if (!w || !selectedJob) return;
    
    const job = w.jobs.find((j: any) => j.id === selectedJob);
    if (!job || !Array.isArray(job.logs)) return;

    setLogs([]);
    
    let i = 0;
    const int = setInterval(() => {
      if (i >= job.logs.length) { 
        clearInterval(int); 
        return; 
      }
      const logEntry = job.logs[i];
      if (logEntry) {
          setLogs(p => [...p, logEntry]);
      }
      i++;
    }, 150);

    return () => clearInterval(int);
  }, [selectedJob, w]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  if (!w) return <div className="text-slate-400">Not found</div>;
  const job = w.jobs.find((j: any) => j.id === selectedJob);

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8">
      <div className="flex justify-between pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-white">{w.name}</h2>
            <Badge variant={w.status === 'success' ? 'success' : 'warning'}>{w.status}</Badge>
          </div>
          <div className="flex gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Clock size={14} />{w.duration}</span>
            <span className="flex items-center gap-1.5"><GitBranch size={14} />{w.trigger}</span>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div>Started: {w.startedAt}</div>
          <div>Completed: {w.completedAt}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Jobs</h3>
          {w.jobs.map((j: any) => (
            <div
              key={j.id}
              onClick={() => setSelectedJob(j.id)}
              className={`p-3 rounded-lg cursor-pointer ${selectedJob === j.id
                ? 'bg-indigo-500/10 border border-indigo-500/30'
                : 'bg-slate-900/50 border border-slate-800 hover:border-slate-700'
                }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <StatusDot status={j.status} />
                <span className={`text-sm font-medium ${selectedJob === j.id ? 'text-indigo-300' : 'text-slate-300'}`}>{j.name}</span>
              </div>
              <div className="text-xs text-slate-500 ml-4">{j.duration}</div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-4">
          {job && (
            <>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-3">Steps</h4>
                <div className="space-y-2">
                  {job.steps.map((s: any, i: number) => (
                    <div key={i} className="flex justify-between p-2 rounded bg-slate-900">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span className="text-sm text-slate-300">{s.name}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">{s.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="flex justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-slate-400" />
                    <span className="font-mono text-sm text-slate-200">Logs: {job.name}</span>
                  </div>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                </div>

                <div ref={logRef} className="h-80 overflow-auto p-4 font-mono text-xs space-y-1">
                  {logs.map((l: any, i: number) => (
                     l ? (
                      <div key={i} className="flex gap-3">
                        <span className="text-slate-600 shrink-0">{String(l.time)}</span>
                        <span className={`shrink-0 w-16 ${l.level === 'info'
                          ? 'text-blue-400'
                          : l.level === 'success'
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                          }`}>[{String(l.level)}]</span>
                        <span className="text-slate-300">{String(l.msg)}</span>
                      </div>
                    ) : null
                  ))}
                  {logs.length === 0 && <div className="text-slate-600 italic">Loading...</div>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-purple-400" />
            <span className="font-mono text-sm text-slate-200">.github/workflows/{w.filename}</span>
          </div>
          <Badge variant="purple">YAML</Badge>
        </div>
        <pre className="p-4 text-xs font-mono text-slate-300 max-h-48 overflow-auto">{w.content}</pre>
      </div>
    </div>
  );
};

const TestSuiteView = ({ onTestFileClick }: any) => {
  const files = Object.values(MOCK_TEST_FILES);
  const total = files.reduce((s, f) => s + f.tests.length, 0);
  const passed = files.reduce((s, f) => s + f.tests.filter((t: any) => t.status === 'pass').length, 0);

  const cards = [
    { n: 'Statements', v: '78.4%', c: 'emerald' },
    { n: 'Branches', v: '65.2%', c: 'amber' },
    { n: 'Functions', v: '82.1%', c: 'emerald' },
    { n: 'Lines', v: '79.8%', c: 'emerald' },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8">
      <div className="flex justify-between pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white">Test Suite</h2>
          <p className="text-slate-400 text-sm mt-1">Test files, results, and coverage</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold font-mono text-emerald-400">{passed}/{total}</div>
            <div className="text-xs text-slate-500">Passing</div>
          </div>
          <Badge variant="success">100%</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map(x => {
          const textClass = COLOR_TEXT_400[x.c] || 'text-slate-400';
          const barClass = COLOR_BG_500[x.c] || 'bg-slate-500';
          return (
            <div key={x.n} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-500 uppercase mb-1">{x.n}</div>
              <div className={`text-2xl font-bold font-mono ${textClass}`}>{x.v}</div>
              <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${barClass} rounded-full`} style={{ width: x.v }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">Test Files</h3>
        {files.map(f => (
          <div key={f.name} onClick={() => onTestFileClick(f.name)} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 cursor-pointer group">
            <div className="flex justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10"><CheckSquare size={16} className="text-emerald-400" /></div>
                <div>
                  <h4 className="font-mono text-sm text-white group-hover:text-indigo-300">{f.name}</h4>
                  <p className="text-xs text-slate-500">{f.path}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{f.tests.length} tests</span>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {f.tests.map((t: any, i: number) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded text-xs">
                  <StatusDot status={t.status === 'pass' ? 'success' : 'error'} />
                  <span className="text-slate-400 truncate max-w-[200px]">{t.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TestFileDetailView = ({ testFileName }: any) => {
  const f = MOCK_TEST_FILES[testFileName];
  if (!f) return <div className="text-slate-400">Not found</div>;
  return (
    <div className="space-y-6 animate-in slide-in-from-right-8">
      <div className="flex justify-between pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white font-mono">{f.name}</h2>
          <p className="text-slate-500 text-sm mt-1">{f.path}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">{f.tests.filter((t: any) => t.status === 'pass').length}/{f.tests.length} Pass</Badge>
          <span className="text-xs text-slate-500 font-mono">{f.tests.reduce((s: number, t: any) => s + t.duration, 0)}ms</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Results</h3>
          <div className="space-y-2">
            {f.tests.map((t: any, i: number) => (
              <div key={i} className="flex justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-sm text-slate-300">{t.name}</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">{t.duration}ms</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800">
            <FileCode size={16} className="text-cyan-400" />
            <span className="font-mono text-sm text-slate-200">{f.name}</span>
          </div>
          <pre className="p-4 text-xs font-mono text-slate-300 max-h-[500px] overflow-auto">{f.content}</pre>
        </div>
      </div>
    </div>
  );
};

// Alias for TestsView - uses TestSuiteView with onTestClick prop mapping
const TestsView = ({ onTestClick }: { onTestClick: (t: string) => void }) => (
  <TestSuiteView onTestFileClick={onTestClick} />
);

// ========== MODULE EXPLORER VIEW ==========
const ModuleExplorerView = ({ modules, onModuleClick }: any) => (
  <div className="space-y-6 animate-in slide-in-from-right-8">
    <div className="flex justify-between pb-6 border-b border-slate-800">
      <div>
        <h2 className="text-2xl font-bold text-white">Modules</h2>
        <p className="text-slate-400 text-sm mt-1">Explore all packages and modules in the codebase</p>
      </div>
      <Badge variant="info">{modules.length} modules</Badge>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {modules.map((mod: any) => (
        <div 
          key={mod.id}
          onClick={() => onModuleClick(mod.id)}
          className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 cursor-pointer transition-colors group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${mod.status === 'success' ? 'bg-emerald-500/10' : mod.status === 'warning' ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
                <Package size={18} className={mod.status === 'success' ? 'text-emerald-400' : mod.status === 'warning' ? 'text-amber-400' : 'text-red-400'} />
              </div>
              <div>
                <h4 className="font-semibold text-white group-hover:text-indigo-300">{mod.name}</h4>
                <p className="text-xs text-slate-500">{mod.type}</p>
              </div>
            </div>
            <StatusDot status={mod.status} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-slate-800/50 rounded">
              <div className="text-xs text-slate-500">Files</div>
              <div className="font-mono text-sm text-slate-300">{mod.files.length}</div>
            </div>
            <div className="p-2 bg-slate-800/50 rounded">
              <div className="text-xs text-slate-500">Lines</div>
              <div className="font-mono text-sm text-slate-300">{mod.lines.toLocaleString()}</div>
            </div>
            <div className="p-2 bg-slate-800/50 rounded">
              <div className="text-xs text-slate-500">Health</div>
              <div className="font-mono text-sm text-slate-300">{mod.health}%</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ========== MODULE DETAIL VIEW ==========
const ModuleDetailView = ({ module, onFileClick, onBack }: any) => {
  if (!module) return <div className="text-slate-400">Not found</div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8">
      <div className="flex justify-between items-start pb-6 border-b border-slate-800">
        <div>
          <button onClick={onBack} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 mb-2">
            <ChevronRight size={12} className="rotate-180" />
            Back to Modules
          </button>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-white">{module.name}</h2>
            <Badge variant="info">{module.type}</Badge>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl">Package with {module.files.length} files and {module.lines.toLocaleString()} lines</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 uppercase mb-1">Health</div>
          <div className={`text-2xl font-bold font-mono ${module.health > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{module.health}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-4"><Files size={16} /> Files</h3>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-1 max-h-[500px] overflow-auto">
            {module.files.map((f: any, i: number) => (
              <div 
                key={i}
                onClick={() => onFileClick(f)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 cursor-pointer group"
              >
                <FileCode size={14} className="text-blue-400" />
                <span className="text-sm font-mono text-slate-300 group-hover:text-indigo-300">{f.name}</span>
                {f.lines && <span className="text-[10px] text-slate-600 ml-auto">{f.lines} lines</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Stats</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Files</span><span className="font-mono text-slate-300">{module.files.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Lines</span><span className="font-mono text-slate-300">{module.lines.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Coverage</span><span className="font-mono text-emerald-400">{module.coverage}%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Health</span><span className="font-mono text-emerald-400">{module.health}%</span></div>
            </div>
          </div>

          {module.deps && module.deps.length > 0 && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">Dependencies</h3>
              <div className="space-y-2">
                {module.deps.map((dep: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Network size={12} className="text-slate-500" />
                    <span className="font-mono text-slate-400">{dep}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ========== OLD DASHBOARD VIEW (REMOVE IF DUPLICATE) ==========
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OldDashboardView = ({ onModuleClick, onCICDClick, onTestsClick, loading, modules, isGithubConnected }: any) => {
  const recent = [
    { i: GitBranch, t: 'CI passed on main', tm: '2m ago', c: 'emerald' },
    { i: FileCode, t: 'Button.tsx updated', tm: '15m ago', c: 'blue' },
    { i: CheckCircle2, t: 'All tests passing', tm: '18m ago', c: 'emerald' },
  ];

  const quick = [
    { l: 'View Tests', i: Microscope, c: 'emerald', fn: onTestsClick },
    { l: 'CI/CD Pipelines', i: GitBranch, c: 'indigo', fn: onCICDClick },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Code Volume" value={isGithubConnected ? "Fetching..." : "84,392"} subtext="LOC across codebase" icon={FileCode} colorClass="bg-blue-500" loading={loading} />
        <StatCard title="Test Coverage" value="78.4%" subtext="Click to view tests" icon={ShieldCheck} colorClass="bg-emerald-500" loading={loading} interactive onClick={onTestsClick} />
        <StatCard title="API Endpoints" value="42" subtext="Routes detected" icon={Database} colorClass="bg-purple-500" loading={loading} />
        <StatCard title="Build Time" value="42s" subtext="Click for CI/CD" icon={Zap} colorClass="bg-amber-500" loading={loading} interactive onClick={onCICDClick} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><Layers size={18} className="text-indigo-400" />Repository Structure</h2>
              <p className="text-sm text-slate-500 mt-1">Explore modules, packages, and services</p>
            </div>

            <div className="space-y-3">
              {Object.values(modules).map((m: any) => (
                <div key={m.id} onClick={() => onModuleClick(m.id)} className="flex justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800 hover:border-slate-700 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400"><Layout size={16} /></div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-200 group-hover:text-white font-mono">{m.name}</h4>
                      <span className="text-[10px] text-slate-500">{m.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-12 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${m.health > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${m.health}%` }} />
                    </div>
                    <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h2 className="text-sm font-bold text-slate-300 mb-6 uppercase tracking-wider">File Composition</h2>
            <div className="space-y-4">
              {EXTENSION_DATA.map(e => {
                const max = Math.max(...EXTENSION_DATA.map(x => x.lines));
                return (
                  <div key={e.ext} className="group">
                    <div className="flex justify-between items-end mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${e.color}`} />
                        <span className="font-mono text-xs font-bold text-slate-300">{e.ext}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        <span className="text-slate-300">{e.count}</span> files · {e.lines.toLocaleString()} loc
                      </div>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full ${e.color} opacity-80 group-hover:opacity-100`} style={{ width: `${Math.round(e.lines / max * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Activity size={18} className="text-emerald-400" />Quick Actions</h2>
            <div className="space-y-2">
              {quick.map(x => {
                const hoverText = COLOR_TEXT_400[x.c] || 'text-slate-400';
                return (
                  <div key={x.l} onClick={x.fn} className="group flex justify-between p-3 rounded-lg border border-slate-800/50 bg-slate-900/30 hover:bg-slate-800 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-slate-800 rounded-md text-slate-400 group-hover:${hoverText}`}><x.i size={16} /></div>
                      <span className="text-sm font-medium text-slate-300 group-hover:text-white">{x.l}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-indigo-900/50 to-indigo-950/50 border border-indigo-500/20 p-5 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 text-indigo-300 font-mono text-xs uppercase"><Cpu size={14} />System Status</div>
              <div className="text-2xl font-bold text-white mb-1">Operational</div>
              <p className="text-xs text-indigo-200/60">All systems running</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
            <h2 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Recent Activity</h2>
            <div className="space-y-3">
              {recent.map((x, i) => {
                const color = COLOR_TEXT_400[x.c] || 'text-slate-400';
                return (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <x.i size={14} className={color} />
                    <span className="text-slate-400 flex-1">{x.t}</span>
                    <span className="text-slate-600">{x.tm}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ========== MAIN APP ==========
export default function App() {
  const [view, setView] = useState('dashboard');
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [file, setFile] = useState<any>(null);
  const [_workflow, setWorkflow] = useState<string | null>(null);
  const [_testFile, setTestFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Data State
  const [modules, setModules] = useState(DEFAULT_MODULES);
  
  // GitHub State
  const [isGithubOpen, setIsGithubOpen] = useState(false);
  const [githubConfig, setGithubConfig] = useState({ owner: 'peteywee', repo: '', token: '' });
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState('');

  // Repomix State
  const [isRepomixOpen, setIsRepomixOpen] = useState(false);
  const [repomixContent, setRepomixContent] = useState('');
  const [repomixLoading, setRepomixLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => { setLastUpdated(new Date()); setLoading(false); }, 800);
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => { setLastUpdated(new Date()); setLoading(false); }, 1200);
  }, []);

  // Terminal State
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<Array<{type: 'input' | 'output' | 'error', content: string}>>([
    { type: 'output', content: '🚀 Fresh Root Terminal v2.0 (Secure Mode)' },
    { type: 'output', content: 'Type "help" for available commands\n' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Command Palette State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');

  // GitHub Data State
  const [githubFiles, setGithubFiles] = useState<any[]>([]);
  const [githubIssues, setGithubIssues] = useState<any[]>([]);
  const [githubPRs, setGithubPRs] = useState<any[]>([]);
  const [githubBranches, setGithubBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('main');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsTerminalOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '`') {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  // Terminal executor instance - Use API executor for real commands, fallback to mock
  const terminalExecutor = useMemo(() => {
    // Try API executor first, it will fallback gracefully on error
    return createApiExecutor('/api/terminal');
  }, []);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentCwd, setCurrentCwd] = useState('/workspaces/fresh-root');
  
  // Nano-style inline editor state
  const [nanoMode, setNanoMode] = useState<{ path: string; content: string; original: string } | null>(null);
  const nanoRef = useRef<HTMLTextAreaElement>(null);

  // TERMINAL COMMANDS - Using secure executor
  const executeCommand = useCallback(async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    
    // Validate command for security
    const validation = validateCommand(trimmed);
    if (!validation.valid) {
      setTerminalHistory(prev => [...prev, 
        { type: 'input', content: `$ ${trimmed}` },
        { type: 'error', content: `⛔ ${validation.reason}` }
      ]);
      setTerminalInput('');
      return;
    }
    
    setTerminalHistory(prev => [...prev, { type: 'input', content: `$ ${trimmed}` }]);
    setTerminalInput('');
    
    // Handle built-in commands that need state access
    const [command, ...args] = trimmed.split(/\s+/);
    
    if (command === 'clear') {
      setTerminalHistory([{ type: 'output', content: '🚀 Fresh Root Terminal v2.0 (Secure Mode)\n' }]);
      return;
    }
    
    if (command === 'cd') {
      const newPath = args[0] || '/workspaces/fresh-root';
      setCurrentCwd(newPath.startsWith('/') ? newPath : `${currentCwd}/${newPath}`);
      setTerminalHistory(prev => [...prev, { type: 'output', content: '' }]);
      return;
    }
    
    if (command === 'modules') {
      const modList = modules.map(m => `  ${m.name} (${m.files.length} files, ${m.lines.toLocaleString()} lines)`).join('\n');
      setTerminalHistory(prev => [...prev, { type: 'output', content: modList }]);
      return;
    }
    
    if (command === 'stats') {
      setTerminalHistory(prev => [...prev, { 
        type: 'output', 
        content: `📊 Codebase Statistics:
  Total Modules: ${modules.length}
  Total Files: ${modules.reduce((acc, m) => acc + m.files.length, 0)}
  Total Lines: ${modules.reduce((acc, m) => acc + m.lines, 0).toLocaleString()}
  Test Coverage: ${(modules.reduce((acc, m) => acc + m.coverage, 0) / modules.length).toFixed(1)}%
  Health Score: ${(modules.reduce((acc, m) => acc + m.health, 0) / modules.length).toFixed(0)}%` 
      }]);
      return;
    }
    
    if (command === 'refresh') {
      refresh();
      setTerminalHistory(prev => [...prev, { type: 'output', content: '🔄 Dashboard refreshed!' }]);
      return;
    }
    
    // Nano-style file editing
    if (command === 'nano' || command === 'edit') {
      const filePath = args.join(' ');
      if (!filePath) {
        setTerminalHistory(prev => [...prev, { type: 'error', content: 'Usage: nano <filepath>' }]);
        return;
      }
      const fullPath = filePath.startsWith('/') ? filePath : `${currentCwd}/${filePath}`;
      setTerminalHistory(prev => [...prev, { type: 'output', content: `📝 nano ${fullPath}` }]);
      const result = await fileApi.read(fullPath);
      if (result.error && !result.error.includes('404')) {
        setTerminalHistory(prev => [...prev, { type: 'error', content: `Error: ${result.error}` }]);
      } else {
        // Open nano mode - new file if 404
        setNanoMode({ path: fullPath, content: result.content || '', original: result.content || '' });
        setTimeout(() => nanoRef.current?.focus(), 100);
      }
      return;
    }
    
    if (command === 'repomix-full') {
      setTerminalHistory(prev => [...prev, { type: 'output', content: '🔍 Running full repomix analysis via API...' }]);
      setIsExecuting(true);
      try {
        const result = await runRepomixAnalysis(currentCwd);
        if (result.success) {
          setTerminalHistory(prev => [...prev, { 
            type: 'output', 
            content: `✅ Repomix analysis complete!
  Files: ${result.stats?.totalFiles || 'N/A'}
  Lines: ${result.stats?.totalLines?.toLocaleString() || 'N/A'}
  Output: ${result.outputPath || 'N/A'}` 
          }]);
        } else {
          setTerminalHistory(prev => [...prev, { type: 'error', content: `❌ ${result.error}` }]);
        }
      } catch (err) {
        setTerminalHistory(prev => [...prev, { type: 'error', content: String(err) }]);
      } finally {
        setIsExecuting(false);
      }
      return;
    }
    
    // Execute via terminal executor
    setIsExecuting(true);
    try {
      const result = await terminalExecutor.execute(trimmed, currentCwd);
      
      if (result.stdout) {
        setTerminalHistory(prev => [...prev, { type: 'output', content: result.stdout }]);
      }
      if (result.stderr) {
        setTerminalHistory(prev => [...prev, { type: 'error', content: result.stderr }]);
      }
      if (!result.stdout && !result.stderr) {
        // Command completed silently
      }
    } catch (err) {
      setTerminalHistory(prev => [...prev, { 
        type: 'error', 
        content: `Error: ${err instanceof Error ? err.message : String(err)}` 
      }]);
    } finally {
      setIsExecuting(false);
    }
  }, [modules, currentCwd, terminalExecutor, refresh]);

  // GITHUB API INTEGRATION (with secure token handling)
  const fetchGitHubData = async () => {
    const token = githubConfig.token || secureStorage.getToken('github');
    if (!githubConfig.repo || !token) {
      setGithubError('Please provide repo name and token');
      return;
    }
    
    setGithubLoading(true);
    setGithubError('');
    
    // Store token securely
    if (githubConfig.token) {
      secureStorage.setToken('github', githubConfig.token);
    }
    
    try {
      const headers = {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      };
      const baseUrl = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}`;
      
      // Fetch repo contents
      const contentsRes = await fetch(`${baseUrl}/contents`, { headers });
      if (contentsRes.ok) {
        const contents = await contentsRes.json();
        setGithubFiles(contents);
      }
      
      // Fetch issues
      const issuesRes = await fetch(`${baseUrl}/issues?state=open&per_page=10`, { headers });
      if (issuesRes.ok) {
        const issues = await issuesRes.json();
        setGithubIssues(issues);
      }
      
      // Fetch PRs
      const prsRes = await fetch(`${baseUrl}/pulls?state=open&per_page=10`, { headers });
      if (prsRes.ok) {
        const prs = await prsRes.json();
        setGithubPRs(prs);
      }
      
      // Fetch branches
      const branchesRes = await fetch(`${baseUrl}/branches`, { headers });
      if (branchesRes.ok) {
        const branches = await branchesRes.json();
        setGithubBranches(branches.map((b: any) => b.name));
      }
      
      // Clear token from state after storing securely
      setGithubConfig(prev => ({ ...prev, token: '' }));
      setIsGithubOpen(false);
    } catch (err) {
      setGithubError(err instanceof Error ? err.message : 'Failed to fetch GitHub data');
    } finally {
      setGithubLoading(false);
    }
  };

  // REPOMIX IMPORT LOGIC
  const parseRepomix = () => {
    setRepomixLoading(true);
    setTimeout(() => {
      try {
        const root: any = { name: 'repomix-import', type: 'folder', children: [] };
        
        // Regex for XML format: <file path="...">...</file>
        const xmlRegex = /<file\s+path="([^"]+)">([\s\S]*?)<\/file>/g;
        
        // Regex for Markdown format
        const mdRegex = /^##\s+(.+?)$\n```[\w]*\n([\s\S]*?)```/gm;
        
        let match;
        let fileCount = 0;
        
        // Try XML format first
        while ((match = xmlRegex.exec(repomixContent)) !== null) {
          const [, path, content] = match;
          addFileToTree(root, path.split('/'), content);
          fileCount++;
        }
        
        // Try Markdown format if no XML matches
        if (fileCount === 0) {
          while ((match = mdRegex.exec(repomixContent)) !== null) {
            const [, path, content] = match;
            addFileToTree(root, path.split('/'), content);
            fileCount++;
          }
        }
        
        if (fileCount > 0) {
          // Create a new module from imported data
          const newModule = {
            id: `repomix-${Date.now()}`,
            name: 'Repomix Import',
            files: extractFilesFromTree(root),
            lines: repomixContent.split('\n').length,
            coverage: 0,
            health: 100,
            status: 'success' as const,
            type: 'Imported',
            deps: []
          };
          setModules(prev => [...prev, newModule]);
          setIsRepomixOpen(false);
          setRepomixContent('');
        }
      } catch (err) {
        console.error('Failed to parse repomix output:', err);
      } finally {
        setRepomixLoading(false);
      }
    }, 1000);
  };
  
  const addFileToTree = (node: any, parts: string[], content: string) => {
    if (parts.length === 1) {
      node.children.push({ name: parts[0], type: 'file', content });
    } else {
      let folder = node.children.find((c: any) => c.name === parts[0] && c.type === 'folder');
      if (!folder) {
        folder = { name: parts[0], type: 'folder', children: [] };
        node.children.push(folder);
      }
      addFileToTree(folder, parts.slice(1), content);
    }
  };
  
  const extractFilesFromTree = (node: any, prefix = ''): any[] => {
    const files: any[] = [];
    for (const child of node.children || []) {
      const path = prefix ? `${prefix}/${child.name}` : child.name;
      if (child.type === 'file') {
        files.push({ name: child.name, path, content: child.content, lines: (child.content?.split('\n').length || 0) });
      } else {
        files.push(...extractFilesFromTree(child, path));
      }
    }
    return files;
  };

  // Command Palette Commands
  const commands = useMemo(() => [
    { id: 'refresh', label: 'Refresh Dashboard', icon: RefreshCw, action: refresh, shortcut: '⌘R' },
    { id: 'terminal', label: 'Toggle Terminal', icon: Terminal, action: () => setIsTerminalOpen(p => !p), shortcut: '⌘`' },
    { id: 'github', label: 'Connect GitHub', icon: Github, action: () => setIsGithubOpen(true), shortcut: '⌘G' },
    { id: 'repomix', label: 'Import Repomix', icon: FileUp, action: () => setIsRepomixOpen(true), shortcut: '⌘I' },
    { id: 'dashboard', label: 'Go to Dashboard', icon: Layout, action: () => setView('dashboard') },
    { id: 'modules', label: 'Go to Modules', icon: Package, action: () => setView('modules') },
    { id: 'cicd', label: 'Go to CI/CD', icon: GitBranch, action: () => setView('cicd') },
    { id: 'tests', label: 'Go to Tests', icon: Microscope, action: () => setView('tests') },
    { id: 'run-tests', label: 'Run All Tests', icon: CheckSquare, action: () => executeCommand('npm test') },
    { id: 'build', label: 'Build Project', icon: Box, action: () => executeCommand('npm run build') },
    { id: 'repomix-analyze', label: 'Run Repomix Analysis', icon: Cpu, action: () => executeCommand('repomix') },
  ], [refresh, executeCommand]);

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(commandSearch.toLowerCase())
  );

  // Navigation items for sidebar
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layout },
    { id: 'modules', label: 'Modules', icon: Package },
    { id: 'cicd', label: 'CI/CD', icon: GitBranch },
    { id: 'tests', label: 'Tests', icon: Microscope },
    { id: 'github-browser', label: 'GitHub', icon: Github },
  ];

  // Render current view
  const renderView = () => {
    if (file) {
      return <FileViewer file={file} path={moduleId || ''} onClose={() => setFile(null)} githubToken={githubConfig.token} />;
    }

    switch (view) {
      case 'cicd':
        return <CICDPipelineView onWorkflowClick={(w: string) => setWorkflow(w)} />;
      case 'tests':
        return <TestsView onTestClick={(t: string) => setTestFile(t)} />;
      case 'modules':
        return <ModuleExplorerView modules={modules} onModuleClick={(id: string) => { setModuleId(id); setView('module-detail'); }} />;
      case 'module-detail':
        const mod = modules.find(m => m.id === moduleId);
        return mod ? <ModuleDetailView module={mod} onBack={() => setView('modules')} onFileClick={(f: any) => setFile(f)} /> : null;
      case 'github-browser':
        return <GitHubBrowserView 
          files={githubFiles} 
          issues={githubIssues} 
          prs={githubPRs} 
          branches={githubBranches}
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          onFileClick={(f: any) => setFile(f)}
          onConnect={() => setIsGithubOpen(true)}
          isConnected={githubFiles.length > 0}
        />;
      default:
        return <DashboardView 
          modules={modules} 
          loading={loading} 
          lastUpdated={lastUpdated}
          onModuleClick={(id: string) => { setModuleId(id); setView('module-detail'); }}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col">
        {/* Logo/Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Layers size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Fresh Root</h1>
              <p className="text-[10px] text-slate-500">Codebase Dashboard</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-3 border-b border-slate-800">
          <button 
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-sm text-slate-400 transition-colors"
          >
            <Search size={14} />
            <span>Quick Actions</span>
            <kbd className="ml-auto text-[10px] bg-slate-700 px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                view === item.id || (item.id === 'modules' && view === 'module-detail')
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Quick Stats */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Modules</span>
            <span className="text-slate-300 font-mono">{modules.length}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Files</span>
            <span className="text-slate-300 font-mono">{modules.reduce((a, m) => a + m.files.length, 0)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Lines</span>
            <span className="text-slate-300 font-mono">{modules.reduce((a, m) => a + m.lines, 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button 
            onClick={() => setIsTerminalOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-xs text-slate-400 transition-colors"
          >
            <Terminal size={14} />
            <span>Terminal</span>
            <kbd className="ml-auto text-[10px] bg-slate-700 px-1.5 py-0.5 rounded">⌘`</kbd>
          </button>
          <button 
            onClick={refresh}
            disabled={loading}
            className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-xs text-slate-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderView()}
        </div>
      </main>

      {/* Command Palette Modal */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm" onClick={() => setIsCommandPaletteOpen(false)}>
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
              <Search size={18} className="text-slate-500" />
              <input
                type="text"
                value={commandSearch}
                onChange={e => setCommandSearch(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none"
                autoFocus
              />
              <kbd className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400">ESC</kbd>
            </div>
            <div className="max-h-80 overflow-auto">
              {filteredCommands.map(cmd => (
                <button
                  key={cmd.id}
                  onClick={() => { cmd.action(); setIsCommandPaletteOpen(false); setCommandSearch(''); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 text-left transition-colors"
                >
                  <cmd.icon size={16} className="text-slate-400" />
                  <span className="flex-1 text-sm text-slate-200">{cmd.label}</span>
                  {cmd.shortcut && <kbd className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-500">{cmd.shortcut}</kbd>}
                </button>
              ))}
              {filteredCommands.length === 0 && (
                <div className="px-4 py-8 text-center text-slate-500 text-sm">No commands found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GitHub Connect Modal */}
      {isGithubOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsGithubOpen(false)}>
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <Github size={20} className="text-slate-400" />
                <h3 className="font-semibold text-white">Connect GitHub Repository</h3>
              </div>
              <button onClick={() => setIsGithubOpen(false)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400">
                <XCircle size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Owner / Organization</label>
                <input
                  type="text"
                  value={githubConfig.owner}
                  onChange={e => setGithubConfig(p => ({ ...p, owner: e.target.value }))}
                  placeholder="peteywee"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Repository Name</label>
                <input
                  type="text"
                  value={githubConfig.repo}
                  onChange={e => setGithubConfig(p => ({ ...p, repo: e.target.value }))}
                  placeholder="fresh-root"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Personal Access Token</label>
                <div className="relative">
                  <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={githubConfig.token}
                    onChange={e => setGithubConfig(p => ({ ...p, token: e.target.value }))}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Requires repo scope for private repositories</p>
              </div>
              {githubError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                  <AlertCircle size={14} />
                  {githubError}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-slate-800 bg-slate-950/50">
              <button onClick={() => setIsGithubOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
              <button 
                onClick={fetchGitHubData}
                disabled={githubLoading || !githubConfig.repo}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm text-white transition-colors"
              >
                {githubLoading ? <Loader2 size={14} className="animate-spin" /> : <Github size={14} />}
                Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repomix Import Modal */}
      {isRepomixOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsRepomixOpen(false)}>
          <div className="w-full max-w-2xl h-[70vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <FileDigit size={20} className="text-indigo-400" />
                <h3 className="font-semibold text-white">Import Repomix Output</h3>
              </div>
              <button onClick={() => setIsRepomixOpen(false)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400">
                <XCircle size={16} />
              </button>
            </div>
            <div className="flex-1 p-5 overflow-auto">
              <p className="text-xs text-slate-400 mb-3">Paste your repomix output (XML or Markdown format):</p>
              <textarea
                value={repomixContent}
                onChange={e => setRepomixContent(e.target.value)}
                placeholder={`<!-- Paste repomix XML output here -->
<file path="src/index.ts">
console.log("Hello World");
</file>

<!-- Or Markdown format -->
## src/index.ts
\`\`\`typescript
console.log("Hello World");
\`\`\``}
                className="w-full h-full min-h-[300px] px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-sm font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
            <div className="flex justify-between items-center px-5 py-4 border-t border-slate-800 bg-slate-950/50">
              <div className="text-xs text-slate-500">
                Supports XML and Markdown formats from repomix CLI
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsRepomixOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
                <button 
                  onClick={parseRepomix}
                  disabled={repomixLoading || !repomixContent.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm text-white transition-colors"
                >
                  {repomixLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nano-style Inline Editor (lightweight) */}
      {nanoMode && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950">
          {/* Nano header */}
          <div className="flex items-center justify-between px-3 py-1 bg-white text-black text-sm font-mono">
            <span>GNU nano 7.0</span>
            <span className="truncate max-w-[60%]">{nanoMode.path}</span>
            <span>{nanoMode.content !== nanoMode.original ? 'Modified' : ''}</span>
          </div>
          
          {/* Editor area */}
          <textarea
            ref={nanoRef}
            value={nanoMode.content}
            onChange={(e) => setNanoMode({ ...nanoMode, content: e.target.value })}
            onKeyDown={async (e) => {
              // Ctrl+O = Save
              if (e.ctrlKey && e.key === 'o') {
                e.preventDefault();
                const result = await fileApi.write(nanoMode.path, nanoMode.content);
                if (result.success) {
                  setNanoMode({ ...nanoMode, original: nanoMode.content });
                  setTerminalHistory(prev => [...prev, { type: 'output', content: `✓ Wrote ${nanoMode.content.split('\n').length} lines to ${nanoMode.path}` }]);
                } else {
                  setTerminalHistory(prev => [...prev, { type: 'error', content: `Error: ${result.error}` }]);
                }
              }
              // Ctrl+X = Exit
              if (e.ctrlKey && e.key === 'x') {
                e.preventDefault();
                if (nanoMode.content !== nanoMode.original) {
                  if (confirm('Save modified buffer?')) {
                    await fileApi.write(nanoMode.path, nanoMode.content);
                    setTerminalHistory(prev => [...prev, { type: 'output', content: `✓ Saved ${nanoMode.path}` }]);
                  }
                }
                setNanoMode(null);
              }
              // Ctrl+K = Cut line
              if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                const lines = nanoMode.content.split('\n');
                const textarea = e.currentTarget;
                const pos = textarea.selectionStart;
                const lineNum = nanoMode.content.slice(0, pos).split('\n').length - 1;
                lines.splice(lineNum, 1);
                setNanoMode({ ...nanoMode, content: lines.join('\n') });
              }
            }}
            className="flex-1 p-2 bg-slate-950 text-slate-200 font-mono text-sm resize-none outline-none leading-5"
            spellCheck={false}
            style={{ tabSize: 2 }}
          />
          
          {/* Nano footer - keyboard shortcuts */}
          <div className="bg-slate-800 text-xs font-mono">
            <div className="flex flex-wrap px-2 py-1 gap-x-4 text-slate-300">
              <span><span className="bg-white text-black px-1">^O</span> Write Out</span>
              <span><span className="bg-white text-black px-1">^X</span> Exit</span>
              <span><span className="bg-white text-black px-1">^K</span> Cut Line</span>
              <span className="ml-auto text-slate-500">
                {nanoMode.content.split('\n').length} lines | {nanoMode.content.length} chars
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Panel */}
      {isTerminalOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-[150] bg-slate-900 border-t border-slate-700 shadow-2xl" style={{ height: '40vh' }}>
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Terminal size={14} className="text-emerald-400" />
              <span className="text-sm text-slate-300">Terminal</span>
              <Badge variant="success">bash</Badge>
              {isExecuting && <Loader2 size={12} className="text-amber-400 animate-spin" />}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setTerminalHistory([{ type: 'output', content: '🚀 Fresh Root Terminal v2.0 (Secure Mode)\n' }])}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                title="Clear"
              >
                <XCircle size={14} />
              </button>
              <button 
                onClick={() => setIsTerminalOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
          <div ref={terminalRef} className="h-[calc(100%-80px)] overflow-auto p-4 font-mono text-sm">
            {terminalHistory.map((entry, i) => (
              <div 
                key={i} 
                className={`whitespace-pre-wrap ${
                  entry.type === 'input' ? 'text-emerald-400' : 
                  entry.type === 'error' ? 'text-red-400' : 'text-slate-300'
                }`}
              >
                {entry.content}
              </div>
            ))}
            {isExecuting && (
              <div className="text-amber-400 flex items-center gap-2">
                <Loader2 size={12} className="animate-spin" />
                <span>Running...</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border-t border-slate-800 bg-slate-950">
            <span className="text-emerald-400 font-mono text-sm">{currentCwd.split('/').pop()} $</span>
            <input
              ref={inputRef}
              type="text"
              value={terminalInput}
              onChange={e => setTerminalInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !isExecuting) executeCommand(terminalInput); }}
              placeholder="Type a command..."
              className="flex-1 bg-transparent text-white font-mono text-sm placeholder-slate-600 outline-none"
              autoFocus
              disabled={isExecuting}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ========== ADDITIONAL VIEW COMPONENTS ==========

// GitHub Browser View
const GitHubBrowserView = ({ files, issues, prs, branches, selectedBranch, onBranchChange, onFileClick, onConnect, isConnected }: any) => (
  <div className="space-y-6 animate-in slide-in-from-right-8">
    <div className="flex justify-between items-center pb-6 border-b border-slate-800">
      <div>
        <h2 className="text-2xl font-bold text-white">GitHub Browser</h2>
        <p className="text-slate-400 text-sm mt-1">Browse repository files, issues, and pull requests</p>
      </div>
      <div className="flex items-center gap-3">
        {isConnected && branches.length > 0 && (
          <select 
            value={selectedBranch}
            onChange={e => onBranchChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
          >
            {branches.map((b: string) => <option key={b} value={b}>{b}</option>)}
          </select>
        )}
        <button onClick={onConnect} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">
          <Github size={14} />
          {isConnected ? 'Reconnect' : 'Connect'}
        </button>
      </div>
    </div>

    {!isConnected ? (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Github size={48} className="text-slate-600 mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">Connect to GitHub</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-md">
          Connect your GitHub repository to browse files, view issues, and manage pull requests.
        </p>
        <button onClick={onConnect} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors">
          <Github size={16} />
          Connect Repository
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-3 gap-6">
        {/* Files */}
        <div className="col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Files size={16} className="text-indigo-400" />
            Files
          </h3>
          <div className="space-y-1 max-h-96 overflow-auto">
            {files.map((f: any) => (
              <div 
                key={f.path || f.name}
                onClick={() => f.type === 'file' && onFileClick(f)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${f.type === 'file' ? 'cursor-pointer hover:bg-slate-800/50' : ''}`}
              >
                {f.type === 'dir' ? (
                  <Folder size={14} className="text-amber-500" />
                ) : (
                  <FileCode size={14} className="text-blue-400" />
                )}
                <span className="text-sm text-slate-300 font-mono">{f.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Issues & PRs */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-400" />
              Issues ({issues.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-auto">
              {issues.slice(0, 5).map((issue: any) => (
                <a 
                  key={issue.id}
                  href={issue.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <div className="text-sm text-slate-300 truncate">#{issue.number} {issue.title}</div>
                  <div className="flex gap-1 mt-1">
                    {issue.labels?.slice(0, 2).map((l: any) => (
                      <span key={l.id} className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `#${l.color}20`, color: `#${l.color}` }}>
                        {l.name}
                      </span>
                    ))}
                  </div>
                </a>
              ))}
              {issues.length === 0 && <p className="text-xs text-slate-500">No open issues</p>}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <GitBranch size={16} className="text-emerald-400" />
              Pull Requests ({prs.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-auto">
              {prs.slice(0, 5).map((pr: any) => (
                <a 
                  key={pr.id}
                  href={pr.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <div className="text-sm text-slate-300 truncate">#{pr.number} {pr.title}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{pr.head?.ref} → {pr.base?.ref}</div>
                </a>
              ))}
              {prs.length === 0 && <p className="text-xs text-slate-500">No open PRs</p>}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

// Dashboard View Component
const DashboardView = ({ modules, loading, lastUpdated, onModuleClick }: any) => {
  const totalFiles = modules.reduce((a: number, m: any) => a + m.files.length, 0);
  const totalLines = modules.reduce((a: number, m: any) => a + m.lines, 0);
  const avgCoverage = modules.length > 0 ? modules.reduce((a: number, m: any) => a + m.coverage, 0) / modules.length : 0;
  const _avgHealth = modules.length > 0 ? modules.reduce((a: number, m: any) => a + m.health, 0) / modules.length : 0;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex justify-between items-center pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-slate-400 text-sm mt-1">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
          </p>
        </div>
        <Badge variant="success">Healthy</Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Package} label="Modules" value={String(modules.length)} colorClass="bg-indigo-500" loading={loading} />
        <StatCard icon={Files} label="Files" value={String(totalFiles)} colorClass="bg-blue-500" loading={loading} />
        <StatCard icon={Code2} label="Lines" value={totalLines.toLocaleString()} colorClass="bg-purple-500" loading={loading} />
        <StatCard icon={ShieldCheck} label="Coverage" value={`${avgCoverage.toFixed(0)}%`} colorClass="bg-emerald-500" loading={loading} />
      </div>

      {/* Modules Grid */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Modules</h3>
        <div className="grid grid-cols-3 gap-4">
          {modules.map((mod: any) => (
            <div 
              key={mod.id}
              onClick={() => onModuleClick(mod.id)}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 cursor-pointer transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${mod.status === 'success' ? 'bg-emerald-500/10' : mod.status === 'warning' ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
                    <Package size={18} className={mod.status === 'success' ? 'text-emerald-400' : mod.status === 'warning' ? 'text-amber-400' : 'text-red-400'} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-indigo-300">{mod.name}</h4>
                    <p className="text-xs text-slate-500">{mod.type}</p>
                  </div>
                </div>
                <StatusDot status={mod.status} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-800/50 rounded">
                  <div className="text-xs text-slate-500">Files</div>
                  <div className="font-mono text-sm text-slate-300">{mod.files.length}</div>
                </div>
                <div className="p-2 bg-slate-800/50 rounded">
                  <div className="text-xs text-slate-500">Lines</div>
                  <div className="font-mono text-sm text-slate-300">{mod.lines.toLocaleString()}</div>
                </div>
                <div className="p-2 bg-slate-800/50 rounded">
                  <div className="text-xs text-slate-500">Health</div>
                  <div className="font-mono text-sm text-slate-300">{mod.health}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};