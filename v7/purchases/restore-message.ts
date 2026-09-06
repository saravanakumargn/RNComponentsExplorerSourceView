/**
 * What to tell a customer after a restore.
 *
 * The message used to be built from `learningUnlocked` alone, which was wrong
 * for the one customer most likely to press the button. After the capability
 * split, a support-tier ("treat") buyer from after the cutoff restores to
 * `adsRemoved: true, learningUnlocked: false` — their ads genuinely come back
 * off, and the app told them "No previous purchase was found to restore."
 *
 * Several App Store reviews say exactly that: paid, restored, told nothing was
 * found, concluded the purchase was lost. Reporting the two capabilities
 * separately is what stops that.
 */
import type { PurchaseInfo } from './purchase-info';

export function getRestoreMessage(info: PurchaseInfo): string {
  if (info.learningUnlocked) return 'Your purchase was restored. The learning library is unlocked.';
  if (info.adsRemoved) return 'Your purchase was restored. Ads are removed. This tier does not include the learning library.';
  return 'No previous purchase was found to restore.';
}
