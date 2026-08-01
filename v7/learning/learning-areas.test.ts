import { describe, expect, it } from 'vitest';

import { getLearningArea, learningAreas } from './learning-areas';

describe('learning area presentation metadata', () => {
  it('gives every supported learning destination a title, concise purpose, and recognisable icon', () => {
    expect(learningAreas).toHaveLength(4);
    expect(learningAreas).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'learning-path', title: 'Learning Path', description: expect.any(String), icon: 'route' }),
      expect.objectContaining({ id: 'faq', title: 'React Native FAQ', description: expect.any(String), icon: 'help-outline' }),
      expect.objectContaining({ id: 'good-to-know', title: 'Good to know', description: expect.any(String), icon: 'tips-and-updates' }),
      expect.objectContaining({ id: 'interview-prep', title: 'Interview Prep', description: expect.any(String), icon: 'school' }),
    ]));
    expect(learningAreas.every((area) => area.description.trim().length > 12)).toBe(true);
  });

  it('resolves a valid area and safely rejects a missing area', () => {
    expect(getLearningArea('faq')?.title).toBe('React Native FAQ');
    expect(getLearningArea('missing')).toBeUndefined();
  });
});
