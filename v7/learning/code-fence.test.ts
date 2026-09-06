import { describe, expect, it } from 'vitest';

import { toFencedCodeBlock } from './code-fence';

describe('toFencedCodeBlock', () => {
  it('wraps code in a fence carrying its language', () => {
    expect(toFencedCodeBlock('const a = 1;', 'ts')).toBe('```ts\nconst a = 1;\n```');
  });

  it('grows the fence past any backtick run in the code', () => {
    // A sample containing a fence would otherwise close the block early and
    // spill the rest of the code onto the screen as prose.
    const code = 'const readme = \'```ts\\ncode\\n```\';';
    const wrapped = toFencedCodeBlock(code, 'tsx');
    expect(wrapped.startsWith('````tsx\n')).toBe(true);
    expect(wrapped.endsWith('\n````')).toBe(true);
  });

  it('handles a template literal with a single backtick pair', () => {
    expect(toFencedCodeBlock('const a = `x`;', 'ts')).toBe('```ts\nconst a = `x`;\n```');
  });
});
