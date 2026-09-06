import { describe, expect, it } from 'vitest';

import { formatResultShareMessage, formatWeightedCriteria } from './share-result';

describe('decision result sharing', () => {
  it('names up to three criteria and counts the rest', () => {
    expect(formatWeightedCriteria([])).toBe('');
    expect(formatWeightedCriteria(['Team writes React'])).toBe('team writes react');
    expect(formatWeightedCriteria(['A', 'B', 'C'])).toBe('a, b, c');
    // A long list would be truncated by the receiving app, cutting the answer.
    expect(formatWeightedCriteria(['A', 'B', 'C', 'D', 'E'])).toBe('a, b, c, and 2 more');
  });

  it('builds a message that leads with the answer and still carries the link', () => {
    const message = formatResultShareMessage({
      question: 'React Native, or something else?', winner: 'React Native with Expo', percent: 92,
      weighted: ['Team writes React', 'Must feel native'],
    }, 'ios');
    expect(message).toContain('I got React Native with Expo (92%)');
    expect(message).toContain('because I care about team writes react, must feel native');
    expect(message).toContain('https://apps.apple.com/app/id');
  });

  it('omits the reason clause when nothing was weighted', () => {
    const message = formatResultShareMessage({ question: 'Q', winner: 'W', percent: 50, weighted: [] }, 'android');
    expect(message).not.toContain('because I care about');
    expect(message).toContain('play.google.com');
  });
});
