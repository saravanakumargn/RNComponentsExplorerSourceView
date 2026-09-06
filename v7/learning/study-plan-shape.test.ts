import { describe, expect, it } from 'vitest';

import { formatPlanShape } from './study-plan-shape';

describe('formatPlanShape', () => {
  it('reads as weeks, items, and time', () => {
    expect(formatPlanShape({ targetWeeks: 4, itemCount: 17, totalMinutes: 190 })).toBe('4 weeks · 17 items · 3h 10m');
  });

  it('drops the minutes when the total lands on the hour', () => {
    expect(formatPlanShape({ targetWeeks: 2, itemCount: 6, totalMinutes: 120 })).toBe('2 weeks · 6 items · 2h');
  });

  it('stays in minutes under an hour', () => {
    expect(formatPlanShape({ targetWeeks: 1, itemCount: 1, totalMinutes: 45 })).toBe('1 week · 1 item · 45m');
  });
});
