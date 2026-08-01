import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { WebView } from 'react-native-webview';

import { CenteredEmptyState } from '@/components/screen-layout';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import { getLearningProgressRepository } from '@/features/learning/data/learning-progress-repository';
import type { LearningSubtopic } from '@/features/learning/data/learning-types';
import {
  buildLessonReaderHtml,
  createLessonCompletionGate,
  getLessonCompletionFeedback,
  getLessonProgressUnavailableFeedback,
  getLearningReaderFontSize,
  hasReadableLessonContent,
  isLessonEndReached,
} from '@/features/learning/learning-lesson-reader-utils';

export function LearningLessonReaderScreen() {
  const { topicId, subtopicId } = useLocalSearchParams<{ topicId: string; subtopicId: string }>();
  const database = useSQLiteContext();
  const [lesson, setLesson] = useState<LearningSubtopic | null | undefined>();
  const [completed, setCompleted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [webViewError, setWebViewError] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);
  const completionGate = useRef(createLessonCompletionGate());
  const parsedTopicId = Number(topicId);
  const parsedSubtopicId = Number(subtopicId);
  const { fontScale } = useWindowDimensions();

  const loadLesson = useCallback(() => {
    let active = true;
    completionGate.current.reset();
    setLesson(undefined);
    setLoadError(null);
    setCompletionError(null);
    setWebViewError(false);
    void (async () => {
      const content = createLearningContentRepository(database);
      const [resolvedLesson, resolvedTopic] = await Promise.all([content.getSubtopic(parsedSubtopicId), content.getTopic(parsedTopicId)]);
      if (!resolvedLesson || resolvedLesson.topicId !== parsedTopicId) { if (active) setLesson(null); return; }
      if (!hasReadableLessonContent(resolvedLesson.contentBody)) { if (active) setLoadError('This lesson has no readable content.'); return; }
      if (!active) return;
      setLesson(resolvedLesson);
      setCompleted(false);
      try {
        const progress = await getLearningProgressRepository();
        await progress.saveLastReadLesson({ topicId: parsedTopicId, topicName: resolvedTopic?.topicName ?? 'React Native', subtopicId: resolvedLesson.subtopicId, subtopicName: resolvedLesson.subtopicName });
        const isCompleted = await progress.isLessonCompleted(parsedTopicId, resolvedLesson.subtopicId);
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
      await (await getLearningProgressRepository()).markLessonCompleted({ topicId: parsedTopicId, subtopicId: lesson.subtopicId, contentTitle: lesson.subtopicName });
      setCompleted(true);
    } catch {
      completionGate.current.reset();
      setCompletionError('Unable to save completion. Please try again.');
    }
  };

  if (loadError) return <CenteredEmptyState><Text variant="titleMedium">Lesson unavailable</Text><Text selectable>{loadError}</Text><Button mode="contained" onPress={retryLesson}>Try again</Button></CenteredEmptyState>;
  if (lesson === undefined) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading lesson" /></CenteredEmptyState>;
  if (!lesson) return <CenteredEmptyState><Text>This lesson is unavailable.</Text></CenteredEmptyState>;
  if (webViewError) return <CenteredEmptyState><Text variant="titleMedium">Lesson could not be displayed</Text><Text selectable>The lesson content is saved offline, but the reader failed to render it.</Text><Button mode="contained" onPress={() => { setWebViewError(false); setWebViewKey((value) => value + 1); }}>Try again</Button></CenteredEmptyState>;
  const completionFeedback = getLessonCompletionFeedback(completed);
  return <View testID="lesson-reader-ready" style={{ flex: 1 }}><Stack.Screen options={{ title: lesson.subtopicName }} /><WebView key={webViewKey} originWhitelist={['*']} source={{ html: buildLessonReaderHtml(lesson.contentBody, getLearningReaderFontSize(fontScale)) }} onError={() => setWebViewError(true)} onScroll={({ nativeEvent }) => { if (isLessonEndReached({ contentOffsetY: nativeEvent.contentOffset.y, viewportHeight: nativeEvent.layoutMeasurement.height, contentHeight: nativeEvent.contentSize.height })) void markCompleted(); }} /><View style={{ gap: 8, padding: 12 }}><Button mode={completed ? 'outlined' : 'contained'} disabled={completed} onPress={() => void markCompleted()}>{completed ? 'Completed' : 'Mark lesson complete'}</Button>{completionFeedback ? <Text accessibilityLiveRegion="polite" selectable>{completionFeedback}</Text> : null}{completionError ? <Text accessibilityLiveRegion="polite" selectable>{completionError}</Text> : null}</View></View>;
}
