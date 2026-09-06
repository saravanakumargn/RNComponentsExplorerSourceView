import { describe, expect, it } from 'vitest';

import {
  SUPPORT_GRANTS_CONTENT_UNTIL,
  derivePurchaseInfo,
  isGrandfatheredSupportPurchase,
  isLearningProductId,
  isSupportProductId,
} from './purchase-info';

function customer(options: { entitlements?: string[]; purchases?: { productIdentifier: string; purchaseDate?: string }[] } = {}) {
  return {
    entitlements: { active: Object.fromEntries((options.entitlements ?? []).map((id) => [id, {}])) },
    nonSubscriptionTransactions: options.purchases,
  };
}

describe('purchase capabilities', () => {
  it('separates the tip from the library: a support purchase removes ads, the learning entitlement unlocks content', () => {
    expect(derivePurchaseInfo(customer({ entitlements: ['RN_Learning_Premium'] }), 'ios'))
      .toEqual({ adsRemoved: true, learningUnlocked: true });
    expect(derivePurchaseInfo(customer({ purchases: [{ productIdentifier: 'rn_support_coffee' }] }), 'ios').adsRemoved).toBe(true);
  });

  it('grants nothing to a customer who has bought nothing', () => {
    expect(derivePurchaseInfo(customer(), 'ios')).toEqual({ adsRemoved: false, learningUnlocked: false });
    expect(derivePurchaseInfo(customer({ purchases: [] }), 'android')).toEqual({ adsRemoved: false, learningUnlocked: false });
  });

  it('reads the platform entitlement, and accepts any active entitlement as the learning one', () => {
    expect(derivePurchaseInfo(customer({ entitlements: ['RN_Learning_Premium_android'] }), 'android').learningUnlocked).toBe(true);
    // Products have historically been given their own per-product entitlement,
    // so an unrecognised active entitlement unlocks rather than silently failing.
    expect(derivePurchaseInfo(customer({ entitlements: ['some_new_entitlement'] }), 'ios').learningUnlocked).toBe(true);
  });

  it('unlocks from a past learning purchase even when no entitlement is attached to it', () => {
    expect(derivePurchaseInfo(customer({ purchases: [{ productIdentifier: 'rn_learning_premium' }] }), 'ios'))
      .toEqual({ adsRemoved: true, learningUnlocked: true });
  });

  it('anything that unlocks the library also removes ads', () => {
    const info = derivePurchaseInfo(customer({ entitlements: ['RN_Learning_Premium'] }), 'ios');
    expect(info.learningUnlocked && info.adsRemoved).toBe(true);
  });

  it('recognises support tiers in both id shapes, because the live tiers use both', () => {
    // SUPPORT_TIERS ships two of each shape, and every tier this app sold
    // before them was unprefixed. Matching only `rn_support_` missed half.
    for (const id of ['support_cupofcoffee', 'support_burgermeal', 'support_lollipop', 'support_chocolate', 'support_diamond', 'rn_support_coffee_cake', 'rn_support_pizza']) {
      expect(isSupportProductId(id)).toBe(true);
    }
    expect(isSupportProductId('rn_learning_premium')).toBe(false);
    expect(isSupportProductId('supporter_badge')).toBe(false);
  });

  it('recognises the learning product in both casings the two stores use', () => {
    expect(isLearningProductId('rn_learning_premium')).toBe(true);
    expect(isLearningProductId('RN_Learning_Premium')).toBe(true);
    expect(isLearningProductId('rn_support_coffee')).toBe(false);
  });

  it('removes ads for an unprefixed support purchase, which the old pattern silently failed to do', () => {
    expect(derivePurchaseInfo(customer({ purchases: [{ productIdentifier: 'support_cupofcoffee' }] }), 'ios'))
      .toEqual({ adsRemoved: true, learningUnlocked: true });
  });
});

describe('a treat with an entitlement attached', () => {
  // The live support tiers do have an entitlement attached in RevenueCat, so
  // this is the case that decides whether the split can work at all.
  const treat = (purchaseDate: string) => ({ productIdentifier: 'support_cupofcoffee', purchaseDate });
  const withEntitlement = (purchaseDate: string) => customer({ entitlements: ['RN_Learning_Premium'], purchases: [treat(purchaseDate)] });

  it('still removes ads', () => {
    expect(derivePurchaseInfo(withEntitlement('2027-01-01T00:00:00Z'), 'ios').adsRemoved).toBe(true);
  });

  it('does not unlock the library once the cutoff has passed, whatever the entitlement says', () => {
    const info = derivePurchaseInfo(withEntitlement('2027-01-01T00:00:00Z'), 'ios', '2026-09-01T00:00:00.000Z');
    expect(info.learningUnlocked).toBe(false);
  });

  it('still unlocks the library for a treat bought before the cutoff', () => {
    const info = derivePurchaseInfo(withEntitlement('2026-08-04T00:00:00Z'), 'ios', '2026-09-01T00:00:00.000Z');
    expect(info.learningUnlocked).toBe(true);
  });

  it('unlocks when the same customer also bought the library outright', () => {
    const both = customer({
      entitlements: ['RN_Learning_Premium'],
      purchases: [treat('2027-01-01T00:00:00Z'), { productIdentifier: 'rn_learning_premium', purchaseDate: '2027-01-02T00:00:00Z' }],
    });
    expect(derivePurchaseInfo(both, 'ios', '2026-09-01T00:00:00.000Z').learningUnlocked).toBe(true);
  });

  it('keeps trusting the entitlement when the customer has no purchase history to read', () => {
    expect(derivePurchaseInfo(customer({ entitlements: ['some_new_entitlement'] }), 'ios').learningUnlocked).toBe(true);
  });
});

