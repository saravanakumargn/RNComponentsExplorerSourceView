import { describe, expect, it } from 'vitest';

import type { QuizQuestion } from './data/learning-types';
import { countUnanswered, formatBestAttempt, formatQuizScore, getCorrectOptionId, hasPassedQuiz, scoreQuiz } from './quiz-scoring';

function question(quizQuestionId: number, correctOptionId: number | null): QuizQuestion {
  return {
    quizQuestionId,
    position: quizQuestionId,
    prompt: `Prompt ${quizQuestionId}`,
    explanation: `Because ${quizQuestionId}.`,
    options: [1, 2, 3, 4].map((offset) => {
      const optionId = quizQuestionId * 10 + offset;
      return { optionId, position: offset, label: `Option ${offset}`, isCorrect: optionId === correctOptionId };
    }),
  };
}

const quiz = { passThreshold: 80 };
// Correct option ids follow the helper's scheme: question N owns options N1..N4.
const questions = [question(1, 11), question(2, 21), question(3, 31), question(4, 41), question(5, 51)];

describe('quiz scoring', () => {
  it('scores every correct answer and passes at the threshold exactly', () => {
    const result = scoreQuiz(quiz, questions, { 1: 11, 2: 21, 3: 31, 4: 41, 5: 52 });
    expect(result.score).toBe(4);
    expect(result.total).toBe(5);
    expect(result.percent).toBe(80);
    expect(result.passed).toBe(true);
  });

  it('fails just below the threshold', () => {
    const result = scoreQuiz(quiz, questions, { 1: 11, 2: 21, 3: 31, 4: 42, 5: 52 });
    expect(result.percent).toBe(60);
    expect(result.passed).toBe(false);
  });

  it('counts an unanswered question as wrong, so skipping cannot raise a score', () => {
    const answered = scoreQuiz(quiz, questions, { 1: 11, 2: 21, 3: 31, 4: 41, 5: 51 });
    const skipped = scoreQuiz(quiz, questions, { 1: 11, 2: 21, 3: 31, 4: 41 });
    expect(answered.percent).toBe(100);
    expect(skipped.percent).toBe(80);
    expect(skipped.questions[4]).toMatchObject({ selectedOptionId: null, correct: false });
  });

  it('scores a question with no correct option authored as wrong rather than passing everyone', () => {
    const broken = [question(1, null)];
    const result = scoreQuiz(quiz, broken, { 1: 11 });
    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
    expect(result.questions[0]).toMatchObject({ correctOptionId: null, correct: false });
  });

  it('treats an empty quiz as unpassed instead of dividing by zero', () => {
    const result = scoreQuiz(quiz, [], {});
    expect(result).toMatchObject({ score: 0, total: 0, percent: 0, passed: false });
  });

  it('reports each question with the explanation needed to review it', () => {
    const result = scoreQuiz(quiz, questions, { 1: 12 });
    expect(result.questions[0]).toEqual({ quizQuestionId: 1, prompt: 'Prompt 1', explanation: 'Because 1.', selectedOptionId: 12, correctOptionId: 11, correct: false });
  });

  it('rounds the percentage to the whole percent the threshold is expressed in', () => {
    const three = [question(1, 11), question(2, 21), question(3, 31)];
    expect(scoreQuiz(quiz, three, { 1: 11 }).percent).toBe(33);
    expect(scoreQuiz(quiz, three, { 1: 11, 2: 21 }).percent).toBe(67);
  });

  it('finds the correct option, or reports none', () => {
    expect(getCorrectOptionId(question(1, 11))).toBe(11);
    expect(getCorrectOptionId(question(1, null))).toBeNull();
  });
});

describe('quiz progress hints', () => {
  it('counts what is still unanswered', () => {
    expect(countUnanswered(questions, {})).toBe(5);
    expect(countUnanswered(questions, { 1: 11, 3: 31 })).toBe(3);
    expect(countUnanswered(questions, { 1: 11, 2: 21, 3: 31, 4: 41, 5: 51 })).toBe(0);
  });

  it('formats a score for the results screen', () => {
    expect(formatQuizScore(12, 15, 80)).toBe('12 of 15 correct · 80%');
  });

  it('summarises a best attempt against the threshold, and says nothing without one', () => {
    expect(formatBestAttempt({ score: 12, total: 15 }, 80)).toBe('Best 80% · passed');
    expect(formatBestAttempt({ score: 9, total: 15 }, 80)).toBe('Best 60% · not passed yet');
    expect(formatBestAttempt(undefined, 80)).toBeNull();
    expect(formatBestAttempt({ score: 0, total: 0 }, 80)).toBeNull();
  });

  it('agrees with the summary about whether an attempt passed', () => {
    // The row's wording and the symbol beside it read the same attempt, so a
    // score that rounds onto the threshold has to pass in both.
    expect(hasPassedQuiz({ score: 12, total: 15 }, 80)).toBe(true);
    expect(hasPassedQuiz({ score: 9, total: 15 }, 80)).toBe(false);
    expect(hasPassedQuiz(undefined, 80)).toBe(false);
    expect(hasPassedQuiz({ score: 0, total: 0 }, 80)).toBe(false);
  });
});
