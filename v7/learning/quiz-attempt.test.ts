import { describe, expect, it } from 'vitest';

import type { QuizQuestion } from './data/learning-types';
import { orderQuizQuestions, startQuizAttempt } from './quiz-attempt';

const questions: QuizQuestion[] = [1, 2, 3].map((id) => ({
  quizQuestionId: id,
  position: id,
  prompt: `Question ${id}`,
  explanation: 'Explanation',
  options: [1, 2].map((offset) => ({ optionId: id * 10 + offset, position: offset, label: `Option ${offset}`, isCorrect: offset === 1 })),
}));

describe('fixed-set quiz attempts', () => {
  it('shuffles only the authored question set and each question’s authored options', () => {
    const attempt = startQuizAttempt(8, questions, () => 0);
    expect(attempt.questionOrder).toEqual([2, 3, 1]);
    expect(Object.values(attempt.optionOrder).flat().sort((a, b) => a - b)).toEqual([11, 12, 21, 22, 31, 32]);
  });

  it('restores the saved question and option order exactly', () => {
    const attempt = startQuizAttempt(8, questions, () => 0);
    const restored = orderQuizQuestions(questions, attempt);
    expect(restored?.map((question) => question.quizQuestionId)).toEqual(attempt.questionOrder);
    expect(restored?.[0].options.map((option) => option.optionId)).toEqual(attempt.optionOrder[attempt.questionOrder[0]]);
  });

  it('rejects an obsolete or malformed saved order rather than mixing content into an attempt', () => {
    expect(orderQuizQuestions(questions, { questionOrder: [1, 2], optionOrder: {} })).toBeNull();
  });
});
