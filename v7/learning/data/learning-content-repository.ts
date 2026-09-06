import type { SQLiteDatabase } from 'expo-sqlite';

import { getFreeItemCount } from '../learning-access-policy';
import { escapeLikePattern } from '../learning-search';

import type {
  CheatSheet,
  CheatSheetSection,
  Checklist,
  ChecklistItem,
  ContentDemo,
  ContentTag,
  Faq,
  FaqTopic,
  GlossaryTerm,
  GlossaryTermReference,
  InterviewFollowup,
  InterviewLevel,
  InterviewLevelCount,
  InterviewQuestion,
  LearningAreaContentCounts,
  DecisionGuide,
  DecisionGuideSummary,
  CodeChallenge,
  CodeChallengeType,
  LearningSnippet,
  StudyPlan,
  StudyPlanItemType,
  StudyPlanSummary,
  GuidedProject,
  ProjectStep,
  ProjectSummary,
  DesignScenario,
  DesignScenarioCriterion,
  DesignScenarioStage,
  DesignScenarioSummary,
  LearningCategory,
  LearningContentMetadata,
  LearningLibraryTool,
  LearningLevel,
  LearningSubtopic,
  LearningTopic,
  LessonTakeaway,
  Quiz,
  QuizQuestion,
  ReviewItem,
  ReviewItemKey,
  ReviewItemType,
  SearchResult,
  SearchResultType,
  TaggableContentType,
} from './learning-types';

type MetadataRow = { schema_version: number; content_version: string; created_at: string; source_hash: string };
type TrackRow = { track_id: number; position: number; slug: string; title: string; description: string; status: LearningTopic['status']; rn_version_verified: string; lesson_count: number };
type LessonRow = { lesson_id: number; track_id: number; position: number; slug: string; title: string; level: LearningSubtopic['level']; summary: string; prerequisites: string | null; body: string; estimated_minutes: number; status: LearningSubtopic['status']; rn_version_verified: string; updated_at: string };
type FaqTopicRow = { faq_topic_id: number; title: string };
type FaqRow = { faq_id: number; faq_topic_id: number; category: string; slug: string; question: string; explanation: string; level: Faq['level']; rn_version_verified: string };
type InterviewQuestionRow = { question_id: number; slug: string; question: string; short_answer: string; explanation: string; question_type: InterviewQuestion['questionType']; level: InterviewLevel; rn_version_verified: string };
type InterviewLevelCountRow = { level: InterviewLevel; count: number };
type LibraryToolRow = { library_tool_id: number; slug: string; name: string; what_it_is: string; when_to_use: string; avoid_when: string; alternatives: string; maintenance_signal: string; rn_version_verified: string };
type GlossaryTermRow = { term_id: number; slug: string; term: string; short_definition: string; full_explanation: string; rn_version_verified: string };
type GlossaryTermReferenceRow = { term_id: number; term: string; short_definition: string };
type QuizRow = { quiz_id: number; track_id: number; track_title: string; slug: string; title: string; description: string; level: LearningLevel; part: number; prerequisite_quiz_id: number | null; pass_threshold: number; question_count: number; rn_version_verified: string };
type QuizQuestionRow = { quiz_question_id: number; position: number; prompt: string; explanation: string };
type QuizOptionRow = { option_id: number; quiz_question_id: number; position: number; label: string; is_correct: number };
type AreaContentCountRow = { learning_path: number; faq: number; glossary: number; good_to_know: number; interview_prep: number; quizzes: number; review: number; cheat_sheets: number; checklists: number; decision_guides: number; snippets: number; code_challenges: number; study_plans: number; projects: number; design_scenarios: number };
type CheatSheetRow = { sheet_id: number; slug: string; title: string; description: string; section_count: number; rn_version_verified: string };
type CheatSheetSectionRow = { section_id: number; sheet_id: number; position: number; heading: string; body: string };
type ChecklistRow = { checklist_id: number; slug: string; title: string; description: string; item_count: number; required_count: number; rn_version_verified: string };
type ChecklistItemRow = { item_id: number; checklist_id: number; position: number; label: string; detail: string; severity: ChecklistItem['severity'] };
type ReviewItemRow = { item_type: ReviewItemType; item_id: number; front: string; back: string };
type SearchResultRow = { item_type: SearchResultType; item_id: number; parent_id: number | null; title: string; subtitle: string; rank: number };

function toMetadata(row: MetadataRow): LearningContentMetadata {
  return { schemaVersion: row.schema_version, contentVersion: row.content_version, createdAt: row.created_at, sourceHash: row.source_hash };
}

function toTopic(row: TrackRow): LearningTopic {
  return { topicId: row.track_id, topicName: row.title, lessonCount: row.lesson_count, slug: row.slug, description: row.description, position: row.position, status: row.status, rnVersionVerified: row.rn_version_verified };
}

function toSubtopic(row: LessonRow): LearningSubtopic {
  return {
    subtopicId: row.lesson_id,
    topicId: row.track_id,
    subtopicName: row.title,
    subtopicDescription: row.summary,
    level: row.level,
    contentBody: row.body,
    slug: row.slug,
    position: row.position,
    prerequisites: row.prerequisites,
    estimatedMinutes: row.estimated_minutes,
    status: row.status,
    rnVersionVerified: row.rn_version_verified,
    updatedAt: row.updated_at,
  };
}

function toFaq(row: FaqRow): Faq {
  return { faqId: row.faq_id, faqTopicId: row.faq_topic_id, category: row.category, slug: row.slug, question: row.question, explanation: row.explanation, level: row.level, rnVersionVerified: row.rn_version_verified };
}

function toInterviewQuestion(row: InterviewQuestionRow): InterviewQuestion {
  return { questionId: row.question_id, slug: row.slug, question: row.question, shortAnswer: row.short_answer, explanation: row.explanation, questionType: row.question_type, level: row.level, rnVersionVerified: row.rn_version_verified };
}

function toGlossaryTerm(row: GlossaryTermRow): GlossaryTerm {
  return { termId: row.term_id, slug: row.slug, term: row.term, shortDefinition: row.short_definition, fullExplanation: row.full_explanation, rnVersionVerified: row.rn_version_verified };
}

function toCheatSheet(row: CheatSheetRow): CheatSheet {
  return { sheetId: row.sheet_id, slug: row.slug, title: row.title, description: row.description, sectionCount: row.section_count, rnVersionVerified: row.rn_version_verified };
}

function toChecklist(row: ChecklistRow): Checklist {
  return { checklistId: row.checklist_id, slug: row.slug, title: row.title, description: row.description, itemCount: row.item_count, requiredCount: row.required_count, rnVersionVerified: row.rn_version_verified };
}

