import { getEntitlementIdForPlatform } from './purchases-config';

/** Duck-typed subset of RevenueCat's CustomerInfo — decouples pure logic from the SDK's full type. */
type EntitlementsSource = {
  entitlements: {
    active: Record<string, unknown>;
  };
  /** One-time purchases (every product here is a non-consumable). Absent in older payloads. */
  nonSubscriptionTransactions?: { productIdentifier: string; purchaseDate?: string }[];
};

/**
 * What a customer has bought, split by what it buys.
 *
 * These are two capabilities rather than one "is subscribed" flag because the
 * app sells two different things: a tip that removes ads, and a purchase that
 * unlocks the learning library. The old app drew exactly this line — ads were
 * hidden for `isSupported || isSubscribed`, while content required `isSubscribed`
 * alone (backup_oldcode/src/utils/PurchaseUtils.ts and ShowBannerAd.tsx).
 */
export type PurchaseInfo = {
  /** No ads. Any purchase at all buys this, including a pure tip. */
  adsRemoved: boolean;
  /** The learning library is readable in full. Only the learning purchase buys this. */
  learningUnlocked: boolean;
};

/**
 * Support tiers: a tip. Non-consumables, so they stay in purchase history
 * forever.
 *
 * The `rn_` prefix is optional because the live tiers genuinely use both
 * shapes — `SUPPORT_TIERS` ships `support_cupofcoffee` and `support_burgermeal`
 * alongside `rn_support_coffee_cake` and `rn_support_pizza`, and the older tiers
 * this app sold (`support_lollipop`, `support_chocolate`, `support_diamond`) are
 * all unprefixed. Matching only `rn_support_` silently missed half of them.
 */
const SUPPORT_PRODUCT_ID_PATTERN = /^(rn_)?support_/i;
/**
 * The one-time learning purchase, by product id, for the case where no
 * entitlement resolves. Both casings are real: the store products are
 * `RN_Learning_Premium` on iOS and `rn_learning_premium` on Android.
 */
const LEARNING_PRODUCT_ID_PATTERN = /^rn_learning_premium$/i;

/**
 * Support purchases made at or before this instant still unlock the learning
 * library, because they were sold under copy that promised it — the support
 * screen has been saying "unlock the whole app for good" since `e9b9f8c7`
 * (2026-08-04), and `derivePurchaseInfo` has granted it ever since.
 *
 * Set by the owner on 2026-08-13 to the end of that day, UTC — the date of the
 * build carrying the copy that stops promising content. End of day rather than
 * the build minute, because the rule this whole file follows is that the
 * failure which costs a paying customer their content is the worse one: a treat
 * bought that morning was bought under the old promise.
 *
 * **Moved forward on 2026-08-15**, because that build had not shipped and the
 * date had already passed — anyone tipping in the gap would have seen the old
 * "unlock the whole app for good" copy and been denied content by this
 * constant. The owner chose to keep the split (tips buy ads-removal, the
 * library purchase buys content) rather than grandfather everyone, since a
 * $1.99 tip unlocking the library would strictly dominate the library product
 * and nobody would buy it again.
 *
 * `2026-09-30` is a deliberately generous estimate of when this build reaches
 * customers, not a known release date. **Set it to the real one when you know
 * it**, and err late rather than early: too late costs a few tips their
 * ads-only status, too early costs a paying customer what they were promised.
 * `null` would grandfather everyone, which is what shipped before 2026-08-13.
 */
export const SUPPORT_GRANTS_CONTENT_UNTIL: string | null = '2026-09-30T23:59:59Z';

export function isSupportProductId(productIdentifier: string): boolean {
  return SUPPORT_PRODUCT_ID_PATTERN.test(productIdentifier);
}

export function isLearningProductId(productIdentifier: string): boolean {
  return LEARNING_PRODUCT_ID_PATTERN.test(productIdentifier);
}

/** A support purchase old enough to have been sold as unlocking everything. */
export function isGrandfatheredSupportPurchase(
  transaction: { productIdentifier: string; purchaseDate?: string },
  until: string | null = SUPPORT_GRANTS_CONTENT_UNTIL,
): boolean {
  if (!isSupportProductId(transaction.productIdentifier)) return false;
  if (until === null) return true;
  // A purchase with no readable date is treated as old rather than new: the
  // failure that costs a paying customer their content is worse than the one
  // that gives a tipper more than they paid for.
  if (!transaction.purchaseDate) return true;
  return transaction.purchaseDate <= until;
}

/**
 * Resolves both capabilities from RevenueCat's customer info.
 *
 * Two fallbacks keep a paying customer unlocked when the dashboard and the app
 * disagree about ids: any active entitlement counts as the learning entitlement
 * (products have historically been given their own per-product entitlement), and
 * a past purchase of the learning product counts even with no entitlement
 * attached to it.
 */
export function derivePurchaseInfo(
  customerInfo: EntitlementsSource,
  platformOS: string,
  /** Overridable so the cutoff's behaviour can be tested before one is set. */
  until: string | null = SUPPORT_GRANTS_CONTENT_UNTIL,
): PurchaseInfo {
  const entitlementId = getEntitlementIdForPlatform(platformOS);
  const active = customerInfo.entitlements.active;
  const hasEntitlement = Boolean(active[entitlementId]) || Object.keys(active).length > 0;

  const purchases = customerInfo.nonSubscriptionTransactions ?? [];
  const boughtLearning = purchases.some((txn) => isLearningProductId(txn.productIdentifier));
  const supportPurchases = purchases.filter((txn) => isSupportProductId(txn.productIdentifier));
  const grandfathered = supportPurchases.some((txn) => isGrandfatheredSupportPurchase(txn, until));

  /**
   * Purchase history beats entitlements, because it says what the customer
   * actually bought while an entitlement is a dashboard mapping.
   *
   * This matters: the support tiers *do* have an entitlement attached in
   * RevenueCat. Reading "any active entitlement" as proof of a library purchase
   * would therefore unlock content for every treat buyer no matter what
   * `SUPPORT_GRANTS_CONTENT_UNTIL` says, and the split could never take effect.
   * So when history tells us what was bought, it decides; the entitlement
   * fallback only speaks when history is silent.
   */
  let learningUnlocked: boolean;
  if (boughtLearning || grandfathered) {
    learningUnlocked = true;
  } else if (supportPurchases.length > 0) {
    // A tip bought after the cutoff, and nothing else. It is not a library
    // purchase however the dashboard has mapped its entitlement.
    learningUnlocked = false;
  } else {
    // No purchase we recognise. Fall back to the entitlement, generously: a
    // product attached to a differently-named entitlement should unlock rather
    // than silently fail, which is why this fallback was added in the first
    // place (`e9b9f8c7`).
    learningUnlocked = hasEntitlement;
  }

  // Ads stay generous — any purchase or entitlement is enough. Being wrong here
  // costs an impression; being wrong about content costs someone what they paid for.
  return { adsRemoved: learningUnlocked || hasEntitlement || supportPurchases.length > 0, learningUnlocked };
}
