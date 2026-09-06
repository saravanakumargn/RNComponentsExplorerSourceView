import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { NativeText } from '@/components/native-ui/native-text';
import { CenteredEmptyState } from '@/components/screen-layout';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import type { LearningLibraryTool } from '@/features/learning/data/learning-types';
import { NativeMarkdownReader } from '@/features/learning/native-markdown-reader';

/**
 * One library or tooling reference, read.
 *
 * Split out of `good-to-know-screen` so the SwiftUI category and list screens
 * can replace their Paper siblings on iOS without dragging the reader with
 * them — the same move `interview-reader-screen` made. This stays React Native
 * on every platform: it is the enriched-markdown pipeline, which has no
 * SwiftUI equivalent worth reaching for.
 *
 * Unlike the interview and lesson readers it does not layer on inline glossary
 * links. That predates this branch and is left alone here rather than changed
 * behind a conversion.
 */
export function GoodToKnowReaderScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const database = useSQLiteContext();
  const [item, setItem] = useState<LearningLibraryTool | null | undefined>();

  useEffect(() => {
    void createLearningContentRepository(database).getLibraryTool(Number(itemId)).then(setItem).catch(() => setItem(null));
  }, [database, itemId]);

  if (item === undefined) return <CenteredEmptyState><ActivityIndicator /></CenteredEmptyState>;
  if (!item) return <CenteredEmptyState><NativeText tone="secondary">This item is unavailable.</NativeText></CenteredEmptyState>;

  return (
    <View testID="good-to-know-reader-ready" style={{ flex: 1 }}>
      <Stack.Screen options={{ title: item.name }} />
      <NativeMarkdownReader markdown={`## ${item.name}\n\n${item.explanation}`} />
    </View>
  );
}