function toQuiz(row: QuizRow): Quiz {
  return { quizId: row.quiz_id, trackId: row.track_id, trackTitle: row.track_title, slug: row.slug, title: row.title, description: row.description, level: row.level, part: row.part, prerequisiteQuizId: row.prerequisite_quiz_id, passThreshold: row.pass_threshold, questionCount: row.question_count, rnVersionVerified: row.rn_version_verified };
}

/**
 * A quiz is only offerable when its track is published too, and it is listed
 * with the count of questions a reader will actually be asked.
 */
const QUIZ_SELECT = `
  SELECT quizzes.quiz_id, quizzes.track_id, tracks.title AS track_title, quizzes.slug, quizzes.title,
         quizzes.description, quizzes.level, quizzes.part, quizzes.prerequisite_quiz_id, quizzes.pass_threshold, quizzes.rn_version_verified,
         COUNT(quiz_questions.quiz_question_id) AS question_count
  FROM quizzes
  JOIN tracks ON tracks.track_id = quizzes.track_id AND tracks.status = 'published'
  LEFT JOIN quiz_questions ON quiz_questions.quiz_id = quizzes.quiz_id
`;

/**
 * Interview questions a flashcard was already derived from. Both would
 * otherwise land in the same deck — the card being a condensed restatement of
 * the question it came from — and a reader would rate the same fact twice in
 * one sitting. The card is the tighter of the two, so the question it derives
 * from is the one left out of the review deck. It is still readable in full in
 * Interview Prep; this only decides what spaced repetition asks.
 */
const DERIVED_INTERVIEW_QUESTIONS = `
  SELECT source_id FROM flashcards WHERE source_type = 'interview_question' AND status = 'published'
`;

/**
 * A cheat sheet is listed with the number of sections it holds, because that is
 * the only honest measure of how long it is before opening it.
 */
const CHEAT_SHEET_SELECT = `
  SELECT cheat_sheets.sheet_id, cheat_sheets.slug, cheat_sheets.title, cheat_sheets.description,
         cheat_sheets.rn_version_verified, COUNT(cheat_sheet_sections.section_id) AS section_count
  FROM cheat_sheets
  LEFT JOIN cheat_sheet_sections ON cheat_sheet_sections.sheet_id = cheat_sheets.sheet_id
`;

/**
 * Checklists carry both totals because the required count is what decides
 * whether one is finished, and a reader deciding which to open wants to know
 * how much of it is non-negotiable.
 */
const CHECKLIST_SELECT = `
  SELECT checklists.checklist_id, checklists.slug, checklists.title, checklists.description,
         checklists.rn_version_verified,
         COUNT(checklist_items.item_id) AS item_count,
         COALESCE(SUM(CASE WHEN checklist_items.severity = 'required' THEN 1 ELSE 0 END), 0) AS required_count
  FROM checklists
  LEFT JOIN checklist_items ON checklist_items.checklist_id = checklists.checklist_id
`;

/**
 * One searchable branch per content type, unioned into a single query.
 *
 * Every branch searches an authored *name* and an authored *summary* — never a
 * rendered `body`. Bodies are build-time HTML carrying Highlight.js class names
 * (`hljs-keyword` and friends appear in 313 lesson bodies), so searching them
 * would match markup rather than prose and return a page of false positives
 * that no readable snippet could explain. Lessons additionally search their
 * takeaways, which are stored as plain-text rows and are the closest thing the
 * corpus has to a lesson's stated learning objectives.
 *
 * `rank` is the match quality: an exact name, then a name that starts with the
 * query, then a name containing it, then a summary containing it. The trailing
 * number is the type's tie-break priority, so an equally good lesson and quiz
 * match resolve to a stable order rather than to whatever SQLite returns first.
 */
function searchBranch(options: {
  type: SearchResultType;
  table: string;
  idColumn: string;
  parentColumn: string;
  titleColumn: string;
  subtitleColumn: string;
  from: string;
  where: string;
  extraMatch?: string;
  priority: number;
}): string {
  const { type, idColumn, parentColumn, titleColumn, subtitleColumn, from, where, extraMatch, priority } = options;
  return `
    SELECT '${type}' AS item_type, ${idColumn} AS item_id, ${parentColumn} AS parent_id,
           ${titleColumn} AS title, ${subtitleColumn} AS subtitle,
           CASE WHEN lower(${titleColumn}) = $exact THEN 0
                WHEN ${titleColumn} LIKE $prefix ESCAPE '\\' THEN 1
                WHEN ${titleColumn} LIKE $contains ESCAPE '\\' THEN 2
                ELSE 3 END AS rank,
           ${priority} AS priority
    FROM ${from}
    WHERE ${where}
      AND (${titleColumn} LIKE $contains ESCAPE '\\' OR ${subtitleColumn} LIKE $contains ESCAPE '\\'${extraMatch ? ` OR ${extraMatch}` : ''})
  `;
}

const SEARCH_BRANCHES = [
  searchBranch({
    type: 'lesson', table: 'lessons', idColumn: 'lessons.lesson_id', parentColumn: 'lessons.track_id',
    titleColumn: 'lessons.title', subtitleColumn: 'lessons.summary',
    from: 'lessons JOIN tracks ON tracks.track_id = lessons.track_id',
    where: "lessons.status = 'published' AND tracks.status = 'published'",
    extraMatch: "EXISTS (SELECT 1 FROM lesson_takeaways WHERE lesson_takeaways.lesson_id = lessons.lesson_id AND lesson_takeaways.text LIKE $contains ESCAPE '\\')",
    priority: 0,
  }),
  searchBranch({
    type: 'glossary_term', table: 'glossary_terms', idColumn: 'term_id', parentColumn: 'NULL',
    titleColumn: 'term', subtitleColumn: 'short_definition',
    from: 'glossary_terms', where: "status = 'published'", priority: 1,
  }),
  searchBranch({
    type: 'interview_question', table: 'interview_questions', idColumn: 'question_id', parentColumn: 'NULL',
    titleColumn: 'question', subtitleColumn: 'short_answer',
    from: 'interview_questions', where: "status = 'published'", priority: 2,
  }),
  searchBranch({
    type: 'faq', table: 'faqs', idColumn: 'faq_id', parentColumn: 'NULL',
    titleColumn: 'question', subtitleColumn: 'category',
    from: 'faqs', where: "status = 'published'", priority: 3,
  }),
  searchBranch({
    type: 'cheat_sheet', table: 'cheat_sheets', idColumn: 'sheet_id', parentColumn: 'NULL',
    titleColumn: 'title', subtitleColumn: 'description',
    from: 'cheat_sheets', where: "status = 'published'", priority: 4,
  }),
  searchBranch({
    type: 'checklist', table: 'checklists', idColumn: 'checklist_id', parentColumn: 'NULL',
    titleColumn: 'title', subtitleColumn: 'description',
    from: 'checklists', where: "status = 'published'", priority: 5,
  }),
  searchBranch({
    type: 'quiz', table: 'quizzes', idColumn: 'quizzes.quiz_id', parentColumn: 'quizzes.track_id',
    titleColumn: 'quizzes.title', subtitleColumn: 'quizzes.description',
    from: 'quizzes JOIN tracks ON tracks.track_id = quizzes.track_id',
    where: "quizzes.status = 'published' AND tracks.status = 'published'", priority: 6,
  }),
  searchBranch({
    type: 'library_tool', table: 'library_tools', idColumn: 'library_tool_id', parentColumn: 'NULL',
    titleColumn: 'name', subtitleColumn: 'what_it_is',
    from: 'library_tools', where: "status = 'published'", priority: 7,
  }),
  searchBranch({
    type: 'decision_guide', table: 'decision_guides', idColumn: 'guide_id', parentColumn: 'NULL',
    titleColumn: 'title', subtitleColumn: 'question',
    from: 'decision_guides', where: "status = 'published'", priority: 8,
  }),
  searchBranch({
    type: 'snippet', table: 'snippets', idColumn: 'snippet_id', parentColumn: 'NULL',
    titleColumn: 'title', subtitleColumn: 'description',
    from: 'snippets', where: "status = 'published'", priority: 9,
  }),
].join(' UNION ALL ');

