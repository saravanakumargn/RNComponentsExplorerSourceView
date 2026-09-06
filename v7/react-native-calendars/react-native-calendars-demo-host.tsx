import { type ComponentType } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BackToCatalogProvider } from './navigation-bridge';

const CalendarsDemo = require('./source/official/example/src/screens/menuScreen')
  .default as ComponentType<{ initialDemo?: string }>;

type ReactNativeCalendarsDemoHostProps = {
  initialDemo?: string;
  onBackToCatalog: () => void;
};

export function ReactNativeCalendarsDemoHost({
  initialDemo,
  onBackToCatalog,
}: ReactNativeCalendarsDemoHostProps) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BackToCatalogProvider value={onBackToCatalog}>
          <CalendarsDemo initialDemo={initialDemo} />
        </BackToCatalogProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
