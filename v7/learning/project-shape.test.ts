import { describe, expect, it } from 'vitest';

import { formatProjectProgress, formatProjectShape } from './project-shape';

describe('formatProjectShape', () => {
  it('reads as steps and an approximate time', () => {
    expect(formatProjectShape({ stepCount: 7, estimatedHours: 4 })).toBe('7 steps · about 4 hours');
  });

  it('keeps a one-step, one-hour project grammatical', () => {
    expect(formatProjectShape({ stepCount: 1, estimatedHours: 1 })).toBe('1 step · about 1 hour');
  });
});

describe('formatProjectProgress', () => {
  it('counts ticked steps against the total', () => {
    expect(formatProjectProgress(3, 7)).toBe('3 of 7 steps done');
    expect(formatProjectProgress(0, 1)).toBe('0 of 1 step done');
  });
});
