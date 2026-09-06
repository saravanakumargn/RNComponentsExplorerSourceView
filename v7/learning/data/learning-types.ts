export type LearningContentMetadata = {
  schemaVersion: number;
  contentVersion: string;
  createdAt: string;
  sourceHash: string;
};

export type LearningContentStatus = 'draft' | 'published' | 'archived';
export type LearningLevel = 1 | 2 | 3;

export type LearningTopic = {
  topicId: number;
  topicName: string;
  lessonCount: number;
  slug: string;
  description: string;
  position: number;
  status: LearningContentStatus;
  rnVersionVerified: string;
};

export type LearningSubtopic = {
  subtopicId: number;
  topicId: number;
  subtopicName: string;
  subtopicDescription: string;
  level: LearningLevel;
  contentBody: string;
  slug: string;
  position: number;
  prerequisites: string | null;
  estimatedMinutes: number;
  status: LearningContentStatus;
  rnVersionVerified: string;
  updatedAt: string;
};

export type LessonTakeaway = { takeawayId: number; lessonId: number; position: number; text: string };

export type FaqTopic = { faqTopicId: number; title: string };
export type Faq = {
  faqId: number;
  faqTopicId: number;
  category: string;
  slug: string;
  question: string;
  explanation: string;
  level: LearningLevel | null;
  rnVersionVerified: string;
};

export type InterviewLevel = LearningLevel;
export type InterviewQuestionType = 'conceptual' | 'coding' | 'system-design' | 'debugging' | 'behavioural';
export type InterviewQuestion = {
  questionId: number;
  slug: string;
  question: string;
  shortAnswer: string;
  explanation: string;
  questionType: InterviewQuestionType;
  level: InterviewLevel;
  rnVersionVerified: string;
};
export type InterviewFollowup = { followupId: number; questionId: number; position: number; question: string; answer: string };
export type InterviewLevelCount = { level: InterviewLevel; count: number };

export type LearningCategory = { categoryId: number; name: string };
export type LearningLibraryTool = {
  libraryToolId: number;
  categoryId: number;
  slug: string;
  name: string;
  explanation: string;
  avoidWhen: string;
  maintenanceSignal: string;
  rnVersionVerified: string;
};

export type QuizOption = { optionId: number; position: number; label: string; isCorrect: boolean };
export type QuizQuestion = { quizQuestionId: number; position: number; prompt: string; explanation: string; options: QuizOption[] };
export type Quiz = {
  quizId: number;
  trackId: number;
  trackTitle: string;
  slug: string;
  title: string;
  description: string;
  /** Difficulty of this fixed 15-question test part. */
  level: LearningLevel;
  /** Ordered test part within a track and level. */
  part: number;
  /** A passed test required before this part becomes available. */
  prerequisiteQuizId: number | null;
  /** Percentage of correct answers required to pass, 1–100. */
  passThreshold: number;
  questionCount: number;
  rnVersionVerified: string;
};

/** A finished attempt as stored in the progress database. */
export type QuizAttempt = { attemptId: number; quizId: number; score: number; total: number; completedAt: string };

/** An unfinished fixed-question quiz, including the exact order the reader saw. */
export type ActiveQuizAttempt = {
  quizId: number;
  questionOrder: number[];
  optionOrder: Record<number, number[]>;
  selections: Record<number, number>;
  currentIndex: number;
  updatedAt: string;
};

/** What a full progress reset would delete, counted for the confirmation. */
export type LearningResetSummary = {
  completedLessons: number;
  quizAttempts: number;
  reviewedItems: number;
  checkedChecklistItems: number;
};

export type GlossaryTerm = {
  termId: number;
  slug: string;
  term: string;
  shortDefinition: string;
  fullExplanation: string;
  rnVersionVerified: string;
};

/**
 * What inline linking needs to recognise a term in lesson or interview content:
 * the name to match and enough to render the popover without a second query.
 */
export type GlossaryTermReference = Pick<GlossaryTerm, 'termId' | 'term' | 'shortDefinition'>;

/**
 * Published-record counts behind each learning home area. The home list is
 * built from these so an area whose content has not been authored yet is never
 * advertised as a destination.
 */
export type LearningAreaContentCounts = {
  learningPath: number;
  faq: number;
  glossary: number;
  goodToKnow: number;
  interviewPrep: number;
  quizzes: number;
  review: number;
  cheatSheets: number;
  checklists: number;
  decisionGuides: number;
  snippets: number;
  codeChallenges: number;
  studyPlans: number;
  projects: number;
  designScenarios: number;
};

export type DecisionGuideOption = {
  optionId: number;
  position: number;
  name: string;
  /** Set when the option is an npm package the catalogue may also demo. */
  npmPackage: string | null;
  verdict: string;
  bestFor: string;
  avoidWhen: string;
};

export type DecisionGuideCriterion = { criterionId: number; position: number; label: string };

/** One option's fit against one criterion, 0–3, with the sentence explaining it. */
export type DecisionGuideScore = { optionId: number; criterionId: number; value: number; note: string | null };

export type DecisionGuideSummary = {
  guideId: number;
  slug: string;
  title: string;
  question: string;
  summary: string;
  optionCount: number;
  rnVersionVerified: string;
};

export type DecisionGuide = DecisionGuideSummary & {
  options: DecisionGuideOption[];
  criteria: DecisionGuideCriterion[];
  scores: DecisionGuideScore[];
};

export type LearningSnippet = {
  snippetId: number;
  slug: string;
  title: string;
  description: string;
  code: string;
  language: string;
  explanation: string;
  rnVersionVerified: string;
  demos: ContentDemo[];
};

