import { describe, expect, it } from 'vitest';

import { filterSnippets } from './snippet-search';
import type { LearningSnippet } from './data/learning-types';

const snippet = (over: Partial<LearningSnippet>): LearningSnippet => ({
  snippetId: 1, slug: 's', title: 'Pad for the safe area', description: 'Keep rows clear of the home indicator.',
  code: 'const insets = useSafeAreaInsets();', language: 'tsx', explanation: 'x', rnVersionVerified: '0.86', demos: [], ...over,
});

describe('snippet search', () => {
  it('matches an identifier inside the code, not just the title', () => {
    const all = [snippet({}), snippet({ snippetId: 2, title: 'Debounce a value', code: 'setTimeout(fn, 200);' })];
    expect(filterSnippets(all, 'useSafeAreaInsets').map((s) => s.snippetId)).toEqual([1]);
    expect(filterSnippets(all, 'setTimeout').map((s) => s.snippetId)).toEqual([2]);
  });

  it('matches title and description case-insensitively, and returns everything for an empty query', () => {
    const all = [snippet({}), snippet({ snippetId: 2, title: 'Debounce a value', description: 'Wait before searching.', code: 'x' })];
    expect(filterSnippets(all, 'DEBOUNCE').map((s) => s.snippetId)).toEqual([2]);
    expect(filterSnippets(all, 'home indicator').map((s) => s.snippetId)).toEqual([1]);
    expect(filterSnippets(all, '   ')).toHaveLength(2);
  });
});
