import { describe, expect, it } from 'vitest';

import { linkGlossaryTerms, parseGlossaryUrl } from './glossary-inline';

const terms = [
  { termId: 3, term: 'Stale closure', shortDefinition: 'A closure over an old render.' },
  { termId: 1, term: 'Closure', shortDefinition: 'A function plus its captured scope.' },
  { termId: 2, term: 'JSI', shortDefinition: 'The JavaScript Interface.' },
];

describe('native Markdown glossary linking', () => {
  it('links the first prose mention and prefers longer terms', () => {
    expect(linkGlossaryTerms('A stale closure is useful.', terms)).toBe('A [stale closure](glossary://term/3) is useful.');
  });

  it('does not link headings, fenced code, inline code, or existing links', () => {
    const source = '## Closure\n\n```ts\nconst closure = () => {};\n```\n\nUse `closure` with [Closure](/docs).';
    expect(linkGlossaryTerms(source, terms)).toBe(source);
  });

  it('parses only valid native glossary URLs', () => {
    expect(parseGlossaryUrl('glossary://term/12')).toBe(12);
    expect(parseGlossaryUrl('https://example.com')).toBeNull();
    expect(parseGlossaryUrl('glossary://term/0')).toBeNull();
  });
});
