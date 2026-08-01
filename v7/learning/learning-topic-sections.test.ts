import { describe, expect, it } from 'vitest';

import type { LearningSubtopic } from './data/learning-types';
import {
  getLessonAccessibilityLabel,
  groupLessonsIntoSections,
} from './learning-topic-sections';

function lesson(subtopicId: number, level: number | null, completed = false): LearningSubtopic & { completed: boolean } {
  return {
    subtopicId,
    topicId: 1,
    subtopicName: `Lesson ${subtopicId}`,
    subtopicDescription: subtopicId === 2 ? 'A lesson description' : null,
    level,
    contentBody: '<p>Lesson</p>',
    completed,
  };
}

describe('groupLessonsIntoSections', () => {
  it('groups ordered lessons into legacy difficulty sections without changing lesson order', () => {
    const sections = groupLessonsIntoSections([
      lesson(1, null), lesson(2, 1), lesson(3, 1, true), lesson(4, 2), lesson(5, 3),
    ]);

    expect(sections.map(({ title, data }) => [title, data.map(({ subtopicId }) => subtopicId)])).toEqual([
      ['Unknown', [1]],
      ['Beginner', [2, 3]],
      ['Intermediate', [4]],
      ['Advanced', [5]],
    ]);
  });

  it('keeps an unsupported level discoverable under Unknown', () => {
    expect(groupLessonsIntoSections([lesson(8, 7)]).map(({ title }) => title)).toEqual(['Unknown']);
  });

  it('returns no sections for an empty topic', () => {
    expect(groupLessonsIntoSections([])).toEqual([]);
  });
});

describe('getLessonAccessibilityLabel', () => {
  it('announces a completed, available lesson and its description', () => {
    expect(getLessonAccessibilityLabel({ lesson: lesson(2, 1, true), unlocked: true })).toBe(
      'Lesson 2. A lesson description. Completed. Available. Opens lesson.',
    );
  });

  it('announces the first locked lesson and its subscription destination', () => {
    expect(getLessonAccessibilityLabel({ lesson: lesson(6, 1), unlocked: false })).toBe(
      'Lesson 6. Not completed. Locked. Opens subscription options.',
    );
  });

  it('does not include an empty description', () => {
    expect(getLessonAccessibilityLabel({ lesson: lesson(1, 1), unlocked: true })).not.toContain('..');
  });
});
