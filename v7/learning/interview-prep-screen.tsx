import { ContentUnavailableView, List, ProgressView, Section, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, listStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { NativeNavRow } from '@/components/native-ui/native-row.ios';
import { NativeScreen } from '@/components/native-ui/native-screen';
import { NATIVE_TINT } from '@/components/native-ui/native-tokens';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import type { InterviewLevelCount, InterviewQuestion } from '@/features/learning/data/learning-types';
import { getFreeItemCount, isItemUnlocked } from '@/features/learning/learning-access-policy';
import { getLearningNavigationAccessibility } from '@/features/learning/learning-navigation-accessibility';
import { usePaywall } from '@/features/purchases/paywall-provider';
import { useSubscription } from '@/features/purchases/use-subscription';

/** The reader stays React Native on every platform — see its own file for why. */
export { InterviewReaderScreen } from '@/features/learning/interview-reader-screen';

const SECONDARY = { type: 'hierarchical', style: 'secondary' } as const;
const LOCKED = '#8E8E93';

const names = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' } as const;

/** A level's own hue, so the three are told apart before they are read. */
const LEVEL_TINTS = { 1: '#34C759', 2: '#FF9500', 3: '#FF2D55' } as const;

export function InterviewPrepScreen() {
  const database = useSQLiteContext();
  const router = useRouter();
  const [items, setItems] = useState<InterviewLevelCount[] | null>(null);

  useEffect(() => {
    void createLearningContentRepository(database).getInterviewLevelCounts().then(setItems);
  }, [database]);

  if (!items) {
    return (
      <NativeScreen>
        <VStack spacing={12}>
          <ProgressView />
          <Text modifiers={[foregroundStyle(SECONDARY)]}>Loading interview prep…</Text>
        </VStack>
      </NativeScreen>
    );
  }

  return (
    <NativeScreen testID="interview-prep-ready">
      <List modifiers={[listStyle('insetGrouped')]}>
        <Section
          footer={
            <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(SECONDARY)]}>
              Choose a level and work through focused React Native questions at your own pace.
            </Text>
          }
          title="Practice with intent"
        >
          {items.map((item) => (
            <NativeNavRow
              caption={`${item.count.toLocaleString('en-US')} questions`}
              key={item.level}
              label={getLearningNavigationAccessibility({ title: `${names[item.level]}, ${item.count} questions`, destination: 'interview questions' })}
              onPress={() => router.push({ pathname: '/interview-prep/[level]', params: { level: item.level } })}
              symbol="graduationcap.fill"
              testID={`interview-level-${item.level}`}
              tint={LEVEL_TINTS[item.level] ?? NATIVE_TINT}
              title={names[item.level]}
            />
          ))}
        </Section>
      </List>
    </NativeScreen>
  );
}

/**
 * The questions at one level, with the free ones open and the rest behind the
 * one-time unlock. Locked rows open the shared paywall rather than navigating,
 * matching what the Paper `LearningRowLink` did.
 */
export function InterviewListScreen() {
  const { level } = useLocalSearchParams<{ level: string }>();
  const parsed = Number(level) as 1 | 2 | 3;
  const database = useSQLiteContext();
  const router = useRouter();
  const { openPaywall } = usePaywall();
  const { learningUnlocked } = useSubscription();
  const [items, setItems] = useState<InterviewQuestion[] | null>(null);

  useEffect(() => {
    void createLearningContentRepository(database).getInterviewQuestions(parsed).then(setItems);
  }, [database, parsed]);

  if (!items) {
    return (
      <NativeScreen>
        <VStack spacing={12}>
          <ProgressView />
          <Text modifiers={[foregroundStyle(SECONDARY)]}>Loading questions…</Text>
        </VStack>
      </NativeScreen>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: names[parsed] ?? 'Interview Prep' }} />
        <NativeScreen>
          <ContentUnavailableView
            description="This level has no published questions yet."
            systemImage="graduationcap"
            title="Nothing here yet"
          />
        </NativeScreen>
      </>
    );
  }

  const freeCount = getFreeItemCount(items.length);

  return (
    <>
      <Stack.Screen options={{ title: names[parsed] ?? 'Interview Prep' }} />
      <NativeScreen testID="interview-list-ready">
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section
            footer={
              freeCount > 0 ? (
                <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(SECONDARY)]}>
                  {freeCount === 1 ? 'The first question is open to read.' : `The first ${freeCount} questions are open to read.`} The one-time library unlock opens the rest.
                </Text>
              ) : undefined
            }
          >
            {items.map((question, index) => {
              const unlocked = isItemUnlocked(index, items.length, learningUnlocked);
              const href = { pathname: '/interview-prep/read/[questionId]', params: { questionId: question.questionId } } as const;

              return (
                <NativeNavRow
                  caption={unlocked ? 'Available offline' : 'Locked'}
                  key={question.questionId}
                  label={getLearningNavigationAccessibility({ title: question.question, destination: 'interview question', locked: !unlocked })}
                  onPress={() => (unlocked ? router.push(href) : openPaywall('premium_interview_questions_list'))}
                  symbol={unlocked ? 'quote.bubble.fill' : 'lock.fill'}
                  testID={`interview-item-${index}`}
                  tint={unlocked ? NATIVE_TINT : LOCKED}
                  title={question.question}
                  trailingSymbol={unlocked ? undefined : 'lock.fill'}
                />
              );
            })}
          </Section>
        </List>
      </NativeScreen>
    </>
  );
}
