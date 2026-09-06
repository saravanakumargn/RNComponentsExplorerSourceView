import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { NativeText } from '@/components/native-ui/native-text';
import { CenteredEmptyState } from '@/components/screen-layout';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import { NativeMarkdownReader } from '@/features/learning/native-markdown-reader';
import type { Faq } from '@/features/learning/data/learning-types';

export function FaqReaderScreen() {
  const { faqId } = useLocalSearchParams<{ faqId: string }>();
  const database = useSQLiteContext();
  const [faq, setFaq] = useState<Faq | null | undefined>();
  useEffect(() => { void createLearningContentRepository(database).getFaq(Number(faqId)).then(setFaq).catch(() => setFaq(null)); }, [database, faqId]);
  if (faq === undefined) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading FAQ answer" /></CenteredEmptyState>;
  if (!faq) return <CenteredEmptyState><NativeText tone="secondary">This FAQ answer is unavailable.</NativeText></CenteredEmptyState>;
  return <View testID="faq-reader-ready" style={{ flex: 1 }}><Stack.Screen options={{ title: 'FAQ' }} /><NativeMarkdownReader markdown={`## ${faq.question}\n\n${faq.explanation}`} /></View>;
}
