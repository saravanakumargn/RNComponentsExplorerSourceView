import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import type { ActiveQuizAttempt, CompletedLesson, LastReadLesson, LearningResetSummary, QuizAttempt, ReviewItemKey, ReviewItemType, ReviewRecord } from './learning-types';

export const LEARNING_PROGRESS_DATABASE_NAME = 'learning-progress-v2.db';
const LAST_READ_LESSON_KEY = 'last_read_lesson';

/**
 * Every table a reset empties, kept beside the schema it mirrors.
 *
 * A progress table missing from this list would quietly survive a wipe the
 * reader was told cleared everything, so the schema test asserts the two stay
 * in step rather than trusting whoever adds the next table to remember.
 */
export const LEARNING_PROGRESS_TABLES = [
  'reviews',
  'quiz_attempts',
  'quiz_answers',
  'active_quiz_attempts',
  'learning_path_progress',
  'project_progress',
  'completed_lessons',
  'challenge_attempts',
  'checklist_progress',
  'bookmarks',
  'learning_state',
] as const;

let progressDatabasePromise: Promise<SQLiteDatabase> | undefined;

type LearningStateRow = { value: string };
type CompletedLessonRow = { lesson_id: number; completed_at: string };
type QuizAttemptRow = { attempt_id: number; quiz_id: number; score: number; total: number; completed_at: string };
type ActiveQuizAttemptRow = { quiz_id: number; question_order: string; option_order: string; selections: string; current_index: number; updated_at: string };
type ReviewRow = { item_type: ReviewItemType; item_id: number; reviewed_at: string; rating: number; interval_days: number; ease: number; due_at: string };

export const LEARNING_PROGRESS_SCHEMA = `
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS reviews (
    item_type TEXT NOT NULL CHECK (item_type IN ('flashcard', 'interview_question')),
    item_id INTEGER NOT NULL,
    reviewed_at TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 0 AND 3),
    interval_days INTEGER NOT NULL CHECK (interval_days >= 0),
    ease REAL NOT NULL CHECK (ease > 0),
    due_at TEXT NOT NULL,
    PRIMARY KEY (item_type, item_id)
  ) STRICT;
  CREATE INDEX IF NOT EXISTS reviews_due_at_idx ON reviews(due_at);
  CREATE TABLE IF NOT EXISTS quiz_attempts (attempt_id INTEGER PRIMARY KEY AUTOINCREMENT, quiz_id INTEGER NOT NULL, score INTEGER NOT NULL CHECK (score >= 0), total INTEGER NOT NULL CHECK (total > 0 AND score <= total), completed_at TEXT NOT NULL) STRICT;
  CREATE TABLE IF NOT EXISTS quiz_answers (attempt_id INTEGER NOT NULL, quiz_question_id INTEGER NOT NULL, selected_option_id INTEGER NOT NULL, correct INTEGER NOT NULL CHECK (correct IN (0, 1)), PRIMARY KEY (attempt_id, quiz_question_id, selected_option_id)) STRICT;
  CREATE TABLE IF NOT EXISTS active_quiz_attempts (quiz_id INTEGER PRIMARY KEY, question_order TEXT NOT NULL, option_order TEXT NOT NULL, selections TEXT NOT NULL, current_index INTEGER NOT NULL CHECK (current_index >= 0), updated_at TEXT NOT NULL) STRICT;
  CREATE TABLE IF NOT EXISTS learning_path_progress (path_id INTEGER NOT NULL, position INTEGER NOT NULL CHECK (position > 0), completed_at TEXT NOT NULL, PRIMARY KEY (path_id, position)) STRICT;
  CREATE TABLE IF NOT EXISTS project_progress (project_id INTEGER NOT NULL, position INTEGER NOT NULL CHECK (position > 0), completed_at TEXT NOT NULL, PRIMARY KEY (project_id, position)) STRICT;
  CREATE TABLE IF NOT EXISTS completed_lessons (lesson_id INTEGER PRIMARY KEY, completed_at TEXT NOT NULL) STRICT;
  CREATE TABLE IF NOT EXISTS challenge_attempts (challenge_id INTEGER NOT NULL, solved INTEGER NOT NULL CHECK (solved IN (0, 1)), hints_used INTEGER NOT NULL CHECK (hints_used >= 0), attempted_at TEXT NOT NULL, PRIMARY KEY (challenge_id, attempted_at)) STRICT;
  CREATE TABLE IF NOT EXISTS checklist_progress (checklist_id INTEGER NOT NULL, item_id INTEGER NOT NULL, checked_at TEXT NOT NULL, PRIMARY KEY (checklist_id, item_id)) STRICT;
  CREATE TABLE IF NOT EXISTS bookmarks (item_type TEXT NOT NULL, item_id INTEGER NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY (item_type, item_id)) STRICT;
  CREATE TABLE IF NOT EXISTS learning_state (key TEXT PRIMARY KEY, value TEXT NOT NULL) STRICT;
`;

