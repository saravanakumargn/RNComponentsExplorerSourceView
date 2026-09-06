import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { NativeText } from '@/components/native-ui/native-text';
import { CenteredEmptyState } from '@/components/screen-layout';
import { ContentDemoLinks } from '@/features/learning/content-demo-links';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import type { ContentDemo, InterviewFollowup, InterviewQuestion } from '@/features/learning/data/learning-types';
import { GlossaryPopover } from '@/features/learning/glossary-popover';
import { buildInterviewAnswerDocument } from '@/features/learning/interview-answer-document';
import { NativeMarkdownReader } from '@/features/learning/native-markdown-reader';
import { useGlossaryReader } from '@/features/learning/use-glossary-reader';

/**
 * One interview answer, read.
 *
 * Split out of `interview-prep-screen` so the SwiftUI index and list screens
 * can replace their Paper siblings on iOS without dragging the reader with
 * them. This stays React Native on every platform: it is the enriched-markdown
 * pipeline with glossary popovers and demo links layered on, none of which has
 * a SwiftUI equivalent worth reaching for.
 */
export function InterviewReaderScreen() {
  const { questionId } = useLocalSearchParams<{ questionId: string }>();
  const database = useSQLiteContext();
  const [item, setItem] = useState<InterviewQuestion | null | undefined>();
  const [demos, setDemos] = useState<ContentDemo[]>([]);
  const [followups, setFollowups] = useState<InterviewFollowup[]>([]);
  const { activeTerm, dismissTerm, linkedMarkdown, onLinkPress } = useGlossaryReader(item ? buildInterviewAnswerDocument({ question: item, followups }) : '');

  useEffect(() => {
    const content = createLearningContentRepository(database);
    void content.getInterviewQuestion(Number(questionId)).then(setItem).catch(() => setItem(null));
    void content.getDemosForContent('interview_question', Number(questionId)).then(setDemos).catch(() => undefined);
    void content.getInterviewFollowups(Number(questionId)).then(setFollowups).catch(() => setFollowups([]));
  }, [database, questionId]);

  if (item === undefined) return <CenteredEmptyState><ActivityIndicator /></CenteredEmptyState>;
  if (!item) return <CenteredEmptyState><NativeText tone="secondary">This question is unavailable.</NativeText></CenteredEmptyState>;

  return (
    <View testID="interview-reader-ready" style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Interview Prep' }} />
      <GlossaryPopover term={activeTerm} onDismiss={dismissTerm} />
      <View style={{ flex: 1 }}>
        <NativeMarkdownReader markdown={linkedMarkdown} onLinkPress={onLinkPress} />
      </View>
      <ContentDemoLinks demos={demos} />
    </View>
  );
}
