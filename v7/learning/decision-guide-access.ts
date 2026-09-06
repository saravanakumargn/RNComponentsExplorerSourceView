/**
 * Which decision guides open without the library unlock.
 *
 * One guide is always free by owner decision: the mobile-stack wizard is the
 * app's answer to "what is this app for", and it is the piece worth sharing, so
 * it must not sit behind the paywall. Every other guide follows the same
 * proportional rule as the rest of the library.
 */
import { isItemUnlocked } from './learning-access-policy';

export const ALWAYS_FREE_GUIDE_SLUG = 'mobile-stack';

/**
 * Matched on slug rather than list position so that publishing another guide,
 * or reordering the list, cannot silently move the free one behind the lock.
 */
export function isDecisionGuideUnlocked(slug: string, index: number, total: number, learningUnlocked: boolean): boolean {
  if (slug === ALWAYS_FREE_GUIDE_SLUG) return true;
  return isItemUnlocked(index, total, learningUnlocked);
}
