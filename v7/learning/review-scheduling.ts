import type { ReviewItemKey, ReviewRecord } from '@/features/learning/data/learning-types';

/** How the reader judged a card: 0 Again · 1 Hard · 2 Good · 3 Easy. */
export type ReviewRating = 0 | 1 | 2 | 3;

export type ReviewSchedule = { intervalDays: number; ease: number; dueAt: string };

export const DEFAULT_EASE = 2.5;
const MINIMUM_EASE = 1.3;
const MAXIMUM_EASE = 3;
/** A year is far enough out that a longer interval says nothing extra. */
const MAXIMUM_INTERVAL_DAYS = 365;

/** New cards mixed into one session, so a 1,000-card corpus is not dumped at once. */
export const NEW_ITEMS_PER_SESSION = 20;
/** Total cards in one sitting. Overdue cards fill this before any new ones do. */
export const REVIEW_SESSION_LIMIT = 40;

const DAY_MILLISECONDS = 86_400_000;

function clampEase(ease: number): number {
  return Math.min(MAXIMUM_EASE, Math.max(MINIMUM_EASE, Number(ease.toFixed(2))));
}

function clampInterval(days: number): number {
  return Math.min(MAXIMUM_INTERVAL_DAYS, Math.max(0, Math.round(days)));
}

/**
 * The next interval and ease for a card just rated, in the SM-2 shape the
 * `reviews` table was designed for.
 *
 * "Again" is deliberately scheduled for *now* rather than for tomorrow: a card
 * the reader could not recall should come back in the same sitting, and the
 * session queue re-shows it. Ease only ever moves in small steps and is clamped
 * so one bad evening cannot bury a card at the floor forever.
 */
export function scheduleNextReview(previous: { intervalDays: number; ease: number } | null, rating: ReviewRating, reviewedAt: Date): ReviewSchedule {
  const previousInterval = previous ? Math.max(0, previous.intervalDays) : 0;
  const previousEase = previous && previous.ease > 0 ? previous.ease : DEFAULT_EASE;

  let ease = previousEase;
  let intervalDays: number;
  switch (rating) {
    case 0:
      ease = previousEase - 0.2;
      intervalDays = 0;
      break;
    case 1:
      ease = previousEase - 0.15;
      intervalDays = previousInterval === 0 ? 1 : Math.max(1, previousInterval * 1.2);
      break;
    case 2:
      intervalDays = previousInterval === 0 ? 1 : previousInterval === 1 ? 3 : previousInterval * previousEase;
      break;
    default:
      ease = previousEase + 0.15;
      intervalDays = previousInterval === 0 ? 3 : previousInterval === 1 ? 6 : previousInterval * previousEase * 1.3;
      break;
  }

  const scheduled = clampInterval(intervalDays);
  return { intervalDays: scheduled, ease: clampEase(ease), dueAt: new Date(reviewedAt.getTime() + scheduled * DAY_MILLISECONDS).toISOString() };
}

/**
 * Everything scheduled on or before tonight counts as due today. Comparing
 * against the current instant instead would hide a card reviewed at 9am
 * yesterday from a reader who opens the app at 8am, which is not what "due
 * today" means to anyone.
 */
export function reviewDueCutoff(now: Date): string {
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.toISOString();
}

export function reviewKeyId(key: ReviewItemKey): string {
  return `${key.itemType}:${key.itemId}`;
}

export type ReviewSessionPlan = {
  /** The cards this sitting will actually ask, due ones first. */
  keys: ReviewItemKey[];
  /** How many of `keys` are repeats, and how many are first sightings. */
  dueCount: number;
  newCount: number;
  /** How many exist in total, so a capped session can say what it left out. */
  dueAvailable: number;
  newAvailable: number;
};

/**
 * Picks the cards for one sitting from every reviewable item and the reader's
 * review history.
 *
 * Overdue cards come first and in the order they fell due, because the whole
 * point of the schedule is that late cards are the ones at risk. New cards fill
 * whatever room is left, up to a daily intake, so starting the deck does not
 * mean facing all 1,000 items.
 */
export function selectReviewSession(
  available: ReviewItemKey[],
  records: ReviewRecord[],
  cutoff: string,
  limits: { newItems?: number; sessionLimit?: number } = {},
): ReviewSessionPlan {
  const newItems = limits.newItems ?? NEW_ITEMS_PER_SESSION;
  const sessionLimit = limits.sessionLimit ?? REVIEW_SESSION_LIMIT;
  const recordsById = new Map(records.map((record) => [reviewKeyId(record), record]));

  const due: { key: ReviewItemKey; dueAt: string }[] = [];
  const fresh: ReviewItemKey[] = [];
  for (const key of available) {
    const record = recordsById.get(reviewKeyId(key));
    if (!record) fresh.push(key);
    else if (record.dueAt <= cutoff) due.push({ key, dueAt: record.dueAt });
  }
  due.sort((left, right) => (left.dueAt < right.dueAt ? -1 : left.dueAt > right.dueAt ? 1 : 0));

  const dueKeys = due.slice(0, sessionLimit).map((entry) => entry.key);
  const freshKeys = fresh.slice(0, Math.max(0, Math.min(newItems, sessionLimit - dueKeys.length)));
  return { keys: [...dueKeys, ...freshKeys], dueCount: dueKeys.length, newCount: freshKeys.length, dueAvailable: due.length, newAvailable: fresh.length };
}

/** The line above the start button: what is waiting, in the reader's terms. */
export function formatReviewBacklog(plan: ReviewSessionPlan): string {
  if (plan.dueAvailable === 0 && plan.newAvailable === 0) return 'Nothing left to review.';
  if (plan.dueAvailable === 0) return `Nothing due today · ${plan.newAvailable.toLocaleString('en-US')} new ${plan.newAvailable === 1 ? 'card' : 'cards'} to start`;
  const dueText = `${plan.dueAvailable.toLocaleString('en-US')} due today`;
  return plan.newAvailable === 0 ? dueText : `${dueText} · ${plan.newAvailable.toLocaleString('en-US')} new`;
}

/** What the session button promises, including the part a capped session omits. */
export function formatSessionSize(plan: ReviewSessionPlan): string {
  const total = plan.keys.length;
  const held = plan.dueAvailable - plan.dueCount;
  const size = `${total} ${total === 1 ? 'card' : 'cards'} this session`;
  return held > 0 ? `${size} · ${held.toLocaleString('en-US')} more due after it` : size;
}
