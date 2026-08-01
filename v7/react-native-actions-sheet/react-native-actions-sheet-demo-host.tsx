import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

/** Hosts the untouched official v10.1.2 showcase inside the catalog route. */
export function ReactNativeActionSheetDemoHost() {
  // Keep the showcase isolated from the catalog's initial module graph. The
  // official source is evaluated only when this library route is selected.
  // @ts-ignore -- The full upstream showcase is intentionally excluded from this app's typecheck.
  const OfficialActionSheetShowcase = require('./source/official/app/examples').default;
  // @ts-ignore -- The full upstream showcase is intentionally excluded from this app's typecheck.
  const { AppSheets } = require('./source/official/app/sheets') as {
    AppSheets: () => ReactNode;
  };
  const { SheetProvider } = require('react-native-actions-sheet') as {
    SheetProvider: ({ children, context }: { children: ReactNode; context: string }) => ReactNode;
  };

  return (
    <SafeAreaProvider>
      <AppSheets />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SheetProvider context="global">
          <OfficialActionSheetShowcase />
        </SheetProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
