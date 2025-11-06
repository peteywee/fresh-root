#!/usr/bin/env bash
# [P0][APP][CODE] Bootstrap Scaffold
# Tags: P0, APP, CODE
set -euo pipefail

# --- sanity: pnpm only ---
corepack enable
corepack prepare pnpm@9.12.0 --activate

# --- workspace files ---
cat > pnpm-workspace.yaml <<'YAML'
packages:
  - apps/*
  - packages/*
YAML

cat > package.json <<'JSON'
{
  "name": "fresh-root",
  "private": true,
  "packageManager": "pnpm@9.12.0",
  "scripts": {
    "dev": "pnpm --filter @apps/web dev",
    "build": "pnpm -r build",
    "typecheck": "pnpm -r typecheck",
    "lint": "echo \"(placeholder)\" && exit 0"
  }
}
JSON

cat > tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@fresh-schedules/types": ["packages/types/src/index.ts"]
    }
  }
}
JSON

cat > .gitignore <<'GIT'
node_modules/
.npm/
.pnpm-store/
.next/
dist/
out/
coverage/
.playwright/

.env
.env.*
!.env.example

.firebase/
firebase-debug.log
firestore-debug.log
ui-debug.log
functions/.runtimeconfig.json

.vscode/
.idea/
.DS_Store
Thumbs.db

_local/
notes/
scripts-local/
GIT

# --- packages/types ---
mkdir -p packages/types/src
cat > packages/types/package.json <<'JSON'
{
  "name": "@fresh-schedules/types",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.6.3"
  },
  "dependencies": {
    "zod": "^3.23.8"
  }
}
JSON

cat > packages/types/tsconfig.json <<'JSON'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "composite": true
  },
  "include": ["src"]
}
JSON

cat > packages/types/src/index.ts <<'TS'
import { z } from "zod";

export const Role = z.enum(["admin", "manager", "staff"]);
export type Role = z.infer<typeof Role>;
TS

# --- apps/web ---
mkdir -p apps/web/app
cat > apps/web/package.json <<'JSON'
{
  "name": "@apps/web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "15.0.0",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "tailwindcss": "^3.4.13",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47"
  }
}
JSON

cat > apps/web/next.config.ts <<'TS'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: '1mb' } }
}
export default nextConfig
TS

cat > apps/web/tailwind.config.ts <<'TS'
import type { Config } from 'tailwindcss'
const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: []
}
export default config
TS

cat > apps/web/postcss.config.js <<'JS'
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
JS

cat > apps/web/app/globals.css <<'CSS'
@tailwind base;
@tailwind components;
@tailwind utilities;
CSS

cat > apps/web/app/layout.tsx <<'TSX'
import './globals.css'
import React from 'react'

export const metadata = { title: 'Fresh Schedules' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
TSX

cat > apps/web/app/page.tsx <<'TSX'
export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Fresh Schedules</h1>
      <p className="text-sm opacity-80 mt-2">Scaffold is live.</p>
    </main>
  )
}
TSX

# --- env example ---
cat > .env.example <<'ENV'
PORT=3000
ENV

echo "✅ Files written."
echo "🔧 Installing deps..."
pnpm install

echo "🔎 Typecheck..."
pnpm -r typecheck

echo "🏗️  Build..."
pnpm -r build

echo "✨ All green. You can run: pnpm --filter @apps/web dev"
