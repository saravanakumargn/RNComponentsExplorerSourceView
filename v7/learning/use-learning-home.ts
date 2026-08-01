import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';

import { createLearningContentRepository } from './data/learning-content-repository';
import { getLearningProgressRepository } from './data/learning-progress-repository';
import type { LastReadLesson } from './data/learning-types';
import { learningProgressPercent } from './learning-progress-summary';

export type LearningHomeData = {
  completedLessons: number;
  progressPercent: number;
  resumeLesson: LastReadLesson | null;
  totalLessons: number;
};

export function useLearningHome(): { data: LearningHomeData | null; error: Error | null; refresh: () => void } {
  const database = useSQLiteContext();
  const [refreshToken, setRefreshToken] = useState(0);
  const [data, setData] = useState<LearningHomeData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        setError(null);
        const [topics, progress] = await Promise.all([
          createLearningContentRepository(database).getTopics(),
          getLearningProgressRepository(),
        ]);
        const [completedLessons, resumeLesson] = await Promise.all([
          progress.getCompletedLessonCount(),
          progress.getLastReadLesson(),
        ]);
        if (!active) return;
        const totalLessons = topics.reduce((total, topic) => total + topic.lessonCount, 0);
        setData({ completedLessons, progressPercent: learningProgressPercent(completedLessons, totalLessons), resumeLesson, totalLessons });
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause : new Error('Learning data is unavailable.'));
      }
    })();
    return () => { active = false; };
  }, [database, refreshToken]);

  const refresh = useCallback(() => setRefreshToken((token) => token + 1), []);
  return { data, error, refresh };
}
