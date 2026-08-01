import { useState } from 'react';
import { Button, IconButton } from 'react-native-paper';

import { sourceRegistry } from './generated/source-registry';
import { SourceViewerSheet } from './source-viewer-sheet';

type ViewSourceButtonProps = {
  demoId: string;
  /** Renders a compact icon-only trigger instead of the labeled outlined button. */
  iconOnly?: boolean;
  /** Repo-relative path (matching a `manifest.mjs` entry) to open first. Defaults to the first file. */
  initialPath?: string;
  /** Skip the file switcher and show only `initialPath`, e.g. when viewing source from within a single screen. */
  onlyInitialPath?: boolean;
  title?: string;
};

/** Drop into any demo screen to let the user inspect, copy, share, or download its source. */
export function ViewSourceButton({
  demoId,
  iconOnly = false,
  initialPath,
  onlyInitialPath = false,
  title = 'View source',
}: ViewSourceButtonProps) {
  const [visible, setVisible] = useState(false);
  const files = sourceRegistry[demoId];

  if (!files || files.length === 0) return null;

  const visibleFiles =
    onlyInitialPath && initialPath ? files.filter((file) => file.path === initialPath) : files;

  return (
    <>
      {iconOnly ? (
        <IconButton icon="code-tags" accessibilityLabel={title} onPress={() => setVisible(true)} />
      ) : (
        <Button mode="outlined" icon="code-tags" onPress={() => setVisible(true)}>
          {title}
        </Button>
      )}
      <SourceViewerSheet
        files={visibleFiles}
        initialPath={initialPath}
        title={title}
        visible={visible}
        onDismiss={() => setVisible(false)}
      />
    </>
  );
}
