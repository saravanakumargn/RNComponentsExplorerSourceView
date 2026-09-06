import { describe, expect, it } from 'vitest';

import type { LearningResetSummary } from './data/learning-types';
import { describeLearningReset, hasLearningProgress, matchesLearningResetConfirmation } from './learning-reset';

function summary(overrides: Partial<LearningResetSummary> = {}): LearningResetSummary {
  return { completedLessons: 0, quizAttempts: 0, reviewedItems: 0, checkedChecklistItems: 0, ...overrides };
}

describe('learning reset copy', () => {
  it('names every kind of progress the reader actually has', () => {
    const message = describeLearningReset(summary({ completedLessons: 12, quizAttempts: 8, reviewedItems: 34, checkedChecklistItems: 5 }));

    expect(message).toContain('12 finished lessons');
    expect(message).toContain('8 quiz attempts');
    expect(message).toContain('34 review cards');
    expect(message).toContain('5 checklist ticks');
  });

  it('leaves out the kinds with nothing in them rather than listing zeroes', () => {
    const message = describeLearningReset(summary({ completedLessons: 3 }));

    expect(message).toBe('This deletes 3 finished lessons. Your purchases are not affected, and this cannot be undone.');
    expect(message).not.toContain('quiz');
    expect(message).not.toContain('0 ');
  });

  it('reads as a sentence for one, two, and three kinds', () => {
    expect(describeLearningReset(summary({ quizAttempts: 2 }))).toContain('deletes 2 quiz attempts.');
    expect(describeLearningReset(summary({ completedLessons: 1, quizAttempts: 2 }))).toContain('1 finished lesson and 2 quiz attempts');
    expect(describeLearningReset(summary({ completedLessons: 1, quizAttempts: 2, reviewedItems: 3 }))).toContain('1 finished lesson, 2 quiz attempts and 3 review cards');
  });

  it('counts one of something in the singular', () => {
    const message = describeLearningReset(summary({ completedLessons: 1, quizAttempts: 1, reviewedItems: 1, checkedChecklistItems: 1 }));

    expect(message).toContain('1 finished lesson,');
    expect(message).toContain('1 quiz attempt,');
    expect(message).toContain('1 review card');
    expect(message).toContain('1 checklist tick');
  });

  it('promises that a reset does not touch what the reader paid for', () => {
    expect(describeLearningReset(summary({ completedLessons: 1 }))).toContain('purchases are not affected');
  });

  it('says there is nothing to delete rather than offering an empty reset', () => {
    expect(hasLearningProgress(summary())).toBe(false);
    expect(describeLearningReset(summary())).toBe('You have no saved progress yet, so there is nothing to reset.');
  });

  it('counts any single kind of progress as something worth resetting', () => {
    expect(hasLearningProgress(summary({ completedLessons: 1 }))).toBe(true);
    expect(hasLearningProgress(summary({ quizAttempts: 1 }))).toBe(true);
    expect(hasLearningProgress(summary({ reviewedItems: 1 }))).toBe(true);
    expect(hasLearningProgress(summary({ checkedChecklistItems: 1 }))).toBe(true);
  });
});

describe('learning reset confirmation word', () => {
  it('arms on the word, however the keyboard capitalised it', () => {
    expect(matchesLearningResetConfirmation('RESET')).toBe(true);
    expect(matchesLearningResetConfirmation('reset')).toBe(true);
    expect(matchesLearningResetConfirmation('Reset')).toBe(true);
  });

  it('forgives the space a keyboard adds but not a different word', () => {
    expect(matchesLearningResetConfirmation('  reset ')).toBe(true);
    expect(matchesLearningResetConfirmation('\nRESET\n')).toBe(true);
    expect(matchesLearningResetConfirmation('res et')).toBe(false);
  });

  it('stays disarmed for anything short of the whole word', () => {
    expect(matchesLearningResetConfirmation('')).toBe(false);
    expect(matchesLearningResetConfirmation('   ')).toBe(false);
    expect(matchesLearningResetConfirmation('res')).toBe(false);
    expect(matchesLearningResetConfirmation('resets')).toBe(false);
    expect(matchesLearningResetConfirmation('delete')).toBe(false);
  });
});
