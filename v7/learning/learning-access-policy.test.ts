import { describe, expect, it } from 'vitest';
import { FREE_ITEM_CAP, getFreeItemCount, isItemUnlocked } from './learning-access-policy';

describe('how much of a section is free', () => {
  it('is proportional, so there is no cliff between adjacent section sizes', () => {
    // The old rule gave 1 free at six and 5 free at seven. These are the sizes
    // the corpus actually clusters at, which is what made that cliff visible.
    expect(getFreeItemCount(6)).toBe(2);
    expect(getFreeItemCount(7)).toBe(3);
    expect(getFreeItemCount(17)).toBe(6);
  });

  it('never shows nothing: a section always gives at least one', () => {
    expect(getFreeItemCount(1)).toBe(1);
    expect(getFreeItemCount(2)).toBe(1);
    expect(getFreeItemCount(3)).toBe(1);
  });

  it('caps, so the free tier does not grow with the library', () => {
    // The interview levels: 151, 247, 268 published questions.
    expect(getFreeItemCount(151)).toBe(FREE_ITEM_CAP);
    expect(getFreeItemCount(268)).toBe(FREE_ITEM_CAP);
    expect(getFreeItemCount(10_000)).toBe(FREE_ITEM_CAP);
  });

  it('never promises more than the section holds', () => {
    expect(getFreeItemCount(1)).toBeLessThanOrEqual(1);
    expect(getFreeItemCount(4)).toBeLessThanOrEqual(4);
  });

  it.each([0, -1, 1.5, Number.NaN])('reads an impossible section size as nothing free (%s)', (size) => {
    expect(getFreeItemCount(size)).toBe(0);
  });
});

describe('whether one row is unlocked', () => {
  it.each([
    [0, 6, true],
    [1, 6, true],
    [2, 6, false],
    [2, 7, true],
    [3, 7, false],
    [9, 151, true],
    [10, 151, false],
  ])('index %i of a section of %i: %s', (index, size, expected) => {
    expect(isItemUnlocked(index, size, false)).toBe(expected);
  });

  it('opens everything once the library is bought', () => {
    expect(isItemUnlocked(99, 100, true)).toBe(true);
    expect(isItemUnlocked(267, 268, true)).toBe(true);
  });

  it.each([
    [-1, 7],
    [0, 0],
    [7, 7],
    [Number.NaN, 7],
    [0, Number.NaN],
  ])('denies an impossible position (%s of %s)', (index, size) => {
    expect(isItemUnlocked(index, size, false)).toBe(false);
  });
});
