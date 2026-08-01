import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import type { CompletedLesson, LastReadLesson } from './learning-types';

const LEARNING_PROGRESS_DATABASE_NAME = 'learning-progress.db';
const LAST_READ_LESSON_KEY = 'last_read_lesson';

let progressDatabasePromise: Promise<SQLiteDatabase> | undefined;

type CompletedLessonRow = {
  topic_id: number;
  subtopic_id: number;
  content_title: string;
  completed_at: string;
};

type LearningStateRow = { value: string };

function toCompletedLesson(row: CompletedLessonRow): CompletedLesson {
  return {
    topicId: row.topic_id,
    subtopicId: row.subtopic_id,
    contentTitle: row.content_title,
    completedAt: row.completed_at,
  };
}

function isLastReadLesson(value: unknown): value is LastReadLesson {
  if (!value || typeof value !== 'object') return false;
  const lesson = value as Record<string, unknown>;
  return Number.isInteger(lesson.topicId)
    && Number.isInteger(lesson.subtopicId)
    && typeof lesson.topicName === 'string'
    && typeof lesson.subtopicName === 'string';
}

export async function initializeLearningProgressDatabase(): Promise<SQLiteDatabase> {
  if (!progressDatabasePromise) {
    progressDatabasePromise = (async () => {
      const database = await openDatabaseAsync(LEARNING_PROGRESS_DATABASE_NAME);
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS completed_lessons (
          topic_id INTEGER NOT NULL,
          subtopic_id INTEGER NOT NULL,
          completed_at TEXT NOT NULL,
          content_title TEXT NOT NULL,
          PRIMARY KEY (topic_id, subtopic_id)
        ) STRICT;
        CREATE INDEX IF NOT EXISTS completed_lessons_subtopic_id_idx
          ON completed_lessons(subtopic_id);
        CREATE TABLE IF NOT EXISTS learning_state (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        ) STRICT;
      `);
      return database;
    })().catch((error: unknown) => {
      // Do not cache a rejected initialization forever: storage can become
      // available after a transient native/filesystem failure.
      progressDatabasePromise = undefined;
      throw error;
    });
  }
  return progressDatabasePromise;
}

export function createLearningProgressRepository(database: SQLiteDatabase) {
  return {
    async saveLastReadLesson(lesson: LastReadLesson): Promise<void> {
      await database.runAsync(`
        INSERT INTO learning_state (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `, LAST_READ_LESSON_KEY, JSON.stringify(lesson));
    },

    async getLastReadLesson(): Promise<LastReadLesson | null> {
      const row = await database.getFirstAsync<LearningStateRow>(
        'SELECT value FROM learning_state WHERE key = ?',
        LAST_READ_LESSON_KEY,
      );
      if (!row) return null;
      try {
        const parsed: unknown = JSON.parse(row.value);
        return isLastReadLesson(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },

    async markLessonCompleted(lesson: Omit<CompletedLesson, 'completedAt'>, completedAt = new Date().toISOString()): Promise<void> {
      await database.runAsync(`
        INSERT INTO completed_lessons (topic_id, subtopic_id, completed_at, content_title)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(topic_id, subtopic_id) DO UPDATE SET content_title = excluded.content_title
      `, lesson.topicId, lesson.subtopicId, completedAt, lesson.contentTitle);
    },

    async getCompletedLessonCount(): Promise<number> {
      const row = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM completed_lessons');
      return row?.count ?? 0;
    },

    async getCompletedLessonsForTopic(topicId: number): Promise<CompletedLesson[]> {
      const rows = await database.getAllAsync<CompletedLessonRow>(`
        SELECT topic_id, subtopic_id, content_title, completed_at
        FROM completed_lessons
        WHERE topic_id = ?
        ORDER BY completed_at ASC
      `, topicId);
      return rows.map(toCompletedLesson);
    },

    async isLessonCompleted(topicId: number, subtopicId: number): Promise<boolean> {
      const row = await database.getFirstAsync<{ count: number }>(`
        SELECT COUNT(*) AS count
        FROM completed_lessons
        WHERE topic_id = ? AND subtopic_id = ?
      `, topicId, subtopicId);
      return (row?.count ?? 0) > 0;
    },
  };
}

export async function getLearningProgressRepository() {
  return createLearningProgressRepository(await initializeLearningProgressDatabase());
}

export type LearningProgressRepository = ReturnType<typeof createLearningProgressRepository>;
