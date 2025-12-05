// [P1][TEST][TEST] Fixer Test tests
// Tags: P1, TEST, TEST
import { describe, expect, it } from 'vitest';

import fs from 'fs';
import path from 'path';
import { fixFiles } from '../src/fixer';
import { collectMarkdownFiles } from '../src/fsHelpers';

describe('markdown-fixer', () => {
  it('normalizes headings, trims trailing, collapses blanks, and handles lists', async () => {
    const raw = `#Heading  

Some text.  


##  Another heading###\n\n- 1. First  \n\n1. 1. NotSequential\n2. 2. Second\n\n
a title\n===\n`; // intentional issues
    const { content, changed } = await fixFiles(raw);
    expect(changed).toBe(true);
    expect(content.includes('# Heading')).toBeTruthy();
    expect(content.includes('Some text.')).toBeTruthy();
    // setext converted
    expect(content.includes('# a title')).toBeTruthy();
    // trailing spaces removed
    expect(/\s$/.test(content)).toBe(false);
  });
});

describe('collectMarkdownFiles', () => {
  it('traverses nested directories and finds markdown files', async () => {
    const tmp = path.join(process.cwd(), 'test_tmp');
    try {
      if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });
      const sub = path.join(tmp, 'subdir');
      fs.mkdirSync(sub, { recursive: true });
      const file1 = path.join(tmp, 'a.md');
      const file2 = path.join(sub, 'b.markdown');
      fs.writeFileSync(file1, '# a');
      fs.writeFileSync(file2, '# b');
      const found = collectMarkdownFiles(tmp);
      expect(found).toContain(file1);
      expect(found).toContain(file2);
    } finally {
      try { fs.rmSync(tmp, { recursive: true }); } catch(_) {}
    }
  });
});
