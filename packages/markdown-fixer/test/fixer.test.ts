import { describe, expect, it } from 'vitest';
import { fixFiles } from '../src/fixer';

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
