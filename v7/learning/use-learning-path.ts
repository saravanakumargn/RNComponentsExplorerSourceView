import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import { getLearningProgressRepository } from '@/features/learning/data/learning-progress-repository';
import type { LearningTopic } from '@/features/learning/data/learning-types';
import { learningProgressPercent, learningTopicState } from '@/features/learning/learning-progress-summary';

export type TopicProgress = LearningTopic & {
  completed: number;
  percent: number;
  state: ReturnType<typeof learningTopicState>;
};

/**
 * The curriculum with each topic's completion folded in.
 *
 * Reloaded on focus, like every other progress-bearing screen: lessons get
 * finished and progress gets reset elsewhere, and a stale percentage here is
 * the one number a reader would take as the truth.
 */
export function useLearningPath(): { error: Error | null; topics: TopicProgress[] | null } {
  const database = useSQLiteContext();
  const [topics, setTopics] = useState<TopicProgress[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(() => {
    let active = true;
    void (async () => {
      try {
        const repository = createLearningContentRepository(database);
        const [content, progress] = await Promise.all([repository.getTopics(), getLearningProgressRepository()]);
        const completedLessonIds = new Set((await progress.getCompletedLessons()).map((lesson) => lesson.lessonId));
        const rows = await Promise.all(content.map(async (topic) => {
          const completed = (await repository.getSubtopicsForTopic(topic.topicId)).filter((lesson) => completedLessonIds.has(lesson.subtopicId)).length;
          return { ...topic, completed, percent: learningProgressPercent(completed, topic.lessonCount), state: learningTopicState(completed, topic.lessonCount) };
        }));
        if (active) setTopics(rows);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause : new Error('Learning Path is unavailable.'));
      }
    })();
    return () => { active = false; };
  }, [database]);

  useFocusEffect(load);

  return { error, topics };
}
