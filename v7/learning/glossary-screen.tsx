import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { EnrichedMarkdownText } from 'react-native-enriched-markdown';
import { ActivityIndicator, FlatList, InteractionManager, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { NativeButton } from '@/components/native-ui/native-button';
import { NativeCard } from '@/components/native-ui/native-card';
import { NativeListRow } from '@/components/native-ui/native-list-row';
import { NativeSearchField } from '@/components/native-ui/native-search-field';
import { NativeText } from '@/components/native-ui/native-text';
import { getLearningAreaStyle, NATIVE_COLORS, NATIVE_TINT } from '@/components/native-ui/native-tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CenteredEmptyState } from '@/components/screen-layout';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import type { GlossaryTerm } from '@/features/learning/data/learning-types';
import { GlossaryDefinition } from '@/features/learning/glossary-popover';
import { getGlossaryNeighbours } from '@/features/learning/glossary-neighbours';
import { filterGlossaryTerms } from '@/features/learning/glossary-search';
import { LearningEmptyState } from '@/features/learning/learning-empty-state';
import { getLearningNavigationAccessibility } from '@/features/learning/learning-navigation-accessibility';
import { learningMarkdownStyle } from '@/features/learning/native-markdown-reader';

const { symbol: GLOSSARY_SYMBOL, tint: GLOSSARY_TINT } = getLearningAreaStyle('glossary');

export function GlossaryListScreen() {
  const database = useSQLiteContext();
  const [terms, setTerms] = useState<GlossaryTerm[] | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    void createLearningContentRepository(database).getGlossaryTerms().then(setTerms).catch(() => setTerms([]));
  }, [database]);

  const visible = useMemo(() => filterGlossaryTerms(terms ?? [], query), [terms, query]);
  const search = query.trim();

  if (!terms) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading glossary" /></CenteredEmptyState>;

  return (
    <FlatList
      testID="glossary-list-ready"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ gap: 10, padding: 16, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={{ gap: 8, paddingBottom: 8 }}>
          <NativeText textStyle="title2">The words, defined</NativeText>
          <NativeText selectable textStyle="footnote" tone="secondary">Every term the lessons and interview questions use, with the definition that applies in React Native.</NativeText>
          <NativeSearchField onChangeText={setQuery} placeholder="Search terms" testID="glossary-search" />
        </View>
      }
      ListEmptyComponent={
        search
          ? <LearningEmptyState testID="glossary-search-empty" title="No matching terms" message={`Nothing in the glossary matches "${search}". Try a shorter search, or browse the full list.`} />
          : <LearningEmptyState testID="glossary-list-empty" title="No terms yet" message="The glossary has no published terms in this release." />
      }
      data={visible}
      keyExtractor={(item) => String(item.termId)}
      renderItem={({ item, index }) => (
        // The search travels with the term so the entry can step through the
        // matches the reader is looking at rather than the whole alphabet.
        <Link href={{ pathname: '/glossary/[termId]', params: { termId: item.termId, ...(search ? { q: search } : {}) } }} asChild>
          <Pressable
            testID={`glossary-item-${index}`}
            accessibilityRole="button"
            accessibilityLabel={getLearningNavigationAccessibility({ title: item.term, destination: 'glossary entry' })}
            accessibilityHint="Opens the glossary entry"
            style={{ minHeight: 44 }}
          >
            <NativeCard padding={13}>
              <NativeListRow
                description={item.shortDefinition.replace(/`/g, '')}
                symbol={GLOSSARY_SYMBOL}
                tint={GLOSSARY_TINT}
                title={item.term}
              />
            </NativeCard>
          </Pressable>
        </Link>
      )}
    />
  );
}

/**
 * A glossary entry, presented as a sheet over the list that opened it.
 *
 * Most definitions are a sentence or two, which is far less than a pushed
 * screen is worth: the sheet keeps the list visible behind it, so reading five
 * terms in a row costs five taps instead of five transitions and five returns
 * to a list that has to remember where it was. Previous and next move between
 * entries in place — the sheet never stacks on itself, so one dismiss always
 * gets the reader back out however far they browsed.
 */
export function GlossaryTermScreen() {
  const { termId, q } = useLocalSearchParams<{ termId: string; q?: string }>();
  const router = useRouter();
  const database = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const [terms, setTerms] = useState<GlossaryTerm[] | null>(null);
  const [related, setRelated] = useState<GlossaryTerm[]>([]);
  const [explanationReady, setExplanationReady] = useState(false);
  const body = useRef<ScrollView>(null);
  const parsedTermId = Number(termId);

  /**
   * The Markdown body is a native view that measures and paints itself. Mounted
   * while the sheet is still animating in, it paints where the sheet is going
   * rather than where it currently is, and briefly lands on top of the title.
   * Waiting for the presentation to finish costs a frame and nothing else.
   */
  useEffect(() => {
    setExplanationReady(false);
    // Every term opens at its own beginning: stepping from a long entry to a
    // short one must not land the reader part-way down, or past its end.
    body.current?.scrollTo({ y: 0, animated: false });
    const pending = InteractionManager.runAfterInteractions(() => setExplanationReady(true));
    return () => pending.cancel();
  }, [parsedTermId]);

  // The whole list, once: it carries every entry's text, so stepping to the
  // next term is instant instead of a query and a spinner per tap.
  useEffect(() => {
    let active = true;
    void createLearningContentRepository(database).getGlossaryTerms()
      .then((rows) => { if (active) setTerms(rows); })
      .catch(() => { if (active) setTerms([]); });
    return () => { active = false; };
  }, [database]);

  useEffect(() => {
    let active = true;
    setRelated([]);
    void createLearningContentRepository(database).getRelatedGlossaryTerms(parsedTermId)
      .then((rows) => { if (active) setRelated(rows); })
      .catch(() => { if (active) setRelated([]); });
    return () => { active = false; };
  }, [database, parsedTermId]);

  const { current, previous, next, position, total } = useMemo(
    () => getGlossaryNeighbours(terms ?? [], parsedTermId, q ?? ''),
    [terms, parsedTermId, q],
  );

  const openTerm = useCallback((target: GlossaryTerm) => {
    router.setParams({ termId: String(target.termId) });
  }, [router]);

  return (
    <View style={{ backgroundColor: '#FFFFFF', flex: 1, overflow: 'hidden' }}>
      <View style={{ alignItems: 'flex-start', borderBottomColor: '#E4E7EC', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 4, paddingBottom: 10, paddingLeft: 20, paddingRight: 8, paddingTop: 12 }}>
        <NativeText numberOfLines={2} style={{ flex: 1, paddingTop: 6 }} textStyle="title2">{current ? current.term : 'Glossary'}</NativeText>
        {/* The system close affordance for a sheet is a filled grey circle with
            a glyph, not a bare icon button. */}
        <Pressable
          accessibilityHint="Returns to the glossary"
          accessibilityLabel="Close glossary entry"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => router.back()}
          style={{ alignItems: 'center', backgroundColor: NATIVE_COLORS.fill, borderRadius: 15, height: 30, justifyContent: 'center', width: 30 }}
          testID="glossary-close"
        >
          <SymbolView name="xmark" size={13} tintColor={NATIVE_COLORS.secondaryLabel} weight="bold" />
        </Pressable>
      </View>

      {!terms ? <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading glossary entry" /></CenteredEmptyState> : null}
      {terms && !current ? <CenteredEmptyState><NativeText tone="secondary">This glossary entry is unavailable.</NativeText></CenteredEmptyState> : null}

      {current ? (
        // One scroll region for the whole entry. A nested scroll view would
        // fight the sheet's own drag gesture, and pinning "see also" below it
        // left the two overlapping whenever the definition ran long.
        <ScrollView
          ref={body}
          testID="glossary-term-ready"
          contentContainerStyle={{ gap: 16, padding: 20, paddingBottom: 24 }}
          style={{ flex: 1 }}
        >
          <GlossaryDefinition definition={current.shortDefinition} />
          {explanationReady && current.fullExplanation.trim() ? (
            <EnrichedMarkdownText flavor="github" markdown={current.fullExplanation} markdownStyle={learningMarkdownStyle} selectable />
          ) : null}
          {related.length > 0 ? (
            <View style={{ gap: 8 }}>
              <NativeText textStyle="headline">See also</NativeText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {related.map((item, index) => (
                  // Swapped in place, not pushed: a chain of related terms in a
                  // sheet this size would bury the way back out.
                  <Pressable
                    accessibilityHint="Opens the glossary entry"
                    accessibilityLabel={item.term}
                    accessibilityRole="button"
                    key={item.termId}
                    onPress={() => openTerm(item)}
                    style={({ pressed }) => ({
                      alignItems: 'center',
                      backgroundColor: `${NATIVE_TINT}14`,
                      borderCurve: 'continuous',
                      borderRadius: 10,
                      flexDirection: 'row',
                      gap: 5,
                      minHeight: 34,
                      opacity: pressed ? 0.55 : 1,
                      paddingHorizontal: 10,
                    })}
                    testID={`glossary-related-${index}`}
                  >
                    <SymbolView name={GLOSSARY_SYMBOL} size={13} tintColor={NATIVE_TINT} />
                    <NativeText style={{ color: NATIVE_TINT }} textStyle="subheadline" weight="600">{item.term}</NativeText>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      ) : null}

      {current ? (
        <View style={{ alignItems: 'center', borderTopColor: '#E4E7EC', borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 4, paddingBottom: Math.max(insets.bottom, 10), paddingHorizontal: 8, paddingTop: 8 }}>
          <NativeButton
            accessibilityLabel={previous ? `Previous term, ${previous.term}` : 'Previous term'}
            disabled={!previous}
            onPress={() => { if (previous) openTerm(previous); }}
            style={{ flex: 1 }}
            symbol="chevron.left"
            testID="glossary-previous"
            title="Previous"
          />
          <NativeText textStyle="footnote" tone="secondary">{position} of {total}</NativeText>
          <NativeButton
            accessibilityLabel={next ? `Next term, ${next.term}` : 'Next term'}
            disabled={!next}
            onPress={() => { if (next) openTerm(next); }}
            style={{ flex: 1 }}
            testID="glossary-next"
            title="Next"
          />
        </View>
      ) : null}
    </View>
  );
}