function isLastReadLesson(value: unknown): value is LastReadLesson {
  if (!value || typeof value !== 'object') return false;
  const lesson = value as Record<string, unknown>;
  return Number.isInteger(lesson.topicId)
    && Number.isInteger(lesson.subtopicId)
    && typeof lesson.topicName === 'string'
    && typeof lesson.subtopicName === 'string';
}

function isNumberRecord(value: unknown): value is Record<number, number> {
  return !!value && typeof value === 'object' && Object.entries(value).every(([key, item]) => Number.isInteger(Number(key)) && Number.isInteger(item));
}

function isOptionOrder(value: unknown): value is Record<number, number[]> {
  return !!value && typeof value === 'object' && Object.entries(value).every(([key, item]) => Number.isInteger(Number(key)) && Array.isArray(item) && item.every(Number.isInteger));
}

function toActiveQuizAttempt(row: ActiveQuizAttemptRow): ActiveQuizAttempt | null {
  try {
    const questionOrder: unknown = JSON.parse(row.question_order);
    const optionOrder: unknown = JSON.parse(row.option_order);
    const selections: unknown = JSON.parse(row.selections);
    if (!Array.isArray(questionOrder) || !questionOrder.every(Number.isInteger) || !isOptionOrder(optionOrder) || !isNumberRecord(selections) || !Number.isInteger(row.current_index) || row.current_index < 0) return null;
    return { quizId: row.quiz_id, questionOrder, optionOrder, selections, currentIndex: row.current_index, updatedAt: row.updated_at };
  } catch {
    return null;
  }
}

export async function initializeLearningProgressDatabase(): Promise<SQLiteDatabase> {
  if (!progressDatabasePromise) {
    progressDatabasePromise = (async () => {
      const database = await openDatabaseAsync(LEARNING_PROGRESS_DATABASE_NAME);
      await database.execAsync(LEARNING_PROGRESS_SCHEMA);
      return database;
    })().catch((error: unknown) => {
      progressDatabasePromise = undefined;
      throw error;
    });
  }
  return progressDatabasePromise;
}

