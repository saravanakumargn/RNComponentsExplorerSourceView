export type LearningContentMetadata = {
  schemaVersion: number;
  contentVersion: string;
  createdAt: string;
  sourceHash: string;
};

export type LearningTopic = {
  topicId: number;
  topicName: string;
  lessonCount: number;
};

export type LearningSubtopic = {
  subtopicId: number;
  topicId: number;
  subtopicName: string;
  subtopicDescription: string | null;
  level: number | null;
  contentBody: string;
};

export type FaqTopic = {
  faqTopicId: number;
  title: string;
};

export type Faq = {
  faqId: number;
  faqTopicId: number;
  question: string;
  explanation: string;
  level: number | null;
};

export type InterviewLevel = 1 | 2 | 3;

export type InterviewQuestion = {
  questionId: number;
  question: string;
  explanation: string;
  level: InterviewLevel;
};

export type InterviewLevelCount = {
  level: InterviewLevel;
  count: number;
};

export type LearningCategory = {
  categoryId: number;
  name: string;
};

export type LearningLibraryTool = {
  libraryToolId: number;
  categoryId: number;
  name: string;
  explanation: string;
};

export type LastReadLesson = {
  topicId: number;
  topicName: string;
  subtopicId: number;
  subtopicName: string;
};

export type CompletedLesson = {
  topicId: number;
  subtopicId: number;
  contentTitle: string;
  completedAt: string;
};
