import { Link } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Card, Chip, ProgressBar, Text } from 'react-native-paper';

import { CenteredEmptyState } from '@/components/screen-layout';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import { getLearningProgressRepository } from '@/features/learning/data/learning-progress-repository';
import type { LearningTopic } from '@/features/learning/data/learning-types';
import { learningProgressPercent, learningTopicState } from '@/features/learning/learning-progress-summary';

type TopicProgress = LearningTopic & { completed: number; percent: number; state: ReturnType<typeof learningTopicState> };

export function LearningPathScreen() {
  const database = useSQLiteContext();
  const [topics, setTopics] = useState<TopicProgress[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const [content, progress] = await Promise.all([createLearningContentRepository(database).getTopics(), getLearningProgressRepository()]);
        const rows = await Promise.all(content.map(async (topic) => {
          const completed = (await progress.getCompletedLessonsForTopic(topic.topicId)).length;
          return { ...topic, completed, percent: learningProgressPercent(completed, topic.lessonCount), state: learningTopicState(completed, topic.lessonCount) };
        }));
        if (active) setTopics(rows);
      } catch (cause) { if (active) setError(cause instanceof Error ? cause : new Error('Learning Path is unavailable.')); }
    })();
    return () => { active = false; };
  }, [database]);

  if (error) return <CenteredEmptyState><Text variant="titleMedium">Learning Path is unavailable</Text><Text selectable>{error.message}</Text></CenteredEmptyState>;
  if (!topics) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading Learning Path" /></CenteredEmptyState>;
  if (topics.length === 0) return <CenteredEmptyState><Text>No learning topics are available.</Text></CenteredEmptyState>;

  return <FlatList testID="learning-path-ready" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ gap: 10, padding: 16, paddingBottom: 32 }} data={topics} keyExtractor={(item) => String(item.topicId)} ListHeaderComponent={<View style={{ gap: 6, paddingBottom: 8 }}><Text variant="labelLarge" style={{ letterSpacing: 0.8 }}>YOUR CURRICULUM</Text><Text variant="headlineSmall">Learn in a clear sequence.</Text><Text selectable variant="bodyMedium">Every lesson is saved on your device, so your path and progress are ready offline.</Text></View>} renderItem={({ item }) => (
    <Link href={{ pathname: '/learning-path/[topicId]', params: { topicId: item.topicId } }} asChild>
      <Pressable accessibilityRole="button" accessibilityLabel={`${item.topicName}, ${item.state}, ${item.completed} of ${item.lessonCount} complete`} accessibilityHint="Opens topic lessons" style={{ minHeight: 44 }}>
        <Card mode="outlined" style={{ borderCurve: 'continuous' }}><Card.Content style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 14 }}><View style={{ alignItems: 'center', backgroundColor: item.completed === item.lessonCount ? '#E4F5EA' : '#EEF4FF', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 }}><MaterialIcons accessible={false} color={item.completed === item.lessonCount ? '#18723A' : '#005AC1'} name={item.completed === item.lessonCount ? 'check' : 'menu-book'} size={21} /></View><View style={{ flex: 1, gap: 6 }}><View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}><Text style={{ flex: 1 }} variant="titleMedium">{item.topicName}</Text><Chip compact>{item.state.replace('-', ' ')}</Chip></View><Text selectable variant="bodySmall">{item.completed} of {item.lessonCount} lessons · {item.percent}% complete</Text><ProgressBar accessibilityLabel={`${item.percent}% complete`} progress={item.percent / 100} /></View><MaterialIcons accessible={false} color="#56657A" name="chevron-right" size={25} /></Card.Content></Card>
      </Pressable>
    </Link>
  )} />;
}
