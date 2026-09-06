import { describe, expect, it } from 'vitest';

import type { SearchResult } from './data/learning-types';
import {
  SEARCH_MIN_QUERY_LENGTH,
  escapeLikePattern,
  formatSearchSummary,
  getSearchResultRoute,
  getSearchResultTypeLabel,
  isSearchable,
} from './learning-search';

function result(overrides: Partial<SearchResult> & Pick<SearchResult, 'itemType'>): SearchResult {
  return { itemId: 1, parentId: null, title: 'Title', subtitle: 'Subtitle', ...overrides };
}

describe('library search', () => {
  it('escapes the wildcards a reader means literally, so "100%" is not a search for everything', () => {
    expect(escapeLikePattern('100%')).toBe('100\\%');
    expect(escapeLikePattern('use_callback')).toBe('use\\_callback');
    expect(escapeLikePattern('a\\b')).toBe('a\\\\b');
    expect(escapeLikePattern('hermes')).toBe('hermes');
  });

  it('waits for a query long enough to mean something', () => {
    expect(SEARCH_MIN_QUERY_LENGTH).toBe(2);
    expect(isSearchable('h')).toBe(false);
    expect(isSearchable('  h  ')).toBe(false);
    expect(isSearchable('he')).toBe(true);
    expect(isSearchable('   ')).toBe(false);
  });

  it('opens a lesson through its track, which the lesson id alone cannot address', () => {
    expect(getSearchResultRoute(result({ itemType: 'lesson', itemId: 1314, parentId: 13 })))
      .toEqual({ pathname: '/learning-path/[topicId]/[subtopicId]', params: { topicId: 13, subtopicId: 1314 } });
  });

  it('routes every other content type to its own reader', () => {
    expect(getSearchResultRoute(result({ itemType: 'glossary_term', itemId: 4 })).pathname).toBe('/glossary/[termId]');
    expect(getSearchResultRoute(result({ itemType: 'interview_question', itemId: 23 })).pathname).toBe('/interview-prep/read/[questionId]');
    expect(getSearchResultRoute(result({ itemType: 'faq', itemId: 7 })).pathname).toBe('/faq/read/[faqId]');
    expect(getSearchResultRoute(result({ itemType: 'cheat_sheet', itemId: 901 })).pathname).toBe('/cheat-sheets/[sheetId]');
    expect(getSearchResultRoute(result({ itemType: 'checklist', itemId: 1501 })).pathname).toBe('/checklists/[checklistId]');
    expect(getSearchResultRoute(result({ itemType: 'quiz', itemId: 9 })).pathname).toBe('/quizzes/[quizId]');
    expect(getSearchResultRoute(result({ itemType: 'library_tool', itemId: 2 })).pathname).toBe('/good-to-know/read/[itemId]');
  });

  it('names every type it can return, so a result never carries a bare id', () => {
    for (const type of ['lesson', 'glossary_term', 'interview_question', 'faq', 'cheat_sheet', 'checklist', 'quiz', 'library_tool'] as const) {
      expect(getSearchResultTypeLabel(type).length).toBeGreaterThan(2);
    }
  });

  it('says when results were truncated rather than passing the first fifty off as all of them', () => {
    const results = [result({ itemType: 'lesson' })];
    expect(formatSearchSummary(results, false)).toBe('1 match');
    expect(formatSearchSummary([...results, result({ itemType: 'quiz' })], false)).toBe('2 matches');
    expect(formatSearchSummary(results, true)).toBe('First 1 matches · narrow the search to see fewer');
    expect(formatSearchSummary([], false)).toBe('No matches');
  });
});
