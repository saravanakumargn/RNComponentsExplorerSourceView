import hljs from 'highlight.js/lib/common';

const AUTO_DETECT_LANGUAGES = [
  'javascript',
  'typescript',
  'json',
  'xml',
  'css',
  'bash',
  'sql',
  'python',
  'java',
  'swift',
];

const CODE_BLOCK_PATTERN = /<pre(?<preAttributes>\s[^>]*)?>\s*<code(?<codeAttributes>\s[^>]*)?>(?<code>[\s\S]*?)<\/code>\s*<\/pre>/gi;
const CLASS_ATTRIBUTE_PATTERN = /\bclass=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;

/** A compact, local Highlight.js theme based on the legacy learning reader. */
export const LEARNING_HIGHLIGHT_CSS = '.hljs{display:block;overflow-x:auto;padding:1em;background:#f3f3f3;color:#444;border-radius:8px}.hljs-comment{color:#697070}.hljs-attribute,.hljs-doctag,.hljs-keyword,.hljs-meta .hljs-keyword,.hljs-name,.hljs-selector-tag{font-weight:700}.hljs-deletion,.hljs-number,.hljs-quote,.hljs-selector-class,.hljs-selector-id,.hljs-string,.hljs-template-tag,.hljs-type{color:#800}.hljs-section,.hljs-title{color:#800;font-weight:700}.hljs-link,.hljs-operator,.hljs-regexp,.hljs-selector-attr,.hljs-selector-pseudo,.hljs-symbol,.hljs-template-variable,.hljs-variable{color:#ab5656}.hljs-literal{color:#695}.hljs-addition,.hljs-built_in,.hljs-bullet,.hljs-code{color:#397300}.hljs-meta{color:#1f7199}.hljs-meta .hljs-string{color:#38a}.hljs-emphasis{font-style:italic}.hljs-strong{font-weight:700}';

function decodeCodeEntities(code: string): string {
  return code
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function getClassNames(attributes: string): string[] {
  const match = attributes.match(CLASS_ATTRIBUTE_PATTERN);
  const classValue = match?.[1] ?? match?.[2] ?? match?.[3];
  return classValue ? classValue.split(/\s+/).filter(Boolean) : [];
}

function getExplicitLanguage(classNames: string[]): string | undefined {
  for (const className of classNames) {
    const candidate = className.replace(/^(?:language|lang)-/i, '');
    if (hljs.getLanguage(candidate)) return candidate;
  }
  return undefined;
}

function setClassNames(attributes: string, classNames: string[]): string {
  const classValue = classNames.join(' ');
  if (CLASS_ATTRIBUTE_PATTERN.test(attributes)) {
    return attributes.replace(CLASS_ATTRIBUTE_PATTERN, `class="${classValue}"`);
  }
  return `${attributes} class="${classValue}"`;
}

/**
 * Highlights bundled learning HTML before it is handed to the WebView. No
 * script, stylesheet, or code content is fetched at runtime.
 */
export function enhanceLearningHtmlCodeBlocks(html: string): string {
  return html.replace(CODE_BLOCK_PATTERN, (fullMatch, preAttributes = '', codeAttributes = '', code = '') => {
    const classNames = getClassNames(codeAttributes);
    if (!code.trim() || classNames.some((className) => /^(?:nohighlight|no-highlight)$/i.test(className))) return fullMatch;

    const explicitLanguage = getExplicitLanguage(classNames);
    const source = decodeCodeEntities(code);
    const result = explicitLanguage
      ? hljs.highlight(source, { language: explicitLanguage, ignoreIllegals: true })
      : hljs.highlightAuto(source, AUTO_DETECT_LANGUAGES);
    const nextClassNames = [
      ...classNames,
      'hljs',
      ...(explicitLanguage || !result.language ? [] : [`language-${result.language}`]),
    ];

    return `<pre${preAttributes}><code${setClassNames(codeAttributes, [...new Set(nextClassNames)])}>${result.value}</code></pre>`;
  });
}
