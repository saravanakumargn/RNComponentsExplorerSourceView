import type { SQLiteDatabase } from 'expo-sqlite';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sqliteMocks = vi.hoisted(() => ({ openDatabaseAsync: vi.fn() }));
vi.mock('expo-sqlite', () => ({ openDatabaseAsync: sqliteMocks.openDatabaseAsync }));

function createDatabaseMock() {
  return {
    execAsync: vi.fn().mockResolvedValue(undefined),
    runAsync: vi.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 1 }),
    getFirstAsync: vi.fn(),
    getAllAsync: vi.fn(),
    withTransactionAsync: vi.fn(async (work: () => Promise<void>) => { await work(); }),
  } as unknown as SQLiteDatabase;
}

async function loadModule() { return import('./learning-progress-repository'); }

describe('learning progress v2 database', () => {
  beforeEach(() => { vi.resetModules(); sqliteMocks.openDatabaseAsync.mockReset(); });

  it('opens only the greenfield v2 filename and creates every locked progress table once', async () => {
    const database = createDatabaseMock();
    sqliteMocks.openDatabaseAsync.mockResolvedValue(database);
    const { initializeLearningProgressDatabase } = await loadModule();
    await initializeLearningProgressDatabase();
    await initializeLearningProgressDatabase();
    expect(sqliteMocks.openDatabaseAsync).toHaveBeenCalledTimes(1);
    expect(sqliteMocks.openDatabaseAsync).toHaveBeenCalledWith('learning-progress-v2.db');
    const schema = vi.mocked(database.execAsync).mock.calls[0][0] as string;
    for (const table of ['reviews', 'quiz_attempts', 'quiz_answers', 'learning_path_progress', 'project_progress', 'completed_lessons', 'challenge_attempts', 'checklist_progress', 'bookmarks', 'learning_state']) expect(schema).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    expect(schema).not.toContain('user_version');
  });

  /**
   * The reset iterates a hand-written list. A table added to the schema but not
   * to that list would survive a wipe the reader was told cleared everything,
   * which is the one failure a reset must not have — so the two are compared
   * rather than trusted.
   */
  it('resets every table the schema creates, with no list entry that no longer exists', async () => {
    const { LEARNING_PROGRESS_SCHEMA, LEARNING_PROGRESS_TABLES } = await loadModule();
    const declared = [...LEARNING_PROGRESS_SCHEMA.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)/g)].map((match) => match[1]);

    expect(declared.length).toBeGreaterThan(0);
    expect([...LEARNING_PROGRESS_TABLES].sort()).toEqual(declared.sort());
  });

  it('allows retry after a transient open failure', async () => {
    const database = createDatabaseMock();
    sqliteMocks.openDatabaseAsync.mockRejectedValueOnce(new Error('disk unavailable')).mockResolvedValueOnce(database);
    const { initializeLearningProgressDatabase } = await loadModule();
    await expect(initializeLearningProgressDatabase()).rejects.toThrow('disk unavailable');
    await expect(initializeLearningProgressDatabase()).resolves.toBe(database);
  });
});

