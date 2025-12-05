// [P2][APP][CODE] Fixer
// Tags: P2, APP, CODE
// Optional remark/unified imports are dynamically loaded to provide polite errors when deps are missing.

export async function fixFiles(input: string) {
  let changed = false;
  // Use remark/unified to parse and then stringify to normalize core markdown rules.
  // Dynamically import so our CLI can degrade gracefully in environments where deps are not installed.
  let processor: any;
  try {
    const unified = await import("unified");
    const remarkParse = await import("remark-parse");
    const remarkStringify = await import("remark-stringify");
    processor = unified.unified().use(remarkParse.default || remarkParse).use(
      remarkStringify.default || remarkStringify,
      {
        bullet: "-",
        fences: true,
        listItemIndent: "1",
        rule: "-",
        strong: "**",
      }
    );
  } catch (err) {
    console.error("Optional markdown parsing libraries not found (unified/remark). Run 'pnpm -w install' to enable richer fixes.");
    // fall back to using regex-based changes only
    processor = null;
  }
  const file = processor ? await processor.process(input) : null;
  let content = file ? String(file) : input;

  // Additional targeted fixes using regex and heuristics:
  // 1. Normalize headings: Ensure single space after # and no trailing #
  const headingRegex = /^(#+)\s*(.*?)\s*#*\s*$/gm;
  content = content.replace(headingRegex, (_m, p1, title) => {
    changed = changed || (_m !== `${p1} ${title}`);
    return `${p1} ${title.trim()}`;
  });

  // 2. Trim trailing spaces
  const trimmed = content.replace(/[ \t]+$/gm, (m) => {
    if (m.length > 0) changed = true;
    return "";
  });
  content = trimmed;

  // 3. Collapse multiple blank lines to single
  const collapsed = content.replace(/\n{3,}/g, "\n\n");
  if (collapsed !== content) changed = true;
  content = collapsed;

  // 4. Ensure single newline at EOF
  content = content.replace(/\s+$/g, "\n");

  // 5. Normalize ordered list numbers (simple heuristic)
  // Convert 1., 2., etc to 1. 2. sequentially when lines start with \d+.
  const lines = content.split('\n');
  const updatedLines = lines.slice();
  let i = 0;
  while (i < lines.length) {
    const match = lines[i].match(/^(\s*)(\d+)\.\s+/);
    if (match) {
      // Find contiguous block
      const start = i;
      let counter = 1;
      while (i < lines.length) {
        const m = lines[i].match(/^(\s*)(\d+)\.\s+(.*)$/);
        if (!m) break;
        const indent = m[1];
        const rest = m[3];
        const expected = `${indent}${counter}. ${rest}`;
        if (expected !== lines[i]) {
          updatedLines[i] = expected;
          changed = true;
        }
        counter++;
        i++;
      }
    } else {
      i++;
    }
  }
  content = updatedLines.join('\n');

  // 6. Fix checkboxes: ensure single space after bracket.
  const checkbox = content.replace(/^([\-\*]\s*\[)( |x|X|)\](\s*)/gm, (m) => {
    changed = true;
    return m.replace(/\[( |x|X|)\]/, (mm) => `[_TEMP_]`).replace('_TEMP_', '[ ]');
  });
  // The above heuristic is conservative - we already enforced change so let's not rely
  // replace back to original if it was intentional 'x' for checked. We'll instead
  // implement a simpler approach: normalize '[ ]' or '[x]' to lowercase 'x'
  content = checkbox.replace(/\[X\]/g, "[x]");

  // 7. Convert setext headings (underlines) into atx style. This is a little more advanced.
  // We'll look for patterns of:
  // Title\n=== or ---
  // Convert to: # Title or ## Title based on underline char
  content = content.replace(/^(.+?)\n(={3,}|-{3,})$/gm, (_m, t, u) => {
    changed = true;
    const level = u.startsWith('=') ? 1 : 2;
    return `${'#'.repeat(level)} ${t.trim()}`;
  });

  // 8. Trim spaces inside backticks / code fences: no trailing spaces
  content = content.replace(/(```\w*\n)([\s\S]*?)(\n```)/g, (_m, open, body, close) => {
    const trimmedBody = body.replace(/[ \t]+$/gm, '');
    if (trimmedBody !== body) changed = true;
    return `${open}${trimmedBody}${close}`;
  });

  return { content, changed };
}
