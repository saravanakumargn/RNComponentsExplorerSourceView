import type { GlossaryTermReference } from '@/features/learning/data/learning-types';

const GLOSSARY_URL = 'glossary://term/';

function escapeRegExp(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function isWordCharacter(character: string | undefined): boolean { return character !== undefined && /[A-Za-z0-9]/.test(character); }

/** Adds native Markdown links for the first prose mention of each glossary term. */
export function linkGlossaryTerms(markdown: string, terms: GlossaryTermReference[]): string {
  if (!markdown || terms.length === 0) return markdown;
  const linked = new Set<number>();
  let inFence = false;
  return markdown.split('\n').map((line) => {
    if (/^\s*(`{3,}|~{3,})/.test(line)) { inFence = !inFence; return line; }
    if (inFence || /^\s*#/.test(line)) return line;
    return line.split(/(`[^`]*`|\[[^\]]*\]\([^)]*\))/g).map((part) => {
      if (part.startsWith('`') || part.startsWith('[')) return part;
      let prose = part;
      const replacements: string[] = [];
      for (const term of [...terms].sort((left, right) => right.term.length - left.term.length)) {
        if (linked.has(term.termId) || !term.term.trim()) continue;
        const match = new RegExp(escapeRegExp(term.term), 'i').exec(prose);
        if (!match) continue;
        const start = match.index;
        const end = start + match[0].length;
        if (isWordCharacter(prose[start - 1]) || isWordCharacter(prose[end])) continue;
        const marker = `\u0000${replacements.length}\u0000`;
        replacements.push(`[${match[0]}](${GLOSSARY_URL}${term.termId})`);
        prose = `${prose.slice(0, start)}${marker}${prose.slice(end)}`;
        linked.add(term.termId);
      }
      return replacements.reduce((value, replacement, index) => value.replace(`\u0000${index}\u0000`, replacement), prose);
    }).join('');
  }).join('\n');
}

export function parseGlossaryUrl(url: string): number | null {
  const match = new RegExp(`^${escapeRegExp(GLOSSARY_URL)}(\\d+)$`).exec(url);
  const termId = match ? Number(match[1]) : Number.NaN;
  return Number.isInteger(termId) && termId > 0 ? termId : null;
}
