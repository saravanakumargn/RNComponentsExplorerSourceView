export type LearningAreaIcon = 'route' | 'help-outline' | 'tips-and-updates' | 'school';

export type LearningArea = {
  id: string;
  title: string;
  description: string;
  icon: LearningAreaIcon;
};

export const learningAreas: LearningArea[] = [
  { id: 'learning-path', title: 'Learning Path', description: 'Structured lessons from fundamentals to advanced patterns.', icon: 'route' },
  { id: 'faq', title: 'React Native FAQ', description: 'Practical answers to common React Native questions.', icon: 'help-outline' },
  { id: 'good-to-know', title: 'Good to know', description: 'Useful libraries, tools, and ecosystem references.', icon: 'tips-and-updates' },
  { id: 'interview-prep', title: 'Interview Prep', description: 'Practice questions for every experience level.', icon: 'school' },
];

export function getLearningArea(areaId: string | undefined) {
  return learningAreas.find((area) => area.id === areaId);
}
