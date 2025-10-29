/**


Minimal MCP-like stdio JSON-RPC server (read-only).


Methods:



repo.search { q: string, globs?: string[] }




repo.read   { path: string }




repo.paths  { globs?: string[] }
*/
import { createInterface } from 'node:readline';
import fs from 'node:fs/promises';
import fg from 'fast-glob';
import { parse, success, error } from 'jsonrpc-lite';



type Req = { id: string|number|null, method: string, params?: any };
const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: false });
async function repoSearch(q: string, globs: string[] = ['/*']) {
  const paths = await fg(globs, { dot: true, ignore: ['node_modules/', '.pnpm-store/', '.git/', '.next/', 'dist/'] });
  const res: Array<{ path: string; line: number; text: string }> = [];
  for (const p of paths) {
    if (p.endsWith('.png') || p.endsWith('.jpg') || p.endsWith('.woff')) continue;
    const text = await fs.readFile(p, 'utf8').catch(() => '');
    if (!text) continue;
    const lines = text.split('\n');
    lines.forEach((ln, i) => {
      if (ln.toLowerCase().includes(q.toLowerCase())) res.push({ path: p, line: i + 1, text: ln.trim() });
    });
  }
  return res.slice(0, 500);
}
async function repoRead(path: string) {
  const text = await fs.readFile(path, 'utf8');
  if (path.startsWith('.env')) return '[REDACTED_ENV]';
  return text;
}
async function repoPaths(globs: string[] = ['/*']) {
  return await fg(globs, { dot: true, ignore: ['node_modules/', '.pnpm-store/', '.git/', '.next/', 'dist/'] });
}
async function dispatch(req: Req) {
  const { method, params } = req;
  if (method === 'repo.search') return await repoSearch(params?.q ?? '', params?.globs);
  if (method === 'repo.read')   return await repoRead(params?.path);
  if (method === 'repo.paths')  return await repoPaths(params?.globs);
  throw new Error(`Unknown method: ${method}`);
}
rl.on('line', async (line) => {
  try {
  const parsedAny: any = parse(line);
  if (parsedAny.type !== 'request') return;
  const req = parsedAny.payload as Req;
    const result = await dispatch(req);
    process.stdout.write(JSON.stringify(success(req.id ?? null, result)) + '\n');
  } catch (e: any) {
    process.stdout.write(JSON.stringify(error(null, { code: -32603, message: e?.message || 'Internal error' })) + '\n');
  }
});
