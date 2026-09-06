import type { GlossaryTerm } from '@/features/learning/data/learning-types';

/**
 * Filters the glossary as the reader types.
 *
 * A term matches on its name or its definition, so searching for what something
 * *does* finds it even when its name is not known — which is the usual reason
 * to open a glossary. Name matches are ranked first, and a name that starts
 * with the query first of all, so "ref" leads with "ref" rather than with a
 * definition that happens to mention it.
 */
export function filterGlossaryTerms(terms: GlossaryTerm[], query: string): GlossaryTerm[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return terms;

  const scored: { term: GlossaryTerm; rank: number }[] = [];
  for (const term of terms) {
    const name = term.term.toLowerCase();
    if (name.startsWith(needle)) scored.push({ term, rank: 0 });
    else if (name.includes(needle)) scored.push({ term, rank: 1 });
    else if (term.shortDefinition.toLowerCase().includes(needle)) scored.push({ term, rank: 2 });
  }
  return scored.sort((left, right) => left.rank - right.rank || left.term.term.localeCompare(right.term.term)).map((entry) => entry.term);
}
