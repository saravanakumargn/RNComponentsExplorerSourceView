import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { Link, Stack, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button, Dialog, Divider, IconButton, List, Portal, Text, useTheme } from 'react-native-paper';
import type { SFSymbol } from 'sf-symbols-typescript';

import { NativeBadge } from '@/components/native-ui/native-badge';
import { NativeCard } from '@/components/native-ui/native-card';
import { NativeText } from '@/components/native-ui/native-text';
import { NATIVE_BACKGROUND, NATIVE_COLORS, NATIVE_TINT } from '@/components/native-ui/native-tokens';
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

/**
 * One library, as a grouped iOS card.
 *
 * What it replaced: `Card mode="outlined"` — a 1pt stroked rectangle with the
 * Material type ramp and `MaterialIcons` accessories. Nothing about it was
 * wrong, and stacked forty times down the app's landing screen it was the
 * flattest surface in the product: every card the same weight, the version
 * inline in the title so the eye had to read past it, and a stroke doing the job
 * that contrast does on iOS.
 *
 * What it is now: the same card the Learning screens use. No stroke; white on
 * the grouped background, which is how iOS separates a card from its page. The
 * version moves to the trailing edge as a value, the way a Settings row shows
 * its current setting, so a title is a title and a scan down the column reads
 * titles rather than title-plus-number. Accessories are SF Symbols at the
 * system's own weight.
 *
 * The press structure is unchanged from the Paper version: the card navigates
 * and the two accessory buttons are nested inside it. Worth knowing when this is
 * next touched — a nested control inside an accessibility element gets merged
 * into it on iOS, so the info and pin buttons are likely not separately
 * reachable by VoiceOver. That predates this restyle and is left alone here
 * rather than changed silently behind a visual commit.
 */
function LibraryCard({
  library,
  isPinned,
  onTogglePin,
}: {
  library: Library;
  isPinned: boolean;
  onTogglePin: (libraryId: string) => void;
}) {
  const [detailsVisible, setDetailsVisible] = useState(false);

  return (
    <>
      <Link
        href={{ pathname: '/library/[library]', params: { library: library.id } }}
        asChild
      >
        <Pressable accessibilityLabel={`Open ${library.title} demo`} accessibilityRole="button">
          <NativeCard padding={13} style={{ gap: 6 }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
              {/* The title takes the row and the version yields, not the other
                  way round. `release-2026-08-01-1558` is a source tag rather
                  than a semver, and at 23 characters it pushed "TanStack Query"
                  down to "TanStack Q…" — losing the name you scan the column
                  for to keep the tail of a date. The full version is in the
                  details dialog either way. */}
              <NativeText numberOfLines={1} style={{ flex: 1 }} textStyle="headline">
                {library.title}
              </NativeText>
              {library.status === 'reference' ? <NativeBadge label="Reference" /> : null}
              <NativeText
                numberOfLines={1}
                style={{ flexShrink: 0, fontVariant: ['tabular-nums'], maxWidth: 116 }}
                textStyle="footnote"
                tone="secondary"
              >
                {library.demoVersion}
              </NativeText>
              <CardAccessory
                accessibilityLabel={`View ${library.title} details`}
                onPress={() => setDetailsVisible(true)}
                symbol="info.circle"
              />
              <CardAccessory
                accessibilityLabel={isPinned ? `Unpin ${library.title}` : `Pin ${library.title}`}
                onPress={() => onTogglePin(library.id)}
                symbol={isPinned ? 'pin.fill' : 'pin'}
                tint={isPinned ? NATIVE_TINT : undefined}
              />
            </View>

            <NativeText numberOfLines={2} textStyle="footnote" tone="secondary">
              {library.shortDescription}
            </NativeText>
          </NativeCard>
        </Pressable>
      </Link>

      <LibraryDetailsDialog
        library={library}
        visible={detailsVisible}
        onDismiss={() => setDetailsVisible(false)}
      />
    </>
  );
}

/**
 * A card's trailing accessory button.
 *
 * Paper's `IconButton` reserved a 48pt Material touch target and drew a ripple,
 * which is why two of them pushed the title's baseline around. This is a bare
 * symbol with `hitSlop` doing the work instead: the target stays finger-sized
 * without the glyph claiming the space.
 */
function CardAccessory({
  accessibilityLabel,
  onPress,
  symbol,
  tint,
}: {
  accessibilityLabel: string;
  onPress: () => void;
  symbol: SFSymbol;
  tint?: string;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1, paddingHorizontal: 2 })}
    >
      <SymbolView name={symbol} size={19} tintColor={tint ?? NATIVE_COLORS.secondaryLabel} />
    </Pressable>
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
        <Stack.Screen
          options={{
            headerSearchBarOptions: {
              placeholder: 'Search libraries',
              onChangeText: (event) => setQuery(event.nativeEvent.text),
            },
            headerRight:
              pinnedLibraries.length > 0
                ? () => (
                    <IconButton
                      icon="pin"
                      accessibilityLabel={`View ${pinnedLibraries.length} pinned ${pinnedLibraries.length === 1 ? 'library' : 'libraries'}`}
                      onPress={() => pinnedSheetRef.current?.present()}
                    />
                  )
                : undefined,
          }}
        />
        <ScreenLayout
          testID="maestro-catalog-ready"
          // The grouped background, scoped to this screen rather than to
          // `ScreenLayout`: a card with no stroke needs the page behind it to be
          // darker than it is, and `ScreenLayout` is shared with twenty Material
          // demo screens that should keep the theme's own background.
          style={{ backgroundColor: NATIVE_BACKGROUND }}
          // The default flexGrow:1 keeps the content taller than the viewport,
          // so iOS cannot clamp back to the true top when a search filters the
          // list down — leaving the first result stranded under the header.
          // Only stretch when the empty state needs centring.
          contentContainerStyle={filteredLibraries.length === 0 ? undefined : { flexGrow: 0 }}
        >
          {libraryCategories.map((category) => {
            const categoryLibraries = filteredLibraries.filter(
              (library) => library.category === category.key
            );

            if (categoryLibraries.length === 0) return null;

            return (
              <View key={category.key} style={{ gap: 8 }}>
                <View style={{ gap: 2 }}>
                  <NativeText textStyle="title3">{category.title}</NativeText>
                  <NativeText textStyle="footnote" tone="secondary">
                    {category.description}
                  </NativeText>
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
              <NativeText textStyle="headline">No libraries match &ldquo;{query}&rdquo;</NativeText>
              <NativeText style={{ textAlign: 'center' }} textStyle="footnote" tone="secondary">
                Try a different title, description keyword, or package name.
              </NativeText>
            </CenteredEmptyState>
          ) : null}
        </ScreenLayout>

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
