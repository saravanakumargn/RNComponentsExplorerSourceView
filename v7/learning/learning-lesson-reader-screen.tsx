import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { NativeButton } from '@/components/native-ui/native-button';
import { NativeText } from '@/components/native-ui/native-text';
import { CenteredEmptyState } from '@/components/screen-layout';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import { GlossaryPopover } from '@/features/learning/glossary-popover';
import { useGlossaryReader } from '@/features/learning/use-glossary-reader';
import { getLearningProgressRepository } from '@/features/learning/data/learning-progress-repository';
import type { ContentDemo, LearningSubtopic } from '@/features/learning/data/learning-types';
import { ContentDemoLinks } from '@/features/learning/content-demo-links';
import { NativeMarkdownReader } from '@/features/learning/native-markdown-reader';
import {
  createLessonCompletionGate,
  getLessonCompletionFeedback,
  getLessonProgressUnavailableFeedback,
  hasReadableLessonContent,
} from '@/features/learning/learning-lesson-reader-utils';

export function LearningLessonReaderScreen() {
  const { topicId, subtopicId } = useLocalSearchParams<{ topicId: string; subtopicId: string }>();
  const database = useSQLiteContext();
  const [lesson, setLesson] = useState<LearningSubtopic | null | undefined>();
  const [demos, setDemos] = useState<ContentDemo[]>([]);
  const [completed, setCompleted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const completionGate = useRef(createLessonCompletionGate());
  const parsedTopicId = Number(topicId);
  const parsedSubtopicId = Number(subtopicId);
  const { activeTerm, dismissTerm, linkedMarkdown, onLinkPress } = useGlossaryReader(lesson?.contentBody ?? '');

  const loadLesson = useCallback(() => {
    let active = true;
    completionGate.current.reset();
    setLesson(undefined);
    setLoadError(null);
    setCompletionError(null);
    setDemos([]);
    void (async () => {
      const content = createLearningContentRepository(database);
      const [resolvedLesson, resolvedTopic] = await Promise.all([content.getSubtopic(parsedSubtopicId), content.getTopic(parsedTopicId)]);
      if (!resolvedLesson || resolvedLesson.topicId !== parsedTopicId) { if (active) setLesson(null); return; }
      if (!hasReadableLessonContent(resolvedLesson.contentBody)) { if (active) setLoadError('This lesson has no readable content.'); return; }
      if (!active) return;
      setLesson(resolvedLesson);
      setCompleted(false);
      // A missing demo list is not a missing lesson, so it is read separately
      // and its failure never reaches the reader.
      void content.getDemosForContent('lesson', resolvedLesson.subtopicId)
        .then((links) => { if (active) setDemos(links); })
        .catch(() => undefined);
      try {
        const progress = await getLearningProgressRepository();
        await progress.saveLastReadLesson({ topicId: parsedTopicId, topicName: resolvedTopic?.topicName ?? 'React Native', subtopicId: resolvedLesson.subtopicId, subtopicName: resolvedLesson.subtopicName });
        const isCompleted = await progress.isLessonCompleted(resolvedLesson.subtopicId);
        if (active) { setCompleted(isCompleted); if (isCompleted) completionGate.current.tryBegin(); }
      } catch {
        if (active) setCompletionError(getLessonProgressUnavailableFeedback());
      }
    })().catch(() => { if (active) setLoadError('Unable to load this lesson. Check your local content and try again.'); });
    return () => { active = false; };
  }, [database, parsedSubtopicId, parsedTopicId]);

  useEffect(() => loadLesson(), [loadLesson]);

  const retryLesson = () => { loadLesson(); };

  const markCompleted = async () => {
    if (!lesson || !completionGate.current.tryBegin()) return;
    setCompletionError(null);
    try {
      await (await getLearningProgressRepository()).markLessonCompleted(lesson.subtopicId);
      setCompleted(true);
    } catch {
      completionGate.current.reset();
      setCompletionError('Unable to save completion. Please try again.');
    }
  };

  if (loadError) {
    return (
      <CenteredEmptyState>
        <NativeText textStyle="headline">Lesson unavailable</NativeText>
        <NativeText selectable style={{ textAlign: 'center' }} textStyle="footnote" tone="secondary">{loadError}</NativeText>
        <NativeButton onPress={retryLesson} title="Try again" variant="filled" />
      </CenteredEmptyState>
    );
  }
  if (lesson === undefined) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading lesson" /></CenteredEmptyState>;
  if (!lesson) return <CenteredEmptyState><NativeText tone="secondary">This lesson is unavailable.</NativeText></CenteredEmptyState>;
  const completionFeedback = getLessonCompletionFeedback(completed);
  return <View testID="lesson-reader-ready" style={{ flex: 1 }}><Stack.Screen options={{ title: lesson.subtopicName }} /><GlossaryPopover term={activeTerm} onDismiss={dismissTerm} /><View style={{ flex: 1 }}><NativeMarkdownReader markdown={linkedMarkdown} onEndReached={() => void markCompleted()} onLinkPress={onLinkPress} /></View><ContentDemoLinks demos={demos} /><View style={{ gap: 8, padding: 12 }}>
      {/* The label is a Maestro anchor in every flow that finishes a lesson —
          `reset-progress.yaml` taps it by text — so both strings stay verbatim. */}
      <NativeButton
        disabled={completed}
        onPress={() => void markCompleted()}
        title={completed ? 'Completed' : 'Mark lesson complete'}
        variant={completed ? 'tinted' : 'filled'}
      />
      {completionFeedback ? <NativeText accessibilityLiveRegion="polite" selectable textStyle="footnote" tone="secondary">{completionFeedback}</NativeText> : null}
      {completionError ? <NativeText accessibilityLiveRegion="polite" selectable textStyle="footnote" tone="destructive">{completionError}</NativeText> : null}
    </View></View>;
}
