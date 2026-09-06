import { useMemo, useState, type ComponentType } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DemoBackButton } from '@/components/demo-back-button';
import { useBottomContentPadding } from '@/components/screen-layout';
import { ViewSourceButton } from '@/features/source-viewer/view-source-button';

import { CURATED_EXAMPLES, CURATED_GROUP_ORDER } from './source/official/examples-shared/catalog';

const exampleComponents: Record<string, ComponentType> = {
  'activity-history': require('./source/official/example/screens/examples/ActivityHistoryExample')
    .ActivityHistoryExample,
  'ai-chat': require('./source/official/example/screens/examples/AiChatExample').AiChatExample,
  'cards-feed': require('./source/official/example/screens/examples/CardsFeedExample').CardsFeedExample,
  chat: require('./source/official/example/screens/examples/ChatExample').ChatExample,
  directory: require('./source/official/example/screens/examples/DirectoryExample').DirectoryExample,
  'gallery-grid': require('./source/official/example/screens/examples/GalleryGridExample').GalleryGridExample,
  'infinite-calendar': require('./source/official/example/screens/examples/InfiniteCalendarExample')
    .InfiniteCalendarExample,
  'media-rails': require('./source/official/example/screens/examples/MediaRailsExample').MediaRailsExample,
  'notifications-inbox': require('./source/official/example/screens/examples/NotificationsInboxExample')
    .NotificationsInboxExample,
  'product-shelf': require('./source/official/example/screens/examples/ProductShelfExample')
    .ProductShelfExample,
  'sectioned-directory': require('./source/official/example/screens/examples/SectionedDirectoryExample')
    .SectionedDirectoryExample,
  'video-feed': require('./source/official/example/screens/examples/VideoFeedExample').VideoFeedExample,
};

// Only the slugs also listed in scripts/source-viewer/manifest.mjs get a
// per-screen source default; the rest fall back to the manifest's first file.
const exampleSourcePaths: Partial<Record<string, string>> = {
  'activity-history': 'features/legend-list/source/official/example/screens/examples/ActivityHistoryExample.tsx',
  'ai-chat': 'features/legend-list/source/official/example/screens/examples/AiChatExample.tsx',
  'cards-feed': 'features/legend-list/source/official/example/screens/examples/CardsFeedExample.tsx',
  chat: 'features/legend-list/source/official/example/screens/examples/ChatExample.tsx',
  directory: 'features/legend-list/source/official/example/screens/examples/DirectoryExample.tsx',
  'gallery-grid': 'features/legend-list/source/official/example/screens/examples/GalleryGridExample.tsx',
  'media-rails': 'features/legend-list/source/official/example/screens/examples/MediaRailsExample.tsx',
  'notifications-inbox': 'features/legend-list/source/official/example/screens/examples/NotificationsInboxExample.tsx',
  'product-shelf': 'features/legend-list/source/official/example/screens/examples/ProductShelfExample.tsx',
  'sectioned-directory': 'features/legend-list/source/official/example/screens/examples/SectionedDirectoryExample.tsx',
  'video-feed': 'features/legend-list/source/official/example/screens/examples/VideoFeedExample.tsx',
  'infinite-calendar': 'features/legend-list/source/official/example/screens/examples/InfiniteCalendarExample.tsx',
};

type LegendListDemoHostProps = {
  initialDemo?: string;
  onBackToCatalog: () => void;
};

function DemoHeader({
  title,
  onBack,
  sourcePath,
}: {
  onBack: () => void;
  sourcePath?: string;
  title: string;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.outlineVariant },
      ]}
    >
      <DemoBackButton onPress={onBack} />
      <Text variant="titleMedium" style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <ViewSourceButton
        demoId="legend-list"
        iconOnly
        title="LegendList source"
        initialPath={sourcePath}
        onlyInitialPath={sourcePath !== undefined}
      />
    </View>
  );
}

export function LegendListDemoHost({ initialDemo, onBackToCatalog }: LegendListDemoHostProps) {
  const theme = useTheme();
  const bottomPadding = useBottomContentPadding(16);
  // `?demo=` names an example slug; an unknown one opens the list, as elsewhere.
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    () => CURATED_EXAMPLES.find((example) => example.slug === initialDemo)?.slug ?? null,
  );
  const groups = useMemo(() => {
    return CURATED_GROUP_ORDER.map((group) => ({
      group,
      examples: CURATED_EXAMPLES.filter((example) => example.group === group),
    })).filter((entry) => entry.examples.length > 0);
  }, []);

  if (selectedSlug) {
    const meta = CURATED_EXAMPLES.find((example) => example.slug === selectedSlug);
    const ExampleComponent = exampleComponents[selectedSlug];

    return (
      // The list is unmounted while a demo is open, so this wrapper is what tells
      // the smoke suite which demo actually mounted.
      <View style={{ flex: 1 }} testID={`maestro-demo-legend-list-${selectedSlug}-ready`}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.background }}>
          <DemoHeader
            title={meta?.title ?? selectedSlug}
            onBack={() => setSelectedSlug(null)}
            sourcePath={exampleSourcePaths[selectedSlug]}
          />
        </SafeAreaView>
        <ExampleComponent />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.background }}>
        <DemoHeader title="LegendList" onBack={onBackToCatalog} />
      </SafeAreaView>
      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
      >
        {groups.map(({ group, examples }) => (
          <View key={group} style={styles.group}>
            <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              {group}
            </Text>
            {examples.map((example) => (
              <Pressable
                key={example.slug}
                onPress={() => setSelectedSlug(example.slug)}
                style={[styles.card, { borderColor: theme.colors.outlineVariant }]}
                testID={example.title}
              >
                <Text variant="titleMedium">{example.title}</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {example.description}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 4,
    minHeight: 48,
    paddingRight: 12,
  },
  headerTitle: {
    flex: 1,
  },
  list: {
    gap: 20,
    padding: 16,
  },
  group: {
    gap: 10,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
});
