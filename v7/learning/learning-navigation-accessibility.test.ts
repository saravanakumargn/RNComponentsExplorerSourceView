import { describe, expect, it } from 'vitest';

import { getLearningNavigationAccessibility } from './learning-navigation-accessibility';

describe('getLearningNavigationAccessibility', () => {
  it('describes an available destination and its navigation action', () => {
    expect(getLearningNavigationAccessibility({
      title: 'Core components',
      destination: 'Good to know resources',
    })).toBe('Core components. Available. Opens Good to know resources.');
  });

  it('describes locked content as an upgrade action instead of a readable destination', () => {
    expect(getLearningNavigationAccessibility({
      title: 'What is JSX?',
      destination: 'FAQ answer',
      locked: true,
    })).toBe('What is JSX?. Locked. Opens unlock options.');
  });

  it('uses a stable fallback when a record has a blank title', () => {
    expect(getLearningNavigationAccessibility({
      title: '   ',
      destination: 'Interview question',
    })).toBe('Learning content. Available. Opens Interview question.');
  });
});
