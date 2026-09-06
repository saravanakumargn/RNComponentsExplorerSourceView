import type { Quiz, QuizAttempt } from './data/learning-types';

/** The free sample is one whole test part, never a partial attempt. */
export function getFreeQuizPartCount(totalQuizParts: number): number {
  return totalQuizParts > 0 ? Math.max(1, Math.floor(totalQuizParts / 10)) : 0;
}

export function hasPassedQuiz(attempt: QuizAttempt | undefined, quiz: Pick<Quiz, 'passThreshold'>): boolean {
  return !!attempt && attempt.total > 0 && Math.round((attempt.score / attempt.total) * 100) >= quiz.passThreshold;
}

export function getQuizAccess(quiz: Quiz, options: { index: number; total: number; learningUnlocked: boolean; attempts: Record<number, QuizAttempt>; quizzesById: Record<number, Quiz> }): 'available' | 'premium' | 'prerequisite' {
  if (!options.learningUnlocked && options.index >= getFreeQuizPartCount(options.total)) return 'premium';
  if (quiz.prerequisiteQuizId !== null) {
    const prerequisiteQuiz = options.quizzesById[quiz.prerequisiteQuizId];
    if (!prerequisiteQuiz || !hasPassedQuiz(options.attempts[quiz.prerequisiteQuizId], prerequisiteQuiz)) return 'prerequisite';
  }
  return 'available';
}
