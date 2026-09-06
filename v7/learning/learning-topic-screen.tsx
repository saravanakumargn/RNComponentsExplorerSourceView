import { ContentUnavailableView, List, ProgressView, Section, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, listStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { NativeNavRow } from '@/components/native-ui/native-row.ios';
import { NativeScreen } from '@/components/native-ui/native-screen';
import { NATIVE_TINT } from '@/components/native-ui/native-tokens';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import { getLearningProgressRepository } from '@/features/learning/data/learning-progress-repository';
import type { LearningSubtopic, LearningTopic } from '@/features/learning/data/learning-types';
import { isItemUnlocked } from '@/features/learning/learning-access-policy';
import {
  getLessonAccessibilityLabel,
  groupLessonsIntoSections,
} from '@/features/learning/learning-topic-sections';
import { usePaywall } from '@/features/purchases/paywall-provider';
import { useSubscription } from '@/features/purchases/use-subscription';

type LessonRow = LearningSubtopic & { completed: boolean };

const SECONDARY = { type: 'hierarchical', style: 'secondary' } as const;
const DONE = '#34C759';
const LOCKED = '#8E8E93';

/**
 * A topic's lessons, grouped by level.
 *
 * The section header stops being a rounded grey card drawn by hand and becomes
 * the list's own header, which is what puts the lesson rows in a single
 * continuous group rather than a run of separate cards.
 *
 * Locked rows keep the routing the Paper `LearningRowLink` established: they do
 * not navigate, they open the one shared paywall, and they end in a lock rather
 * than a chevron, because a chevron promises the thing behind it.
 */
export function LearningTopicScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const database = useSQLiteContext();
  const router = useRouter();
  const { openPaywall } = usePaywall();
  const { learningUnlocked } = useSubscription();
  const [topic, setTopic] = useState<LearningTopic | null | undefined>();
  const [lessons, setLessons] = useState<LessonRow[] | null>(null);
  const id = Number(topicId);

  const loadTopic = useCallback(() => {
    let active = true;
    void (async () => {
      const content = createLearningContentRepository(database);
      const [resolvedTopic, subtopics, progress] = await Promise.all([content.getTopic(id), content.getSubtopicsForTopic(id), getLearningProgressRepository()]);
      const completed = new Set((await progress.getCompletedLessons()).map((lesson) => lesson.lessonId));
      if (active) { setTopic(resolvedTopic); setLessons(subtopics.map((lesson) => ({ ...lesson, completed: completed.has(lesson.subtopicId) }))); }
    })().catch(() => { if (active) { setTopic(null); setLessons([]); } });
    return () => { active = false; };
  }, [database, id]);

  useFocusEffect(loadTopic);

  if (!Number.isInteger(id) || topic === null) {
    return (
      <NativeScreen>
        <ContentUnavailableView
          description="That learning topic is unavailable."
          systemImage="exclamationmark.triangle"
          title="Not available"
        />
      </NativeScreen>
    );
  }

  if (!topic || !lessons) {
    return (
      <NativeScreen>
        <VStack spacing={12}>
          <ProgressView />
          <Text modifiers={[foregroundStyle(SECONDARY)]}>Loading lessons…</Text>
        </VStack>
      </NativeScreen>
    );
  }

  const sections = groupLessonsIntoSections(lessons);

  return (
    <>
      <Stack.Screen options={{ title: topic.topicName }} />
      <NativeScreen testID="learning-topic-ready">
        <List modifiers={[listStyle('insetGrouped')]}>
          {sections.length === 0 ? (
            <Section>
              <Text modifiers={[foregroundStyle(SECONDARY)]}>
                No lessons are available for this topic.
              </Text>
            </Section>
          ) : null}

          {sections.map((section, sectionIndex) => (
            <Section
              footer={
                sectionIndex === sections.length - 1 ? (
                  <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(SECONDARY)]}>
                    Locked lessons keep their place in the curriculum.
                  </Text>
                ) : undefined
              }
              key={section.title}
              // The level name alone. The lesson count went here at first and
              // was the wrong place for it: every row already carries its own
              // state, and a header is for saying which group this is.
              title={section.title}
            >
              {section.data.map((lesson, index) => {
                const unlocked = isItemUnlocked(index, section.data.length, learningUnlocked);
                const href = { pathname: '/learning-path/[topicId]/[subtopicId]', params: { topicId: id, subtopicId: lesson.subtopicId } } as const;

                return (
                  <NativeNavRow
                    caption={unlocked ? (lesson.completed ? 'Completed' : 'Available') : 'Locked'}
                    description={lesson.subtopicDescription ?? undefined}
                    key={lesson.subtopicId}
                    label={getLessonAccessibilityLabel({ lesson, unlocked })}
                    onPress={() => (unlocked ? router.push(href) : openPaywall('premium_lesson'))}
                    symbol={lesson.completed ? 'checkmark.circle.fill' : unlocked ? 'book.fill' : 'lock.fill'}
                    testID={`lesson-item-${index}`}
                    tint={lesson.completed ? DONE : unlocked ? NATIVE_TINT : LOCKED}
                    title={lesson.subtopicName}
                    trailingSymbol={unlocked ? undefined : 'lock.fill'}
                  />
                );
              })}
            </Section>
          ))}
        </List>
      </NativeScreen>
    </>
  );
}
