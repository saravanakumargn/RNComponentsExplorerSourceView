import { describe, expect, it } from 'vitest';

import { formatLearningAreaCount, getAvailableLearningAreas, getLearningArea, learningAreas } from './learning-areas';

describe('learning area presentation metadata', () => {
  it('gives every supported learning destination a title, concise purpose, and recognisable icon', () => {
    expect(learningAreas).toHaveLength(15);
    expect(learningAreas).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'learning-path', title: 'Learning Path', description: expect.any(String), icon: 'route' }),
      expect.objectContaining({ id: 'study-plans', title: 'Study plans', description: expect.any(String), icon: 'flag' }),
      expect.objectContaining({ id: 'projects', title: 'Projects', description: expect.any(String), icon: 'build-circle' }),
      expect.objectContaining({ id: 'system-design', title: 'System design', description: expect.any(String), icon: 'schema' }),
      expect.objectContaining({ id: 'faq', title: 'React Native FAQ', description: expect.any(String), icon: 'help-outline' }),
      expect.objectContaining({ id: 'glossary', title: 'Glossary', description: expect.any(String), icon: 'menu-book' }),
      expect.objectContaining({ id: 'quizzes', title: 'Quizzes', description: expect.any(String), icon: 'quiz' }),
      expect.objectContaining({ id: 'review', title: 'Review', description: expect.any(String), icon: 'style' }),
      expect.objectContaining({ id: 'cheat-sheets', title: 'Cheat sheets', description: expect.any(String), icon: 'summarize' }),
      expect.objectContaining({ id: 'checklists', title: 'Checklists', description: expect.any(String), icon: 'checklist' }),
      expect.objectContaining({ id: 'good-to-know', title: 'Good to know', description: expect.any(String), icon: 'tips-and-updates' }),
      expect.objectContaining({ id: 'interview-prep', title: 'Interview Prep', description: expect.any(String), icon: 'school' }),
    ]));
    expect(learningAreas.every((area) => area.description.trim().length > 12)).toBe(true);
  });

  it('resolves a valid area and safely rejects a missing area', () => {
    expect(getLearningArea('faq')?.title).toBe('React Native FAQ');
    expect(getLearningArea('missing')).toBeUndefined();
  });

  it('offers only the areas whose content type has published records', () => {
    const counts = { learningPath: 472, faq: 0, glossary: 337, goodToKnow: 0, interviewPrep: 666, quizzes: 16, review: 1009, cheatSheets: 16, checklists: 0, decisionGuides: 0, snippets: 0, codeChallenges: 0, studyPlans: 0, projects: 0, designScenarios: 0 };
    expect(getAvailableLearningAreas(counts).map((area) => area.id)).toEqual(['learning-path', 'glossary', 'quizzes', 'review', 'cheat-sheets', 'interview-prep']);
  });

  it('offers every area once each content type is populated, and none before counts are known', () => {
    expect(getAvailableLearningAreas({ learningPath: 1, faq: 1, glossary: 1, goodToKnow: 1, interviewPrep: 1, quizzes: 1, review: 1, cheatSheets: 1, checklists: 1, decisionGuides: 1, snippets: 1, codeChallenges: 1, studyPlans: 1, projects: 1, designScenarios: 1 })).toHaveLength(15);
    expect(getAvailableLearningAreas(null)).toEqual([]);
  });

  it('formats area counts with a grouped number and a matching plural', () => {
    expect(formatLearningAreaCount(1, 'answer')).toBe('1 answer');
    expect(formatLearningAreaCount(472, 'lesson')).toBe('472 lessons');
    expect(formatLearningAreaCount(1317, 'question')).toBe('1,317 questions');
  });
});
