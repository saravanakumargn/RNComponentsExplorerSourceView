import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { Link, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Dialog, Divider, FAB, IconButton, List, Portal, Searchbar, Text, useTheme } from 'react-native-paper';

import { CenteredEmptyState, ScreenLayout } from '@/components/screen-layout';
import { libraries, libraryCategories, type Library } from '@/data/libraries';
import { useReactNativeDirectoryLibrary } from '@/features/catalog/use-react-native-directory-library';
import { usePinnedLibraries } from '@/features/catalog/use-pinned-libraries';
import { ViewSourceButton } from '@/features/source-viewer/view-source-button';
import { openInAppBrowser } from '@/utils/open-in-app-browser';

function formatCompactNumber(value: number | undefined) {
  if (value === undefined) {
    return undefined;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  }

  return String(value);
}

function formatLastUpdated(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value).getTime();

  if (Number.isNaN(date)) {
    return undefined;
  }

  const daysAgo = Math.max(0, Math.floor((Date.now() - date) / 86_400_000));

  if (daysAgo === 0) {
    return 'Updated today';
  }

  return `Updated ${daysAgo}d ago`;
}

function LibraryMetric({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
      <Text selectable variant="titleSmall" style={{ fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
    </View>
  );
}

function LibraryDetailsDialog({
  library,
  visible,
  onDismiss,
}: {
  library: Library;
  visible: boolean;
  onDismiss: () => void;
}) {
  const theme = useTheme();
  const directoryLibrary = useReactNativeDirectoryLibrary(library.npmPackage);
  const stats = directoryLibrary?.github?.stats;
  const latestRelease = directoryLibrary?.npm?.latestRelease;
  const primaryMetrics = [
    stats?.stars !== undefined ? { label: 'Stars', value: formatCompactNumber(stats.stars) } : undefined,
    directoryLibrary?.npm?.weekDownloads !== undefined
      ? { label: 'Weekly', value: formatCompactNumber(directoryLibrary.npm.weekDownloads) }
      : undefined,
    latestRelease ? { label: 'Latest', value: `v${latestRelease}` } : undefined,
  ].filter((metric): metric is { label: string; value: string } => Boolean(metric));
  const secondaryMetadata = [
    formatLastUpdated(stats?.pushedAt),
    stats?.issues !== undefined ? `${formatCompactNumber(stats.issues)} issues` : undefined,
    directoryLibrary?.github?.license?.spdxId,
  ].filter((value): value is string => Boolean(value));
  const links = [
    {
      icon: 'github',
      label: 'GitHub',
      url: directoryLibrary?.github?.urls?.repo ?? directoryLibrary?.githubUrl ?? library.githubUrl,
    },
    library.npmPackage
      ? { icon: 'npm', label: 'npm', url: `https://www.npmjs.com/package/${library.npmPackage}` }
      : undefined,
    { icon: 'web', label: 'Website', url: directoryLibrary?.github?.urls?.homepage ?? library.website },
  ].filter((link): link is { icon: string; label: string; url: string } => Boolean(link?.url));
  const uniqueLinks = links.filter(
    (link, index) => links.findIndex((candidate) => candidate.url === link.url) === index
  );

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={{ borderCurve: 'continuous' }}>
        <Dialog.Title>{library.title}</Dialog.Title>
        <Dialog.Content style={{ gap: 12 }}>
          {primaryMetrics.length > 0 ? (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {primaryMetrics.map((metric, index) => (
                <View key={metric.label} style={{ flex: 1, flexDirection: 'row', gap: 12 }}>
                  {index > 0 ? (
                    <View
                      style={{
                        alignSelf: 'stretch',
                        backgroundColor: theme.colors.outlineVariant,
                        width: 1,
                      }}
                    />
                  ) : null}
                  <LibraryMetric {...metric} />
                </View>
              ))}
            </View>
          ) : null}

          {secondaryMetadata.length > 0 ? (
            <Text
              selectable
              variant="labelSmall"
              style={{ color: theme.colors.onSurfaceVariant, fontVariant: ['tabular-nums'] }}
            >
              {secondaryMetadata.join(' · ')}
            </Text>
          ) : null}

          <Divider />

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <ViewSourceButton demoId={library.id} title="View source" />
            {uniqueLinks.map((link) => (
              <Button
                key={link.url}
                mode="outlined"
                icon={link.icon}
                onPress={() => void openInAppBrowser(link.url)}
              >
                {link.label}
              </Button>
            ))}
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

function LibraryCard({
  library,
  isPinned,
  onTogglePin,
}: {
  library: Library;
  isPinned: boolean;
  onTogglePin: (libraryId: string) => void;
}) {
  const theme = useTheme();
  const [detailsVisible, setDetailsVisible] = useState(false);

  return (
    <>
      <Link
        href={{ pathname: '/library/[library]', params: { library: library.id } }}
        asChild
      >
        <Card
          accessibilityLabel={`Open ${library.title} demo`}
          mode="outlined"
          style={{ borderCurve: 'continuous', borderRadius: 16, overflow: 'hidden' }}
        >
          <Card.Content style={{ gap: 8, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 6 }}>
                <Text variant="titleMedium">{library.title}</Text>
                <Text
                  variant="labelSmall"
                  style={{ color: theme.colors.onSurfaceVariant, fontVariant: ['tabular-nums'] }}
                >
                  {library.demoVersion}
                </Text>
              </View>
              <IconButton
                icon="information-outline"
                size={18}
                style={{ margin: -6 }}
                iconColor={theme.colors.onSurfaceVariant}
                accessibilityLabel={`View ${library.title} details`}
                onPress={() => setDetailsVisible(true)}
              />
              <IconButton
                icon={isPinned ? 'pin' : 'pin-outline'}
                size={18}
                style={{ margin: -6 }}
                iconColor={isPinned ? theme.colors.primary : theme.colors.onSurfaceVariant}
                accessibilityLabel={isPinned ? `Unpin ${library.title}` : `Pin ${library.title}`}
                onPress={() => onTogglePin(library.id)}
              />
            </View>

            <Text
              numberOfLines={2}
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {library.shortDescription}
            </Text>
          </Card.Content>
        </Card>
      </Link>

      <LibraryDetailsDialog
        library={library}
        visible={detailsVisible}
        onDismiss={() => setDetailsVisible(false)}
      />
    </>
  );
}

function PinnedLibrarySheet({
  sheetRef,
  pinnedLibraries,
  onUnpin,
  onOpenLibrary,
}: {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  pinnedLibraries: Library[];
  onUnpin: (libraryId: string) => void;
  onOpenLibrary: (libraryId: string) => void;
}) {
  const theme = useTheme();
  const snapPoints = useMemo(() => ['50%', '80%'], []);
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      backgroundStyle={{ backgroundColor: theme.colors.background }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      backdropComponent={renderBackdrop}
    >
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Text variant="titleMedium">Pinned</Text>
      </View>
      <BottomSheetFlatList
        data={pinnedLibraries}
        keyExtractor={(library) => library.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={{ padding: 16 }}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>No pinned libraries yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            description={item.shortDescription}
            descriptionNumberOfLines={1}
            onPress={() => onOpenLibrary(item.id)}
            right={(props) => (
              <IconButton
                {...props}
                icon="close"
                accessibilityLabel={`Unpin ${item.title}`}
                onPress={() => onUnpin(item.id)}
              />
            )}
          />
        )}
      />
    </BottomSheetModal>
  );
}

export function LibraryCatalogScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { isPinned, pinnedIds, togglePin } = usePinnedLibraries();
  const pinnedSheetRef = useRef<BottomSheetModal>(null);

  const filteredLibraries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return libraries;

    return libraries.filter((library) =>
      [library.title, library.shortDescription, library.npmPackage]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [query]);

  const pinnedLibraries = libraries.filter((library) => pinnedIds.includes(library.id));

  const openLibrary = useCallback(
    (libraryId: string) => {
      pinnedSheetRef.current?.dismiss();
      router.push({ pathname: '/library/[library]', params: { library: libraryId } });
    },
    [router]
  );

  return (
    <BottomSheetModalProvider>
      <View style={{ flex: 1 }}>
        <ScreenLayout testID="maestro-catalog-ready">
          <Searchbar
            placeholder="Search libraries"
            value={query}
            onChangeText={setQuery}
            testID="maestro-catalog-search"
          />

          {libraryCategories.map((category) => {
            const categoryLibraries = filteredLibraries.filter(
              (library) => library.category === category.key
            );

            if (categoryLibraries.length === 0) return null;

            return (
              <View key={category.key} style={{ gap: 8 }}>
                <View style={{ gap: 2 }}>
                  <Text variant="titleMedium">{category.title}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {category.description}
                  </Text>
                </View>

                {categoryLibraries.map((library) => (
                  <LibraryCard
                    key={library.id}
                    library={library}
                    isPinned={isPinned(library.id)}
                    onTogglePin={togglePin}
                  />
                ))}
              </View>
            );
          })}

          {filteredLibraries.length === 0 ? (
            <CenteredEmptyState>
              <Text variant="titleMedium">No libraries match &ldquo;{query}&rdquo;</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                Try a different title, description keyword, or package name.
              </Text>
            </CenteredEmptyState>
          ) : null}
        </ScreenLayout>

        <FAB
          icon="pin"
          visible={pinnedLibraries.length > 0}
          style={{ position: 'absolute', right: 16, bottom: 16 }}
          accessibilityLabel={`View ${pinnedLibraries.length} pinned ${pinnedLibraries.length === 1 ? 'library' : 'libraries'}`}
          onPress={() => pinnedSheetRef.current?.present()}
        />
      </View>

      <PinnedLibrarySheet
        sheetRef={pinnedSheetRef}
        pinnedLibraries={pinnedLibraries}
        onUnpin={togglePin}
        onOpenLibrary={openLibrary}
      />
    </BottomSheetModalProvider>
  );
}
