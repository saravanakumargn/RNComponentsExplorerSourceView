/**
 * Support ("treat") tiers — a tip that removes ads, and nothing else. They
 * stopped being an unlock when the offer split into a one-time library purchase
 * and these (see purchase-info.ts). Every tier grants the same entitlement (see
 * purchases-config.ts); the price is what varies, so a supporter can pay more
 * if they want to. Each id is a RevenueCat offering
 * identifier holding a single one-time non-consumable package.
 *
 * Artwork lives in SupportTierIcon, keyed by id, so this module stays free of
 * asset imports and remains unit-testable; a tier with no PNG renders `emoji`.
 */
export type SupportTier = {
  id: string;
  label: string;
  emoji: string;
};

/** Cheapest first — SupportScreen pre-selects offers[0]. */
export const SUPPORT_TIERS: SupportTier[] = [
  { id: 'support_cupofcoffee', label: 'A Cup of Coffee', emoji: '☕' },
  { id: 'rn_support_coffee_cake', label: 'Coffee & Cake', emoji: '🍰' },
  { id: 'support_burgermeal', label: 'A Burger Meal', emoji: '🍔' },
  { id: 'rn_support_pizza', label: 'Pizza for the Team', emoji: '🍕' },
];

/** Tier pre-selected on the support screen; falls back to the first available offer. */
export const DEFAULT_SUPPORT_TIER_ID = 'rn_support_coffee_cake';

export function findSupportTier(offeringIdentifier: string): SupportTier | undefined {
  return SUPPORT_TIERS.find((tier) => tier.id === offeringIdentifier);
}
