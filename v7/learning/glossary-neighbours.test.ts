import { describe, expect, it } from 'vitest';

import type { GlossaryTerm } from './data/learning-types';
import { getGlossaryNeighbours } from './glossary-neighbours';

function term(termId: number, name: string, shortDefinition: string): GlossaryTerm {
  return { termId, slug: name.toLowerCase().replace(/\s+/g, '-'), term: name, shortDefinition, fullExplanation: '', rnVersionVerified: '0.86' };
}

const terms = [
  term(1, 'Fabric', 'The New Architecture renderer.'),
  term(2, 'Hermes', 'The JavaScript engine.'),
  term(3, 'ref', 'A mutable container that survives a render.'),
  term(4, 'Turbo Module', 'A lazily loaded native module.'),
];

describe('glossary neighbours', () => {
  it('resolves the term with the entries either side of it', () => {
    const { current, previous, next } = getGlossaryNeighbours(terms, 2);

    expect(current?.term).toBe('Hermes');
    expect(previous?.term).toBe('Fabric');
    expect(next?.term).toBe('ref');
  });

  it('reports the ends of the list so navigation can stop there', () => {
    expect(getGlossaryNeighbours(terms, 1).previous).toBeNull();
    expect(getGlossaryNeighbours(terms, 1).next?.term).toBe('Hermes');
    expect(getGlossaryNeighbours(terms, 4).next).toBeNull();
    expect(getGlossaryNeighbours(terms, 4).previous?.term).toBe('ref');
  });

  it('counts the reader position in the list', () => {
    expect(getGlossaryNeighbours(terms, 3)).toMatchObject({ position: 3, total: 4 });
  });

  it('steps through search matches when a search is active', () => {
    const { previous, next, position, total } = getGlossaryNeighbours(terms, 3, 're');

    // "ref" and "renderer" match; the unrelated terms are not stepped through.
    expect(position).toBe(1);
    expect(total).toBe(2);
    expect(previous).toBeNull();
    expect(next?.term).toBe('Fabric');
  });

  it('falls back to the full glossary for a term the search does not match', () => {
    const { current, next, total } = getGlossaryNeighbours(terms, 2, 'ref');

    expect(current?.term).toBe('Hermes');
    expect(next?.term).toBe('ref');
    expect(total).toBe(4);
  });

  it('reports an unknown term as missing rather than guessing a neighbour', () => {
    expect(getGlossaryNeighbours(terms, 99)).toMatchObject({ current: null, previous: null, next: null, position: 0 });
  });

  it('handles an empty glossary', () => {
    expect(getGlossaryNeighbours([], 1)).toMatchObject({ current: null, position: 0, total: 0 });
  });
});
