import type { SQLiteDatabase } from 'expo-sqlite';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function createDatabaseMock() {
  return {
    getFirstAsync: vi.fn(),
    getAllAsync: vi.fn(),
  } as unknown as SQLiteDatabase;
}

async function createRepository(database: SQLiteDatabase) {
  const { createLearningContentRepository } = await import('./learning-content-repository');
  return createLearningContentRepository(database);
}

describe('learning content repository', () => {
  beforeEach(() => vi.resetModules());

  it('maps metadata and reports absent metadata without manufacturing content', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValueOnce(null).mockResolvedValueOnce({
      schema_version: 1,
      content_version: '1.0.0',
      created_at: '2026-07-27T00:00:00.000Z',
      source_hash: 'a'.repeat(64),
    });
    const repository = await createRepository(database);

    await expect(repository.getMetadata()).resolves.toBeNull();
    await expect(repository.getMetadata()).resolves.toEqual({
      schemaVersion: 1,
      contentVersion: '1.0.0',
      createdAt: '2026-07-27T00:00:00.000Z',
      sourceHash: 'a'.repeat(64),
    });
  });

  it('returns stable topic and lesson mappings with explicit parameter binding', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValueOnce([
      { topic_id: 1, topic_name: 'Basics', lesson_count: 3 },
    ]).mockResolvedValueOnce([
      { subtopic_id: 2, topic_id: 1, subtopic_name: 'View', subtopic_description: null, level: 1, content_body: '<p>View</p>' },
    ]);
    const repository = await createRepository(database);

    await expect(repository.getTopics()).resolves.toEqual([{ topicId: 1, topicName: 'Basics', lessonCount: 3 }]);
    await expect(repository.getSubtopicsForTopic(1)).resolves.toEqual([{
      subtopicId: 2,
      topicId: 1,
      subtopicName: 'View',
      subtopicDescription: null,
      level: 1,
      contentBody: '<p>View</p>',
    }]);
    expect(database.getAllAsync).toHaveBeenLastCalledWith(expect.stringContaining('WHERE topic_id = ?'), 1);
  });

  it('returns null for every missing reader record', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValue(null);
    const repository = await createRepository(database);

    await expect(repository.getTopic(999)).resolves.toBeNull();
    await expect(repository.getSubtopic(999)).resolves.toBeNull();
    await expect(repository.getFaq(999)).resolves.toBeNull();
    await expect(repository.getInterviewQuestion(999)).resolves.toBeNull();
    await expect(repository.getLibraryTool(999)).resolves.toBeNull();
  });

  it('maps FAQ, interview, category, and library/tool data and preserves advanced level 3', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync)
      .mockResolvedValueOnce([{ faq_topic_id: 1, title: 'General' }])
      .mockResolvedValueOnce([{ faq_id: 1, faq_topic_id: 1, question: 'What?', explanation: '<p>Answer</p>', level: null }])
      .mockResolvedValueOnce([{ level: 1, count: 120 }, { level: 2, count: 90 }, { level: 3, count: 90 }])
      .mockResolvedValueOnce([{ question_id: 300, question: 'Advanced?', explanation: '<p>Yes</p>', level: 3 }])
      .mockResolvedValueOnce([{ category_id: 1, name: 'Tooling' }])
      .mockResolvedValueOnce([{ library_tool_id: 1, category_id: 1, name: 'Expo', explanation: '<p>Expo</p>' }]);
    const repository = await createRepository(database);

    await expect(repository.getFaqTopics()).resolves.toEqual([{ faqTopicId: 1, title: 'General' }]);
    await expect(repository.getFaqsForTopic(1)).resolves.toEqual([{ faqId: 1, faqTopicId: 1, question: 'What?', explanation: '<p>Answer</p>', level: null }]);
    await expect(repository.getInterviewLevelCounts()).resolves.toEqual([{ level: 1, count: 120 }, { level: 2, count: 90 }, { level: 3, count: 90 }]);
    await expect(repository.getInterviewQuestions(3)).resolves.toEqual([{ questionId: 300, question: 'Advanced?', explanation: '<p>Yes</p>', level: 3 }]);
    await expect(repository.getCategories()).resolves.toEqual([{ categoryId: 1, name: 'Tooling' }]);
    await expect(repository.getLibraryToolsForCategory(1)).resolves.toEqual([{ libraryToolId: 1, categoryId: 1, name: 'Expo', explanation: '<p>Expo</p>' }]);
  });

  it('passes hostile IDs as query parameters rather than changing SQL text', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValue(null);
    const repository = await createRepository(database);
    const hostileId = '1 OR 1=1' as unknown as number;

    await repository.getSubtopic(hostileId);

    expect(database.getFirstAsync).toHaveBeenCalledWith(expect.stringContaining('WHERE subtopic_id = ?'), hostileId);
  });
});
