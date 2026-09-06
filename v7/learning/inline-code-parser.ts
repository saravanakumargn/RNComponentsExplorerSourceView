/**
 * Splits authored markdown backticks into plain-text and inline-code segments.
 */
export function splitInlineCode(text: string): { text: string; code: boolean }[] {
  return text
    .split(/(`[^`]+`)/g)
    .filter((part) => part.length > 0)
    .map((part) => (part.startsWith('`') && part.endsWith('`') && part.length > 1 ? { text: part.slice(1, -1), code: true } : { text: part, code: false }));
}
