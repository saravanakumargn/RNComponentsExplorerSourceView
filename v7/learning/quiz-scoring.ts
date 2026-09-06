import type { Quiz, QuizQuestion } from '@/features/learning/data/learning-types';

/** Which option the reader chose for a question, keyed by question id. */
export type QuizSelections = Record<number, number | undefined>;

export type QuizQuestionResult = {
  quizQuestionId: number;
  prompt: string;
  explanation: string;
  selectedOptionId: number | null;
  correctOptionId: number | null;
  correct: boolean;
};

export type QuizResult = {
  score: number;
  total: number;
  /** Rounded to a whole percent, which is the unit `pass_threshold` is in. */
  percent: number;
  passed: boolean;
  passThreshold: number;
  questions: QuizQuestionResult[];
};

export function getCorrectOptionId(question: QuizQuestion): number | null {
  return question.options.find((option) => option.isCorrect)?.optionId ?? null;
}

/**
 * Scores a finished attempt.
 *
 * An unanswered question counts as wrong rather than being excluded, so the
 * percentage always means the same thing: skipping is not a way to raise a
 * score. A question with no correct option authored can never be answered
 * correctly, so it is scored wrong rather than silently passing everyone.
 */
export function scoreQuiz(quiz: Pick<Quiz, 'passThreshold'>, questions: QuizQuestion[], selections: QuizSelections): QuizResult {
  const results: QuizQuestionResult[] = questions.map((question) => {
    const correctOptionId = getCorrectOptionId(question);
    const selectedOptionId = selections[question.quizQuestionId] ?? null;
    return {
      quizQuestionId: question.quizQuestionId,
      prompt: question.prompt,
      explanation: question.explanation,
      selectedOptionId,
      correctOptionId,
      correct: correctOptionId !== null && selectedOptionId === correctOptionId,
    };
  });

  const total = results.length;
  const score = results.filter((result) => result.correct).length;
  const percent = total === 0 ? 0 : Math.round((score / total) * 100);
  return { score, total, percent, passed: total > 0 && percent >= quiz.passThreshold, passThreshold: quiz.passThreshold, questions: results };
}

/** How many questions still have no answer, for the "N left" hint before submitting. */
export function countUnanswered(questions: QuizQuestion[], selections: QuizSelections): number {
  return questions.filter((question) => selections[question.quizQuestionId] === undefined).length;
}

export function formatQuizScore(score: number, total: number, percent: number): string {
  return `${score} of ${total} correct · ${percent}%`;
}

/**
 * The list badge for a quiz already attempted. Best attempt rather than latest,
 * so passing once is not undone by a later practice run.
 */
export function formatBestAttempt(attempt: { score: number; total: number } | undefined, passThreshold: number): string | null {
  if (!attempt || attempt.total <= 0) return null;
  const percent = Math.round((attempt.score / attempt.total) * 100);
  return `Best ${percent}% · ${percent >= passThreshold ? 'passed' : 'not passed yet'}`;
}

/**
 * Whether a recorded attempt cleared the bar.
 *
 * Shares the rounding with `formatBestAttempt` on purpose: a row that says
 * "passed" and a row that draws the passed symbol must never disagree because
 * one of them rounded differently.
 */
export function hasPassedQuiz(attempt: { score: number; total: number } | undefined, passThreshold: number): boolean {
  if (!attempt || attempt.total <= 0) return false;
  return Math.round((attempt.score / attempt.total) * 100) >= passThreshold;
}
