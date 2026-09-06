import { describe, expect, it } from 'vitest';

import { splitInlineCode } from './inline-code-parser';

describe('inline code splitting', () => {
  it('splits authored backticks into code segments', () => {
    expect(splitInlineCode('Both `window` and `self` point at it.')).toEqual([
      { text: 'Both ', code: false },
      { text: 'window', code: true },
      { text: ' and ', code: false },
      { text: 'self', code: true },
      { text: ' point at it.', code: false },
    ]);
  });

  it('passes plain text through as a single segment', () => {
    expect(splitInlineCode('No code here.')).toEqual([{ text: 'No code here.', code: false }]);
    expect(splitInlineCode('')).toEqual([]);
  });
});
