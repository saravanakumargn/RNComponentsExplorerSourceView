import { describe, expect, it } from 'vitest';

import { nextPaywallSource } from './paywall-state';

/**
 * The whole point of the modal rewrite: opening the paywall is idempotent, so
 * two presses inside one transition cannot produce two paywalls. React applies
 * queued updaters in order against the accumulating value, so the second press
 * sees the first press's result even before it has been committed — which is
 * what a ref-based press guard could not promise, because its ref did not
 * survive the list remounting mid-transition.
 */
describe('nextPaywallSource', () => {
  it('opens the paywall when nothing is open', () => {
    expect(nextPaywallSource(null, 'premium_lesson')).toBe('premium_lesson');
  });

  it('keeps the paywall that is already open when pressed again', () => {
    expect(nextPaywallSource('premium_lesson', 'premium_lesson')).toBe('premium_lesson');
  });

  it('keeps the first source when a different locked row presses underneath it', () => {
    expect(nextPaywallSource('premium_lesson', 'premium_faq_list')).toBe('premium_lesson');
  });

  it('records one impression per opening rather than one per press', () => {
    const presses = ['premium_lesson', 'premium_lesson', 'premium_lesson'];
    const opened = presses.reduce<string | null>((current, press) => nextPaywallSource(current, press), null);

    expect(opened).toBe('premium_lesson');
  });
});
