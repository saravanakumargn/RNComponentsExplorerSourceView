import { ContentUnavailableView, List, ProgressView, Section, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, listStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { NativeNavRow } from '@/components/native-ui/native-row.ios';
import { NativeScreen } from '@/components/native-ui/native-screen';
import { getLearningAreaStyle } from '@/components/native-ui/native-tokens';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import type { LearningCategory, LearningLibraryTool } from '@/features/learning/data/learning-types';
import { getLearningNavigationAccessibility } from '@/features/learning/learning-navigation-accessibility';

/** The reader stays React Native on every platform — see its own file for why. */
export { GoodToKnowReaderScreen } from '@/features/learning/good-to-know-reader-screen';

const SECONDARY = { type: 'hierarchical', style: 'secondary' } as const;

/**
 * The area's own hue, taken from the shared token rather than repeated here, so
 * a row on this screen and the "Good to know" row on the Learning home cannot
 * drift to different browns.
 */
const { tint: GOOD_TO_KNOW_TINT } = getLearningAreaStyle('good-to-know');

/**
 * The categories that group every library and tooling reference.
 *
 * `getCategories` synthesises its single row from a count rather than reading a
 * categories table, so it returns nothing at all when no `library_tools` row is
 * published. The shipped database has ten, so the list is the live path and the
 * empty state is the guard — `good-to-know.yaml` covers both, choosing on
 * whether `good-to-know-category-0` is on screen.
 */
export function GoodToKnowCategoriesScreen() {
  const database = useSQLiteContext();
  const router = useRouter();
  const [items, setItems] = useState<LearningCategory[] | null>(null);

  useEffect(() => {
    void createLearningContentRepository(database).getCategories().then(setItems);
  }, [database]);

  if (!items) {
    return (
      <NativeScreen>
        <VStack spacing={12}>
          <ProgressView />
          <Text modifiers={[foregroundStyle(SECONDARY)]}>Loading your toolkit…</Text>
        </VStack>
      </NativeScreen>
    );
  }

  if (items.length === 0) {
    return (
      <NativeScreen testID="good-to-know-categories-empty">
        <ContentUnavailableView
          description="Library and tooling references are not part of this release. The Components & API tab documents every library in the catalogue, with a runnable demo for each."
          systemImage="lightbulb"
          title="Nothing here yet"
        />
      </NativeScreen>
    );
  }

  return (
    <NativeScreen testID="good-to-know-categories-ready">
      <List modifiers={[listStyle('insetGrouped')]}>
        <Section
          footer={
            <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(SECONDARY)]}>
              What else exists beyond React Native, and when it is the better choice.
            </Text>
          }
          title="Useful things to keep close"
        >
          {items.map((category, index) => (
            <NativeNavRow
              key={category.categoryId}
              label={getLearningNavigationAccessibility({ title: category.name, destination: 'Good to know resources' })}
              onPress={() => router.push({ pathname: '/good-to-know/[categoryId]', params: { categoryId: category.categoryId } })}
              symbol="lightbulb.fill"
              testID={`good-to-know-category-${index}`}
              tint={GOOD_TO_KNOW_TINT}
              title={category.name}
            />
          ))}
        </Section>
      </List>
    </NativeScreen>
  );
}

/**
 * The references inside one category.
 *
 * Nothing here is gated: unlike FAQ and interview prep, Good to know carries no
 * paywall, so every row navigates and none of them ends in a lock.
 *
 * The `Stack.Screen` title is load-bearing beyond the header —
 * `accessibility-navigation.yaml` taps "Good to know" to walk back from the
 * reader to this list.
 */
export function GoodToKnowListScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const database = useSQLiteContext();
  const router = useRouter();
  const [items, setItems] = useState<LearningLibraryTool[] | null>(null);

  useEffect(() => {
    void createLearningContentRepository(database).getLibraryToolsForCategory(Number(categoryId)).then(setItems);
  }, [database, categoryId]);

  if (!items) {
    return (
      <NativeScreen>
        <VStack spacing={12}>
          <ProgressView />
          <Text modifiers={[foregroundStyle(SECONDARY)]}>Loading references…</Text>
        </VStack>
      </NativeScreen>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: 'Good to know' }} />
        <NativeScreen testID="good-to-know-list-empty">
          <ContentUnavailableView
            description="This category has no published references yet. The Components & API tab documents every library in the catalogue."
            systemImage="lightbulb"
            title="Nothing in this category"
          />
        </NativeScreen>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Good to know' }} />
      <NativeScreen testID="good-to-know-list-ready">
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section
            footer={
              <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(SECONDARY)]}>
                Each entry answers the same five questions, so you can compare them quickly.
              </Text>
            }
          >
            {items.map((tool, index) => (
              <NativeNavRow
                key={tool.libraryToolId}
                label={getLearningNavigationAccessibility({ title: tool.name, destination: 'Good to know resource' })}
                onPress={() => router.push({ pathname: '/good-to-know/read/[itemId]', params: { itemId: tool.libraryToolId } })}
                symbol="puzzlepiece.extension.fill"
                testID={`good-to-know-item-${index}`}
                tint={GOOD_TO_KNOW_TINT}
                title={tool.name}
              />
            ))}
          </Section>
        </List>
      </NativeScreen>
    </>
  );
}
