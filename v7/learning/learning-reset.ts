import type { LearningResetSummary } from '@/features/learning/data/learning-types';

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** The word the reader types out to arm the reset. */
export const LEARNING_RESET_CONFIRMATION = 'RESET';

/**
 * Whether the typed confirmation arms the reset.
 *
 * Case and surrounding space are forgiven: the point of typing a word is that
 * it cannot happen by a mis-tap, and a reader who has deliberately typed
 * "reset" has cleared that bar. Holding out for capitals would only punish the
 * phone keyboard, and a reader fighting the caps key is one who stops reading
 * the sentence above the box — which is the part that actually matters.
 */
export function matchesLearningResetConfirmation(input: string): boolean {
  return input.trim().toUpperCase() === LEARNING_RESET_CONFIRMATION;
}

/** Whether there is anything to reset, which decides if the option is offered at all. */
export function hasLearningProgress(summary: LearningResetSummary): boolean {
  return summary.completedLessons > 0 || summary.quizAttempts > 0 || summary.reviewedItems > 0 || summary.checkedChecklistItems > 0;
}

/**
 * Names exactly what a reset destroys, in the reader's own numbers.
 *
 * A destructive confirmation has to be specific enough to decline: "12 finished
 * lessons and 8 quiz attempts" is a decision the reader can weigh, where "all
 * your progress" is a phrase they have to take on trust. Empty categories are
 * left out — listing zeroes buries the part that matters.
 */
export function describeLearningReset(summary: LearningResetSummary): string {
  const parts: string[] = [];
  if (summary.completedLessons > 0) parts.push(plural(summary.completedLessons, 'finished lesson'));
  if (summary.quizAttempts > 0) parts.push(plural(summary.quizAttempts, 'quiz attempt'));
  if (summary.reviewedItems > 0) parts.push(plural(summary.reviewedItems, 'review card'));
  if (summary.checkedChecklistItems > 0) parts.push(plural(summary.checkedChecklistItems, 'checklist tick'));

  if (parts.length === 0) return 'You have no saved progress yet, so there is nothing to reset.';

  const listed = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
  return `This deletes ${listed}. Your purchases are not affected, and this cannot be undone.`;
}
