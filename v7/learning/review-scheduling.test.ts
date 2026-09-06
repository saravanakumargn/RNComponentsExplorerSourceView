import { describe, expect, it } from 'vitest';

import type { ReviewItemKey, ReviewRecord } from './data/learning-types';
import {
  DEFAULT_EASE,
  formatReviewBacklog,
  formatSessionSize,
  reviewDueCutoff,
  reviewKeyId,
  scheduleNextReview,
  selectReviewSession,
} from './review-scheduling';

const REVIEWED_AT = new Date('2026-08-12T09:00:00.000Z');

function record(overrides: Partial<ReviewRecord> & ReviewItemKey): ReviewRecord {
  return { reviewedAt: '2026-08-01T00:00:00.000Z', rating: 2, intervalDays: 1, ease: DEFAULT_EASE, dueAt: '2026-08-02T00:00:00.000Z', ...overrides };
}

function keys(count: number, itemType: ReviewItemKey['itemType'] = 'flashcard'): ReviewItemKey[] {
  return Array.from({ length: count }, (_, index) => ({ itemType, itemId: index + 1 }));
}

describe('spaced repetition scheduler', () => {
  it('starts a new card at one day for Good and three for Easy, and never before the review itself', () => {
    expect(scheduleNextReview(null, 2, REVIEWED_AT)).toEqual({ intervalDays: 1, ease: 2.5, dueAt: '2026-08-13T09:00:00.000Z' });
    expect(scheduleNextReview(null, 3, REVIEWED_AT)).toEqual({ intervalDays: 3, ease: 2.65, dueAt: '2026-08-15T09:00:00.000Z' });
    expect(scheduleNextReview(null, 1, REVIEWED_AT).intervalDays).toBe(1);
  });

  it('schedules "Again" for the same moment, so the card returns in this sitting rather than tomorrow', () => {
    const schedule = scheduleNextReview({ intervalDays: 30, ease: 2.5 }, 0, REVIEWED_AT);
    expect(schedule.intervalDays).toBe(0);
    expect(schedule.dueAt).toBe(REVIEWED_AT.toISOString());
    expect(schedule.ease).toBe(2.3);
  });

  it('grows a recalled card by its ease and shrinks the ease only for the ratings that earned it', () => {
    expect(scheduleNextReview({ intervalDays: 1, ease: 2.5 }, 2, REVIEWED_AT).intervalDays).toBe(3);
    expect(scheduleNextReview({ intervalDays: 3, ease: 2.5 }, 2, REVIEWED_AT)).toMatchObject({ intervalDays: 8, ease: 2.5 });
    expect(scheduleNextReview({ intervalDays: 10, ease: 2.5 }, 1, REVIEWED_AT)).toMatchObject({ intervalDays: 12, ease: 2.35 });
    expect(scheduleNextReview({ intervalDays: 10, ease: 2.5 }, 3, REVIEWED_AT)).toMatchObject({ intervalDays: 33, ease: 2.65 });
  });

  it('clamps ease to a usable band so repeated ratings cannot bury or run away with a card', () => {
    let ease = DEFAULT_EASE;
    for (let index = 0; index < 20; index += 1) ease = scheduleNextReview({ intervalDays: 5, ease }, 0, REVIEWED_AT).ease;
    expect(ease).toBe(1.3);
    for (let index = 0; index < 20; index += 1) ease = scheduleNextReview({ intervalDays: 5, ease }, 3, REVIEWED_AT).ease;
    expect(ease).toBe(3);
  });

  it('caps the interval at a year and keeps every value inside the progress-table constraints', () => {
    const schedule = scheduleNextReview({ intervalDays: 320, ease: 3 }, 3, REVIEWED_AT);
    expect(schedule.intervalDays).toBe(365);
    expect(schedule.ease).toBeGreaterThan(0);
    expect(schedule.intervalDays).toBeGreaterThanOrEqual(0);
  });

  it('treats a card scheduled for any time today as due, not one still hours away', () => {
    const cutoff = reviewDueCutoff(new Date('2026-08-12T08:00:00.000Z'));
    expect(cutoff > '2026-08-12T08:00:00.000Z').toBe(true);
    expect(new Date(cutoff).getHours()).toBe(23);
  });
});

