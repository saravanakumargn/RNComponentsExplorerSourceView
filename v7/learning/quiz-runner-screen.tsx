import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { NativeButton } from '@/components/native-ui/native-button';
import { NativeCard } from '@/components/native-ui/native-card';
import { NativeProgressBar } from '@/components/native-ui/native-progress-bar';
import { NativeText } from '@/components/native-ui/native-text';
import { getLearningAreaStyle, NATIVE_TINT } from '@/components/native-ui/native-tokens';

import { CenteredEmptyState } from '@/components/screen-layout';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import { getLearningProgressRepository } from '@/features/learning/data/learning-progress-repository';
import type { ActiveQuizAttempt, Quiz, QuizQuestion } from '@/features/learning/data/learning-types';
import { InlineCodeText } from '@/features/learning/inline-code';
import { LearningEmptyState } from '@/features/learning/learning-empty-state';
import { getQuizAccess } from '@/features/learning/quiz-access';
import { orderQuizQuestions, startQuizAttempt } from '@/features/learning/quiz-attempt';
import { countUnanswered, formatQuizScore, scoreQuiz, type QuizResult, type QuizSelections } from '@/features/learning/quiz-scoring';
import { useSubscription } from '@/features/purchases/use-subscription';
import { usePaywall } from '@/features/purchases/paywall-provider';

/**
 * Taking a quiz, and the result afterwards.
 *
 * Split out of `quiz-screen` so the SwiftUI list can replace its Paper sibling
 * on iOS without dragging the runner with it. This stays React Native on every
 * platform: the option rows, the scoring reveal, and the review pass are custom
 * interaction rather than list-shaped chrome.
 */
/** iOS system green and red: a pass and a fail are states, not brand colours. */
const PASS = '#34C759';
const FAIL = '#FF3B30';

const { tint: QUIZ_TINT } = getLearningAreaStyle('quizzes');

