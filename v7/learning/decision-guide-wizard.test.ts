import { describe, expect, it } from 'vitest';

import { hasClearWinner, rankDecisionOptions } from './decision-guide-wizard';
import type { DecisionGuide } from './data/learning-types';

function option(optionId: number, position: number, name: string) {
  return { optionId, position, name, npmPackage: null, verdict: 'v', bestFor: 'b', avoidWhen: 'a' };
}

function guide(overrides: Partial<DecisionGuide> = {}): DecisionGuide {
  return {
    guideId: 9101, slug: 'mobile-stack', title: 'Which mobile stack?', question: 'Which?', summary: 'Pick one.',
    optionCount: 2, rnVersionVerified: '0.86',
    options: [option(1, 1, 'React Native'), option(2, 2, 'Flutter')],
    criteria: [
      { criterionId: 10, position: 1, label: 'Team already writes React' },
      { criterionId: 11, position: 2, label: 'Identical pixels on both platforms' },
    ],
    scores: [
      { optionId: 1, criterionId: 10, value: 3, note: 'JSX is React.' },
      { optionId: 1, criterionId: 11, value: 1, note: null },
      { optionId: 2, criterionId: 10, value: 0, note: 'Dart, not JavaScript.' },
      { optionId: 2, criterionId: 11, value: 3, note: 'Draws every pixel itself.' },
    ],
    ...overrides,
  };
}

describe('decision guide wizard', () => {
  it('ranks by weighted score and explains the winner from the authored notes', () => {
    const outcome = rankDecisionOptions(guide(), { 10: 3, 11: 1 });
    expect(outcome.kind).toBe('ranked');
    if (outcome.kind !== 'ranked') return;

    expect(outcome.ranked.map((entry) => entry.option.name)).toEqual(['React Native', 'Flutter']);
    // 3*3 + 1*1 against a best achievable of (3+1)*3.
    expect(outcome.ranked[0].score).toBe(10);
    expect(outcome.ranked[0].percent).toBe(83);
    expect(outcome.ranked[0].reasons[0]).toMatchObject({ label: 'Team already writes React', note: 'JSX is React.' });
  });

  it('flips the winner when the reader weights the other criterion', () => {
    const outcome = rankDecisionOptions(guide(), { 10: 0, 11: 3 });
    if (outcome.kind !== 'ranked') throw new Error('expected a ranking');
    expect(outcome.ranked[0].option.name).toBe('Flutter');
    // A criterion weighted zero must not contribute a reason.
    expect(outcome.ranked[0].reasons.every((reason) => reason.criterionId === 11)).toBe(true);
  });

  it('separates "nothing weighted" from "nothing scored"', () => {
    expect(rankDecisionOptions(guide(), {}).kind).toBe('no-preference');
    expect(rankDecisionOptions(guide(), { 10: 0, 11: 0 }).kind).toBe('no-preference');
    // A guide whose scores were never authored is a content gap, not an answer.
    expect(rankDecisionOptions(guide({ scores: [] }), { 10: 3 }).kind).toBe('unscored');
    expect(rankDecisionOptions(guide({ criteria: [] }), { 10: 3 }).kind).toBe('unscored');
  });

  it('breaks ties by authored position so the same answers never reshuffle', () => {
    const tied = guide({
      scores: [
        { optionId: 1, criterionId: 10, value: 2, note: null },
        { optionId: 2, criterionId: 10, value: 2, note: null },
      ],
    });
    const first = rankDecisionOptions(tied, { 10: 2 });
    const second = rankDecisionOptions(tied, { 10: 2 });
    if (first.kind !== 'ranked' || second.kind !== 'ranked') throw new Error('expected rankings');
    expect(first.ranked.map((entry) => entry.option.name)).toEqual(['React Native', 'Flutter']);
    expect(second.ranked.map((entry) => entry.option.name)).toEqual(first.ranked.map((entry) => entry.option.name));
  });

  it('treats a missing score as no fit rather than dropping the option', () => {
    const sparse = guide({ scores: [{ optionId: 1, criterionId: 10, value: 3, note: null }] });
    const outcome = rankDecisionOptions(sparse, { 10: 3, 11: 3 });
    if (outcome.kind !== 'ranked') throw new Error('expected a ranking');
    expect(outcome.ranked).toHaveLength(2);
    expect(outcome.ranked[1]).toMatchObject({ score: 0, percent: 0, reasons: [] });
  });
});

describe('clear winner', () => {
  it('is false when the top options tie, so a tie is never dressed up as a recommendation', () => {
    const outcome = rankDecisionOptions(guide(), { 10: 0, 11: 0, 12: 0 });
    expect(outcome.kind).toBe('no-preference');

    const tied = rankDecisionOptions(guide({
      scores: [
        { optionId: 1, criterionId: 10, value: 3, note: null },
        { optionId: 2, criterionId: 10, value: 3, note: null },
      ],
    }), { 10: 3 });
    if (tied.kind !== 'ranked') throw new Error('expected a ranking');
    expect(hasClearWinner(tied.ranked)).toBe(false);

    const decided = rankDecisionOptions(guide(), { 10: 3 });
    if (decided.kind !== 'ranked') throw new Error('expected a ranking');
    expect(hasClearWinner(decided.ranked)).toBe(true);
  });
});
