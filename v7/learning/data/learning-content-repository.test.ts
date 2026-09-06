import type { SQLiteDatabase } from 'expo-sqlite';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function createDatabaseMock() {
  return { getFirstAsync: vi.fn(), getAllAsync: vi.fn() } as unknown as SQLiteDatabase;
}

async function createRepository(database: SQLiteDatabase) {
  const { createLearningContentRepository } = await import('./learning-content-repository');
  return createLearningContentRepository(database);
}

describe('learning content v2 repository', () => {
  beforeEach(() => vi.resetModules());

  it('maps schema 2 metadata without manufacturing missing content', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValueOnce(null).mockResolvedValueOnce({ schema_version: 2, content_version: '2.0.0', created_at: '2026-08-07T00:00:00.000Z', source_hash: 'a'.repeat(64) });
    const repository = await createRepository(database);
    await expect(repository.getMetadata()).resolves.toBeNull();
    await expect(repository.getMetadata()).resolves.toEqual({ schemaVersion: 2, contentVersion: '2.0.0', createdAt: '2026-08-07T00:00:00.000Z', sourceHash: 'a'.repeat(64) });
  });

  it('maps tracks and lessons from the v2 names while preserving the current screen contract', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValueOnce([{
      track_id: 9, position: 9, slug: 'new-architecture', title: 'The New Architecture', description: 'Architecture', status: 'published', rn_version_verified: '0.86', lesson_count: 28,
    }]).mockResolvedValueOnce([{
      lesson_id: 901, track_id: 9, position: 1, slug: 'overview', title: 'Overview', level: 1, summary: 'Summary', prerequisites: null, body: '<p>Body</p>', estimated_minutes: 5, status: 'published', rn_version_verified: '0.86', updated_at: '2026-08-07',
    }]);
    const repository = await createRepository(database);

    await expect(repository.getTopics()).resolves.toEqual([expect.objectContaining({ topicId: 9, topicName: 'The New Architecture', lessonCount: 28, rnVersionVerified: '0.86' })]);
    await expect(repository.getSubtopicsForTopic(9)).resolves.toEqual([expect.objectContaining({ subtopicId: 901, topicId: 9, subtopicName: 'Overview', subtopicDescription: 'Summary', contentBody: '<p>Body</p>' })]);
    expect(database.getAllAsync).toHaveBeenLastCalledWith(expect.stringContaining('WHERE track_id = ?'), 9);
  });

  it('renders a Good to know entry as Markdown covering all five authored fields', async () => {
    const database = createDatabaseMock();
    const row = {
      library_tool_id: 9001, slug: 'flutter', name: 'Flutter', what_it_is: "Google's UI toolkit.", when_to_use: 'When pixels must match.',
      avoid_when: 'When the team writes React.', alternatives: 'React Native.', maintenance_signal: 'Google-funded.', rn_version_verified: '0.86',
    };
    vi.mocked(database.getFirstAsync).mockResolvedValue(row);
    const repository = await createRepository(database);

    const tool = await repository.getLibraryTool(9001);
    // The reader is a Markdown renderer, so HTML would be printed as literal
    // text — and avoid_when/maintenance_signal used to be dropped entirely.
    expect(tool?.explanation).not.toMatch(/<[a-z]/i);
    for (const field of [row.what_it_is, row.when_to_use, row.avoid_when, row.alternatives, row.maintenance_signal]) {
      expect(tool?.explanation).toContain(field);
    }
    expect(tool?.explanation.indexOf(row.avoid_when)).toBeGreaterThan(tool?.explanation.indexOf(row.when_to_use) ?? 0);
  });

  it('maps new interview fields, takeaways, tags, and demo links', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValue({ question_id: 1, slug: 'jsi', question: 'What is JSI?', short_answer: 'An interface.', explanation: '<p>Detail</p>', question_type: 'conceptual', level: 2, rn_version_verified: '0.86' });
    vi.mocked(database.getAllAsync)
      .mockResolvedValueOnce([{ takeaway_id: 1, lesson_id: 901, position: 1, text: 'Remember this.' }])
      .mockResolvedValueOnce([{ tag_id: 10, slug: 'new-architecture', name: 'New Architecture' }])
      .mockResolvedValueOnce([{ demo_id: 'react-native', label: 'Open RNTester' }]);
    const repository = await createRepository(database);

    await expect(repository.getInterviewQuestion(1)).resolves.toEqual(expect.objectContaining({ shortAnswer: 'An interface.', questionType: 'conceptual' }));
    await expect(repository.getLessonTakeaways(901)).resolves.toEqual([{ takeawayId: 1, lessonId: 901, position: 1, text: 'Remember this.' }]);
    await expect(repository.getTagsForContent('lesson', 901)).resolves.toEqual([{ tagId: 10, slug: 'new-architecture', name: 'New Architecture' }]);
    await expect(repository.getDemosForContent('lesson', 901)).resolves.toEqual([{ demoId: 'react-native', label: 'Open RNTester' }]);
  });

  it('attaches demo links to snippets in one batch query, not one per row', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync)
      .mockResolvedValueOnce([
        { snippet_id: 9207, slug: 'mmkv-settings-store', title: 'Read a setting synchronously', description: 'd', code: 'c', language: 'ts', explanation: 'e', rn_version_verified: '0.86' },
        { snippet_id: 9202, slug: 'debounced-value', title: 'Debounce a value', description: 'd', code: 'c', language: 'ts', explanation: 'e', rn_version_verified: '0.86' },
      ])
      .mockResolvedValueOnce([{ item_id: 9207, demo_id: 'react-native-mmkv', label: 'Open the MMKV demo' }]);
    const repository = await createRepository(database);

    const snippets = await repository.getSnippets();
    expect(snippets[0].demos).toEqual([{ demoId: 'react-native-mmkv', label: 'Open the MMKV demo' }]);
    // A snippet with no demo gets an empty list rather than undefined, so the
    // screen can map over it without a guard.
    expect(snippets[1].demos).toEqual([]);
    // Two queries for the whole list, not one per snippet.
    expect(database.getAllAsync).toHaveBeenCalledTimes(2);
  });

  it('attaches demo links to a single code challenge', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValue({ challenge_id: 9307, slug: 'unbounded-list', title: 'A long list stutters', brief: 'b', difficulty: 2, challenge_type: 'performance', broken_code: 'broken', fixed_code: 'fixed', explanation: 'e', estimated_minutes: 8, rn_version_verified: '0.86' });
    vi.mocked(database.getAllAsync)
      .mockResolvedValueOnce([{ body: 'A hint.' }])
      .mockResolvedValueOnce([{ demo_id: 'flash-list', label: 'See a recycling list handle the same load' }]);
    const repository = await createRepository(database);

    await expect(repository.getCodeChallenge(9307)).resolves.toEqual(expect.objectContaining({
      hints: ['A hint.'],
      demos: [{ demoId: 'flash-list', label: 'See a recycling list handle the same load' }],
    }));
  });

  it('resolves a study plan\'s items to titles and route parents, one query per type', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValue({
      path_id: 9401, slug: 'ship-your-first-app', title: 'Ship your first React Native app', description: 'A route.',
      target_weeks: 4, level: 1, item_count: 3, total_minutes: 26,
    });
    vi.mocked(database.getAllAsync)
      .mockResolvedValueOnce([
        { position: 1, item_type: 'lesson', item_id: 301, estimated_minutes: 7 },
        { position: 2, item_type: 'lesson', item_id: 305, estimated_minutes: 9 },
        { position: 3, item_type: 'quiz', item_id: 301, estimated_minutes: 10 },
      ])
      .mockResolvedValueOnce([
        { id: 301, title: 'What React Native is', parent_id: 3 },
        { id: 305, title: 'Your first screen', parent_id: 3 },
      ])
      .mockResolvedValueOnce([{ id: 301, title: 'Foundations check', parent_id: 3 }]);
    const repository = await createRepository(database);

    const plan = await repository.getStudyPlan(9401);
    expect(plan?.items).toEqual([
      { position: 1, itemType: 'lesson', itemId: 301, parentId: 3, title: 'What React Native is', estimatedMinutes: 7 },
      { position: 2, itemType: 'lesson', itemId: 305, parentId: 3, title: 'Your first screen', estimatedMinutes: 9 },
      { position: 3, itemType: 'quiz', itemId: 301, parentId: 3, title: 'Foundations check', estimatedMinutes: 10 },
    ]);
    // Two lessons and one quiz cost three queries, not four: the items, then one
    // lookup per distinct type.
    expect(database.getAllAsync).toHaveBeenCalledTimes(3);
  });

  it('drops a study-plan item whose record is no longer published rather than rendering a blank row', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValue({
      path_id: 9401, slug: 'ship-your-first-app', title: 'Ship your first React Native app', description: 'A route.',
      target_weeks: 4, level: 1, item_count: 2, total_minutes: 16,
    });
    vi.mocked(database.getAllAsync)
      .mockResolvedValueOnce([
        { position: 1, item_type: 'lesson', item_id: 301, estimated_minutes: 7 },
        { position: 2, item_type: 'lesson', item_id: 999, estimated_minutes: 9 },
      ])
      // The build's assertReference stops an item pointing at a record that does
      // not exist, but not one that moved back to draft after the plan shipped.
      .mockResolvedValueOnce([{ id: 301, title: 'What React Native is', parent_id: 3 }]);
    const repository = await createRepository(database);

    await expect(repository.getStudyPlan(9401)).resolves.toEqual(expect.objectContaining({
      items: [{ position: 1, itemType: 'lesson', itemId: 301, parentId: 3, title: 'What React Native is', estimatedMinutes: 7 }],
    }));
  });

  it('reads a guided project and its steps in order, without resolving anything from another table', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValue({
      project_id: 9501, slug: 'habit-tracker', title: 'Build a habit tracker that survives a restart',
      brief: 'The smallest app that is still a real app.', level: 1, estimated_hours: 4, step_count: 2,
    });
    vi.mocked(database.getAllAsync).mockResolvedValueOnce([
      { position: 1, goal: 'Get one screen of your own onto a device.', instructions: 'Create the project.', checkpoint: 'The app opens on a device.' },
      { position: 2, goal: 'Lay out one habit row by hand.', instructions: 'Hard-code a single row.', checkpoint: 'The row renders.' },
    ]);
    const repository = await createRepository(database);

    await expect(repository.getGuidedProject(9501)).resolves.toEqual({
      projectId: 9501, slug: 'habit-tracker', title: 'Build a habit tracker that survives a restart',
      brief: 'The smallest app that is still a real app.', level: 1, estimatedHours: 4, stepCount: 2,
      steps: [
        { position: 1, goal: 'Get one screen of your own onto a device.', instructions: 'Create the project.', checkpoint: 'The app opens on a device.' },
        { position: 2, goal: 'Lay out one habit row by hand.', instructions: 'Hard-code a single row.', checkpoint: 'The row renders.' },
      ],
    });
    // A project is self-contained, so it costs one query for the steps whatever
    // it holds — where a study plan needs one more per item type it points at.
    expect(database.getAllAsync).toHaveBeenCalledTimes(1);
  });

  it('reports an unpublished project as unavailable rather than rendering it without steps', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValue(null);
    const repository = await createRepository(database);

    await expect(repository.getGuidedProject(9999)).resolves.toBeNull();
    expect(database.getAllAsync).not.toHaveBeenCalled();
  });

  it('reads a design scenario with its stages and rubric in order', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValue({
      scenario_id: 9601, slug: 'offline-first-notes', title: 'Offline-first notes that sync across devices',
      brief: 'A note app that is fully usable with no connection.', constraints: 'Phone and tablet per user.',
      level: 2, stage_count: 2,
    });
    vi.mocked(database.getAllAsync)
      .mockResolvedValueOnce([
        { position: 1, stage: 'requirements', prompt: 'What must be true?', modelAnswer: 'Writing always works.' },
        { position: 2, stage: 'trade-offs', prompt: 'Pick a strategy.', modelAnswer: 'Fork, and say what it costs.' },
      ])
      .mockResolvedValueOnce([
        { position: 1, criterion: 'Treats the local store as the source of truth', strongAnswer: 'Reads only local data.', weakAnswer: 'Caches in front of an API.' },
      ]);
    const repository = await createRepository(database);

    await expect(repository.getDesignScenario(9601)).resolves.toEqual(expect.objectContaining({
      scenarioId: 9601, level: 2, stageCount: 2,
      stages: [
        { position: 1, stage: 'requirements', prompt: 'What must be true?', modelAnswer: 'Writing always works.' },
        { position: 2, stage: 'trade-offs', prompt: 'Pick a strategy.', modelAnswer: 'Fork, and say what it costs.' },
      ],
      rubric: [{ position: 1, criterion: 'Treats the local store as the source of truth', strongAnswer: 'Reads only local data.', weakAnswer: 'Caches in front of an API.' }],
    }));
    // The scenario, its stages, its rubric — and nothing resolved from another
    // table, because a scenario references nothing.
    expect(database.getAllAsync).toHaveBeenCalledTimes(2);
  });

  it('reports an unpublished design scenario as unavailable without querying its children', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValue(null);
    const repository = await createRepository(database);

    await expect(repository.getDesignScenario(9999)).resolves.toBeNull();
    expect(database.getAllAsync).not.toHaveBeenCalled();
  });

  it('counts what each home area can show, and reports zero for content types with no rows', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValueOnce({ learning_path: 472, faq: 0, glossary: 337, good_to_know: 0, interview_prep: 666, quizzes: 16, review: 1009, cheat_sheets: 16, checklists: 5, decisionGuides: 0, snippets: 0, codeChallenges: 0, studyPlans: 0, projects: 0, designScenarios: 0 });
    const repository = await createRepository(database);

    await expect(repository.getAreaContentCounts()).resolves.toEqual({ learningPath: 472, faq: 0, glossary: 337, goodToKnow: 0, interviewPrep: 666, quizzes: 16, review: 1009, cheatSheets: 16, checklists: 5, decisionGuides: 0, snippets: 0, codeChallenges: 0, studyPlans: 0, projects: 0, designScenarios: 0 });
    const [sql] = vi.mocked(database.getFirstAsync).mock.calls[0];
    expect(sql).toContain('FROM lessons JOIN tracks USING (track_id)');
    expect(sql).toContain('FROM faqs');
    expect(sql).toContain('FROM glossary_terms');
    expect(sql).toContain('FROM quizzes JOIN tracks USING (track_id)');
    expect(sql).toContain('FROM library_tools');
    expect(sql).toContain('FROM interview_questions');
    expect(sql).toContain('FROM flashcards');
    // The review tile counts the deck as it will be dealt, not both tables added up.
    expect(sql).toContain('question_id NOT IN');
  });

  it('lists every reviewable card by identity alone, flashcards before interview questions', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValueOnce([
      { item_type: 'flashcard', item_id: 4, level_rank: 0, level_size: 0 },
      { item_type: 'interview_question', item_id: 23, level_rank: 1, level_size: 151 },
    ]);
    const repository = await createRepository(database);

    await expect(repository.getReviewItemKeys(true)).resolves.toEqual([{ itemType: 'flashcard', itemId: 4 }, { itemType: 'interview_question', itemId: 23 }]);
    const [sql] = vi.mocked(database.getAllAsync).mock.calls[0];
    expect(sql).toContain('UNION ALL');
    expect(sql).toContain("status = 'published'");
    expect(sql).not.toContain('front');
  });

  it('leaves out an interview question a flashcard already restates, so the deck never asks the same fact twice', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValueOnce([]);
    const repository = await createRepository(database);

    await repository.getReviewItemKeys(true);
    const [sql] = vi.mocked(database.getAllAsync).mock.calls[0];
    expect(sql).toContain('question_id NOT IN');
    expect(sql).toContain("source_type = 'interview_question'");
  });

  /**
   * The deck spans flashcards and interview questions, and it had no gate at
   * all: every locked question was readable here as its question against its
   * short answer, which is the paid content escaping through a free feature.
   */
  it('deals a locked reader only the interview questions they can also read', async () => {
    const database = createDatabaseMock();
    // Rank 10 is the last free question of a 151-question level; rank 11 is the
    // first locked one. Flashcards are not sold, so they stay in the deck.
    const rows = [
      { item_type: 'flashcard', item_id: 4, level_rank: 0, level_size: 0 },
      { item_type: 'interview_question', item_id: 23, level_rank: 10, level_size: 151 },
      { item_type: 'interview_question', item_id: 24, level_rank: 11, level_size: 151 },
    ];
    vi.mocked(database.getAllAsync).mockResolvedValue(rows);
    const repository = await createRepository(database);

    await expect(repository.getReviewItemKeys(false)).resolves.toEqual([
      { itemType: 'flashcard', itemId: 4 },
      { itemType: 'interview_question', itemId: 23 },
    ]);
    // Everything is dealt once the library is bought.
    await expect(repository.getReviewItemKeys(true)).resolves.toHaveLength(3);
  });

  it('reads a session in the order the scheduler asked for, not in database order', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValueOnce([
      { item_type: 'flashcard', item_id: 4, front: 'What does a closure capture?', back: 'The binding.' },
      { item_type: 'interview_question', item_id: 23, front: 'Cost of sequential awaits?', back: 'Both latencies added.' },
    ]);
    const repository = await createRepository(database);

    const requested = [{ itemType: 'interview_question' as const, itemId: 23 }, { itemType: 'flashcard' as const, itemId: 4 }];
    await expect(repository.getReviewItems(requested)).resolves.toEqual([
      { itemType: 'interview_question', itemId: 23, front: 'Cost of sequential awaits?', back: 'Both latencies added.' },
      { itemType: 'flashcard', itemId: 4, front: 'What does a closure capture?', back: 'The binding.' },
    ]);
    const [sql, ...parameters] = vi.mocked(database.getAllAsync).mock.calls[0];
    expect(sql).toContain('short_answer AS back');
    expect(parameters).toEqual([4, 23]);
  });

  it('never builds an IN clause for a content type the session did not ask for, and short-circuits an empty session', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValueOnce([{ item_type: 'flashcard', item_id: 4, front: 'Front', back: 'Back' }]);
    const repository = await createRepository(database);

    await expect(repository.getReviewItems([])).resolves.toEqual([]);
    expect(database.getAllAsync).not.toHaveBeenCalled();
    await repository.getReviewItems([{ itemType: 'flashcard', itemId: 4 }]);
    const [sql] = vi.mocked(database.getAllAsync).mock.calls[0];
    expect(sql).not.toContain('interview_questions');
  });

  it('drops a card whose row is missing rather than rendering a blank one', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValueOnce([{ item_type: 'flashcard', item_id: 4, front: 'Front', back: 'Back' }]);
    const repository = await createRepository(database);

    await expect(repository.getReviewItems([{ itemType: 'flashcard', itemId: 4 }, { itemType: 'flashcard', itemId: 999 }])).resolves.toHaveLength(1);
  });

  it('lists a cheat sheet with the number of sections behind it, published sheets only', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValueOnce([{ sheet_id: 901, slug: 'new-architecture-map', title: 'New Architecture map', description: 'A compact map.', section_count: 9, rn_version_verified: '0.86' }]);
    const repository = await createRepository(database);

    await expect(repository.getCheatSheets()).resolves.toEqual([{ sheetId: 901, slug: 'new-architecture-map', title: 'New Architecture map', description: 'A compact map.', sectionCount: 9, rnVersionVerified: '0.86' }]);
    const [sql] = vi.mocked(database.getAllAsync).mock.calls[0];
    expect(sql).toContain("cheat_sheets.status = 'published'");
    expect(sql).toContain('COUNT(cheat_sheet_sections.section_id)');
  });

  it('reads cheat sheet sections in authored order, which is the order the sheet is meant to be read in', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValueOnce([{ section_id: 1, sheet_id: 901, position: 1, heading: 'The runtime', body: '<p>Hermes.</p>' }]);
    const repository = await createRepository(database);

    await expect(repository.getCheatSheetSections(901)).resolves.toEqual([{ sectionId: 1, sheetId: 901, position: 1, heading: 'The runtime', body: '<p>Hermes.</p>' }]);
    const [sql, ...parameters] = vi.mocked(database.getAllAsync).mock.calls[0];
    expect(sql).toContain('ORDER BY position ASC');
    expect(parameters).toEqual([901]);
  });

  it('lists a checklist with both its total and how much of it is required', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValueOnce([{ checklist_id: 1501, slug: 'store-review-readiness', title: 'Store review readiness', description: 'Verify a submission.', item_count: 15, required_count: 13, rn_version_verified: '0.86' }]);
    const repository = await createRepository(database);

    await expect(repository.getChecklists()).resolves.toEqual([{ checklistId: 1501, slug: 'store-review-readiness', title: 'Store review readiness', description: 'Verify a submission.', itemCount: 15, requiredCount: 13, rnVersionVerified: '0.86' }]);
    const [sql] = vi.mocked(database.getAllAsync).mock.calls[0];
    expect(sql).toContain("severity = 'required'");
  });

  it('reports zero rather than null for a checklist with no items yet', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValueOnce([]);
    const repository = await createRepository(database);

    await repository.getChecklists();
    const [sql] = vi.mocked(database.getAllAsync).mock.calls[0];
    expect(sql).toContain('COALESCE(SUM(');
  });

  it('maps checklist items with their severity intact', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValueOnce([{ item_id: 1, checklist_id: 1501, position: 1, label: 'Identify the exact artifact', detail: 'Record source revision.', severity: 'required' }]);
    const repository = await createRepository(database);

    await expect(repository.getChecklistItems(1501)).resolves.toEqual([{ itemId: 1, checklistId: 1501, position: 1, label: 'Identify the exact artifact', detail: 'Record source revision.', severity: 'required' }]);
  });

  it('searches names and summaries across every readable type, and never a rendered body', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValueOnce([]);
    const repository = await createRepository(database);

    await repository.searchContent('hermes', 50);
    const [sql, params] = vi.mocked(database.getAllAsync).mock.calls[0] as unknown as [string, Record<string, unknown>];
    for (const type of ['lesson', 'glossary_term', 'interview_question', 'faq', 'cheat_sheet', 'checklist', 'quiz', 'library_tool']) {
      expect(sql).toContain(`'${type}' AS item_type`);
    }
    // Bodies are build-time HTML carrying Highlight.js class names; searching
    // them would match markup rather than prose.
    expect(sql).not.toContain('lessons.body');
    expect(sql).toContain('lesson_takeaways');
    expect(params).toEqual({ $exact: 'hermes', $prefix: 'hermes%', $contains: '%hermes%', $limit: 51 });
  });

  it('escapes a wildcard the reader typed rather than honouring it', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValueOnce([]);
    const repository = await createRepository(database);

    await repository.searchContent('100%', 50);
    const [sql, params] = vi.mocked(database.getAllAsync).mock.calls[0] as unknown as [string, Record<string, unknown>];
    expect(params).toMatchObject({ $contains: '%100\\%%' });
    expect(sql).toContain("ESCAPE '\\'");
  });

  it('ranks an exact name first and orders ties by type so results do not shuffle', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValueOnce([]);
    const repository = await createRepository(database);

    await repository.searchContent('hermes', 50);
    const [sql] = vi.mocked(database.getAllAsync).mock.calls[0] as unknown as [string];
    expect(sql).toContain('ORDER BY rank ASC, priority ASC, title COLLATE NOCASE ASC');
  });

  it('reports a truncated search instead of passing the first page off as every match', async () => {
    const database = createDatabaseMock();
    const rows = Array.from({ length: 4 }, (_, index) => ({ item_type: 'lesson', item_id: index + 1, parent_id: 9, title: `Lesson ${index + 1}`, subtitle: 'Summary' }));
    vi.mocked(database.getAllAsync).mockResolvedValueOnce(rows).mockResolvedValueOnce(rows.slice(0, 2));
    const repository = await createRepository(database);

    await expect(repository.searchContent('hermes', 3)).resolves.toMatchObject({ truncated: true });
    await expect(repository.searchContent('hermes', 3)).resolves.toEqual({
      results: [
        { itemType: 'lesson', itemId: 1, parentId: 9, title: 'Lesson 1', subtitle: 'Summary' },
        { itemType: 'lesson', itemId: 2, parentId: 9, title: 'Lesson 2', subtitle: 'Summary' },
      ],
      truncated: false,
    });
  });

  it('never queries the database for an empty search', async () => {
    const database = createDatabaseMock();
    const repository = await createRepository(database);

    await expect(repository.searchContent('   ', 50)).resolves.toEqual({ results: [], truncated: false });
    expect(database.getAllAsync).not.toHaveBeenCalled();
  });

  it('treats a missing count row as an empty library rather than crashing the home screen', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValueOnce(null);
    const repository = await createRepository(database);

    await expect(repository.getAreaContentCounts()).resolves.toEqual({ learningPath: 0, faq: 0, glossary: 0, goodToKnow: 0, interviewPrep: 0, quizzes: 0, review: 0, cheatSheets: 0, checklists: 0, decisionGuides: 0, snippets: 0, codeChallenges: 0, studyPlans: 0, projects: 0, designScenarios: 0 });
  });

  it('maps glossary terms and reads "see also" links in both directions', async () => {
    const database = createDatabaseMock();
    const row = { term_id: 1, slug: 'closure', term: 'Closure', short_definition: 'A function plus scope.', full_explanation: '<p>Detail</p>', rn_version_verified: '0.86' };
    vi.mocked(database.getAllAsync).mockResolvedValue([row]);
    vi.mocked(database.getFirstAsync).mockResolvedValue(row);
    const repository = await createRepository(database);

    await expect(repository.getGlossaryTerm(1)).resolves.toEqual({ termId: 1, slug: 'closure', term: 'Closure', shortDefinition: 'A function plus scope.', fullExplanation: '<p>Detail</p>', rnVersionVerified: '0.86' });
    await expect(repository.getGlossaryTerms()).resolves.toEqual([expect.objectContaining({ termId: 1, term: 'Closure' })]);

    await repository.getRelatedGlossaryTerms(1);
    const [relatedSql, ...relatedArgs] = vi.mocked(database.getAllAsync).mock.calls.at(-1) ?? [];
    expect(relatedSql).toContain('SELECT related_term_id FROM glossary_term_links WHERE term_id = ?');
    expect(relatedSql).toContain('SELECT term_id FROM glossary_term_links WHERE related_term_id = ?');
    expect(relatedArgs).toEqual([1, 1]);
  });

  it('orders inline-linking references longest first so a longer term wins over one nested inside it', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValueOnce([
      { term_id: 3, term: 'Stale closure', short_definition: 'An old capture.' },
      { term_id: 1, term: 'Closure', short_definition: 'A function plus scope.' },
    ]);
    const repository = await createRepository(database);

    await expect(repository.getGlossaryTermReferences()).resolves.toEqual([
      { termId: 3, term: 'Stale closure', shortDefinition: 'An old capture.' },
      { termId: 1, term: 'Closure', shortDefinition: 'A function plus scope.' },
    ]);
    const [sql] = vi.mocked(database.getAllAsync).mock.calls[0];
    expect(sql).toContain('ORDER BY LENGTH(term) DESC');
  });

  it('returns null for a glossary term that is missing or unpublished', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValue(null);
    const repository = await createRepository(database);

    await expect(repository.getGlossaryTerm(404)).resolves.toBeNull();
    const [sql] = vi.mocked(database.getFirstAsync).mock.calls[0];
    expect(sql).toContain("status = 'published'");
  });

  it('offers a quiz only when its track is published, and pairs questions with their options in one pass', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync)
      .mockResolvedValueOnce([{ quiz_question_id: 11, position: 1, prompt: 'What runs the JavaScript?', explanation: 'Hermes does.' }])
      .mockResolvedValueOnce([
        { option_id: 111, quiz_question_id: 11, position: 1, label: 'Hermes', is_correct: 1 },
        { option_id: 112, quiz_question_id: 11, position: 2, label: 'Metro', is_correct: 0 },
        { option_id: 999, quiz_question_id: 99, position: 1, label: 'Another question option', is_correct: 1 },
      ]);
    const repository = await createRepository(database);

    await expect(repository.getQuizQuestions(1)).resolves.toEqual([{
      quizQuestionId: 11,
      position: 1,
      prompt: 'What runs the JavaScript?',
      explanation: 'Hermes does.',
      options: [
        { optionId: 111, position: 1, label: 'Hermes', isCorrect: true },
        { optionId: 112, position: 2, label: 'Metro', isCorrect: false },
      ],
    }]);
    expect(vi.mocked(database.getAllAsync).mock.calls).toHaveLength(2);
  });

  it('does not query options for a quiz with no questions', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValueOnce([]);
    const repository = await createRepository(database);

    await expect(repository.getQuizQuestions(1)).resolves.toEqual([]);
    expect(vi.mocked(database.getAllAsync).mock.calls).toHaveLength(1);
  });

  it('lists quizzes with their question count and requires a published track', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getAllAsync).mockResolvedValueOnce([
      { quiz_id: 1, track_id: 0, track_title: 'JavaScript foundations', slug: 'js-check', title: 'JavaScript foundations check', description: 'Verify scope.', pass_threshold: 80, question_count: 15, rn_version_verified: '0.86' },
    ]);
    const repository = await createRepository(database);

    await expect(repository.getQuizzes()).resolves.toEqual([expect.objectContaining({ quizId: 1, trackTitle: 'JavaScript foundations', passThreshold: 80, questionCount: 15 })]);
    const [sql] = vi.mocked(database.getAllAsync).mock.calls[0];
    expect(sql).toContain("JOIN tracks ON tracks.track_id = quizzes.track_id AND tracks.status = 'published'");
    expect(sql).toContain("quizzes.status = 'published'");
  });

  it('binds hostile IDs as values', async () => {
    const database = createDatabaseMock();
    vi.mocked(database.getFirstAsync).mockResolvedValue(null);
    const repository = await createRepository(database);
    const hostileId = '1 OR 1=1' as unknown as number;
    await repository.getSubtopic(hostileId);
    expect(database.getFirstAsync).toHaveBeenCalledWith(expect.stringContaining('lesson_id = ?'), hostileId);
  });
});