export function QuizRunnerScreen() {
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const database = useSQLiteContext();
  const [quiz, setQuiz] = useState<Quiz | null | undefined>();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [activeAttempt, setActiveAttempt] = useState<Omit<ActiveQuizAttempt, 'updatedAt'> | null>(null);
  const [selections, setSelections] = useState<QuizSelections>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [access, setAccess] = useState<'available' | 'premium' | 'prerequisite' | null>(null);
  const { learningUnlocked } = useSubscription();
  const { openPaywall } = usePaywall();
  const parsedQuizId = Number(quizId);

  useEffect(() => {
    let active = true;
    const content = createLearningContentRepository(database);
    void Promise.all([content.getQuiz(parsedQuizId), content.getQuizQuestions(parsedQuizId), content.getQuizzes(), getLearningProgressRepository()])
      .then(async ([resolvedQuiz, resolvedQuestions, allQuizzes, progress]) => {
        const attempts = Object.fromEntries((await progress.getBestQuizAttempts()).map((attempt) => [attempt.quizId, attempt]));
        const saved = resolvedQuiz ? await progress.getActiveQuizAttempt(resolvedQuiz.quizId) : null;
        const restored = saved ? orderQuizQuestions(resolvedQuestions, saved) : null;
        const nextAttempt = resolvedQuiz ? (saved && restored ? saved : startQuizAttempt(resolvedQuiz.quizId, resolvedQuestions)) : null;
        if (!active) return;
        setQuiz(resolvedQuiz);
        setAccess(resolvedQuiz ? getQuizAccess(resolvedQuiz, { index: allQuizzes.findIndex((item) => item.quizId === resolvedQuiz.quizId), total: allQuizzes.length, learningUnlocked, attempts, quizzesById: Object.fromEntries(allQuizzes.map((item) => [item.quizId, item])) }) : null);
        setQuestions(restored ?? (nextAttempt ? orderQuizQuestions(resolvedQuestions, nextAttempt) ?? [] : resolvedQuestions));
        setActiveAttempt(nextAttempt);
        setSelections(nextAttempt?.selections ?? {});
        setIndex(nextAttempt?.currentIndex ?? 0);
        if (nextAttempt && !saved) void progress.saveActiveQuizAttempt(nextAttempt);
      })
      .catch(() => { if (active) setQuiz(null); });
    return () => { active = false; };
  }, [database, learningUnlocked, parsedQuizId]);

  const persistAttempt = useCallback((selections: QuizSelections, currentIndex: number) => {
    if (!quiz || !activeAttempt) return;
    const next = { ...activeAttempt, selections: selections as Record<number, number>, currentIndex };
    setActiveAttempt(next);
    void getLearningProgressRepository().then((progress) => progress.saveActiveQuizAttempt(next));
  }, [activeAttempt, quiz]);

  const restart = useCallback(() => {
    if (!quiz) return;
    const next = startQuizAttempt(quiz.quizId, questions);
    const shuffled = orderQuizQuestions(questions, next);
    setQuestions(shuffled ?? questions);
    setActiveAttempt(next);
    setSelections({});
    setIndex(0);
    setResult(null);
    setSaveError(null);
    void getLearningProgressRepository().then((progress) => progress.saveActiveQuizAttempt(next));
  }, [questions, quiz]);

  const submit = useCallback(async () => {
    if (!quiz) return;
    const scored = scoreQuiz(quiz, questions, selections);
    setResult(scored);
    try {
      await (await getLearningProgressRepository()).recordQuizAttempt({
        quizId: quiz.quizId,
        score: scored.score,
        total: scored.total,
        answers: scored.questions
          .filter((question) => question.selectedOptionId !== null)
          .map((question) => ({ quizQuestionId: question.quizQuestionId, selectedOptionId: question.selectedOptionId as number, correct: question.correct })),
      });
    } catch {
      // The score is already on screen; only its persistence failed.
      setSaveError('This attempt could not be saved to your device, but your result below is correct.');
    }
  }, [questions, quiz, selections]);

  if (quiz === undefined) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading quiz" /></CenteredEmptyState>;
  if (!quiz) return <CenteredEmptyState><NativeText tone="secondary">This quiz is unavailable.</NativeText></CenteredEmptyState>;
  if (access && access !== 'available') {
    return <CenteredEmptyState><Stack.Screen options={{ title: quiz.title }} /><NativeText style={{ textAlign: 'center' }} textStyle="headline">{access === 'premium' ? 'This test part is included with the full learning library.' : 'Pass the required earlier test part to unlock this one.'}</NativeText>{access === 'premium' ? <NativeButton onPress={() => openPaywall('premium_quiz_part')} title="Unlock all quiz parts" variant="filled" /> : null}</CenteredEmptyState>;
  }
  if (questions.length === 0) {
    return <View testID="quiz-runner-ready" style={{ flex: 1 }}><Stack.Screen options={{ title: quiz.title }} /><LearningEmptyState testID="quiz-questions-empty" title="No questions yet" message="This quiz has no published questions. Try another quiz, or come back after the next content update." /></View>;
  }

  if (result) {
    return (
      <ScrollView testID="quiz-result-ready" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ gap: 12, padding: 16, paddingBottom: 32 }}>
        <Stack.Screen options={{ title: 'Results' }} />
        <NativeCard accent={result.passed ? PASS : FAIL} padding={18} style={{ gap: 8 }}>
            <NativeText style={{ color: result.passed ? PASS : FAIL }} textStyle="footnote" weight="600">{result.passed ? 'Passed' : 'Not passed'}</NativeText>
            <NativeText textStyle="title2">{formatQuizScore(result.score, result.total, result.percent)}</NativeText>
            <NativeText selectable textStyle="footnote" tone="secondary">{result.passed ? `That is at or above the ${result.passThreshold}% needed to pass.` : `You need ${result.passThreshold}% to pass. The explanations below cover what to revisit.`}</NativeText>
            <NativeButton onPress={restart} testID="quiz-retry" title="Try again" variant="filled" />
        </NativeCard>
        {saveError ? <NativeText accessibilityLiveRegion="polite" selectable textStyle="footnote" tone="destructive">{saveError}</NativeText> : null}
        {result.questions.map((question, questionIndex) => (
          <NativeCard key={question.quizQuestionId} style={{ gap: 6 }} testID={`quiz-review-${questionIndex}`}>
              <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
                <SymbolView name={question.correct ? 'checkmark.circle.fill' : 'xmark.circle.fill'} size={17} tintColor={question.correct ? PASS : FAIL} />
                <NativeText style={{ color: question.correct ? PASS : FAIL }} textStyle="subheadline" weight="600">{question.correct ? 'Correct' : question.selectedOptionId === null ? 'Not answered' : 'Incorrect'}</NativeText>
              </View>
              <InlineCodeText textStyle="headline">{question.prompt}</InlineCodeText>
              <InlineCodeText textStyle="footnote" tone="secondary">{question.explanation}</InlineCodeText>
          </NativeCard>
        ))}
      </ScrollView>
    );
  }

  const question = questions[index];
  const remaining = countUnanswered(questions, selections);
  const isLast = index === questions.length - 1;

  return (
    <View testID="quiz-runner-ready" style={{ flex: 1 }}>
      <Stack.Screen options={{ title: quiz.title }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ gap: 12, padding: 16, paddingBottom: 24 }}>
        <NativeText textStyle="footnote" tone="secondary" weight="600">Question {index + 1} of {questions.length}</NativeText>
        <NativeProgressBar accessibilityLabel={`Question ${index + 1} of ${questions.length}`} progress={(index + 1) / questions.length} tint={QUIZ_TINT} />
        <InlineCodeText textStyle="title3">{question.prompt}</InlineCodeText>
        {/*
          Rows are built by hand rather than with RadioButton.Item for two
          reasons: iOS renders an unselected radio as nothing at all, which
          leaves the options looking like plain text, and the labels are
          authored markdown, so `window` has to render as code rather than
          as backticks.
        */}
        {question.options.map((option, optionIndex) => {
          const selected = selections[question.quizQuestionId] === option.optionId;
          return (
            <Pressable
              key={option.optionId}
              testID={`quiz-option-${optionIndex}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={option.label.replace(/`/g, '')}
              onPress={() => {
                const next = { ...selections, [question.quizQuestionId]: option.optionId };
                setSelections(next);
                persistAttempt(next, index);
              }}
              style={{ minHeight: 44 }}
            >
              <NativeCard accent={selected ? NATIVE_TINT : undefined} padding={12}>
                <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
                  <SymbolView name={selected ? 'checkmark.circle.fill' : 'circle'} size={22} tintColor={selected ? NATIVE_TINT : '#C7C7CC'} />
                  <View style={{ flex: 1 }}><InlineCodeText>{option.label}</InlineCodeText></View>
                </View>
              </NativeCard>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 8, padding: 12 }}>
          <NativeButton disabled={index === 0} onPress={() => { const next = Math.max(0, index - 1); setIndex(next); persistAttempt(selections, next); }} style={{ flex: 1 }} testID="quiz-previous" title="Back" variant="tinted" />
        {isLast ? (
          <NativeButton onPress={() => void submit()} style={{ flex: 1 }} testID="quiz-submit" title={remaining > 0 ? `Submit (${remaining} left)` : 'Submit'} variant="filled" />
        ) : (
          <NativeButton onPress={() => { const next = Math.min(questions.length - 1, index + 1); setIndex(next); persistAttempt(selections, next); }} style={{ flex: 1 }} testID="quiz-next" title="Next" variant="filled" />
        )}
      </View>
    </View>
  );
}
