import type { LearningAreaContentCounts } from '@/features/learning/data/learning-types';

export type LearningAreaIcon = 'flag' | 'build-circle' | 'schema' | 'route' | 'help-outline' | 'menu-book' | 'quiz' | 'style' | 'summarize' | 'checklist' | 'tips-and-updates' | 'school' | 'alt-route' | 'content-copy' | 'bug-report';

export type LearningArea = {
  id: string;
  title: string;
  description: string;
  icon: LearningAreaIcon;
  /** Which published-record count decides whether this area has anything to show. */
  countKey: keyof LearningAreaContentCounts;
  /** Singular noun for that count, used in the home tile subtitle. */
  itemNoun: string;
};

export const learningAreas: LearningArea[] = [
  { id: 'learning-path', title: 'Learning Path', description: 'Structured lessons from fundamentals to advanced patterns.', icon: 'route', countKey: 'learningPath', itemNoun: 'lesson' },
  { id: 'study-plans', title: 'Study plans', description: 'Curated routes through the app, in order, with a tick list you can pick back up.', icon: 'flag', countKey: 'studyPlans', itemNoun: 'plan' },
  { id: 'projects', title: 'Projects', description: 'Build something end to end, one step at a time, each with a checkpoint that says when you are done.', icon: 'build-circle', countKey: 'projects', itemNoun: 'project' },
  { id: 'system-design', title: 'System design', description: 'Open questions worked in stages, with what separates a strong answer from a weak one.', icon: 'schema', countKey: 'designScenarios', itemNoun: 'scenario' },
  { id: 'faq', title: 'React Native FAQ', description: 'Practical answers to common React Native questions.', icon: 'help-outline', countKey: 'faq', itemNoun: 'answer' },
  { id: 'glossary', title: 'Glossary', description: 'Every term the lessons use, defined for React Native.', icon: 'menu-book', countKey: 'glossary', itemNoun: 'term' },
  { id: 'quizzes', title: 'Quizzes', description: 'Check what stuck, one quiz per track.', icon: 'quiz', countKey: 'quizzes', itemNoun: 'quiz' },
  { id: 'review', title: 'Review', description: 'Spaced repetition across flashcards and interview questions.', icon: 'style', countKey: 'review', itemNoun: 'card' },
  { id: 'cheat-sheets', title: 'Cheat sheets', description: 'Dense one-page maps of a whole topic, for revising fast.', icon: 'summarize', countKey: 'cheatSheets', itemNoun: 'sheet' },
  { id: 'checklists', title: 'Checklists', description: 'Step-by-step release and audit runs you can tick off.', icon: 'checklist', countKey: 'checklists', itemNoun: 'checklist' },
  { id: 'decision-guides', title: 'Decision guides', description: 'Answer a few questions and get a recommendation, not a comparison table.', icon: 'alt-route', countKey: 'decisionGuides', itemNoun: 'guide' },
  { id: 'snippets', title: 'Snippets', description: 'Short pieces of working code to copy when you need them.', icon: 'content-copy', countKey: 'snippets', itemNoun: 'snippet' },
  { id: 'code-challenges', title: 'Code challenges', description: 'Find the bug in real React Native code, then check your answer.', icon: 'bug-report', countKey: 'codeChallenges', itemNoun: 'challenge' },
  { id: 'good-to-know', title: 'Good to know', description: 'The wider mobile ecosystem, and when to choose it over React Native.', icon: 'tips-and-updates', countKey: 'goodToKnow', itemNoun: 'reference' },
  { id: 'interview-prep', title: 'Interview Prep', description: 'Practice questions for every experience level.', icon: 'school', countKey: 'interviewPrep', itemNoun: 'question' },
];

export function getLearningArea(areaId: string | undefined) {
  return learningAreas.find((area) => area.id === areaId);
}

/**
 * Only areas backed by published content are offered. An area whose content
 * type has not been authored yet would otherwise open onto an empty list, so
 * it is withheld from the home screen until its records exist.
 */
export function getAvailableLearningAreas(counts: LearningAreaContentCounts | null): LearningArea[] {
  if (!counts) return [];
  return learningAreas.filter((area) => counts[area.countKey] > 0);
}

export function formatLearningAreaCount(count: number, itemNoun: string): string {
  return `${count.toLocaleString('en-US')} ${itemNoun}${count === 1 ? '' : 's'}`;
}
