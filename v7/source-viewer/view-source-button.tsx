import { useState } from 'react';
import { Button, IconButton } from 'react-native-paper';

import { sourceRegistry } from './generated/source-registry';
import { SourceViewerSheet } from './source-viewer-sheet';
import { trackSourceViewerOpened } from '@/features/telemetry/telemetry';

type ViewSourceButtonProps = {
  demoId: string;
  /** Tint for the icon-only trigger. Pass it when the header is not the default surface color. */
  iconColor?: string;
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
  iconColor,
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

  function openSourceViewer() {
    trackSourceViewerOpened(demoId);
    setVisible(true);
  }

  return (
    <>
      {iconOnly ? (
        <IconButton
          icon="code-tags"
          iconColor={iconColor}
          accessibilityLabel={title}
          onPress={openSourceViewer}
          style={{ margin: 0 }}
        />
      ) : (
        <Button mode="outlined" icon="code-tags" onPress={openSourceViewer}>
          {title}
        </Button>
      )}
      <SourceViewerSheet
        files={visibleFiles}
        demoId={demoId}
        initialPath={initialPath}
        title={title}
        visible={visible}
        onDismiss={() => setVisible(false)}
      />
    </>
  );
}
