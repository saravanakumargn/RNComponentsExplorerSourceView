import type { LearningSubtopic } from './data/learning-types';

export type LessonWithCompletion = LearningSubtopic & { completed: boolean };

export type LearningLessonSection = {
  title: string;
  data: LessonWithCompletion[];
};

function difficultyTitle(level: number | null): string {
  switch (level) {
    case 1:
      return 'Beginner';
    case 2:
      return 'Intermediate';
    case 3:
      return 'Advanced';
    default:
      return 'Unknown';
  }
}

/**
 * Mirrors the legacy SectionList's difficulty grouping while retaining the
 * repository's stable subtopic order inside every section.
 */
export function groupLessonsIntoSections(lessons: LessonWithCompletion[]): LearningLessonSection[] {
  const sections = new Map<string, LearningLessonSection>();

  for (const lesson of lessons) {
    const title = difficultyTitle(lesson.level);
    const section = sections.get(title);
    if (section) section.data.push(lesson);
    else sections.set(title, { title, data: [lesson] });
  }

  return [...sections.values()];
}

export function getLessonAccessibilityLabel({
  lesson,
  unlocked,
}: {
  lesson: LessonWithCompletion;
  unlocked: boolean;
}): string {
  const description = lesson.subtopicDescription ? ` ${lesson.subtopicDescription}.` : '';
  const completion = lesson.completed ? ' Completed.' : ' Not completed.';
  return `${lesson.subtopicName}.${description}${completion} ${unlocked ? 'Available. Opens lesson.' : 'Locked. Opens unlock options.'}`;
}
