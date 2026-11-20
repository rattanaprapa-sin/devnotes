/**
 * Utility functions for parsing, calculating stats, and toggling
 * GFM Markdown Checklist / Task items (- [ ] / - [x]).
 */

/**
 * Extracts checklist statistics from markdown content.
 * @param {string} content
 * @returns {{ total: number, completed: number, percent: number, hasChecklist: boolean }}
 */
export function getChecklistStats(content) {
  if (!content || typeof content !== 'string') {
    return { total: 0, completed: 0, percent: 0, hasChecklist: false };
  }

  const taskRegex = /^[ \t]*[-*+]\s+\[([ xX])\]/gm;
  let total = 0;
  let completed = 0;
  let match;

  while ((match = taskRegex.exec(content)) !== null) {
    total++;
    if (match[1].toLowerCase() === 'x') {
      completed++;
    }
  }

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return {
    total,
    completed,
    percent,
    hasChecklist: total > 0,
  };
}

/**
 * Toggles a markdown task at a specific line or match index.
 * Works seamlessly across both CRLF (\r\n) and LF (\n) line endings.
 * @param {string} content - Markdown content
 * @param {{ line?: number, index?: number }} target - Line number (1-based) or task index (0-based)
 * @returns {string} - Updated markdown content
 */
export function toggleMarkdownTask(content, { line, index }) {
  if (!content || typeof content !== 'string') return content;

  const isCrlf = content.includes('\r\n');
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const taskRegex = /^([ \t]*[-*+]\s+\[)([ xX])(\].*)$/;

  // 1. Try matching by 1-based line number if provided
  if (typeof line === 'number' && line >= 1 && line <= lines.length) {
    const targetLine = lines[line - 1];
    if (taskRegex.test(targetLine)) {
      lines[line - 1] = targetLine.replace(taskRegex, (match, prefix, checkChar, suffix) => {
        const newCheck = checkChar === ' ' ? 'x' : ' ';
        return `${prefix}${newCheck}${suffix}`;
      });
      return lines.join(isCrlf ? '\r\n' : '\n');
    }
  }

  // 2. Fallback to match by sequential task index
  let matchCount = 0;
  let replaced = false;
  const resultLines = lines.map((curLine) => {
    if (taskRegex.test(curLine)) {
      if (matchCount === index && !replaced) {
        replaced = true;
        matchCount++;
        return curLine.replace(taskRegex, (match, prefix, checkChar, suffix) => {
          const newCheck = checkChar === ' ' ? 'x' : ' ';
          return `${prefix}${newCheck}${suffix}`;
        });
      }
      matchCount++;
    }
    return curLine;
  });

  return resultLines.join(isCrlf ? '\r\n' : '\n');
}

/**
 * Formats markdown preview text so raw markers look like clean symbols.
 * - Checklist items:   - [ ] → ☐   /   - [x] → ☑
 * - Bullet list items: - text → • text
 * - Numbered list:     1. text → 1. text  (unchanged, already readable)
 * - Table rows / headers: stripped for card preview
 * @param {string} text
 * @returns {string}
 */
export function formatMarkdownPreview(text) {
  if (!text || typeof text !== 'string') return '';
  const clean = text
    // Checklist done: - [x] or - [X]
    .replace(/^[ \t]*[-*+]\s+\[[xX]\]\s*/gm, '☑ ')
    // Checklist todo: - [ ]
    .replace(/^[ \t]*[-*+]\s+\[ \]\s*/gm, '☐ ')
    // Bullet list: - text  →  • text  (must come AFTER checklist replacements)
    .replace(/^[ \t]*[-*+]\s+/gm, '• ')
    // Strip table separator rows like | --- | --- |
    .replace(/^\|[\s\-:|]+\|.*$/gm, '')
    // Strip table rows (keep content between pipes, join with space)
    .replace(/^\|(.*)\|$/gm, (_, inner) =>
      inner
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean)
        .join('  ')
    );

  // Filter out leading/trailing/empty lines and take the first 3 meaningful lines for card preview
  const lines = clean
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.slice(0, 3).join('\n');
}