describe('learning progress v2 repository', () => {
  beforeEach(() => vi.resetModules());

  it('preserves valid resume state and rejects malformed state', async () => {
    const database = createDatabaseMock();
    const lesson = { topicId: 9, topicName: 'Architecture', subtopicId: 901, subtopicName: 'Overview' };
    vi.mocked(database.getFirstAsync).mockResolvedValueOnce({ value: JSON.stringify(lesson) }).mockResolvedValueOnce({ value: '{bad' });
    const repository = (await loadModule()).createLearningProgressRepository(database);
    await expect(repository.getLastReadLesson()).resolves.toEqual(lesson);
    await expect(repository.getLastReadLesson()).resolves.toBeNull();
  });

  it('uses lesson identity only and never rewrites the first completion timestamp', async () => {
    const database = createDatabaseMock();
    const repository = (await loadModule()).createLearningProgressRepository(database);
    await repository.markLessonCompleted(901, '2026-08-07T00:00:00.000Z');
    expect(database.runAsync).toHaveBeenCalledWith(expect.stringContaining('ON CONFLICT(lesson_id) DO NOTHING'), 901, '2026-08-07T00:00:00.000Z');
  });

  it('maps completion rows and parameterizes completion checks', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValue([{ lesson_id: 901, completed_at: '2026-08-07T00:00:00.000Z' }]);
    vi.mocked(database.getFirstAsync).mockResolvedValue({ count: 1 });
    const repository = (await loadModule()).createLearningProgressRepository(database);
    await expect(repository.getCompletedLessons()).resolves.toEqual([{ lessonId: 901, completedAt: '2026-08-07T00:00:00.000Z' }]);
    await expect(repository.isLessonCompleted(901)).resolves.toBe(true);
    expect(database.getFirstAsync).toHaveBeenCalledWith(expect.stringContaining('lesson_id = ?'), 901);
  });

  it('writes a quiz attempt and every answer inside one transaction', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.runAsync).mockResolvedValue({ changes: 1, lastInsertRowId: 42 } as never);
    const repository = (await loadModule()).createLearningProgressRepository(database);

    const attemptId = await repository.recordQuizAttempt({
      quizId: 1,
      score: 12,
      total: 15,
      answers: [{ quizQuestionId: 11, selectedOptionId: 111, correct: true }, { quizQuestionId: 12, selectedOptionId: 121, correct: false }],
    }, '2026-08-11T00:00:00.000Z');

    expect(attemptId).toBe(42);
    expect(database.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(database.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO quiz_attempts'), 1, 12, 15, '2026-08-11T00:00:00.000Z');
    expect(database.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO quiz_answers'), 42, 11, 111, 1);
    expect(database.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO quiz_answers'), 42, 12, 121, 0);
  });

  it('maps every review row into scheduler state', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValue([{ item_type: 'flashcard', item_id: 4, reviewed_at: '2026-08-12T09:00:00.000Z', rating: 2, interval_days: 3, ease: 2.5, due_at: '2026-08-15T09:00:00.000Z' }]);
    const repository = (await loadModule()).createLearningProgressRepository(database);

    await expect(repository.getReviewRecords()).resolves.toEqual([{ itemType: 'flashcard', itemId: 4, reviewedAt: '2026-08-12T09:00:00.000Z', rating: 2, intervalDays: 3, ease: 2.5, dueAt: '2026-08-15T09:00:00.000Z' }]);
  });

  it('keeps one row per card so rating it twice in a sitting replaces the schedule rather than duplicating it', async () => {
    const database = createDatabaseMock();
    const repository = (await loadModule()).createLearningProgressRepository(database);

    await repository.recordReview({ itemType: 'interview_question', itemId: 23 }, { rating: 0, intervalDays: 0, ease: 2.3, dueAt: '2026-08-12T09:00:00.000Z' }, '2026-08-12T09:00:00.000Z');

    const [sql, ...parameters] = vi.mocked(database.runAsync).mock.calls[0];
    expect(sql).toContain('ON CONFLICT(item_type, item_id) DO UPDATE');
    expect(parameters).toEqual(['interview_question', 23, '2026-08-12T09:00:00.000Z', 0, 0, 2.3, '2026-08-12T09:00:00.000Z']);
  });

  it('counts what is due against a caller-supplied cutoff rather than an implicit clock', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValue({ count: 12 });
    const repository = (await loadModule()).createLearningProgressRepository(database);

    await expect(repository.getDueReviewCount('2026-08-12T23:59:59.999Z')).resolves.toBe(12);
    expect(database.getFirstAsync).toHaveBeenCalledWith(expect.stringContaining('due_at <= ?'), '2026-08-12T23:59:59.999Z');
  });

  it('stores a tick as a row and an untick as its absence, so the table only holds work actually done', async () => {
    const database = createDatabaseMock();
    const repository = (await loadModule()).createLearningProgressRepository(database);

    await repository.setChecklistItemChecked(1501, 7, true, '2026-08-12T09:00:00.000Z');
    expect(database.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO checklist_progress'), 1501, 7, '2026-08-12T09:00:00.000Z');

    await repository.setChecklistItemChecked(1501, 7, false);
    expect(database.runAsync).toHaveBeenLastCalledWith(expect.stringContaining('DELETE FROM checklist_progress WHERE checklist_id = ? AND item_id = ?'), 1501, 7);
  });

  it('resets one checklist without touching another still in progress', async () => {
    const database = createDatabaseMock();
    const repository = (await loadModule()).createLearningProgressRepository(database);

    await repository.clearChecklistProgress(1501);
    const [sql, ...parameters] = vi.mocked(database.runAsync).mock.calls[0];
    expect(sql).toContain('WHERE checklist_id = ?');
    expect(parameters).toEqual([1501]);
  });

  it('reads ticked items for one checklist and ticked counts for every checklist', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync)
      .mockResolvedValueOnce([{ item_id: 3 }, { item_id: 7 }])
      .mockResolvedValueOnce([{ checklist_id: 1501, count: 2 }, { checklist_id: 1702, count: 14 }]);
    const repository = (await loadModule()).createLearningProgressRepository(database);

    await expect(repository.getCheckedChecklistItems(1501)).resolves.toEqual([3, 7]);
    await expect(repository.getChecklistCheckedCounts()).resolves.toEqual({ 1501: 2, 1702: 14 });
  });

  it('empties every progress table in one transaction, so a reset cannot half-finish', async () => {
    const database = createDatabaseMock();
    const { createLearningProgressRepository, LEARNING_PROGRESS_TABLES } = await loadModule();

    await createLearningProgressRepository(database).resetLearningProgress();

    expect(database.withTransactionAsync).toHaveBeenCalledTimes(1);
    const deleted = vi.mocked(database.runAsync).mock.calls.map(([sql]) => sql);
    for (const table of LEARNING_PROGRESS_TABLES) expect(deleted).toContain(`DELETE FROM ${table}`);
    expect(deleted).toHaveLength(LEARNING_PROGRESS_TABLES.length);
  });

  it('counts what a reset would destroy so the confirmation can name it', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync)
      .mockResolvedValueOnce({ count: 12 })
      .mockResolvedValueOnce({ count: 8 })
      .mockResolvedValueOnce({ count: 34 })
      .mockResolvedValueOnce({ count: 5 });
    const repository = (await loadModule()).createLearningProgressRepository(database);

    await expect(repository.getLearningResetSummary()).resolves.toEqual({ completedLessons: 12, quizAttempts: 8, reviewedItems: 34, checkedChecklistItems: 5 });
  });

  it('reports an empty database as nothing to reset rather than as unavailable', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValue(null);
    const repository = (await loadModule()).createLearningProgressRepository(database);

    await expect(repository.getLearningResetSummary()).resolves.toEqual({ completedLessons: 0, quizAttempts: 0, reviewedItems: 0, checkedChecklistItems: 0 });
  });

  it('reads the best attempt per quiz rather than the latest, so passing once is not undone', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValue([{ attempt_id: 42, quiz_id: 1, score: 12, total: 15, completed_at: '2026-08-11T00:00:00.000Z' }]);
    const repository = (await loadModule()).createLearningProgressRepository(database);

    await expect(repository.getBestQuizAttempts()).resolves.toEqual([{ attemptId: 42, quizId: 1, score: 12, total: 15, completedAt: '2026-08-11T00:00:00.000Z' }]);
    const [sql] = vi.mocked(database.getAllAsync).mock.calls[0];
    expect(sql).toContain('ORDER BY CAST(ranked.score AS REAL) / ranked.total DESC');
  });
});
