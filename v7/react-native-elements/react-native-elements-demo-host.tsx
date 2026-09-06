import { NavigationIndependentTree } from '@react-navigation/native';
import { type ComponentType } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BackToCatalogProvider } from './navigation-bridge';

const ReactNativeElementsDemo = require('./source/official/example/App').default as ComponentType<{
  initialDemo?: string;
}>;

type ReactNativeElementsDemoHostProps = {
  initialDemo?: string;
  onBackToCatalog: () => void;
};

export function ReactNativeElementsDemoHost({
  initialDemo,
  onBackToCatalog,
}: ReactNativeElementsDemoHostProps) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationIndependentTree>
        <BackToCatalogProvider value={onBackToCatalog}>
          <ReactNativeElementsDemo initialDemo={initialDemo} />
        </BackToCatalogProvider>
      </NavigationIndependentTree>
    </GestureHandlerRootView>
  );
}
