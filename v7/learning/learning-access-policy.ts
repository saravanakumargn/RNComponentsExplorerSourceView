/**
 * How much of a list a reader gets before the lock, in one rule for every list.
 *
 * It used to be two rules that disagreed. Lessons unlocked the first 5 of a
 * section over 6 long and only the first of a shorter one, which put a cliff
 * right where the corpus is densest — a 6-lesson section gave 1 free and a
 * 7-lesson section gave 5, four times as much for one more lesson. Lists (FAQ,
 * interview) unlocked a flat first 10 regardless of length.
 *
 * The rule is now proportional between a floor and a cap:
 *
 * - **Proportional**, so the cliff is gone and every section is treated alike.
 * - **Floor of one**, because a section that shows nothing cannot demonstrate
 *   anything, and some sections hold a single lesson.
 * - **Cap of ten**, because the free tier must not grow with the library. A
 *   share would mean every track published gives more away; the cap keeps the
 *   sample's cost flat as the corpus grows, which matters most in interview
 *   prep, where the levels hold 151, 247, and 268 questions.
 *
 * `FREE_SHARE_DIVISOR` is the one knob worth turning once paywall-impression
 * data says something: 3 leaves 178 of 472 lessons free, 4 leaves 141, 5 leaves
 * 113. Interview prep sits above the cap either way, so it stays at ten a level.
 */
export const FREE_SHARE_DIVISOR = 3;
export const FREE_ITEM_CAP = 10;

/** How many items at the head of a section of `sectionSize` are free. */
export function getFreeItemCount(sectionSize: number): number {
  if (!Number.isInteger(sectionSize) || sectionSize < 1) return 0;
  return Math.min(sectionSize, FREE_ITEM_CAP, Math.max(1, Math.ceil(sectionSize / FREE_SHARE_DIVISOR)));
}

/** Whether the item at `index` of a section of `sectionSize` can be opened. */
export function isItemUnlocked(index: number, sectionSize: number, learningUnlocked: boolean): boolean {
  if (!Number.isInteger(index) || !Number.isInteger(sectionSize)) return false;
  if (index < 0 || sectionSize < 1 || index >= sectionSize) return false;
  if (learningUnlocked) return true;
  return index < getFreeItemCount(sectionSize);
}
