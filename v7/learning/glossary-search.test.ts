import { describe, expect, it } from 'vitest';

import type { GlossaryTerm } from './data/learning-types';
import { filterGlossaryTerms } from './glossary-search';

function term(termId: number, name: string, shortDefinition: string): GlossaryTerm {
  return { termId, slug: name.toLowerCase().replace(/\s+/g, '-'), term: name, shortDefinition, fullExplanation: '', rnVersionVerified: '0.86' };
}

const terms = [
  term(1, 'Fabric', 'The New Architecture renderer.'),
  term(2, 'Reference', 'A pointer to something else.'),
  term(3, 'ref', 'A mutable container that survives a render.'),
  term(4, 'Hermes', 'The JavaScript engine, which holds a ref to each host object.'),
];

describe('glossary search', () => {
  it('returns everything for an empty search', () => {
    expect(filterGlossaryTerms(terms, '')).toHaveLength(4);
    expect(filterGlossaryTerms(terms, '   ')).toHaveLength(4);
  });

  it('ranks a name that starts with the query above one that merely contains it, and both above a definition match', () => {
    expect(filterGlossaryTerms(terms, 'ref').map((entry) => entry.term)).toEqual(['ref', 'Reference', 'Hermes']);
  });

  it('finds a term by what it does when its name is not known', () => {
    expect(filterGlossaryTerms(terms, 'renderer').map((entry) => entry.term)).toEqual(['Fabric']);
  });

  it('ignores case and surrounding whitespace', () => {
    expect(filterGlossaryTerms(terms, '  FABRIC ').map((entry) => entry.term)).toEqual(['Fabric']);
  });

  it('returns nothing when no term matches, rather than falling back to everything', () => {
    expect(filterGlossaryTerms(terms, 'kotlin')).toEqual([]);
  });
});
