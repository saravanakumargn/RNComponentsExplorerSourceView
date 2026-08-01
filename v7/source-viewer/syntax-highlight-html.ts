import hljs from 'highlight.js/lib/common';

import { LEARNING_HIGHLIGHT_CSS } from '@/features/learning/learning-html-highlighter';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Renders source code as a highlighted, scrollable HTML document for a WebView. */
export function buildSourceHighlightHtml(content: string, language: string): string {
  const highlighted = hljs.getLanguage(language)
    ? hljs.highlight(content, { language, ignoreIllegals: true }).value
    : escapeHtml(content);

  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <style>
      html, body { margin: 0; padding: 0; background: #f3f3f3; }
      .hljs { margin: 0; font-family: Menlo, Consolas, monospace; font-size: 13px; line-height: 1.5; }
      ${LEARNING_HIGHLIGHT_CSS}
    </style>
  </head>
  <body>
    <pre class="hljs"><code>${highlighted}</code></pre>
  </body>
</html>`;
}
