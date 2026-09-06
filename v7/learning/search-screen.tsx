import { Link } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';

import { NativeBadge } from '@/components/native-ui/native-badge';
import { NativeCard } from '@/components/native-ui/native-card';
import { NativeSearchField } from '@/components/native-ui/native-search-field';
import { NativeText } from '@/components/native-ui/native-text';

import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import type { SearchResult } from '@/features/learning/data/learning-types';
import { InlineCodeText } from '@/features/learning/inline-code';
import { LearningEmptyState } from '@/features/learning/learning-empty-state';
import { getLearningNavigationAccessibility } from '@/features/learning/learning-navigation-accessibility';
import {
  SEARCH_MIN_QUERY_LENGTH,
  SEARCH_RESULT_LIMIT,
  formatSearchSummary,
  getSearchResultRoute,
  getSearchResultTypeLabel,
  isSearchable,
} from '@/features/learning/learning-search';

/**
 * Long enough that typing a word does not run a query per keystroke, short
 * enough that results feel like they follow the typing.
 */
const SEARCH_DEBOUNCE_MS = 180;

export function LearningSearchScreen() {
  const database = useSQLiteContext();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState<{ results: SearchResult[]; truncated: boolean } | null>(null);

  useEffect(() => {
    if (!isSearchable(query)) { setFound(null); setSearching(false); return undefined; }
    let active = true;
    setSearching(true);
    const timer = setTimeout(() => {
      void createLearningContentRepository(database).searchContent(query, SEARCH_RESULT_LIMIT)
        .then((outcome) => { if (active) { setFound(outcome); setSearching(false); } })
        .catch(() => { if (active) { setFound({ results: [], truncated: false }); setSearching(false); } });
    }, SEARCH_DEBOUNCE_MS);
    return () => { active = false; clearTimeout(timer); };
  }, [database, query]);

  return (
    <FlatList
      testID="search-ready"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ gap: 10, padding: 16, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={{ gap: 8, paddingBottom: 8 }}>
          <NativeText textStyle="title2">Find it across the library</NativeText>
          {/*
            Autocapitalise and autocorrect are off because the corpus is full of
            identifiers: iOS turns "hermes" into "Hermes" harmlessly, but it
            will also "correct" `useMemo` or `Fabric` into a word that matches
            nothing, and the reader cannot see why their search failed.
          */}
          <NativeSearchField autoFocus onChangeText={setQuery} placeholder="Search lessons, terms, questions" testID="search-input" />
          {found ? <NativeText accessibilityLiveRegion="polite" textStyle="caption" tone="secondary">{formatSearchSummary(found.results, found.truncated)}</NativeText> : null}
        </View>
      }
      ListEmptyComponent={
        !isSearchable(query)
          ? <LearningEmptyState testID="search-prompt" title="Type to search" message={`Enter at least ${SEARCH_MIN_QUERY_LENGTH} characters. Search covers lesson titles, summaries and takeaways, glossary terms, interview questions, cheat sheets, checklists, and quizzes — not the full text of a lesson.`} />
          : searching
            ? <ActivityIndicator accessibilityLabel="Searching" />
            : <LearningEmptyState testID="search-empty" title="No matches" message={`Nothing in the library matches "${query.trim()}". Try a shorter search, or a word from the topic rather than the exact phrase.`} />
      }
      data={found?.results ?? []}
      keyExtractor={(item) => `${item.itemType}:${item.itemId}`}
      renderItem={({ item, index }) => (
        <Link href={getSearchResultRoute(item)} asChild>
          <Pressable
            testID={`search-result-${index}`}
            accessibilityRole="button"
            accessibilityLabel={getLearningNavigationAccessibility({ title: `${item.title}, ${getSearchResultTypeLabel(item.itemType)}`, destination: getSearchResultTypeLabel(item.itemType) })}
            accessibilityHint="Opens this result"
            style={{ minHeight: 44 }}
          >
            <NativeCard padding={13} style={{ gap: 6 }}>
                <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
                  <NativeBadge label={getSearchResultTypeLabel(item.itemType)} />
                  <SymbolView name="chevron.right" size={13} style={{ marginLeft: 'auto' }} tintColor="#C7C7CC" weight="semibold" />
                </View>
                <InlineCodeText textStyle="headline">{item.title}</InlineCodeText>
                <InlineCodeText numberOfLines={2} textStyle="footnote" tone="secondary">{item.subtitle}</InlineCodeText>
            </NativeCard>
          </Pressable>
        </Link>
      )}
    />
  );
}