export type CodeChallengeType = 'debugging' | 'performance' | 'implementation' | 'refactor';

export type CodeChallenge = {
  challengeId: number;
  slug: string;
  title: string;
  brief: string;
  difficulty: 1 | 2 | 3;
  challengeType: CodeChallengeType;
  brokenCode: string;
  fixedCode: string;
  language: string;
  explanation: string;
  estimatedMinutes: number;
  hints: string[];
  rnVersionVerified: string;
  demos: ContentDemo[];
};

export type ContentTag = { tagId: number; slug: string; name: string };
export type ContentDemo = { demoId: string; label: string };
export type TaggableContentType =
  | 'lesson' | 'interview_question' | 'faq' | 'cheat_sheet' | 'glossary_term' | 'decision_guide'
  | 'flashcard' | 'library_tool' | 'quiz' | 'learning_path' | 'migration_guide' | 'code_challenge'
  | 'checklist' | 'snippet' | 'design_scenario' | 'project';

export type LastReadLesson = {
  topicId: number;
  topicName: string;
  subtopicId: number;
  subtopicName: string;
};

export type CompletedLesson = { lessonId: number; completedAt: string };

/** The two content types the shared spaced-repetition scheduler covers (plan §6.7). */
export type ReviewItemType = 'flashcard' | 'interview_question';
export type ReviewItemKey = { itemType: ReviewItemType; itemId: number };

/** A reviewable card, whichever content type it was derived from. */
export type ReviewItem = ReviewItemKey & { front: string; back: string };

/** The scheduler's state for one card, as stored in the progress database. */
export type ReviewRecord = ReviewItemKey & {
  reviewedAt: string;
  rating: number;
  intervalDays: number;
  ease: number;
  dueAt: string;
};

export type CheatSheet = {
  sheetId: number;
  slug: string;
  title: string;
  description: string;
  sectionCount: number;
  rnVersionVerified: string;
};

/** `body` is HTML generated from markdown at build time, as lesson bodies are. */
export type CheatSheetSection = { sectionId: number; sheetId: number; position: number; heading: string; body: string };

/**
 * How much a checklist item matters. Only `required` items decide whether a
 * checklist is finished — see `summarizeChecklist`.
 */
export type ChecklistItemSeverity = 'required' | 'recommended' | 'optional';

export type Checklist = {
  checklistId: number;
  slug: string;
  title: string;
  description: string;
  itemCount: number;
  requiredCount: number;
  rnVersionVerified: string;
};

export type ChecklistItem = {
  itemId: number;
  checklistId: number;
  position: number;
  label: string;
  detail: string;
  severity: ChecklistItemSeverity;
};

/** Content types the library search can return, each with a reader to open. */
export type SearchResultType =
  | 'lesson' | 'glossary_term' | 'interview_question' | 'faq'
  | 'cheat_sheet' | 'checklist' | 'quiz' | 'library_tool' | 'decision_guide' | 'snippet' | 'code_challenge'
  | 'project';

/**
 * The content types a study plan may order. A plan composes published records
 * rather than authoring anything, so this is deliberately the set that has a
 * reader route to open.
 */
export type StudyPlanItemType = Exclude<SearchResultType, 'glossary_term'>;

export type StudyPlanItem = {
  position: number;
  itemType: StudyPlanItemType;
  itemId: number;
  /** The record's container where its route needs one — a lesson's track. */
  parentId: number | null;
  title: string;
  estimatedMinutes: number;
};

export type StudyPlanSummary = {
  pathId: number;
  slug: string;
  title: string;
  description: string;
  targetWeeks: number;
  level: LearningLevel;
  itemCount: number;
  totalMinutes: number;
};

export type StudyPlan = StudyPlanSummary & { items: StudyPlanItem[] };

/**
 * One step of a guided project. Unlike a study-plan item this references
 * nothing — the prose is the content. The `checkpoint` is the part that makes a
 * step worth having: the observable condition that says you are done with it,
 * which is what a tutorial leaves out and what leaves you unsure whether to
 * carry on.
 */
export type ProjectStep = {
  position: number;
  goal: string;
  instructions: string;
  checkpoint: string;
};

export type ProjectSummary = {
  projectId: number;
  slug: string;
  title: string;
  brief: string;
  level: LearningLevel;
  estimatedHours: number;
  stepCount: number;
};

export type GuidedProject = ProjectSummary & { steps: ProjectStep[] };

/** The five stages a scenario is worked in, in the order the schema fixes. */
export type DesignScenarioStageName = 'requirements' | 'estimation' | 'architecture' | 'data' | 'trade-offs';

export type DesignScenarioStage = {
  position: number;
  stage: DesignScenarioStageName;
  prompt: string;
  /** Hidden until the reader asks for it — revealing it *is* the interaction. */
  modelAnswer: string;
};

/**
 * What separates a strong answer from a weak one on one criterion.
 *
 * Both sides ship deliberately. Every source has a model answer; what is
 * missing everywhere is the thing an interviewer is actually scoring.
 */
export type DesignScenarioCriterion = {
  position: number;
  criterion: string;
  strongAnswer: string;
  weakAnswer: string;
};

export type DesignScenarioSummary = {
  scenarioId: number;
  slug: string;
  title: string;
  brief: string;
  constraints: string;
  level: LearningLevel;
  stageCount: number;
};

export type DesignScenario = DesignScenarioSummary & {
  stages: DesignScenarioStage[];
  rubric: DesignScenarioCriterion[];
};

export type SearchResult = {
  itemType: SearchResultType;
  itemId: number;
  /** The record's container where the reader route needs one — a lesson's track. */
  parentId: number | null;
  title: string;
  subtitle: string;
};
