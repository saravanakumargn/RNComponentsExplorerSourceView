import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { CenteredEmptyState } from '@/components/screen-layout';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import { buildLessonReaderHtml, getLearningReaderFontSize } from '@/features/learning/learning-lesson-reader-utils';
import type { Faq } from '@/features/learning/data/learning-types';

export function FaqReaderScreen() {
  const { faqId } = useLocalSearchParams<{ faqId: string }>();
  const database = useSQLiteContext();
  const [faq, setFaq] = useState<Faq | null | undefined>();
  const { fontScale } = useWindowDimensions();
  useEffect(() => { void createLearningContentRepository(database).getFaq(Number(faqId)).then(setFaq).catch(() => setFaq(null)); }, [database, faqId]);
  if (faq === undefined) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading FAQ answer" /></CenteredEmptyState>;
  if (!faq) return <CenteredEmptyState><Text>This FAQ answer is unavailable.</Text></CenteredEmptyState>;
  return <View testID="faq-reader-ready" style={{ flex: 1 }}><Stack.Screen options={{ title: 'FAQ' }} /><WebView originWhitelist={['*']} source={{ html: buildLessonReaderHtml(`<h2>${faq.question}</h2>${faq.explanation}`, getLearningReaderFontSize(fontScale)) }} /></View>;
}
