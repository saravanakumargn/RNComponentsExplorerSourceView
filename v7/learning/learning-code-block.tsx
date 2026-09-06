import { EnrichedMarkdownText } from 'react-native-enriched-markdown';

import { toFencedCodeBlock } from '@/features/learning/code-fence';
import { learningMarkdownStyle } from '@/features/learning/native-markdown-reader';

/**
 * Standalone code, rendered by the same engine — and with the same colours — as
 * code inside a lesson.
 *
 * Snippets and challenges used to hand-roll a code box out of a `Text` in Menlo,
 * which is why they were the only places in the app showing flat, uncoloured
 * code. Highlighting is not something the content pipeline bakes in: `hljs` in
 * the build only validates fence languages. It belongs to the Markdown
 * renderer, and `learningMarkdownStyle.codeBlock` already carries the palette.
 * So the fix is to give the renderer a fence to work with rather than to build a
 * second highlighter.
 *
 * **The flavor is a real choice, not a default.** `github` draws a container
 * with a language chip and its own copy button, and scrolls long lines
 * horizontally — right for a challenge, which shows one block at a time and has
 * no copy control of its own. `commonmark` drops that header and wraps instead —
 * right for the snippet list, where the card already has a Copy button whose
 * confirmation state is the thing readers rely on, and where a second copy
 * affordance per card would be noise.
 */
export function LearningCodeBlock({ code, language, flavor = 'github' }: { code: string; language: string; flavor?: 'github' | 'commonmark' }) {
  return (
    <EnrichedMarkdownText
      flavor={flavor}
      markdown={toFencedCodeBlock(code, language)}
      markdownStyle={learningMarkdownStyle}
      selectable
    />
  );
}
