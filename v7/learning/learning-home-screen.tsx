import { Link, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Button, Card, ProgressBar, Text } from 'react-native-paper';

import { ScreenLayout } from '@/components/screen-layout';
import { learningAreas } from '@/features/learning/learning-areas';
import { getLearningNavigationAccessibility } from '@/features/learning/learning-navigation-accessibility';
import { useLearningHome } from '@/features/learning/use-learning-home';

export function LearningHomeScreen() {
  const { data, error, refresh } = useLearningHome();
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  return (
    <ScreenLayout testID="maestro-learning-home-ready">
      <View style={{ gap: 8, paddingTop: 4 }}>
        <Text variant="labelLarge" style={{ letterSpacing: 0.8 }}>RN LEARNING</Text>
        <Text variant="headlineMedium">Build skills that ship.</Text>
        <Text selectable variant="bodyLarge">A focused, offline React Native curriculum you can pick up whenever you have time.</Text>
      </View>
      {!data && !error ? <ActivityIndicator accessibilityLabel="Loading learning progress" /> : null}
      {error ? (
        <Card mode="outlined" accessibilityRole="alert">
          <Card.Content style={{ gap: 8 }}>
            <Text variant="titleMedium">Learning content is unavailable</Text>
            <Text selectable variant="bodyMedium">{error.message}</Text>
            <Button onPress={refresh}>Try again</Button>
          </Card.Content>
        </Card>
      ) : null}
      {data?.resumeLesson ? (
        <Card mode="contained" style={{ borderCurve: 'continuous' }}>
          <Card.Content style={{ gap: 12, paddingVertical: 18 }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
              <MaterialIcons accessible={false} name="play-circle-outline" size={20} />
              <Text variant="labelLarge" style={{ letterSpacing: 0.7 }}>CONTINUE WHERE YOU LEFT OFF</Text>
            </View>
            <Text variant="titleLarge">{data.resumeLesson.subtopicName}</Text>
            <Text variant="bodyMedium">{data.resumeLesson.topicName} · {data.progressPercent}% complete</Text>
            <ProgressBar progress={data.progressPercent / 100} accessibilityLabel={`${data.progressPercent}% complete`} />
            <Link href={{ pathname: '/learning-path/[topicId]', params: { topicId: data.resumeLesson.topicId } }} asChild>
              <Button mode="contained" accessibilityLabel={`Resume ${data.resumeLesson.subtopicName}`}>Resume your study</Button>
            </Link>
          </Card.Content>
        </Card>
      ) : null}
      {data && !data.resumeLesson ? (
        <Card mode="outlined">
          <Card.Content style={{ gap: 12, paddingVertical: 18 }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
              <View style={{ alignItems: 'center', backgroundColor: '#E8F1FF', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 }}><MaterialIcons accessible={false} color="#005AC1" name="offline-pin" size={20} /></View>
              <View style={{ flex: 1, gap: 2 }}><Text variant="titleMedium">Ready when you are</Text><Text selectable variant="bodySmall">{data.totalLessons} lessons available offline</Text></View>
            </View>
            <Text variant="bodyMedium">Start with the foundations, then keep your place automatically as you learn.</Text>
            <Link href="/learning-path" asChild><Button mode="contained">Browse Learning Path</Button></Link>
          </Card.Content>
        </Card>
      ) : null}
      {data ? (
        <View accessibilityLabel={`${data.completedLessons} of ${data.totalLessons} lessons completed`} style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
          <MaterialIcons accessible={false} color="#3F4D5F" name="offline-pin" size={18} />
          <Text selectable variant="bodySmall">Saved on this device · {data.completedLessons} of {data.totalLessons} lessons completed</Text>
        </View>
      ) : null}
      <Text variant="titleMedium" style={{ marginTop: 4 }}>Explore your library</Text>
      {learningAreas.map((area) => (
        <Link
          key={area.id}
          href={{ pathname: '/[area]', params: { area: area.id } }}
          asChild
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={getLearningNavigationAccessibility({ title: area.title, destination: area.title })}
            accessibilityHint={`Opens ${area.title}`}
            style={{ minHeight: 44 }}
          >
            <Card mode="outlined" style={{ borderCurve: 'continuous' }}>
              <Card.Content style={{ alignItems: 'center', flexDirection: 'row', gap: 12, paddingVertical: 14 }}>
                <View style={{ alignItems: 'center', backgroundColor: '#EEF4FF', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 }}><MaterialIcons accessible={false} color="#005AC1" name={area.icon} size={23} /></View>
                <View style={{ flex: 1, gap: 3 }}><Text variant="titleMedium">{area.title}</Text><Text selectable numberOfLines={2} variant="bodySmall">{area.description}</Text></View>
                <MaterialIcons accessible={false} color="#56657A" name="chevron-right" size={26} />
              </Card.Content>
            </Card>
          </Pressable>
        </Link>
      ))}
      <Text selectable style={{ paddingTop: 4 }} variant="bodySmall">Content is curated for education and may not reflect the latest React Native or Expo changes.</Text>
    </ScreenLayout>
  );
}