export function createLearningProgressRepository(database: SQLiteDatabase) {
  return {
    /**
     * One row per attempt rather than one per challenge: the interesting
     * question is whether solving got easier over time, which a single
     * overwritten row cannot answer.
     */
    async recordChallengeAttempt(attempt: { challengeId: number; solved: boolean; hintsUsed: number }, attemptedAt = new Date().toISOString()): Promise<void> {
      await database.runAsync('INSERT OR REPLACE INTO challenge_attempts (challenge_id, solved, hints_used, attempted_at) VALUES (?, ?, ?, ?)', attempt.challengeId, attempt.solved ? 1 : 0, attempt.hintsUsed, attemptedAt);
    },

    async getSolvedChallengeIds(): Promise<number[]> {
      const rows = await database.getAllAsync<{ challenge_id: number }>('SELECT DISTINCT challenge_id FROM challenge_attempts WHERE solved = 1');
      return rows.map((row) => row.challenge_id);
    },

    async saveLastReadLesson(lesson: LastReadLesson): Promise<void> {
      await database.runAsync('INSERT INTO learning_state (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', LAST_READ_LESSON_KEY, JSON.stringify(lesson));
    },

    async getLastReadLesson(): Promise<LastReadLesson | null> {
      const row = await database.getFirstAsync<LearningStateRow>('SELECT value FROM learning_state WHERE key = ?', LAST_READ_LESSON_KEY);
      if (!row) return null;
      try {
        const parsed: unknown = JSON.parse(row.value);
        return isLastReadLesson(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },

    async markLessonCompleted(lessonId: number, completedAt = new Date().toISOString()): Promise<void> {
      await database.runAsync('INSERT INTO completed_lessons (lesson_id, completed_at) VALUES (?, ?) ON CONFLICT(lesson_id) DO NOTHING', lessonId, completedAt);
    },

    async getCompletedLessonCount(): Promise<number> {
      const row = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM completed_lessons');
      return row?.count ?? 0;
    },

    async getCompletedLessons(): Promise<CompletedLesson[]> {
      const rows = await database.getAllAsync<CompletedLessonRow>('SELECT lesson_id, completed_at FROM completed_lessons ORDER BY completed_at ASC');
      return rows.map((row) => ({ lessonId: row.lesson_id, completedAt: row.completed_at }));
    },

    /**
     * Stores a finished attempt and the answer behind every question in one
     * transaction, so a crash mid-write cannot leave a score with no answers to
     * explain it. Returns the attempt id the answers were filed under.
     */
    async recordQuizAttempt(attempt: { quizId: number; score: number; total: number; answers: { quizQuestionId: number; selectedOptionId: number; correct: boolean }[] }, completedAt = new Date().toISOString()): Promise<number> {
      let attemptId = 0;
      await database.withTransactionAsync(async () => {
        const result = await database.runAsync('INSERT INTO quiz_attempts (quiz_id, score, total, completed_at) VALUES (?, ?, ?, ?)', attempt.quizId, attempt.score, attempt.total, completedAt);
        attemptId = result.lastInsertRowId;
        for (const answer of attempt.answers) {
          await database.runAsync('INSERT INTO quiz_answers (attempt_id, quiz_question_id, selected_option_id, correct) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING', attemptId, answer.quizQuestionId, answer.selectedOptionId, answer.correct ? 1 : 0);
        }
        await database.runAsync('DELETE FROM active_quiz_attempts WHERE quiz_id = ?', attempt.quizId);
      });
      return attemptId;
    },

    /**
     * The best attempt per quiz, which is what the list shows: a reader who
     * passed once should keep seeing that they passed, not their latest slip.
     */
    async getBestQuizAttempts(): Promise<QuizAttempt[]> {
      const rows = await database.getAllAsync<QuizAttemptRow>(`
        SELECT attempt_id, quiz_id, score, total, completed_at
        FROM quiz_attempts
        WHERE attempt_id IN (
          SELECT attempt_id FROM quiz_attempts AS ranked
          WHERE ranked.quiz_id = quiz_attempts.quiz_id
          ORDER BY CAST(ranked.score AS REAL) / ranked.total DESC, ranked.completed_at DESC
          LIMIT 1
        )
        ORDER BY quiz_id ASC
      `);
      return rows.map((row) => ({ attemptId: row.attempt_id, quizId: row.quiz_id, score: row.score, total: row.total, completedAt: row.completed_at }));
    },

    async getQuizAttemptCount(quizId: number): Promise<number> {
      const row = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM quiz_attempts WHERE quiz_id = ?', quizId);
      return row?.count ?? 0;
    },

    async saveActiveQuizAttempt(attempt: Omit<ActiveQuizAttempt, 'updatedAt'>, updatedAt = new Date().toISOString()): Promise<void> {
      await database.runAsync(
        `INSERT INTO active_quiz_attempts (quiz_id, question_order, option_order, selections, current_index, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(quiz_id) DO UPDATE SET question_order = excluded.question_order, option_order = excluded.option_order, selections = excluded.selections, current_index = excluded.current_index, updated_at = excluded.updated_at`,
        attempt.quizId, JSON.stringify(attempt.questionOrder), JSON.stringify(attempt.optionOrder), JSON.stringify(attempt.selections), attempt.currentIndex, updatedAt,
      );
    },

    async getActiveQuizAttempt(quizId: number): Promise<ActiveQuizAttempt | null> {
      const row = await database.getFirstAsync<ActiveQuizAttemptRow>('SELECT quiz_id, question_order, option_order, selections, current_index, updated_at FROM active_quiz_attempts WHERE quiz_id = ?', quizId);
      return row ? toActiveQuizAttempt(row) : null;
    },

    async clearActiveQuizAttempt(quizId: number): Promise<void> {
      await database.runAsync('DELETE FROM active_quiz_attempts WHERE quiz_id = ?', quizId);
    },

    /**
     * The scheduler's whole state, which is one row per card the reader has
     * ever rated — at most the size of the corpus, and the only way to tell a
     * card that is due from one that has never been seen.
     */
    async getReviewRecords(): Promise<ReviewRecord[]> {
      const rows = await database.getAllAsync<ReviewRow>('SELECT item_type, item_id, reviewed_at, rating, interval_days, ease, due_at FROM reviews');
      return rows.map((row) => ({ itemType: row.item_type, itemId: row.item_id, reviewedAt: row.reviewed_at, rating: row.rating, intervalDays: row.interval_days, ease: row.ease, dueAt: row.due_at }));
    },

    /**
     * How many cards are waiting, answered by the index rather than by reading
     * every row — this is what the home screen and the review header ask for.
     */
    async getDueReviewCount(cutoff: string): Promise<number> {
      const row = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM reviews WHERE due_at <= ?', cutoff);
      return row?.count ?? 0;
    },

    /**
     * One row per card, replaced on every rating: the schedule is a card's
     * current state, not a history. Rating a card twice in a sitting — which
     * "Again" makes normal — must leave one row, not two.
     */
    async recordReview(key: ReviewItemKey, review: { rating: number; intervalDays: number; ease: number; dueAt: string }, reviewedAt = new Date().toISOString()): Promise<void> {
      await database.runAsync(
        `INSERT INTO reviews (item_type, item_id, reviewed_at, rating, interval_days, ease, due_at) VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(item_type, item_id) DO UPDATE SET reviewed_at = excluded.reviewed_at, rating = excluded.rating, interval_days = excluded.interval_days, ease = excluded.ease, due_at = excluded.due_at`,
        key.itemType, key.itemId, reviewedAt, review.rating, review.intervalDays, review.ease, review.dueAt,
      );
    },

    /**
     * Which items of one checklist are ticked. Absence is the unticked state —
     * unticking deletes the row rather than storing a false, so the table only
     * ever holds work the reader actually did.
     */
    async getCheckedChecklistItems(checklistId: number): Promise<number[]> {
      const rows = await database.getAllAsync<{ item_id: number }>('SELECT item_id FROM checklist_progress WHERE checklist_id = ? ORDER BY item_id', checklistId);
      return rows.map((row) => row.item_id);
    },

    /** Positions ticked in one study plan. */
    async getStudyPlanDonePositions(pathId: number): Promise<number[]> {
      const rows = await database.getAllAsync<{ position: number }>('SELECT position FROM learning_path_progress WHERE path_id = ? ORDER BY position', pathId);
      return rows.map((row) => row.position);
    },

    /** Done counts for every plan at once, for the list badges. */
    async getStudyPlanDoneCounts(): Promise<Record<number, number>> {
      const rows = await database.getAllAsync<{ path_id: number; count: number }>('SELECT path_id, COUNT(*) AS count FROM learning_path_progress GROUP BY path_id');
      return Object.fromEntries(rows.map((row) => [row.path_id, row.count]));
    },

    /*
     * Keyed by position rather than by the item it points at, because the same
     * lesson can appear in two plans and finishing it in one does not mean you
     * worked it in the other. It also means a plan can list a record twice on
     * purpose without the two rows ticking together.
     */
    async setStudyPlanItemDone(pathId: number, position: number, done: boolean, completedAt = new Date().toISOString()): Promise<void> {
      if (done) {
        await database.runAsync('INSERT INTO learning_path_progress (path_id, position, completed_at) VALUES (?, ?, ?) ON CONFLICT(path_id, position) DO NOTHING', pathId, position, completedAt);
        return;
      }
      await database.runAsync('DELETE FROM learning_path_progress WHERE path_id = ? AND position = ?', pathId, position);
    },

    /** Positions ticked in one guided project. */
    async getProjectDonePositions(projectId: number): Promise<number[]> {
      const rows = await database.getAllAsync<{ position: number }>('SELECT position FROM project_progress WHERE project_id = ? ORDER BY position', projectId);
      return rows.map((row) => row.position);
    },

    /** Done counts for every project at once, for the list badges. */
    async getProjectDoneCounts(): Promise<Record<number, number>> {
      const rows = await database.getAllAsync<{ project_id: number; count: number }>('SELECT project_id, COUNT(*) AS count FROM project_progress GROUP BY project_id');
      return Object.fromEntries(rows.map((row) => [row.project_id, row.count]));
    },

    /*
     * Keyed by position for the same reason a study plan is: a project's step
     * rows have no id of their own that survives a content update, and position
     * is what the reader is actually working through.
     */
    async setProjectStepDone(projectId: number, position: number, done: boolean, completedAt = new Date().toISOString()): Promise<void> {
      if (done) {
        await database.runAsync('INSERT INTO project_progress (project_id, position, completed_at) VALUES (?, ?, ?) ON CONFLICT(project_id, position) DO NOTHING', projectId, position, completedAt);
        return;
      }
      await database.runAsync('DELETE FROM project_progress WHERE project_id = ? AND position = ?', projectId, position);
    },

    /** Ticked counts for every checklist at once, for the list badges. */
    async getChecklistCheckedCounts(): Promise<Record<number, number>> {
      const rows = await database.getAllAsync<{ checklist_id: number; count: number }>('SELECT checklist_id, COUNT(*) AS count FROM checklist_progress GROUP BY checklist_id');
      return Object.fromEntries(rows.map((row) => [row.checklist_id, row.count]));
    },

    async setChecklistItemChecked(checklistId: number, itemId: number, checked: boolean, checkedAt = new Date().toISOString()): Promise<void> {
      if (checked) {
        await database.runAsync('INSERT INTO checklist_progress (checklist_id, item_id, checked_at) VALUES (?, ?, ?) ON CONFLICT(checklist_id, item_id) DO NOTHING', checklistId, itemId, checkedAt);
        return;
      }
      await database.runAsync('DELETE FROM checklist_progress WHERE checklist_id = ? AND item_id = ?', checklistId, itemId);
    },

    /**
     * Clears one checklist so it can be run again for the next release. Scoped
     * to the checklist rather than the table: these are per-release runs, and
     * resetting one must not wipe another still in progress.
     */
    async clearChecklistProgress(checklistId: number): Promise<void> {
      await database.runAsync('DELETE FROM checklist_progress WHERE checklist_id = ?', checklistId);
    },

    /**
     * What a reset would destroy, counted before it is offered. A confirmation
     * that names the real numbers is a decision; "are you sure?" is a guess.
     */
    async getLearningResetSummary(): Promise<LearningResetSummary> {
      const [lessons, quizzes, reviews, checklists] = await Promise.all([
        database.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM completed_lessons'),
        database.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM quiz_attempts'),
        database.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM reviews'),
        database.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM checklist_progress'),
      ]);
      return {
        completedLessons: lessons?.count ?? 0,
        quizAttempts: quizzes?.count ?? 0,
        reviewedItems: reviews?.count ?? 0,
        checkedChecklistItems: checklists?.count ?? 0,
      };
    },

    /**
     * Empties every progress table in one transaction, so an interrupted reset
     * leaves the reader with all of their progress or none of it — never a
     * half-wiped state where finished lessons disagree with quiz scores.
     *
     * Purchases live with the store, not here: resetting what you have learned
     * must never cost you what you paid for.
     */
    async resetLearningProgress(): Promise<void> {
      await database.withTransactionAsync(async () => {
        for (const table of LEARNING_PROGRESS_TABLES) await database.runAsync(`DELETE FROM ${table}`);
      });
    },

    async isLessonCompleted(lessonId: number): Promise<boolean> {
      const row = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM completed_lessons WHERE lesson_id = ?', lessonId);
      return (row?.count ?? 0) > 0;
    },
  };
}

export async function getLearningProgressRepository() {
  return createLearningProgressRepository(await initializeLearningProgressDatabase());
}

export type LearningProgressRepository = ReturnType<typeof createLearningProgressRepository>;