const GLOSSARY_SELECT = `
  SELECT term_id, slug, term, short_definition, full_explanation, rn_version_verified
  FROM glossary_terms
`;

const TRACK_SELECT = `
  SELECT tracks.track_id, tracks.position, tracks.slug, tracks.title, tracks.description,
         tracks.status, tracks.rn_version_verified, COUNT(lessons.lesson_id) AS lesson_count
  FROM tracks
  LEFT JOIN lessons ON lessons.track_id = tracks.track_id AND lessons.status = 'published'
`;

const LESSON_SELECT = `
  SELECT lesson_id, track_id, position, slug, title, level, summary, prerequisites,
         body, estimated_minutes, status, rn_version_verified, updated_at
  FROM lessons
`;

/** Read-only repository for the release-bundled learning-content.db schema 2. */
/**
 * The Good to know reader renders Markdown, and each entry's prose lives in five
 * separate columns rather than one body. Compose them in the order Phase E
 * fixes for every record: the answer, then when it is wrong, then what else to
 * consider — and include `avoid_when` and `maintenance_signal`, which the
 * previous HTML string silently dropped.
 */
function mapLibraryTool(row: LibraryToolRow): LearningLibraryTool {
  const explanation = [
    row.what_it_is,
    '## When to use it',
    row.when_to_use,
    '## When to avoid it',
    row.avoid_when,
    '## Alternatives',
    row.alternatives,
    '## Maintenance signal',
    row.maintenance_signal,
  ].join('\n\n');
  return { libraryToolId: row.library_tool_id, categoryId: 1, slug: row.slug, name: row.name, explanation, avoidWhen: row.avoid_when, maintenanceSignal: row.maintenance_signal, rnVersionVerified: row.rn_version_verified };
}

type DecisionGuideRow = { guide_id: number; slug: string; title: string; question: string; summary: string; rn_version_verified: string; option_count: number };
type DecisionGuideOptionRow = { option_id: number; position: number; name: string; npm_package: string | null; verdict: string; best_for: string; avoid_when: string };
type DecisionGuideCriterionRow = { criterion_id: number; position: number; label: string };
type DecisionGuideScoreRow = { option_id: number; criterion_id: number; value: number; note: string | null };

type CodeChallengeRow = { challenge_id: number; slug: string; title: string; brief: string; difficulty: number; challenge_type: string; broken_code: string; fixed_code: string; language: string; explanation: string; estimated_minutes: number; rn_version_verified: string };

const CODE_CHALLENGE_SELECT = `
  SELECT challenge_id, slug, title, brief, difficulty, challenge_type, broken_code, fixed_code, language, explanation, estimated_minutes, rn_version_verified
  FROM code_challenges
`;

type StudyPlanRow = { path_id: number; slug: string; title: string; description: string; target_weeks: number; level: number; item_count: number; total_minutes: number };

/** Where each study-plan item type keeps its id, its title, and its route parent. */
const STUDY_PLAN_ITEM_SOURCES: Record<StudyPlanItemType, { table: string; idColumn: string; titleColumn: string; parentColumn?: string }> = {
  lesson: { table: 'lessons', idColumn: 'lesson_id', titleColumn: 'title', parentColumn: 'track_id' },
  quiz: { table: 'quizzes', idColumn: 'quiz_id', titleColumn: 'title', parentColumn: 'track_id' },
  cheat_sheet: { table: 'cheat_sheets', idColumn: 'sheet_id', titleColumn: 'title' },
  checklist: { table: 'checklists', idColumn: 'checklist_id', titleColumn: 'title' },
  code_challenge: { table: 'code_challenges', idColumn: 'challenge_id', titleColumn: 'title' },
  snippet: { table: 'snippets', idColumn: 'snippet_id', titleColumn: 'title' },
  decision_guide: { table: 'decision_guides', idColumn: 'guide_id', titleColumn: 'title' },
  interview_question: { table: 'interview_questions', idColumn: 'question_id', titleColumn: 'question' },
  faq: { table: 'faqs', idColumn: 'faq_id', titleColumn: 'question' },
  library_tool: { table: 'library_tools', idColumn: 'library_tool_id', titleColumn: 'name' },
  project: { table: 'projects', idColumn: 'project_id', titleColumn: 'title' },
};

type DesignScenarioRow = { scenario_id: number; slug: string; title: string; brief: string; constraints: string; level: number; stage_count: number };

function toDesignScenarioSummary(row: DesignScenarioRow): DesignScenarioSummary {
  return {
    scenarioId: row.scenario_id, slug: row.slug, title: row.title, brief: row.brief,
    constraints: row.constraints, level: (row.level === 2 || row.level === 3 ? row.level : 1),
    stageCount: row.stage_count,
  };
}

const DESIGN_SCENARIO_SELECT = `
  SELECT scenario_id, slug, title, brief, constraints, level,
         (SELECT COUNT(*) FROM design_scenario_stages WHERE design_scenario_stages.scenario_id = design_scenarios.scenario_id) AS stage_count
  FROM design_scenarios
`;

type ProjectRow = { project_id: number; slug: string; title: string; brief: string; level: number; estimated_hours: number; step_count: number };

function toProjectSummary(row: ProjectRow): ProjectSummary {
  return {
    projectId: row.project_id, slug: row.slug, title: row.title, brief: row.brief,
    level: (row.level === 2 || row.level === 3 ? row.level : 1),
    estimatedHours: row.estimated_hours, stepCount: row.step_count,
  };
}

