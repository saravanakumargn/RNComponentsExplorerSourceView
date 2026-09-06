import { ContentUnavailableView, List, ProgressView, Section, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, listStyle } from '@expo/ui/swift-ui/modifiers';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { NativeNavRow } from '@/components/native-ui/native-row.ios';
import { NativeScreen } from '@/components/native-ui/native-screen';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import { getLearningProgressRepository } from '@/features/learning/data/learning-progress-repository';
import type { Quiz, QuizAttempt } from '@/features/learning/data/learning-types';
import { getLearningNavigationAccessibility } from '@/features/learning/learning-navigation-accessibility';
import { getQuizAccess } from '@/features/learning/quiz-access';
import { formatBestAttempt, hasPassedQuiz } from '@/features/learning/quiz-scoring';
import { usePaywall } from '@/features/purchases/paywall-provider';
import { useSubscription } from '@/features/purchases/use-subscription';

/** Taking a quiz stays React Native — see its own file for why. */
export { QuizRunnerScreen } from '@/features/learning/quiz-runner-screen';

const SECONDARY = { type: 'hierarchical', style: 'secondary' } as const;
const LOCKED = '#8E8E93';
const PASSED = '#34C759';

/**
 * The test parts, in order, with each one's best attempt.
 *
 * Three access states, not two, and they are not interchangeable: a premium
 * part opens the paywall, a part gated behind a prerequisite opens nothing at
 * all. The Paper row expressed the second as an empty `paywallSource`, which
 * left its press doing nothing; the same distinction is explicit here.
 */
export function QuizListScreen() {
  const database = useSQLiteContext();
  const router = useRouter();
  const { openPaywall } = usePaywall();
  const { learningUnlocked } = useSubscription();
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const [best, setBest] = useState<Record<number, QuizAttempt>>({});

  const load = useCallback(() => {
    let active = true;
    void (async () => {
      const list = await createLearningContentRepository(database).getQuizzes();
      if (active) setQuizzes(list);
      try {
        const attempts = await (await getLearningProgressRepository()).getBestQuizAttempts();
        if (active) setBest(Object.fromEntries(attempts.map((attempt) => [attempt.quizId, attempt])));
      } catch {
        // A quiz is still takeable when past results cannot be read.
        if (active) setBest({});
      }
    })().catch(() => { if (active) setQuizzes([]); });
    return () => { active = false; };
  }, [database]);

  /**
   * Reload on focus, not only on mount: finishing a quiz and coming back here
   * must show the attempt that was just recorded, which a mount-only load
   * misses because this screen stays mounted underneath the quiz.
   */
  useFocusEffect(load);

  if (!quizzes) {
    return (
      <NativeScreen>
        <VStack spacing={12}>
          <ProgressView />
          <Text modifiers={[foregroundStyle(SECONDARY)]}>Loading quizzes…</Text>
        </VStack>
      </NativeScreen>
    );
  }

  if (quizzes.length === 0) {
    return (
      <NativeScreen testID="quiz-list-empty">
        <ContentUnavailableView
          description="No published track has a quiz in this release."
          systemImage="checkmark.circle"
          title="No quizzes yet"
        />
      </NativeScreen>
    );
  }

  const quizzesById = Object.fromEntries(quizzes.map((quiz) => [quiz.quizId, quiz]));

  return (
    <NativeScreen testID="quiz-list-ready">
      <List modifiers={[listStyle('insetGrouped')]}>
        <Section
          footer={
            <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(SECONDARY)]}>
              Every test part has 15 fixed questions. The order changes each attempt, results are saved on this device, and passing unlocks the required next parts.
            </Text>
          }
          title="Check what stuck"
        >
          {quizzes.map((quiz, index) => {
            const badge = formatBestAttempt(best[quiz.quizId], quiz.passThreshold);
            const access = getQuizAccess(quiz, { index, total: quizzes.length, learningUnlocked, attempts: best, quizzesById });
            const unlocked = access === 'available';
            const detail = access === 'premium'
              ? 'Premium test part'
              : access === 'prerequisite'
                ? 'Pass the prerequisite first'
                : `Level ${quiz.level} · Part ${quiz.part}`;
            const passed = hasPassedQuiz(best[quiz.quizId], quiz.passThreshold);

            return (
              <NativeNavRow
                caption={`${quiz.questionCount} questions · pass at ${quiz.passThreshold}% · ${detail}${badge ? ` · ${badge}` : ''}`}
                description={quiz.trackTitle}
                key={quiz.quizId}
                label={getLearningNavigationAccessibility({
                  title: `${quiz.title}, ${quiz.questionCount} questions${badge ? `, ${badge}` : ''}`,
                  destination: unlocked ? 'quiz' : 'unlock options',
                  locked: !unlocked,
                })}
                onPress={() => {
                  if (unlocked) { router.push({ pathname: '/quizzes/[quizId]', params: { quizId: quiz.quizId } }); return; }
                  // A prerequisite lock has nothing to sell — it is waiting on
                  // the reader, not on a purchase — so it opens nothing.
                  if (access === 'premium') openPaywall('premium_quiz_part');
                }}
                symbol={passed ? 'checkmark.seal.fill' : unlocked ? 'checkmark.circle.fill' : 'lock.fill'}
                testID={`quiz-item-${index}`}
                tint={passed ? PASSED : unlocked ? '#FF9500' : LOCKED}
                title={quiz.title}
                trailingSymbol={unlocked ? undefined : 'lock.fill'}
              />
            );
          })}
        </Section>
      </List>
    </NativeScreen>
  );
}
