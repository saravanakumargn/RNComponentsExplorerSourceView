import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  Faq,
  FaqTopic,
  InterviewLevel,
  InterviewLevelCount,
  InterviewQuestion,
  LearningCategory,
  LearningContentMetadata,
  LearningLibraryTool,
  LearningSubtopic,
  LearningTopic,
} from './learning-types';

type MetadataRow = {
  schema_version: number;
  content_version: string;
  created_at: string;
  source_hash: string;
};

type TopicRow = {
  topic_id: number;
  topic_name: string;
  lesson_count: number;
};

type SubtopicRow = {
  subtopic_id: number;
  topic_id: number;
  subtopic_name: string;
  subtopic_description: string | null;
  level: number | null;
  content_body: string;
};

type FaqTopicRow = { faq_topic_id: number; title: string };
type FaqRow = { faq_id: number; faq_topic_id: number; question: string; explanation: string; level: number | null };
type InterviewQuestionRow = { question_id: number; question: string; explanation: string; level: InterviewLevel };
type InterviewLevelCountRow = { level: InterviewLevel; count: number };
type CategoryRow = { category_id: number; name: string };
type LibraryToolRow = { library_tool_id: number; category_id: number; name: string; explanation: string };

function toMetadata(row: MetadataRow): LearningContentMetadata {
  return {
    schemaVersion: row.schema_version,
    contentVersion: row.content_version,
    createdAt: row.created_at,
    sourceHash: row.source_hash,
  };
}

function toTopic(row: TopicRow): LearningTopic {
  return { topicId: row.topic_id, topicName: row.topic_name, lessonCount: row.lesson_count };
}

function toSubtopic(row: SubtopicRow): LearningSubtopic {
  return {
    subtopicId: row.subtopic_id,
    topicId: row.topic_id,
    subtopicName: row.subtopic_name,
    subtopicDescription: row.subtopic_description,
    level: row.level,
    contentBody: row.content_body,
  };
}

function toFaqTopic(row: FaqTopicRow): FaqTopic {
  return { faqTopicId: row.faq_topic_id, title: row.title };
}

function toFaq(row: FaqRow): Faq {
  return { faqId: row.faq_id, faqTopicId: row.faq_topic_id, question: row.question, explanation: row.explanation, level: row.level };
}

function toInterviewQuestion(row: InterviewQuestionRow): InterviewQuestion {
  return { questionId: row.question_id, question: row.question, explanation: row.explanation, level: row.level };
}

function toCategory(row: CategoryRow): LearningCategory {
  return { categoryId: row.category_id, name: row.name };
}

function toLibraryTool(row: LibraryToolRow): LearningLibraryTool {
  return { libraryToolId: row.library_tool_id, categoryId: row.category_id, name: row.name, explanation: row.explanation };
}

/**
 * Read-only repository for the release-bundled learning-content.db.
 *
 * The database instance is supplied by the content database provider. Keeping it
 * injected prevents this repository from creating an empty database before the
 * validated bundled asset has been imported.
 */
