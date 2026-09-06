import type { ActiveQuizAttempt, QuizQuestion } from './data/learning-types';

type Random = () => number;

function shuffled<T>(items: T[], random: Random): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

/** Creates one fixed-set attempt: only the authored 15 questions and their options are shuffled. */
export function startQuizAttempt(quizId: number, questions: QuizQuestion[], random: Random = Math.random): Omit<ActiveQuizAttempt, 'updatedAt'> {
  const shuffledQuestions = shuffled(questions, random);
  return {
    quizId,
    questionOrder: shuffledQuestions.map((question) => question.quizQuestionId),
    optionOrder: Object.fromEntries(questions.map((question) => [question.quizQuestionId, shuffled(question.options, random).map((option) => option.optionId)])),
    selections: {},
    currentIndex: 0,
  };
}

/** Restores a saved attempt only when it still describes exactly the bundled fixed question set. */
export function orderQuizQuestions(questions: QuizQuestion[], attempt: Pick<ActiveQuizAttempt, 'questionOrder' | 'optionOrder'>): QuizQuestion[] | null {
  const byQuestionId = new Map(questions.map((question) => [question.quizQuestionId, question]));
  if (attempt.questionOrder.length !== questions.length || new Set(attempt.questionOrder).size !== questions.length) return null;
  const ordered: QuizQuestion[] = [];
  for (const questionId of attempt.questionOrder) {
    const question = byQuestionId.get(questionId);
    if (!question) return null;
    const optionOrder = attempt.optionOrder[question.quizQuestionId];
    const optionById = new Map(question.options.map((option) => [option.optionId, option]));
    if (!optionOrder || optionOrder.length !== question.options.length || new Set(optionOrder).size !== question.options.length) return null;
    const options = optionOrder.map((optionId) => optionById.get(optionId));
    if (options.some((option) => !option)) return null;
    ordered.push({ ...question, options: options as QuizQuestion['options'] });
  }
  return ordered;
}