describe('support-tier grandfathering', () => {
  const purchase = (purchaseDate?: string) => ({ productIdentifier: 'rn_support_coffee', purchaseDate });

  it('grandfathers every support purchase when no cutoff is passed', () => {
    expect(isGrandfatheredSupportPurchase(purchase('2027-01-01T00:00:00Z'), null)).toBe(true);
    expect(derivePurchaseInfo(customer({ purchases: [purchase()] }), 'ios', null).learningUnlocked).toBe(true);
  });

  /**
   * The shipped cutoff, asserted against the real constant rather than a local
   * one: this is the line that decides whether someone who paid keeps what the
   * copy promised them, so a change to it should have to change a test.
   */
  it('applies the cutoff this build ships with', () => {
    expect(SUPPORT_GRANTS_CONTENT_UNTIL).toBe('2026-09-30T23:59:59Z');
    // Bought under the copy that promised the library — keeps it, for life.
    expect(isGrandfatheredSupportPurchase(purchase('2026-08-04T10:00:00Z'))).toBe(true);
    expect(derivePurchaseInfo(customer({ purchases: [purchase('2026-08-04T10:00:00Z')] }), 'ios').learningUnlocked).toBe(true);
    // Bought under the copy that says a treat is only a tip — ads-only, even
    // though the tier carries an entitlement in RevenueCat.
    const later = customer({ entitlements: ['RN_Learning_Premium'], purchases: [purchase('2026-10-05T10:00:00Z')] });
    expect(derivePurchaseInfo(later, 'ios')).toEqual({ adsRemoved: true, learningUnlocked: false });
  });

  it('honours a cutoff once one is set, on the correct side of it', () => {
    const until = '2026-09-01T00:00:00.000Z';
    expect(isGrandfatheredSupportPurchase(purchase('2026-08-04T10:00:00.000Z'), until)).toBe(true);
    expect(isGrandfatheredSupportPurchase(purchase(until), until)).toBe(true);
    expect(isGrandfatheredSupportPurchase(purchase('2026-09-02T00:00:00.000Z'), until)).toBe(false);
  });

  it('treats an undated purchase as old, because wrongly revoking beats wrongly granting here', () => {
    expect(isGrandfatheredSupportPurchase(purchase(undefined), '2026-09-01T00:00:00.000Z')).toBe(true);
  });

  it('never grandfathers a product that is not a support tier', () => {
    expect(isGrandfatheredSupportPurchase({ productIdentifier: 'rn_learning_premium', purchaseDate: '2020-01-01T00:00:00Z' }, null)).toBe(false);
  });
});

/**
 * The cutoff exists to cover the gap between releasing the new copy and that
 * copy actually reaching every device. The owner set the release for
 * 2026-08-19 and kept the cutoff at 2026-09-30 for roughly six weeks of
 * update-tail cover, on the rule that anyone who could still be seeing the old
 * "unlock the whole app for good" copy is an old user.
 *
 * The cases below are that window. Before this block the nearest assertions
 * were 2026-08-04 and 2026-10-05, so the entire span the decision is about was
 * untested.
 */
describe('the 2026-08-19 release timeline', () => {
  const tip = (purchaseDate: string) => ({ productIdentifier: 'rn_support_coffee', purchaseDate });
  const unlocked = (purchaseDate: string) =>
    derivePurchaseInfo(customer({ purchases: [tip(purchaseDate)] }), 'ios').learningUnlocked;

  it('grants content to a tip bought on release day, when nobody has the new build yet', () => {
    expect(unlocked('2026-08-19T09:00:00Z')).toBe(true);
  });

  it('grants content across the update tail, where the old copy is still on real devices', () => {
    expect(unlocked('2026-08-31T12:00:00Z')).toBe(true);
    expect(unlocked('2026-09-15T12:00:00Z')).toBe(true);
    expect(unlocked('2026-09-29T23:59:59Z')).toBe(true);
  });

  it('is inclusive at the exact cutoff instant and closed one second later', () => {
    expect(unlocked('2026-09-30T23:59:59Z')).toBe(true);
    expect(unlocked('2026-10-01T00:00:00Z')).toBe(false);
  });

  /**
   * The comparison is a lexicographic string compare, not a date compare, and
   * RevenueCat reports millisecond precision. `.` sorts below `Z`, so a
   * millisecond-precision instant at the cutoff still reads as inside it —
   * true by construction rather than by luck, but worth pinning.
   */
  it('handles the millisecond-precision dates RevenueCat actually returns', () => {
    expect(unlocked('2026-09-30T23:59:59.000Z')).toBe(true);
    expect(unlocked('2026-09-15T12:00:00.123Z')).toBe(true);
    expect(unlocked('2026-10-01T00:00:00.000Z')).toBe(false);
  });

  it('keeps content when any one of several tips predates the cutoff', () => {
    const straddling = customer({ purchases: [tip('2026-09-01T10:00:00Z'), tip('2026-11-01T10:00:00Z')] });
    expect(derivePurchaseInfo(straddling, 'ios').learningUnlocked).toBe(true);
  });

  it('still removes ads for a post-cutoff tip, which is what the tip now buys', () => {
    expect(derivePurchaseInfo(customer({ purchases: [tip('2026-10-01T00:00:00Z')] }), 'ios'))
      .toEqual({ adsRemoved: true, learningUnlocked: false });
  });

  it('applies the same window on Android', () => {
    const inTail = customer({ purchases: [tip('2026-09-15T12:00:00Z')] });
    const after = customer({ purchases: [tip('2026-10-01T00:00:00Z')] });
    expect(derivePurchaseInfo(inTail, 'android').learningUnlocked).toBe(true);
    expect(derivePurchaseInfo(after, 'android').learningUnlocked).toBe(false);
  });
});
