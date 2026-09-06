import { describe, expect, it } from 'vitest';

import type { Quiz } from './data/learning-types';
import { getFreeQuizPartCount, getQuizAccess } from './quiz-access';

const quiz = (id: number, prerequisiteQuizId: number | null = null): Quiz => ({ quizId: id, trackId: 0, trackTitle: 'Track', slug: `quiz-${id}`, title: `Quiz ${id}`, description: '', level: 1, part: 1, prerequisiteQuizId, passThreshold: 80, questionCount: 15, rnVersionVerified: '0.86' });

describe('quiz access', () => {
  it('keeps one complete part free for a small library and uses a 10% whole-part sample as it grows', () => {
    expect(getFreeQuizPartCount(16)).toBe(1);
    expect(getFreeQuizPartCount(30)).toBe(3);
  });

  it('requires premium after the free sample and a passed prerequisite for dependent parts', () => {
    const first = quiz(1);
    const second = quiz(2, 1);
    const quizzesById = { 1: first, 2: second };
    expect(getQuizAccess(second, { index: 1, total: 16, learningUnlocked: false, attempts: {}, quizzesById })).toBe('premium');
    expect(getQuizAccess(second, { index: 1, total: 16, learningUnlocked: true, attempts: {}, quizzesById })).toBe('prerequisite');
    expect(getQuizAccess(second, { index: 1, total: 16, learningUnlocked: true, attempts: { 1: { attemptId: 1, quizId: 1, score: 12, total: 15, completedAt: '2026-08-14T00:00:00.000Z' } }, quizzesById })).toBe('available');
  });
});
