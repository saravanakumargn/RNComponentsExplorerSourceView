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
import { Button, IconButton, List, Snackbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { buildSourceHighlightHtml } from './syntax-highlight-html';
import type { SourceFile } from './types';

type SourceViewerSheetProps = {
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

export function SourceViewerSheet({ files, initialPath, onDismiss, title, visible }: SourceViewerSheetProps) {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
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

  const activeFile = files[activeIndex];
  const html = useMemo(
    () => (activeFile ? buildSourceHighlightHtml(activeFile.content, activeFile.language) : ''),
    [activeFile]
  );

  if (!activeFile) return null;

  async function copySource() {
    await Clipboard.setStringAsync(activeFile.content);
    setStatusMessage('Copied to clipboard');
  }

  async function shareSource() {
    try {
      await Share.share({ message: activeFile.content, title: fileNameFor(activeFile.path) });
    } catch {
      setStatusMessage('Could not open the share sheet');
    }
  }

  async function downloadSource() {
    try {
      const file = new File(Paths.cache, fileNameFor(activeFile.path));
      file.create({ overwrite: true });
      file.write(activeFile.content);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri);
      } else {
        setStatusMessage(`Saved to ${file.uri}`);
      }
    } catch {
      setStatusMessage('Could not save the file');
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
                  gap: 8,
                  padding: 12,
                }}
              >
                <Text variant="titleMedium" style={{ flex: 1 }} numberOfLines={1}>
                  {title}
                </Text>
                <IconButton icon="content-copy" accessibilityLabel="Copy source" onPress={() => void copySource()} />
                <IconButton icon="share-variant" accessibilityLabel="Share source" onPress={() => void shareSource()} />
                <IconButton
                  icon="download"
                  accessibilityLabel="Download source"
                  onPress={() => void downloadSource()}
                />
                <IconButton icon="close" accessibilityLabel="Close" onPress={onDismiss} />
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

              <WebView
                key={activeFile.path}
                originWhitelist={['*']}
                source={{ html }}
                style={{ flex: 1, backgroundColor: 'transparent' }}
              />

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
