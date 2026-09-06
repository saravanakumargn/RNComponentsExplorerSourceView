/**
 * Wraps a bare code string back into a Markdown fence so the same renderer that
 * styles lesson code can style it.
 *
 * The build *extracts* snippet and challenge code out of its fence into a plain
 * column, so by the time a screen holds it there is no fence left to style. This
 * puts one back.
 *
 * The fence has to be longer than the longest run of backticks inside the code,
 * or a sample that itself shows a Markdown fence would terminate the block early
 * and spill raw text onto the screen. That is the CommonMark rule, and it costs
 * nothing to honour.
 */
export function toFencedCodeBlock(code: string, language: string): string {
  const longestRun = Math.max(0, ...[...code.matchAll(/`+/g)].map((match) => match[0].length));
  const fence = '`'.repeat(Math.max(3, longestRun + 1));
  return `${fence}${language}\n${code}\n${fence}`;
}