const PROJECT_SELECT = `
  SELECT project_id, slug, title, brief, level, estimated_hours,
         (SELECT COUNT(*) FROM project_steps WHERE project_steps.project_id = projects.project_id) AS step_count
  FROM projects
`;

function toStudyPlanSummary(row: StudyPlanRow): StudyPlanSummary {
  return {
    pathId: row.path_id, slug: row.slug, title: row.title, description: row.description,
    targetWeeks: row.target_weeks, level: (row.level === 2 || row.level === 3 ? row.level : 1),
    itemCount: row.item_count, totalMinutes: row.total_minutes,
  };
}

type SnippetRow = { snippet_id: number; slug: string; title: string; description: string; code: string; language: string; explanation: string; rn_version_verified: string };

function toCodeChallenge(row: CodeChallengeRow, hints: string[], demos: ContentDemo[]): CodeChallenge {
  return {
    challengeId: row.challenge_id, slug: row.slug, title: row.title, brief: row.brief,
    difficulty: (row.difficulty === 2 || row.difficulty === 3 ? row.difficulty : 1),
    challengeType: row.challenge_type as CodeChallengeType,
    brokenCode: row.broken_code, fixedCode: row.fixed_code, language: row.language, explanation: row.explanation,
    estimatedMinutes: row.estimated_minutes, hints, rnVersionVerified: row.rn_version_verified, demos,
  };
}

/**
 * Every demo link for one content type in a single query, so a list screen
 * costs two round trips rather than one per row.
 */
async function readDemosByItem(database: SQLiteDatabase, itemType: TaggableContentType): Promise<Map<number, ContentDemo[]>> {
  const rows = await database.getAllAsync<{ item_id: number; demo_id: string; label: string }>('SELECT item_id, demo_id, label FROM content_demos WHERE item_type = ? ORDER BY item_id, demo_id', itemType);
  const byItem = new Map<number, ContentDemo[]>();
  for (const row of rows) {
    const demos = byItem.get(row.item_id) ?? [];
    demos.push({ demoId: row.demo_id, label: row.label });
    byItem.set(row.item_id, demos);
  }
  return byItem;
}

function toDecisionGuideSummary(row: DecisionGuideRow): DecisionGuideSummary {
  return { guideId: row.guide_id, slug: row.slug, title: row.title, question: row.question, summary: row.summary, optionCount: row.option_count, rnVersionVerified: row.rn_version_verified };
}

