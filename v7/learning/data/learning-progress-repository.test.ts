import type { SQLiteDatabase } from 'expo-sqlite';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sqliteMocks = vi.hoisted(() => ({
  openDatabaseAsync: vi.fn(),
}));

vi.mock('expo-sqlite', () => ({
  openDatabaseAsync: sqliteMocks.openDatabaseAsync,
}));

function createDatabaseMock() {
  return {
    execAsync: vi.fn().mockResolvedValue(undefined),
    runAsync: vi.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 1 }),
    getFirstAsync: vi.fn(),
    getAllAsync: vi.fn(),
  } as unknown as SQLiteDatabase;
}

async function loadModule() {
  return import('./learning-progress-repository');
}

describe('learning progress database initialization', () => {
  beforeEach(() => {
    vi.resetModules();
    sqliteMocks.openDatabaseAsync.mockReset();
  });

  it('creates the isolated progress schema once and is idempotent in a process', async () => {
    const database = createDatabaseMock();
    sqliteMocks.openDatabaseAsync.mockResolvedValue(database);
    const { initializeLearningProgressDatabase } = await loadModule();

    await expect(initializeLearningProgressDatabase()).resolves.toBe(database);
    await expect(initializeLearningProgressDatabase()).resolves.toBe(database);

    expect(sqliteMocks.openDatabaseAsync).toHaveBeenCalledTimes(1);
    expect(sqliteMocks.openDatabaseAsync).toHaveBeenCalledWith('learning-progress.db');
    expect(database.execAsync).toHaveBeenCalledTimes(1);
    expect(database.execAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS completed_lessons'));
    expect(database.execAsync).toHaveBeenCalledWith(expect.stringContaining('PRIMARY KEY (topic_id, subtopic_id)'));
    expect(database.execAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS learning_state'));
  });

  it('keeps an initialization failure observable instead of silently creating fallback state', async () => {
    sqliteMocks.openDatabaseAsync.mockRejectedValue(new Error('disk unavailable'));
    const { initializeLearningProgressDatabase } = await loadModule();

    await expect(initializeLearningProgressDatabase()).rejects.toThrow('disk unavailable');
  });

  it('allows a retry after a transient initialization failure', async () => {
    const recoveredDatabase = createDatabaseMock();
    sqliteMocks.openDatabaseAsync
      .mockRejectedValueOnce(new Error('disk unavailable'))
      .mockResolvedValueOnce(recoveredDatabase);
    const { initializeLearningProgressDatabase } = await loadModule();

    await expect(initializeLearningProgressDatabase()).rejects.toThrow('disk unavailable');
    await expect(initializeLearningProgressDatabase()).resolves.toBe(recoveredDatabase);
    expect(sqliteMocks.openDatabaseAsync).toHaveBeenCalledTimes(2);
  });
});

describe('learning progress repository', () => {
  beforeEach(() => vi.resetModules());

  it('parameterizes and upserts last-read lesson state', async () => {
    const database = createDatabaseMock();
    const { createLearningProgressRepository } = await loadModule();
    const repository = createLearningProgressRepository(database);
    const lesson = {
      topicId: 1,
      topicName: "Topic ' OR 1=1 --",
      subtopicId: 2,
      subtopicName: 'A lesson',
    };

    await repository.saveLastReadLesson(lesson);

    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('ON CONFLICT(key) DO UPDATE'),
      'last_read_lesson',
      JSON.stringify(lesson),
    );
    expect(database.runAsync).toHaveBeenCalledWith(expect.stringContaining('VALUES (?, ?)'), expect.any(String), expect.any(String));
  });

  it.each([
    ['missing state', null],
    ['malformed JSON', { value: '{not json' }],
    ['wrong shape', { value: JSON.stringify({ topicId: '1', subtopicId: 2 }) }],
  ])('returns no resume lesson for %s', async (_caseName, row) => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValue(row);
    const { createLearningProgressRepository } = await loadModule();

    await expect(createLearningProgressRepository(database).getLastReadLesson()).resolves.toBeNull();
  });

  it('returns a valid resume lesson unchanged', async () => {
    const lesson = { topicId: 1, topicName: 'Topic', subtopicId: 2, subtopicName: 'Lesson' };
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValue({ value: JSON.stringify(lesson) });
    const { createLearningProgressRepository } = await loadModule();

    await expect(createLearningProgressRepository(database).getLastReadLesson()).resolves.toEqual(lesson);
  });

  it('uses composite conflict handling so repeated completion cannot duplicate a lesson or replace its first timestamp', async () => {
    const database = createDatabaseMock();
    const { createLearningProgressRepository } = await loadModule();

    await createLearningProgressRepository(database).markLessonCompleted(
      { topicId: 1, subtopicId: 2, contentTitle: 'Lesson' },
      '2026-07-27T00:00:00.000Z',
    );

    const [sql, topicId, subtopicId, completedAt, title] = vi.mocked(database.runAsync).mock.calls[0];
    expect(sql).toContain('ON CONFLICT(topic_id, subtopic_id)');
    expect(sql).toContain('content_title = excluded.content_title');
    expect(sql).not.toContain('completed_at = excluded.completed_at');
    expect([topicId, subtopicId, completedAt, title]).toEqual([1, 2, '2026-07-27T00:00:00.000Z', 'Lesson']);
  });

  it('maps empty and populated completion queries without cross-topic leakage', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync)
      .mockResolvedValueOnce({ count: 0 })
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    vi.mocked(database.getAllAsync).mockResolvedValue([
      { topic_id: 1, subtopic_id: 2, content_title: 'One', completed_at: '2026-07-27T00:00:00.000Z' },
    ]);
    const { createLearningProgressRepository } = await loadModule();
    const repository = createLearningProgressRepository(database);

    await expect(repository.getCompletedLessonCount()).resolves.toBe(0);
    await expect(repository.getCompletedLessonsForTopic(1)).resolves.toEqual([
      { topicId: 1, subtopicId: 2, contentTitle: 'One', completedAt: '2026-07-27T00:00:00.000Z' },
    ]);
    await expect(repository.isLessonCompleted(1, 2)).resolves.toBe(true);
    await expect(repository.isLessonCompleted(2, 2)).resolves.toBe(false);
    expect(database.getAllAsync).toHaveBeenCalledWith(expect.stringContaining('WHERE topic_id = ?'), 1);
    expect(database.getFirstAsync).toHaveBeenCalledWith(expect.stringContaining('COUNT(*) AS count'), 2, 2);
  });
});
