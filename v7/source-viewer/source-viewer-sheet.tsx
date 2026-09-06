import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import * as Clipboard from 'expo-clipboard';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Share, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  ActivityIndicator,
  Button,
  IconButton,
  List,
  Snackbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { buildSourceHighlightHtml } from './syntax-highlight-html';
import { fetchSourceContent, sourceUrlFor } from './source-fetcher';
import type { SourceFile } from './types';
import { trackSourceAction } from '@/features/telemetry/telemetry';

type SourceViewerSheetProps = {
  demoId: string;
  files: SourceFile[];
  initialPath?: string;
  onDismiss: () => void;
  title: string;
  visible: boolean;
};

function fileNameFor(path: string): string {
  return path.split('/').pop() ?? path;
}

/** e.g. "basic-form-screen.tsx" -> "Basic Form Screen" */
function displayNameFor(label: string): string {
  return label
    .replace(/\.[^./]+$/, '')
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

export function SourceViewerSheet({ demoId, files, initialPath, onDismiss, title, visible }: SourceViewerSheetProps) {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileSheetRef = useRef<BottomSheetModal>(null);
  const fileSheetSnapPoints = useMemo(() => ['50%', '80%'], []);
  const openFileSheet = useCallback(() => fileSheetRef.current?.present(), []);
  const renderFileSheetBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    []
  );

  useEffect(() => {
    if (!visible) return;
    const matchIndex = initialPath ? files.findIndex((file) => file.path === initialPath) : -1;
    setActiveIndex(matchIndex >= 0 ? matchIndex : 0);
  }, [visible, initialPath, files]);

  useEffect(() => {
    const activeFile = files[activeIndex];
    if (!visible || !activeFile) return;

    const controller = new AbortController();
    setContent(null);
    setLoadError(null);
    setIsLoading(true);

    fetchSourceContent(activeFile.path, controller.signal)
      .then((source) => setContent(source))
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setLoadError('Could not load this source from GitHub. Check your connection and try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [activeIndex, files, loadAttempt, visible]);

  const activeFile = files[activeIndex];
  const html = useMemo(
    () => (activeFile && content !== null ? buildSourceHighlightHtml(content, activeFile.language) : ''),
    [activeFile, content]
  );

  if (!activeFile) return null;

  async function copySource() {
    if (content === null) return;
    await Clipboard.setStringAsync(content);
    trackSourceAction(demoId, 'copied');
    setStatusMessage('Copied to clipboard');
  }

  async function shareSource() {
    if (content === null) return;
    try {
      const result = await Share.share({ message: content, title: fileNameFor(activeFile.path) });
      if (result.action === Share.sharedAction) trackSourceAction(demoId, 'shared');
    } catch {
      setStatusMessage('Could not open the share sheet');
    }
  }

  async function downloadSource() {
    if (content === null) return;
    try {
      const file = new File(Paths.cache, fileNameFor(activeFile.path));
      file.create({ overwrite: true });
      file.write(content);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri);
        trackSourceAction(demoId, 'download_shared');
      } else {
        trackSourceAction(demoId, 'download_saved');
        setStatusMessage(`Saved to ${file.uri}`);
      }
    } catch {
      setStatusMessage('Could not save the file');
    }
  }

  async function shareSourceUrl() {
    try {
      const result = await Share.share({ message: sourceUrlFor(activeFile.path) });
      if (result.action === Share.sharedAction) trackSourceAction(demoId, 'github_url_shared');
    } catch {
      setStatusMessage('Could not open the share sheet');
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onDismiss}>
      {/* React Native's Modal renders into a separate native root, so the app's top-level
          SafeAreaProvider/GestureHandlerRootView/BottomSheetModalProvider can't measure or
          reach it — insets come back as 0 and gestures don't register without nesting these. */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
              <View
                style={{
                  alignItems: 'center',
                  borderBottomColor: theme.colors.outlineVariant,
                  borderBottomWidth: 1,
                  flexDirection: 'row',
                  gap: 4,
                  padding: 12,
                }}
              >
                <Text variant="titleMedium" style={{ flex: 1, minWidth: 0 }} numberOfLines={1}>
                  {title}
                </Text>
                <IconButton
                  icon="content-copy"
                  accessibilityLabel="Copy source"
                  disabled={content === null}
                  onPress={() => void copySource()}
                  style={{ margin: 0 }}
                />
                <IconButton
                  icon="share-variant"
                  accessibilityLabel="Share source"
                  disabled={content === null}
                  onPress={() => void shareSource()}
                  style={{ margin: 0 }}
                />
                <IconButton
                  icon="download"
                  accessibilityLabel="Download source"
                  disabled={content === null}
                  onPress={() => void downloadSource()}
                  style={{ margin: 0 }}
                />
                <IconButton icon="close" accessibilityLabel="Close" onPress={onDismiss} style={{ margin: 0 }} />
              </View>

              {files.length > 1 ? (
                <View style={{ paddingHorizontal: 12, paddingTop: 8, alignItems: 'flex-start' }}>
                  <Button
                    mode="outlined"
                    icon="chevron-down"
                    compact
                    contentStyle={{ flexDirection: 'row-reverse' }}
                    onPress={openFileSheet}
                  >
                    {activeFile.label}
                  </Button>
                </View>
              ) : null}

              {isLoading ? (
                <View style={{ alignItems: 'center', flex: 1, gap: 12, justifyContent: 'center', padding: 24 }}>
                  <ActivityIndicator />
                  <Text>Loading source from GitHub…</Text>
                </View>
              ) : loadError ? (
                <View style={{ alignItems: 'center', flex: 1, gap: 12, justifyContent: 'center', padding: 24 }}>
                  <Text style={{ textAlign: 'center' }}>{loadError}</Text>
                  <Button mode="contained" onPress={() => setLoadAttempt((attempt) => attempt + 1)}>
                    Retry
                  </Button>
                  <Button mode="text" onPress={() => void shareSourceUrl()}>
                    Share GitHub URL
                  </Button>
                </View>
              ) : (
                <WebView
                  key={activeFile.path}
                  originWhitelist={['*']}
                  source={{ html }}
                  style={{ flex: 1, backgroundColor: 'transparent' }}
                />
              )}

              <Snackbar visible={statusMessage !== null} onDismiss={() => setStatusMessage(null)} duration={2000}>
                {statusMessage ?? ''}
              </Snackbar>
            </SafeAreaView>
          </SafeAreaProvider>

          {files.length > 1 ? (
            <BottomSheetModal
              ref={fileSheetRef}
              snapPoints={fileSheetSnapPoints}
              backgroundStyle={{ backgroundColor: theme.colors.background }}
              handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
              backdropComponent={renderFileSheetBackdrop}
            >
              <BottomSheetFlatList
                data={files}
                keyExtractor={(file) => file.path}
                renderItem={({ item, index }) => (
                  <List.Item
                    title={displayNameFor(item.label)}
                    description={item.label}
                    onPress={() => {
                      setActiveIndex(index);
                      fileSheetRef.current?.dismiss();
                    }}
                    right={
                      index === activeIndex ? (props) => <List.Icon {...props} icon="check" /> : undefined
                    }
                  />
                )}
              />
            </BottomSheetModal>
          ) : null}
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </Modal>
  );
}
