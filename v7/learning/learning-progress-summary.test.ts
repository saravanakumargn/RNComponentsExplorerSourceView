import { describe, expect, it } from 'vitest';

import { learningProgressPercent, learningTopicState } from './learning-progress-summary';

describe('learning progress summary', () => {
  it.each([[0, 0, 0], [0, 10, 0], [1, 3, 33], [3, 3, 100]])(
    'calculates %i completed of %i as %i%%',
    (completed, total, expected) => expect(learningProgressPercent(completed, total)).toBe(expected),
  );

  it.each([[0, 3, 'not-started'], [1, 3, 'in-progress'], [3, 3, 'completed']])(
    'returns %s for a topic with %i/%i lessons',
    (completed, total, expected) => expect(learningTopicState(completed, total)).toBe(expected),
  );
});
