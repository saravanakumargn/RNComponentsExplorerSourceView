import type { GlossaryTerm } from '@/features/learning/data/learning-types';
import { filterGlossaryTerms } from './glossary-search';

export type GlossaryNeighbours = {
  current: GlossaryTerm | null;
  previous: GlossaryTerm | null;
  next: GlossaryTerm | null;
  /** 1-based place in the list being browsed; 0 when the term is not in it. */
  position: number;
  total: number;
};

/**
 * Resolves a term and the two either side of it, so an entry can be read as
 * part of a list rather than as a destination reached one tap at a time.
 *
 * Neighbours follow whatever list the reader is actually looking at: with a
 * search active, next steps through the *matches*, in the ranked order the
 * list shows them, not through the alphabet behind them. An entry reached from
 * somewhere the search does not reach — a "see also" link, an inline term in a
 * lesson — falls back to the full glossary instead of reporting itself missing.
 */
export function getGlossaryNeighbours(terms: GlossaryTerm[], termId: number, query = ''): GlossaryNeighbours {
  const matches = filterGlossaryTerms(terms, query);
  const browsing = matches.some((entry) => entry.termId === termId) ? matches : terms;
  const index = browsing.findIndex((entry) => entry.termId === termId);

  if (index === -1) return { current: null, previous: null, next: null, position: 0, total: browsing.length };

  return {
    current: browsing[index],
    previous: browsing[index - 1] ?? null,
    next: browsing[index + 1] ?? null,
    position: index + 1,
    total: browsing.length,
  };
}
