import { describe, expect, it } from 'vitest';

import { ALWAYS_FREE_GUIDE_SLUG, isDecisionGuideUnlocked } from './decision-guide-access';

describe('decision guide access', () => {
  it('keeps the mobile-stack guide open wherever it sits in the list', () => {
    expect(isDecisionGuideUnlocked(ALWAYS_FREE_GUIDE_SLUG, 9, 10, false)).toBe(true);
    expect(isDecisionGuideUnlocked(ALWAYS_FREE_GUIDE_SLUG, 0, 1, false)).toBe(true);
  });

  it('applies the standard proportional rule to every other guide', () => {
    // 10 guides -> ceil(10/3) = 4 free at the head.
    expect(isDecisionGuideUnlocked('state-management', 3, 10, false)).toBe(true);
    expect(isDecisionGuideUnlocked('state-management', 4, 10, false)).toBe(false);
    expect(isDecisionGuideUnlocked('state-management', 9, 10, true)).toBe(true);
  });
});
