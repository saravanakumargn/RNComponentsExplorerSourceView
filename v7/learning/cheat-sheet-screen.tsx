import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';

import { NativeCard } from '@/components/native-ui/native-card';
import { NativeListRow } from '@/components/native-ui/native-list-row';
import { NativeText } from '@/components/native-ui/native-text';
import { getLearningAreaStyle } from '@/components/native-ui/native-tokens';
import { CenteredEmptyState } from '@/components/screen-layout';
import { formatCheatSheetSize } from '@/features/learning/checklist-progress';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import type { CheatSheet, ContentDemo } from '@/features/learning/data/learning-types';
import { ContentDemoLinks } from '@/features/learning/content-demo-links';
import { GlossaryPopover } from '@/features/learning/glossary-popover';
import { LearningEmptyState } from '@/features/learning/learning-empty-state';
import { NativeMarkdownReader } from '@/features/learning/native-markdown-reader';
import { getLearningNavigationAccessibility } from '@/features/learning/learning-navigation-accessibility';
import { useGlossaryReader } from '@/features/learning/use-glossary-reader';

const { symbol: SHEET_SYMBOL, tint: SHEET_TINT } = getLearningAreaStyle('cheat-sheets');

export function CheatSheetListScreen() {
  const database = useSQLiteContext();
  const [sheets, setSheets] = useState<CheatSheet[] | null>(null);

  useEffect(() => {
    let active = true;
    void createLearningContentRepository(database).getCheatSheets()
      .then((list) => { if (active) setSheets(list); })
      .catch(() => { if (active) setSheets([]); });
    return () => { active = false; };
  }, [database]);

  if (!sheets) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading cheat sheets" /></CenteredEmptyState>;

  return (
    <FlatList
      testID="cheat-sheet-list-ready"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ gap: 10, padding: 16, paddingBottom: 32 }}
      ListHeaderComponent={
        <View style={{ gap: 4, paddingBottom: 8 }}>
          <NativeText textStyle="title2">A whole topic on one page</NativeText>
          <NativeText selectable textStyle="footnote" tone="secondary">Dense maps of what a track covers, for revising before an interview rather than learning from scratch.</NativeText>
        </View>
      }
      ListEmptyComponent={<LearningEmptyState testID="cheat-sheet-list-empty" title="No cheat sheets yet" message="No published track has a cheat sheet in this release." />}
      data={sheets}
      keyExtractor={(item) => String(item.sheetId)}
      renderItem={({ item, index }) => (
        <Link href={{ pathname: '/cheat-sheets/[sheetId]', params: { sheetId: item.sheetId } }} asChild>
          <Pressable
            testID={`cheat-sheet-item-${index}`}
            accessibilityRole="button"
            accessibilityLabel={getLearningNavigationAccessibility({ title: `${item.title}, ${formatCheatSheetSize(item.sectionCount)}`, destination: 'cheat sheet' })}
            accessibilityHint="Opens the cheat sheet"
            style={{ minHeight: 44 }}
          >
            <NativeCard>
              <NativeListRow
                caption={`${formatCheatSheetSize(item.sectionCount)} · verified for RN ${item.rnVersionVerified}`}
                description={item.description}
                symbol={SHEET_SYMBOL}
                tint={SHEET_TINT}
                title={item.title}
              />
            </NativeCard>
          </Pressable>
        </Link>
      )}
    />
  );
}

export function CheatSheetReaderScreen() {
  const { sheetId } = useLocalSearchParams<{ sheetId: string }>();
  const database = useSQLiteContext();
  const [sheet, setSheet] = useState<CheatSheet | null | undefined>();
  const [html, setHtml] = useState('');
  const [demos, setDemos] = useState<ContentDemo[]>([]);
  /**
   * Cheat sheets are the densest terminology in the corpus, so they get the
   * same inline glossary the lesson and interview readers have rather than
   * leaving the reader to look a term up somewhere else.
   */
  const { activeTerm, dismissTerm, linkedMarkdown, onLinkPress } = useGlossaryReader(html);
  const parsedSheetId = Number(sheetId);

  useEffect(() => {
    let active = true;
    const content = createLearningContentRepository(database);
    void Promise.all([content.getCheatSheet(parsedSheetId), content.getCheatSheetSections(parsedSheetId)])
      .then(([resolvedSheet, sections]) => {
        if (!active) return;
        setSheet(resolvedSheet);
        setHtml(resolvedSheet ? `${resolvedSheet.description}\n\n${sections.map((section) => `## ${section.heading}\n\n${section.body}`).join('\n\n')}` : '');
        if (resolvedSheet) {
          void content.getDemosForContent('cheat_sheet', resolvedSheet.sheetId)
            .then((links) => { if (active) setDemos(links); })
            .catch(() => undefined);
        }
      })
      .catch(() => { if (active) setSheet(null); });
    return () => { active = false; };
  }, [database, parsedSheetId]);

  if (sheet === undefined) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading cheat sheet" /></CenteredEmptyState>;
  if (!sheet) return <CenteredEmptyState><NativeText tone="secondary">This cheat sheet is unavailable.</NativeText></CenteredEmptyState>;
  if (sheet.sectionCount === 0) {
    return <View testID="cheat-sheet-reader-ready" style={{ flex: 1 }}><Stack.Screen options={{ title: sheet.title }} /><LearningEmptyState testID="cheat-sheet-empty" title="Nothing on this sheet yet" message="This cheat sheet has no published sections. Try another sheet, or come back after the next content update." /></View>;
  }

  return (
    <View testID="cheat-sheet-reader-ready" style={{ flex: 1 }}>
      <Stack.Screen options={{ title: sheet.title }} />
      <GlossaryPopover term={activeTerm} onDismiss={dismissTerm} />
      <View style={{ flex: 1 }}><NativeMarkdownReader markdown={linkedMarkdown} onLinkPress={onLinkPress} /></View>
      <ContentDemoLinks demos={demos} />
    </View>
  );
}
