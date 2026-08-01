import { describe, expect, it } from 'vitest';
import { isLessonUnlocked, isListItemUnlocked } from './learning-access-policy';
describe('lesson access policy', () => {
  it.each([[0, 6, true], [1, 6, false], [4, 7, true], [5, 7, false]])('allows index %i in a section of %i: %s', (index, size, expected) => expect(isLessonUnlocked(index, size, false)).toBe(expected));
  it('unlocks every item for subscribers', () => expect(isLessonUnlocked(99, 100, true)).toBe(true));
  it.each([[-1, 7], [0, 0], [Number.NaN, 7], [0, Number.NaN]])('denies invalid lesson positions (%s, %s)', (index, size) => {
    expect(isLessonUnlocked(index, size, false)).toBe(false);
  });
});
describe('FAQ and interview list access policy', () => {
  it.each([[9, true], [10, false]])('allows free-list index %i: %s', (index, expected) => expect(isListItemUnlocked(index, false)).toBe(expected));
  it.each([-1, Number.NaN])('denies invalid free-list positions (%s)', (index) => {
    expect(isListItemUnlocked(index, false)).toBe(false);
  });
});