export function createLearningContentRepository(database: SQLiteDatabase) {
  return {
    async getMetadata(): Promise<LearningContentMetadata | null> {
      const row = await database.getFirstAsync<MetadataRow>('SELECT schema_version, content_version, created_at, source_hash FROM content_metadata WHERE id = 1');
      return row ? toMetadata(row) : null;
    },

    /**
     * One round trip for the home screen: how many published records each area
     * can actually show. Lessons are counted through their track because a
     * lesson under an unpublished track is not reachable from the topic list.
     */
    async getAreaContentCounts(): Promise<LearningAreaContentCounts> {
      const row = await database.getFirstAsync<AreaContentCountRow>(`
        SELECT
          (SELECT COUNT(*) FROM lessons JOIN tracks USING (track_id) WHERE lessons.status = 'published' AND tracks.status = 'published') AS learning_path,
          (SELECT COUNT(*) FROM faqs WHERE status = 'published') AS faq,
          (SELECT COUNT(*) FROM glossary_terms WHERE status = 'published') AS glossary,
          (SELECT COUNT(*) FROM library_tools WHERE status = 'published') AS good_to_know,
          (SELECT COUNT(*) FROM interview_questions WHERE status = 'published') AS interview_prep,
          (SELECT COUNT(*) FROM quizzes JOIN tracks USING (track_id) WHERE quizzes.status = 'published' AND tracks.status = 'published') AS quizzes,
          (SELECT COUNT(*) FROM flashcards WHERE status = 'published')
            + (SELECT COUNT(*) FROM interview_questions WHERE status = 'published' AND question_id NOT IN (${DERIVED_INTERVIEW_QUESTIONS})) AS review,
          (SELECT COUNT(*) FROM cheat_sheets WHERE status = 'published') AS cheat_sheets,
          (SELECT COUNT(*) FROM checklists WHERE status = 'published') AS checklists,
          (SELECT COUNT(*) FROM decision_guides WHERE status = 'published') AS decision_guides,
          (SELECT COUNT(*) FROM snippets WHERE status = 'published') AS snippets,
          (SELECT COUNT(*) FROM code_challenges WHERE status = 'published') AS code_challenges,
          (SELECT COUNT(*) FROM learning_paths WHERE status = 'published') AS study_plans,
          (SELECT COUNT(*) FROM projects WHERE status = 'published') AS projects,
          (SELECT COUNT(*) FROM design_scenarios WHERE status = 'published') AS design_scenarios
      `);
      return { learningPath: row?.learning_path ?? 0, faq: row?.faq ?? 0, glossary: row?.glossary ?? 0, goodToKnow: row?.good_to_know ?? 0, interviewPrep: row?.interview_prep ?? 0, quizzes: row?.quizzes ?? 0, review: row?.review ?? 0, cheatSheets: row?.cheat_sheets ?? 0, checklists: row?.checklists ?? 0, decisionGuides: row?.decision_guides ?? 0, snippets: row?.snippets ?? 0, codeChallenges: row?.code_challenges ?? 0, studyPlans: row?.study_plans ?? 0, projects: row?.projects ?? 0, designScenarios: row?.design_scenarios ?? 0 };
    },

    async getDecisionGuides(): Promise<DecisionGuideSummary[]> {
      const rows = await database.getAllAsync<DecisionGuideRow>(`
        SELECT guide_id, slug, title, question, summary, rn_version_verified,
          (SELECT COUNT(*) FROM decision_guide_options WHERE decision_guide_options.guide_id = decision_guides.guide_id) AS option_count
        FROM decision_guides WHERE status = 'published' ORDER BY guide_id ASC
      `);
      return rows.map(toDecisionGuideSummary);
    },

    /**
     * One guide with everything the wizard needs. The three child queries are
     * separate rather than one join because a join across options x criteria x
     * scores multiplies rows, and the wizard wants three flat lists.
     */
    async getDecisionGuide(guideId: number): Promise<DecisionGuide | null> {
      const row = await database.getFirstAsync<DecisionGuideRow>(`
        SELECT guide_id, slug, title, question, summary, rn_version_verified,
          (SELECT COUNT(*) FROM decision_guide_options WHERE decision_guide_options.guide_id = decision_guides.guide_id) AS option_count
        FROM decision_guides WHERE guide_id = ? AND status = 'published'
      `, guideId);
      if (!row) return null;

      const [options, criteria, scores] = await Promise.all([
        database.getAllAsync<DecisionGuideOptionRow>('SELECT option_id, position, name, npm_package, verdict, best_for, avoid_when FROM decision_guide_options WHERE guide_id = ? ORDER BY position ASC', guideId),
        database.getAllAsync<DecisionGuideCriterionRow>('SELECT criterion_id, position, label FROM decision_guide_criteria WHERE guide_id = ? ORDER BY position ASC', guideId),
        database.getAllAsync<DecisionGuideScoreRow>('SELECT option_id, criterion_id, value, note FROM decision_guide_scores WHERE guide_id = ?', guideId),
      ]);

      return {
        ...toDecisionGuideSummary(row),
        options: options.map((option) => ({ optionId: option.option_id, position: option.position, name: option.name, npmPackage: option.npm_package, verdict: option.verdict, bestFor: option.best_for, avoidWhen: option.avoid_when })),
        criteria: criteria.map((criterion) => ({ criterionId: criterion.criterion_id, position: criterion.position, label: criterion.label })),
        scores: scores.map((score) => ({ optionId: score.option_id, criterionId: score.criterion_id, value: score.value, note: score.note })),
      };
    },

    async getSnippets(): Promise<LearningSnippet[]> {
      const rows = await database.getAllAsync<SnippetRow>("SELECT snippet_id, slug, title, description, code, language, explanation, rn_version_verified FROM snippets WHERE status = 'published' ORDER BY title ASC");
      const demosByItem = await readDemosByItem(database, 'snippet');
      return rows.map((row) => ({ snippetId: row.snippet_id, slug: row.slug, title: row.title, description: row.description, code: row.code, language: row.language, explanation: row.explanation, rnVersionVerified: row.rn_version_verified, demos: demosByItem.get(row.snippet_id) ?? [] }));
    },


    async getCodeChallenges(): Promise<CodeChallenge[]> {
      const rows = await database.getAllAsync<CodeChallengeRow>(`${CODE_CHALLENGE_SELECT} WHERE status = 'published' ORDER BY difficulty ASC, challenge_id ASC`);
      return rows.map((row) => toCodeChallenge(row, [], []));
    },

    async getCodeChallenge(challengeId: number): Promise<CodeChallenge | null> {
      const row = await database.getFirstAsync<CodeChallengeRow>(`${CODE_CHALLENGE_SELECT} WHERE challenge_id = ? AND status = 'published'`, challengeId);
      if (!row) return null;
      const hints = await database.getAllAsync<{ body: string }>('SELECT body FROM code_challenge_hints WHERE challenge_id = ? ORDER BY position ASC', challengeId);
      const demos = await database.getAllAsync<{ demo_id: string; label: string }>('SELECT demo_id, label FROM content_demos WHERE item_type = ? AND item_id = ? ORDER BY demo_id', 'code_challenge', challengeId);
      return toCodeChallenge(row, hints.map((hint) => hint.body), demos.map((demo) => ({ demoId: demo.demo_id, label: demo.label })));
    },

    async getQuizzes(): Promise<Quiz[]> {
      const rows = await database.getAllAsync<QuizRow>(`${QUIZ_SELECT} WHERE quizzes.status = 'published' GROUP BY quizzes.quiz_id ORDER BY tracks.position ASC, quizzes.level ASC, quizzes.part ASC`);
      return rows.map(toQuiz);
    },

    async getQuiz(quizId: number): Promise<Quiz | null> {
      const row = await database.getFirstAsync<QuizRow>(`${QUIZ_SELECT} WHERE quizzes.quiz_id = ? AND quizzes.status = 'published' GROUP BY quizzes.quiz_id`, quizId);
      return row ? toQuiz(row) : null;
    },

    /**
     * Questions with their options, in one pass rather than a query per
     * question. Options keep their authored order — shuffling would make an
     * answer review impossible to talk about ("the third option" must mean the
     * same thing on the results screen as it did during the quiz).
     */
    async getQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
      const questionRows = await database.getAllAsync<QuizQuestionRow>('SELECT quiz_question_id, position, prompt, explanation FROM quiz_questions WHERE quiz_id = ? ORDER BY position ASC', quizId);
      if (questionRows.length === 0) return [];
      const optionRows = await database.getAllAsync<QuizOptionRow>(
        'SELECT option_id, quiz_question_id, position, label, is_correct FROM quiz_options WHERE quiz_question_id IN (SELECT quiz_question_id FROM quiz_questions WHERE quiz_id = ?) ORDER BY position ASC',
        quizId,
      );
      return questionRows.map((question) => ({
        quizQuestionId: question.quiz_question_id,
        position: question.position,
        prompt: question.prompt,
        explanation: question.explanation,
        options: optionRows
          .filter((option) => option.quiz_question_id === question.quiz_question_id)
          .map((option) => ({ optionId: option.option_id, position: option.position, label: option.label, isCorrect: option.is_correct === 1 })),
      }));
    },

    /**
     * Identity only for every reviewable card, which is all the scheduler needs
     * to decide what a session should ask. Fronts and backs are left unread
     * until that decision is made — the corpus is over a thousand cards and a
     * sitting is forty.
     */
    async getReviewItemKeys(learningUnlocked: boolean): Promise<ReviewItemKey[]> {
      const rows = await database.getAllAsync<{ item_type: ReviewItemType; item_id: number; level_rank: number; level_size: number }>(`
        SELECT item_type, item_id, level_rank, level_size FROM (
          SELECT 'flashcard' AS item_type, card_id AS item_id, 0 AS level_rank, 0 AS level_size, 0 AS bucket
          FROM flashcards WHERE status = 'published'
          UNION ALL
          SELECT 'interview_question' AS item_type, question_id AS item_id, level_rank, level_size, 1 AS bucket
          FROM (
            SELECT question_id,
                   ROW_NUMBER() OVER (PARTITION BY level ORDER BY question_id) AS level_rank,
                   COUNT(*) OVER (PARTITION BY level) AS level_size
            FROM interview_questions WHERE status = 'published'
          )
          WHERE question_id NOT IN (${DERIVED_INTERVIEW_QUESTIONS})
        ) ORDER BY bucket ASC, item_id ASC
      `);
      /**
       * A locked reader reviews only what they can also read.
       *
       * The deck spans flashcards and interview questions and had no gate at
       * all, so every locked question was readable here as its question against
       * its short answer — paid content escaping through a free feature. The
       * rank is taken over the whole published level, before the derived
       * questions are dropped, so it lines up exactly with the position the
       * interview list unlocks by. Flashcards stay free; they are not sold.
       */
      return rows
        .filter((row) =>
          learningUnlocked ||
          row.item_type === 'flashcard' ||
          row.level_rank <= getFreeItemCount(row.level_size))
        .map((row) => ({ itemType: row.item_type, itemId: row.item_id }));
    },

    /**
     * The cards for one session, returned in the order asked for rather than in
     * database order — the scheduler decided that order and it carries meaning.
     * An interview question is reviewed as its question against its short
     * answer, which is exactly the flashcard shape.
     */
    async getReviewItems(keys: ReviewItemKey[]): Promise<ReviewItem[]> {
      const cardIds = keys.filter((key) => key.itemType === 'flashcard').map((key) => key.itemId);
      const questionIds = keys.filter((key) => key.itemType === 'interview_question').map((key) => key.itemId);
      const clauses: string[] = [];
      const parameters: number[] = [];
      if (cardIds.length > 0) {
        clauses.push(`SELECT 'flashcard' AS item_type, card_id AS item_id, front, back FROM flashcards WHERE status = 'published' AND card_id IN (${cardIds.map(() => '?').join(', ')})`);
        parameters.push(...cardIds);
      }
      if (questionIds.length > 0) {
        clauses.push(`SELECT 'interview_question' AS item_type, question_id AS item_id, question AS front, short_answer AS back FROM interview_questions WHERE status = 'published' AND question_id IN (${questionIds.map(() => '?').join(', ')})`);
        parameters.push(...questionIds);
      }
      if (clauses.length === 0) return [];
      const rows = await database.getAllAsync<ReviewItemRow>(clauses.join(' UNION ALL '), ...parameters);
      const byKey = new Map(rows.map((row) => [`${row.item_type}:${row.item_id}`, row]));
      return keys
        .map((key) => byKey.get(`${key.itemType}:${key.itemId}`))
        .filter((row): row is ReviewItemRow => row !== undefined)
        .map((row) => ({ itemType: row.item_type, itemId: row.item_id, front: row.front, back: row.back }));
    },

    async getCheatSheets(): Promise<CheatSheet[]> {
      const rows = await database.getAllAsync<CheatSheetRow>(`${CHEAT_SHEET_SELECT} WHERE cheat_sheets.status = 'published' GROUP BY cheat_sheets.sheet_id ORDER BY cheat_sheets.sheet_id ASC`);
      return rows.map(toCheatSheet);
    },

    async getCheatSheet(sheetId: number): Promise<CheatSheet | null> {
      const row = await database.getFirstAsync<CheatSheetRow>(`${CHEAT_SHEET_SELECT} WHERE cheat_sheets.sheet_id = ? AND cheat_sheets.status = 'published' GROUP BY cheat_sheets.sheet_id`, sheetId);
      return row ? toCheatSheet(row) : null;
    },

    async getCheatSheetSections(sheetId: number): Promise<CheatSheetSection[]> {
      const rows = await database.getAllAsync<CheatSheetSectionRow>('SELECT section_id, sheet_id, position, heading, body FROM cheat_sheet_sections WHERE sheet_id = ? ORDER BY position ASC', sheetId);
      return rows.map((row) => ({ sectionId: row.section_id, sheetId: row.sheet_id, position: row.position, heading: row.heading, body: row.body }));
    },

    async getChecklists(): Promise<Checklist[]> {
      const rows = await database.getAllAsync<ChecklistRow>(`${CHECKLIST_SELECT} WHERE checklists.status = 'published' GROUP BY checklists.checklist_id ORDER BY checklists.checklist_id ASC`);
      return rows.map(toChecklist);
    },

    async getChecklist(checklistId: number): Promise<Checklist | null> {
      const row = await database.getFirstAsync<ChecklistRow>(`${CHECKLIST_SELECT} WHERE checklists.checklist_id = ? AND checklists.status = 'published' GROUP BY checklists.checklist_id`, checklistId);
      return row ? toChecklist(row) : null;
    },

    async getChecklistItems(checklistId: number): Promise<ChecklistItem[]> {
      const rows = await database.getAllAsync<ChecklistItemRow>('SELECT item_id, checklist_id, position, label, detail, severity FROM checklist_items WHERE checklist_id = ? ORDER BY position ASC', checklistId);
      return rows.map((row) => ({ itemId: row.item_id, checklistId: row.checklist_id, position: row.position, label: row.label, detail: row.detail, severity: row.severity }));
    },

    /**
     * Searches every content type that has a reader to open, ranked by how well
     * the query matches the record's name.
     *
     * One extra row beyond the limit is fetched so the screen can tell the
     * reader that a search was truncated instead of quietly showing the first
     * fifty as though they were all of them.
     */
    async searchContent(query: string, limit: number): Promise<{ results: SearchResult[]; truncated: boolean }> {
      const needle = query.trim();
      if (!needle) return { results: [], truncated: false };
      const escaped = escapeLikePattern(needle);
      const rows = await database.getAllAsync<SearchResultRow>(
        `SELECT item_type, item_id, parent_id, title, subtitle FROM (${SEARCH_BRANCHES})
         ORDER BY rank ASC, priority ASC, title COLLATE NOCASE ASC
         LIMIT $limit`,
        { $exact: needle.toLowerCase(), $prefix: `${escaped}%`, $contains: `%${escaped}%`, $limit: limit + 1 },
      );
      const truncated = rows.length > limit;
      return {
        results: rows.slice(0, limit).map((row) => ({ itemType: row.item_type, itemId: row.item_id, parentId: row.parent_id, title: row.title, subtitle: row.subtitle })),
        truncated,
      };
    },

    async getGlossaryTerms(): Promise<GlossaryTerm[]> {
      const rows = await database.getAllAsync<GlossaryTermRow>(`${GLOSSARY_SELECT} WHERE status = 'published' ORDER BY term COLLATE NOCASE ASC`);
      return rows.map(toGlossaryTerm);
    },

    async getGlossaryTerm(termId: number): Promise<GlossaryTerm | null> {
      const row = await database.getFirstAsync<GlossaryTermRow>(`${GLOSSARY_SELECT} WHERE term_id = ? AND status = 'published'`, termId);
      return row ? toGlossaryTerm(row) : null;
    },

    /**
     * The "see also" list is stored one-directional, so a term authored as
     * related to this one is just as relevant as one this one points at. Read
     * both directions and de-duplicate, or half the links would be invisible.
     */
    async getRelatedGlossaryTerms(termId: number): Promise<GlossaryTerm[]> {
      const rows = await database.getAllAsync<GlossaryTermRow>(
        `${GLOSSARY_SELECT}
         WHERE status = 'published' AND term_id IN (
           SELECT related_term_id FROM glossary_term_links WHERE term_id = ?
           UNION
           SELECT term_id FROM glossary_term_links WHERE related_term_id = ?
         )
         ORDER BY term COLLATE NOCASE ASC`,
        termId,
        termId,
      );
      return rows.map(toGlossaryTerm);
    },

    /**
     * Every published term, trimmed to what inline linking needs. Longest names
     * first so "Stale closure" is matched before the "Closure" inside it.
     */
    async getGlossaryTermReferences(): Promise<GlossaryTermReference[]> {
      const rows = await database.getAllAsync<GlossaryTermReferenceRow>(
        `SELECT term_id, term, short_definition FROM glossary_terms WHERE status = 'published' ORDER BY LENGTH(term) DESC, term COLLATE NOCASE ASC`,
      );
      return rows.map((row) => ({ termId: row.term_id, term: row.term, shortDefinition: row.short_definition }));
    },

    async getTopics(): Promise<LearningTopic[]> {
      const rows = await database.getAllAsync<TrackRow>(`${TRACK_SELECT} WHERE tracks.status = 'published' GROUP BY tracks.track_id ORDER BY tracks.position ASC`);
      return rows.map(toTopic);
    },

    async getTopic(topicId: number): Promise<LearningTopic | null> {
      const row = await database.getFirstAsync<TrackRow>(`${TRACK_SELECT} WHERE tracks.track_id = ? AND tracks.status = 'published' GROUP BY tracks.track_id`, topicId);
      return row ? toTopic(row) : null;
    },

    async getSubtopicsForTopic(topicId: number): Promise<LearningSubtopic[]> {
      const rows = await database.getAllAsync<LessonRow>(`${LESSON_SELECT} WHERE track_id = ? AND status = 'published' ORDER BY position ASC`, topicId);
      return rows.map(toSubtopic);
    },

    async getSubtopic(subtopicId: number): Promise<LearningSubtopic | null> {
      const row = await database.getFirstAsync<LessonRow>(`${LESSON_SELECT} WHERE lesson_id = ? AND status = 'published'`, subtopicId);
      return row ? toSubtopic(row) : null;
    },

    async getLessonTakeaways(lessonId: number): Promise<LessonTakeaway[]> {
      const rows = await database.getAllAsync<{ takeaway_id: number; lesson_id: number; position: number; text: string }>('SELECT takeaway_id, lesson_id, position, text FROM lesson_takeaways WHERE lesson_id = ? ORDER BY position', lessonId);
      return rows.map((row) => ({ takeawayId: row.takeaway_id, lessonId: row.lesson_id, position: row.position, text: row.text }));
    },

    async getFaqTopics(): Promise<FaqTopic[]> {
      const rows = await database.getAllAsync<FaqTopicRow>(`SELECT ROW_NUMBER() OVER (ORDER BY category) AS faq_topic_id, category AS title FROM faqs WHERE status = 'published' GROUP BY category ORDER BY category`);
      return rows.map((row) => ({ faqTopicId: row.faq_topic_id, title: row.title }));
    },

    async getFaqsForTopic(faqTopicId: number): Promise<Faq[]> {
      const rows = await database.getAllAsync<FaqRow>(`
        WITH categories AS (SELECT ROW_NUMBER() OVER (ORDER BY category) AS faq_topic_id, category FROM faqs WHERE status = 'published' GROUP BY category)
        SELECT faqs.faq_id, categories.faq_topic_id, faqs.category, faqs.slug, faqs.question, faqs.explanation, faqs.level, faqs.rn_version_verified
        FROM faqs JOIN categories USING (category) WHERE categories.faq_topic_id = ? ORDER BY faqs.faq_id
      `, faqTopicId);
      return rows.map(toFaq);
    },

    async getFaq(faqId: number): Promise<Faq | null> {
      const row = await database.getFirstAsync<FaqRow>(`
        WITH categories AS (SELECT ROW_NUMBER() OVER (ORDER BY category) AS faq_topic_id, category FROM faqs WHERE status = 'published' GROUP BY category)
        SELECT faqs.faq_id, categories.faq_topic_id, faqs.category, faqs.slug, faqs.question, faqs.explanation, faqs.level, faqs.rn_version_verified
        FROM faqs JOIN categories USING (category) WHERE faqs.faq_id = ? AND faqs.status = 'published'
      `, faqId);
      return row ? toFaq(row) : null;
    },

    async getInterviewLevelCounts(): Promise<InterviewLevelCount[]> {
      const rows = await database.getAllAsync<InterviewLevelCountRow>(`SELECT level, COUNT(question_id) AS count FROM interview_questions WHERE status = 'published' GROUP BY level ORDER BY level`);
      return rows.map((row) => ({ level: row.level, count: row.count }));
    },

    async getInterviewQuestions(level: InterviewLevel): Promise<InterviewQuestion[]> {
      const rows = await database.getAllAsync<InterviewQuestionRow>(`SELECT question_id, slug, question, short_answer, explanation, question_type, level, rn_version_verified FROM interview_questions WHERE level = ? AND status = 'published' ORDER BY question_id`, level);
      return rows.map(toInterviewQuestion);
    },

    async getInterviewQuestion(questionId: number): Promise<InterviewQuestion | null> {
      const row = await database.getFirstAsync<InterviewQuestionRow>(`SELECT question_id, slug, question, short_answer, explanation, question_type, level, rn_version_verified FROM interview_questions WHERE question_id = ? AND status = 'published'`, questionId);
      return row ? toInterviewQuestion(row) : null;
    },

    async getInterviewFollowups(questionId: number): Promise<InterviewFollowup[]> {
      const rows = await database.getAllAsync<{ followup_id: number; question_id: number; position: number; question: string; answer: string }>('SELECT followup_id, question_id, position, question, answer FROM interview_followups WHERE question_id = ? ORDER BY position', questionId);
      return rows.map((row) => ({ followupId: row.followup_id, questionId: row.question_id, position: row.position, question: row.question, answer: row.answer }));
    },

    async getCategories(): Promise<LearningCategory[]> {
      const row = await database.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM library_tools WHERE status = 'published'");
      return row && row.count > 0 ? [{ categoryId: 1, name: 'Platforms and frameworks' }] : [];
    },

    async getLibraryToolsForCategory(categoryId: number): Promise<LearningLibraryTool[]> {
      if (categoryId !== 1) return [];
      const rows = await database.getAllAsync<LibraryToolRow>("SELECT library_tool_id, slug, name, what_it_is, when_to_use, avoid_when, alternatives, maintenance_signal, rn_version_verified FROM library_tools WHERE status = 'published' ORDER BY name");
      return rows.map(mapLibraryTool);
    },

    async getLibraryTool(libraryToolId: number): Promise<LearningLibraryTool | null> {
      const row = await database.getFirstAsync<LibraryToolRow>("SELECT library_tool_id, slug, name, what_it_is, when_to_use, avoid_when, alternatives, maintenance_signal, rn_version_verified FROM library_tools WHERE library_tool_id = ? AND status = 'published'", libraryToolId);
      return row ? mapLibraryTool(row) : null;
    },

    async getStudyPlans(): Promise<StudyPlanSummary[]> {
      const rows = await database.getAllAsync<StudyPlanRow>(`
        SELECT path_id, slug, title, description, target_weeks, level,
               (SELECT COUNT(*) FROM learning_path_items WHERE learning_path_items.path_id = learning_paths.path_id) AS item_count,
               (SELECT COALESCE(SUM(estimated_minutes), 0) FROM learning_path_items WHERE learning_path_items.path_id = learning_paths.path_id) AS total_minutes
        FROM learning_paths WHERE status = 'published' ORDER BY level ASC, path_id ASC
      `);
      return rows.map(toStudyPlanSummary);
    },

    /**
     * A plan stores only `(item_type, item_id)`, so the title and the parent a
     * reader route needs have to be resolved from the table each item lives in.
     * One query per type present rather than one per item: a seventeen-item plan
     * costs five round trips, not eighteen.
     */
    async getStudyPlan(pathId: number): Promise<StudyPlan | null> {
      const row = await database.getFirstAsync<StudyPlanRow>(`
        SELECT path_id, slug, title, description, target_weeks, level,
               (SELECT COUNT(*) FROM learning_path_items WHERE learning_path_items.path_id = learning_paths.path_id) AS item_count,
               (SELECT COALESCE(SUM(estimated_minutes), 0) FROM learning_path_items WHERE learning_path_items.path_id = learning_paths.path_id) AS total_minutes
        FROM learning_paths WHERE path_id = ? AND status = 'published'
      `, pathId);
      if (!row) return null;

      const itemRows = await database.getAllAsync<{ position: number; item_type: string; item_id: number; estimated_minutes: number }>(
        'SELECT position, item_type, item_id, estimated_minutes FROM learning_path_items WHERE path_id = ? ORDER BY position ASC',
        pathId,
      );

      const resolved = new Map<string, { title: string; parentId: number | null }>();
      for (const itemType of new Set(itemRows.map((item) => item.item_type))) {
        const source = STUDY_PLAN_ITEM_SOURCES[itemType as StudyPlanItemType];
        if (!source) continue;
        const ids = itemRows.filter((item) => item.item_type === itemType).map((item) => item.item_id);
        const placeholders = ids.map(() => '?').join(', ');
        const found = await database.getAllAsync<{ id: number; title: string; parent_id: number | null }>(
          `SELECT ${source.idColumn} AS id, ${source.titleColumn} AS title, ${source.parentColumn ?? 'NULL'} AS parent_id FROM ${source.table} WHERE ${source.idColumn} IN (${placeholders})`,
          ...ids,
        );
        for (const record of found) resolved.set(`${itemType}:${record.id}`, { title: record.title, parentId: record.parent_id });
      }

      // An item whose record has since been unpublished is dropped rather than
      // rendered as a blank row that opens nothing. The build's assertReference
      // stops a *missing* record, but not one that moved back to draft.
      const items = itemRows.flatMap((item) => {
        const record = resolved.get(`${item.item_type}:${item.item_id}`);
        if (!record) return [];
        return [{
          position: item.position,
          itemType: item.item_type as StudyPlanItemType,
          itemId: item.item_id,
          parentId: record.parentId,
          title: record.title,
          estimatedMinutes: item.estimated_minutes,
        }];
      });
      return { ...toStudyPlanSummary(row), items };
    },

    async getGuidedProjects(): Promise<ProjectSummary[]> {
      const rows = await database.getAllAsync<ProjectRow>(`${PROJECT_SELECT} WHERE status = 'published' ORDER BY level ASC, project_id ASC`);
      return rows.map(toProjectSummary);
    },

    /**
     * A project is self-contained: its steps carry their own prose and
     * reference nothing, so unlike a study plan this is two queries whatever
     * the project holds — no titles to resolve out of other tables.
     */
    async getGuidedProject(projectId: number): Promise<GuidedProject | null> {
      const row = await database.getFirstAsync<ProjectRow>(`${PROJECT_SELECT} WHERE project_id = ? AND status = 'published'`, projectId);
      if (!row) return null;
      const steps = await database.getAllAsync<ProjectStep>(
        'SELECT position, goal, instructions, checkpoint FROM project_steps WHERE project_id = ? ORDER BY position ASC',
        projectId,
      );
      return { ...toProjectSummary(row), steps };
    },

    async getDesignScenarios(): Promise<DesignScenarioSummary[]> {
      const rows = await database.getAllAsync<DesignScenarioRow>(`${DESIGN_SCENARIO_SELECT} WHERE status = 'published' ORDER BY level ASC, scenario_id ASC`);
      return rows.map(toDesignScenarioSummary);
    },

    /**
     * Three queries: the scenario, its stages, and its rubric. Like a project
     * and unlike a study plan, a scenario references nothing, so nothing has to
     * be resolved out of another table.
     */
    async getDesignScenario(scenarioId: number): Promise<DesignScenario | null> {
      const row = await database.getFirstAsync<DesignScenarioRow>(`${DESIGN_SCENARIO_SELECT} WHERE scenario_id = ? AND status = 'published'`, scenarioId);
      if (!row) return null;
      const stages = await database.getAllAsync<DesignScenarioStage>(
        'SELECT position, stage, prompt, model_answer AS modelAnswer FROM design_scenario_stages WHERE scenario_id = ? ORDER BY position ASC',
        scenarioId,
      );
      const rubric = await database.getAllAsync<DesignScenarioCriterion>(
        'SELECT position, criterion, strong_answer AS strongAnswer, weak_answer AS weakAnswer FROM design_scenario_rubric WHERE scenario_id = ? ORDER BY position ASC',
        scenarioId,
      );
      return { ...toDesignScenarioSummary(row), stages, rubric };
    },

    async getTagsForContent(itemType: TaggableContentType, itemId: number): Promise<ContentTag[]> {
      const rows = await database.getAllAsync<{ tag_id: number; slug: string; name: string }>('SELECT tags.tag_id, tags.slug, tags.name FROM content_tags JOIN tags USING (tag_id) WHERE item_type = ? AND item_id = ? ORDER BY tags.slug', itemType, itemId);
      return rows.map((row) => ({ tagId: row.tag_id, slug: row.slug, name: row.name }));
    },

    async getDemosForContent(itemType: TaggableContentType, itemId: number): Promise<ContentDemo[]> {
      const rows = await database.getAllAsync<{ demo_id: string; label: string }>('SELECT demo_id, label FROM content_demos WHERE item_type = ? AND item_id = ? ORDER BY demo_id', itemType, itemId);
      return rows.map((row) => ({ demoId: row.demo_id, label: row.label }));
    },
  };
}

export type LearningContentRepository = ReturnType<typeof createLearningContentRepository>;
