import { Link, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, SectionList, View } from 'react-native';
import { ActivityIndicator, Card, Text, useTheme } from 'react-native-paper';

import { CenteredEmptyState } from '@/components/screen-layout';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import { getLearningProgressRepository } from '@/features/learning/data/learning-progress-repository';
import type { LearningSubtopic, LearningTopic } from '@/features/learning/data/learning-types';
import { isLessonUnlocked } from '@/features/learning/learning-access-policy';
import { trackPremiumEvent } from '@/features/learning/learning-analytics';
import {
  getLessonAccessibilityLabel,
  groupLessonsIntoSections,
  type LessonWithCompletion,
} from '@/features/learning/learning-topic-sections';
import { useSubscription } from '@/features/purchases/use-subscription';

type LessonRow = LearningSubtopic & { completed: boolean };

export function LearningTopicScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const database = useSQLiteContext();
  const [topic, setTopic] = useState<LearningTopic | null | undefined>();
  const [lessons, setLessons] = useState<LessonRow[] | null>(null);
  const id = Number(topicId);
  const theme = useTheme();
  const { isSubscribed } = useSubscription();

  const loadTopic = useCallback(() => {
    let active = true;
    void (async () => {
      const content = createLearningContentRepository(database);
      const [resolvedTopic, subtopics, progress] = await Promise.all([content.getTopic(id), content.getSubtopicsForTopic(id), getLearningProgressRepository()]);
      const completed = new Set((await progress.getCompletedLessonsForTopic(id)).map((lesson) => lesson.subtopicId));
      if (active) { setTopic(resolvedTopic); setLessons(subtopics.map((lesson) => ({ ...lesson, completed: completed.has(lesson.subtopicId) }))); }
    })().catch(() => { if (active) { setTopic(null); setLessons([]); } });
    return () => { active = false; };
  }, [database, id]);

  useFocusEffect(loadTopic);

  if (!Number.isInteger(id) || topic === null) return <CenteredEmptyState><Text>That learning topic is unavailable.</Text></CenteredEmptyState>;
  if (!topic || !lessons) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading lessons" /></CenteredEmptyState>;
  const sections = groupLessonsIntoSections(lessons);
  return <><Stack.Screen options={{ title: topic.topicName }} /><SectionList<LessonWithCompletion, { title: string; data: LessonWithCompletion[] }>
    testID="learning-topic-ready"
    contentInsetAdjustmentBehavior="automatic"
    contentContainerStyle={{ gap: 10, padding: 16, paddingBottom: 32 }}
    sections={sections}
    keyExtractor={(item) => String(item.subtopicId)}
    ListHeaderComponent={<View style={{ gap: 6, paddingBottom: 8 }}><Text variant="labelLarge" style={{ letterSpacing: 0.8 }}>LEARNING PATH</Text><Text variant="headlineSmall">{topic.topicName}</Text><Text selectable variant="bodyMedium">Choose an available lesson to continue. Locked lessons keep their place in the curriculum.</Text></View>}
    ListEmptyComponent={<Text>No lessons are available for this topic.</Text>}
    renderSectionHeader={({ section }) => <View accessibilityRole="header" style={{ backgroundColor: theme.colors.surfaceVariant, borderCurve: 'continuous', borderRadius: 12, gap: 2, paddingHorizontal: 12, paddingVertical: 10 }}><Text variant="titleSmall">{section.title}</Text><Text selectable variant="bodySmall">{section.data.length} lessons</Text></View>}
    renderItem={({ item, index, section }) => {
      const unlocked = isLessonUnlocked(index, section.data.length, isSubscribed);
      const label = getLessonAccessibilityLabel({ lesson: item, unlocked });
      const status = unlocked ? item.completed ? 'Completed' : 'Available' : 'Locked';
      return <Link href={unlocked ? { pathname: '/learning-path/[topicId]/[subtopicId]', params: { topicId: id, subtopicId: item.subtopicId } } : '/subscription'} asChild><Pressable testID={`lesson-item-${index}`} accessibilityRole="button" accessibilityLabel={label} accessibilityHint={unlocked ? 'Opens lesson' : 'Opens subscription options'} onPress={unlocked ? undefined : () => trackPremiumEvent('premium_lesson')} style={{ minHeight: 44 }}><Card mode="outlined" style={{ borderCurve: 'continuous', opacity: unlocked ? 1 : 0.82 }}><Card.Content style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 13 }}><View style={{ alignItems: 'center', backgroundColor: item.completed ? '#E4F5EA' : unlocked ? '#EEF4FF' : theme.colors.surfaceVariant, borderRadius: 18, height: 36, justifyContent: 'center', width: 36 }}><MaterialIcons accessible={false} name={item.completed ? 'check' : unlocked ? 'menu-book' : 'lock-outline'} size={20} color={item.completed ? '#18723A' : unlocked ? '#005AC1' : theme.colors.onSurfaceVariant} /></View><View style={{ flex: 1, gap: 4 }}><Text selectable variant="titleMedium">{item.subtopicName}</Text>{item.subtopicDescription ? <Text selectable numberOfLines={2} variant="bodySmall">{item.subtopicDescription}</Text> : null}<Text selectable variant="labelMedium">{status}</Text></View><MaterialIcons accessible={false} name={unlocked ? 'chevron-right' : 'lock-outline'} size={24} color={theme.colors.onSurfaceVariant} /></Card.Content></Card></Pressable></Link>;
    }}
  /></>;
}
