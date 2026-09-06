import { describe, expect, it } from 'vitest';

import { DEFAULT_SUPPORT_TIER_ID, SUPPORT_TIERS, findSupportTier } from './support-tiers';

describe('support tiers', () => {
  it('exposes four tiers with unique offering ids', () => {
    expect(SUPPORT_TIERS).toHaveLength(4);
    expect(new Set(SUPPORT_TIERS.map((tier) => tier.id)).size).toBe(4);
  });

  it('gives every tier a label and an emoji fallback', () => {
    for (const tier of SUPPORT_TIERS) {
      expect(tier.label.length).toBeGreaterThan(0);
      expect(tier.emoji.length).toBeGreaterThan(0);
    }
  });

  it('defaults to a tier that exists', () => {
    expect(findSupportTier(DEFAULT_SUPPORT_TIER_ID)?.label).toBe('Coffee & Cake');
  });

  it('finds a tier by offering identifier', () => {
    expect(findSupportTier('support_cupofcoffee')?.label).toBe('A Cup of Coffee');
    expect(findSupportTier('rn_support_pizza')?.label).toBe('Pizza for the Team');
    expect(findSupportTier('support_lollipop')).toBeUndefined();
  });
});
