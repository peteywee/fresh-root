import fs from 'fs';
import path from 'path';

export function collectMarkdownFiles(dir: string, exclude: Set<string> = new Set(['node_modules', '.next', 'dist'])): string[] {
  const targets: string[] = [];
  function walker(d: string) {
    const items = fs.readdirSync(d);
    for (const it of items) {
      const p = path.join(d, it);
      const st = fs.statSync(p);
      if (st.isDirectory()) {
        if (!exclude.has(it)) walker(p);
      } else if (st.isFile()) {
        if (p.endsWith('.md') || p.endsWith('.markdown')) targets.push(p);
      }
    }
  }
  walker(dir);
  return targets;
}

export default collectMarkdownFiles;
