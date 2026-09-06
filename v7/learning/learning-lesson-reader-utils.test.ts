import { describe, expect, it } from 'vitest';

import {
  createLessonCompletionGate,
  getLearningReaderFontSize,
  getLessonProgressUnavailableFeedback,
  getLessonCompletionFeedback,
  hasReadableLessonContent,
  isLessonEndReached,
} from './learning-lesson-reader-utils';

describe('lesson completion gate', () => {
  it('allows exactly one completion attempt for repeated end events', () => {
    const gate = createLessonCompletionGate();

    expect(gate.tryBegin()).toBe(true);
    expect(gate.tryBegin()).toBe(false);
  });

  it('allows a retry after a completion write fails', () => {
    const gate = createLessonCompletionGate();

    expect(gate.tryBegin()).toBe(true);
    gate.reset();
    expect(gate.tryBegin()).toBe(true);
  });
});

describe('isLessonEndReached', () => {
  it('detects the end at the reader threshold', () => {
    expect(isLessonEndReached({ contentOffsetY: 476, viewportHeight: 500, contentHeight: 1_000 })).toBe(true);
  });

  it('does not complete immediately before the reader threshold', () => {
    expect(isLessonEndReached({ contentOffsetY: 475, viewportHeight: 500, contentHeight: 1_000 })).toBe(false);
  });

  it('treats a fully visible short lesson as complete when the reader reports it', () => {
    expect(isLessonEndReached({ contentOffsetY: 0, viewportHeight: 500, contentHeight: 300 })).toBe(true);
  });

  it.each([
    { contentOffsetY: -1, viewportHeight: 500, contentHeight: 1_000 },
    { contentOffsetY: 0, viewportHeight: 0, contentHeight: 1_000 },
    { contentOffsetY: 0, viewportHeight: 500, contentHeight: 0 },
    { contentOffsetY: Number.NaN, viewportHeight: 500, contentHeight: 1_000 },
  ])('rejects malformed scroll metrics: %o', (metrics) => {
    expect(isLessonEndReached(metrics)).toBe(false);
  });
});

describe('lesson reader presentation', () => {
  it('scales HTML reader text for Dynamic Type within a readable safe range', () => {
    expect(getLearningReaderFontSize(1)).toBe(18);
    expect(getLearningReaderFontSize(1.5)).toBe(27);
    expect(getLearningReaderFontSize(3)).toBe(36);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('uses the standard size for malformed font scales: %o', (fontScale) => {
    expect(getLearningReaderFontSize(fontScale)).toBe(18);
  });

  it.each(['', '   ', '\n\t'])('rejects blank lesson HTML: %j', (content) => {
    expect(hasReadableLessonContent(content)).toBe(false);
  });

  it('accepts an HTML lesson and exposes completion feedback only after completion', () => {
    expect(hasReadableLessonContent('<p>Lesson</p>')).toBe(true);
    expect(getLessonCompletionFeedback(false)).toBeNull();
    expect(getLessonCompletionFeedback(true)).toBe('Lesson completed. Your progress has been updated.');
  });

  it('keeps a readable lesson available when only local progress storage is unavailable', () => {
    expect(getLessonProgressUnavailableFeedback()).toBe(
      'Your saved progress could not be restored. The lesson is still available offline.',
    );
  });
});