describe('review session selection', () => {
  const cutoff = '2026-08-12T23:59:59.999Z';

  it('asks overdue cards first, oldest due first, before any new card', () => {
    const available: ReviewItemKey[] = [{ itemType: 'flashcard', itemId: 1 }, { itemType: 'flashcard', itemId: 2 }, { itemType: 'flashcard', itemId: 3 }];
    const plan = selectReviewSession(available, [
      record({ itemType: 'flashcard', itemId: 2, dueAt: '2026-08-12T00:00:00.000Z' }),
      record({ itemType: 'flashcard', itemId: 3, dueAt: '2026-08-05T00:00:00.000Z' }),
    ], cutoff);

    expect(plan.keys).toEqual([{ itemType: 'flashcard', itemId: 3 }, { itemType: 'flashcard', itemId: 2 }, { itemType: 'flashcard', itemId: 1 }]);
    expect(plan).toMatchObject({ dueCount: 2, newCount: 1, dueAvailable: 2, newAvailable: 1 });
  });

  it('leaves cards scheduled beyond today out of the session entirely', () => {
    const plan = selectReviewSession([{ itemType: 'flashcard', itemId: 1 }], [record({ itemType: 'flashcard', itemId: 1, dueAt: '2026-09-01T00:00:00.000Z' })], cutoff);
    expect(plan.keys).toEqual([]);
    expect(plan).toMatchObject({ dueAvailable: 0, newAvailable: 0 });
  });

  it('caps a first session so a thousand-card corpus is not dumped on a new reader, and reports what it held back', () => {
    const plan = selectReviewSession(keys(1000), [], cutoff);
    expect(plan.keys).toHaveLength(20);
    expect(plan.newAvailable).toBe(1000);
    expect(formatReviewBacklog(plan)).toBe('Nothing due today · 1,000 new cards to start');
  });

  it('fills the session with due cards before new ones and names the overflow rather than hiding it', () => {
    const available = [...keys(60), ...keys(5, 'interview_question')];
    const plan = selectReviewSession(available, keys(60).map((key, index) => record({ ...key, dueAt: `2026-08-${String(index % 9 + 1).padStart(2, '0')}T00:00:00.000Z` })), cutoff);

    expect(plan.keys).toHaveLength(40);
    expect(plan).toMatchObject({ dueCount: 40, newCount: 0, dueAvailable: 60, newAvailable: 5 });
    expect(formatSessionSize(plan)).toBe('40 cards this session · 20 more due after it');
  });

  it('mixes both content types under one schedule, keyed so their ids cannot collide', () => {
    const available: ReviewItemKey[] = [{ itemType: 'flashcard', itemId: 7 }, { itemType: 'interview_question', itemId: 7 }];
    const plan = selectReviewSession(available, [record({ itemType: 'interview_question', itemId: 7, dueAt: '2026-08-01T00:00:00.000Z' })], cutoff);

    expect(reviewKeyId({ itemType: 'flashcard', itemId: 7 })).not.toBe(reviewKeyId({ itemType: 'interview_question', itemId: 7 }));
    expect(plan.keys).toEqual([{ itemType: 'interview_question', itemId: 7 }, { itemType: 'flashcard', itemId: 7 }]);
    expect(plan).toMatchObject({ dueCount: 1, newCount: 1 });
  });

  it('reports an empty deck plainly rather than as a zero count', () => {
    expect(formatReviewBacklog(selectReviewSession([], [], cutoff))).toBe('Nothing left to review.');
    expect(formatSessionSize(selectReviewSession([{ itemType: 'flashcard', itemId: 1 }], [], cutoff))).toBe('1 card this session');
  });
});
