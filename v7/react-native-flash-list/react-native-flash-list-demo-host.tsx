import { NavigationIndependentTree } from '@react-navigation/native';
import { useEffect, type ComponentType } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { setCatalogBackHandler } from './catalog-navigation-bridge';

const FlashListExampleApp = require('./source/official/App').default as ComponentType;

type ReactNativeFlashListDemoHostProps = {
  onBackToCatalog: () => void;
};

/** Hosts the official @shopify/flash-list v2.0.2 fixture example app. */
export function ReactNativeFlashListDemoHost({ onBackToCatalog }: ReactNativeFlashListDemoHostProps) {
  useEffect(() => setCatalogBackHandler(onBackToCatalog), [onBackToCatalog]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationIndependentTree>
          <FlashListExampleApp />
        </NavigationIndependentTree>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
