import type { SearchResult, SearchResultType } from '@/features/learning/data/learning-types';

/** Below this, a query matches so much that the results say nothing. */
export const SEARCH_MIN_QUERY_LENGTH = 2;
/** Results shown at once. The screen says when a search hit this. */
export const SEARCH_RESULT_LIMIT = 50;

const TYPE_LABELS: Record<SearchResultType, string> = {
  lesson: 'Lesson',
  glossary_term: 'Glossary',
  interview_question: 'Interview',
  faq: 'FAQ',
  cheat_sheet: 'Cheat sheet',
  checklist: 'Checklist',
  quiz: 'Quiz',
  library_tool: 'Good to know',
  decision_guide: 'Decision guide',
  snippet: 'Snippet',
  code_challenge: 'Code challenge',
  project: 'Project',
};

export function getSearchResultTypeLabel(type: SearchResultType): string {
  return TYPE_LABELS[type];
}

/**
 * Escapes a reader's query for use inside a `LIKE` pattern.
 *
 * `%` and `_` are wildcards in SQL but ordinary characters to someone typing
 * "100%" or "use_callback", so they are escaped rather than honoured — an
 * unescaped `%` would match every record in the corpus and read as a bug.
 * The paired `ESCAPE '\'` clause lives in the query itself.
 */
export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

export function isSearchable(query: string): boolean {
  return query.trim().length >= SEARCH_MIN_QUERY_LENGTH;
}

/**
 * Where a result opens. A lesson needs its track as well as itself, which is
 * why the search query carries a parent id: the reader route is nested under
 * the track and cannot be built from the lesson alone.
 *
 * The switch is **exhaustive on purpose** — it has no `default:`. It used to
 * end in one returning the Good to know reader, which meant a new content type
 * silently opened an unrelated record by id instead of failing. Without the
 * catch-all, adding a `SearchResultType` is a type error until it has a route.
 *
 * Study plan items reuse this rather than carrying a second route table, which
 * is why it also has to cover every type a plan may order.
 */
export function getSearchResultRoute(result: SearchResult):
  | { pathname: '/learning-path/[topicId]/[subtopicId]'; params: { topicId: number; subtopicId: number } }
  | { pathname: '/glossary/[termId]'; params: { termId: number } }
  | { pathname: '/interview-prep/read/[questionId]'; params: { questionId: number } }
  | { pathname: '/faq/read/[faqId]'; params: { faqId: number } }
  | { pathname: '/cheat-sheets/[sheetId]'; params: { sheetId: number } }
  | { pathname: '/checklists/[checklistId]'; params: { checklistId: number } }
  | { pathname: '/quizzes/[quizId]'; params: { quizId: number } }
  | { pathname: '/good-to-know/read/[itemId]'; params: { itemId: number } }
  | { pathname: '/decision-guides/[guideId]'; params: { guideId: number } }
  | { pathname: '/code-challenges/[challengeId]'; params: { challengeId: number } }
  | { pathname: '/projects/[projectId]'; params: { projectId: number } }
  | { pathname: '/snippets'; params?: undefined } {
  switch (result.itemType) {
    case 'lesson':
      return { pathname: '/learning-path/[topicId]/[subtopicId]', params: { topicId: result.parentId ?? 0, subtopicId: result.itemId } };
    case 'glossary_term':
      return { pathname: '/glossary/[termId]', params: { termId: result.itemId } };
    case 'interview_question':
      return { pathname: '/interview-prep/read/[questionId]', params: { questionId: result.itemId } };
    case 'faq':
      return { pathname: '/faq/read/[faqId]', params: { faqId: result.itemId } };
    case 'cheat_sheet':
      return { pathname: '/cheat-sheets/[sheetId]', params: { sheetId: result.itemId } };
    case 'checklist':
      return { pathname: '/checklists/[checklistId]', params: { checklistId: result.itemId } };
    case 'quiz':
      return { pathname: '/quizzes/[quizId]', params: { quizId: result.itemId } };
    case 'decision_guide':
      return { pathname: '/decision-guides/[guideId]', params: { guideId: result.itemId } };
    case 'snippet':
      return { pathname: '/snippets' };
    case 'code_challenge':
      return { pathname: '/code-challenges/[challengeId]', params: { challengeId: result.itemId } };
    case 'project':
      return { pathname: '/projects/[projectId]', params: { projectId: result.itemId } };
    case 'library_tool':
      return { pathname: '/good-to-know/read/[itemId]', params: { itemId: result.itemId } };
  }
}

/**
 * The line above the results. A truncated search says so — a reader who cannot
 * tell "these are all the matches" from "these are the first fifty" will trust
 * the wrong one.
 */
export function formatSearchSummary(results: SearchResult[], truncated: boolean): string {
  if (results.length === 0) return 'No matches';
  const count = `${results.length} ${results.length === 1 ? 'match' : 'matches'}`;
  return truncated ? `First ${results.length} matches · narrow the search to see fewer` : count;
}
