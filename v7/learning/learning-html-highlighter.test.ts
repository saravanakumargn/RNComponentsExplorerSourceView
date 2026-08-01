import { describe, expect, it } from 'vitest';

import {
  LEARNING_HIGHLIGHT_CSS,
  enhanceLearningHtmlCodeBlocks,
} from './learning-html-highlighter';

describe('enhanceLearningHtmlCodeBlocks', () => {
  it('highlights an explicitly labelled JavaScript block without a network request', () => {
    const html = enhanceLearningHtmlCodeBlocks('<pre><code class="language-javascript">import React from \'react\';</code></pre>');

    expect(html).toContain('class="language-javascript hljs"');
    expect(html).toContain('hljs-keyword');
    expect(html).toContain('hljs-string');
  });

  it('recognises the unquoted language attribute format used by legacy learning content', () => {
    const html = enhanceLearningHtmlCodeBlocks('<pre><code class=language-javascript>import { useNavigation } from \'@react-navigation/native\';</code></pre>');

    expect(html).toContain('class="language-javascript hljs"');
    expect(html).toContain('hljs-keyword');
    expect(html).toContain('hljs-string');
  });

  it('detects a common language when the content does not provide a language class', () => {
    const html = enhanceLearningHtmlCodeBlocks('<pre><code>const count = 1;</code></pre>');

    expect(html).toContain('class="hljs language-javascript"');
    expect(html).toContain('hljs-keyword');
  });

  it('preserves explicitly excluded code and non-code HTML', () => {
    const source = '<p>Example</p><pre><code class="nohighlight">const plain = true;</code></pre>';

    expect(enhanceLearningHtmlCodeBlocks(source)).toBe(source);
  });

  it('leaves empty and malformed code blocks unchanged', () => {
    expect(enhanceLearningHtmlCodeBlocks('<pre><code></code></pre>')).toBe('<pre><code></code></pre>');
    expect(enhanceLearningHtmlCodeBlocks('<pre>not a code element</pre>')).toBe('<pre>not a code element</pre>');
  });

  it('ships token colors and a readable code surface for generated Highlight.js markup', () => {
    expect(LEARNING_HIGHLIGHT_CSS).toContain('.hljs{');
    expect(LEARNING_HIGHLIGHT_CSS).toContain('.hljs-keyword');
  });
});
