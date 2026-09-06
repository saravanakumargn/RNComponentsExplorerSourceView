import type { LearningSnippet } from './data/learning-types';

/**
 * Snippets are searched over their code as well as their prose.
 *
 * The thing a reader remembers about a snippet is usually an identifier from
 * inside it — `useSafeAreaInsets`, `keyExtractor` — not the title someone gave
 * it, so a search that only matched titles would miss the common case.
 */
export function filterSnippets(snippets: LearningSnippet[], query: string): LearningSnippet[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return snippets;
  return snippets.filter((snippet) =>
    snippet.title.toLowerCase().includes(needle)
    || snippet.description.toLowerCase().includes(needle)
    || snippet.code.toLowerCase().includes(needle));
}
