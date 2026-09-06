import * as Clipboard from 'expo-clipboard';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { NativeButton } from '@/components/native-ui/native-button';
import { NativeCard } from '@/components/native-ui/native-card';
import { NativeListRow } from '@/components/native-ui/native-list-row';
import { NativeSearchField } from '@/components/native-ui/native-search-field';
import { NativeText } from '@/components/native-ui/native-text';

import { CenteredEmptyState, useBottomContentPadding } from '@/components/screen-layout';
import { ContentDemoLink } from '@/features/learning/content-demo-links';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import type { LearningSnippet } from '@/features/learning/data/learning-types';
import { LearningCodeBlock } from '@/features/learning/learning-code-block';
import { getFreeItemCount, isItemUnlocked } from '@/features/learning/learning-access-policy';
import { LearningEmptyState } from '@/features/learning/learning-empty-state';
import { LearningRowLink } from '@/features/learning/learning-row-link';
import { filterSnippets } from '@/features/learning/snippet-search';
import { useSubscription } from '@/features/purchases/use-subscription';

export function SnippetListScreen() {
  const database = useSQLiteContext();
  const [snippets, setSnippets] = useState<LearningSnippet[] | null>(null);
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [failedId, setFailedId] = useState<number | null>(null);
  const { learningUnlocked } = useSubscription();
  const bottomPadding = useBottomContentPadding(32);

  useEffect(() => { void createLearningContentRepository(database).getSnippets().then(setSnippets).catch(() => setSnippets([])); }, [database]);

  const visible = useMemo(() => filterSnippets(snippets ?? [], query), [snippets, query]);

  /*
   * The confirmation lives on the button rather than in a bottom snackbar: a
   * snackbar on this tab lands under the tab bar and the ad banner, so a
   * successful copy looked like nothing had happened.
   *
   * It has no timer either. A confirmation that erases itself after a few
   * seconds tells a reader who glanced away that nothing happened, and marking
   * the snippet you last took is more useful than a flash — so it stays until
   * another snippet is copied.
   */
  const copy = useCallback(async (snippet: LearningSnippet) => {
    try {
      await Clipboard.setStringAsync(snippet.code);
      setCopiedId(snippet.snippetId);
      setFailedId(null);
    } catch (error) {
      // The call site is fire-and-forget, so without this a rejection leaves no
      // state change and no message: the button just does nothing forever.
      if (error instanceof Error) console.error('[snippets] copy failed:', error.message);
      setCopiedId(null);
      setFailedId(snippet.snippetId);
    }
  }, []);

  if (!snippets) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading snippets" /></CenteredEmptyState>;

  // The lock is decided against the whole library, not the filtered view, so
  // searching can never unlock a snippet that browsing would have kept shut.
  const freeCount = getFreeItemCount(snippets.length);

  return (
    <FlatList
        testID="snippets-ready"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ gap: 10, padding: 16, paddingBottom: bottomPadding }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ gap: 8, paddingBottom: 8 }}>
            <NativeText textStyle="title2">Code worth keeping close</NativeText>
            <NativeSearchField onChangeText={setQuery} placeholder="Search snippets and code" testID="snippet-search" />
            {freeCount > 0 && !learningUnlocked ? <NativeText textStyle="footnote" tone="secondary">{freeCount === 1 ? 'The first snippet is open.' : `The first ${freeCount} snippets are open.`} The one-time library unlock opens the rest.</NativeText> : null}
          </View>
        }
        ListEmptyComponent={
          query.trim()
            ? <LearningEmptyState testID="snippets-no-match" title="No matching snippet" message={`Nothing matches "${query.trim()}". Try an identifier from the code, or a shorter search.`} />
            : <LearningEmptyState testID="snippets-empty" title="No snippets yet" message="Snippets are not part of this release. The Learning Path covers the same ground with more explanation." />
        }
        data={visible}
        // FlatList cells are pure: without extraData they keep the render they
        // had when `data` last changed, so the Copy button would never switch
        // to Copied. This is the same trap snippet 9209 warns about.
        extraData={`${copiedId}:${failedId}`}
        keyExtractor={(item) => String(item.snippetId)}
        renderItem={({ item }) => {
          const unlocked = isItemUnlocked(snippets.indexOf(item), snippets.length, learningUnlocked);
          if (!unlocked) {
            return (
              <LearningRowLink href={null} paywallSource="premium_snippets_list" testID={`snippet-locked-${item.snippetId}`} accessibilityLabel={`${item.title}, locked`} accessibilityHint="Opens unlock options">
                <NativeCard>
                  <NativeListRow caption="Locked" locked symbol="lock.fill" title={item.title} />
                </NativeCard>
              </LearningRowLink>
            );
          }
          return (
            <NativeCard style={{ gap: 8 }} testID={`snippet-${item.snippetId}`}>
                <NativeText textStyle="headline">{item.title}</NativeText>
                <NativeText selectable textStyle="footnote" tone="secondary">{item.description}</NativeText>
                <LearningCodeBlock code={item.code} flavor="commonmark" language={item.language} />
                <NativeButton
                  accessibilityLabel={`Copy the ${item.title} snippet`}
                  onPress={() => { void copy(item); }}
                  style={{ alignSelf: 'flex-start' }}
                  symbol={copiedId === item.snippetId ? 'checkmark' : failedId === item.snippetId ? 'exclamationmark.triangle' : 'doc.on.doc'}
                  title={copiedId === item.snippetId ? 'Copied' : failedId === item.snippetId ? 'Copy failed' : 'Copy'}
                />
                {item.demos.map((demo) => (
                  <ContentDemoLink key={demo.demoId} demo={demo} testID={`snippet-demo-${item.snippetId}-${demo.demoId}`} />
                ))}
            </NativeCard>
          );
        }}
    />
  );
}