export function createLearningContentRepository(database: SQLiteDatabase) {
  return {
    async getMetadata(): Promise<LearningContentMetadata | null> {
      const row = await database.getFirstAsync<MetadataRow>(
        'SELECT schema_version, content_version, created_at, source_hash FROM content_metadata WHERE id = 1',
      );
      return row ? toMetadata(row) : null;
    },

    async getTopics(): Promise<LearningTopic[]> {
      const rows = await database.getAllAsync<TopicRow>(`
        SELECT topics.topic_id, topics.topic_name, COUNT(subtopics.subtopic_id) AS lesson_count
        FROM topics
        LEFT JOIN subtopics ON subtopics.topic_id = topics.topic_id
        GROUP BY topics.topic_id, topics.topic_name
        ORDER BY topics.topic_id ASC
      `);
      return rows.map(toTopic);
    },

    async getTopic(topicId: number): Promise<LearningTopic | null> {
      const row = await database.getFirstAsync<TopicRow>(`
        SELECT topics.topic_id, topics.topic_name, COUNT(subtopics.subtopic_id) AS lesson_count
        FROM topics
        LEFT JOIN subtopics ON subtopics.topic_id = topics.topic_id
        WHERE topics.topic_id = ?
        GROUP BY topics.topic_id, topics.topic_name
      `, topicId);
      return row ? toTopic(row) : null;
    },

    async getSubtopicsForTopic(topicId: number): Promise<LearningSubtopic[]> {
      const rows = await database.getAllAsync<SubtopicRow>(`
        SELECT subtopic_id, topic_id, subtopic_name, subtopic_description, level, content_body
        FROM subtopics
        WHERE topic_id = ?
        ORDER BY COALESCE(level, 0), subtopic_id ASC
      `, topicId);
      return rows.map(toSubtopic);
    },

    async getSubtopic(subtopicId: number): Promise<LearningSubtopic | null> {
      const row = await database.getFirstAsync<SubtopicRow>(`
        SELECT subtopic_id, topic_id, subtopic_name, subtopic_description, level, content_body
        FROM subtopics
        WHERE subtopic_id = ?
      `, subtopicId);
      return row ? toSubtopic(row) : null;
    },

    async getFaqTopics(): Promise<FaqTopic[]> {
      const rows = await database.getAllAsync<FaqTopicRow>('SELECT faq_topic_id, title FROM faq_topics ORDER BY faq_topic_id ASC');
      return rows.map(toFaqTopic);
    },

    async getFaqsForTopic(faqTopicId: number): Promise<Faq[]> {
      const rows = await database.getAllAsync<FaqRow>(`
        SELECT faq_id, faq_topic_id, question, explanation, level
        FROM faqs
        WHERE faq_topic_id = ?
        ORDER BY faq_id ASC
      `, faqTopicId);
      return rows.map(toFaq);
    },

    async getFaq(faqId: number): Promise<Faq | null> {
      const row = await database.getFirstAsync<FaqRow>(`
        SELECT faq_id, faq_topic_id, question, explanation, level FROM faqs WHERE faq_id = ?
      `, faqId);
      return row ? toFaq(row) : null;
    },

    async getInterviewLevelCounts(): Promise<InterviewLevelCount[]> {
      const rows = await database.getAllAsync<InterviewLevelCountRow>(`
        SELECT level, COUNT(question_id) AS count
        FROM interview_questions
        GROUP BY level
        ORDER BY level ASC
      `);
      return rows.map((row) => ({ level: row.level, count: row.count }));
    },

    async getInterviewQuestions(level: InterviewLevel): Promise<InterviewQuestion[]> {
      const rows = await database.getAllAsync<InterviewQuestionRow>(`
        SELECT question_id, question, explanation, level
        FROM interview_questions
        WHERE level = ?
        ORDER BY question_id ASC
      `, level);
      return rows.map(toInterviewQuestion);
    },

    async getInterviewQuestion(questionId: number): Promise<InterviewQuestion | null> {
      const row = await database.getFirstAsync<InterviewQuestionRow>(`
        SELECT question_id, question, explanation, level FROM interview_questions WHERE question_id = ?
      `, questionId);
      return row ? toInterviewQuestion(row) : null;
    },

    async getCategories(): Promise<LearningCategory[]> {
      const rows = await database.getAllAsync<CategoryRow>('SELECT category_id, name FROM categories ORDER BY category_id ASC');
      return rows.map(toCategory);
    },

    async getLibraryToolsForCategory(categoryId: number): Promise<LearningLibraryTool[]> {
      const rows = await database.getAllAsync<LibraryToolRow>(`
        SELECT library_tool_id, category_id, name, explanation
        FROM libraries_and_tools
        WHERE category_id = ?
        ORDER BY library_tool_id ASC
      `, categoryId);
      return rows.map(toLibraryTool);
    },

    async getLibraryTool(libraryToolId: number): Promise<LearningLibraryTool | null> {
      const row = await database.getFirstAsync<LibraryToolRow>(`
        SELECT library_tool_id, category_id, name, explanation
        FROM libraries_and_tools
        WHERE library_tool_id = ?
      `, libraryToolId);
      return row ? toLibraryTool(row) : null;
    },
  };
}

export type LearningContentRepository = ReturnType<typeof createLearningContentRepository>;
